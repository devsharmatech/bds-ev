import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// GET - Single event member details (with user and attendance logs)
export async function GET(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    jwt.verify(token, process.env.JWT_SECRET);
    const { id, memberId } = await params;
    const eventId = id;

    // Fetch member with related user and attendance logs
    const { data: member, error } = await supabase
      .from("event_members")
      .select(
        `
        id,
        event_id,
        user_id,
        token,
        checked_in,
        checked_in_at,
        joined_at,
        is_member,
        price_paid,
        users (
          id,
          full_name,
          email,
          phone,
          mobile,
          profile_image,
          membership_code,
          membership_status,
          membership_type
        ),
        attendance_logs (
          id,
          event_member_id,
          agenda_id,
          scan_time,
          location,
          device_info,
          scanned_by
        )
      `
      )
      .eq("id", memberId)
      .eq("event_id", eventId)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, member });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to fetch member details" },
      { status: 500 }
    );
  }
}

// PUT - Update single event member (e.g., toggle checked_in)
export async function PUT(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    jwt.verify(token, process.env.JWT_SECRET);
    const { id, memberId } = await params;
    const eventId = id;
    const body = await req.json();

    const updateData = {};
    if (typeof body.checked_in === "boolean") {
      // If attempting to check in, enforce event time window (within 5 hours before start)
      if (body.checked_in === true) {
        const { data: event, error: eventError } = await supabase
          .from("events")
          .select("id, start_datetime")
          .eq("id", eventId)
          .single();

        if (eventError || !event) {
          console.error("EVENT MEMBER CHECK-IN - Event fetch error:", eventError);
          return NextResponse.json(
            { success: false, message: "Event not found for check-in" },
            { status: 404 }
          );
        }

        if (event.start_datetime) {
          const now = new Date();
          const eventStart = new Date(event.start_datetime);
          const fiveHoursBefore = new Date(eventStart.getTime() - 5 * 60 * 60 * 1000);

          if (now < fiveHoursBefore) {
            return NextResponse.json(
              {
                success: false,
                message:
                  "Check-in is not open yet. Members can be checked in only within 5 hours before the event start time.",
              },
              { status: 400 }
            );
          }
        }
      }

      updateData.checked_in = body.checked_in;
      updateData.checked_in_at = body.checked_in ? new Date().toISOString() : null;
    }

    // No fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabase
      .from("event_members")
      .update(updateData)
      .eq("id", memberId)
      .eq("event_id", eventId)
      .select(
        `
        id,
        event_id,
        user_id,
        token,
        checked_in,
        checked_in_at,
        joined_at,
        is_member,
        price_paid
      `
      )
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: "Failed to update member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, member: updated });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to update member" },
      { status: 500 }
    );
  }
}



// DELETE member from event
export async function DELETE(req, { params }) {
  try {
    console.log("DELETE MEMBER - Starting deletion process");

    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      console.log("DELETE MEMBER - No token found");
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, memberId } = await params;
    const eventId = id;

    console.log(
      `DELETE MEMBER - Deleting member ${memberId} from event ${eventId}`
    );

    // First, check if member exists
    const { data: member, error: checkError } = await supabase
      .from("event_members")
      .select("id, event_id")
      .eq("id", memberId)
      .eq("event_id", eventId)
      .single();

    if (checkError) {
      console.error("DELETE MEMBER - Member check error:", checkError);
      if (checkError.code === "PGRST116") {
        return NextResponse.json(
          { success: false, message: "Member not found in this event" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: `Error checking member: ${checkError.message}`,
        },
        { status: 500 }
      );
    }

    console.log(`DELETE MEMBER - Member found: ${member.id}`);

    // Delete attendance logs first (due to foreign key constraint)
    console.log("DELETE MEMBER - Deleting attendance logs...");
    const { error: logsError } = await supabase
      .from("attendance_logs")
      .delete()
      .eq("event_member_id", memberId);

    if (logsError) {
      console.error(
        "DELETE MEMBER - Error deleting attendance logs:",
        logsError
      );
      // Continue anyway, might not have logs
    }

    // Delete member
    console.log("DELETE MEMBER - Deleting event member...");
    const { error } = await supabase
      .from("event_members")
      .delete()
      .eq("id", memberId)
      .eq("event_id", eventId);

    if (error) {
      console.error("DELETE MEMBER - Error deleting member:", error);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to delete member: ${error.message}`,
        },
        { status: 500 }
      );
    }

    console.log("DELETE MEMBER - Successfully deleted");
    return NextResponse.json({
      success: true,
      message: "Member removed from event successfully",
    });
  } catch (error) {
    console.error("MEMBER DELETE ERROR:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
