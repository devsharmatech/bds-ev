import { supabase } from '@/lib/supabaseAdmin';
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";
import { NextResponse } from 'next/server';
import { initiateSubscriptionPayment } from '@/lib/myfatoorah';

/**
 * POST /api/payments/subscription/create-invoice
 * Create MyFatoorah invoice for subscription payment
 */
export async function POST(request) {
  const startTime = Date.now();
  let requestData = null;

  try {
    requestData = await request.json();
    
    // Support both snake_case and camelCase
    const subscription_id = requestData.subscription_id || requestData.subscriptionId;
    const payment_id = requestData.payment_id || requestData.paymentId;
    const amount = requestData.amount;
    const payment_type = requestData.payment_type || requestData.paymentType;
    const redirect_to = requestData.redirect_to || requestData.redirectTo;

    let invoiceRefId = payment_id;

    console.log('[CREATE-INVOICE] Request received:', {
      subscription_id,
      payment_id,
      amount,
      payment_type,
      timestamp: new Date().toISOString()
    });

    if (!subscription_id || !payment_id || !amount) {
      return NextResponse.json(
        { success: false, message: 'subscription_id, payment_id, and amount are required' },
        { status: 400 }
      );
    }

    // Verify authentication and get user_id from token
    let decoded;
    try {
      decoded = verifyTokenMobile(request);
    } catch (error) {
      console.error('[CREATE-INVOICE] Auth error:', error.message);
      return NextResponse.json(
        { success: false, message: error.message || 'Authentication required' },
        { status: 401 }
      );
    }

    const tokenUserId = decoded.user_id;

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('membership_payments')
      .select('id, user_id, subscription_id, amount, paid, payment_type, currency')
      .eq('id', payment_id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { success: false, message: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Verify token user matches payment owner
    if (tokenUserId !== payment.user_id) {
       return NextResponse.json(
         { success: false, message: 'Unauthorized: payment belongs to another user' },
         { status: 403 }
       );
    }

    const userId = payment.user_id;

    // Verify payment is not already paid
    if (payment.paid) {
      return NextResponse.json(
        { success: false, message: 'Payment has already been processed' },
        { status: 400 }
      );
    }

    // Verify payment belongs to the subscription
    if (payment.subscription_id !== subscription_id) {
      return NextResponse.json(
        { success: false, message: 'Payment does not match subscription' },
        { status: 400 }
      );
    }

    // If this is a combined payment, update the payment record's type and amount
    if (payment_type === 'subscription_combined') {
      try {
        const { data: combinedPayment, error: combinedErr } = await supabase
          .from('membership_payments')
          .insert({
            user_id: payment.user_id,
            payment_type: 'subscription_combined',
            subscription_id: subscription_id,
            amount: amount,
            currency: payment.currency || 'BHD',
            paid: false,
            reference: `SUB-REG-ANN-${(subscription_id || '').toString().substring(0, 8).toUpperCase()}`,
            membership_start_date: new Date().toISOString(),
            membership_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            notes: 'Combined registration and annual payment (created at invoice initiation)'
          })
          .select()
          .single();

        if (combinedErr || !combinedPayment) {
          console.error('[CREATE-INVOICE] Failed to create combined payment record', { error: combinedErr, payment_id });
        } else {
          try {
            const { data: otherPayments } = await supabase
              .from('membership_payments')
              .select('id')
              .eq('subscription_id', subscription_id)
              .eq('paid', false)
              .neq('id', combinedPayment.id);

            if (otherPayments && otherPayments.length > 0) {
              for (const p of otherPayments) {
                await supabase
                  .from('membership_payments')
                  .update({ notes: `Merged into combined payment ${combinedPayment.id}` })
                  .eq('id', p.id);
              }
            }
          } catch (e) {
            console.warn('[CREATE-INVOICE] Failed to mark other payments as merged:', e.message || e);
          }
          invoiceRefId = combinedPayment.id;
        }
      } catch (err) {
        console.error('[CREATE-INVOICE] Unexpected error while creating combined payment record:', err);
      }
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, phone, mobile')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans (*)
      `)
      .eq('id', subscription_id)
      .eq('user_id', userId)
      .single();

    if (subError || !subscription || !subscription.subscription_plan) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found', subscription_id },
        { status: 404 }
      );
    }

    // For mobile APIs, always use production URL for MyFatoorah callbacks
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost'))
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
      : 'https://bds-ev.vercel.app';

    // Build callback URL
    let callbackUrl = `${baseUrl}/api/mobile/payments/subscription/payment-complete?payment_id=${invoiceRefId}&status=success`;
    if (redirect_to) {
      callbackUrl += `&redirect_to=${encodeURIComponent(redirect_to)}`;
    }

    const errorUrl = `${baseUrl}/api/mobile/payments/subscription/payment-complete?payment_id=${invoiceRefId}&status=failed`;

    // Initiate payment
    const initiateResult = await initiateSubscriptionPayment({
      invoiceAmount: amount,
      customerName: user.full_name,
      customerEmail: user.email,
      customerMobile: (user.mobile || user.phone || '').trim() || null,
      invoiceItems: [{
        ItemName: payment_type === 'subscription_registration'
          ? `Registration Fee - ${subscription.subscription_plan.display_name}`
          : payment_type === 'subscription_renewal'
            ? `Renewal Fee - ${subscription.subscription_plan.display_name}`
            : payment_type === 'subscription_combined'
              ? `Membership Fee - ${subscription.subscription_plan.display_name}`
              : `Annual Fee - ${subscription.subscription_plan.display_name}`,
        Quantity: 1,
        UnitPrice: amount
      }],
      callbackUrl,
      errorUrl,
      referenceId: invoiceRefId,
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
      payment_id: invoiceRefId,
      subscription_id: subscription_id
    });

  } catch (error) {
    console.error('[CREATE-INVOICE] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create payment invoice', error: error.message },
      { status: 500 }
    );
  }
}
