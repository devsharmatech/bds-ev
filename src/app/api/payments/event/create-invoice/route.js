import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
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
    const { event_id, user_id, coupon_code } = requestData;

    console.log('[EVENT-CREATE-INVOICE] Request received:', {
      event_id,
      user_id,
      timestamp: new Date().toISOString()
    });

    if (!event_id || !user_id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'event_id and user_id are required'
        },
        { status: 400 }
      );
    }

    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Verify user matches
    if (decoded.user_id !== user_id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
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
    // This handles member type, category (student, hygienist), and pricing tier (early bird, standard, onsite)
    const priceInfo = getUserEventPrice(event, user);
    let amount = priceInfo.price;

    console.log('[EVENT-CREATE-INVOICE] Price calculated (before coupon):', {
      user_category: priceInfo.category,
      pricing_tier: priceInfo.tier,
      amount,
      user_membership_type: user.membership_type,
      user_profile_category: user.category
    });

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

      // Treat NULL or <= 0 max_uses as unlimited
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

      // Check if user already used this coupon for this event
      // 1) Prefer FINALIZED usages (linked to an event_member)
      // 2) Fallback: if the user has a paid event_member row for this event
      //    AND any coupon usage exists for this user/event/coupon, treat as used.
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

      const { data: paidMember } = await supabase
        .from('event_members')
        .select('id, price_paid')
        .eq('event_id', event_id)
        .eq('user_id', user_id)
        .gt('price_paid', 0)
        .maybeSingle();

      if (paidMember) {
        const { data: anyUsage } = await supabase
          .from('event_coupon_usages')
          .select('id')
          .eq('coupon_id', coupon.id)
          .eq('event_id', event_id)
          .eq('user_id', user_id)
          .limit(1)
          .maybeSingle();

        if (anyUsage) {
          return NextResponse.json(
            { success: false, message: 'You have already used this coupon for this event' },
            { status: 400 }
          );
        }
      }

      let discount = 0;
      if (coupon.discount_type === 'fixed') {
        discount = Number(coupon.discount_value) || 0;
      } else {
        discount = (amount * Number(coupon.discount_value || 0)) / 100;
      }

      if (discount <= 0) {
        return NextResponse.json(
          { success: false, message: 'Invalid discount configuration' },
          { status: 400 }
        );
      }

      if (discount >= amount) discount = amount;
      const finalAmount = amount - discount;

      // Clean up any old provisional usages (e.g. abandoned payments)
      await supabase
        .from('event_coupon_usages')
        .delete()
        .eq('coupon_id', coupon.id)
        .eq('event_id', event_id)
        .eq('user_id', user_id)
        .is('event_member_id', null);

      // Record a provisional usage row (without payment_id yet)
      await supabase.from('event_coupon_usages').insert({
        coupon_id: coupon.id,
        event_id,
        user_id,
        amount_before: amount,
        discount_amount: discount,
        amount_after: finalAmount,
        metadata: { stage: 'invoice_created' },
      });

      appliedCoupon = { ...coupon, discount_amount: discount };
      amount = finalAmount;

      console.log('[EVENT-CREATE-INVOICE] Coupon applied:', {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discount,
        final_amount: amount,
      });
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

    // Get base URL
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    
    if (!baseUrl || baseUrl.includes('localhost')) {
      const origin = request.headers.get('origin') || request.headers.get('host');
      if (origin) {
        if (origin.startsWith('http')) {
          baseUrl = origin;
        } else {
          const protocol = request.headers.get('x-forwarded-proto') || 'https';
          baseUrl = `${protocol}://${origin}`;
        }
      } else {
        baseUrl = 'https://bds-ev.vercel.app';
      }
    }
    
    baseUrl = baseUrl.replace(/\/$/, '');
    
    const callbackUrl = `${baseUrl}/api/payments/event/callback?event_id=${event_id}&user_id=${user_id}`;
    const errorUrl = `${baseUrl}/events?error=payment_failed`;

    // Create invoice items
    const invoiceItems = [{
      ItemName: `Event Registration - ${event.title}` + (appliedCoupon ? ` (Coupon ${appliedCoupon.code})` : ''),
      Quantity: 1,
      UnitPrice: amount
    }];

    const customerMobile = (user.mobile || user.phone || '').trim() || null;

    console.log('[EVENT-CREATE-INVOICE] Calling MyFatoorah InitiatePayment:', {
      invoiceAmount: amount,
      customerName: user.full_name,
      customerEmail: user.email,
      customerMobile: customerMobile ? '***' : 'NOT_PROVIDED',
      event_id
    });

    // Initiate payment to get payment methods
    const initiateResult = await initiateEventPayment({
      invoiceAmount: amount,
      customerName: user.full_name,
      customerEmail: user.email,
      customerMobile: customerMobile,
      invoiceItems,
      callbackUrl,
      errorUrl,
      referenceId: `EVT-${event_id}-${user_id}`,
      logoUrl: process.env.NEXT_PUBLIC_SITE_LOGO_URL
    });

    if (!initiateResult.success) {
      console.error('[EVENT-CREATE-INVOICE] MyFatoorah InitiatePayment failed:', {
        error: initiateResult.message,
        event_id,
        user_id
      });
      return NextResponse.json(
        { 
          success: false, 
          message: initiateResult.message || 'Failed to initiate payment',
          error: initiateResult.error || initiateResult.message
        },
        { status: 500 }
      );
    }

    console.log('[EVENT-CREATE-INVOICE] MyFatoorah InitiatePayment successful:', {
      paymentMethodsCount: initiateResult.paymentMethods?.length || 0,
      event_id
    });

    // Format payment methods for frontend
    const formattedPaymentMethods = (initiateResult.paymentMethods || []).map(method => ({
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
    }));

    const duration = Date.now() - startTime;
    console.log('[EVENT-CREATE-INVOICE] Request completed successfully:', {
      event_id,
      paymentMethodsCount: formattedPaymentMethods.length,
      duration_ms: duration
    });

    return NextResponse.json({
      success: true,
      paymentMethods: formattedPaymentMethods,
      amount: amount,
      currency: 'BHD',
      event_id: event_id,
      user_id: user_id,
      event_title: event.title
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[EVENT-CREATE-INVOICE] Unexpected error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      requestData,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to initiate payment',
        error: {
          name: error.name,
          message: error.message,
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
      },
      { status: 500 }
    );
  }
}

