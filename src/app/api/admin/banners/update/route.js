import { supabase } from "@/lib/supabaseAdmin";

export async function PUT(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let id, url, status, newImage, newImageUrl;

    if (isJson) {
      const body = await req.json();
      id = body.id;
      url = body.url;
      status = body.status === true || body.status === 'true';
      newImageUrl = body.image_url || null;
    } else {
      const formData = await req.formData();
      id = formData.get("id");
      url = formData.get("url");
      status = formData.get("status") === "true";
      newImage = formData.get("image");
    }

    if (!id) {
      return Response.json({ success: false, error: "Banner ID required" }, { status: 400 });
    }

    // Get existing banner
    const { data: existing, error: findError } = await supabase
      .from("banners")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !existing) {
      return Response.json({ success: false, error: "Banner not found" }, { status: 404 });
    }

    let image_url = existing.image_url;

    if (newImageUrl) {
      // JSON path: client already uploaded
      const oldPath = existing.image_url?.split("/storage/v1/object/public/media/")[1];
      if (oldPath) {
        await supabase.storage.from("media").remove([oldPath]);
      }
      image_url = newImageUrl;
    } else if (newImage && newImage.name) {
      // Legacy FormData path
      const oldPath = existing.image_url.split("/storage/v1/object/public/media/")[1];
      if (oldPath) {
        await supabase.storage.from("media").remove([oldPath]);
      }

      const ext = newImage.name.split(".").pop();
      const fileName = `banner_${Date.now()}.${ext}`;
      const fileBuffer = Buffer.from(await newImage.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(`banners/${fileName}`, fileBuffer, {
          contentType: newImage.type,
        });

      if (uploadError) {
        return Response.json({ success: false, error: uploadError.message }, { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(`banners/${fileName}`);

      image_url = urlData.publicUrl;
    }

    // UPDATE BANNER
    const { data, error } = await supabase
      .from("banners")
      .update({
        url,
        status,
        image_url,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, banner: data });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
