import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const committeeId = searchParams.get("committee_id");
    let query = supabase.from("committee_pages").select("*");
    if (committeeId) query = query.eq("committee_id", committeeId);
    const { data, error } = await query.order("sort_order", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ success: true, pages: data || [] });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    
    const body = await req.json();
    const { committee_id, slug, title, content, sort_order, is_active } = body || {};
    if (!committee_id || !slug || !title) {
      return NextResponse.json(
        { success: false, message: "committee_id, slug and title are required" },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("committee_pages")
      .insert({
        committee_id,
        slug,
        title,
        content: content || null,
        sort_order: Number.isFinite(sort_order) ? sort_order : 0,
        is_active: is_active !== false,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, page: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create page" },
      { status: 500 }
    );
  }
}

