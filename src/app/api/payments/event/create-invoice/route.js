import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { initiateEventPayment } from '@/lib/myfatoorah';

/**
 * POST /api/payments/event/create-invoice
 * Initiate event payment and get available payment methods
 */
export async function POST(request) {
  const startTime = Date.now();
  let requestData = null;
  
  try {
    requestData = await request.json();
    const { event_id, user_id } = requestData;

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

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, is_paid, regular_price, member_price')
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

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, phone, mobile, membership_type')
      .eq('id', user_id)
      .single();

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

    // Calculate price
    const isMember = user.membership_type === 'paid';
    const amount = isMember 
      ? (event.member_price ?? event.regular_price)
      : event.regular_price;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Event price is not set'
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
      ItemName: `Event Registration - ${event.title}`,
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
      referenceId: `EVT-${event_id}-${user_id}`
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

