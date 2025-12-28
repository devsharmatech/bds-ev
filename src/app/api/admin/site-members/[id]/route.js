"use server";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

async function uploadToMediaBucket(file, pathPrefix) {
  if (!file || !file.name) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const fname = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from("media")
    .upload(fname, buffer, { contentType: file.type || "image/jpeg", upsert: true });
  if (upErr) throw new Error(upErr.message);
  const { data: urlData } = supabase.storage.from("media").getPublicUrl(fname);
  return urlData?.publicUrl || null;
}

export async function PUT(req, { params }) {
  try {
    
    const { id } = await params;
    const contentType = req.headers.get("content-type") || "";
    const update = {};
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const name = (form.get("name") || "").toString().trim();
      const title = (form.get("title") || "").toString().trim();
      const role = (form.get("role") || "").toString().trim();
      const bio = (form.get("bio") || "").toString().trim();
      const email = (form.get("email") || "").toString().trim();
      const phone = (form.get("phone") || "").toString().trim();
      const instagram = (form.get("instagram") || "").toString().trim();
      const linkedin = (form.get("linkedin") || "").toString().trim();
      const facebook = (form.get("facebook") || "").toString().trim();
      const twitter = (form.get("twitter") || "").toString().trim();
      const sort_order = form.get("sort_order");
      const is_active = form.get("is_active");
      const group_key = (form.get("group_key") || "").toString().trim().toLowerCase();
      const photo = form.get("photo");
      if (name) update.name = name;
      if (title !== undefined) update.title = title || null;
      if (role !== undefined) update.role = role || null;
      if (bio !== undefined) update.bio = bio || null;
      if (email !== undefined) update.email = email || null;
      if (phone !== undefined) update.phone = phone || null;
      if (instagram !== undefined) update.instagram = instagram || null;
      if (linkedin !== undefined) update.linkedin = linkedin || null;
      if (facebook !== undefined) update.facebook = facebook || null;
      if (twitter !== undefined) update.twitter = twitter || null;
      if (group_key) update.group_key = group_key;
      if (sort_order !== null && sort_order !== undefined) update.sort_order = Number(sort_order) || 0;
      if (is_active !== null && is_active !== undefined) update.is_active = String(is_active) === "true";
      if (photo && photo.name) {
        update.photo_url = await uploadToMediaBucket(photo, `site_members/${group_key || "about"}`);
      }
    } else {
      const body = await req.json();
      if (body.name) update.name = String(body.name).trim();
      if ("title" in body) update.title = body.title || null;
      if ("role" in body) update.role = body.role || null;
      if ("bio" in body) update.bio = body.bio || null;
      if ("email" in body) update.email = body.email || null;
      if ("phone" in body) update.phone = body.phone || null;
      if ("instagram" in body) update.instagram = body.instagram || null;
      if ("linkedin" in body) update.linkedin = body.linkedin || null;
      if ("facebook" in body) update.facebook = body.facebook || null;
      if ("twitter" in body) update.twitter = body.twitter || null;
      if ("group_key" in body) update.group_key = (body.group_key || "").toLowerCase();
      if ("sort_order" in body) update.sort_order = Number(body.sort_order) || 0;
      if ("is_active" in body) update.is_active = !!body.is_active;
      if ("photo_url" in body) update.photo_url = body.photo_url || null;
    }
    update.updated_at = new Date().toISOString();
    const { error } = await supabase.from("site_members").update(update).eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    
    const { id } = await params;
    const { error } = await supabase.from("site_members").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}


