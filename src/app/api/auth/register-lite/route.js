import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return typeof phone === "string" && phone.trim().length >= 6;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      full_name,
      email,
      phone,
      cpr_id,
      gender = null,
      dob = null,
      nationality = null,
      address = null,
      city = null,
      state = null,
      pin_code = null,
      work_sector = null,
      employer = null,
      position = null,
      specialty = null,
      category = null,
    } = body;

    if (!full_name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: "full_name, email, phone are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Duplicate checks
    const { data: userByEmail } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (userByEmail) {
      return NextResponse.json(
        { success: false, code: "DUP_EMAIL", message: "Email already registered. Please login." },
        { status: 409 }
      );
    }

    const { data: userByPhone } = await supabase
      .from("users")
      .select("id")
      .or(`phone.eq.${phone},mobile.eq.${phone}`)
      .maybeSingle();
    if (userByPhone) {
      return NextResponse.json(
        { success: false, code: "DUP_PHONE", message: "Phone already registered. Please login." },
        { status: 409 }
      );
    }

    if (cpr_id) {
      const { data: profileByCPR } = await supabase
        .from("member_profiles")
        .select("id")
        .eq("cpr_id", cpr_id)
        .maybeSingle();
      if (profileByCPR) {
        return NextResponse.json(
          { success: false, code: "DUP_CPR", message: "CPR already registered. Please login." },
          { status: 409 }
        );
      }
    }

    // Create user with random password (user can reset later)
    const randomPassword = `Tmp!${Math.random().toString(36).slice(2, 10)}@${Date.now().toString().slice(-4)}`;
    const password_hash = await bcrypt.hash(randomPassword, 10);

    const { data: newUser, error: userInsertError } = await supabase
      .from("users")
      .insert({
        email,
        password_hash,
        role: "member",
        full_name,
        phone,
        mobile: phone,
        membership_type: "free",
        membership_status: "active",
      })
      .select("id, email, full_name, phone, membership_type")
      .single();

    if (userInsertError || !newUser) {
      return NextResponse.json(
        { success: false, message: "Failed to create user", error: userInsertError?.message },
        { status: 500 }
      );
    }

    // Create member profile
    const { error: profileErr } = await supabase
      .from("member_profiles")
      .insert({
        user_id: newUser.id,
        cpr_id: cpr_id || null,
        gender,
        dob,
        address,
        city,
        state,
        pin_code,
        nationality,
        work_sector,
        employer,
        position,
        specialty,
        category,
      });
    if (profileErr) {
      // Rollback user if profile fails (best-effort)
      await supabase.from("users").delete().eq("id", newUser.id);
      return NextResponse.json(
        { success: false, message: "Failed to create member profile", error: profileErr.message },
        { status: 500 }
      );
    }

    // Ensure free subscription exists for the user (no payment)
    const { data: freePlan } = await supabase
      .from("subscription_plans")
      .select("id, name, display_name")
      .eq("name", "free")
      .single();

    if (freePlan?.id) {
      // Create user subscription if not exists
      const { data: existingSub } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", newUser.id)
        .eq("subscription_plan_id", freePlan.id)
        .maybeSingle();

      if (!existingSub) {
        await supabase.from("user_subscriptions").insert({
          user_id: newUser.id,
          subscription_plan_id: freePlan.id,
          subscription_plan_name: freePlan.name,
          status: "active",
          started_at: new Date().toISOString(),
          auto_renew: false,
          registration_paid: true,
          annual_paid: true,
        });
      }

      // Update user's current subscription reference
      await supabase
        .from("users")
        .update({
          current_subscription_plan_id: freePlan.id,
          current_subscription_plan_name: freePlan.name,
        })
        .eq("id", newUser.id);
    }

    // Issue JWT and set cookie (match login2 token structure and expiry)
    const membershipType = newUser.membership_type || "free";
    const expiryDate = null; // new free members have no expiry by default

    const token = jwt.sign(
      {
        user_id: newUser.id,
        role: "member",
        membership_type: membershipType,
        membership_expiry_date: expiryDate,
        sub: newUser.id,
        email: newUser.email,
        name: newUser.full_name,
        phone: newUser.phone,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      success: true,
      user: newUser,
      message: "Account created successfully",
    });
    res.cookies.set("bds_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}


