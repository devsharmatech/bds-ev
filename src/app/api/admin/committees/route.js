import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("committees")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ success: true, committees: data || [] });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch committees" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    ensureAdmin(req);
    const body = await req.json();
    const {
      slug,
      name,
      hero_title,
      hero_subtitle,
      focus,
      description,
      banner_image,
      contact_email,
      sort_order,
      is_active,
    } = body || {};

    if (!slug || !name) {
      return NextResponse.json(
        { success: false, message: "slug and name are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("committees")
      .insert({
        slug,
        name,
        hero_title: hero_title || null,
        hero_subtitle: hero_subtitle || null,
        focus: focus || null,
        description: description || null,
        banner_image: banner_image || null,
        contact_email: contact_email || null,
        sort_order: Number.isFinite(sort_order) ? sort_order : 0,
        is_active: is_active !== false,
      })
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, committee: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create committee" },
      { status: 500 }
    );
  }
}

