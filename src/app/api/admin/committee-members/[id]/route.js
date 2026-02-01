import { NextResponse } from "next/server";

// Committee members API disabled per latest requirements
export async function GET() {
  return NextResponse.json(
    { success: false, message: "Committee members feature is disabled" },
    { status: 404 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: "Committee members feature is disabled" },
    { status: 400 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: "Committee members feature is disabled" },
    { status: 400 }
  );
}


