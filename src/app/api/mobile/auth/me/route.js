import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabaseAdmin";
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";

export async function GET(req) {
  try {
    // Read token from Authorization: Bearer <token> header
    const decoded = verifyTokenMobile(req);
    
    // Fetch user from DB with member_profiles for pricing category
    const { data: user, error } = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        full_name_ar,
        email,
        profile_image,
        role,
        membership_type,
        membership_status,
        membership_expiry_date,
        device_token,
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

    // Return safe user object with pricing-related fields
    return NextResponse.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        full_name_ar: user.full_name_ar,
        email: user.email,
        profile_image: user.profile_image || null,
        profile_image_url: user.profile_image || null,
        role: user.role,
        membership_type: user.membership_type,
        membership_status: user.membership_status || null,
        membership_expiry_date: user.membership_expiry_date,
        device_token: user.device_token || null,
        category: memberProfile.category || null,
        position: memberProfile.position || null,
        specialty: memberProfile.specialty || null,
        nationality: memberProfile.nationality || null,
        work_sector: memberProfile.work_sector || null,
      },
    });
  } catch (err) {
    console.error("MOBILE AUTH_ME_ERROR:", err);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
