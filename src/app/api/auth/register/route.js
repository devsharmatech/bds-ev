import { supabase } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      fullNameEng,
      fullNameArb,
      email,
      password,
      mobile,
      cpr,
      gender,
      nationality,
      category,
      workSector,
      employer,
      position,
      specialty,
      address,
      membershipType, // "free" | "paid"
      typeOfApplication,
      membershipDate,
    } = body;

    // --------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------
    if (!fullNameEng || !email || !password || !mobile || !cpr) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // DUPLICATE EMAIL CHECK
    // --------------------------------------------------
    const { data: emailExists } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (emailExists) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // DUPLICATE CPR CHECK
    // --------------------------------------------------
    const { data: cprExists } = await supabase
      .from("member_profiles")
      .select("id")
      .eq("cpr_id", cpr)
      .maybeSingle();

    if (cprExists) {
      return NextResponse.json(
        { success: false, message: "CPR already registered" },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // MEMBERSHIP LOGIC
    // --------------------------------------------------
    const isPaid = membershipType === "paid";
    const amount = isPaid ? 40 : 0;

    const startDate = isPaid
      ? new Date()
      : null;

    const endDate = isPaid
      ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      : null;

    // --------------------------------------------------
    // PASSWORD HASH
    // --------------------------------------------------
    const passwordHash = await bcrypt.hash(password, 10);

    // --------------------------------------------------
    // CREATE USER
    // --------------------------------------------------
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        full_name: fullNameEng,
        full_name_ar: fullNameArb,
        email,
        password_hash: passwordHash,
        phone: mobile,
        mobile: mobile,
        role: "member",
        membership_type: isPaid ? "paid" : "free",
        membership_expiry_date: endDate,
        membership_status: "active",
      })
      .select()
      .single();

    if (userError) throw userError;

    // --------------------------------------------------
    // CREATE MEMBER PROFILE
    // --------------------------------------------------
    const { error: profileError } = await supabase
      .from("member_profiles")
      .insert({
        user_id: user.id,
        gender,
        nationality,
        category,
        work_sector: workSector,
        employer,
        position,
        specialty,
        address,
        cpr_id: cpr,
        type_of_application: typeOfApplication,
        membership_date: membershipDate || new Date(),
      });

    if (profileError) throw profileError;

    // --------------------------------------------------
    // CREATE MEMBERSHIP PAYMENT RECORD
    // --------------------------------------------------
    const { error: paymentError } = await supabase
      .from("membership_payments")
      .insert({
        user_id: user.id,
        payment_type: isPaid ? "paid" : "free",
        amount,
        paid: !isPaid, // FREE auto-approved
        membership_start_date: startDate,
        membership_end_date: endDate,
      });

    if (paymentError) throw paymentError;

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------
    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: {
        user_id: user.id,
        membership: isPaid ? "paid" : "free",
        payable_amount: amount,
        membership_valid_till: endDate,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    );
  }
}
