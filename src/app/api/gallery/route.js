"use server";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const { data, error } = await supabase
      .from("galleries")
      .select("id,title,slug,featured_image_url,tag1,tag2,created_at")
      .eq("is_active", true)
      .ilike("title", q ? `%${q}%` : "%")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, galleries: data || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

