import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import { sendOTPEmail } from "@/lib/email";
import { setOTP, getOTP } from "@/lib/otpStore";
import crypto from "crypto";

/**
 * POST /api/auth/forgot-password/send-otp
 * Send OTP to user's email
 */
export async function POST(req) {
  try {
    const { email } = await req.json();

    // Validation
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, full_name")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (!user || userError) {
      // Don't reveal if user exists or not (security best practice)
      // Return success even if user doesn't exist
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, an OTP has been sent.",
      });
    }

    // Check rate limiting (prevent spam)
    const existingOTP = getOTP(email);
    if (existingOTP) {
      const timeSinceLastOTP = Date.now() - existingOTP.createdAt;
      const minInterval = 60 * 1000; // 1 minute between OTP requests

      if (timeSinceLastOTP < minInterval) {
        const remainingSeconds = Math.ceil((minInterval - timeSinceLastOTP) / 1000);
        return NextResponse.json(
          {
            success: false,
            message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
          },
          { status: 429 }
        );
      }
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    setOTP(email, {
      otp,
      expiresAt,
      createdAt: Date.now(),
      attempts: 0,
      userId: user.id,
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, otp);

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error);
      // Still return success to user (don't reveal email service issues)
      // But log the error for debugging
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, an OTP has been sent.",
        warning: "Email service may be experiencing issues. Please contact support if you don't receive the email.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP has been sent to your email. Please check your inbox.",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

