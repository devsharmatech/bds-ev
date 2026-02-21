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

    // Fetch user's actual membership_expiry_date for overdue calculation
    const { data: userData } = await supabase
      .from('users')
      .select('membership_expiry_date')
      .eq('id', userId)
      .single();

    const userExpiryDate = userData?.membership_expiry_date;
    const baseExpiry = userExpiryDate
      ? new Date(userExpiryDate)
      : (currentSubscription.expires_at ? new Date(currentSubscription.expires_at) : new Date());

    // Calculate overdue duration in years
    const now = new Date();
    const overdueMs = now.getTime() - baseExpiry.getTime();
    const overdueYears = overdueMs > 0 ? overdueMs / (365.25 * 24 * 60 * 60 * 1000) : 0;

    // Determine fee multiplier: number of missed years (rounded up), minimum 1
    const feeMultiplier = overdueYears > 0 ? Math.ceil(overdueYears) : 1;

    // Calculate renewal fees
    const baseAnnualFee = plan.annual_waived ? 0 : plan.annual_fee;
    const annualFee = baseAnnualFee * feeMultiplier;

    console.log('[RENEW] Overdue calculation:', {
      user_expiry: userExpiryDate,
      overdue_years: overdueYears.toFixed(2),
      fee_multiplier: feeMultiplier,
      base_fee: baseAnnualFee,
      total_fee: annualFee
    });

    // If free or waived, renew immediately
    if (plan.name === 'free' || annualFee === 0) {
      // New expiry is always today + 1 year
      const newExpiryDate = new Date();
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);

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

    // Calculate the new expiry date for the payment record
    const newExpiryDate = new Date(baseExpiry);
    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + feeMultiplier);

    // For paid renewals, create payment record with multiplied amount
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('membership_payments')
      .insert({
        user_id: userId,
        payment_type: 'subscription_renewal',
        subscription_id: currentSubscription.id,
        amount: annualFee,
        currency: 'BHD',
        paid: false,
        reference: `SUB-RENEW-${currentSubscription.id.substring(0, 8).toUpperCase()}`,
        membership_start_date: baseExpiry.toISOString(),
        membership_end_date: newExpiryDate.toISOString(),
        notes: feeMultiplier > 1
          ? `Membership renewal - ${plan.display_name || plan.name}. Base fee: ${baseAnnualFee} BHD × ${feeMultiplier}x multiplier (${overdueYears.toFixed(1)} years overdue) = ${annualFee} BHD`
          : `Membership renewal - ${plan.display_name || plan.name}. Annual fee: ${annualFee} BHD`
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
        base_amount: baseAnnualFee,
        fee_multiplier: feeMultiplier,
        overdue_years: Math.floor(overdueYears),
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

