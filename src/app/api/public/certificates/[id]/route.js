// app/api/public/certificates/[id]/route.js
// PUBLIC Endpoint: Returns certificate data as JSON by event_member_id
// No authentication required.
import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const eventMemberId = id;

    // Fetch certificate data using the event_member_id directly
    const { data: eventMember, error } = await supabase
      .from("event_members")
      .select(`
        id,
        checked_in,
        checked_in_at,
        joined_at,
        token,
        events (
          id,
          title,
          slug,
          description,
          start_datetime,
          end_datetime,
          venue_name,
          address,
          city,
          banner_url,
          status,
          nera_cme_hours,
          nera_code,
          event_hosts (
            id,
            name,
            bio,
            profile_image,
            is_primary
          )
        ),
        users (
          id,
          full_name,
          email,
          membership_code,
          membership_type,
          profile_image
        )
      `)
      .eq("id", eventMemberId) // Filtering by event_members.id
      .eq("checked_in", true)
      .single();

    if (error || !eventMember) {
      console.error("PUBLIC CERTIFICATE NOT FOUND:", error, eventMemberId);
      return NextResponse.json(
        { success: false, message: "Certificate not found or event not attended" },
        { status: 404 }
      );
    }

    // Check if event is completed (standard rule)
    const now = new Date();
    const isCompleted =
      eventMember.events?.status === "completed" ||
      (eventMember.events?.end_datetime &&
        new Date(eventMember.events.end_datetime) < now);

    if (!isCompleted) {
      return NextResponse.json(
        { success: false, message: "Certificate not available yet — event has not completed" },
        { status: 400 }
      );
    }

    // Format certificate data for public rendering
    const certificate = {
      certificate_id: `CERT-${eventMember.id.slice(0, 8).toUpperCase()}`,
      issued_date: new Date().toISOString(),
      issuer: "Bahrain Dental Society",
      nera_cme_hours: eventMember.events?.nera_cme_hours || 0,
      nera_code: eventMember.events?.nera_code || 'BDS-NHRA-001',

      // Attendee info
      attendee: {
        name: eventMember.users?.full_name,
        email: eventMember.users?.email,
        membership_code: eventMember.users?.membership_code,
        membership_type: eventMember.users?.membership_type,
        profile_image: eventMember.users?.profile_image,
      },

      // Event info
      event: {
        id: eventMember.events?.id,
        title: eventMember.events?.title,
        slug: eventMember.events?.slug,
        description: eventMember.events?.description,
        start_datetime: eventMember.events?.start_datetime,
        end_datetime: eventMember.events?.end_datetime,
        venue_name: eventMember.events?.venue_name,
        address: eventMember.events?.address,
        city: eventMember.events?.city,
        banner_url: eventMember.events?.banner_url,
        hosts: (eventMember.events?.event_hosts || [])
          .filter((h) => h.is_primary)
          .map((h) => ({
            name: h.name,
            bio: h.bio,
            profile_image: h.profile_image,
          })),
      },

      // Attendance info
      attendance: {
        checked_in_at: eventMember.checked_in_at,
        joined_at: eventMember.joined_at,
        event_member_token: eventMember.token,
      },
    };

    return NextResponse.json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error("PUBLIC CERTIFICATE DETAIL ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch certificate details" },
      { status: 500 }
    );
  }
}
