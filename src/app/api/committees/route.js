import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("committees")
      .select("id, slug, name, focus, hero_title, hero_subtitle, banner_image, sort_order, is_active")
      .eq("is_active", true)
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



