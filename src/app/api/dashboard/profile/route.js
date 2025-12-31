// app/api/dashboard/profile/route.js
import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// GET profile data
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

    // Fetch user with profile data
    const { data: user, error } = await supabase
      .from("users")
      .select(`
        id,
        email,
        full_name,
        phone,
        mobile,
        profile_image,
        membership_code,
        membership_status,
        membership_type,
        membership_expiry_date,
        created_at,
        member_profiles (
          gender,
          dob,
          address,
          city,
          state,
          pin_code,
          cpr_id,
          nationality,
          type_of_application,
          membership_date,
          work_sector,
          employer,
          position,
          specialty,
          category,
          license_number,
          years_of_experience
        )
      `)
      .eq("id", userId)
      .single();

    if (error) throw error;

    // Normalize relation (member_profiles may be an array)
    const profile = Array.isArray(user?.member_profiles) ? user.member_profiles[0] : user?.member_profiles;

    // Format user data
    const formattedUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      mobile: user.mobile,
      // prefer 'profile_image', fallback to 'profile_picture'
      profile_image: user.profile_image || user.profile_picture || null,
      membership_code: user.membership_code,
      membership_status: user.membership_status,
      membership_type: user.membership_type,
      membership_expiry_date: user.membership_expiry_date,
      created_at: user.created_at,
      // Flatten member_profiles
      gender: profile?.gender,
      dob: profile?.dob,
      address: profile?.address,
      city: profile?.city,
      state: profile?.state,
      pin_code: profile?.pin_code,
      cpr_id: profile?.cpr_id,
      nationality: profile?.nationality,
      type_of_application: profile?.type_of_application,
      membership_date: profile?.membership_date,
      work_sector: profile?.work_sector,
      employer: profile?.employer,
      position: profile?.position,
      specialty: profile?.specialty,
      category: profile?.category,
      license_number: profile?.license_number,
      years_of_experience: profile?.years_of_experience
    };

    return NextResponse.json({
      success: true,
      user: formattedUser
    });

  } catch (error) {
    console.error("PROFILE GET ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// UPDATE profile data
export async function PUT(req) {
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
    const data = await req.json();

    // Update users table
    const { error: userError } = await supabase
      .from("users")
      .update({
        full_name: data.full_name,
        phone: data.phone,
        mobile: data.mobile,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (userError) throw userError;

    // Check if member_profiles record exists
    const { data: existingProfile } = await supabase
      .from("member_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const profileUpdate = {
        gender: data.gender,
        dob: data.dob,
        address: data.address,
        city: data.city,
        state: data.state,
        pin_code: data.pin_code,
        cpr_id: data.cpr_id,
        nationality: data.nationality,
        type_of_application: data.type_of_application,
        work_sector: data.work_sector,
        employer: data.employer,
        position: data.position,
        specialty: data.specialty,
        category: data.category,
        license_number: data.license_number,
        years_of_experience: data.years_of_experience
      };

      const { error: profileError } = await supabase
        .from("member_profiles")
        .update(profileUpdate)
        .eq("user_id", userId);

      if (profileError) throw profileError;
    } else {
      // Create new profile
      const profileInsert = {
        user_id: userId,
        gender: data.gender,
        dob: data.dob,
        address: data.address,
        city: data.city,
        state: data.state,
        pin_code: data.pin_code,
        cpr_id: data.cpr_id,
        nationality: data.nationality,
        type_of_application: data.type_of_application,
        membership_date: data.membership_date,
        work_sector: data.work_sector,
        employer: data.employer,
        position: data.position,
        specialty: data.specialty,
        category: data.category,
        license_number: data.license_number,
        years_of_experience: data.years_of_experience
      };

      const { error: profileError } = await supabase
        .from("member_profiles")
        .insert(profileInsert);

      if (profileError) throw profileError;
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}