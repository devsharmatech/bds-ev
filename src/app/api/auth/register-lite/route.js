import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { generateMembershipCode } from "@/lib/membershipCode";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return typeof phone === "string" && phone.trim().length >= 6;
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");

    let full_name;
    let email;
    let phone;
    let password;
    let cpr_id;
    let gender = null;
    let dob = null;
    let nationality = null;
    let address = null;
    let city = null;
    let state = null;
    let pin_code = null;
    let work_sector = null;
    let employer = null;
    let position = null;
    let specialty = null;
    let category = null;
    let studentIdFile = null;

    if (isMultipart) {
      const formData = await request.formData();
      full_name = formData.get("full_name") || "";
      email = formData.get("email") || "";
      phone = formData.get("phone") || "";
      password = formData.get("password") || "";
      cpr_id = formData.get("cpr_id") || null;
      gender = formData.get("gender") || null;
      dob = formData.get("dob") || null;
      nationality = formData.get("nationality") || null;
      address = formData.get("address") || null;
      city = formData.get("city") || null;
      state = formData.get("state") || null;
      pin_code = formData.get("pin_code") || null;
      work_sector = formData.get("work_sector") || null;
      employer = formData.get("employer") || null;
      position = formData.get("position") || null;
      specialty = formData.get("specialty") || null;
      category = formData.get("category") || null;
      studentIdFile = formData.get("student_id_card");
    } else {
      const body = await request.json();
      ({
        full_name,
        email,
        phone,
        password,
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
      } = body || {});
      // Accept pre-uploaded student ID card URL from JSON body
      studentIdFile = null; // no file in JSON mode
      var studentIdCardUrl = body?.student_id_card_url || null;
    }

    if (!full_name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: "full_name, email, phone, password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }
    if (typeof password !== "string" || password.trim().length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
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

    // Create user with provided password
    const password_hash = await bcrypt.hash(password.trim(), 10);

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

    // Assign membership code in format BDS-00001 (no year)
    const membershipCode = await generateMembershipCode();
    if (membershipCode) {
      await supabase
        .from("users")
        .update({ membership_code: membershipCode })
        .eq("id", newUser.id);
    }

    // Handle optional student ID card upload (for student category)
    let idCardUrl = null;

    const isStudentCategory = (category || "").toLowerCase().includes("student");

    if (!isMultipart && studentIdCardUrl) {
      // JSON path: use pre-uploaded URL
      idCardUrl = studentIdCardUrl;
    } else if (isMultipart && (studentIdFile && studentIdFile.size > 0 || isStudentCategory)) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (isStudentCategory && (!studentIdFile || studentIdFile.size === 0)) {
        await supabase.from("users").delete().eq("id", newUser.id);
        return NextResponse.json(
          { success: false, message: "Student ID card is required for student registrations" },
          { status: 400 }
        );
      }

      if (studentIdFile && studentIdFile.size > 0) {
        if (!allowedTypes.includes(studentIdFile.type)) {
          await supabase.from("users").delete().eq("id", newUser.id);
          return NextResponse.json(
            { success: false, message: "Student ID must be JPEG/PNG/WebP/PDF" },
            { status: 400 }
          );
        }
        if (studentIdFile.size > maxSize) {
          await supabase.from("users").delete().eq("id", newUser.id);
          return NextResponse.json(
            { success: false, message: "Student ID file too large (max 10MB)" },
            { status: 400 }
          );
        }

        const ext = (studentIdFile.name || "file").split(".").pop();
        const filename = `${uuidv4()}.${ext}`;
        const path = `verification/${newUser.id}/id_card_${filename}`;

        const { error: uploadError } = await supabase.storage
          .from("profile_pictures")
          .upload(path, studentIdFile, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          console.error("Student ID upload error:", uploadError);
          await supabase.from("users").delete().eq("id", newUser.id);
          return NextResponse.json(
            { success: false, message: "Failed to upload Student ID", error: uploadError.message },
            { status: 500 }
          );
        }

        const { data: urlData } = supabase.storage
          .from("profile_pictures")
          .getPublicUrl(path);
        idCardUrl = urlData.publicUrl || null;
      }
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
        id_card_url: idCardUrl,
      });
    if (profileErr) {
      // Rollback user and uploaded file if profile fails (best-effort)
      if (idCardUrl) {
        const path = idCardUrl.split("/").slice(-2).join("/");
        await supabase.storage.from("profile_pictures").remove([path]);
      }
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
          registration_paid: false,
          annual_paid: false,
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


