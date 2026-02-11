import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/upload/signed-url
 * Generate a signed upload URL for direct-to-Supabase uploads.
 * This is a lightweight endpoint (no file data) so it won't time out.
 *
 * Body: { bucket, folder, fileName, contentType }
 * Returns: { signedUrl, path, publicUrl }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { bucket, folder, fileName, contentType } = body;

    if (!bucket || !fileName) {
      return NextResponse.json(
        { success: false, message: "bucket and fileName are required" },
        { status: 400 }
      );
    }

    // Validate bucket name against allowed buckets
    const ALLOWED_BUCKETS = [
      "profile_pictures",
      "events",
      "gallery",
      "research",
      "speaker-documents",
      "media",
      "committee_member_profile",
    ];

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json(
        { success: false, message: "Invalid storage bucket" },
        { status: 400 }
      );
    }

    // Build unique path
    const ext = fileName.split(".").pop() || "bin";
    const uniqueName = `${uuidv4()}.${ext}`;
    const path = folder ? `${folder}/${uniqueName}` : uniqueName;

    // Create a signed upload URL (valid for 2 minutes)
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error) {
      console.error("[SIGNED-URL] Error creating signed URL:", error);
      return NextResponse.json(
        { success: false, message: "Failed to create upload URL", error: error.message },
        { status: 500 }
      );
    }

    // Also get the public URL for after upload
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return NextResponse.json({
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path,
      publicUrl: publicUrlData?.publicUrl || null,
    });
  } catch (error) {
    console.error("[SIGNED-URL] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
