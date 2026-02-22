// app/api/dashboard/events/route.js
import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getUserEventPrice } from "@/lib/eventPricing";

export async function GET(req) {
  try {
    // Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;

    // Fetch user details for pricing
    const { data: userProfile } = await supabase
      .from("users")
      .select("*, member_profiles(category, position, specialty)")
      .eq("id", userId)
      .single();

    let loggedInUser = null;
    if (userProfile) {
      loggedInUser = { ...userProfile };
      if (userProfile.member_profiles) {
        loggedInUser.category = userProfile.member_profiles.category;
        loggedInUser.position = userProfile.member_profiles.position;
        loggedInUser.specialty = userProfile.member_profiles.specialty;
      }
    }

    // Fetch user's events with all related data
    const { data: events, error } = await supabase
      .from("event_members")
      .select(`
        id,
        checked_in,
        checked_in_at,
        price_paid,
        token,
        joined_at,
        registration_category,
        payment_status,
        events (
          id,
          title,
          slug,
          description,
          banner_url,
          start_datetime,
          end_datetime,
          venue_name,
          address,
          city,
          state,
          pin_code,
          google_map_url,
          capacity,
          is_paid,
          regular_price,
          member_price,
          status,
          created_at,
          event_hosts (
            id,
            name,
            email,
            phone,
            bio,
            profile_image,
            is_primary,
            display_order
          ),
          event_agendas (
            id,
            agenda_date,
            title,
            description,
            start_time,
            end_time
          )
        )
      `)
      .eq("user_id", userId)
      .order("joined_at", { ascending: false });

    if (error) throw error;

    // Format events data
    const formattedEvents = (events || []).map(item => {
      const isPaidEvent = item.events?.is_paid;

      let isActuallyFreeForUser = false;
      if (isPaidEvent && loggedInUser && item.events) {
        const priceInfo = getUserEventPrice(item.events, loggedInUser);
        if (priceInfo.isFree) {
          isActuallyFreeForUser = true;
        }
      }

      let paymentPending = false;
      if (isPaidEvent && !isActuallyFreeForUser) {
        if (
          item.payment_status === 'completed' ||
          item.payment_status === 'free' ||
          (item.price_paid && Number(item.price_paid) > 0 && item.payment_status !== 'pending' && item.payment_status !== 'failed')
        ) {
          paymentPending = false;
        } else {
          paymentPending = true;
        }
      } else {
        paymentPending = false;
      }

      return {
        id: item.events?.id,
        event_member_id: item.id,
        title: item.events?.title,
        slug: item.events?.slug,
        description: item.events?.description,
        banner_url: item.events?.banner_url,
        start_datetime: item.events?.start_datetime,
        end_datetime: item.events?.end_datetime,
        venue_name: item.events?.venue_name,
        address: item.events?.address,
        city: item.events?.city,
        state: item.events?.state,
        pin_code: item.events?.pin_code,
        google_map_url: item.events?.google_map_url,
        capacity: item.events?.capacity,
        is_paid: item.events?.is_paid,
        regular_price: item.events?.regular_price,
        member_price: item.events?.member_price,
        event_status: item.events?.status,
        checked_in: item.checked_in,
        checked_in_at: item.checked_in_at,
        price_paid: item.price_paid,
        payment_status: item.payment_status,
        registration_category: item.registration_category,
        payment_pending: paymentPending,
        token: item.token,
        joined_at: item.joined_at,
        event_hosts: item.events?.event_hosts || [],
        event_agendas: item.events?.event_agendas || []
      };
    }).filter(event => event.id); // Filter out null events

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      count: formattedEvents.length
    });

  } catch (error) {
    console.error("EVENTS API ERROR:", error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch events" },
      { status: 500 }
    );
  }
}