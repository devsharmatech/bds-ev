import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const committeeId = searchParams.get("committee_id");
    let query = supabase.from("committee_sections").select("*");
    if (committeeId) query = query.eq("committee_id", committeeId);
    const { data, error } = await query.order("sort_order", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ success: true, pages: data || [] });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let committee_id;
    let title;
    let content = null;
    let image_url = null;
    let image_alignment = "left";
    let button_label = null;
    let button_url = null;
    let show_button = false;
    let sort_order = 0;
    let is_active = true;
    let file = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      committee_id = (form.get("committee_id") || "").toString();
      title = (form.get("title") || "").toString().trim();
      const rawContent = (form.get("content") || "").toString();
      content = rawContent.trim() || null;

      const rawImageUrl = (form.get("image_url") || "").toString().trim();
      image_url = rawImageUrl || null;
      image_alignment = (form.get("image_alignment") || "left").toString();
      const rawButtonLabel = (form.get("button_label") || "").toString().trim();
      const rawButtonUrl = (form.get("button_url") || "").toString().trim();
      button_label = rawButtonLabel || null;
      button_url = rawButtonUrl || null;
      show_button = ((form.get("show_button") || "false").toString() === "true");
      const rawSortOrder = (form.get("sort_order") || "0").toString();
      const parsedSort = Number(rawSortOrder);
      sort_order = Number.isFinite(parsedSort) ? parsedSort : 0;
      is_active = ((form.get("is_active") || "true").toString() === "true");
      file = form.get("image");
    } else {
      const body = await req.json();
      committee_id = body?.committee_id;
      title = (body?.title || "").toString().trim();
      content = body?.content ? String(body.content) : null;
      image_url = body?.image_url || null;
      image_alignment = body?.image_alignment || "left";
      button_label = body?.button_label || null;
      button_url = body?.button_url || null;
      show_button = body?.show_button === true;
      sort_order = Number.isFinite(body?.sort_order) ? body.sort_order : 0;
      is_active = body?.is_active !== false;
    }

    if (!committee_id || !title) {
      return NextResponse.json(
        { success: false, message: "committee_id and title are required" },
        { status: 400 }
      );
    }

    // Upload image if provided via multipart/form-data
    if (file && typeof file === "object" && file.name) {
      const arrayBuffer = await file.arrayBuffer();
      const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
      const objectPath = `${committee_id}/${crypto.randomUUID()}.${fileExt}`;
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
      image_url = pub?.publicUrl || null;
    }

    const payload = {
      committee_id,
      title,
      content,
      image_url,
      image_alignment,
      button_label,
      button_url,
      show_button,
      sort_order: Number.isFinite(sort_order) ? sort_order : 0,
      is_active: is_active !== false,
    };

    const { data, error } = await supabase
      .from("committee_sections")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, page: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create page" },
      { status: 500 }
    );
  }
}

