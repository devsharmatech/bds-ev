import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODAY'S DATE RANGE (Asia/Bahrain - AST)
    // Build start/end of "today" in Bahrain timezone and convert to UTC ISO for DB comparisons
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bahrain',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const [bYear, bMonth, bDay] = fmt.format(now).split('-');
    const bahrainStart = new Date(`${bYear}-${bMonth}-${bDay}T00:00:00+03:00`);
    const bahrainEnd = new Date(`${bYear}-${bMonth}-${bDay}T23:59:59.999+03:00`);
    const todayISO = bahrainStart.toISOString();
    const tomorrowISO = new Date(bahrainEnd.getTime() + 1).toISOString();

    // 1. EVENT STATUS COUNTS (derived from dates, except cancelled)
    // Fetch events needed for derived counts and lists
    const { data: eventsBasic } = await supabase
      .from('events')
      .select('id, title, start_datetime, end_datetime, venue_name, capacity, status');

    const nonCancelled = (eventsBasic || []).filter(e => e.status !== 'cancelled');
    const upcomingDerived = nonCancelled.filter(e => new Date(e.start_datetime) > now);
    const ongoingDerived = nonCancelled.filter(e => {
      const start = new Date(e.start_datetime);
      const end = e.end_datetime ? new Date(e.end_datetime) : null;
      return start <= now && (end === null || end >= now);
    });
    const completedDerived = (eventsBasic || []).filter(e => {
      if (e.status === 'cancelled') return false;
      if (e.status === 'completed') return true;
      const end = e.end_datetime ? new Date(e.end_datetime) : null;
      return end !== null && end < now;
    });

    const { count: cancelledCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled');

    // 2. TODAY'S EVENTS (events happening today)
    // Today events: events whose range intersects [todayStart, todayEnd], excluding cancelled
    const todayEvents = (eventsBasic || []).filter(e => {
      if (e.status === 'cancelled') return false;
      const start = new Date(e.start_datetime);
      const end = e.end_datetime ? new Date(e.end_datetime) : null;
      const startBoundary = new Date(todayISO);
      const endBoundary = new Date(tomorrowISO);
      // Intersects if start < endOfDay and (end >= startOfDay or no end but start >= startOfDay)
      const intersects =
        start < endBoundary && (end ? end >= startBoundary : start >= startBoundary);
      return intersects;
    }).sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

    // 3. UPCOMING EVENTS (next 7 days from Bahrain-local start of today)
    const nextWeek = new Date(bahrainStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekISO = nextWeek.toISOString();
    
    // Upcoming list (next future events based on datetime, excluding cancelled)
    const upcomingEvents = upcomingDerived
      .filter(e => new Date(e.start_datetime) < new Date(nextWeekISO))
      .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
      .slice(0, 5);

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

    // 5. MEMBER STATUS COUNTS + TODAY'S NEW MEMBERS
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

    // Today's registrations (members created today in Bahrain time)
    const { count: todayRegistrations } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'member')
      .gte('created_at', todayISO)
      .lt('created_at', tomorrowISO);

    // 6. TODAY'S ATTENDANCE
    const { count: todayAttendance } = await supabase
      .from('attendance_logs')
      .select('*', { count: 'exact', head: true })
      .gte('scan_time', todayISO)
      .lt('scan_time', tomorrowISO);

    // 6a. TODAY'S UNIQUE CHECK-INS (distinct event_member_id)
    const { data: todayCheckinsRows } = await supabase
      .from('attendance_logs')
      .select('event_member_id')
      .gte('scan_time', todayISO)
      .lt('scan_time', tomorrowISO);
    const todayUniqueCheckins = Array.isArray(todayCheckinsRows)
      ? new Set(todayCheckinsRows.map(r => r.event_member_id).filter(Boolean)).size
      : 0;

    // 6b. TODAY'S PAID REGISTRATIONS (event members joined today with payment > 0)
    const { count: todayPaidJoins } = await supabase
      .from('event_members')
      .select('*', { count: 'exact', head: true })
      .gte('joined_at', todayISO)
      .lt('joined_at', tomorrowISO)
      .gt('price_paid', 0);

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
        // Show total upcoming (all future, excluding cancelled)
        upcoming_events: upcomingDerived.length || 0,
        ongoing_events: ongoingDerived.length || 0,
        completed_events: completedDerived.length || 0,
        cancelled_events: cancelledCount || 0,
        total_events: (eventsBasic || []).length || 0,
        
        // Today's Events
        today_events_count: todayEvents?.length || 0,
        today_attendance: todayAttendance || 0, // total scans (all agendas)
        today_unique_checkins: todayUniqueCheckins || 0, // unique members checked-in
        today_paid_joins: todayPaidJoins || 0,
        
        // Member Status Counts
        active_members: activeMembers || 0,
        inactive_members: inactiveMembers || 0,
        blocked_members: blockedMembers || 0,
        total_members: totalMembers || 0,
        today_registrations: todayRegistrations || 0,
        
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