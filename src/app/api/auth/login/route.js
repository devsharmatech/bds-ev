import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return Response.json(
        { success: false, error: "Missing credentials" },
        { status: 400 }
      );

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user)
      return Response.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return Response.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );

    const token = jwt.sign(
      {
        user_id: user.id,
        role: user.role,
        membership_type: user.membership_type,
        membership_expiry_date: user.membership_expiry_date,
        sub: user.id,
        email: user.email,
        name: user.full_name,
        phone: user.phone,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return Response.json({
      success: true,
      token,
      role: user.role,
    });
  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
