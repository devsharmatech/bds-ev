// app/api/mobile/dashboard/certificates/[id]/detail/route.js
// Returns certificate data as JSON so mobile apps can render/print it
import { supabase } from "@/lib/supabaseAdmin";
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const decoded = verifyTokenMobile(req);
    const userId = decoded.user_id;
    const { id } = await params;
    const eventId = id;

    // Verify user attended this event
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
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .eq("checked_in", true)
      .single();

    if (error || !eventMember) {
      return NextResponse.json(
        { success: false, message: "Certificate not found or event not attended" },
        { status: 404 }
      );
    }

    // Check if event is completed
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

    // Format certificate data for mobile rendering
    const certificate = {
      certificate_id: `CERT-${eventMember.id.slice(0, 8).toUpperCase()}`,
      issued_date: new Date().toISOString(),
      issuer: "Bahrain Dental Society",

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

      // Formatted text for display
      display: {
        title: "CERTIFICATE OF ATTENDANCE",
        body: `This certifies that ${eventMember.users?.full_name} has successfully attended "${eventMember.events?.title}"`,
        event_date: eventMember.events?.start_datetime
          ? new Date(eventMember.events.start_datetime).toLocaleDateString(
              "en-BH",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )
          : null,
        venue: eventMember.events?.venue_name || null,
      },
    };

    return NextResponse.json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error("CERTIFICATE DETAIL ERROR:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch certificate details" },
      { status: 500 }
    );
  }
}
