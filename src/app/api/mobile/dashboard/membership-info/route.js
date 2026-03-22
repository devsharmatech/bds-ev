// app/api/dashboard/membership-info/route.js
import { supabase } from "@/lib/supabaseAdmin";
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";
import { NextResponse } from "next/server";
export async function GET(req) {
  try {
    const decoded = verifyTokenMobile(req);
    const userId = decoded.user_id;

    // Fetch user membership data
    const { data: user, error } = await supabase
      .from("users")
      .select(`
        id,
        full_name,
        email,
        phone,
        membership_code,
        membership_type,
        membership_status,
        membership_expiry_date,
        current_subscription_plan_id,
        current_subscription_plan_name,
        is_member_verified,
        created_at,
        member_profiles (
          specialty,
          position,
          employer,
          membership_date,
          id_card_url,
          personal_photo_url
        )
      `)
      .eq("id", userId)
      .single();

    if (error) throw error;

    // Fetch plan display name if plan id exists
    let planDisplayName = null;
    if (user.current_subscription_plan_id) {
      const { data: plan } = await supabase
        .from("subscription_plans")
        .select("name, display_name")
        .eq("id", user.current_subscription_plan_id)
        .single();

      if (plan) {
        planDisplayName = plan.display_name || plan.name || null;
      }
    }

    // Fetch latest membership payment
    const { data: latestPayment } = await supabase
      .from("membership_payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Format response
    const formattedUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      membership_code: user.membership_code,
      membership_type: user.membership_type,
      membership_status: user.membership_status,
      membership_expiry_date: user.membership_expiry_date,
      created_at: user.created_at,
      current_subscription_plan_id: user.current_subscription_plan_id || null,
      current_subscription_plan_name: user.current_subscription_plan_name || null,
      current_subscription_plan_display_name: planDisplayName,
      is_member_verified: user.is_member_verified || false,
      specialty: user.member_profiles?.[0]?.specialty,
      position: user.member_profiles?.[0]?.position,
      employer: user.member_profiles?.[0]?.employer,
      membership_date: user.member_profiles?.[0]?.membership_date,
      id_card_url: user.member_profiles?.[0]?.id_card_url || null,
      personal_photo_url: user.member_profiles?.[0]?.personal_photo_url || null,
      latest_payment: latestPayment || null
    };

    return NextResponse.json({
      success: true,
      user: formattedUser
    });

  } catch (error) {
    console.error("MEMBERSHIP INFO ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch membership information" },
      { status: 500 }
    );
  }
}