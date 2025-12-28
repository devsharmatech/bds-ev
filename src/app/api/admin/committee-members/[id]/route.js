import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseAdmin";
import { ensureAdmin } from "@/lib/verifyToken";

export async function GET(_req, { params }) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from("committee_members")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, member: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch member" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
     ensureAdmin(req);
    const { id } = await params;
    const contentType = req.headers.get("content-type") || "";
    const update = {};

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const name = form.get("name");
      const position = form.get("position");
      const specialty = form.get("specialty");
      const role = form.get("role");
      const sort_order = form.get("sort_order");
      const file = form.get("photo");

      if (name !== null) update.name = name;
      update.position = position || null;
      update.specialty = specialty || null;
      update.role = role || null;
      if (sort_order !== null && sort_order !== undefined) {
        update.sort_order = Number(sort_order) || 0;
      }

      if (file && typeof file === "object" && file.name) {
        const arrayBuffer = await file.arrayBuffer();
        const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
        const objectPath = `${id}/${crypto.randomUUID()}.${fileExt}`;
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
        update.photo_url = pub?.publicUrl || null;
      }
    } else {
      const body = await req.json();
      update.name = body.name;
      update.position = body.position ?? null;
      update.specialty = body.specialty ?? null;
      update.role = body.role ?? null;
      update.photo_url = body.photo_url ?? null;
      update.sort_order = Number.isFinite(body.sort_order) ? body.sort_order : undefined;
    }
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);
    const { data, error } = await supabase
      .from("committee_members")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, member: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update member" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    
    const { id } = await params;
    const { error } = await supabase.from("committee_members").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete member" },
      { status: 500 }
    );
  }
}


