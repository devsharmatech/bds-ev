import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

const fixedAdmin = {
  email: "admin@gmail.com",
  password: "Admin@123",
  role: "admin",
  phone: "9876543210",
  full_name: "System Admin",
};

/* -------------------------
     GET → Create Admin
------------------------- */
export async function GET() {
  try {
    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from("users")
      .select("*")
      .eq("email", fixedAdmin.email)
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin already exists. If you need a new one, delete the old one.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(fixedAdmin.password, 10);

    // Insert admin user
    const { error } = await supabase.from("users").insert([
      {
        email: fixedAdmin.email,
        password_hash: hashedPassword,
        role: fixedAdmin.role,
        phone: fixedAdmin.phone,
        full_name: fixedAdmin.full_name,
      },
    ]);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully.",
      credentials: {
        email: fixedAdmin.email,
        password: fixedAdmin.password,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
