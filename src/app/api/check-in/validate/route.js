// app/api/check-in/validate/route.js
import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req) {
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
    const adminId = decoded.user_id;

    // Verify admin role
    const { data: admin } = await supabase
      .from("users")
      .select("role")
      .eq("id", adminId)
      .single();

    if (admin?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { qrValue } = await req.json();

    if (!qrValue || !qrValue.type) {
      return NextResponse.json(
        { success: false, message: "Invalid QR code data" },
        { status: 400 }
      );
    }

    // EVENT_CHECKIN validation
    if (qrValue.type === "EVENT_CHECKIN") {
      let validationData = null;

      // If token is provided, validate by token
      if (qrValue.token) {
        const { data: eventMember, error: memberError } = await supabase
          .from("event_members")
          .select(`
            *,
            users (
              id,
              email,
              full_name,
              membership_code
            ),
            events (
              *,
              event_agendas (*)
            )
          `)
          .eq("token", qrValue.token)
          .maybeSingle();

        if (memberError || !eventMember) {
          return NextResponse.json(
            { success: false, message: "Invalid event token" },
            { status: 404 }
          );
        }

        // Check if event is active
        const eventStart = new Date(eventMember.events.start_datetime);
        const eventEnd = eventMember.events.end_datetime 
          ? new Date(eventMember.events.end_datetime) 
          : null;
        const now = new Date();

        if (eventMember.events.status === "cancelled") {
          return NextResponse.json({
            success: false,
            message: "Event has been cancelled"
          });
        }

        const eventStatus = (eventMember.events.status || "").toLowerCase();

        if (eventEnd && now > eventEnd) {
          return NextResponse.json({
            success: false,
            message: "Event has ended"
          });
        }

        // If status is "ongoing", treat the event as started even if time hasn't reached start time yet
        if (now < eventStart && eventStatus !== "ongoing") {
          return NextResponse.json({
            success: false,
            message: "Event has not started yet"
          });
        }

        // Get today's agendas
        const today = new Date().toISOString().split('T')[0];
        const todayAgendas = eventMember.events.event_agendas?.filter(
          agenda => agenda.agenda_date === today
        ) || [];

        // Get check-in history
        const { data: attendanceLogs } = await supabase
          .from("attendance_logs")
          .select("*")
          .eq("event_member_id", eventMember.id);

        const checkedInAgendas = attendanceLogs
          ?.map(log => log.agenda_id)
          .filter(id => id) || [];

        // Derive a friendly validation message based on check-in history and agendas
        const agendas = eventMember.events.event_agendas || [];
        const checkedSet = new Set(checkedInAgendas);
        const hasCheckedTodayAgenda = agendas.some(
          a => a.agenda_date === today && checkedSet.has(a.id)
        );
        const hasCheckedFutureAgenda = agendas.some(
          a => a.agenda_date > today && checkedSet.has(a.id)
        );
        const hasMainEventCheckinToday = (attendanceLogs || []).some(
          log => !log.agenda_id && (log.scan_time || '').slice(0, 10) === today
        );

        let validationMessage = "Event validation successful";
        if (hasMainEventCheckinToday || hasCheckedTodayAgenda) {
          validationMessage = "You already checked in for today's event";
        } else if (hasCheckedFutureAgenda) {
          validationMessage = "You have already checked in for this upcoming agenda";
        } else if (eventMember.checked_in) {
          validationMessage = "You are already checked in to this event";
        }

        validationData = {
          type: "event",
          token: eventMember.token,
          event_id: eventMember.event_id,
          user_id: eventMember.user_id,
          user_name: eventMember.users.full_name,
          user_email: eventMember.users.email,
          membership_code: eventMember.users.membership_code,
          checkedIn: eventMember.checked_in,
          checked_in_at: eventMember.checked_in_at,
          is_member: eventMember.is_member,
          price_paid: eventMember.price_paid,
          event: eventMember.events,
          today_agendas: todayAgendas,
          agenda_checked_in: checkedInAgendas,
          can_check_in: !eventMember.checked_in || todayAgendas.length > 0,
          validation_message: validationMessage
        };
      }
      // If event_id is provided without token (for membership verification)
      else if (qrValue.event_id) {
        // Validate event exists
        const { data: event, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", qrValue.event_id)
          .single();

        if (eventError || !event) {
          return NextResponse.json(
            { success: false, message: "Invalid event" },
            { status: 404 }
          );
        }

        validationData = {
          type: "event_info",
          event_id: event.id,
          event: event,
          can_join: true // Members can join any event
        };
      } else {
        return NextResponse.json(
          { success: false, message: "Token or event ID required" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: validationData?.validation_message || "Event validation successful",
        data: validationData
      });
    }

    // MEMBERSHIP_VERIFICATION validation
    else if (qrValue.type === "MEMBERSHIP_VERIFICATION") {
      if (!qrValue.membership_id) {
        return NextResponse.json(
          { success: false, message: "Membership ID required" },
          { status: 400 }
        );
      }

      // Find user by membership code
      const { data: user, error: userError } = await supabase
        .from("users")
        .select(`
          *,
          member_profiles (*)
        `)
        .eq("membership_code", qrValue.membership_id)
        .maybeSingle();

      if (userError || !user) {
        return NextResponse.json(
          { success: false, message: "Invalid membership code" },
          { status: 404 }
        );
      }

      // Check membership status
      if (user.membership_status !== "active") {
        return NextResponse.json({
          success: false,
          message: `Membership is ${user.membership_status}`
        });
      }

      // Check expiry date
      const today = new Date();
      const expiryDate = new Date(user.membership_expiry_date);
      const isExpired = expiryDate < today;

      return NextResponse.json({
        success: true,
        message: "Membership validation successful",
        data: {
          type: "membership",
          membership_id: user.membership_code,
          member_id: user.id,
          member_name: user.full_name,
          member_email: user.email,
          member_type: user.membership_type,
          expiry_date: user.membership_expiry_date,
          is_expired: isExpired,
          member_since: user.member_profiles?.membership_date,
          can_join_events: !isExpired || user.membership_type === "free"
        }
      });
    }

    // Invalid type
    else {
      return NextResponse.json(
        { success: false, message: "Invalid QR code type" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("CHECK-IN VALIDATION ERROR:", error);
    
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Validation failed" },
      { status: 500 }
    );
  }
}