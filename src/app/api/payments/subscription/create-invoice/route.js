import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
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
    const { subscription_id, payment_id, amount, payment_type, redirect_to } = requestData;
    let invoiceRefId = payment_id; // may be replaced if we create a combined payment record

    console.log('[CREATE-INVOICE] Request received:', {
      subscription_id,
      payment_id,
      amount,
      payment_type,
      timestamp: new Date().toISOString()
    });

    if (!subscription_id || !payment_id || !amount) {
      console.error('[CREATE-INVOICE] Missing required fields:', {
        has_subscription_id: !!subscription_id,
        has_payment_id: !!payment_id,
        has_amount: !!amount,
        requestData
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'subscription_id, payment_id, and amount are required',
          details: {
            missing_fields: {
              subscription_id: !subscription_id,
              payment_id: !payment_id,
              amount: !amount
            }
          }
        },
        { status: 400 }
      );
    }

    // Get payment record first to verify it exists and get user_id
    // Add retry logic for connection timeouts
    console.log('[CREATE-INVOICE] Fetching payment record:', { payment_id });
    
    let payment = null;
    let paymentError = null;
    const maxRetries = 3;
    const retryDelay = 1000; // Start with 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await Promise.race([
          supabase
            .from('membership_payments')
            .select('id, user_id, subscription_id, amount, paid, payment_type')
            .eq('id', payment_id)
            .single()
            .then(result => ({ data: result.data, error: result.error })),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database query timeout')), 15000)
          )
        ]);
        
        paymentError = result.error;
        payment = result.data;
        
        if (!paymentError && payment) {
          break; // Success, exit retry loop
        }
        
        // If it's not a timeout/connection error, don't retry
        const isTimeoutError = paymentError?.message?.includes('timeout') || 
                              paymentError?.message?.includes('ECONNREFUSED') || 
                              paymentError?.message?.includes('ConnectTimeoutError') ||
                              paymentError?.code === 'PGRST116' ||
                              paymentError?.code === 'PGRST301';
        
        if (!isTimeoutError) {
          break; // Don't retry for non-timeout errors
        }
        
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.warn(`[CREATE-INVOICE] Retry attempt ${attempt}/${maxRetries} after ${delay}ms:`, {
            error: paymentError?.message,
            code: paymentError?.code,
            payment_id
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        const isTimeoutError = error.message?.includes('timeout') || 
                              error.message?.includes('ECONNREFUSED') || 
                              error.message?.includes('ConnectTimeoutError');
        
        paymentError = error;
        
        if (attempt < maxRetries && isTimeoutError) {
          const delay = retryDelay * Math.pow(2, attempt - 1);
          console.warn(`[CREATE-INVOICE] Retry attempt ${attempt}/${maxRetries} after ${delay}ms:`, {
            error: error.message,
            payment_id
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }

    if (paymentError) {
      console.error('[CREATE-INVOICE] Error fetching payment record after retries:', {
        error: paymentError,
        code: paymentError.code,
        message: paymentError.message,
        details: paymentError.details,
        hint: paymentError.hint,
        payment_id,
        attempts: maxRetries
      });
      
      // Check if it's a connection timeout error
      const isTimeoutError = paymentError.message?.includes('timeout') || 
                            paymentError.message?.includes('ECONNREFUSED') || 
                            paymentError.message?.includes('ConnectTimeoutError');
      
      return NextResponse.json(
        { 
          success: false, 
          message: isTimeoutError 
            ? 'Database connection timeout. Please try again in a moment.' 
            : 'Payment record not found',
          error: {
            code: paymentError.code || 'CONNECTION_ERROR',
            message: paymentError.message,
            details: paymentError.details || paymentError.stack,
            isTimeout: isTimeoutError
          }
        },
        { status: isTimeoutError ? 503 : 404 }
      );
    }
    
    if (!payment) {
      console.error('[CREATE-INVOICE] Payment record not found:', { payment_id });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Payment record not found',
          error: {
            code: 'NOT_FOUND',
            message: 'Payment record does not exist'
          }
        },
        { status: 404 }
      );
    }

    if (!payment) {
      console.error('[CREATE-INVOICE] Payment record not found:', { payment_id });
      return NextResponse.json(
        { success: false, message: 'Payment record not found', payment_id },
        { status: 404 }
      );
    }

    console.log('[CREATE-INVOICE] Payment record found:', {
      payment_id: payment.id,
      user_id: payment.user_id,
      subscription_id: payment.subscription_id,
      amount: payment.amount,
      paid: payment.paid,
      payment_type: payment.payment_type
    });

    // Verify payment is not already paid
    if (payment.paid) {
      console.warn('[CREATE-INVOICE] Payment already processed:', {
        payment_id,
        paid_at: payment.paid_at
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Payment has already been processed',
          payment_id,
          paid_at: payment.paid_at
        },
        { status: 400 }
      );
    }

    // Verify payment belongs to the subscription
    if (payment.subscription_id !== subscription_id) {
      console.error('[CREATE-INVOICE] Payment subscription mismatch:', {
        payment_subscription_id: payment.subscription_id,
        requested_subscription_id: subscription_id,
        payment_id
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Payment does not match subscription',
          details: {
            payment_subscription_id: payment.subscription_id,
            requested_subscription_id: subscription_id
          }
        },
        { status: 400 }
      );
    }

    // Verify amount matches
    if (payment.amount != amount) {
      console.warn('[CREATE-INVOICE] Amount mismatch:', {
        payment_amount: payment.amount,
        requested_amount: amount,
        payment_id
      });
    }

    // If this is a combined payment, update the payment record's type and amount
    if (payment_type === 'subscription_combined') {
      // Instead of mutating one of the per-item payments, create a single
      // combined payment record so the DB shows a single invoice for the
      // combined registration+annual payment. Mark existing unpaid
      // per-item payments as merged for auditability.
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
            reference: `SUB-REG-ANN-${(subscription_id || '').toString().substring(0,8).toUpperCase()}`,
            notes: 'Combined registration and annual payment (created at invoice initiation)'
          })
          .select()
          .single();

        if (combinedErr || !combinedPayment) {
          console.error('[CREATE-INVOICE] Failed to create combined payment record, falling back to updating provided payment id', { error: combinedErr, payment_id });
        } else {
          // Update any existing unpaid per-item payments for this subscription to mark them merged
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
              console.log('[CREATE-INVOICE] Marked other unpaid payments as merged:', otherPayments.map(p => p.id));
            }
          } catch (e) {
            console.warn('[CREATE-INVOICE] Failed to mark other payments as merged:', e.message || e);
          }

          // Use the new combined payment id for invoice initiation
          requestData.payment_id = combinedPayment.id;
          // update local variable so logs below reflect correct id
          // (we don't reassign `payment` object here because it's used earlier)
          // but ensure `payment_id` used further is the combined id
          // (note: `payment_id` is from request body; we'll use requestData when returning)
          invoiceRefId = combinedPayment.id;
          console.log('[CREATE-INVOICE] Created combined payment record:', { combinedPaymentId: combinedPayment.id, amount });
        }
      } catch (err) {
        console.error('[CREATE-INVOICE] Unexpected error while creating combined payment record:', err);
      }
    }
    // Check authentication (optional for registration flow)
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.user_id;
        // If token user does not match payment owner, fall back to payment user (allows admin/edge cases)
        if (userId !== payment.user_id) {
          console.warn('[CREATE-INVOICE] Auth user does not match payment user, falling back to payment.user_id', {
            token_user_id: userId,
            payment_user_id: payment.user_id,
            payment_id: payment.id
          });
          userId = payment.user_id;
        }
      } catch (error) {
        // Token invalid, but continue for registration flow using payment's user_id
        console.warn('[CREATE-INVOICE] Invalid token, using payment.user_id instead', {
          error: error.message,
          payment_user_id: payment.user_id
        });
        userId = payment.user_id;
      }
    } else {
      // No token - this is registration flow, use payment's user_id
      userId = payment.user_id;
    }

    // Get user details
    console.log('[CREATE-INVOICE] Fetching user details:', { user_id: userId });
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, phone, mobile')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('[CREATE-INVOICE] Error fetching user:', {
        error: userError,
        code: userError.code,
        message: userError.message,
        user_id: userId
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found',
          error: {
            code: userError.code,
            message: userError.message
          },
          user_id: userId
        },
        { status: 404 }
      );
    }

    if (!user) {
      console.error('[CREATE-INVOICE] User not found:', { user_id: userId });
      return NextResponse.json(
        { success: false, message: 'User not found', user_id: userId },
        { status: 404 }
      );
    }

    console.log('[CREATE-INVOICE] User found:', {
      user_id: user.id,
      email: user.email,
      full_name: user.full_name
    });

    // Get subscription details
    console.log('[CREATE-INVOICE] Fetching subscription details:', { subscription_id, user_id: userId });
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans (*)
      `)
      .eq('id', subscription_id)
      .eq('user_id', userId)
      .single();

    if (subError) {
      console.error('[CREATE-INVOICE] Error fetching subscription:', {
        error: subError,
        code: subError.code,
        message: subError.message,
        subscription_id,
        user_id: userId
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Subscription not found',
          error: {
            code: subError.code,
            message: subError.message
          },
          subscription_id,
          user_id: userId
        },
        { status: 404 }
      );
    }

    if (!subscription) {
      console.error('[CREATE-INVOICE] Subscription not found:', { subscription_id, user_id: userId });
      return NextResponse.json(
        { success: false, message: 'Subscription not found', subscription_id, user_id: userId },
        { status: 404 }
      );
    }

    if (!subscription.subscription_plan) {
      console.error('[CREATE-INVOICE] Subscription plan not found in subscription:', { subscription_id });
      return NextResponse.json(
        { success: false, message: 'Subscription plan details not found', subscription_id },
        { status: 404 }
      );
    }

    console.log('[CREATE-INVOICE] Subscription found:', {
      subscription_id: subscription.id,
      plan_name: subscription.subscription_plan_name,
      status: subscription.status
    });

    // Create payment invoice
    // Get base URL from environment or request headers
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    
    // If not set, try to get from request headers (for production)
    if (!baseUrl || baseUrl.includes('localhost')) {
      const origin = request.headers.get('origin') || request.headers.get('host');
      if (origin) {
        // Extract protocol and host from origin
        if (origin.startsWith('http')) {
          baseUrl = origin;
        } else {
          // If just host, determine protocol
          const protocol = request.headers.get('x-forwarded-proto') || 'https';
          baseUrl = `${protocol}://${origin}`;
        }
      } else {
        // Fallback to production URL
        baseUrl = 'https://bds-ev.vercel.app';
      }
    }
    
    // Ensure baseUrl doesn't have trailing slash
    baseUrl = baseUrl.replace(/\/$/, '');
    
    console.log('[CREATE-INVOICE] Base URL determined:', {
      baseUrl,
      envNextPublic: process.env.NEXT_PUBLIC_APP_URL,
      envApp: process.env.APP_URL,
      origin: request.headers.get('origin'),
      host: request.headers.get('host')
    });
    
    // Build callback URL with redirect_to parameter if provided
    let callbackUrl = `${baseUrl}/api/payments/subscription/callback?payment_id=${payment_id}`;
    if (redirect_to) {
      callbackUrl += `&redirect_to=${encodeURIComponent(redirect_to)}`;
    }
    
    // Use login page for registration flow, member dashboard for logged-in users
    const isAuthenticated = token && userId === payment.user_id;
    const errorUrl = isAuthenticated
      ? `${baseUrl}/member/dashboard/subscriptions?error=payment_failed`
      : `${baseUrl}/auth/login?error=payment_failed`;

    // Create invoice items - MyFatoorah requires specific format (same as event payments)
    const invoiceItems = [{
      ItemName: payment_type === 'subscription_registration' 
        ? `Registration Fee - ${subscription.subscription_plan.display_name}`
        : payment_type === 'subscription_renewal'
        ? `Renewal Fee - ${subscription.subscription_plan.display_name}`
        : payment_type === 'subscription_combined'
        ? `Membership Fee - ${subscription.subscription_plan.display_name}`
        : `Annual Fee - ${subscription.subscription_plan.display_name}`,
      Quantity: 1,
      UnitPrice: amount
    }];

    console.log('[CREATE-INVOICE] Invoice items prepared:', {
      items: invoiceItems,
      totalAmount: amount,
      payment_type
    });

    console.log('[CREATE-INVOICE] Creating MyFatoorah invoice:', {
      invoiceAmount: amount,
      customerName: user.full_name,
      customerEmail: user.email,
      callbackUrl,
      errorUrl,
      referenceId: invoiceRefId,
      payment_type
    });

    // Ensure customerMobile is a valid string (not null or undefined)
    const customerMobile = (user.mobile || user.phone || '').trim() || null;
    
    console.log('[CREATE-INVOICE] Calling MyFatoorah InitiatePayment with:', {
      invoiceAmount: amount,
      customerName: user.full_name,
      customerEmail: user.email,
      customerMobile: customerMobile ? '***' : 'NOT_PROVIDED',
      invoiceItems: invoiceItems.map(item => ({
        ItemName: item.ItemName,
        Quantity: item.Quantity,
        UnitPrice: item.UnitPrice
      })),
      callbackUrl,
      errorUrl,
      referenceId: payment_id
    });

    // Step 1: Initiate payment to get available payment methods
    const initiateResult = await initiateSubscriptionPayment({
      invoiceAmount: amount,
      customerName: user.full_name,
      customerEmail: user.email,
      customerMobile: customerMobile,
      invoiceItems,
      callbackUrl,
      errorUrl,
      referenceId: invoiceRefId,
      logoUrl: process.env.NEXT_PUBLIC_SITE_LOGO_URL
    });

    if (!initiateResult.success) {
      console.error('[CREATE-INVOICE] MyFatoorah InitiatePayment failed:', {
        error: initiateResult.message,
        payment_id,
        subscription_id,
        amount,
        user_id: userId
      });
      return NextResponse.json(
        { 
          success: false, 
          message: initiateResult.message || 'Failed to initiate payment',
          error: initiateResult.error || initiateResult.message,
          payment_id,
          subscription_id
        },
        { status: 500 }
      );
    }

    console.log('[CREATE-INVOICE] MyFatoorah InitiatePayment successful:', {
      paymentMethodsCount: initiateResult.paymentMethods?.length || 0,
      payment_id
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
    console.log('[CREATE-INVOICE] Request completed successfully:', {
      payment_id,
      paymentMethodsCount: formattedPaymentMethods.length,
      duration_ms: duration
    });

    return NextResponse.json({
      success: true,
      paymentMethods: formattedPaymentMethods,
      amount: amount,
      currency: 'BHD',
      payment_id: invoiceRefId,
      subscription_id: subscription_id
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[CREATE-INVOICE] Unexpected error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      },
      requestData,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid token',
          error: {
            name: error.name,
            message: error.message
          }
        },
        { status: 401 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request data',
          error: {
            name: error.name,
            message: error.message
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create payment invoice',
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

