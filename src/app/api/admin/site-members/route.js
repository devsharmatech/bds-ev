"use server";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

// Upload helper to 'media' bucket
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

export async function GET(req) {
  try {
    
    const { searchParams } = new URL(req.url);
    const group = (searchParams.get("group") || "about").toLowerCase();
    const { data, error } = await supabase
      .from("site_members")
      .select("*")
      .eq("group_key", "team")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, members: data || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
   
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const group_key = (form.get("group_key") || "about").toString().toLowerCase();
      const name = (form.get("name") || "").toString().trim();
      const title = (form.get("title") || "").toString().trim() || null;
      const role = (form.get("role") || "").toString().trim() || null;
      const bio = (form.get("bio") || "").toString().trim() || null;
      const sort_order = Number(form.get("sort_order") || 0) || 0;
      const is_active = (form.get("is_active") || "true").toString() === "true";
      const email = (form.get("email") || "").toString().trim() || null;
      const phone = (form.get("phone") || "").toString().trim() || null;
      const instagram = (form.get("instagram") || "").toString().trim() || null;
      const linkedin = (form.get("linkedin") || "").toString().trim() || null;
      const facebook = (form.get("facebook") || "").toString().trim() || null;
      const twitter = (form.get("twitter") || "").toString().trim() || null;
      const photo = form.get("photo");
      if (!name) throw new Error("Name is required");
      let photo_url = null;
      if (photo && photo.name) {
        photo_url = await uploadToMediaBucket(photo, `site_members/${group_key}`);
      }
      const { data, error } = await supabase
        .from("site_members")
        .insert([{
          group_key, name, title, role, bio, sort_order, is_active, photo_url,
          email, phone, instagram, linkedin, facebook, twitter
        }])
        .select()
        .single();
      if (error) throw new Error(error.message);
      return NextResponse.json({ success: true, member: data });
    } else {
      const body = await req.json();
      const payload = {
        group_key: (body.group_key || "about").toLowerCase(),
        name: body.name,
        title: body.title || null,
        role: body.role || null,
        bio: body.bio || null,
        sort_order: Number(body.sort_order) || 0,
        is_active: body.is_active ?? true,
        photo_url: body.photo_url || null,
        email: body.email || null,
        phone: body.phone || null,
        instagram: body.instagram || null,
        linkedin: body.linkedin || null,
        facebook: body.facebook || null,
        twitter: body.twitter || null,
      };
      if (!payload.name) throw new Error("Name is required");
      const { data, error } = await supabase.from("site_members").insert(payload).select().single();
      if (error) throw new Error(error.message);
      return NextResponse.json({ success: true, member: data });
    }
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

