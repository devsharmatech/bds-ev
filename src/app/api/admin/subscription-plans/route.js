import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/subscription-plans
 * Get all subscription plans (admin only)
 */
export async function GET(request) {
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
    
    // Verify admin role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', decoded.user_id)
      .single();

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching subscription plans:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch subscription plans' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plans: plans || []
    });

  } catch (error) {
    console.error('Subscription plans API error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/subscription-plans
 * Create a new subscription plan (admin only)
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
    
    // Verify admin role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', decoded.user_id)
      .single();

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      display_name,
      subtitle,
      description,
      registration_fee,
      annual_fee,
      registration_waived,
      annual_waived,
      is_active,
      sort_order,
      icon_name,
      governance_rights,
      core_benefits
    } = body;

    if (!name || !display_name) {
      return NextResponse.json(
        { success: false, message: 'name and display_name are required' },
        { status: 400 }
      );
    }

    const { data: newPlan, error } = await supabase
      .from('subscription_plans')
      .insert({
        name,
        display_name,
        subtitle: subtitle || null,
        description: description || null,
        registration_fee: registration_fee || 0,
        annual_fee: annual_fee || 0,
        registration_waived: registration_waived || false,
        annual_waived: annual_waived || false,
        is_active: is_active !== undefined ? is_active : true,
        sort_order: sort_order || 0,
        icon_name: icon_name || null,
        governance_rights: governance_rights || [],
        core_benefits: core_benefits || [],
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription plan:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create subscription plan', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription plan created successfully',
      plan: newPlan
    });

  } catch (error) {
    console.error('Create subscription plan error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create subscription plan' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/subscription-plans
 * Update a subscription plan (admin only)
 */
export async function PUT(request) {
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
    
    // Verify admin role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', decoded.user_id)
      .single();

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'plan id is required' },
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const { data: updatedPlan, error } = await supabase
      .from('subscription_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription plan:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update subscription plan', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription plan updated successfully',
      plan: updatedPlan
    });

  } catch (error) {
    console.error('Update subscription plan error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update subscription plan' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/subscription-plans
 * Delete a subscription plan (admin only)
 */
export async function DELETE(request) {
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
    
    // Verify admin role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', decoded.user_id)
      .single();

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const planId = url.searchParams.get('id');

    if (!planId) {
      return NextResponse.json(
        { success: false, message: 'plan id is required' },
        { status: 400 }
      );
    }

    // Check if plan is being used
    const { data: activeSubscriptions } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('subscription_plan_id', planId)
      .eq('status', 'active')
      .limit(1);

    if (activeSubscriptions && activeSubscriptions.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete plan with active subscriptions. Deactivate it instead.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Error deleting subscription plan:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete subscription plan', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription plan deleted successfully'
    });

  } catch (error) {
    console.error('Delete subscription plan error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to delete subscription plan' },
      { status: 500 }
    );
  }
}

