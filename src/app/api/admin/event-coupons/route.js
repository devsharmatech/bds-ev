import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

// GET /api/admin/event-coupons
// List coupons with optional filters and pagination
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = (searchParams.get("search") || "").trim();
    const eventId = searchParams.get("event_id") || "";
    const isActive = searchParams.get("is_active");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("event_coupons")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `code.ilike.%${search}%,event_title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    if (isActive === "true") query = query.eq("is_active", true);
    if (isActive === "false") query = query.eq("is_active", false);

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      coupons: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to load coupons" },
      { status: 500 }
    );
  }
}

// POST /api/admin/event-coupons
// Create a new coupon
export async function POST(req) {
  try {
    const body = await req.json();
    let {
      event_id,
      event_title,
      code,
      description,
      discount_type = "fixed",
      discount_value,
      max_uses,
      valid_from,
      valid_until,
      is_active = true,
      created_by,
    } = body || {};

    code = (code || "").trim().toUpperCase();
    if (!code) {
      return NextResponse.json(
        { success: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!event_id) {
      return NextResponse.json(
        { success: false, message: "Event is required" },
        { status: 400 }
      );
    }

    const numericDiscount = Number(discount_value);
    if (!Number.isFinite(numericDiscount) || numericDiscount <= 0) {
      return NextResponse.json(
        { success: false, message: "Discount value must be greater than 0" },
        { status: 400 }
      );
    }

    if (!["fixed", "percentage"].includes(discount_type)) {
      return NextResponse.json(
        { success: false, message: "Invalid discount type" },
        { status: 400 }
      );
    }

    if (discount_type === "percentage" && numericDiscount > 100) {
      return NextResponse.json(
        { success: false, message: "Percentage discount cannot exceed 100" },
        { status: 400 }
      );
    }

    // Ensure unique code
    const { data: existing } = await supabase
      .from("event_coupons")
      .select("id")
      .ilike("code", code)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Coupon code already exists" },
        { status: 409 }
      );
    }

    // If event title not provided, fetch from events
    if (!event_title && event_id) {
      const { data: ev } = await supabase
        .from("events")
        .select("title")
        .eq("id", event_id)
        .maybeSingle();
      event_title = ev?.title || null;
    }

    // Normalize max_uses: empty or <= 0 means unlimited (NULL in DB)
    let maxUsesValue = null;
    if (max_uses !== undefined && max_uses !== null && String(max_uses).trim() !== "") {
      const parsed = Number(max_uses);
      if (Number.isFinite(parsed) && parsed > 0) {
        maxUsesValue = parsed;
      }
    }

    const payload = {
      event_id,
      event_title,
      code,
      description: description || null,
      discount_type,
      discount_value: numericDiscount,
      max_uses: maxUsesValue,
      valid_from: valid_from ? new Date(valid_from).toISOString() : null,
      valid_until: valid_until ? new Date(valid_until).toISOString() : null,
      is_active: is_active !== false,
      created_by: created_by || null,
    };

    const { data, error } = await supabase
      .from("event_coupons")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, coupon: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create coupon" },
      { status: 500 }
    );
  }
}
