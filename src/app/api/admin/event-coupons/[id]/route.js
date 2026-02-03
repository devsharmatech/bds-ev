import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("event_coupons")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, coupon: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    let {
      event_id,
      event_title,
      code,
      description,
      discount_type,
      discount_value,
      max_uses,
      valid_from,
      valid_until,
      is_active,
    } = body || {};

    const update = {};

    if (code != null) {
      code = String(code).trim().toUpperCase();
      if (!code) {
        return NextResponse.json(
          { success: false, message: "Coupon code cannot be empty" },
          { status: 400 }
        );
      }
      // Ensure code uniqueness (excluding this coupon)
      const { data: existing } = await supabase
        .from("event_coupons")
        .select("id")
        .ilike("code", code)
        .neq("id", id)
        .maybeSingle();
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Coupon code already exists" },
          { status: 409 }
        );
      }
      update.code = code;
    }

    if (event_id != null) update.event_id = event_id || null;
    if (description !== undefined) update.description = description || null;
    if (discount_type) {
      if (!["fixed", "percentage"].includes(discount_type)) {
        return NextResponse.json(
          { success: false, message: "Invalid discount type" },
          { status: 400 }
        );
      }
      update.discount_type = discount_type;
    }

    if (discount_value != null) {
      const numericDiscount = Number(discount_value);
      if (!Number.isFinite(numericDiscount) || numericDiscount <= 0) {
        return NextResponse.json(
          { success: false, message: "Discount value must be greater than 0" },
          { status: 400 }
        );
      }
      if (update.discount_type === "percentage" && numericDiscount > 100) {
        return NextResponse.json(
          { success: false, message: "Percentage discount cannot exceed 100" },
          { status: 400 }
        );
      }
      update.discount_value = numericDiscount;
    }

    if (max_uses !== undefined) {
      update.max_uses = max_uses != null ? Number(max_uses) : null;
    }

    if (valid_from !== undefined) {
      update.valid_from = valid_from ? new Date(valid_from).toISOString() : null;
    }

    if (valid_until !== undefined) {
      update.valid_until = valid_until ? new Date(valid_until).toISOString() : null;
    }

    if (is_active !== undefined) {
      update.is_active = !!is_active;
    }

    // Refresh event_title if event_id was changed and no explicit event_title provided
    if (event_id && event_title == null) {
      const { data: ev } = await supabase
        .from("events")
        .select("title")
        .eq("id", event_id)
        .maybeSingle();
      update.event_title = ev?.title || null;
    } else if (event_title !== undefined) {
      update.event_title = event_title || null;
    }

    update.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("event_coupons")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, coupon: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from("event_coupons")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
