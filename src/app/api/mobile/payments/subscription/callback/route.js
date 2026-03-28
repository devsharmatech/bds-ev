import { supabase } from '@/lib/supabaseAdmin';
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";
import { NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/myfatoorah';
import { sendPaymentConfirmationEmail, sendWelcomeEmail } from '@/lib/email';


/**
 * POST /api/mobile/payments/subscription/callback
 * Handle MyFatoorah payment callback for mobile subscriptions
 * Returns JSON responses (not redirects) for mobile clients
 */
export async function POST(request) {
  const startTime = Date.now();

  try {
    // Verify authentication
    let decoded;
    try {
      decoded = verifyTokenMobile(request);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error.message || 'Authentication required' },
        { status: 401 }
      );
    }
    const tokenUserId = decoded.user_id;

    const body = await request.json();
    const paymentId = body.payment_id || body.paymentId;
    const invoiceId = body.invoice_id || body.invoiceId;


    console.log('[MOBILE-PAYMENT-CALLBACK] Callback received:', {
      payment_id: paymentId,
      invoiceId: invoiceId,
      userId: tokenUserId,
      timestamp: new Date().toISOString()
    });

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: 'payment_id is required' },
        { status: 400 }
      );
    }


    // Get payment record with retry logic for connection timeouts
    console.log('[MOBILE-PAYMENT-CALLBACK] Fetching payment record:', { payment_id: paymentId });

    let payment = null;
    let paymentError = null;
    const maxRetries = 3;
    const retryDelay = 1000; // Start with 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await Promise.race([
          supabase
            .from('membership_payments')
            .select(`
              *,
              user:users (id, full_name, email)
            `)
            .eq('id', paymentId)
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
          console.warn(`[PAYMENT-CALLBACK] Retry attempt ${attempt}/${maxRetries} after ${delay}ms:`, {
            error: paymentError?.message,
            code: paymentError?.code,
            payment_id: paymentId
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
          console.warn(`[PAYMENT-CALLBACK] Retry attempt ${attempt}/${maxRetries} after ${delay}ms:`, {
            error: error.message,
            payment_id: paymentId
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }

    if (paymentError) {
      console.error('[MOBILE-PAYMENT-CALLBACK] Error fetching payment after retries:', {
        error: paymentError,
        code: paymentError.code,
        message: paymentError.message,
        details: paymentError.details,
        payment_id: paymentId,
        attempts: maxRetries
      });
      return NextResponse.json(
        { success: false, message: 'Payment record not found', payment_id: paymentId },
        { status: 404 }
      );
    }

    if (!payment) {
      console.error('[MOBILE-PAYMENT-CALLBACK] Payment record not found:', { payment_id: paymentId });
      return NextResponse.json(
        { success: false, message: 'Payment record not found', payment_id: paymentId },
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

    console.log('[MOBILE-PAYMENT-CALLBACK] Payment record found:', {
      payment_id: payment.id,
      user_id: payment.user_id,
      subscription_id: payment.subscription_id,
      payment_type: payment.payment_type,
      paid: payment.paid,
      invoice_id: payment.invoice_id
    });

    // Get invoice ID from payment record (should be saved from ExecutePayment)
    // The invoiceId from URL is the payment transaction ID, not the InvoiceId
    // We need to use the InvoiceId that was saved in the payment record
    let invoiceIdToCheck = payment.invoice_id;

    // If invoice_id is not in payment record, try to extract from URL parameter
    // MyFatoorah sometimes sends InvoiceId in different formats
    if (!invoiceIdToCheck) {
      // Try to use the paymentId from URL as fallback (might be InvoiceId in some cases)
      if (invoiceId) {
        // Check if it looks like an InvoiceId (numeric) vs payment transaction ID (longer)
        // InvoiceId from ExecutePayment is typically shorter (e.g., 6392471)
        // Payment transaction IDs are longer (e.g., 07076392471322677873)
        // If it's a long number, it's likely a transaction ID, not InvoiceId
        const isLikelyInvoiceId = invoiceId.length < 15 && /^\d+$/.test(invoiceId);
        if (isLikelyInvoiceId) {
          invoiceIdToCheck = invoiceId;
          console.warn('[PAYMENT-CALLBACK] Using invoiceId from URL as fallback:', invoiceIdToCheck);
        }
      }
    }

    if (!invoiceIdToCheck) {
      console.error('[MOBILE-PAYMENT-CALLBACK] No invoice ID found:', {
        payment_invoice_id: payment.invoice_id,
        provided_invoice_id: invoiceId,
        payment_id: paymentId
      });
      return NextResponse.json(
        { success: false, message: 'No invoice ID found for this payment' },
        { status: 400 }
      );
    }


    console.log('[MOBILE-PAYMENT-CALLBACK] Checking payment status with MyFatoorah:', {
      invoice_id: invoiceIdToCheck,
      payment_id: paymentId,
      provided_invoice_id: invoiceId
    });


    // Check payment status with MyFatoorah using InvoiceId
    let statusResult = await getPaymentStatus(invoiceIdToCheck, true, 'InvoiceId');

    // If that fails and we have a different ID from URL, try as PaymentId
    if (!statusResult.success && invoiceId && invoiceId !== invoiceIdToCheck) {
      console.log('[PAYMENT-CALLBACK] Trying PaymentId format:', invoiceId);
      statusResult = await getPaymentStatus(invoiceId, true, 'PaymentId');
    }

    console.log('[MOBILE-PAYMENT-CALLBACK] Payment status result:', {
      success: statusResult.success,
      status: statusResult.status,
      invoice_id: invoiceIdToCheck,
      fullResult: statusResult
    });


    // Check if payment is confirmed as paid
    // MyFatoorah returns status as 'Paid' for successful payments
    // Also check for other possible success statuses
    const paidStatuses = ['Paid', 'paid', 'PAID', 'DuplicatePayment'];
    let isPaid = statusResult.success && paidStatuses.includes(statusResult.status);

    // If status check succeeded but status isn't explicitly 'Paid', check InvoiceStatus
    if (statusResult.success && !isPaid && statusResult.invoiceStatus) {
      const invoiceStatusLower = String(statusResult.invoiceStatus).toLowerCase();
      if (invoiceStatusLower === 'paid' || invoiceStatusLower === 'duplicatepayment') {
        isPaid = true;
        console.log('[MOBILE-PAYMENT-CALLBACK] Payment confirmed via invoiceStatus:', statusResult.invoiceStatus);
      }

    }

    // If status check failed entirely but callback was triggered, treat as paid
    // MyFatoorah only triggers the callback when payment is processed
    if (!isPaid && !statusResult.success && invoiceIdToCheck) {
      console.warn('[MOBILE-PAYMENT-CALLBACK] Payment status check failed:', {
        statusResult,
        invoice_id: invoiceIdToCheck,
        payment_id: paymentId
      });
      // Don't auto-treat as paid for mobile — return the actual status
    }


    if (isPaid) {
      console.log('[MOBILE-PAYMENT-CALLBACK] Payment confirmed as paid, updating records');


      // Payment successful - update records
      const updatePromises = [];

      // Update payment record
      updatePromises.push(
        supabase
          .from('membership_payments')
          .update({
            paid: true,
            paid_at: new Date().toISOString(),
            payment_gateway: 'myfatoorah'
          })
          .eq('id', paymentId)
      );

      // Update subscription
      if (payment.subscription_id) {
        const subscriptionUpdates = {};

        if (payment.payment_type === 'subscription_registration') {
          subscriptionUpdates.registration_paid = true;
          subscriptionUpdates.registration_payment_id = paymentId;
        } else if (payment.payment_type === 'subscription_annual' || payment.payment_type === 'subscription_renewal') {
          subscriptionUpdates.annual_paid = true;
          subscriptionUpdates.annual_payment_id = paymentId;
        } else if (payment.payment_type === 'subscription_combined') {
          // Combined payment - mark both registration and annual as paid
          subscriptionUpdates.registration_paid = true;
          subscriptionUpdates.annual_paid = true;
          subscriptionUpdates.registration_payment_id = paymentId;
          subscriptionUpdates.annual_payment_id = paymentId;
          console.log('[MOBILE-PAYMENT-CALLBACK] Combined payment - marking both registration and annual as paid');

          // Also mark any other unpaid payments for this subscription as paid
          const { data: otherPayments } = await supabase
            .from('membership_payments')
            .select('id')
            .eq('subscription_id', payment.subscription_id)
            .eq('paid', false)
            .neq('id', paymentId);

          if (otherPayments && otherPayments.length > 0) {
            for (const otherPayment of otherPayments) {
              updatePromises.push(
                supabase
                  .from('membership_payments')
                  .update({
                    paid: true,
                    paid_at: new Date().toISOString(),
                    payment_gateway: 'myfatoorah',
                    notes: 'Marked paid as part of combined payment'
                  })
                  .eq('id', otherPayment.id)
              );
            }
            console.log('[MOBILE-PAYMENT-CALLBACK] Marking additional payments as paid:', otherPayments.map(p => p.id));
          }
        }

        // Get subscription details to check if fully paid
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select(`
              *,
              subscription_plan:subscription_plans (*)
            `)
          .eq('id', payment.subscription_id)
          .single();

        if (subscription) {
          // Determine if account should be activated
          let shouldActivate = false;

          if (payment.payment_type === 'subscription_registration' || payment.payment_type === 'subscription_combined') {
            // For registration or combined payments, always activate the account after payment
            // User can pay annual fee later, but should be able to login after registration payment
            shouldActivate = true;
            console.log('[MOBILE-PAYMENT-CALLBACK] Registration/Combined payment confirmed - activating account');
          } else if (payment.payment_type === 'subscription_annual' || payment.payment_type === 'subscription_renewal') {
            // For annual payments, activate only if registration is already paid/waived
            const registrationPaidOrWaived = subscription.registration_paid || subscription.subscription_plan?.registration_waived;
            shouldActivate = registrationPaidOrWaived || subscription.status === 'active';
            console.log('[MOBILE-PAYMENT-CALLBACK] Annual payment confirmed - checking if should activate:', {
              registrationPaidOrWaived,
              currentStatus: subscription.status,
              shouldActivate
            });
          }

          // Handle renewal payments - new expiry = old_expiry + multiplier years
          // E.g., expired June 2022, 3.7 years overdue → multiplier=4 → new expiry = June 2022 + 4 = June 2026
          // This gives the member remaining months from the last year they paid for
          if (payment.payment_type === 'subscription_renewal') {
            // Fetch user's actual membership_expiry_date
            const { data: userData } = await supabase
              .from('users')
              .select('membership_expiry_date')
              .eq('id', payment.user_id)
              .single();

            const userExpiryDate = userData?.membership_expiry_date;
            const oldExpiry = userExpiryDate
              ? new Date(userExpiryDate)
              : (subscription.expires_at ? new Date(subscription.expires_at) : new Date());

            // Calculate overdue years to determine multiplier
            const nowDate = new Date();
            const overdueMs = nowDate.getTime() - oldExpiry.getTime();
            const overdueYears = overdueMs > 0 ? overdueMs / (365.25 * 24 * 60 * 60 * 1000) : 0;
            const feeMultiplier = overdueYears > 0 ? Math.ceil(overdueYears) : 1;

            // New expiry = old expiry + multiplier years
            const newExpiryDate = new Date(oldExpiry);
            newExpiryDate.setFullYear(newExpiryDate.getFullYear() + feeMultiplier);
            subscriptionUpdates.expires_at = newExpiryDate.toISOString();
            console.log('[MOBILE-PAYMENT-CALLBACK] Renewal payment - setting new expiry date:', {
              old_membership_expiry: userExpiryDate,
              overdue_years: overdueYears.toFixed(2),
              fee_multiplier: feeMultiplier,
              new_expiry: newExpiryDate.toISOString(),
              note: 'New expiry = old expiry + multiplier years'
            });

          }

          // Also check if subscription will be fully paid after this payment
          const willBeFullyPaid =
            payment.payment_type === 'subscription_combined' || // Combined payment pays everything
            (payment.payment_type === 'subscription_registration' && (subscription.annual_paid || subscription.subscription_plan?.annual_waived)) ||
            ((payment.payment_type === 'subscription_annual' || payment.payment_type === 'subscription_renewal') && (subscription.registration_paid || subscription.subscription_plan?.registration_waived));

          // Activate if should activate OR if fully paid OR if already active
          if (shouldActivate || willBeFullyPaid || subscription.status === 'active') {
            subscriptionUpdates.status = 'active';

            // Determine expiry date (use new expiry from renewal if applicable)
            const finalExpiryDate = subscriptionUpdates.expires_at || subscription.expires_at;

            // Update user's membership and activate account if it was pending
            updatePromises.push(
              supabase
                .from('users')
                .update({
                  current_subscription_plan_id: subscription.subscription_plan_id,
                  current_subscription_plan_name: subscription.subscription_plan_name,
                  membership_type: subscription.subscription_plan?.registration_waived && subscription.subscription_plan?.annual_waived ? 'free' : 'paid',
                  membership_expiry_date: finalExpiryDate,
                  membership_status: 'active' // Activate account after payment confirmation
                })
                .eq('id', payment.user_id)
            );

            console.log('[MOBILE-PAYMENT-CALLBACK] User account will be activated:', {
              user_id: payment.user_id,
              reason: shouldActivate ? 'payment_type_requires_activation' : willBeFullyPaid ? 'fully_paid' : 'already_active',
              expiry_date: finalExpiryDate
            });
          } else {
            console.log('[MOBILE-PAYMENT-CALLBACK] Account not activated - waiting for additional payments:', {
              payment_type: payment.payment_type,
              registration_paid: subscription.registration_paid,
              annual_paid: subscription.annual_paid,
              registration_waived: subscription.subscription_plan?.registration_waived,
              annual_waived: subscription.subscription_plan?.annual_waived
            });

          }

          if (Object.keys(subscriptionUpdates).length > 0) {
            updatePromises.push(
              supabase
                .from('user_subscriptions')
                .update(subscriptionUpdates)
                .eq('id', payment.subscription_id)
            );
          }
        }
      }

      const updateResults = await Promise.all(updatePromises);

      // Check for update errors
      const updateErrors = updateResults.filter(result => result.error);
      if (updateErrors.length > 0) {
        console.error('[MOBILE-PAYMENT-CALLBACK] Some updates failed:', {
          errors: updateErrors.map(e => e.error),
          payment_id: paymentId
        });
      }

      console.log('[MOBILE-PAYMENT-CALLBACK] Records updated:', {
        payment_id: paymentId,
        updates_count: updateResults.length,
        errors_count: updateErrors.length,
        duration_ms: Date.now() - startTime
      });


      // Log successful payment in payment_history table
      try {
        const { data: subscriptionData } = await supabase
          .from('user_subscriptions')
          .select('*, subscription_plan:subscription_plans(*)')
          .eq('id', payment.subscription_id)
          .single();

        const planName = subscriptionData?.subscription_plan?.name || payment.payment_type || 'Membership';

        await supabase.from('payment_history').insert({
          user_id: payment.user_id,
          payment_id: String(paymentId),
          invoice_id: invoiceIdToCheck,
          amount: payment.amount,
          currency: payment.currency || 'BHD',
          status: 'completed',
          payment_for: payment.payment_type || 'membership_payment',
          details: {
            type: 'membership',
            source: 'mobile',
            subscription_id: payment.subscription_id,
            plan_id: subscriptionData?.subscription_plan_id,
            plan_name: planName,
            user_name: payment.user?.full_name || null,
            user_email: payment.user?.email || null
          }
        });
      } catch (historyError) {
        console.error('[MOBILE-PAYMENT-CALLBACK] Failed to log payment_history record:', historyError);
      }


      // Send payment confirmation email
      try {
        if (payment.user?.email) {
          const { data: subscriptionData } = await supabase
            .from('user_subscriptions')
            .select('*, subscription_plan:subscription_plans(*)')
            .eq('id', payment.subscription_id)
            .single();

          const planName = subscriptionData?.subscription_plan?.name || 'Membership Plan';
          const expiryDate = subscriptionData?.expires_at
            ? new Date(subscriptionData.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'N/A';

          await sendPaymentConfirmationEmail(payment.user.email, {
            name: payment.user.full_name || 'Member',
            plan_name: planName,
            amount: payment.amount,
            payment_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            expiry_date: expiryDate,
            invoice_id: payment.invoice_id
          });

          if (payment.payment_type === 'subscription_registration') {
            await sendWelcomeEmail(payment.user.email, {
              name: payment.user.full_name || 'Member',
              membership_type: planName,
              member_id: payment.user.id
            });
          }

          console.log('[MOBILE-PAYMENT-CALLBACK] Confirmation emails sent to:', payment.user.email);
        }
      } catch (emailError) {
        console.error('[MOBILE-PAYMENT-CALLBACK] Failed to send confirmation email:', emailError);
      }


      // Return JSON success response for mobile
      return NextResponse.json({
        success: true,
        message: 'Payment confirmed successfully',
        payment_status: 'paid',
        payment_id: paymentId,
        subscription_id: payment.subscription_id,
        amount: payment.amount,
        payment_type: payment.payment_type
      });
    } else {
      console.warn('[MOBILE-PAYMENT-CALLBACK] Payment not confirmed as paid:', {
        success: statusResult.success,
        status: statusResult.status,
        message: statusResult.message,
        invoice_id: invoiceIdToCheck,
        payment_id: paymentId
      });

      // Log failed payment attempt
      try {
        await supabase.from('payment_history').insert({
          user_id: payment?.user_id || null,
          payment_id: String(paymentId),
          invoice_id: invoiceIdToCheck,
          amount: payment?.amount || 0,
          currency: payment?.currency || 'BHD',
          status: 'failed',
          payment_for: payment?.payment_type || 'membership_payment',
          details: {
            type: 'membership',
            source: 'mobile',
            subscription_id: payment?.subscription_id || null,
            user_name: payment?.user?.full_name || null,
            user_email: payment?.user?.email || null
          },
          error_message: statusResult?.message || 'Payment not confirmed as paid'
        });
      } catch (historyError) {
        console.error('[MOBILE-PAYMENT-CALLBACK] Failed to log failed payment_history record:', historyError);
      }

      return NextResponse.json({
        success: false,
        message: 'Payment not completed',
        payment_status: statusResult.status || 'unknown',
        payment_id: paymentId
      });
    }

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const duration = Date.now() - startTime;
    console.error('[MOBILE-PAYMENT-CALLBACK] Unexpected error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { success: false, message: 'Payment callback processing failed', error: error.message },
      { status: 500 }
    );
  }

}

