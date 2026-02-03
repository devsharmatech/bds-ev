import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabaseAdmin";
import { getUserEventPrice } from "@/lib/eventPricing";

export async function POST(req) {
  try {
    const { event_id, code } = await req.json();

    if (!event_id || !code) {
      return NextResponse.json(
        { success: false, message: "event_id and code are required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = decoded.user_id;

    // Fetch event with pricing fields
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select(
        `id, title, is_paid, start_datetime, early_bird_deadline,
         regular_price, regular_standard_price, regular_onsite_price,
         member_price, member_standard_price, member_onsite_price,
         student_price, student_standard_price, student_onsite_price,
         hygienist_price, hygienist_standard_price, hygienist_onsite_price`
      )
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.is_paid) {
      return NextResponse.json(
        { success: false, message: "This event is free and does not support coupons" },
        { status: 400 }
      );
    }

    // Load user for pricing context
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(
        `id, full_name, email, membership_type,
         member_profiles!member_profiles_user_id_fkey(category, position, specialty)`
      )
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.member_profiles) {
      user.category = user.member_profiles.category;
      user.position = user.member_profiles.position;
      user.specialty = user.member_profiles.specialty;
    }

    const priceInfo = getUserEventPrice(event, user);
    const baseAmount = priceInfo.price;

    if (!baseAmount || baseAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Event price is not set for your category" },
        { status: 400 }
      );
    }

    const normalizedCode = String(code).trim().toUpperCase();

    // Fetch coupon without date filters, then validate window in JS
    const { data: coupon, error: couponError } = await supabase
      .from("event_coupons")
      .select("*")
      .ilike("code", normalizedCode)
      .eq("event_id", event_id)
      .eq("is_active", true)
      .maybeSingle();

    if (couponError || !coupon) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired coupon code" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json(
        { success: false, message: "Coupon is not active yet" },
        { status: 400 }
      );
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json(
        { success: false, message: "Coupon has expired" },
        { status: 400 }
      );
    }

    // Treat NULL or <= 0 max_uses as unlimited
    if (
      coupon.max_uses != null &&
      Number(coupon.max_uses) > 0 &&
      coupon.used_count >= Number(coupon.max_uses)
    ) {
      return NextResponse.json(
        { success: false, message: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    // Check if user already used this coupon for this event
    // 1) Prefer FINALIZED usages (linked to an event_member)
    // 2) Fallback: if the user has a paid event_member row for this event
    //    AND any coupon usage exists for this user/event/coupon, treat as used.
    const { data: existingUsage } = await supabase
      .from("event_coupon_usages")
      .select("id, event_member_id")
      .eq("coupon_id", coupon.id)
      .eq("event_id", event_id)
      .eq("user_id", userId)
      .not("event_member_id", "is", null)
      .maybeSingle();

    if (existingUsage && existingUsage.event_member_id) {
      return NextResponse.json(
        { success: false, message: "You have already used this coupon for this event" },
        { status: 400 }
      );
    }

    // Fallback safety: check paid membership + any coupon usage
    const { data: paidMember } = await supabase
      .from("event_members")
      .select("id, price_paid")
      .eq("event_id", event_id)
      .eq("user_id", userId)
      .gt("price_paid", 0)
      .maybeSingle();

    if (paidMember) {
      const { data: anyUsage } = await supabase
        .from("event_coupon_usages")
        .select("id")
        .eq("coupon_id", coupon.id)
        .eq("event_id", event_id)
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (anyUsage) {
        return NextResponse.json(
          { success: false, message: "You have already used this coupon for this event" },
          { status: 400 }
        );
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === "fixed") {
      discount = coupon.discount_value;
    } else {
      discount = (baseAmount * coupon.discount_value) / 100;
    }

    if (discount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid discount configuration" },
        { status: 400 }
      );
    }

    if (discount >= baseAmount) {
      discount = baseAmount;
    }

    const finalAmount = baseAmount - discount;

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
      base_amount: baseAmount,
      discount_amount: discount,
      final_amount: finalAmount,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to apply coupon" },
      { status: 500 }
    );
  }
}
