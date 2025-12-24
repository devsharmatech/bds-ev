import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/myfatoorah';
import { redirect } from 'next/navigation';

/**
 * GET /api/payments/subscription/callback
 * Handle MyFatoorah payment callback for subscriptions
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');
    const invoiceId = searchParams.get('paymentId');

    if (!paymentId) {
      return redirect('/member/dashboard/subscriptions?error=invalid_callback');
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('membership_payments')
      .select(`
        *,
        user:users (id, full_name, email)
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return redirect('/member/dashboard/subscriptions?error=payment_not_found');
    }

    // Get invoice ID from payment or use provided one
    const invoiceIdToCheck = payment.invoice_id || invoiceId;

    if (invoiceIdToCheck) {
      // Check payment status with MyFatoorah
      const statusResult = await getPaymentStatus(invoiceIdToCheck, true);

      if (statusResult.success && statusResult.status === 'Paid') {
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
              
              // Update user's membership
              updatePromises.push(
                supabase
                  .from('users')
                  .update({
                    current_subscription_plan_id: subscription.subscription_plan_id,
                    current_subscription_plan_name: subscription.subscription_plan_name,
                    membership_type: subscription.subscription_plan_name?.toLowerCase(),
                    membership_expiry_date: subscription.expires_at,
                    membership_status: 'active',
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

        await Promise.all(updatePromises);

        return redirect('/member/dashboard/subscriptions?success=payment_completed');
      } else {
        return redirect('/member/dashboard/subscriptions?error=payment_failed');
      }
    }

    return redirect('/member/dashboard/subscriptions?error=invalid_callback');
  } catch (error) {
    console.error('Subscription payment callback error:', error);
    return redirect('/member/dashboard/subscriptions?error=payment_error');
  }
}

