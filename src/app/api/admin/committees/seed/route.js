import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

const ALLOWED = [
  { slug: "professional-affairs-committee", name: "Professional Affairs Committee" },
  { slug: "scientific-committee", name: "Scientific Committee" },
  { slug: "social-and-public-health-committee", name: "Social and Public Health Committee" },
  { slug: "media-committee", name: "Media Committee" },
];

// Source content overview from public site:
// https://www.bahraindentalsociety.org/committees
const SITE_OVERVIEW =
  "The Bahrain Dental Society is structured with several specialized committees, each dedicated to different aspects of the dental profession. These committees work collaboratively to address key areas such as education, research, advocacy, community outreach, and professional development. By leveraging the expertise and knowledge of its members, the society ensures that all aspects of dentistry are well-represented, continually advancing the field and supporting the needs of dental professionals across Bahrain.";

export async function POST(req) {
  try {
   
    const body = await req.json().catch(() => ({}));
    const requested = Array.isArray(body?.slugs) && body.slugs.length > 0
      ? ALLOWED.filter((a) => body.slugs.includes(a.slug))
      : ALLOWED;

    const results = [];
    for (const entry of requested) {
      // Skip if exists
      const { data: existing } = await supabase
        .from("committees")
        .select("id")
        .eq("slug", entry.slug)
        .maybeSingle?.();
      if (existing) {
        results.push({ slug: entry.slug, status: "exists" });
        continue;
      }
      const { data, error } = await supabase
        .from("committees")
        .insert({
          slug: entry.slug,
          name: entry.name,
          hero_title: entry.name,
          description: SITE_OVERVIEW,
          is_active: true,
          sort_order: 0,
        })
        .select("*")
        .single();
      if (error) {
        results.push({ slug: entry.slug, status: "error", message: error.message });
      } else {
        results.push({ slug: entry.slug, status: "created", id: data.id });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to seed committees" },
      { status: 500 }
    );
  }
}




