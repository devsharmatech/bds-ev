import { NextResponse } from "next/server";

// Committee members API disabled per latest requirements
export async function GET() {
  return NextResponse.json({ success: true, members: [] });
}

export async function POST() {
  return NextResponse.json(
    { success: false, message: "Committee members feature is disabled" },
    { status: 400 }
  );
}


