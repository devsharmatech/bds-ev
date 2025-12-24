// app/api/dashboard/membership-info/route.js
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

    // Fetch user membership data
    const { data: user, error } = await supabase
      .from("users")
      .select(`
        id,
        full_name,
        email,
        phone,
        membership_code,
        membership_type,
        membership_status,
        membership_expiry_date,
        created_at,
        member_profiles (
          specialty,
          position,
          employer,
          membership_date
        )
      `)
      .eq("id", userId)
      .single();

    if (error) throw error;

    // Fetch latest membership payment
    const { data: latestPayment } = await supabase
      .from("membership_payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Format response
    const formattedUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      membership_code: user.membership_code,
      membership_type: user.membership_type,
      membership_status: user.membership_status,
      membership_expiry_date: user.membership_expiry_date,
      created_at: user.created_at,
      specialty: user.member_profiles?.[0]?.specialty,
      position: user.member_profiles?.[0]?.position,
      employer: user.member_profiles?.[0]?.employer,
      membership_date: user.member_profiles?.[0]?.membership_date,
      latest_payment: latestPayment || null
    };

    return NextResponse.json({
      success: true,
      user: formattedUser
    });

  } catch (error) {
    console.error("MEMBERSHIP INFO ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch membership information" },
      { status: 500 }
    );
  }
}