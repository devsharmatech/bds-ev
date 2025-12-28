"use server";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const group = (searchParams.get("group") || "about").toLowerCase();
    const { data, error } = await supabase
      .from("site_members")
      .select("id,name,title,role,bio,photo_url,sort_order,is_active,email,phone,instagram,linkedin,facebook,twitter")
      .eq("group_key", "team")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, members: data || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}


