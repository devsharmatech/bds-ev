import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * GET /api/dashboard/subscriptions
 * Get all available subscription plans (public) and current user's subscription (if logged in)
 */
export async function GET(request) {
  try {
    // Get all active subscription plans (PUBLIC - no auth required)
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (plansError) {
      console.error('Error fetching subscription plans:', plansError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch subscription plans' },
        { status: 500 }
      );
    }

    // Check if user is logged in
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;

    // If not logged in, return only plans
    if (!token) {
      return NextResponse.json({
        success: true,
        plans: plans || [],
        currentSubscription: null,
        subscriptionHistory: [],
        userMembership: null
      });
    }

    // User is logged in - fetch user-specific data
    let userId = null;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.user_id;
    } catch (error) {
      // Invalid token - return only plans
      return NextResponse.json({
        success: true,
        plans: plans || [],
        currentSubscription: null,
        subscriptionHistory: [],
        userMembership: null
      });
    }

    // Get user's current subscription
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        current_subscription_plan_id,
        current_subscription_plan_name,
        membership_expiry_date,
        membership_status
      `)
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
    }

    // Get user's active subscription
    const { data: activeSubscription } = await supabase
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

    // Get user's subscription history
    const { data: subscriptionHistory } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans (*)
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      plans: plans || [],
      currentSubscription: activeSubscription || null,
      subscriptionHistory: subscriptionHistory || [],
      userMembership: {
        plan_id: user?.current_subscription_plan_id,
        plan_name: user?.current_subscription_plan_name,
        expiry_date: user?.membership_expiry_date,
        status: user?.membership_status
      }
    });

  } catch (error) {
    console.error('Subscriptions API error:', error);
    
    // Even on error, try to return plans if available (for public access)
    try {
      const { data: plans } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      return NextResponse.json({
        success: true,
        plans: plans || [],
        currentSubscription: null,
        subscriptionHistory: [],
        userMembership: null
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }
  }
}

