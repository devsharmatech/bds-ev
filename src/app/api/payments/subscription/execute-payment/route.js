import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
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
    const { subscription_id, payment_id, payment_method_id, redirect_to, amount: requestedAmount } = requestData;

    console.log('[EXECUTE-PAYMENT] Request received:', {
      subscription_id,
      payment_id,
      payment_method_id,
      requestedAmount,
      timestamp: new Date().toISOString()
    });

    if (!subscription_id || !payment_id || !payment_method_id) {
      console.error('[EXECUTE-PAYMENT] Missing required fields:', {
        has_subscription_id: !!subscription_id,
        has_payment_id: !!payment_id,
        has_payment_method_id: !!payment_method_id,
        requestData
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'subscription_id, payment_id, and payment_method_id are required',
          details: {
            missing_fields: {
              subscription_id: !subscription_id,
              payment_id: !payment_id,
              payment_method_id: !payment_method_id
            }
          }
        },
        { status: 400 }
      );
    }

    // Get payment record
    console.log('[EXECUTE-PAYMENT] Fetching payment record:', { payment_id });
    const { data: payment, error: paymentError } = await supabase
      .from('membership_payments')
      .select('id, user_id, subscription_id, amount, paid, payment_type')
      .eq('id', payment_id)
      .single();

    if (paymentError || !payment) {
      console.error('[EXECUTE-PAYMENT] Error fetching payment:', {
        error: paymentError,
        payment_id
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Payment record not found',
          error: paymentError
        },
        { status: 404 }
      );
    }

    // Verify payment is not already paid
    if (payment.paid) {
      console.warn('[EXECUTE-PAYMENT] Payment already processed:', {
        payment_id,
        paid_at: payment.paid_at
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Payment has already been processed',
          payment_id
        },
        { status: 400 }
      );
    }

    // Verify payment belongs to the subscription
    if (payment.subscription_id !== subscription_id) {
      console.error('[EXECUTE-PAYMENT] Payment subscription mismatch:', {
        payment_subscription_id: payment.subscription_id,
        requested_subscription_id: subscription_id,
        payment_id
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Payment does not match subscription'
        },
        { status: 400 }
      );
    }

    // Check authentication (optional for registration flow)
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;
    let userId = payment.user_id;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.user_id;
        // If token user does not match payment owner, fall back to payment user (avoids false Unauthorized)
        if (userId !== payment.user_id) {
          console.warn('[EXECUTE-PAYMENT] Auth user does not match payment user, falling back to payment.user_id', {
            token_user_id: userId,
            payment_user_id: payment.user_id,
            payment_id: payment.id
          });
          userId = payment.user_id;
        }
      } catch (error) {
        // Token invalid, but continue for registration flow using payment's user_id
        console.warn('[EXECUTE-PAYMENT] Invalid token, using payment.user_id instead', {
          error: error.message,
          payment_user_id: payment.user_id
        });
        userId = payment.user_id;
      }
    }

    // Get user details
    console.log('[EXECUTE-PAYMENT] Fetching user details:', { user_id: userId });
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, phone, mobile')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[EXECUTE-PAYMENT] Error fetching user:', {
        error: userError,
        user_id: userId
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found',
          error: userError
        },
        { status: 404 }
      );
    }

    // Get subscription details
    console.log('[EXECUTE-PAYMENT] Fetching subscription details:', { subscription_id });
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
      console.error('[EXECUTE-PAYMENT] Error fetching subscription:', {
        error: subError,
        subscription_id
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Subscription not found',
          error: subError
        },
        { status: 404 }
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
    
    // Build callback URL with redirect_to parameter if provided
    let callbackUrl = `${baseUrl}/api/payments/subscription/callback?payment_id=${payment_id}`;
    if (redirect_to) {
      callbackUrl += `&redirect_to=${encodeURIComponent(redirect_to)}`;
    }
    
    const isAuthenticated = token && userId === payment.user_id;
    const errorUrl = isAuthenticated
      ? `${baseUrl}/member/dashboard/subscriptions?error=payment_failed`
      : `${baseUrl}/auth/login?error=payment_failed`;

    // Use requested amount if provided (for combined payments), otherwise use payment record amount
    const finalAmount = requestedAmount || payment.amount;
    
    // Create invoice items
    const invoiceItems = [{
      ItemName: payment.payment_type === 'subscription_registration' 
        ? `Registration Fee - ${subscription.subscription_plan.display_name}`
        : payment.payment_type === 'subscription_renewal'
        ? `Renewal Fee - ${subscription.subscription_plan.display_name}`
        : payment.payment_type === 'subscription_combined'
        ? `Membership Fee - ${subscription.subscription_plan.display_name}`
        : `Annual Fee - ${subscription.subscription_plan.display_name}`,
      Quantity: 1,
      UnitPrice: finalAmount
    }];

    const customerMobile = (user.mobile || user.phone || '').trim() || null;

    console.log('[EXECUTE-PAYMENT] Calling MyFatoorah ExecutePayment:', {
      invoiceAmount: finalAmount,
      paymentMethodId: payment_method_id,
      customerName: user.full_name,
      customerEmail: user.email,
      customerMobile: customerMobile ? '***' : 'NOT_PROVIDED'
    });

    // Execute payment with selected method
    const executeResult = await executeSubscriptionPayment({
      invoiceAmount: finalAmount,
      customerName: user.full_name,
      customerEmail: user.email,
      customerMobile: customerMobile,
      invoiceItems,
      callbackUrl,
      errorUrl,
      referenceId: payment_id,
      paymentMethodId: payment_method_id,
      logoUrl: process.env.NEXT_PUBLIC_SITE_LOGO_URL
    });

    if (!executeResult.success) {
      console.error('[EXECUTE-PAYMENT] MyFatoorah ExecutePayment failed:', {
        error: executeResult.message,
        payment_id,
        payment_method_id
      });
      return NextResponse.json(
        { 
          success: false, 
          message: executeResult.message || 'Failed to execute payment',
          error: executeResult.error || executeResult.message,
          payment_id
        },
        { status: 500 }
      );
    }

    console.log('[EXECUTE-PAYMENT] MyFatoorah ExecutePayment successful:', {
      invoiceId: executeResult.invoiceId,
      paymentUrl: executeResult.paymentUrl ? '***' : null,
      payment_id
    });

    // Update payment record with invoice ID
    const { error: updateError } = await supabase
      .from('membership_payments')
      .update({
        invoice_id: executeResult.invoiceId,
        payment_gateway: 'myfatoorah'
      })
      .eq('id', payment_id);

    if (updateError) {
      console.error('[EXECUTE-PAYMENT] Error updating payment record:', {
        error: updateError,
        payment_id,
        invoice_id: executeResult.invoiceId
      });
      // Don't fail the request, payment was executed successfully
    }

    const duration = Date.now() - startTime;
    console.log('[EXECUTE-PAYMENT] Request completed successfully:', {
      payment_id,
      invoice_id: executeResult.invoiceId,
      duration_ms: duration
    });

    return NextResponse.json({
      success: true,
      paymentUrl: executeResult.paymentUrl,
      invoiceId: executeResult.invoiceId,
      isDirectPayment: executeResult.isDirectPayment
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[EXECUTE-PAYMENT] Unexpected error:', {
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
        message: 'Failed to execute payment',
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

