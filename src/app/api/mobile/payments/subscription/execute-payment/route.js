import { supabase } from '@/lib/supabaseAdmin';
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";
import { NextResponse } from 'next/server';
import { executeSubscriptionPayment } from '@/lib/myfatoorah';

/**
 * POST /api/payments/subscription/execute-payment
 * Execute payment with selected payment method
 */
export async function POST(request) {
  const startTime = Date.now();
  let requestData = null;
  
  try {
    requestData = await request.json();
    
    // Support both snake_case and camelCase
    const subscription_id = requestData.subscription_id || requestData.subscriptionId;
    const payment_id = requestData.payment_id || requestData.paymentId;
    const payment_method_id = requestData.payment_method_id || requestData.paymentMethodId;
    const redirect_to = requestData.redirect_to || requestData.redirectTo;
    const amount = requestData.amount;

    console.log('[EXECUTE-PAYMENT] Request received:', {
      subscription_id,
      payment_id,
      payment_method_id,
      timestamp: new Date().toISOString()
    });

    if (!subscription_id || !payment_id || !payment_method_id) {
      return NextResponse.json(
        { success: false, message: 'subscription_id, payment_id, and payment_method_id are required' },
        { status: 400 }
      );
    }

    // Verify authentication and get user_id from token
    let decoded;
    try {
      decoded = verifyTokenMobile(request);
    } catch (error) {
      console.error('[EXECUTE-PAYMENT] Auth error:', error.message);
      return NextResponse.json(
        { success: false, message: error.message || 'Authentication required' },
        { status: 401 }
      );
    }

    const tokenUserId = decoded.user_id;

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('membership_payments')
      .select('id, user_id, subscription_id, amount, paid, payment_type')
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
    let callbackUrl = `${baseUrl}/api/mobile/payments/subscription/payment-complete?payment_id=${payment_id}&status=success`;
    if (redirect_to) {
      callbackUrl += `&redirect_to=${encodeURIComponent(redirect_to)}`;
    }
    
    const errorUrl = `${baseUrl}/api/mobile/payments/subscription/payment-complete?payment_id=${payment_id}&status=failed`;

    // Execute payment
    const executeResult = await executeSubscriptionPayment({
      invoiceAmount: amount || payment.amount,
      customerName: user.full_name,
      customerEmail: user.email,
      customerMobile: (user.mobile || user.phone || '').trim() || null,
      invoiceItems: [{
        ItemName: payment.payment_type === 'subscription_registration' 
          ? `Registration Fee - ${subscription.subscription_plan.display_name}`
          : payment.payment_type === 'subscription_renewal'
          ? `Renewal Fee - ${subscription.subscription_plan.display_name}`
          : payment.payment_type === 'subscription_combined'
          ? `Membership Fee - ${subscription.subscription_plan.display_name}`
          : `Annual Fee - ${subscription.subscription_plan.display_name}`,
        Quantity: 1,
        UnitPrice: amount || payment.amount
      }],
      callbackUrl,
      errorUrl,
      referenceId: payment_id,
      paymentMethodId: payment_method_id,
      logoUrl: process.env.NEXT_PUBLIC_SITE_LOGO_URL
    });

    if (!executeResult.success) {
      return NextResponse.json(
        { success: false, message: executeResult.message || 'Failed to execute payment' },
        { status: 500 }
      );
    }

    // Update payment record
    await supabase
      .from('membership_payments')
      .update({
        invoice_id: executeResult.invoiceId,
        payment_gateway: 'myfatoorah'
      })
      .eq('id', payment_id);

    return NextResponse.json({
      success: true,
      paymentUrl: executeResult.paymentUrl,
      invoiceId: executeResult.invoiceId,
      isDirectPayment: executeResult.isDirectPayment
    });

  } catch (error) {
    console.error('[EXECUTE-PAYMENT] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to execute payment', error: error.message },
      { status: 500 }
    );
  }
}
