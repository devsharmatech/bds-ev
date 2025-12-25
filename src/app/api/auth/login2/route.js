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
    // STATUS CHECK
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
    // MEMBERSHIP EXPIRY CHECK
    // -----------------------------------
    let membershipType = user.membership_type;
    let expiryDate = user.membership_expiry_date;

    const today = new Date();

    if (
      membershipType === "paid" &&
      expiryDate &&
      new Date(expiryDate) < today
    ) {
      // Auto downgrade expired membership
      await supabase
        .from("users")
        .update({
          membership_type: "free",
          membership_expiry_date: null,
        })
        .eq("id", user.id);

      membershipType = "free";
      expiryDate = null;
    }

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
