"use server";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

function slugify(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .substring(0, 120);
}

async function uploadToBucket(file, pathPrefix) {
  if (!file || !file.name) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const fname = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from("gallery")
    .upload(fname, buffer, { contentType: file.type || "image/jpeg", upsert: true });
  if (upErr) throw new Error(upErr.message);
  const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(fname);
  return urlData?.publicUrl || null;
}

export async function GET(req) {
  try {
    
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = (searchParams.get("sortOrder") || "desc").toLowerCase() === "asc" ? true : false;

    let query = supabase
      .from("galleries")
      .select(
        "id,title,slug,featured_image_url,tag1,tag2,is_active,created_at,updated_at,gallery_images(count)"
      )
      .ilike("title", q ? `%${q}%` : "%");

    if (status === "active") {
      query = query.eq("is_active", true);
    } else if (status === "inactive") {
      query = query.eq("is_active", false);
    }

    // Map allowed sort fields
    const allowedSort = new Set(["created_at", "updated_at", "title"]);
    const sortField = allowedSort.has(sortBy) ? sortBy : "created_at";

    const { data, error } = await query.order(sortField, { ascending: sortOrder });
    if (error) throw new Error(error.message);

    // Flatten image counts
    const galleries = (data || []).map((g) => ({
      id: g.id,
      title: g.title,
      slug: g.slug,
      featured_image_url: g.featured_image_url,
      tag1: g.tag1,
      tag2: g.tag2,
      is_active: g.is_active,
      created_at: g.created_at,
      updated_at: g.updated_at,
      image_count: Array.isArray(g.gallery_images) && g.gallery_images.length
        ? (g.gallery_images[0]?.count ?? 0)
        : 0,
    }));

    return NextResponse.json({ success: true, galleries });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      const body = await req.json();
      const title = body?.title?.trim();
      if (!title) return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
      const payload = {
        title,
        slug: body.slug?.trim() || slugify(title),
        featured_image_url: body.featured_image_url || null,
        tag1: body.tag1 || null,
        tag2: body.tag2 || null,
        is_active: body.is_active ?? true,
      };
      const { data: created, error } = await supabase.from("galleries").insert(payload).select().single();
      if (error) throw new Error(error.message);
      return NextResponse.json({ success: true, gallery: created });
    }

    const form = await req.formData();
    const title = (form.get("title") || "").toString().trim();
    const tag1 = (form.get("tag1") || "").toString().trim() || null;
    const tag2 = (form.get("tag2") || "").toString().trim() || null;
    const is_active = (form.get("is_active") || "true").toString() === "true";
    const featured = form.get("featured_image");
    if (!title) return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });

    // upload featured first
    let featuredUrl = null;
    if (featured && featured.name) {
      featuredUrl = await uploadToBucket(featured, "featured");
    }

    // create gallery
    const payload = {
      title,
      slug: slugify(title),
      featured_image_url: featuredUrl,
      tag1,
      tag2,
      is_active,
    };
    const { data: gallery, error: insErr } = await supabase.from("galleries").insert(payload).select().single();
    if (insErr) throw new Error(insErr.message);

    // collect family images (multiple)
    const familyUploads = [];
    for (const [key, val] of form.entries()) {
      // accept family_images and family_images_0, family_images_1, ...
      const isFamilyKey =
        key === "family_images" || key.startsWith("family_images");
      if (isFamilyKey && val && typeof val === "object" && val.name) {
        familyUploads.push(val);
      }
    }
    if (familyUploads.length) {
      const rows = [];
      for (const image of familyUploads) {
        const url = await uploadToBucket(image, `albums/${gallery.id}`);
        if (url) rows.push({ gallery_id: gallery.id, image_url: url, sort_order: 0 });
      }
      if (rows.length) {
        const { error: imgErr } = await supabase.from("gallery_images").insert(rows);
        if (imgErr) throw new Error(imgErr.message);
      }
    }

    return NextResponse.json({ success: true, gallery });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

