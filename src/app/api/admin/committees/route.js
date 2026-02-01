import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

const generateSlug = (name) => {
  const base = (name || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "committee";
};

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
    const contentType = req.headers.get("content-type") || "";

    let name;
    let hero_title;
    let hero_subtitle;
    let focus;
    let description;
    let banner_image = null;
    let contact_email;
    let sort_order = 0;
    let is_active = true;
    let bannerFile = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      name = (form.get("name") || "").toString().trim();
      hero_title = (form.get("hero_title") || "").toString().trim();
      hero_subtitle = (form.get("hero_subtitle") || "").toString().trim();
      focus = (form.get("focus") || "").toString().trim();
      description = (form.get("description") || "").toString();
      const rawBannerUrl = (form.get("banner_image") || "").toString().trim();
      banner_image = rawBannerUrl || null;
      contact_email = (form.get("contact_email") || "").toString().trim();
      const rawSortOrder = (form.get("sort_order") || "0").toString();
      const parsedSort = Number(rawSortOrder);
      sort_order = Number.isFinite(parsedSort) ? parsedSort : 0;
      is_active = ((form.get("is_active") || "true").toString() === "true");
      bannerFile = form.get("banner_image_file");
    } else {
      const body = await req.json();
      name = (body?.name || "").toString().trim();
      hero_title = body?.hero_title || "";
      hero_subtitle = body?.hero_subtitle || "";
      focus = body?.focus || "";
      description = body?.description || "";
      banner_image = body?.banner_image || null;
      contact_email = body?.contact_email || "";
      sort_order = Number.isFinite(body?.sort_order) ? body.sort_order : 0;
      is_active = body?.is_active !== false;
    }

    if (!name) {
      return NextResponse.json(
        { success: false, message: "name is required" },
        { status: 400 }
      );
    }

    let baseSlug = generateSlug(name);
    let slug = baseSlug;
    let suffix = 1;

    // Ensure slug uniqueness
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data: existing, error: slugError } = await supabase
        .from("committees")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (slugError) throw slugError;
      if (!existing) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    // Upload banner image if provided
    if (bannerFile && typeof bannerFile === "object" && bannerFile.name) {
      const arrayBuffer = await bannerFile.arrayBuffer();
      const fileExt = (bannerFile.name.split(".").pop() || "jpg").toLowerCase();
      const objectPath = `committees/${crypto.randomUUID()}.${fileExt}`;

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

    const { data, error } = await supabase
      .from("committees")
      .insert({
        slug,
        name,
        hero_title: hero_title || name || null,
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

