import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/notifications/stats
 * Get notification statistics
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

    // Get total members
    const { count: total } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'member');

    // Get members with device tokens
    const { count: withToken } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'member')
      .not('device_token', 'is', null);

    // Get free members with tokens
    const { count: free } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'member')
      .eq('membership_type', 'free')
      .not('device_token', 'is', null);

    // Get paid members with tokens
    const { count: paid } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'member')
      .eq('membership_type', 'paid')
      .not('device_token', 'is', null);

    return NextResponse.json({
      success: true,
      stats: {
        total: total || 0,
        withToken: withToken || 0,
        free: free || 0,
        paid: paid || 0,
      }
    });

  } catch (error) {
    console.error('Notifications stats error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

