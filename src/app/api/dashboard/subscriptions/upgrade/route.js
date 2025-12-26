import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * POST /api/dashboard/subscriptions/upgrade
 * Initiate subscription upgrade
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;

    const { plan_id, plan_name } = await request.json();

    if (!plan_id || !plan_name) {
      return NextResponse.json(
        { success: false, message: 'plan_id and plan_name are required' },
        { status: 400 }
      );
    }

    // Get the subscription plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { success: false, message: 'Subscription plan not found or inactive' },
        { status: 404 }
      );
    }

    // Get user's current subscription
    const { data: currentSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Check if user is already on this plan
    if (currentSubscription && currentSubscription.subscription_plan_id === plan_id) {
      return NextResponse.json(
        { success: false, message: 'You are already subscribed to this plan' },
        { status: 400 }
      );
    }

    // Check if user has already paid registration fee in any previous subscription
    // This is important: if user was on free plan and upgrades to paid, 
    // they should only pay registration fee if they haven't paid it before
    const { data: previousPaidRegistrations } = await supabase
      .from('membership_payments')
      .select('id, paid, payment_type')
      .eq('user_id', userId)
      .eq('payment_type', 'subscription_registration')
      .eq('paid', true)
      .limit(1);

    const hasPaidRegistrationFee = previousPaidRegistrations && previousPaidRegistrations.length > 0;

    // Calculate fees
    // If user already paid registration fee before, they don't need to pay it again
    const registrationFee = (plan.registration_waived || hasPaidRegistrationFee) ? 0 : plan.registration_fee;
    const annualFee = plan.annual_waived ? 0 : plan.annual_fee;
    const totalAmount = registrationFee + annualFee;

    // If free plan or no fees, activate immediately
    if (plan.name === 'free' || totalAmount === 0) {
      const startDate = new Date();
      const endDate = plan.name === 'free' ? null : new Date(new Date().setFullYear(startDate.getFullYear() + 1));

      // Cancel current subscription if exists
      if (currentSubscription) {
        await supabase
          .from('user_subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', currentSubscription.id);
      }

      // Create new subscription
      const { data: newSubscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          subscription_plan_id: plan_id,
          subscription_plan_name: plan_name,
          status: 'active',
          started_at: startDate.toISOString(),
          expires_at: endDate ? endDate.toISOString() : null,
          registration_paid: plan.registration_waived,
          annual_paid: plan.annual_waived,
          auto_renew: false
        })
        .select()
        .single();

      if (subError) throw subError;

      // Update user's membership
      await supabase
        .from('users')
        .update({
          current_subscription_plan_id: plan_id,
          current_subscription_plan_name: plan_name,
          membership_type: plan_name.toLowerCase(),
          membership_expiry_date: endDate ? endDate.toISOString() : null,
          membership_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      return NextResponse.json({
        success: true,
        message: 'Subscription upgraded successfully',
        subscription: newSubscription
      });
    }

    // For paid plans, create pending subscription and return payment info
    const startDate = new Date();
    const endDate = new Date(new Date().setFullYear(startDate.getFullYear() + 1));

    // Create pending subscription
    // Mark registration as paid if user already paid it before or if it's waived
    const { data: pendingSubscription, error: pendingError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        subscription_plan_id: plan_id,
        subscription_plan_name: plan_name,
        status: 'pending_payment',
        started_at: startDate.toISOString(),
        expires_at: endDate.toISOString(),
        registration_paid: hasPaidRegistrationFee || plan.registration_waived,
        annual_paid: false,
        auto_renew: false
      })
      .select()
      .single();

    if (pendingError) throw pendingError;

    // Create payment records individually to get IDs
    let registrationPaymentId = null;
    let annualPaymentId = null;

    if (registrationFee > 0) {
      const { data: regPayment, error: regPaymentError } = await supabase
        .from('membership_payments')
        .insert({
          user_id: userId,
          payment_type: 'subscription_registration',
          subscription_id: pendingSubscription.id,
          amount: registrationFee,
          currency: 'BHD',
          paid: false,
          reference: `SUB-REG-${pendingSubscription.id.substring(0, 8).toUpperCase()}`
        })
        .select()
        .single();

      if (regPaymentError) {
        console.error('Error creating registration payment:', regPaymentError);
      } else {
        registrationPaymentId = regPayment.id;
      }
    }

    if (annualFee > 0) {
      const { data: annPayment, error: annPaymentError } = await supabase
        .from('membership_payments')
        .insert({
          user_id: userId,
          payment_type: 'subscription_annual',
          subscription_id: pendingSubscription.id,
          amount: annualFee,
          currency: 'BHD',
          paid: false,
          reference: `SUB-ANN-${pendingSubscription.id.substring(0, 8).toUpperCase()}`
        })
        .select()
        .single();

      if (annPaymentError) {
        console.error('Error creating annual payment:', annPaymentError);
      } else {
        annualPaymentId = annPayment.id;
      }
    }

    // Update subscription with payment IDs
    if (registrationPaymentId || annualPaymentId) {
      await supabase
        .from('user_subscriptions')
        .update({
          registration_payment_id: registrationPaymentId,
          annual_payment_id: annualPaymentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', pendingSubscription.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription upgrade initiated. Payment required.',
      subscription: pendingSubscription,
      payment: {
        total_amount: totalAmount,
        registration_fee: registrationFee,
        annual_fee: annualFee,
        currency: 'BHD',
        subscription_id: pendingSubscription.id,
        registration_payment_id: registrationPaymentId,
        annual_payment_id: annualPaymentId
      }
    });

  } catch (error) {
    console.error('Upgrade subscription error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}

