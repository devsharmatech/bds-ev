import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("committee_sections")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, page: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch page" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const contentType = req.headers.get("content-type") || "";

    const update = {};

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      const title = (form.get("title") || "").toString().trim();
      const rawContent = (form.get("content") || "").toString();
      const rawImageUrl = (form.get("image_url") || "").toString().trim();
      const image_alignment = (form.get("image_alignment") || "left").toString();
      const rawButtonLabel = (form.get("button_label") || "").toString().trim();
      const rawButtonUrl = (form.get("button_url") || "").toString().trim();
      const rawSortOrder = (form.get("sort_order") || "").toString();
      const sortParsed = Number(rawSortOrder);
      const show_button = ((form.get("show_button") || "false").toString() === "true");
      const is_active = ((form.get("is_active") || "true").toString() === "true");
      const file = form.get("image");

      if (title) update.title = title;
      update.content = rawContent.trim() || null;
      update.image_url = rawImageUrl || null;
      update.image_alignment = image_alignment;
      update.button_label = rawButtonLabel || null;
      update.button_url = rawButtonUrl || null;
      update.show_button = show_button;
      if (Number.isFinite(sortParsed)) update.sort_order = sortParsed;
      update.is_active = is_active;

      if (file && typeof file === "object" && file.name) {
        const arrayBuffer = await file.arrayBuffer();
        const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
        const objectPath = `${id}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadErr } = await supabase
          .storage
          .from("media")
          .upload(objectPath, arrayBuffer, {
            contentType: file.type || "image/jpeg",
            upsert: true,
          });
        if (uploadErr) {
          return NextResponse.json(
            { success: false, message: "Image upload failed", error: uploadErr.message },
            { status: 500 }
          );
        }
        const { data: pub } = supabase
          .storage
          .from("media")
          .getPublicUrl(objectPath);
        update.image_url = pub?.publicUrl || null;
      }
    } else {
      const body = await req.json();
      update.title = body.title;
      update.content = body.content ?? null;
      update.image_url = body.image_url ?? null;
      update.image_alignment = body.image_alignment ?? undefined;
      update.button_label = body.button_label ?? null;
      update.button_url = body.button_url ?? null;
      update.show_button = typeof body.show_button === "boolean" ? body.show_button : undefined;
      update.sort_order = Number.isFinite(body.sort_order) ? body.sort_order : undefined;
      update.is_active = typeof body.is_active === "boolean" ? body.is_active : undefined;
    }

    update.updated_at = new Date().toISOString();

    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const { data, error } = await supabase
      .from("committee_sections")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, page: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update page" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    
    const { id } = await params;
    const { error } = await supabase.from("committee_sections").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete page" },
      { status: 500 }
    );
  }
}

