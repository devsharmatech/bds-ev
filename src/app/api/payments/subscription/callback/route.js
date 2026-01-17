import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/myfatoorah';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { sendPaymentConfirmationEmail, sendWelcomeEmail } from '@/lib/email';

/**
 * GET /api/payments/subscription/callback
 * Handle MyFatoorah payment callback for subscriptions
 */
export async function GET(request) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');
    const invoiceId = searchParams.get('paymentId');
    const redirectTo = searchParams.get('redirect_to');

    console.log('[PAYMENT-CALLBACK] Callback received:', {
      payment_id: paymentId,
      paymentId: invoiceId,
      redirect_to: redirectTo,
      allParams: Object.fromEntries(searchParams.entries()),
      timestamp: new Date().toISOString()
    });

    if (!paymentId) {
      console.error('[PAYMENT-CALLBACK] Missing payment_id parameter');
      return redirect('/member/dashboard/subscriptions?error=invalid_callback');
    }

    // Get payment record with retry logic for connection timeouts
    console.log('[PAYMENT-CALLBACK] Fetching payment record:', { payment_id: paymentId });
    
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
      console.error('[PAYMENT-CALLBACK] Error fetching payment after retries:', {
        error: paymentError,
        code: paymentError.code,
        message: paymentError.message,
        details: paymentError.details,
        payment_id: paymentId,
        attempts: maxRetries
      });
      return redirect('/member/dashboard/subscriptions?error=payment_not_found');
    }

    if (!payment) {
      console.error('[PAYMENT-CALLBACK] Payment record not found:', { payment_id: paymentId });
      return redirect('/member/dashboard/subscriptions?error=payment_not_found');
    }

    console.log('[PAYMENT-CALLBACK] Payment record found:', {
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
      console.error('[PAYMENT-CALLBACK] No invoice ID found:', {
        payment_invoice_id: payment.invoice_id,
        provided_invoice_id: invoiceId,
        payment_id: paymentId
      });
      const cookieStore = await cookies();
      const token = cookieStore.get('bds_token')?.value;
      if (token) {
        return redirect('/member/dashboard/subscriptions?error=invalid_callback');
      } else {
        return redirect('/auth/login?error=invalid_callback');
      }
    }

    console.log('[PAYMENT-CALLBACK] Checking payment status with MyFatoorah:', {
      invoice_id: invoiceIdToCheck,
      payment_id: paymentId,
      url_invoice_id: invoiceId
    });

    // Check payment status with MyFatoorah using InvoiceId
    let statusResult = await getPaymentStatus(invoiceIdToCheck, true, 'InvoiceId');
    
    // If that fails and we have a different ID from URL, try as PaymentId
    if (!statusResult.success && invoiceId && invoiceId !== invoiceIdToCheck) {
      console.log('[PAYMENT-CALLBACK] Trying PaymentId format:', invoiceId);
      statusResult = await getPaymentStatus(invoiceId, true, 'PaymentId');
    }

    console.log('[PAYMENT-CALLBACK] Payment status result:', {
      success: statusResult.success,
      status: statusResult.status,
      invoice_id: invoiceIdToCheck,
      fullResult: statusResult
    });

    // Check if payment is confirmed as paid
    // MyFatoorah returns status as 'Paid' for successful payments
    // Also check for other possible success statuses
    const isPaid = statusResult.success && (
      statusResult.status === 'Paid' || 
      statusResult.status === 'paid' ||
      statusResult.status === 'PAID'
    );

    // If status check failed but we have invoice_id, log warning but continue
    // (MyFatoorah callback being triggered is usually a good sign payment was processed)
    if (!statusResult.success) {
      console.warn('[PAYMENT-CALLBACK] Payment status check failed, but callback was triggered:', {
        statusResult,
        invoice_id: invoiceIdToCheck,
        payment_id: paymentId,
        note: 'Proceeding with caution - callback trigger suggests payment may have been processed'
      });
    }

    if (isPaid) {
          console.log('[PAYMENT-CALLBACK] Payment confirmed as paid, updating records');
          
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
            console.log('[PAYMENT-CALLBACK] Combined payment - marking both registration and annual as paid');
            
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
              console.log('[PAYMENT-CALLBACK] Marking additional payments as paid:', otherPayments.map(p => p.id));
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
              console.log('[PAYMENT-CALLBACK] Registration/Combined payment confirmed - activating account');
            } else if (payment.payment_type === 'subscription_annual' || payment.payment_type === 'subscription_renewal') {
              // For annual payments, activate only if registration is already paid/waived
              const registrationPaidOrWaived = subscription.registration_paid || subscription.subscription_plan?.registration_waived;
              shouldActivate = registrationPaidOrWaived || subscription.status === 'active';
              console.log('[PAYMENT-CALLBACK] Annual payment confirmed - checking if should activate:', {
                registrationPaidOrWaived,
                currentStatus: subscription.status,
                shouldActivate
              });
            }

            // Handle renewal payments - extend expiry date
            if (payment.payment_type === 'subscription_renewal') {
              const currentExpiry = subscription.expires_at 
                ? new Date(subscription.expires_at)
                : new Date();
              const newExpiryDate = new Date(currentExpiry);
              newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
              subscriptionUpdates.expires_at = newExpiryDate.toISOString();
              console.log('[PAYMENT-CALLBACK] Renewal payment - extending expiry date:', {
                current_expiry: subscription.expires_at,
                new_expiry: newExpiryDate.toISOString()
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
              
              console.log('[PAYMENT-CALLBACK] User account will be activated:', {
                user_id: payment.user_id,
                reason: shouldActivate ? 'payment_type_requires_activation' : willBeFullyPaid ? 'fully_paid' : 'already_active',
                expiry_date: finalExpiryDate
              });
            } else {
              console.log('[PAYMENT-CALLBACK] Account not activated - waiting for additional payments:', {
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
            console.error('[PAYMENT-CALLBACK] Some updates failed:', {
              errors: updateErrors.map(e => e.error),
              payment_id: paymentId
            });
          }
          
          console.log('[PAYMENT-CALLBACK] Records updated:', {
            payment_id: paymentId,
            updates_count: updateResults.length,
            errors_count: updateErrors.length,
            duration_ms: Date.now() - startTime,
            update_results: updateResults.map((result, index) => ({
              index,
              success: !result.error,
              error: result.error ? {
                code: result.error.code,
                message: result.error.message
              } : null
            }))
          });

          // Send payment confirmation email
          try {
            if (payment.user?.email) {
              // Get subscription details for email
              const { data: subscriptionData } = await supabase
                .from('user_subscriptions')
                .select('*, subscription_plan:subscription_plans(*)')
                .eq('id', payment.subscription_id)
                .single();

              const planName = subscriptionData?.subscription_plan?.name || 'Membership Plan';
              const expiryDate = subscriptionData?.expires_at 
                ? new Date(subscriptionData.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'N/A';

              // Send payment confirmation email
              await sendPaymentConfirmationEmail(payment.user.email, {
                name: payment.user.full_name || 'Member',
                plan_name: planName,
                amount: payment.amount,
                payment_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                expiry_date: expiryDate,
                invoice_id: payment.invoice_id
              });

              // If this is a registration payment, also send welcome email
              if (payment.payment_type === 'subscription_registration') {
                await sendWelcomeEmail(payment.user.email, {
                  name: payment.user.full_name || 'Member',
                  membership_type: planName,
                  member_id: payment.user.id
                });
              }

              console.log('[PAYMENT-CALLBACK] Confirmation emails sent to:', payment.user.email);
            }
          } catch (emailError) {
            console.error('[PAYMENT-CALLBACK] Failed to send confirmation email:', emailError);
            // Don't fail the callback if email fails
          }

          // Always redirect to login page with query parameters
          // Login page will handle navigation based on redirect_to parameter
          let loginUrl = '/auth/login?success=payment_completed&message=' + encodeURIComponent('Payment completed successfully! Please login to access your account.');
          
          // Add redirect_to parameter if provided
          if (redirectTo) {
            loginUrl += `&redirect_to=${encodeURIComponent(redirectTo)}`;
          }
          
          console.log('[PAYMENT-CALLBACK] Redirecting to login page:', loginUrl);
          return redirect(loginUrl);
      } else {
        console.warn('[PAYMENT-CALLBACK] Payment not confirmed as paid:', {
          success: statusResult.success,
          status: statusResult.status,
          message: statusResult.message,
          invoice_id: invoiceIdToCheck,
          payment_id: paymentId
        });
        
        // Payment failed - redirect to login page
        let loginUrl = '/auth/login?error=payment_failed&message=' + encodeURIComponent('Payment was not completed. Please try again.');
        
        // Add redirect_to parameter if provided
        if (redirectTo) {
          loginUrl += `&redirect_to=${encodeURIComponent(redirectTo)}`;
        }
        
        return redirect(loginUrl);
      }
  } catch (error) {
    // Next.js redirect() throws a NEXT_REDIRECT error internally - this is expected behavior
    // We should not catch it as an error, but if we do, we need to re-throw it
    if (error.message === 'NEXT_REDIRECT' || error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors so Next.js can handle them
    }

    const duration = Date.now() - startTime;
    console.error('[PAYMENT-CALLBACK] Unexpected error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      },
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });
    
    // Error occurred - redirect to login page
    try {
      let loginUrl = '/auth/login?error=payment_error&message=' + encodeURIComponent('An error occurred during payment processing. Please try again.');
      
      // Add redirect_to parameter if provided
      if (redirectTo) {
        loginUrl += `&redirect_to=${encodeURIComponent(redirectTo)}`;
      }
      
      return redirect(loginUrl);
    } catch (cookieError) {
      // If cookieError is also a redirect, re-throw it
      if (cookieError.message === 'NEXT_REDIRECT' || cookieError.digest?.startsWith('NEXT_REDIRECT')) {
        throw cookieError;
      }
      console.error('[PAYMENT-CALLBACK] Error:', cookieError);
      return redirect('/auth/login?error=payment_error');
    }
  }
}

