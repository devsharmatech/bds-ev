"use server";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const { data: gallery, error } = await supabase
      .from("galleries")
      .select("id,title,slug,featured_image_url,short_description,tag1,tag2,created_at")
      .eq("id", id)
      .eq("is_active", true)
      .single();
    if (error) throw new Error(error.message);
    const { data: images, error: imgErr } = await supabase
      .from("gallery_images")
      .select("id,image_url,sort_order")
      .eq("gallery_id", id)
      .order("sort_order", { ascending: true });
    if (imgErr) throw new Error(imgErr.message);
    return NextResponse.json({ success: true, gallery, images: images || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}




