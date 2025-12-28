import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("committees")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, committee: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch committee" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    ensureAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const update = {
      slug: body.slug,
      name: body.name,
      hero_title: body.hero_title ?? null,
      hero_subtitle: body.hero_subtitle ?? null,
      focus: body.focus ?? null,
      description: body.description ?? null,
      banner_image: body.banner_image ?? null,
      contact_email: body.contact_email ?? null,
      sort_order: Number.isFinite(body.sort_order) ? body.sort_order : undefined,
      is_active: typeof body.is_active === "boolean" ? body.is_active : undefined,
      updated_at: new Date().toISOString(),
    };
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const { data, error } = await supabase
      .from("committees")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, committee: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update committee" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
   
    const { id } = await params;
    const { error } = await supabase.from("committees").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete committee" },
      { status: 500 }
    );
  }
}

