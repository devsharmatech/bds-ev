
import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// GET single member details
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
    const { id, memberId } = await params;
    const eventId = id;

    // Get member details with user info and attendance logs
    const { data: member, error } = await supabase
      .from("event_members")
      .select(
        `
        *,
        users (
          id,
          full_name,
          email,
          phone,
          mobile,
          profile_image,
          membership_code,
          membership_status,
          membership_type,
          member_profiles (
            gender,
            dob,
            city,
            state,
            employer,
            position
          )
        ),
        attendance_logs (
          id,
          scanned_by,
          location,
          device_info,
          scan_time,
          scanner:users!attendance_logs_scanned_by_fkey (
            id,
            full_name,
            email
          )
        )
      `
      )
      .eq("id", memberId)
      .eq("event_id", eventId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, message: "Member not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      member,
    });
  } catch (error) {
    console.error("EVENT MEMBER GET ERROR:", error);

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

// UPDATE member (check-in, update details) - Updated to create attendance logs
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, memberId } = await params; 
    const eventId = id;
    const data = await req.json();

    console.log("PUT Member Update:", {
      eventId,
      memberId,
      updates: data,
      user: decoded.user_id
    });

    // Get current member data to check previous state
    const { data: currentMember, error: fetchError } = await supabase
      .from("event_members")
      .select("checked_in, checked_in_at, token, user_id")
      .eq("id", memberId)
      .eq("event_id", eventId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      );
    }

    const updates = {};
    let shouldCreateAttendanceLog = false;
    let attendanceAction = ""; // 'check-in' or 'check-out'

    // Handle check-in/out
    if (typeof data.checked_in === "boolean") {
      // Only create attendance log if status is changing
      if (currentMember.checked_in !== data.checked_in) {
        shouldCreateAttendanceLog = true;
        attendanceAction = data.checked_in ? "check-in" : "check-out";
        
        updates.checked_in = data.checked_in;
        updates.checked_in_at = data.checked_in ? new Date().toISOString() : null;
      }
    }
    
    if (data.price_paid !== undefined) updates.price_paid = data.price_paid;
    if (data.is_member !== undefined) updates.is_member = data.is_member;

    // Start a transaction (Supabase doesn't have transactions, so we'll do sequential operations)
    try {
      // Update member
      const { data: updatedMember, error: updateError } = await supabase
        .from("event_members")
        .update(updates)
        .eq("id", memberId)
        .eq("event_id", eventId)
        .select(
          `
          *,
          users (
            id,
            full_name,
            email,
            phone,
            mobile,
            profile_image,
            membership_code,
            membership_status
          )
        `
        )
        .single();

      if (updateError) throw updateError;

      // Create attendance log if needed
      if (shouldCreateAttendanceLog) {
        const attendanceData = {
          event_member_id: memberId,
          scanned_by: decoded.user_id, 
          scan_time: new Date().toISOString(),
          location: "Manual Check-in", 
          device_info: navigator?.userAgent || "Web Admin",
          notes: attendanceAction === "check-in" 
            ? "Manually checked in by admin" 
            : "Manually checked out by admin"
        };

        console.log("Creating attendance log:", attendanceData);

        const { data: attendanceLog, error: logError } = await supabase
          .from("attendance_logs")
          .insert(attendanceData)
          .select(`
            *,
            scanner:users!attendance_logs_scanned_by_fkey (
              id,
              full_name,
              email
            )
          `)
          .single();

        if (logError) {
          console.error("Error creating attendance log:", logError);
          // Don't fail the whole request if log creation fails
          // Just log it and continue
        }

        return NextResponse.json({
          success: true,
          member: updatedMember,
          attendance_log: attendanceLog || null,
          message: attendanceAction === "check-in" 
            ? "Member checked in successfully" 
            : "Member checked out successfully",
        });
      }

      return NextResponse.json({
        success: true,
        member: updatedMember,
        message: "Member updated successfully",
      });

    } catch (error) {
      console.error("Error in member update transaction:", error);
      throw error;
    }

  } catch (error) {
    console.error("EVENT MEMBER UPDATE ERROR:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update member: " + error.message },
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
