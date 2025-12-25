import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { createSubscriptionPaymentInvoice } from '@/lib/myfatoorah';

/**
 * POST /api/payments/subscription/create-invoice
 * Create MyFatoorah invoice for subscription payment
 */
export async function POST(request) {
  const startTime = Date.now();
  let requestData = null;
  
  try {
    requestData = await request.json();
    const { subscription_id, payment_id, amount, payment_type } = requestData;

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

    // Check authentication (optional for registration flow)
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.user_id;
        // Verify user matches payment user_id if authenticated
        if (userId !== payment.user_id) {
          return NextResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 403 }
          );
        }
      } catch (error) {
        // Token invalid, but continue for registration flow
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
    
    const callbackUrl = `${baseUrl}/api/payments/subscription/callback?payment_id=${payment_id}`;
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
      referenceId: payment_id,
      payment_type
    });

    // Ensure customerMobile is a valid string (not null or undefined)
    const customerMobile = (user.mobile || user.phone || '').trim() || null;
    
    console.log('[CREATE-INVOICE] Calling MyFatoorah with:', {
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

    const invoiceResult = await createSubscriptionPaymentInvoice({
      invoiceAmount: amount,
      customerName: user.full_name,
      customerEmail: user.email,
      customerMobile: customerMobile,
      invoiceItems,
      callbackUrl,
      errorUrl,
      referenceId: payment_id
    });

    if (!invoiceResult.success) {
      console.error('[CREATE-INVOICE] MyFatoorah invoice creation failed:', {
        error: invoiceResult.message,
        payment_id,
        subscription_id,
        amount,
        user_id: userId
      });
      return NextResponse.json(
        { 
          success: false, 
          message: invoiceResult.message || 'Failed to create payment invoice',
          error: invoiceResult.error || invoiceResult.message,
          payment_id,
          subscription_id
        },
        { status: 500 }
      );
    }

    console.log('[CREATE-INVOICE] MyFatoorah invoice created successfully:', {
      invoiceId: invoiceResult.invoiceId,
      paymentUrl: invoiceResult.paymentUrl,
      payment_id
    });

    // Update payment record with invoice ID
    console.log('[CREATE-INVOICE] Updating payment record with invoice ID:', {
      payment_id,
      invoice_id: invoiceResult.invoiceId
    });
    
    const { error: updateError } = await supabase
      .from('membership_payments')
      .update({
        invoice_id: invoiceResult.invoiceId,
        payment_gateway: 'myfatoorah',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment_id);

    if (updateError) {
      console.error('[CREATE-INVOICE] Error updating payment record:', {
        error: updateError,
        code: updateError.code,
        message: updateError.message,
        payment_id,
        invoice_id: invoiceResult.invoiceId
      });
      // Don't fail the request, invoice was created successfully
    } else {
      console.log('[CREATE-INVOICE] Payment record updated successfully');
    }

    const duration = Date.now() - startTime;
    console.log('[CREATE-INVOICE] Request completed successfully:', {
      payment_id,
      invoice_id: invoiceResult.invoiceId,
      duration_ms: duration
    });

    return NextResponse.json({
      success: true,
      paymentUrl: invoiceResult.paymentUrl,
      invoiceId: invoiceResult.invoiceId
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

