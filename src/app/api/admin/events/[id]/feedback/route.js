import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/events/[id]/feedback
 * Get all feedback for a specific event (admin only)
 */
export async function GET(request, { params }) {
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

    const { id: eventId } = await params;

    // Get all feedback for this event
    const { data: feedback, error } = await supabase
      .from('event_feedback')
      .select(`
        *,
        user:users (
          id,
          full_name,
          email,
          membership_code
        ),
        event_member:event_members (
          id,
          token,
          checked_in,
          checked_in_at
        ),
        attendance_log:attendance_logs (
          id,
          scan_time
        ),
        event:events (
          id,
          title,
          slug
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch feedback', error: error },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalFeedback = feedback?.length || 0;
    const averageRating = feedback?.length > 0
      ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.filter(f => f.rating).length
      : 0;
    const ratingDistribution = {
      5: feedback?.filter(f => f.rating === 5).length || 0,
      4: feedback?.filter(f => f.rating === 4).length || 0,
      3: feedback?.filter(f => f.rating === 3).length || 0,
      2: feedback?.filter(f => f.rating === 2).length || 0,
      1: feedback?.filter(f => f.rating === 1).length || 0,
    };

    return NextResponse.json({
      success: true,
      feedback: feedback || [],
      stats: {
        total: totalFeedback,
        averageRating: averageRating.toFixed(1),
        ratingDistribution
      }
    });

  } catch (error) {
    console.error('Admin feedback API error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

