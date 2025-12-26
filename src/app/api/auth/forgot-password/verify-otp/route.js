import { NextResponse } from "next/server";
import { getOTP, deleteOTP, incrementAttempts } from "@/lib/otpStore";
import jwt from "jsonwebtoken";

/**
 * POST /api/auth/forgot-password/verify-otp
 * Verify OTP and return a reset token
 */
export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    // Validation
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Get stored OTP data
    const storedData = getOTP(email);

    if (!storedData) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP not found or expired. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      deleteOTP(email);
      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // Check attempts (max 5 attempts)
    if (storedData.attempts >= 5) {
      deleteOTP(email);
      return NextResponse.json(
        {
          success: false,
          message: "Too many failed attempts. Please request a new OTP.",
        },
        { status: 429 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      const attempts = incrementAttempts(email);
      const remainingAttempts = 5 - attempts;
      return NextResponse.json(
        {
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
        },
        { status: 400 }
      );
    }

    // OTP verified successfully
    // Generate a reset token (JWT) that expires in 15 minutes
    const resetToken = jwt.sign(
      {
        email: email.toLowerCase().trim(),
        userId: storedData.userId,
        type: "password_reset",
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Delete OTP after successful verification
    deleteOTP(email);

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully.",
      resetToken,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

