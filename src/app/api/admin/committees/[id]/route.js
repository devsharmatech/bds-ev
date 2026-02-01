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
    const { id } = await params;
    const contentType = req.headers.get("content-type") || "";

    let name;
    let hero_title;
    let hero_subtitle;
    let focus;
    let description;
    let banner_image;
    let contact_email;
    let sort_order;
    let is_active;
    let bannerFile = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      name = (form.get("name") || "").toString().trim() || undefined;
      hero_title = (form.get("hero_title") || "").toString().trim();
      hero_subtitle = (form.get("hero_subtitle") || "").toString().trim();
      focus = (form.get("focus") || "").toString().trim();
      description = (form.get("description") || "").toString();
      const rawBannerUrl = (form.get("banner_image") || "").toString().trim();
      banner_image = rawBannerUrl || null;
      contact_email = (form.get("contact_email") || "").toString().trim();
      const rawSortOrder = (form.get("sort_order") || "").toString();
      const parsedSort = Number(rawSortOrder);
      sort_order = Number.isFinite(parsedSort) ? parsedSort : undefined;
      const rawActive = form.get("is_active");
      if (rawActive != null) {
        is_active = rawActive.toString() === "true";
      }
      bannerFile = form.get("banner_image_file");
    } else {
      const body = await req.json();
      name = body.name;
      hero_title = body.hero_title ?? null;
      hero_subtitle = body.hero_subtitle ?? null;
      focus = body.focus ?? null;
      description = body.description ?? null;
      banner_image = body.banner_image ?? null;
      contact_email = body.contact_email ?? null;
      sort_order = Number.isFinite(body.sort_order) ? body.sort_order : undefined;
      if (typeof body.is_active === "boolean") {
        is_active = body.is_active;
      }
    }

    // Upload new banner image if provided
    if (bannerFile && typeof bannerFile === "object" && bannerFile.name) {
      const arrayBuffer = await bannerFile.arrayBuffer();
      const fileExt = (bannerFile.name.split(".").pop() || "jpg").toLowerCase();
      const objectPath = `committees/${id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadErr } = await supabase
        .storage
        .from("media")
        .upload(objectPath, arrayBuffer, {
          contentType: bannerFile.type || "image/jpeg",
          upsert: true,
        });
      if (uploadErr) {
        return NextResponse.json(
          { success: false, message: "Banner upload failed", error: uploadErr.message },
          { status: 500 }
        );
      }

      const { data: pub } = supabase
        .storage
        .from("media")
        .getPublicUrl(objectPath);
      banner_image = pub?.publicUrl || banner_image;
    }

    const update = {
      name,
      hero_title: hero_title ?? null,
      hero_subtitle: hero_subtitle ?? null,
      focus: focus ?? null,
      description: description ?? null,
      banner_image: banner_image ?? null,
      contact_email: contact_email ?? null,
      sort_order,
      is_active,
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

