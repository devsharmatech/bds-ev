import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

function getMediaPathFromUrl(url) {
  if (!url) return null;
  const marker = '/storage/v1/object/public/media/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.substring(idx + marker.length);
}

async function getSlides() {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[HERO-SLIDES] Fetch error:', error);
    return [];
  }

  return data || [];
}

export async function GET() {
  try {
    const slides = await getSlides();
    return NextResponse.json({ success: true, slides });
  } catch (error) {
    console.error('[HERO-SLIDES] GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch hero slides' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = (formData.get('title') || '').toString().trim();
    const subtitle = (formData.get('subtitle') || '').toString().trim();
    const description = (formData.get('description') || '').toString().trim();
    const buttonText = (formData.get('button_text') || '').toString().trim();
    const buttonUrl = (formData.get('button_url') || '').toString().trim();
    const secondaryButtonText = (formData.get('secondary_button_text') || '').toString().trim();
    const secondaryButtonUrl = (formData.get('secondary_button_url') || '').toString().trim();
    const slideType = (formData.get('slide_type') || 'content').toString().trim() || 'content';
    const showStatsRow = (formData.get('show_stats_row') || 'true').toString() === 'true';
    const image = formData.get('image');

    if (!title && !description && !image) {
      return NextResponse.json({ success: false, error: 'At least title, description or image is required' }, { status: 400 });
    }

    let imageUrl = null;

    if (image && typeof image === 'object' && image.size > 0) {
      const ext = image.name.split('.').pop();
      const filename = `hero-slide-${uuidv4()}.${ext}`;
      const filePath = `hero-slides/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, image, {
          contentType: image.type,
          upsert: true,
        });

      if (uploadError) {
        console.error('[HERO-SLIDES] Upload error:', uploadError);
        return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      imageUrl = urlData.publicUrl || null;
    }

    // Determine next sort_order
    const { data: existing, error: existingError } = await supabase
      .from('hero_slides')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    if (existingError) {
      console.error('[HERO-SLIDES] Fetch max sort_order error:', existingError);
    }

    const nextSortOrder = existing && existing.length ? (existing[0].sort_order || 0) + 1 : 0;

    const id = uuidv4();

    const { data: inserted, error: insertError } = await supabase
      .from('hero_slides')
      .insert({
        id,
        slide_type: slideType,
        title,
        subtitle,
        description,
        button_text: buttonText,
        button_url: buttonUrl,
        secondary_button_text: secondaryButtonText,
        secondary_button_url: secondaryButtonUrl,
        image_url: imageUrl,
        show_stats_row: showStatsRow,
        is_active: true,
        sort_order: nextSortOrder,
      })
      .select('*');

    if (insertError) {
      console.error('[HERO-SLIDES] Insert error:', insertError);
      return NextResponse.json({ success: false, error: 'Failed to create hero slide' }, { status: 500 });
    }

    const slides = await getSlides();

    return NextResponse.json({ success: true, slide: inserted?.[0] || null, slides });
  } catch (error) {
    console.error('[HERO-SLIDES] POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create hero slide' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const formData = await request.formData();
    const id = (formData.get('id') || '').toString();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Slide id is required' }, { status: 400 });
    }

    const title = formData.get('title');
    const subtitle = formData.get('subtitle');
    const description = formData.get('description');
    const buttonText = formData.get('button_text');
    const buttonUrl = formData.get('button_url');
    const secondaryButtonText = formData.get('secondary_button_text');
    const secondaryButtonUrl = formData.get('secondary_button_url');
    const slideType = formData.get('slide_type');
    const isActive = formData.get('is_active');
    const showStatsRow = formData.get('show_stats_row');
    const image = formData.get('image');
    const removeImage = (formData.get('remove_image') || '').toString() === 'true';
    const { data: slides, error: fetchError } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !slides) {
      console.error('[HERO-SLIDES] Slide not found or fetch error:', fetchError);
      return NextResponse.json({ success: false, error: 'Slide not found' }, { status: 404 });
    }

    const slide = { ...slides };

    if (title !== null) slide.title = title.toString().trim();
    if (subtitle !== null) slide.subtitle = subtitle.toString().trim();
    if (description !== null) slide.description = description.toString().trim();
    if (buttonText !== null) slide.button_text = buttonText.toString().trim();
    if (buttonUrl !== null) slide.button_url = buttonUrl.toString().trim();
    if (secondaryButtonText !== null) slide.secondary_button_text = secondaryButtonText.toString().trim();
    if (secondaryButtonUrl !== null) slide.secondary_button_url = secondaryButtonUrl.toString().trim();
    if (slideType !== null && slideType.toString().trim()) slide.slide_type = slideType.toString().trim();
    if (isActive !== null) slide.is_active = isActive === 'true';
    if (showStatsRow !== null) slide.show_stats_row = showStatsRow === 'true';

    if (removeImage) {
      const path = getMediaPathFromUrl(slide.image_url);
      if (path) {
        await supabase.storage.from('media').remove([path]);
      }
      slide.image_url = null;
    }
    if (!removeImage && image && typeof image === 'object' && image.size > 0) {
      const ext = image.name.split('.').pop();
      const filename = `hero-slide-${id}-${uuidv4()}.${ext}`;
      const filePath = `hero-slides/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, image, {
          contentType: image.type,
          upsert: true,
        });

      if (uploadError) {
        console.error('[HERO-SLIDES] Upload error:', uploadError);
        return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      slide.image_url = urlData.publicUrl || slide.image_url || null;
    }

    slide.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('hero_slides')
      .update(slide)
      .eq('id', id);

    if (updateError) {
      console.error('[HERO-SLIDES] Update error:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update hero slide' }, { status: 500 });
    }

    const allSlides = await getSlides();

    return NextResponse.json({ success: true, slide, slides: allSlides });
  } catch (error) {
    console.error('[HERO-SLIDES] PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update hero slide' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const id = (body?.id || '').toString();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Slide id is required' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[HERO-SLIDES] Delete error:', deleteError);
      return NextResponse.json({ success: false, error: 'Failed to delete hero slide' }, { status: 500 });
    }

    // Re-normalize sort_order
    const slides = await getSlides();
    const normalized = slides.map((s, idx) => ({ ...s, sort_order: idx }));

    // Persist normalized order
    for (const s of normalized) {
      await supabase
        .from('hero_slides')
        .update({ sort_order: s.sort_order })
        .eq('id', s.id);
    }

    const finalSlides = await getSlides();

    return NextResponse.json({ success: true, slides: finalSlides });
  } catch (error) {
    console.error('[HERO-SLIDES] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete hero slide' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const orderedIds = Array.isArray(body?.orderedIds) ? body.orderedIds.map((id) => id.toString()) : [];

    const slides = await getSlides();

    let reordered = slides;
    if (orderedIds.length) {
      const byId = new Map(slides.map((s) => [s.id, s]));
      reordered = [];
      for (const id of orderedIds) {
        const slide = byId.get(id);
        if (slide) {
          reordered.push(slide);
          byId.delete(id);
        }
      }
      for (const slide of byId.values()) {
        reordered.push(slide);
      }
    }

    const normalized = reordered.map((s, idx) => ({ ...s, sort_order: idx }));

    // Persist normalized order
    for (const s of normalized) {
      await supabase
        .from('hero_slides')
        .update({ sort_order: s.sort_order })
        .eq('id', s.id);
    }

    const finalSlides = await getSlides();

    return NextResponse.json({ success: true, slides: finalSlides });
  } catch (error) {
    console.error('[HERO-SLIDES] PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Failed to reorder hero slides' }, { status: 500 });
  }
}
