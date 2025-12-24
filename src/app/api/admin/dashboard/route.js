import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODAY'S DATE RANGE
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. EVENT STATUS COUNTS
    const { data: eventStatus } = await supabase
      .from('events')
      .select('status, count')
      .eq('status', 'upcoming', { count: 'exact' });

    // Get individual counts for each status
    const { count: upcomingCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'upcoming');

    const { count: ongoingCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ongoing');

    const { count: completedCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const { count: cancelledCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled');

    // 2. TODAY'S EVENTS (events happening today)
    const { data: todayEvents } = await supabase
      .from('events')
      .select('*')
      .gte('start_datetime', today.toISOString())
      .lt('start_datetime', tomorrow.toISOString())
      .order('start_datetime', { ascending: true });

    // 3. UPCOMING EVENTS (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const { data: upcomingEvents } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'upcoming')
      .gte('start_datetime', tomorrow.toISOString())
      .lt('start_datetime', nextWeek.toISOString())
      .order('start_datetime', { ascending: true })
      .limit(5);

    // 4. MEMBER REGISTRATION CHART (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: monthlyMembers } = await supabase
      .from('users')
      .select('created_at, membership_status')
      .gte('created_at', sixMonthsAgo.toISOString());

    const memberRegistrationData = monthlyMembers?.reduce((acc = [], member) => {
      const date = new Date(member.created_at);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${monthName} ${year}`;
      
      let existing = acc.find(item => item.month === key);
      if (!existing) {
        existing = { 
          month: key, 
          total: 0,
          active: 0,
          inactive: 0
        };
        acc.push(existing);
      }
      
      existing.total += 1;
      if (member.membership_status === 'active') {
        existing.active += 1;
      } else if (member.membership_status === 'inactive') {
        existing.inactive += 1;
      }
      
      return acc;
    }, []) || [];

    // Sort by date
    memberRegistrationData.sort((a, b) => {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      
      if (aYear !== bYear) return aYear - bYear;
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth);
    });

    // Keep only last 6 months
    const recentRegistrationData = memberRegistrationData.slice(-6);

    // 5. MEMBER STATUS COUNTS
    const { count: activeMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('membership_status', 'active')
      .eq('role', 'member');

    const { count: inactiveMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('membership_status', 'inactive')
      .eq('role', 'member');

    const { count: blockedMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('membership_status', 'blocked')
      .eq('role', 'member');

    const { count: totalMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'member');

    // 6. TODAY'S ATTENDANCE
    const { count: todayAttendance } = await supabase
      .from('attendance_logs')
      .select('*', { count: 'exact', head: true })
      .gte('scan_time', today.toISOString())
      .lt('scan_time', tomorrow.toISOString());

    // 7. EVENT MEMBERS COUNT
    const { count: eventMembersCount } = await supabase
      .from('event_members')
      .select('*', { count: 'exact', head: true });

    // 8. CHECKED-IN MEMBERS COUNT
    const { count: checkedInMembersCount } = await supabase
      .from('event_members')
      .select('*', { count: 'exact', head: true })
      .eq('checked_in', true);

    return NextResponse.json({
      success: true,
      stats: {
        // Event Status Counts
        upcoming_events: upcomingCount || 0,
        ongoing_events: ongoingCount || 0,
        completed_events: completedCount || 0,
        cancelled_events: cancelledCount || 0,
        total_events: (upcomingCount || 0) + (ongoingCount || 0) + (completedCount || 0) + (cancelledCount || 0),
        
        // Today's Events
        today_events_count: todayEvents?.length || 0,
        today_attendance: todayAttendance || 0,
        
        // Member Status Counts
        active_members: activeMembers || 0,
        inactive_members: inactiveMembers || 0,
        blocked_members: blockedMembers || 0,
        total_members: totalMembers || 0,
        
        // Event Members
        event_members: eventMembersCount || 0,
        checked_in_members: checkedInMembersCount || 0,
        
        // Conversion rate
        conversion_rate: eventMembersCount > 0 
          ? Math.round((checkedInMembersCount / eventMembersCount) * 100 * 10) / 10 
          : 0,
      },
      charts: {
        member_registration: recentRegistrationData,
      },
      upcoming_events: upcomingEvents || [],
      today_events: todayEvents || [],
    });
  } catch (err) {
    console.error('Dashboard API Error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}