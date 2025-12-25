import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * GET /api/auth/register/pending-payment
 * Get pending payment for a user by email (for registration flow)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, mobile, phone')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get pending subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'pending_payment')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError || !subscription) {
      return NextResponse.json(
        { success: false, message: 'No pending payment found' },
        { status: 404 }
      );
    }

    // Get pending payments
    const { data: payments, error: paymentsError } = await supabase
      .from('membership_payments')
      .select('*')
      .eq('subscription_id', subscription.id)
      .eq('paid', false)
      .order('created_at', { ascending: true });

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
    }

    // Calculate totals
    const registrationPayment = payments?.find(p => p.payment_type === 'subscription_registration');
    const annualPayment = payments?.find(p => p.payment_type === 'subscription_annual');
    
    const registrationFee = registrationPayment?.amount || 0;
    const annualFee = annualPayment?.amount || 0;
    const totalAmount = registrationFee + annualFee;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        mobile: user.mobile || user.phone
      },
      subscription: {
        id: subscription.id,
        plan_name: subscription.subscription_plan_name,
        plan_display_name: subscription.subscription_plan?.display_name,
        status: subscription.status
      },
      payments: {
        registration: registrationPayment ? {
          id: registrationPayment.id,
          amount: registrationPayment.amount,
          currency: registrationPayment.currency
        } : null,
        annual: annualPayment ? {
          id: annualPayment.id,
          amount: annualPayment.amount,
          currency: annualPayment.currency
        } : null
      },
      totals: {
        registration_fee: registrationFee,
        annual_fee: annualFee,
        total_amount: totalAmount
      }
    });

  } catch (error) {
    console.error('Pending payment API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch pending payment' },
      { status: 500 }
    );
  }
}

