import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/**
 * GET /api/dashboard/check-ins
 * Fetch all check-in information for the logged-in member
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

    // Fetch all event members for this user with check-in status
    const { data: eventMembers, error: eventMembersError } = await supabase
      .from('event_members')
      .select(`
        id,
        token,
        checked_in,
        checked_in_at,
        joined_at,
        price_paid,
        payment_status,
        is_member,
        event:events (
          id,
          title,
          slug,
          description,
          start_datetime,
          end_datetime,
          venue_name,
          city,
          banner_url,
          status,
          is_paid,
          member_price,
          regular_price
        )
      `)
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false, nullsFirst: false })
      .order('joined_at', { ascending: false });

    if (eventMembersError) {
      console.error('Error fetching event members:', eventMembersError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch event members' },
        { status: 500 }
      );
    }

    // Fetch all attendance logs for these event members
    const eventMemberIds = eventMembers?.map(em => em.id) || [];

    let attendanceLogs = [];
    if (eventMemberIds.length > 0) {
      const { data: logs, error: logsError } = await supabase
        .from('attendance_logs')
        .select(`
          id,
          event_member_id,
          scan_time,
          location,
          device_info,
          agenda_id,
          scanned_by,
          scanner:users!attendance_logs_scanned_by_fkey (
            id,
            full_name,
            email
          ),
          agenda:event_agendas!attendance_logs_agenda_id_fkey (
            id,
            title,
            description,
            agenda_date,
            start_time,
            end_time
          )
        `)
        .in('event_member_id', eventMemberIds)
        .order('scan_time', { ascending: false });

      if (logsError) {
        console.error('Error fetching attendance logs:', logsError);
      } else {
        attendanceLogs = logs || [];
      }
    }

    // Fetch all feedback for these event members
    let feedbackData = [];
    if (eventMemberIds.length > 0) {
      const { data: feedback, error: feedbackError } = await supabase
        .from('event_feedback')
        .select(`
          id,
          event_member_id,
          event_id,
          rating,
          feedback_text,
          feedback_date,
          created_at,
          updated_at
        `)
        .in('event_member_id', eventMemberIds)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (feedbackError) {
        console.error('Error fetching feedback:', feedbackError);
      } else {
        feedbackData = feedback || [];
      }
    }

    // Combine event members with their attendance logs and feedback
    // Filter out payment-pending members (they haven't completed payment yet)
    const validEventMembers = (eventMembers || []).filter(em => {
      const isPaidEvent = em.event?.is_paid;
      const ps = em.payment_status;
      if (isPaidEvent && ps !== 'completed' && ps !== 'free' && !(em.price_paid != null && Number(em.price_paid) > 0)) {
        return false; // Payment pending, don't show in check-ins
      }
      return true;
    });

    const checkIns = validEventMembers.map(eventMember => {
      const logs = attendanceLogs.filter(
        log => log.event_member_id === eventMember.id
      );

      const feedback = feedbackData.filter(
        fb => fb.event_member_id === eventMember.id
      );

      return {
        event_member_id: eventMember.id,
        token: eventMember.token,
        checked_in: eventMember.checked_in,
        checked_in_at: eventMember.checked_in_at,
        joined_at: eventMember.joined_at,
        price_paid: eventMember.price_paid,
        payment_status: eventMember.payment_status,
        is_member: eventMember.is_member,
        event: eventMember.event,
        attendance_logs: logs,
        feedback: feedback,
        total_check_ins: logs.length
      };
    });

    // Separate checked-in and not checked-in
    const checkedInEvents = checkIns.filter(ci => ci.checked_in);
    const notCheckedInEvents = checkIns.filter(ci => !ci.checked_in);

    return NextResponse.json({
      success: true,
      data: {
        all: checkIns,
        checked_in: checkedInEvents,
        not_checked_in: notCheckedInEvents,
        stats: {
          total_events: checkIns.length,
          checked_in_count: checkedInEvents.length,
          not_checked_in_count: notCheckedInEvents.length,
          total_check_ins: attendanceLogs.length
        }
      }
    });

  } catch (error) {
    console.error('Check-ins API error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to fetch check-in information' },
      { status: 500 }
    );
  }
}

