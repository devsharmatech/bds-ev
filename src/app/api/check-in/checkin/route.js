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

    const { type, event_id, token: eventToken, membership_id, agenda_id } = await req.json();

    if (!type) {
      return NextResponse.json(
        { success: false, message: "Check-in type required" },
        { status: 400 }
      );
    }

    // EVENT CHECK-IN
    if (type === "EVENT_CHECKIN") {
      if (!eventToken) {
        return NextResponse.json(
          { success: false, message: "Event token required" },
          { status: 400 }
        );
      }

      // Build query to find event member
      let memberQuery = supabase
        .from("event_members")
        .select(`
          *,
          events (
            *,
            event_agendas (*)
          )
        `)
        .eq("token", eventToken);

      // If event_id is provided, verify it matches
      if (event_id) {
        memberQuery = memberQuery.eq("event_id", event_id);
      }

      const { data: eventMember, error: memberError } = await memberQuery.single();

      if (memberError || !eventMember) {
        return NextResponse.json(
          { success: false, message: "Invalid event token" },
          { status: 404 }
        );
      }

      // Verify event_id matches if provided
      if (event_id && eventMember.event_id !== event_id) {
        return NextResponse.json(
          { success: false, message: "Token does not belong to this event" },
          { status: 400 }
        );
      }

      // For multi-day events, allow daily check-ins
      // Check if event is multi-day
      const eventStart = new Date(eventMember.events.start_datetime);
      const eventEnd = eventMember.events.end_datetime ? new Date(eventMember.events.end_datetime) : null;
      const isMultiDay = eventEnd && (eventEnd - eventStart) > 24 * 60 * 60 * 1000; // More than 24 hours

      // Resolve agenda automatically when not explicitly provided:
      // - If there are agendas today, pick the earliest today's agenda
      // - Else pick the nearest upcoming agenda
      // - Else fall back to first agenda (if any)
      let resolvedAgendaId = agenda_id || null;
      try {
        if (!resolvedAgendaId) {
          const agendas = eventMember?.events?.event_agendas || [];

          if (agendas.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const now = new Date();

            const todaysAgendas = agendas.filter(a => a.agenda_date === today);
            const toDateTime = (a) => {
              const hhmm = (a.start_time || '00:00').slice(0, 5);
              // Construct local datetime; exact TZ alignment is not critical for ordering
              return new Date(`${a.agenda_date}T${hhmm}:00`);
            };

            if (todaysAgendas.length > 0) {
              // Prefer earliest today's agenda
              todaysAgendas.sort((a, b) => {
                const ta = toDateTime(a).getTime();
                const tb = toDateTime(b).getTime();
                return ta - tb;
              });
              resolvedAgendaId = todaysAgendas[0].id;
            } else {
              // Find nearest upcoming agenda
              const withDt = agendas
                .map(a => ({ a, dt: toDateTime(a) }))
                .sort((x, y) => x.dt.getTime() - y.dt.getTime());

              const upcoming = withDt.find(x => x.dt >= now);
              if (upcoming) {
                resolvedAgendaId = upcoming.a.id;
              } else {
                // Fallback to first agenda if all are in the past
                resolvedAgendaId = agendas[0].id;
              }
            }
          }
        }
      } catch {
        // If resolution fails, keep resolvedAgendaId as null and proceed with main event check-in
      }
      
      // For main event check-in (not agenda-specific)
      if (!resolvedAgendaId) {
        // If already checked in, check if it's a multi-day event and allow daily check-ins
        if (eventMember.checked_in) {
          if (isMultiDay) {
            // Check if there's already a check-in today
            const today = new Date().toISOString().split('T')[0];
            const { data: todayCheckin } = await supabase
              .from("attendance_logs")
              .select("*")
              .eq("event_member_id", eventMember.id)
              .is("agenda_id", null) // only count main event check-ins for daily duplication
              .gte("scan_time", `${today}T00:00:00`)
              .lt("scan_time", `${today}T23:59:59`)
              .maybeSingle();

            if (todayCheckin) {
              return NextResponse.json({
                success: false,
                message: "Already checked in today. You can check in again tomorrow."
              });
            }
            // Allow check-in for multi-day events (different day)
          } else {
            // Single-day event - already checked in
            return NextResponse.json({
              success: false,
              message: "Already checked in to event"
            });
          }
        }
      }

      // For agenda check-in, check if already checked in to this agenda for today (allow multiple days before the agenda date)
      if (resolvedAgendaId) {
        // Verify agenda belongs to this event and capture its date
        const agendaObj = eventMember.events.event_agendas?.find(
          agenda => agenda.id === resolvedAgendaId
        );

        if (!agendaObj) {
          return NextResponse.json(
            { success: false, message: "Invalid agenda for this event" },
            { status: 400 }
          );
        }

        const today = new Date().toISOString().split('T')[0];
        const agendaDateStr = agendaObj.agenda_date;

        // Only block duplicate agenda check-ins within the same day
        const { data: existingAgendaCheckin } = await supabase
          .from("attendance_logs")
          .select("*")
          .eq("event_member_id", eventMember.id)
          .eq("agenda_id", resolvedAgendaId)
          .gte("scan_time", `${today}T00:00:00`)
          .lt("scan_time", `${today}T23:59:59`)
          .maybeSingle();

        if (existingAgendaCheckin) {
          // Customize message based on agenda timing
          let duplicateMsg = "Already checked in to this agenda";
          if (agendaDateStr > today) {
            duplicateMsg = "You have already checked in for this upcoming agenda";
          } else if (agendaDateStr === today) {
            duplicateMsg = "You have already checked in to this agenda today";
          }
          return NextResponse.json({
            success: false,
            message: duplicateMsg
          });
        }

        // If agenda is in the future, still allow today's check-in (will be logged against that agenda)
      }

      const now = new Date().toISOString();

      // Update event_members table for main check-in
      if (!resolvedAgendaId) {
        const { error: updateError } = await supabase
          .from("event_members")
          .update({
            checked_in: true,
            checked_in_at: now
          })
          .eq("id", eventMember.id);

        if (updateError) throw updateError;
      } else {
        // For first agenda check-in, ensure member status reflects checked-in
        if (!eventMember.checked_in || !eventMember.checked_in_at) {
          const { error: agendaUpdateError } = await supabase
            .from("event_members")
            .update({
              checked_in: true,
              checked_in_at: eventMember.checked_in_at || now
            })
            .eq("id", eventMember.id);
          if (agendaUpdateError) throw agendaUpdateError;
        }
      }

      // Create attendance log
      const logPayload = {
        event_member_id: eventMember.id,
        scanned_by: adminId,
        agenda_id: resolvedAgendaId || null,
        location: "Bahrain", // You can get this from GPS or user input
        device_info: resolvedAgendaId ? "Web Check-in (Agenda)" : "Web Check-in",
        scan_time: now
      };

      const { error: logError } = await supabase
        .from("attendance_logs")
        .insert(logPayload);

      if (logError) throw logError;

      return NextResponse.json({
        success: true,
        message: resolvedAgendaId ? "Agenda check-in successful" : "Event check-in successful",
        data: {
          event_member_id: eventMember.id,
          checked_in_at: now,
          agenda_id: resolvedAgendaId || null
        }
      });
    }

    // MEMBERSHIP VERIFICATION JOIN EVENT
    else if (type === "MEMBERSHIP_VERIFICATION") {
      if (!membership_id || !event_id) {
        return NextResponse.json(
          { success: false, message: "Membership ID and Event ID required" },
          { status: 400 }
        );
      }

      // Verify membership
      const { data: member, error: memberError } = await supabase
        .from("users")
        .select("*")
        .eq("membership_code", membership_id)
        .single();

      if (memberError || !member) {
        return NextResponse.json(
          { success: false, message: "Invalid membership" },
          { status: 404 }
        );
      }

      // Check if member is already registered for event
      const { data: existingRegistration } = await supabase
        .from("event_members")
        .select("*")
        .eq("event_id", event_id)
        .eq("user_id", member.id)
        .maybeSingle();

      if (existingRegistration) {
        return NextResponse.json({
          success: false,
          message: "Member already registered for this event"
        });
      }

      // Verify event exists and is active
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", event_id)
        .single();

      if (eventError || !event) {
        return NextResponse.json(
          { success: false, message: "Invalid event" },
          { status: 404 }
        );
      }

      const eventStart = new Date(event.start_datetime);
      const eventEnd = event.end_datetime ? new Date(event.end_datetime) : null;
      const now = new Date();

      if (event.status === "cancelled") {
        return NextResponse.json({
          success: false,
          message: "Event has been cancelled"
        });
      }

      if (eventEnd && now > eventEnd) {
        return NextResponse.json({
          success: false,
          message: "Event has ended"
        });
      }

      if (now < eventStart) {
        return NextResponse.json({
          success: false,
          message: "Event has not started yet"
        });
      }

      // Check event capacity
      if (event.capacity) {
        const { count: currentAttendees } = await supabase
          .from("event_members")
          .select("*", { count: "exact", head: true })
          .eq("event_id", event_id);

        if (currentAttendees >= event.capacity) {
          return NextResponse.json({
            success: false,
            message: "Event is at full capacity"
          });
        }
      }

      // Generate unique token
      const token = Math.random().toString(36).substr(2, 6).toUpperCase();

      // Register member for event
      const { data: newRegistration, error: registerError } = await supabase
        .from("event_members")
        .insert({
          event_id: event_id,
          user_id: member.id,
          token: token,
          is_member: true,
          price_paid: event.is_paid ? event.member_price || event.regular_price : 0,
          joined_at: now,
          checked_in: true,
          checked_in_at: now
        })
        .select()
        .single();

      if (registerError) throw registerError;

      // Create attendance log
      const { error: logError } = await supabase
        .from("attendance_logs")
        .insert({
          event_member_id: newRegistration.id,
          scanned_by: adminId,
          location: "Bahrain",
          device_info: "Web Check-in (Membership)",
          scan_time: now
        });

      if (logError) throw logError;

      return NextResponse.json({
        success: true,
        message: "Member successfully registered and checked in",
        data: {
          event_member_id: newRegistration.id,
          token: token,
          checked_in_at: now
        }
      });
    }

    // Invalid type
    else {
      return NextResponse.json(
        { success: false, message: "Invalid check-in type" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("CHECK-IN ERROR:", error);
    
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Check-in failed" },
      { status: 500 }
    );
  }
}