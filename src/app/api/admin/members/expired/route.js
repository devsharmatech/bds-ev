import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

// GET: list members whose expiry is in the past but membership_type is still paid
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const perPage = parseInt(url.searchParams.get("per_page") || "20", 10);

    const from = Math.max(0, (page - 1) * perPage);
    const to = from + perPage - 1;

    const today = new Date().toISOString();

    // Count query
    const { count, error: countError } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "member")
      .eq("membership_type", "paid")
      .not("membership_expiry_date", "is", null)
      .lt("membership_expiry_date", today);

    if (countError) throw countError;

    // Data query with pagination
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, email, full_name, phone, mobile, membership_code, membership_type, membership_status, membership_expiry_date"
      )
      .eq("role", "member")
      .eq("membership_type", "paid")
      .not("membership_expiry_date", "is", null)
      .lt("membership_expiry_date", today)
      .order("membership_expiry_date", { ascending: true })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      meta: {
        page,
        per_page: perPage,
        total: count ?? (data ? data.length : 0),
      },
    });
  } catch (err) {
    console.error("Expired members list error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load expired members" },
      { status: 500 }
    );
  }
}

// PUT: downgrade a single member to free and clear expiry
export async function PUT(request) {
  try {
    const body = await request.json();
    const userId = body?.user_id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      );
    }

    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, membership_type, membership_expiry_date, role")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "member") {
      return NextResponse.json(
        { success: false, error: "Only member accounts can be downgraded" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        membership_type: "free",
        membership_expiry_date: null,
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Expired member downgrade error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to downgrade member" },
      { status: 500 }
    );
  }
}
