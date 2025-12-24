import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const event_id = searchParams.get("event_id");

  if (!event_id) {
    return NextResponse.json(
      { success: false, message: "event_id required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("attendance_logs")
    .select(`
      scan_time,
      location,
      device_info,
      event_members(
        token,
        users(full_name, email)
      )
    `)
    .eq("event_members.event_id", event_id);

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
