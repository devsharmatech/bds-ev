import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    const { slug } = await params;
    const normalized = String(slug || "").trim().toLowerCase();
    const { data: committee, error } = await supabase
      .from("committees")
      .select("*")
      .ilike("slug", normalized)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!committee) {
      return NextResponse.json(
        { success: false, message: "Committee not found" },
        { status: 404 }
      );
    }

    const { data: pages } = await supabase
      .from("committee_sections")
      .select("*")
      .eq("committee_id", committee.id)
      .order("sort_order", { ascending: true });

    return NextResponse.json({
      success: true,
      committee,
      pages: pages || [],
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch committee" },
      { status: 500 }
    );
  }
}

