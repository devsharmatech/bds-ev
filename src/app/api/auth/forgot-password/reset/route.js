import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * POST /api/auth/forgot-password/reset
 * Reset password using reset token
 */
export async function POST(req) {
  try {
    const { resetToken, newPassword } = await req.json();

    // Validation
    if (!resetToken || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Reset token and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired reset token. Please request a new password reset.",
        },
        { status: 400 }
      );
    }

    // Check token type
    if (decoded.type !== "password_reset") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token type.",
        },
        { status: 400 }
      );
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", decoded.userId)
      .eq("email", decoded.email.toLowerCase().trim())
      .maybeSingle();

    if (!user || userError) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("id", user.id);

    if (updateError) {
      console.error("Password update error:", updateError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update password. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}


