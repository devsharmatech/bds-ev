import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabaseAdmin";

export async function PUT(req) {
  try {
    const { id, full_name, email, phone, role, password, is_active } = await req.json();

    // -----------------------------
    // BASIC REQUIRED VALIDATION
    // -----------------------------
    if (!id) {
      return Response.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!full_name || full_name.trim().length < 2) {
      return Response.json(
        { success: false, error: "Full name is required" },
        { status: 422 }
      );
    }

    // -----------------------------
    // EMAIL VALIDATION
    // -----------------------------
    if (!email) {
      return Response.json(
        { success: false, error: "Email is required" },
        { status: 422 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return Response.json(
        { success: false, error: "Invalid email format" },
        { status: 422 }
      );
    }

    // EMAIL DUPLICATE CHECK
    const { data: emailExists } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .neq("id", id) // exclude current user
      .maybeSingle();

    if (emailExists) {
      return Response.json(
        { success: false, error: "Email already in use" },
        { status: 409 }
      );
    }

    // -----------------------------
    // PHONE VALIDATION
    // -----------------------------
    if (!phone) {
      return Response.json(
        { success: false, error: "Phone number is required" },
        { status: 422 }
      );
    }
    //  we can have various phone formats, so let's allow +, -, spaces, and parentheses
    const phoneRegex = /^[+\d\s\-()]{10,15}$/;
    

    if (!phoneRegex.test(phone)) {
      return Response.json(
        { success: false, error: "Phone must be a valid 10-digit number" },
        { status: 422 }
      );
    }

    // PHONE DUPLICATE CHECK
    const { data: phoneExists } = await supabase
      .from("users")
      .select("id")
      .eq("phone", phone)
      .neq("id", id)
      .maybeSingle();

    if (phoneExists) {
      return Response.json(
        { success: false, error: "Phone number already in use" },
        { status: 409 }
      );
    }

    // -----------------------------
    // ROLE VALIDATION
    // -----------------------------
    const validRoles = ["user", "member", "admin"];

    if (role && !validRoles.includes(role)) {
      return Response.json(
        { success: false, error: "Invalid role provided" },
        { status: 422 }
      );
    }

    // -----------------------------
    // ACTIVE FLAG VALIDATION (for admin usage)
    // -----------------------------
    if (is_active !== undefined && typeof is_active !== "boolean") {
      return Response.json(
        { success: false, error: "is_active must be a boolean" },
        { status: 422 }
      );
    }

    // -----------------------------
    // OPTIONAL PASSWORD UPDATE
    // -----------------------------
    let password_hash;
    if (password !== undefined && password !== null && password !== "") {
      if (password.length < 6) {
        return Response.json(
          { success: false, error: "Password must be at least 6 characters" },
          { status: 422 }
        );
      }
      password_hash = await bcrypt.hash(password, 10);
    }

    // -----------------------------
    // UPDATE USER
    // -----------------------------
    const updatePayload = {
      full_name,
      email,
      phone,
      role,
      updated_at: new Date(),
    };

    if (password_hash) {
      updatePayload.password_hash = password_hash;
    }

    if (typeof is_active === "boolean") {
      updatePayload.is_active = is_active;
    }

    const { data, error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return Response.json({ success: true, user: data });

  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
