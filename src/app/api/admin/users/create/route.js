import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { full_name, email, phone, password, role, is_active } = await req.json();

    const password_hash = await bcrypt.hash(password, 10);

    const isActiveValue = typeof is_active === "boolean" ? is_active : true;

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          full_name,
          email,
          phone,
          password_hash,
          role,
          is_active: isActiveValue,
        },
      ])
      .select()
      .single();

    if (error) return Response.json({ success: false, error: error.message });

    return Response.json({ success: true, user: data });

  } catch (err) {
    return Response.json({ success: false, error: err.message });
  }
}
