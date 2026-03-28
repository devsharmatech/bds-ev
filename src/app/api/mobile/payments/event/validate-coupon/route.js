import { supabase } from '@/lib/supabaseAdmin';
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";
import { NextResponse } from 'next/server';
import { getUserEventPrice } from '@/lib/eventPricing';

export async function POST(request) {
  let requestData = null;

  try {
    requestData = await request.json();
    const event_id = requestData.event_id || requestData.eventId;
    const coupon_code = requestData.coupon_code || requestData.couponCode;

    if (!event_id || !coupon_code) {
      return NextResponse.json(
        { success: false, message: 'event_id and coupon_code are required' },
        { status: 400 }
      );
    }

    let decoded;
    try {
      decoded = verifyTokenMobile(request);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error.message || 'Authentication required' },
        { status: 401 }
      );
    }
    const user_id = decoded.user_id;

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id, is_paid, start_datetime, early_bird_deadline,
        regular_price, regular_standard_price, regular_onsite_price,
        member_price, member_standard_price, member_onsite_price,
        student_price, student_standard_price, student_onsite_price,
        hygienist_price, hygienist_standard_price, hygienist_onsite_price
      `)
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    if (!event.is_paid) {
      return NextResponse.json({ success: false, message: 'This event is free' }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id, membership_type,
        member_profiles!member_profiles_user_id_fkey(category, position, specialty)
      `)
      .eq('id', user_id)
      .single();

    if (user && user.member_profiles) {
      user.category = user.member_profiles.category;
      user.position = user.member_profiles.position;
      user.specialty = user.member_profiles.specialty;
    }

    if (userError || !user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Backend securely calculates the base price first
    const priceInfo = getUserEventPrice(event, user);
    const originalAmount = priceInfo.price;

    if (!originalAmount || originalAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Event price is not set for your category' }, { status: 400 });
    }

    const normalizedCode = String(coupon_code).trim().toUpperCase();

    const { data: coupon, error: couponError } = await supabase
      .from('event_coupons')
      .select('*')
      .ilike('code', normalizedCode)
      .eq('event_id', event_id)
      .eq('is_active', true)
      .maybeSingle();

    if (couponError || !coupon) {
      return NextResponse.json({ success: false, message: 'Invalid or expired coupon code' }, { status: 400 });
    }

    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({ success: false, message: 'Coupon is not active yet' }, { status: 400 });
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json({ success: false, message: 'Coupon has expired' }, { status: 400 });
    }

    if (coupon.max_uses != null && Number(coupon.max_uses) > 0 && coupon.used_count >= Number(coupon.max_uses)) {
      return NextResponse.json({ success: false, message: 'Coupon usage limit reached' }, { status: 400 });
    }

    const { data: existingUsage } = await supabase
      .from('event_coupon_usages')
      .select('id, event_member_id')
      .eq('coupon_id', coupon.id)
      .eq('event_id', event_id)
      .eq('user_id', user_id)
      .not('event_member_id', 'is', null)
      .maybeSingle();

    if (existingUsage && existingUsage.event_member_id) {
      return NextResponse.json({ success: false, message: 'You have already used this coupon for this event' }, { status: 400 });
    }

    let discount = 0;
    if (coupon.discount_type === 'fixed') {
      discount = Number(coupon.discount_value) || 0;
    } else {
      discount = (originalAmount * Number(coupon.discount_value || 0)) / 100;
    }

    if (discount >= originalAmount) discount = originalAmount;
    const finalAmount = originalAmount - discount;

    return NextResponse.json({
      success: true,
      message: 'Coupon is valid',
      data: {
        original_price: originalAmount,
        discount_amount: discount,
        final_price: finalAmount,
        coupon_type: coupon.discount_type,
        coupon_value: coupon.discount_value
      }
    });

  } catch (error) {
    console.error('[EVENT-VALIDATE-COUPON] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to validate coupon', error: error.message },
      { status: 500 }
    );
  }
}
