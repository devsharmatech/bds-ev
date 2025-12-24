import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  res.cookies.set("bds_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });

  return res;
}
