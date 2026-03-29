// app/api/dashboard/certificates/[id]/route.js
import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import PDFDocument from 'pdfkit';
import path from 'path';

const getFontPath = (fontName) => path.join(process.cwd(), 'node_modules', 'pdfkit', 'js', 'data', `${fontName}.afm`);

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
    const userId = decoded.user_id;
    const {id} = await params;
    const eventId = id;

    // Verify user attended this event
    const { data: eventMember, error } = await supabase
      .from("event_members")
      .select(`
        id,
        checked_in,
        checked_in_at,
        events (
          title,
          start_datetime,
          end_datetime,
          venue_name
        ),
        users (
          full_name
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

    // Instead of unstable PDFKit or authenticated views, redirect to the PUBLIC mobile-optimized view page
    const viewUrl = new URL(`/certificates/public/view/${eventMember.id}`, req.url);
    return NextResponse.redirect(viewUrl);

  } catch (error) {
    console.error("CERTIFICATE ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}