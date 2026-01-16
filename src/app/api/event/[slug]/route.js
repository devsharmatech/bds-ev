import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

/* ================= HELPERS ================= */

function formatDateForDisplay(dateString) {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeForDisplay(startDateString, endDateString) {
  if (!startDateString) return "";
  const start = new Date(startDateString);
  if (isNaN(start.getTime())) return "";
  const startTime = start.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!endDateString) return startTime;
  const end = new Date(endDateString);
  if (isNaN(end.getTime())) return startTime;
  const endTime = end.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${startTime} - ${endTime}`;
}

function formatBHD(amount) {
  if (!amount) return "FREE";
  try {
    return new Intl.NumberFormat("en-BH", {
      style: "currency",
      currency: "BHD",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  } catch {
    return "FREE";
  }
}

/**
 * GET /api/event/[slug]
 * Get a single event by slug
 */
export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Event slug is required' },
        { status: 400 }
      );
    }

    /* ---------- AUTH ---------- */
    let loggedInUser = null;
    let userEventMemberData = null;

    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('bds_token')?.value;

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user_id || decoded.id;

        if (userId) {
          const { data: user } = await supabase
            .from('users')
            .select('id, membership_type, email, full_name')
            .eq('id', userId)
            .single();

          if (user) {
            loggedInUser = user;
            // Event membership will be checked after we fetch the event
          }
        }
      }
    } catch {
      // silent auth failure (non-blocking)
    }

    /* ---------- FETCH EVENT ---------- */
    // Try to fetch by slug first, if that fails try by ID (in case slug is missing or notification uses ID)
    let event = null;
    let eventError = null;

    // First try by slug
    const { data: eventBySlug, error: slugError } = await supabase
      .from('events')
      .select(`
        *,
        event_agendas (
          id,
          event_id,
          agenda_date,
          title,
          description,
          start_time,
          end_time,
          created_at
        ),
        event_hosts (
          id,
          event_id,
          name,
          email,
          phone,
          bio,
          profile_image,
          is_primary,
          display_order,
          created_at
        )
      `)
      .eq('slug', slug)
      .neq('status', 'cancelled')
      .maybeSingle();

    if (eventBySlug) {
      event = eventBySlug;
    } else {
      // If slug not found, try by ID (in case notification uses ID or slug is missing)
      const { data: eventById, error: idError } = await supabase
        .from('events')
        .select(`
          *,
          event_agendas (
            id,
            event_id,
            agenda_date,
            title,
            description,
            start_time,
            end_time,
            created_at
          ),
          event_hosts (
            id,
            event_id,
            name,
            email,
            phone,
            bio,
            profile_image,
            is_primary,
            display_order,
            created_at
          )
        `)
        .eq('id', slug)
        .neq('status', 'cancelled')
        .maybeSingle();

      if (eventById) {
        event = eventById;
      } else {
        eventError = idError || slugError;
      }
    }

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, message: 'Event not found', error: eventError },
        { status: 404 }
      );
    }

    /* ---------- GET REGISTERED COUNT ---------- */
    const { count: registeredCount } = await supabase
      .from('event_members')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id);

    /* ---------- CHECK USER MEMBERSHIP FOR THIS SPECIFIC EVENT ---------- */
    if (loggedInUser) {
      const { data: eventMember } = await supabase
        .from('event_members')
        .select('event_id, token, checked_in, joined_at, id')
        .eq('user_id', loggedInUser.id)
        .eq('event_id', event.id)
        .maybeSingle();

      if (eventMember) {
        userEventMemberData = {
          token: eventMember.token,
          checked_in: eventMember.checked_in,
          joined_at: eventMember.joined_at,
          event_member_id: eventMember.id,
        };
      }
    }

    /* ---------- TRANSFORM ---------- */
    const joined = !!userEventMemberData;
    let price_to_show = "FREE";

    if (event.is_paid) {
      if (loggedInUser?.membership_type === "paid") {
        price_to_show = formatBHD(event.member_price || event.regular_price);
      } else {
        price_to_show = formatBHD(event.regular_price);
      }
    }

    const transformedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      banner_url: event.banner_url,
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime,
      venue_name: event.venue_name,
      address: event.address,
      city: event.city,
      state: event.state,
      capacity: event.capacity,
      is_paid: event.is_paid,
      // Early Bird prices
      regular_price: event.regular_price,
      member_price: event.member_price,
      student_price: event.student_price,
      hygienist_price: event.hygienist_price,
      // Standard prices
      regular_standard_price: event.regular_standard_price,
      member_standard_price: event.member_standard_price,
      student_standard_price: event.student_standard_price,
      hygienist_standard_price: event.hygienist_standard_price,
      // On-site prices
      regular_onsite_price: event.regular_onsite_price,
      member_onsite_price: event.member_onsite_price,
      student_onsite_price: event.student_onsite_price,
      hygienist_onsite_price: event.hygienist_onsite_price,
      // Pricing deadlines
      early_bird_deadline: event.early_bird_deadline,
      standard_deadline: event.standard_deadline,
      status: event.status,
      slug: event.slug,
      google_map_url: event.google_map_url,

      // NHRA meta (for certificates)
      nera_cme_hours: event.nera_cme_hours ?? null,
      nera_code: event.nera_code ?? null,

      registered_count: registeredCount || 0,
      joined,
      event_member_data: userEventMemberData,

      date_display: formatDateForDisplay(event.start_datetime),
      time_display: formatTimeForDisplay(event.start_datetime, event.end_datetime),
      location_display: event.venue_name || event.city || event.address || "Location TBD",
      price_to_show,

      event_agendas: event.event_agendas || [],
      event_hosts: event.event_hosts || [],
    };

    return NextResponse.json({
      success: true,
      event: transformedEvent
    });

  } catch (error) {
    console.error('Event API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

