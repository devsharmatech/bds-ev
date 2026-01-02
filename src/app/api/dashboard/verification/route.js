// app/api/dashboard/verification/route.js
import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// GET verification documents
export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;

    // Fetch user verification status and documents
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, is_member_verified, membership_type")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // Fetch member profile with document URLs
    const { data: profile, error: profileError } = await supabase
      .from("member_profiles")
      .select("id_card_url, personal_photo_url")
      .eq("user_id", userId)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError;
    }

    return NextResponse.json({
      success: true,
      is_member_verified: user.is_member_verified || false,
      membership_type: user.membership_type,
      id_card_url: profile?.id_card_url || null,
      personal_photo_url: profile?.personal_photo_url || null,
    });
  } catch (error) {
    console.error("Error fetching verification data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch verification data", error: error.message },
      { status: 500 }
    );
  }
}

// PUT - upload verification documents (members can upload but not change verification status)
export async function PUT(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;

    // Check if user has paid membership
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, membership_type")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    if (user.membership_type !== "paid") {
      return NextResponse.json(
        { success: false, message: "Only paid members can upload verification documents" },
        { status: 403 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, message: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const idCardFile = formData.get("id_card");
    const personalPhotoFile = formData.get("personal_photo");

    if (!idCardFile && !personalPhotoFile) {
      return NextResponse.json(
        { success: false, message: "At least one document must be provided" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    let idCardUrl = null;
    let personalPhotoUrl = null;

    // Upload ID Card
    if (idCardFile && idCardFile.size > 0) {
      if (!allowedTypes.includes(idCardFile.type)) {
        return NextResponse.json(
          { success: false, message: "ID Card must be JPEG/PNG/WebP/PDF" },
          { status: 400 }
        );
      }
      if (idCardFile.size > maxSize) {
        return NextResponse.json(
          { success: false, message: "ID Card file too large (max 10MB)" },
          { status: 400 }
        );
      }

      const ext = idCardFile.name.split(".").pop();
      const filename = `${uuidv4()}.${ext}`;
      const path = `verification/${userId}/id_card_${filename}`;

      // Delete old file if exists
      const { data: existingProfile } = await supabase
        .from("member_profiles")
        .select("id_card_url")
        .eq("user_id", userId)
        .single();

      if (existingProfile?.id_card_url) {
        const oldPath = existingProfile.id_card_url.split("/").slice(-2).join("/");
        if (oldPath) {
          await supabase.storage.from("profile_pictures").remove([`verification/${userId}/${oldPath.split("/").pop()}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("profile_pictures")
        .upload(path, idCardFile, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("ID Card upload error:", uploadError);
        return NextResponse.json(
          { success: false, message: "Failed to upload ID Card", error: uploadError.message },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage.from("profile_pictures").getPublicUrl(path);
      idCardUrl = urlData.publicUrl || null;
    }

    // Upload Personal Photo
    if (personalPhotoFile && personalPhotoFile.size > 0) {
      if (!allowedTypes.includes(personalPhotoFile.type)) {
        return NextResponse.json(
          { success: false, message: "Personal Photo must be JPEG/PNG/WebP/PDF" },
          { status: 400 }
        );
      }
      if (personalPhotoFile.size > maxSize) {
        return NextResponse.json(
          { success: false, message: "Personal Photo file too large (max 10MB)" },
          { status: 400 }
        );
      }

      const ext = personalPhotoFile.name.split(".").pop();
      const filename = `${uuidv4()}.${ext}`;
      const path = `verification/${userId}/personal_photo_${filename}`;

      // Delete old file if exists
      const { data: existingProfile } = await supabase
        .from("member_profiles")
        .select("personal_photo_url")
        .eq("user_id", userId)
        .single();

      if (existingProfile?.personal_photo_url) {
        const oldPath = existingProfile.personal_photo_url.split("/").slice(-2).join("/");
        if (oldPath) {
          await supabase.storage.from("profile_pictures").remove([`verification/${userId}/${oldPath.split("/").pop()}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("profile_pictures")
        .upload(path, personalPhotoFile, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("Personal Photo upload error:", uploadError);
        return NextResponse.json(
          { success: false, message: "Failed to upload Personal Photo", error: uploadError.message },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage.from("profile_pictures").getPublicUrl(path);
      personalPhotoUrl = urlData.publicUrl || null;
    }

    // Update member_profiles with document URLs
    const { data: existingProfile } = await supabase
      .from("member_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    const updateData = {};
    if (idCardUrl !== null) updateData.id_card_url = idCardUrl;
    if (personalPhotoUrl !== null) updateData.personal_photo_url = personalPhotoUrl;

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from("member_profiles")
        .update(updateData)
        .eq("user_id", userId);

      if (updateError) throw updateError;
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from("member_profiles")
        .insert({
          user_id: userId,
          ...updateData,
        });

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: "Documents uploaded successfully. Admin will review and verify your account.",
      id_card_url: idCardUrl,
      personal_photo_url: personalPhotoUrl,
    });
  } catch (error) {
    console.error("Error uploading verification documents:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload documents", error: error.message },
      { status: 500 }
    );
  }
}


