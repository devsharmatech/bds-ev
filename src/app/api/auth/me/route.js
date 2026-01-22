import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    // 1️⃣ Read token from HTTP-only cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // 2️⃣ Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    // 3️⃣ Fetch user from DB with member_profiles for pricing category
    const { data: user, error } = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        full_name_ar,
        email,
        role,
        membership_type,
        membership_status,
        membership_expiry_date,
        member_profiles!member_profiles_user_id_fkey(
          category,
          position,
          specialty,
          nationality,
          work_sector
        )
      `
      )
      .eq("id", decoded.user_id)
      .single();

    if (error || !user) {
      return NextResponse.json({ user: null, error }, { status: 404 });
    }

    // Flatten member_profiles data
    const memberProfile = user.member_profiles || {};

    // 4️⃣ Return safe user object with pricing-related fields
    return NextResponse.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        full_name_ar: user.full_name_ar,
        email: user.email,
        role: user.role,
        membership_type: user.membership_type,
        membership_status: user.membership_status || null,
        membership_expiry_date: user.membership_expiry_date,
        category: memberProfile.category || null,
        position: memberProfile.position || null,
        specialty: memberProfile.specialty || null,
        nationality: memberProfile.nationality || null,
        work_sector: memberProfile.work_sector || null,
      },
    });
  } catch (err) {
    console.error("AUTH_ME_ERROR:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
