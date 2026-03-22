import { supabase } from "@/lib/supabaseAdmin";
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";
import { NextResponse } from "next/server";
export async function POST(req) {
  try {
    /* --------- STAFF AUTH --------- */
    const decoded = verifyTokenMobile(req);

    /* --------- INPUT --------- */
    const { event_member_code, location, device_info } = await req.json();

    if (!event_member_code) {
      return NextResponse.json(
        { success: false, message: "Event member code required" },
        { status: 400 }
      );
    }

    /* --------- FIND MEMBER --------- */
    const { data: eventMember } = await supabase
      .from("event_members")
      .select("*")
      .eq("token", event_member_code)
      .single();

    if (!eventMember) {
      return NextResponse.json(
        { success: false, message: "Invalid code" },
        { status: 404 }
      );
    }

    if (eventMember.checked_in) {
      return NextResponse.json(
        { success: false, message: "Already checked in" },
        { status: 409 }
      );
    }

    /* --------- UPDATE CHECK-IN --------- */
    await supabase
      .from("event_members")
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      })
      .eq("id", eventMember.id);

    /* --------- LOG HISTORY --------- */
    await supabase.from("attendance_logs").insert({
      event_member_id: eventMember.id,
      scanned_by: decoded.id,
      location,
      device_info,
    });

    return NextResponse.json({
      success: true,
      message: "Check-in successful",
    });
  } catch (err) {
    console.error("CHECK-IN ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
