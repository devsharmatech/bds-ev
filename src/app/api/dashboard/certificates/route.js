// app/api/dashboard/certificates/route.js
import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req) {
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
    const userId = decoded.user_id;

    // Fetch events where user has checked in
    const { data: events, error } = await supabase
      .from("event_members")
      .select(`
        id,
        checked_in_at,
        events (
          id,
          title,
          start_datetime,
          end_datetime,
          venue_name
        )
      `)
      .eq("user_id", userId)
      .eq("checked_in", true)
      .order("checked_in_at", { ascending: false });

    if (error) throw error;

    // Format certificates data
    const certificates = (events || []).map(item => ({
      id: item.id,
      event_id: item.events?.id,
      event_title: item.events?.title,
      event_date: item.events?.start_datetime,
      venue_name: item.events?.venue_name,
      checked_in_at: item.checked_in_at,
      certificate_id: `CERT-${item.id.slice(0, 8).toUpperCase()}`
    })).filter(cert => cert.event_id);

    return NextResponse.json({
      success: true,
      certificates: certificates,
      count: certificates.length
    });

  } catch (error) {
    console.error("CERTIFICATES API ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}