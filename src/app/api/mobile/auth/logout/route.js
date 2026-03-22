import { NextResponse } from "next/server";

export async function POST() {
  // Mobile apps manage token on the client side.
  // Just acknowledge the logout request.
  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}
