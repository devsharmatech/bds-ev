import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getUserEventPrice } from "@/lib/eventPricing";

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

  const startTime = start.toLocaleTimeString("en-BH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bahrain",
  });

  if (!endDateString) return startTime;

  const end = new Date(endDateString);
  if (isNaN(end.getTime())) return startTime;

  const endTime = end.toLocaleTimeString("en-BH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bahrain",
  });

  return `${startTime} - ${endTime}`;
}

function formatLocationDisplay(event) {
  return event.venue_name || event.city || event.address || "Location TBD";
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

/* ================= API HANDLER ================= */

export async function GET(request) {
  try {
    /* ---------- AUTH ---------- */
    let loggedInUser = null;
    let userEventMemberData = new Map();

    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("bds_token")?.value;

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user_id || decoded.id;

        if (userId) {
          const { data: user } = await supabase
            .from("users")
            .select("id, membership_type, membership_status, membership_expiry_date, email, full_name, member_profiles!member_profiles_user_id_fkey(category)")
            .eq("id", userId)
            .single();

          if (user) {
            loggedInUser = { ...user };
            if (user.member_profiles) {
              // Handle both array and object returns from foreign key join
              const profile = Array.isArray(user.member_profiles) ? user.member_profiles[0] : user.member_profiles;
              loggedInUser.category = profile?.category;
            }

            const { data: eventMembers } = await supabase
              .from("event_members")
              .select("event_id, token, checked_in, joined_at, id, price_paid, payment_status")
              .eq("user_id", user.id);

            eventMembers?.forEach((m) => {
              userEventMemberData.set(m.event_id, {
                token: m.token,
                checked_in: m.checked_in,
                joined_at: m.joined_at,
                event_member_id: m.id,
                price_paid: m.price_paid,
                payment_status: m.payment_status,
              });
            });
          }
        }
      }
    } catch {
      // silent auth failure (non-blocking)
    }

    /* ---------- QUERY PARAMS ---------- */
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 9;
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "start_datetime";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const isUpcoming = searchParams.get("isUpcoming") !== "false";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    /* ---------- EVENTS QUERY ---------- */
    let query = supabase
      .from("events")
      .select(
        `
        *,
        event_agendas(agenda_date,title,start_time,end_time),
        event_hosts(name,profile_image,is_primary,bio)
      `,
        { count: "exact" }
      )
      .neq("status", "cancelled");

    if (isUpcoming) {
      const nowIso = new Date().toISOString();
      // Include both upcoming (start >= now) and ongoing (end >= now)
      query = query.or(`start_datetime.gte.${nowIso},end_datetime.gte.${nowIso}`);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,venue_name.ilike.%${search}%`
      );
    }

    query = query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to);

    const { data: events, error, count } = await query;

    if (error) {
      throw new Error("Database query failed");
    }

    /* ---------- REGISTERED COUNTS ---------- */
    const registeredCounts = new Map();
    const allEventMembersData = new Map();

    const eventIds = events?.map((e) => e.id) || [];

    if (eventIds.length) {
      const { data: members } = await supabase
        .from("event_members")
        .select("event_id, user_id, token, checked_in, joined_at, id, price_paid, payment_status")
        .in("event_id", eventIds);

      members?.forEach((m) => {
        registeredCounts.set(
          m.event_id,
          (registeredCounts.get(m.event_id) || 0) + 1
        );

        if (loggedInUser && m.user_id === loggedInUser.id) {
          allEventMembersData.set(m.event_id, {
            token: m.token,
            checked_in: m.checked_in,
            joined_at: m.joined_at,
            event_member_id: m.id,
            price_paid: m.price_paid,
            payment_status: m.payment_status,
          });
        }
      });
    }

    /* ---------- TRANSFORM ---------- */
    const transformedEvents = (events || []).map((event) => {
      const eventMemberData =
        userEventMemberData.get(event.id) ||
        allEventMembersData.get(event.id) ||
        null;

      let joined = false;
      let paymentPending = false;

      if (eventMemberData) {
        let isActuallyFreeForUser = false;
        if (event.is_paid && loggedInUser) {
          const priceInfo = getUserEventPrice(event, loggedInUser);
          if (priceInfo.isFree) {
            isActuallyFreeForUser = true;
          }
        }

        if (event.is_paid && !isActuallyFreeForUser) {
          // If the event requires payment, the user MUST have a completed status OR a legacy paid amount > 0
          if (
            eventMemberData.payment_status === 'completed' ||
            eventMemberData.payment_status === 'free' ||
            (eventMemberData.price_paid && Number(eventMemberData.price_paid) > 0 && eventMemberData.payment_status !== 'pending' && eventMemberData.payment_status !== 'failed')
          ) {
            joined = true;
            paymentPending = false;
          } else {
            // Unpaid, pending, failed, or null payment status means they still owe money
            joined = false;
            paymentPending = true;
          }
        } else {
          // Free events or events that are free for this specific user
          joined = true;
          paymentPending = false;
        }
      }

      const registered_count = registeredCounts.get(event.id) || 0;

      let price_to_show = "FREE";

      if (event.is_paid) {
        if (loggedInUser) {
          const priceInfo = getUserEventPrice(event, loggedInUser);
          price_to_show = priceInfo.price > 0 ? formatBHD(priceInfo.price) : "FREE";
        } else {
          price_to_show = formatBHD(event.regular_price);
        }
      }

      return {
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

        registered_count,
        joined,
        payment_pending: paymentPending,
        event_member_data: eventMemberData,

        date_display: formatDateForDisplay(event.start_datetime),
        time_display: formatTimeForDisplay(
          event.start_datetime,
          event.end_datetime
        ),
        location_display: formatLocationDisplay(event),
        price_to_show,

        event_agendas: event.event_agendas || [],
        event_hosts: event.event_hosts || [],
      };
    });

    return NextResponse.json({
      success: true,
      events: transformedEvents,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
