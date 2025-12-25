import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/myfatoorah';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

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

    console.log('[PAYMENT-CALLBACK] Callback received:', {
      payment_id: paymentId,
      paymentId: invoiceId,
      allParams: Object.fromEntries(searchParams.entries()),
      timestamp: new Date().toISOString()
    });

    if (!paymentId) {
      console.error('[PAYMENT-CALLBACK] Missing payment_id parameter');
      return redirect('/member/dashboard/subscriptions?error=invalid_callback');
    }

    // Get payment record
    console.log('[PAYMENT-CALLBACK] Fetching payment record:', { payment_id: paymentId });
    const { data: payment, error: paymentError } = await supabase
      .from('membership_payments')
      .select(`
        *,
        user:users (id, full_name, email)
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError) {
      console.error('[PAYMENT-CALLBACK] Error fetching payment:', {
        error: paymentError,
        code: paymentError.code,
        message: paymentError.message,
        details: paymentError.details,
        payment_id: paymentId
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

    // Get invoice ID from payment or use provided one
    const invoiceIdToCheck = payment.invoice_id || invoiceId;

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
      payment_id: paymentId
    });

    // Check payment status with MyFatoorah
    const statusResult = await getPaymentStatus(invoiceIdToCheck, true);

    console.log('[PAYMENT-CALLBACK] Payment status result:', {
      success: statusResult.success,
      status: statusResult.status,
      invoice_id: invoiceIdToCheck
    });

    if (statusResult.success && statusResult.status === 'Paid') {
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
                payment_gateway: 'myfatoorah',
                payment_reference: invoiceIdToCheck,
                updated_at: new Date().toISOString()
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
            const willBeFullyPaid = 
              (payment.payment_type === 'subscription_registration' && (subscription.annual_paid || subscription.subscription_plan?.annual_waived)) ||
              ((payment.payment_type === 'subscription_annual' || payment.payment_type === 'subscription_renewal') && (subscription.registration_paid || subscription.subscription_plan?.registration_waived));

            if (willBeFullyPaid || subscription.status === 'active') {
              subscriptionUpdates.status = 'active';
              
              // Update user's membership and activate account if it was pending
              updatePromises.push(
                supabase
                  .from('users')
                  .update({
                    current_subscription_plan_id: subscription.subscription_plan_id,
                    current_subscription_plan_name: subscription.subscription_plan_name,
                    membership_type: subscription.subscription_plan?.registration_waived && subscription.subscription_plan?.annual_waived ? 'free' : 'paid',
                    membership_expiry_date: subscription.expires_at,
                    membership_status: 'active', // Activate account after payment confirmation
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', payment.user_id)
              );
            }

            if (Object.keys(subscriptionUpdates).length > 0) {
              updatePromises.push(
                supabase
                  .from('user_subscriptions')
                  .update({
                    ...subscriptionUpdates,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', payment.subscription_id)
              );
            }
          }
        }

          const updateResults = await Promise.all(updatePromises);
          
          console.log('[PAYMENT-CALLBACK] Records updated successfully:', {
            payment_id: paymentId,
            updates_count: updateResults.length,
            duration_ms: Date.now() - startTime
          });

          // Check if user is logged in (registration flow vs member dashboard flow)
          const cookieStore = await cookies();
          const token = cookieStore.get('bds_token')?.value;
          
          if (token) {
            // User is logged in - redirect to member dashboard
            console.log('[PAYMENT-CALLBACK] Redirecting logged-in user to dashboard');
            return redirect('/member/dashboard/subscriptions?success=payment_completed');
          } else {
            // User is not logged in (registration flow) - redirect to login
            console.log('[PAYMENT-CALLBACK] Redirecting unauthenticated user to login');
            return redirect('/auth/login?success=payment_completed&message=Registration payment completed. Please login to access your account.');
          }
      } else {
        console.warn('[PAYMENT-CALLBACK] Payment not confirmed as paid:', {
          success: statusResult.success,
          status: statusResult.status,
          message: statusResult.message,
          invoice_id: invoiceIdToCheck,
          payment_id: paymentId
        });
        
        // Payment failed - check if user is logged in
        const cookieStore = await cookies();
        const token = cookieStore.get('bds_token')?.value;
        
        if (token) {
          return redirect('/member/dashboard/subscriptions?error=payment_failed');
        } else {
          return redirect('/auth/login?error=payment_failed&message=Payment was not completed. Please try again.');
        }
      }
  } catch (error) {
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
    
    // Check if user is logged in
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('bds_token')?.value;
      
      if (token) {
        return redirect('/member/dashboard/subscriptions?error=payment_error');
      } else {
        return redirect('/auth/login?error=payment_error');
      }
    } catch (cookieError) {
      console.error('[PAYMENT-CALLBACK] Error accessing cookies:', cookieError);
      return redirect('/auth/login?error=payment_error');
    }
  }
}

