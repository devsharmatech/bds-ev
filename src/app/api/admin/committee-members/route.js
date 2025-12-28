import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const committeeId = searchParams.get("committee_id");
    let query = supabase
      .from("committee_members")
      .select("*");
    if (committeeId) query = query.eq("committee_id", committeeId);
    const { data, error } = await query.order("sort_order", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ success: true, members: data || [] });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    
    const contentType = req.headers.get("content-type") || "";

    let committee_id, name, position, specialty, role, photo_url, sort_order;
    let file;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      committee_id = form.get("committee_id");
      name = form.get("name");
      position = form.get("position");
      specialty = form.get("specialty");
      role = form.get("role");
      sort_order = form.get("sort_order") ? Number(form.get("sort_order")) : 0;
      file = form.get("photo");
    } else {
      const body = await req.json();
      committee_id = body.committee_id;
      name = body.name;
      position = body.position;
      specialty = body.specialty;
      role = body.role;
      photo_url = body.photo_url;
      sort_order = Number.isFinite(body.sort_order) ? body.sort_order : 0;
    }

    if (!committee_id || !name) {
      return NextResponse.json(
        { success: false, message: "committee_id and name are required" },
        { status: 400 }
      );
    }

    // Upload photo if provided
    if (file && typeof file === "object" && file.name) {
      const arrayBuffer = await file.arrayBuffer();
      const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
      const objectPath = `${committee_id}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadErr } = await supabase
        .storage
        .from("committee_member_profile")
        .upload(objectPath, arrayBuffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });
      if (uploadErr) {
        return NextResponse.json(
          { success: false, message: "Image upload failed", error: uploadErr.message },
          { status: 500 }
        );
      }
      const { data: pub } = supabase
        .storage
        .from("committee_member_profile")
        .getPublicUrl(objectPath);
      photo_url = pub?.publicUrl || null;
    }

    const { data, error } = await supabase
      .from("committee_members")
      .insert({
        committee_id,
        name,
        position: position || null,
        specialty: specialty || null,
        role: role || null,
        photo_url: photo_url || null,
        sort_order: Number.isFinite(sort_order) ? sort_order : 0,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, member: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create member" },
      { status: 500 }
    );
  }
}


