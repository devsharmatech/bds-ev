import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// GET attendance logs for an event
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = await params;
    const eventId = id;
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get attendance logs
    const { data: logs, error } = await supabase
      .from("attendance_logs")
      .select(`
        *,
        event_members!inner (
          id,
          token,
          checked_in,
          checked_in_at,
          users (
            id,
            full_name,
            email,
            phone,
            mobile,
            profile_image,
            membership_code
          )
        ),
        scanner:users!attendance_logs_scanned_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq("event_members.event_id", eventId)
      .order("scan_time", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get total count
    const { count } = await supabase
      .from("attendance_logs")
      .select("*", { count: 'exact', head: true })
      .eq("event_members.event_id", eventId);

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error("ATTENDANCE GET ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch attendance logs" },
      { status: 500 }
    );
  }
}

// RECORD attendance (scan member)
export async function POST(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = await params;
    const eventId = id;
    const data = await req.json();

    // Validate required fields
    if (!data.token || !data.scanned_by) {
      return NextResponse.json(
        { success: false, message: "Token and scanner ID are required" },
        { status: 400 }
      );
    }

    // Check event start time: allow check-in only within 5 hours before start
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, start_datetime")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      console.error("ATTENDANCE RECORD ERROR - Event fetch:", eventError);
      return NextResponse.json(
        { success: false, message: "Event not found for attendance" },
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
              "Check-in is not open yet. Attendance can be recorded only within 5 hours before the event start time.",
          },
          { status: 400 }
        );
      }
    }

    // Find event member by token
    const { data: eventMember, error: memberError } = await supabase
      .from("event_members")
      .select("id, checked_in, event_id")
      .eq("token", data.token)
      .eq("event_id", eventId)
      .single();

    if (memberError) {
      if (memberError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: "Invalid token or member not registered for this event" },
          { status: 404 }
        );
      }
      throw memberError;
    }

    // Create attendance log
    const { data: attendanceLog, error: logError } = await supabase
      .from("attendance_logs")
      .insert({
        event_member_id: eventMember.id,
        scanned_by: data.scanned_by,
        location: data.location,
        device_info: data.device_info,
        scan_time: new Date().toISOString(),
      })
      .select(`
        *,
        event_members!inner (
          id,
          token,
          checked_in,
          checked_in_at,
          users (
            id,
            full_name,
            email,
            phone,
            mobile,
            profile_image,
            membership_code
          )
        ),
        scanner:users!attendance_logs_scanned_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .single();

    if (logError) throw logError;

    // Update member's checked-in status if not already checked in
    if (!eventMember.checked_in) {
      await supabase
        .from("event_members")
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq("id", eventMember.id);
    }

    return NextResponse.json({
      success: true,
      log: attendanceLog,
      message: "Attendance recorded successfully"
    });

  } catch (error) {
    console.error("ATTENDANCE RECORD ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to record attendance" },
      { status: 500 }
    );
  }
}