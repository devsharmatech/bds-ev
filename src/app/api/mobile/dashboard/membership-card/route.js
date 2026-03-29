// app/api/dashboard/membership-card/route.js
import { supabase } from "@/lib/supabaseAdmin";
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";
import { NextResponse } from "next/server";
import PDFDocument from 'pdfkit';
import path from 'path';

const getFontPath = (fontName) => path.join(process.cwd(), 'node_modules', 'pdfkit', 'js', 'data', `${fontName}.afm`);

export async function GET(req) {
  try {
    /* ---------- AUTHENTICATION ---------- */
    const decoded = verifyTokenMobile(req);
    const userId = decoded.user_id;

    /* ---------- FETCH USER DATA ---------- */
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(`
        id,
        full_name,
        membership_code,
        membership_type,
        membership_status,
        membership_expiry_date,
        member_profiles (
          specialty,
          position,
          employer
        )
      `)
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Instead of unstable PDFKit, redirect to the professional Canva-style membership card view page
    const viewUrl = new URL(`/membership-card/view`, req.url);
    return NextResponse.redirect(viewUrl);

  } catch (error) {
    console.error("MEMBERSHIP CARD ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to generate membership card" },
      { status: 500 }
    );
  }
}