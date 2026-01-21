import { supabase } from "@/lib/supabaseAdmin";

export async function PUT(req) {
  try {
    const formData = await req.formData();
    const user_id = formData.get("id");
    const newImage = formData.get("profile_picture");

    // -----------------------------
    // VALIDATION: ID REQUIRED
    // -----------------------------
    if (!user_id) {
      return Response.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch user
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("id", user_id)
      .single();

    if (userErr || !user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    let newUrl = user.profile_image;

    // -----------------------------
    // VALIDATE IMAGE FILE
    // -----------------------------
    if (newImage && newImage.name) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

      if (!allowedTypes.includes(newImage.type)) {
        return Response.json(
          { success: false, error: "Only JPG, PNG, WEBP, GIF images allowed" },
          { status: 422 }
        );
      }

      // Max size: 5MB
      const maxSize = 5 * 1024 * 1024;
      if (newImage.size > maxSize) {
        return Response.json(
          { success: false, error: "Image must be less than 5MB" },
          { status: 422 }
        );
      }

      // -----------------------------
      // DELETE OLD IMAGE
      // -----------------------------
      if (user.profile_image) {
        const path = user.profile_image.split(
          "/storage/v1/object/public/profile_pictures/"
        )[1];

        if (path) {
          await supabase.storage.from("profile_pictures").remove([path]);
        }
      }

      // -----------------------------
      // UPLOAD NEW IMAGE
      // -----------------------------
      const ext = newImage.name.split(".").pop();
      const fileName = `user_${Date.now()}.${ext}`;
      const fileBuffer = Buffer.from(await newImage.arrayBuffer());

      const { error: uploadErr } = await supabase.storage
        .from("profile_pictures")
        .upload(fileName, fileBuffer, { contentType: newImage.type });

      if (uploadErr) {
        return Response.json(
          { success: false, error: "Image upload failed" },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage
        .from("profile_pictures")
        .getPublicUrl(fileName);

      newUrl = urlData.publicUrl;
    }

    // -----------------------------
    // UPDATE DATABASE
    // -----------------------------
    const { data, error } = await supabase
      .from("users")
      .update({
        profile_image: newUrl,
        updated_at: new Date(),
      })
      .eq("id", user_id)
      .select()
      .single();

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return Response.json({ success: true, user: data });

  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
