import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * POST /api/dashboard/subscriptions/renew
 * Renew current subscription
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

    // Get user's current active subscription; if none, fall back to most recent subscription
    let { data: currentSubscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError) {
      console.error('Error fetching active subscription:', subError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    if (!currentSubscription) {
      // No active subscription found, try to fetch the most recent subscription regardless of status
      const { data: lastSub, error: lastErr } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plan:subscription_plans (*)
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastErr) {
        console.error('Error fetching last subscription:', lastErr);
        return NextResponse.json(
          { success: false, message: 'Failed to fetch subscription' },
          { status: 500 }
        );
      }

      if (!lastSub) {
        return NextResponse.json(
          { success: false, message: 'No subscription found. Please upgrade instead.' },
          { status: 404 }
        );
      }

      // Use the last subscription as the target for renewal
      currentSubscription = lastSub;
    }

    const plan = currentSubscription.subscription_plan;

    // Calculate renewal fees (only annual fee for renewal)
    const annualFee = plan.annual_waived ? 0 : plan.annual_fee;

    // If free or waived, renew immediately
    if (plan.name === 'free' || annualFee === 0) {
      const newExpiryDate = currentSubscription.expires_at 
        ? new Date(new Date(currentSubscription.expires_at).setFullYear(new Date(currentSubscription.expires_at).getFullYear() + 1))
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1));

      // Update subscription
      const { data: renewedSubscription, error: renewError } = await supabase
        .from('user_subscriptions')
        .update({
          expires_at: newExpiryDate.toISOString(),
          annual_paid: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSubscription.id)
        .select()
        .single();

      if (renewError) throw renewError;

      // Update user's membership expiry
      await supabase
        .from('users')
        .update({
          membership_expiry_date: newExpiryDate.toISOString(),
          membership_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      return NextResponse.json({
        success: true,
        message: 'Subscription renewed successfully',
        subscription: renewedSubscription
      });
    }

    // For paid renewals, create payment record
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('membership_payments')
      .insert({
        user_id: userId,
        payment_type: 'subscription_renewal',
        subscription_id: currentSubscription.id,
        amount: annualFee,
        currency: 'BHD',
        paid: false,
        reference: `SUB-RENEW-${currentSubscription.id.substring(0, 8).toUpperCase()}`
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return NextResponse.json(
        { success: false, message: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Renewal initiated. Payment required.',
      subscription: currentSubscription,
      payment: {
        amount: annualFee,
        currency: 'BHD',
        payment_id: paymentRecord.id,
        subscription_id: currentSubscription.id
      }
    });

  } catch (error) {
    console.error('Renew subscription error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to renew subscription' },
      { status: 500 }
    );
  }
}

