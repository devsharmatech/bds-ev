"use server";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

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

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const { data: gallery, error } = await supabase.from("galleries").select("*").eq("id", id).single();
    if (error) throw new Error(error.message);
    const { data: images, error: imgErr } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("gallery_id", id)
      .order("sort_order", { ascending: true });
    if (imgErr) throw new Error(imgErr.message);
    return NextResponse.json({ success: true, gallery, images: images || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    ensureAdmin(req);
    const { id } = await params;
    const contentType = req.headers.get("content-type") || "";
    const update = {};
    let addImages = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const title = (form.get("title") || "").toString().trim();
      const tag1 = (form.get("tag1") || "").toString().trim() || null;
      const tag2 = (form.get("tag2") || "").toString().trim() || null;
      const is_active = (form.get("is_active") || "").toString();
      const featured = form.get("featured_image");

      if (title) update.title = title;
      update.tag1 = tag1;
      update.tag2 = tag2;
      if (is_active) update.is_active = is_active === "true";

      if (featured && featured.name) {
        update.featured_image_url = await uploadToBucket(featured, "featured");
      }

      for (const [key, val] of form.entries()) {
        if (key === "family_images" && val && typeof val === "object" && val.name) {
          addImages.push(val);
        }
      }
    } else {
      const body = await req.json();
      if (body.title) update.title = String(body.title).trim();
      if (Object.prototype.hasOwnProperty.call(body, "tag1")) update.tag1 = body.tag1 || null;
      if (Object.prototype.hasOwnProperty.call(body, "tag2")) update.tag2 = body.tag2 || null;
      if (Object.prototype.hasOwnProperty.call(body, "is_active")) update.is_active = !!body.is_active;
    }

    if (Object.keys(update).length) {
      update.updated_at = new Date().toISOString();
      const { error: upErr } = await supabase.from("galleries").update(update).eq("id", id);
      if (upErr) throw new Error(upErr.message);
    }

    if (addImages.length) {
      const rows = [];
      for (const image of addImages) {
        const url = await uploadToBucket(image, `albums/${id}`);
        if (url) rows.push({ gallery_id: id, image_url: url, sort_order: 0 });
      }
      if (rows.length) {
        const { error: imgErr } = await supabase.from("gallery_images").insert(rows);
        if (imgErr) throw new Error(imgErr.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    ensureAdmin(req);
    const { id } = await params;
    const { error } = await supabase.from("galleries").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

