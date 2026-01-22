import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { sendEventJoinEmail } from "@/lib/email";

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
          .select("id, membership_type, membership_status, membership_expiry_date")
          .eq("id", decoded.user_id)
          .single();
        
        if (user) loggedInUser = user;
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
        "id, is_paid, regular_price, member_price, capacity"
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
    const membershipValid = loggedInUser && loggedInUser.membership_type === "paid" && loggedInUser.membership_status === "active" && (!loggedInUser.membership_expiry_date || new Date(loggedInUser.membership_expiry_date) > now);
    const isMember = membershipValid;
    let price_paid = 0;

    if (event.is_paid) {
      price_paid = isMember
        ? event.member_price ?? event.regular_price
        : event.regular_price;

      // For paid events, check if payment has been confirmed
      // Look for event member record with paid status
      const { data: pendingMember } = await supabase
        .from("event_members")
        .select("id, price_paid, paid, invoice_id")
        .eq("event_id", event_id)
        .eq("user_id", loggedInUser.id)
        .maybeSingle();

      if (pendingMember) {
        // If payment is confirmed, allow join
        if (pendingMember.paid && pendingMember.price_paid > 0) {
          // Payment confirmed, proceed with join
          price_paid = pendingMember.price_paid;
        } else {
          // Payment not confirmed yet, return payment required
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
      } else {
        // No payment record found, payment required
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
        .select("title, start_date, location")
        .eq("id", event_id)
        .single();

      if (userData?.email) {
        await sendEventJoinEmail(userData.email, {
          name: userData.full_name || 'Member',
          event_name: eventData?.title || 'Event',
          event_date: eventData?.start_date 
            ? new Date(eventData.start_date).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) 
            : null,
          event_location: eventData?.location || null,
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
