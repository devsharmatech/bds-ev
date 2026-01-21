import { supabase } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // -----------------------------------
    // VALIDATION
    // -----------------------------------
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // -----------------------------------
    // FETCH USER
    // -----------------------------------
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!user || error) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // -----------------------------------
    // STATUS CHECK (membership)
    // -----------------------------------
    if (user.membership_status !== "active") {
      if (user.membership_status === "pending") {
        return NextResponse.json(
          { 
            success: false, 
            message: "Payment required. Please complete your registration payment to activate your account.",
            requiresPayment: true,
            email: user.email
          },
          { status: 403 }
        );
      }
      if (user.membership_status === "inactive") {
        return NextResponse.json(
          { success: false, message: "Account is inactive. Please contact support." },
          { status: 403 }
        );
      }
      if (user.membership_status === "blocked") {
        return NextResponse.json(
          { success: false, message: "Account is blocked. Please contact support." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Account is not active" },
        { status: 403 }
      );
    }

    // -----------------------------------
    // ADMIN ACTIVE FLAG CHECK (is_active)
    // -----------------------------------
    if (user.role === "admin" && user.is_active === false) {
      return NextResponse.json(
        { success: false, message: "Admin account is inactive. Please contact support." },
        { status: 403 }
      );
    }

    // -----------------------------------
    // PASSWORD CHECK
    // -----------------------------------
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // -----------------------------------
    // MEMBERSHIP EXPIRY CHECK (no auto-downgrade)
    // -----------------------------------
    let membershipType = user.membership_type;
    let expiryDate = user.membership_expiry_date;

    // NOTE:
    // Previously, logging in would automatically change a paid
    // member to free in the database if their expiry date was
    // before "today". This caused membership_type to "change"
    // right after login, which is confusing for admins and users.
    //
    // We now avoid modifying membership_type or expiry here.
    // Expiry enforcement (e.g. blocking benefits for expired
    // members) should be handled explicitly in the parts of the
    // system that need it, without silently rewriting the user
    // record on login.

    // -----------------------------------
    // JWT TOKEN
    // -----------------------------------
    const token = jwt.sign(
      {
        user_id: user.id,
        role: user.role,
        membership_type: membershipType,
        membership_expiry_date: expiryDate,
        sub: user.id,
        email: user.email,
        name: user.full_name,
        phone: user.phone,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // -----------------------------------
    // UPDATE LAST LOGIN
    // -----------------------------------
    await supabase
      .from("users")
      .update({ last_login: new Date() })
      .eq("id", user.id);

    // -----------------------------------
    // RESPONSE
    // -----------------------------------
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        user_id: user.id,
        role: user.role,
        membership_type: membershipType,
        membership_expiry_date: expiryDate,
        sub: user.id,
        email: user.email,
        name: user.full_name,
        phone: user.phone,
      },
    });
    response.cookies.set({
      name: "bds_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}
