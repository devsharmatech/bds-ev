import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("committees")
      .select("*")
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

export async function POST(req) {
  try {
   
    const body = await req.json();
    const {
      slug,
      name,
      hero_title,
      hero_subtitle,
      focus,
      description,
      banner_image,
      contact_email,
      sort_order,
      is_active,
      seed_defaults,
    } = body || {};

    if (!slug || !name) {
      return NextResponse.json(
        { success: false, message: "slug and name are required" },
        { status: 400 }
      );
    }

    // Allow only the 4 official committee slugs
    const allowed = [
      "professional-affairs-committee",
      "scientific-committee",
      "social-and-public-health-committee",
      "media-committee",
    ];
    if (!allowed.includes(slug)) {
      return NextResponse.json(
        { success: false, message: "Invalid slug. Allowed: professional-affairs-committee, scientific-committee, social-and-public-health-committee, media-committee" },
        { status: 400 }
      );
    }

    // Prevent duplicate creation
    const { data: existing } = await supabase
      .from("committees")
      .select("id")
      .eq("slug", slug)
      .maybeSingle?.();

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Committee with this slug already exists" },
        { status: 409 }
      );
    }

    // Defaults based on public site overview
    // Source: https://www.bahraindentalsociety.org/committees
    const siteOverview =
      "The Bahrain Dental Society is structured with several specialized committees, each dedicated to different aspects of the dental profession. These committees work collaboratively to address key areas such as education, research, advocacy, community outreach, and professional development. By leveraging the expertise and knowledge of its members, the society ensures that all aspects of dentistry are well-represented, continually advancing the field and supporting the needs of dental professionals across Bahrain.";

    const { data, error } = await supabase
      .from("committees")
      .insert({
        slug,
        name,
        hero_title: hero_title || name || null,
        hero_subtitle: hero_subtitle || null,
        focus: focus || null,
        description: seed_defaults ? siteOverview : (description || null),
        banner_image: banner_image || null,
        contact_email: contact_email || null,
        sort_order: Number.isFinite(sort_order) ? sort_order : 0,
        is_active: is_active !== false,
      })
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, committee: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create committee" },
      { status: 500 }
    );
  }
}

