import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * GET /api/dashboard/feedback
 * Get feedback for the logged-in member or for a specific event
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
    const userId = decoded.user_id;

    const url = new URL(request.url);
    const eventId = url.searchParams.get('event_id');
    const eventMemberId = url.searchParams.get('event_member_id');

    // Build query
    let query = supabase
      .from('event_feedback')
      .select(`
        *,
        event:events (
          id,
          title,
          slug,
          start_datetime,
          end_datetime
        ),
        event_member:event_members (
          id,
          token,
          checked_in
        ),
        attendance_log:attendance_logs (
          id,
          scan_time
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (eventMemberId) {
      query = query.eq('event_member_id', eventMemberId);
    }

    const { data: feedback, error } = await query;

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      feedback: feedback || []
    });

  } catch (error) {
    console.error('Feedback API error:', error);
    
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

/**
 * POST /api/dashboard/feedback
 * Create new feedback
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

    const { event_member_id, event_id, attendance_log_id, rating, feedback_text, feedback_date } = await request.json();

    if (!event_member_id || !event_id || !feedback_text) {
      return NextResponse.json(
        { success: false, message: 'event_member_id, event_id, and feedback_text are required' },
        { status: 400 }
      );
    }

    // Verify event_member belongs to user
    const { data: eventMember, error: memberError } = await supabase
      .from('event_members')
      .select('id, user_id, checked_in')
      .eq('id', event_member_id)
      .eq('user_id', userId)
      .single();

    if (memberError || !eventMember) {
      return NextResponse.json(
        { success: false, message: 'Event member not found or unauthorized' },
        { status: 404 }
      );
    }

    if (!eventMember.checked_in) {
      return NextResponse.json(
        { success: false, message: 'You must check in to the event before submitting feedback' },
        { status: 400 }
      );
    }

    // Check if feedback already exists for this date
    const feedbackDate = feedback_date || new Date().toISOString().split('T')[0];
    const { data: existingFeedback } = await supabase
      .from('event_feedback')
      .select('id')
      .eq('event_member_id', event_member_id)
      .eq('feedback_date', feedbackDate)
      .maybeSingle();

    if (existingFeedback) {
      return NextResponse.json(
        { success: false, message: 'Feedback already exists for this date. Please update existing feedback.' },
        { status: 409 }
      );
    }

    // Create feedback
    const { data: newFeedback, error: insertError } = await supabase
      .from('event_feedback')
      .insert({
        event_member_id,
        event_id,
        user_id: userId,
        attendance_log_id: attendance_log_id || null,
        rating: rating || null,
        feedback_text,
        feedback_date: feedbackDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        event:events (
          id,
          title,
          slug
        )
      `)
      .single();

    if (insertError) {
      console.error('Error creating feedback:', insertError);
      return NextResponse.json(
        { success: false, message: 'Failed to create feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: newFeedback
    });

  } catch (error) {
    console.error('Create feedback error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/dashboard/feedback
 * Update existing feedback
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
    const userId = decoded.user_id;

    const { feedback_id, rating, feedback_text } = await request.json();

    if (!feedback_id) {
      return NextResponse.json(
        { success: false, message: 'feedback_id is required' },
        { status: 400 }
      );
    }

    if (!feedback_text) {
      return NextResponse.json(
        { success: false, message: 'feedback_text is required' },
        { status: 400 }
      );
    }

    // Verify feedback belongs to user
    const { data: existingFeedback, error: fetchError } = await supabase
      .from('event_feedback')
      .select('id, user_id')
      .eq('id', feedback_id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingFeedback) {
      return NextResponse.json(
        { success: false, message: 'Feedback not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update feedback
    const { data: updatedFeedback, error: updateError } = await supabase
      .from('event_feedback')
      .update({
        rating: rating || null,
        feedback_text,
        updated_at: new Date().toISOString()
      })
      .eq('id', feedback_id)
      .select(`
        *,
        event:events (
          id,
          title,
          slug
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating feedback:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to update feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback: updatedFeedback
    });

  } catch (error) {
    console.error('Update feedback error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dashboard/feedback
 * Delete feedback
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
    const userId = decoded.user_id;

    const url = new URL(request.url);
    const feedbackId = url.searchParams.get('id');

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, message: 'feedback id is required' },
        { status: 400 }
      );
    }

    // Verify feedback belongs to user
    const { data: existingFeedback, error: fetchError } = await supabase
      .from('event_feedback')
      .select('id, user_id')
      .eq('id', feedbackId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingFeedback) {
      return NextResponse.json(
        { success: false, message: 'Feedback not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete feedback
    const { error: deleteError } = await supabase
      .from('event_feedback')
      .delete()
      .eq('id', feedbackId);

    if (deleteError) {
      console.error('Error deleting feedback:', deleteError);
      return NextResponse.json(
        { success: false, message: 'Failed to delete feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Delete feedback error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}

