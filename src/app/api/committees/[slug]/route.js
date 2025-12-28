import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export async function GET(_req, { params }) {
  try {
    const { slug } = params;
    const { data: committee, error } = await supabase
      .from("committees")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    if (error) throw error;

    const { data: pages } = await supabase
      .from("committee_pages")
      .select("*")
      .eq("committee_id", committee.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const { data: members } = await supabase
      .from("committee_members")
      .select("id, name, position, specialty, role, photo_url, sort_order")
      .eq("committee_id", committee.id)
      .order("sort_order", { ascending: true });

    return NextResponse.json({
      success: true,
      committee,
      pages: pages || [],
      members: members || [],
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch committee" },
      { status: 500 }
    );
  }
}

