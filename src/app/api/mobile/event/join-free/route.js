import { supabase } from "@/lib/supabaseAdmin";
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getUserEventPrice } from "@/lib/eventPricing";
import { sendEventJoinEmail } from "@/lib/email";

/**
 * Dedicated Free Event Join API for Mobile
 * - Authenticates via JWT (verifyTokenMobile)
 * - Validates that the event is actually FREE for the user
 * - Handles capacity and duplicate checks
 * - Creates enrollment and sends confirmation email
 */
export async function POST(req) {
  try {
    const { event_id } = await req.json();

    if (!event_id) {
      return NextResponse.json(
        { success: false, message: "event_id is required" },
        { status: 400 }
      );
    }

    // 1. Authenticate Mobile User
    let decoded;
    try {
      decoded = verifyTokenMobile(req);
    } catch (authErr) {
      return NextResponse.json(
        { success: false, message: authErr.message || "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = decoded.user_id;

    // 2. Fetch User with Profile (for pricing category)
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select(`
        id, 
        email,
        full_name,
        membership_type, 
        membership_status, 
        membership_expiry_date,
        member_profiles!member_profiles_user_id_fkey(
          category,
          position
        )
      `)
      .eq("id", userId)
      .single();

    if (userErr || !user) {
      return NextResponse.json(
        { success: false, message: "User profile not found" },
        { status: 404 }
      );
    }

    // Flatten profile for pricing utility
    const profile = user.member_profiles || {};
    const userForPricing = {
      ...user,
      category: profile.category,
      position: profile.position
    };

    // 3. Fetch Event Details
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single();

    if (eventErr || !event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // 4. PRICE VALIDATION - Ensure it's actually FREE
    const priceInfo = getUserEventPrice(event, userForPricing);
    
    // If the event is paid and the calculated price for this user is > 0, redirect to payment
    if (!priceInfo.isFree && (priceInfo.price && priceInfo.price > 0)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "This event requires payment. Please use the paid join flow.",
          requiresPayment: true,
          price: priceInfo.price,
          currency: "BHD"
        },
        { status: 402 } // Payment Required
      );
    }

    // 5. DUPLICATE CHECK
    const { data: existing } = await supabase
      .from("event_members")
      .select("id")
      .eq("event_id", event_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, message: "You have already joined this event" },
        { status: 409 }
      );
    }

    // 6. CAPACITY CHECK
    if (event.capacity) {
      const { count } = await supabase
        .from("event_members")
        .select("id", { count: "exact", head: true })
        .eq("event_id", event_id);

      if (count >= event.capacity) {
        return NextResponse.json(
          { success: false, message: "Sorry, this event has reached full capacity." },
          { status: 409 }
        );
      }
    }

    // 7. PERFORM ENROLLMENT
    const enrollmentToken = `EVT-${uuidv4().split("-")[0].toUpperCase()}`;
    
    const { error: insertErr } = await supabase
      .from("event_members")
      .insert({
        event_id,
        user_id: userId,
        token: enrollmentToken,
        is_member: priceInfo.category === 'member',
        price_paid: 0,
        registration_category: priceInfo.category,
        payment_status: "free"
      });

    if (insertErr) throw insertErr;

    // 8. SEND NOTIFICATION (Async)
    try {
      if (user.email) {
        await sendEventJoinEmail(user.email, {
          name: user.full_name || 'Member',
          event_name: event.title,
          event_date: event.start_datetime ? new Date(event.start_datetime).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Bahrain'
          }) : null,
          event_location: event.venue_name || 'TBA',
          event_code: enrollmentToken,
          price_paid: 0
        });
        console.log(`[FREE-JOIN] Confirmation sent to ${user.email} for event ${event_id}`);
      }
    } catch (emailErr) {
      console.error("[FREE-JOIN] Email Notification Failed:", emailErr);
      // We don't fail the request if email fails, as enrollment is successful
    }

    // 9. RETURN SUCCESS
    return NextResponse.json({
      success: true,
      message: "Success! You have been enrolled in the event.",
      event_member_code: enrollmentToken,
      qr_value: enrollmentToken,
      price_paid: 0
    });

  } catch (err) {
    console.error("MOBILE FREE JOIN FATAL ERROR:", err);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while joining the event." },
      { status: 500 }
    );
  }
}
