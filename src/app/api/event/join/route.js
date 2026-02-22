import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { sendEventJoinEmail } from "@/lib/email";
import { getUserPricingCategory } from "@/lib/eventPricing";

export async function POST(req) {
  try {
    const { event_id, payment_reference } = await req.json();

    if (!event_id) {
      return NextResponse.json(
        { success: false, message: "event_id required" },
        { status: 400 }
      );
    }

    /* ---------- AUTH (OPTIONAL) ---------- */
    let loggedInUser = null;

    try {
      const cookieStore = await cookies(); // ✅ REQUIRED in Next.js 15
      const token = cookieStore.get("bds_token")?.value;

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { data: user, error } = await supabase
          .from("users")
          .select(`
            id, 
            membership_type, 
            membership_status, 
            membership_expiry_date,
            member_profiles!member_profiles_user_id_fkey(
              category,
              position
            )
          `)
          .eq("id", decoded.user_id)
          .single();

        if (user) {
          const profile = user.member_profiles || {};
          loggedInUser = {
            ...user,
            category: profile.category || null,
            position: profile.position || null,
          };
        }
      }
    } catch {
      loggedInUser = null;
    }

    if (!loggedInUser) {
      return NextResponse.json(
        { success: false, message: "Login required" },
        { status: 401 }
      );
    }

    /* ---------- FETCH EVENT ---------- */
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select(
        "id, is_paid, regular_price, member_price, capacity, early_bird_deadline, start_datetime, member_standard_price, member_onsite_price, regular_standard_price, regular_onsite_price, student_price, student_standard_price, student_onsite_price, hygienist_price, hygienist_standard_price, hygienist_onsite_price"
      )
      .eq("id", event_id)
      .single();

    if (eventErr || !event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    /* ---------- CAPACITY CHECK ---------- */
    if (event.capacity) {
      const { count } = await supabase
        .from("event_members")
        .select("id", { count: "exact", head: true })
        .eq("event_id", event_id);

      if (count >= event.capacity) {
        return NextResponse.json(
          { success: false, message: "Event is full" },
          { status: 409 }
        );
      }
    }

    /* ---------- DUPLICATE JOIN CHECK ---------- */
    const { data: existing } = await supabase
      .from("event_members")
      .select("id")
      .eq("event_id", event_id)
      .eq("user_id", loggedInUser.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Already joined this event" },
        { status: 409 }
      );
    }

    /* ---------- PRICE CALCULATION ---------- */
    const now = new Date();
    // Keep isMember check for the event_members table entry
    const membershipValid = loggedInUser && loggedInUser.membership_type === "paid" && loggedInUser.membership_status === "active" && (!loggedInUser.membership_expiry_date || new Date(loggedInUser.membership_expiry_date) > now);
    const isMember = membershipValid;
    let price_paid = 0;
    const registration_category = getUserPricingCategory(loggedInUser);
    const payment_status = "free";

    if (event.is_paid) {
      const { getUserEventPrice } = require("@/lib/eventPricing");
      const priceInfo = getUserEventPrice(event, loggedInUser);
      price_paid = priceInfo.price || 0;

      // For paid events that require a fee from this user, check if payment has been confirmed
      if (price_paid > 0) {
        // Since we already did a duplicate join check above, if they are here it means
        // they haven't joined yet. If price > 0, they MUST pay via the separate payment flow.
        return NextResponse.json(
          {
            success: false,
            message: "Payment required. Please complete payment first.",
            requiresPayment: true,
            event_id: event_id
          },
          { status: 402 }
        );
      }
    }

    /* ---------- CREATE EVENT MEMBER ---------- */
    const eventMemberToken = `EVT-${uuidv4()
      .split("-")[0]
      .toUpperCase()}`;

    const { error: insertErr } = await supabase
      .from("event_members")
      .insert({
        event_id,
        user_id: loggedInUser.id,
        token: eventMemberToken,
        is_member: isMember,
        price_paid,
        registration_category,
        payment_status
      });

    if (insertErr) throw insertErr;

    // Get user email and event details for notification
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("email, full_name")
        .eq("id", loggedInUser.id)
        .single();

      const { data: eventData } = await supabase
        .from("events")
        .select("title, start_datetime, venue_name")
        .eq("id", event_id)
        .single();

      if (userData?.email) {
        await sendEventJoinEmail(userData.email, {
          name: userData.full_name || 'Member',
          event_name: eventData?.title || 'Event',
          event_date: eventData?.start_datetime
            ? new Date(eventData.start_datetime).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
              timeZone: 'Asia/Bahrain'
            })
            : null,
          event_location: eventData?.venue_name || null,
          event_code: eventMemberToken,
          price_paid
        });
        console.log('[EVENT-JOIN] Confirmation email sent to:', userData.email);
      }
    } catch (emailError) {
      console.error('[EVENT-JOIN] Failed to send confirmation email:', emailError);
      // Don't fail the join if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Event joined successfully",
      event_member_code: eventMemberToken,
      qr_value: eventMemberToken,
      price_paid,
    });
  } catch (err) {
    console.error("JOIN EVENT ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
