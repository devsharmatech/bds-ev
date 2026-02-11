import { supabase } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let image_url = null;
    let url, status;

    if (isJson) {
      const body = await req.json();
      url = body.url;
      status = body.status === true || body.status === 'true';
      image_url = body.image_url || null;

      if (!image_url) {
        return Response.json(
          { success: false, error: "Banner image required" },
          { status: 400 }
        );
      }
    } else {
      const formData = await req.formData();
      const image = formData.get("image");
      url = formData.get("url");
      status = formData.get("status") === "true";

      if (!image) {
        return Response.json(
          { success: false, error: "Banner image required" },
          { status: 400 }
        );
      }

      const ext = image.name.split(".").pop();
      const fileName = `banner_${Date.now()}.${ext}`;
      const fileBuffer = Buffer.from(await image.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(`banners/${fileName}`, fileBuffer, {
          contentType: image.type,
        });

      if (uploadError) {
        return Response.json(
          { success: false, error: uploadError.message },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(`banners/${fileName}`);

      image_url = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("banners")
      .insert([{ image_url, url, status }])
      .select()
      .single();

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, banner: data }, { status: 201 });

  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
