// app/api/dashboard/stats/route.js
import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req) {
  try {
    /* ---------- AUTHENTICATION ---------- */
    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;

    /* ---------- FETCH USER DATA ---------- */
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        full_name,
        phone,
        mobile,
        profile_image,
        membership_code,
        membership_status,
        membership_type,
        membership_expiry_date,
        created_at,
        last_login,
        member_profiles (
          gender,
          dob,
          address,
          city,
          state,
          pin_code,
          cpr_id,
          nationality,
          type_of_application,
          membership_date,
          work_sector,
          employer,
          position,
          specialty,
          category
        )
      `)
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    /* ---------- DASHBOARD STATISTICS ---------- */
    const currentDate = new Date().toISOString();

    // Compute events attended as: events where the member attended ALL agendas
    // 1) Load all event_members for this user with event agendas and attendance logs (agenda-specific)
    const { data: memberEventRows, error: memberEventError } = await supabase
      .from("event_members")
      .select(`
        id,
        event_id,
        checked_in,
        events (
          id,
          event_agendas ( id )
        ),
        attendance_logs (
          agenda_id
        )
      `)
      .eq("user_id", userId);

    if (memberEventError) {
      console.warn("dashboard/stats: failed to load member events for attendance calc", memberEventError);
    }

    let eventsAttended = 0;
    if (Array.isArray(memberEventRows)) {
      for (const row of memberEventRows) {
        const agendaList = row?.events?.event_agendas || [];
        const totalAgendas = Array.isArray(agendaList) ? agendaList.length : 0;

        // Only count as attended if the event has at least one agenda and all are attended
        if (totalAgendas > 0) {
          const attendedAgendaIds = new Set(
            (row?.attendance_logs || [])
              .map((al) => al?.agenda_id)
              .filter((id) => !!id)
          );
          if (attendedAgendaIds.size >= totalAgendas) {
            eventsAttended += 1;
          }
        }
      }
    }

    // Get upcoming events count
    const { count: upcomingEventsCount, error } = await supabase
      .from("event_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("checked_in", false)
      .not("event_id", "is", null);

    if (error) {
      console.warn("dashboard/stats: upcomingEventsCount error:", error);
    }
    // Get total events (all time)
    const { count: totalEvents } = await supabase
      .from("event_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    // Get total amount paid for events
    const { data: paymentsData } = await supabase
      .from("event_members")
      .select("price_paid")
      .eq("user_id", userId)
      .not("price_paid", "is", null)
      .gt("price_paid", 0);

    const totalPaid = paymentsData?.reduce((sum, item) => sum + (item.price_paid || 0), 0) || 0;

    // Get CE credits (assuming each fully attended event gives 1 credit)
    const creditsEarned = eventsAttended || 0;

    /* ---------- UPCOMING EVENTS ---------- */
    const { data: upcomingEvents } = await supabase
      .from("event_members")
      .select(`
        id,
        checked_in,
        checked_in_at,
        price_paid,
        events (
          id,
          title,
          slug,
          start_datetime,
          end_datetime,
          venue_name,
          address,
          regular_price,
          member_price,
          banner_url,
          capacity,
          is_paid
        )
      `)
      .eq("user_id", userId)
      .eq("checked_in", false)
      .order("joined_at", { ascending: false })
      .limit(5);

    const formattedUpcomingEvents = (upcomingEvents || []).map(item => {
      const isPaidEvent = item.events?.is_paid;
      const pricePaid = item.price_paid || 0;
      // Payment is pending if it's a paid event but user hasn't paid yet
      const paymentPending = isPaidEvent && pricePaid === 0;
      
      return {
        id: item.events?.id,
        title: item.events?.title,
        slug: item.events?.slug,
        start_datetime: item.events?.start_datetime,
        end_datetime: item.events?.end_datetime,
        venue_name: item.events?.venue_name,
        address: item.events?.address,
        regular_price: item.events?.regular_price,
        member_price: item.events?.member_price,
        banner_url: item.events?.banner_url,
        checked_in: item.checked_in,
        price_paid: item.price_paid,
        is_paid: item.events?.is_paid,
        payment_pending: paymentPending
      };
    }).filter(event => event.id); // Filter out null events

    /* ---------- RECENT ACTIVITIES ---------- */
    const { data: recentActivities } = await supabase
      .from("event_members")
      .select(`
        id,
        joined_at,
        checked_in,
        checked_in_at,
        price_paid,
        events (
          title,
          is_paid
        ),
        users (
          full_name
        )
      `)
      .eq("user_id", userId)
      .order("joined_at", { ascending: false })
      .limit(10);

    const formattedActivities = (recentActivities || []).map(item => {
      const isCheckIn = item.checked_in;
      const isPaidEvent = item.events?.is_paid;
      const pricePaid = item.price_paid || 0;
      const paymentPending = isPaidEvent && pricePaid === 0;
      
      let action = '';
      let status = 'success';
      
      if (isCheckIn) {
        action = `Attended ${item.events?.title || 'event'}`;
      } else if (paymentPending) {
        action = `Payment pending for ${item.events?.title || 'event'}`;
        status = 'warning';
      } else if (!isPaidEvent) {
        action = `Registered for ${item.events?.title || 'event'} (Free)`;
        status = 'pending';
      } else {
        action = `Paid and registered for ${item.events?.title || 'event'}`;
      }

      return {
        id: item.id,
        action,
        time: formatTimeAgo(item.joined_at),
        status,
        event_title: item.events?.title
      };
    });

    /* ---------- MEMBERSHIP PAYMENTS ---------- */
    const { data: membershipPayments } = await supabase
      .from("membership_payments")
      .select(`
        id,
        payment_type,
        amount,
        paid,
        paid_at,
        membership_start_date,
        membership_end_date,
        reference
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    const latestPayment = membershipPayments?.[0] || null;

    /* ---------- RESPONSE DATA ---------- */
    const dashboardData = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        mobile: user.mobile,
        profile_image: user.profile_image,
        membership_code: user.membership_code,
        membership_status: user.membership_status,
        membership_type: user.membership_type,
        membership_expiry_date: user.membership_expiry_date,
        created_at: user.created_at,
        last_login: user.last_login,
        // Flatten member_profiles
        gender: user.member_profiles?.[0]?.gender,
        dob: user.member_profiles?.[0]?.dob,
        address: user.member_profiles?.[0]?.address,
        city: user.member_profiles?.[0]?.city,
        state: user.member_profiles?.[0]?.state,
        pin_code: user.member_profiles?.[0]?.pin_code,
        cpr_id: user.member_profiles?.[0]?.cpr_id,
        nationality: user.member_profiles?.[0]?.nationality,
        type_of_application: user.member_profiles?.[0]?.type_of_application,
        membership_date: user.member_profiles?.[0]?.membership_date,
        work_sector: user.member_profiles?.[0]?.work_sector,
        employer: user.member_profiles?.[0]?.employer,
        position: user.member_profiles?.[0]?.position,
        specialty: user.member_profiles?.[0]?.specialty,
        category: user.member_profiles?.[0]?.category
      },
      stats: {
        totalEvents: totalEvents || 0,
        upcomingEvents: upcomingEventsCount || 0,
        eventsAttended: eventsAttended || 0,
        creditsEarned,
        totalPaid,
        certificatesEarned: eventsAttended || 0, // Assuming 1 certificate per fully attended event
        attendanceRate: totalEvents > 0 ? Math.round((eventsAttended / totalEvents) * 100) : 0
      },
      upcomingEvents: formattedUpcomingEvents,
      recentActivities: formattedActivities,
      membership: {
        latest_payment: latestPayment,
        is_premium: user.membership_type === 'paid',
        is_active: user.membership_status === 'active',
        expiry_date: user.membership_expiry_date,
        days_until_expiry: user.membership_expiry_date 
          ? calculateDaysUntil(user.membership_expiry_date)
          : null
      }
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch dashboard data",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: diffDays > 365 ? 'numeric' : undefined
  });
}

// Helper function to calculate days until expiry
function calculateDaysUntil(expiryDate) {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}