import { supabase } from '@/lib/supabaseAdmin';
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";
import { NextResponse } from 'next/server';
import { initiateEventPayment } from '@/lib/myfatoorah';
import { getUserEventPrice } from '@/lib/eventPricing';

/**
 * POST /api/payments/event/create-invoice
 * Initiate event payment and get available payment methods
 */
export async function POST(request) {
  const startTime = Date.now();
  let requestData = null;
  
  try {
    requestData = await request.json();
    
    // Support both snake_case and camelCase for mobile flexibility
    const event_id = requestData.event_id || requestData.eventId;
    const body_user_id = requestData.user_id || requestData.userId;
    const coupon_code = requestData.coupon_code || requestData.couponCode;

    // Verify authentication and get user_id from token
    let decoded;
    try {
      decoded = verifyTokenMobile(request);
    } catch (error) {
      console.error('[EVENT-CREATE-INVOICE] Auth error:', error.message);
      return NextResponse.json(
        { success: false, message: error.message || 'Authentication required' },
        { status: 401 }
      );
    }

    const user_id = decoded.user_id;

    console.log('[EVENT-CREATE-INVOICE] Request received:', {
      event_id,
      user_id,
      body_user_id,
      timestamp: new Date().toISOString()
    });

    if (!event_id || !user_id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'event_id is required'
        },
        { status: 400 }
      );
    }

    // Verify user matches if both provided
    if (body_user_id && body_user_id !== user_id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: user_id mismatch' },
        { status: 403 }
      );
    }

    // Get event details - include all pricing fields for category-based pricing
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id, title, is_paid, start_datetime, early_bird_deadline,
        regular_price, regular_standard_price, regular_onsite_price,
        member_price, member_standard_price, member_onsite_price,
        student_price, student_standard_price, student_onsite_price,
        hygienist_price, hygienist_standard_price, hygienist_onsite_price
      `)
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      console.error('[EVENT-CREATE-INVOICE] Event not found:', { event_id, error: eventError });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Event not found',
          error: eventError
        },
        { status: 404 }
      );
    }

    if (!event.is_paid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'This event does not require payment'
        },
        { status: 400 }
      );
    }

    // Get user details - include category and position for pricing
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id, full_name, email, phone, mobile, membership_type,
        member_profiles!member_profiles_user_id_fkey(category, position, specialty)
      `)
      .eq('id', user_id)
      .single();

    // Flatten category and position from member_profiles
    if (user && user.member_profiles) {
      user.category = user.member_profiles.category;
      user.position = user.member_profiles.position;
      user.specialty = user.member_profiles.specialty;
    }

    if (userError || !user) {
      console.error('[EVENT-CREATE-INVOICE] User not found:', { user_id, error: userError });
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found',
          error: userError
        },
        { status: 404 }
      );
    }

    // Check if user already joined
    const { data: existingMember } = await supabase
      .from('event_members')
      .select('id, price_paid')
      .eq('event_id', event_id)
      .eq('user_id', user_id)
      .maybeSingle();

    if (existingMember && existingMember.price_paid > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'You have already paid for this event'
        },
        { status: 409 }
      );
    }

    // Calculate price using the new pricing utility
    const priceInfo = getUserEventPrice(event, user);
    let amount = priceInfo.price;

    let appliedCoupon = null;

    if (coupon_code && amount && amount > 0) {
      const normalizedCode = String(coupon_code).trim().toUpperCase();

      const { data: coupon, error: couponError } = await supabase
        .from('event_coupons')
        .select('*')
        .ilike('code', normalizedCode)
        .eq('event_id', event_id)
        .eq('is_active', true)
        .maybeSingle();

      if (couponError || !coupon) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired coupon code' },
          { status: 400 }
        );
      }

      const now = new Date();
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        return NextResponse.json(
          { success: false, message: 'Coupon is not active yet' },
          { status: 400 }
        );
      }
      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        return NextResponse.json(
          { success: false, message: 'Coupon has expired' },
          { status: 400 }
        );
      }

      if (
        coupon.max_uses != null &&
        Number(coupon.max_uses) > 0 &&
        coupon.used_count >= Number(coupon.max_uses)
      ) {
        return NextResponse.json(
          { success: false, message: 'Coupon usage limit reached' },
          { status: 400 }
        );
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
        return NextResponse.json(
          { success: false, message: 'You have already used this coupon for this event' },
          { status: 400 }
        );
      }

      let discount = 0;
      if (coupon.discount_type === 'fixed') {
        discount = Number(coupon.discount_value) || 0;
      } else {
        discount = (amount * Number(coupon.discount_value || 0)) / 100;
      }

      if (discount >= amount) discount = amount;
      const finalAmount = amount - discount;

      appliedCoupon = { ...coupon, discount_amount: discount };
      amount = finalAmount;
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Event price is not set for your category'
        },
        { status: 400 }
      );
    }

    // For mobile APIs, always use production URL for MyFatoorah callbacks
    // Mobile app should intercept the redirect and call the mobile confirm/callback endpoint
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost'))
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
      : 'https://bds-ev.vercel.app';
    
    // Use a mobile-friendly callback URL that the app can intercept
    const callbackUrl = `${baseUrl}/api/mobile/payments/event/payment-complete?event_id=${event_id}&status=success`;
    const errorUrl = `${baseUrl}/api/mobile/payments/event/payment-complete?event_id=${event_id}&status=failed`;

    // Initiate payment
    const initiateResult = await initiateEventPayment({
      invoiceAmount: amount,
      customerName: user.full_name,
      customerEmail: user.email,
      customerMobile: (user.mobile || user.phone || '').trim() || null,
      invoiceItems: [{
        ItemName: `Event Registration - ${event.title}` + (appliedCoupon ? ` (Coupon ${appliedCoupon.code})` : ''),
        Quantity: 1,
        UnitPrice: amount
      }],
      callbackUrl,
      errorUrl,
      referenceId: `EVT-${event_id}-${user_id}`,
      logoUrl: process.env.NEXT_PUBLIC_SITE_LOGO_URL
    });

    if (!initiateResult.success) {
      return NextResponse.json(
        { success: false, message: initiateResult.message || 'Failed to initiate payment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentMethods: (initiateResult.paymentMethods || []).map(method => ({
        id: method.PaymentMethodId,
        name: method.PaymentMethodEn,
        nameAr: method.PaymentMethodAr,
        code: method.PaymentMethodCode,
        imageUrl: method.ImageUrl,
        isDirectPayment: method.IsDirectPayment,
        serviceCharge: method.ServiceCharge,
        totalAmount: method.TotalAmount,
        currency: method.CurrencyIso,
        paymentCurrency: method.PaymentCurrencyIso,
        isEmbeddedSupported: method.IsEmbeddedSupported
      })),
      amount: amount,
      currency: 'BHD',
      event_id: event_id,
      user_id: user_id,
      event_title: event.title
    });

  } catch (error) {
    console.error('[EVENT-CREATE-INVOICE] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initiate payment', error: error.message },
      { status: 500 }
    );
  }
}
