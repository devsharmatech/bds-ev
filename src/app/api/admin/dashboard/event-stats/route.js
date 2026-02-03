import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseAdmin';

// Helper to build Bahrain-local date string (YYYY-MM-DD)
function formatBHDate(date) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bahrain',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(date); // already YYYY-MM-DD
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let eventId = searchParams.get('event_id');

    // Build "today" range in Bahrain time
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

    // If no event_id provided, pick the nearest upcoming event; if none, latest past event
    if (!eventId) {
      const { data: events } = await supabase
        .from('events')
        .select('id, title, start_datetime, end_datetime, venue_name')
        .order('start_datetime', { ascending: true });

      const nowUTC = new Date();
      const upcoming = (events || []).filter(
        (e) => new Date(e.start_datetime) > nowUTC && e.status !== 'cancelled'
      );
      const target = upcoming[0] || (events || []).slice(-1)[0];

      if (!target) {
        return NextResponse.json({ success: false, message: 'No events found' });
      }

      eventId = target.id;
    }

    // Load event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, start_datetime, end_datetime, venue_name')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    // Aggregate joins
    const { count: totalJoins } = await supabase
      .from('event_members')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id);

    const { count: todayJoins } = await supabase
      .from('event_members')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .gte('joined_at', todayISO)
      .lt('joined_at', tomorrowISO);

    const { data: rows } = await supabase
      .from('event_members')
      .select('joined_at, price_paid')
      .eq('event_id', event.id)
      .order('joined_at', { ascending: true });

    const trendMap = new Map();

    (rows || []).forEach((row) => {
      if (!row.joined_at) return;
      const d = new Date(row.joined_at);
      const key = formatBHDate(d);
      if (!trendMap.has(key)) {
        trendMap.set(key, { date: key, joins: 0, paid_joins: 0 });
      }
      const entry = trendMap.get(key);
      entry.joins += 1;
      if (row.price_paid && Number(row.price_paid) > 0) {
        entry.paid_joins += 1;
      }
    });

    const trend = Array.from(trendMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return NextResponse.json({
      success: true,
      event,
      stats: {
        total_joins: totalJoins || 0,
        today_joins: todayJoins || 0,
      },
      trend,
    });
  } catch (error) {
    console.error('Dashboard event-stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load event analytics' },
      { status: 500 }
    );
  }
}
