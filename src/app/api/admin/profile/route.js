import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/verifyToken";

export async function GET(req) {
  try {
    const decoded = verifyToken(req);
    const userId = decoded.user_id;
    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, email, phone, mobile, role")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch profile" },
      { status: 401 }
    );
  }
}

export async function PUT(req) {
  try {
    const decoded = verifyToken(req);
    const userId = decoded.user_id;
    const body = await req.json();

    const update = {
      full_name: body.full_name?.trim(),
      email: body.email?.trim(),
      phone: body.phone?.trim() ?? null,
      mobile: body.mobile?.trim() ?? null,
      updated_at: new Date().toISOString(),
    };
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    if (body.current_password && body.new_password) {
      const { data: u, error: uErr } = await supabase
        .from("users")
        .select("id, password_hash")
        .eq("id", userId)
        .single();
      if (uErr || !u) throw new Error("User not found");
      const ok = await bcrypt.compare(body.current_password, u.password_hash);
      if (!ok) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect" },
          { status: 400 }
        );
      }
      const password_hash = await bcrypt.hash(body.new_password, 10);
      update.password_hash = password_hash;
    }

    const { data, error } = await supabase
      .from("users")
      .update(update)
      .eq("id", userId)
      .select("id, full_name, email, phone, mobile, role")
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, user: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update profile" },
      { status: 400 }
    );
  }
}


