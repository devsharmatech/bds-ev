import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import { sendExpiryReminderEmail } from "@/lib/email";

/**
 * GET /api/notifications/expiry-reminder
 * Send membership expiry reminder emails to members whose subscriptions are expiring soon.
 * 
 * This endpoint can be called by a cron job (e.g., daily at 9 AM)
 * Query parameters:
 * - days: Number of days before expiry to check (default: 30)
 * - api_key: API key for authentication (required in production)
 * 
 * Example cron job schedule:
 * - 30 days before: once
 * - 7 days before: once
 * - 3 days before: once
 * - 1 day before: once
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days") || "30";
    const apiKey = searchParams.get("api_key");

    // Verify API key in production
    if (process.env.NODE_ENV === "production") {
      const validApiKey = process.env.CRON_API_KEY;
      if (!validApiKey || apiKey !== validApiKey) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const days = parseInt(daysParam);
    if (isNaN(days) || days < 0 || days > 365) {
      return NextResponse.json(
        { success: false, message: "Invalid days parameter (0-365)" },
        { status: 400 }
      );
    }

    // Calculate the target expiry date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
    
    // For exact day matching, we need to check for expiry on the target date
    const targetDateStart = new Date(targetDate);
    targetDateStart.setHours(0, 0, 0, 0);
    
    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setHours(23, 59, 59, 999);

    console.log("[EXPIRY-REMINDER] Checking for memberships expiring on:", {
      days,
      targetDate: targetDate.toISOString(),
      range: {
        start: targetDateStart.toISOString(),
        end: targetDateEnd.toISOString()
      }
    });

    // Fetch active subscriptions expiring on the target date
    const { data: expiringSubscriptions, error } = await supabase
      .from("user_subscriptions")
      .select(`
        *,
        user:users (id, email, full_name),
        subscription_plan:subscription_plans (name)
      `)
      .eq("status", "active")
      .gte("expires_at", targetDateStart.toISOString())
      .lte("expires_at", targetDateEnd.toISOString());

    if (error) {
      console.error("[EXPIRY-REMINDER] Error fetching subscriptions:", error);
      return NextResponse.json(
        { success: false, message: "Database error", error: error.message },
        { status: 500 }
      );
    }

    console.log("[EXPIRY-REMINDER] Found expiring subscriptions:", {
      count: expiringSubscriptions?.length || 0,
      days
    });

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No memberships expiring in ${days} days`,
        sent: 0
      });
    }

    // Send emails to each expiring member
    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    for (const subscription of expiringSubscriptions) {
      try {
        if (!subscription.user?.email) {
          console.warn("[EXPIRY-REMINDER] No email for user:", subscription.user_id);
          results.failed++;
          continue;
        }

        // Check if we already sent a reminder for this subscription at this interval
        // (prevent duplicate emails if cron runs multiple times)
        const reminderKey = `expiry_reminder_${subscription.id}_${days}`;
        const { data: existingReminder } = await supabase
          .from("notification_logs")
          .select("id")
          .eq("notification_key", reminderKey)
          .maybeSingle();

        if (existingReminder) {
          console.log("[EXPIRY-REMINDER] Reminder already sent:", {
            subscription_id: subscription.id,
            days
          });
          continue;
        }

        const expiryDate = new Date(subscription.expires_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });

        await sendExpiryReminderEmail(subscription.user.email, {
          name: subscription.user.full_name || "Member",
          plan_name: subscription.subscription_plan?.name || subscription.subscription_plan_name || "Membership",
          expiry_date: expiryDate,
          days_remaining: days
        });

        // Log the notification to prevent duplicates
        await supabase.from("notification_logs").insert({
          user_id: subscription.user.id,
          notification_type: "expiry_reminder",
          notification_key: reminderKey,
          sent_at: new Date().toISOString(),
          metadata: { subscription_id: subscription.id, days_before_expiry: days }
        });

        results.sent++;
        console.log("[EXPIRY-REMINDER] Email sent to:", subscription.user.email);
      } catch (emailError) {
        console.error("[EXPIRY-REMINDER] Failed to send email:", {
          user_id: subscription.user?.id,
          error: emailError.message
        });
        results.failed++;
        results.errors.push({
          user_id: subscription.user?.id,
          error: emailError.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Expiry reminder emails processed for ${days} days`,
      total: expiringSubscriptions.length,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined
    });

  } catch (error) {
    console.error("[EXPIRY-REMINDER] Unexpected error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/expiry-reminder
 * Send expiry reminder to a specific user (for manual/admin use)
 */
export async function POST(request) {
  try {
    const { user_id, subscription_id, days_remaining } = await request.json();

    if (!user_id && !subscription_id) {
      return NextResponse.json(
        { success: false, message: "user_id or subscription_id required" },
        { status: 400 }
      );
    }

    // Fetch subscription and user data
    let query = supabase
      .from("user_subscriptions")
      .select(`
        *,
        user:users (id, email, full_name),
        subscription_plan:subscription_plans (name)
      `);

    if (subscription_id) {
      query = query.eq("id", subscription_id);
    } else {
      query = query.eq("user_id", user_id).eq("status", "active");
    }

    const { data: subscription, error } = await query.single();

    if (error || !subscription) {
      return NextResponse.json(
        { success: false, message: "Subscription not found" },
        { status: 404 }
      );
    }

    if (!subscription.user?.email) {
      return NextResponse.json(
        { success: false, message: "User email not found" },
        { status: 400 }
      );
    }

    // Calculate days remaining if not provided
    let daysLeft = days_remaining;
    if (daysLeft === undefined || daysLeft === null) {
      const today = new Date();
      const expiry = new Date(subscription.expires_at);
      daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    }

    const expiryDate = new Date(subscription.expires_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    await sendExpiryReminderEmail(subscription.user.email, {
      name: subscription.user.full_name || "Member",
      plan_name: subscription.subscription_plan?.name || subscription.subscription_plan_name || "Membership",
      expiry_date: expiryDate,
      days_remaining: Math.max(0, daysLeft)
    });

    return NextResponse.json({
      success: true,
      message: "Expiry reminder email sent",
      email: subscription.user.email,
      days_remaining: daysLeft
    });

  } catch (error) {
    console.error("[EXPIRY-REMINDER] POST error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
