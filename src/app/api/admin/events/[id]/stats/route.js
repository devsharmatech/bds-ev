import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// GET event statistics
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

    // Get event details
    const { data: event } = await supabase
      .from("events")
      .select("capacity, is_paid")
      .eq("id", eventId)
      .single();

    // Get total members count
    const { count: totalMembers } = await supabase
      .from("event_members")
      .select("*", { count: 'exact', head: true })
      .eq("event_id", eventId);

    // Get checked-in members count
    const { count: checkedInMembers } = await supabase
      .from("event_members")
      .select("*", { count: 'exact', head: true })
      .eq("event_id", eventId)
      .eq("checked_in", true);

    // Get members by type (paid members have price_paid > 0)
    const { count: paidMembers } = await supabase
      .from("event_members")
      .select("*", { count: 'exact', head: true })
      .eq("event_id", eventId)
      .gt("price_paid", 0);

    // Get payment pending members count (for paid events - members with no payment)
    let paymentPendingMembers = 0;
    if (event?.is_paid) {
      const { count: pendingCount } = await supabase
        .from("event_members")
        .select("*", { count: 'exact', head: true })
        .eq("event_id", eventId)
        .or("price_paid.is.null,price_paid.eq.0");
      paymentPendingMembers = pendingCount || 0;
    }

    // Get event member IDs for this event
    const { data: eventMembers } = await supabase
      .from("event_members")
      .select("id")
      .eq("event_id", eventId);

    const eventMemberIds = eventMembers?.map(m => m.id) || [];

    // Get attendance logs count
    let attendanceLogs = 0;
    let recentCheckins = 0;
    
    if (eventMemberIds.length > 0) {
      const { count: logsCount } = await supabase
        .from("attendance_logs")
        .select("*", { count: 'exact', head: true })
        .in("event_member_id", eventMemberIds);
      attendanceLogs = logsCount || 0;

      // Get recent check-ins (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: recentCount } = await supabase
        .from("attendance_logs")
        .select("*", { count: 'exact', head: true })
        .in("event_member_id", eventMemberIds)
        .gte("scan_time", yesterday.toISOString());
      recentCheckins = recentCount || 0;
    }

    const stats = {
      total_members: totalMembers || 0,
      checked_in_members: checkedInMembers || 0,
      paid_members: paidMembers || 0,
      payment_pending_members: paymentPendingMembers,
      attendance_logs: attendanceLogs || 0,
      recent_checkins: recentCheckins || 0,
      remaining_capacity: event?.capacity ? event.capacity - (totalMembers || 0) : null,
      checkin_rate: totalMembers ? ((checkedInMembers || 0) / totalMembers * 100).toFixed(1) + '%' : '0%',
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error("EVENT STATS ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch event statistics" },
      { status: 500 }
    );
  }
}