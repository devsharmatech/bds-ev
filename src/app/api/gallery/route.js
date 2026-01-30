"use server";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const { data, error } = await supabase
      .from("galleries")
      .select("id,title,slug,featured_image_url,short_description,tag1,tag2,created_at,updated_at,gallery_images(count)")
      .eq("is_active", true)
      .ilike("title", q ? `%${q}%` : "%")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const galleries = (data || []).map((g) => ({
      id: g.id,
      title: g.title,
      slug: g.slug,
      featured_image_url: g.featured_image_url,
      short_description: g.short_description,
      tag1: g.tag1,
      tag2: g.tag2,
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

