import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/admin/hero-settings/update
 * Update hero section settings (video/poster)
 */
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let video = null, poster = null, videoUrl = null, posterUrl = null, removeVideo = false, removePoster = false;

    if (isJson) {
      const body = await request.json();
      videoUrl = body.video_url || null;
      posterUrl = body.poster_url || null;
      removeVideo = body.remove_video === true;
      removePoster = body.remove_poster === true;
    } else {
      const formData = await request.formData();
      video = formData.get('video');
      poster = formData.get('poster');
      videoUrl = formData.get('video_url');
      posterUrl = formData.get('poster_url');
      removeVideo = (formData.get('remove_video') || '').toString() === 'true';
      removePoster = (formData.get('remove_poster') || '').toString() === 'true';
    }

    const updates = [];

    // Handle video removal
    if (removeVideo) {
      updates.push({
        setting_key: 'hero_video_url',
        setting_value: '',
        setting_type: 'video',
        description: 'Background video for the hero section on homepage',
        updated_at: new Date().toISOString(),
      });
    } else if (video && video.size > 0) {
      const fileExt = video.name.split('.').pop();
      const fileName = `hero-video-${uuidv4()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, video, {
          contentType: video.type,
          upsert: true,
        });

      if (uploadError) {
        console.error('[HERO-SETTINGS] Video upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      updates.push({
        setting_key: 'hero_video_url',
        setting_value: urlData.publicUrl,
        setting_type: 'video',
        description: 'Background video for the hero section on homepage',
        updated_at: new Date().toISOString(),
      });
    } else if (videoUrl) {
      // Handle direct URL input
      updates.push({
        setting_key: 'hero_video_url',
        setting_value: videoUrl,
        setting_type: 'video',
        description: 'Background video for the hero section on homepage',
        updated_at: new Date().toISOString(),
      });
    }

    // Handle poster removal
    if (removePoster) {
      updates.push({
        setting_key: 'hero_poster_url',
        setting_value: '',
        setting_type: 'image',
        description: 'Poster image shown before video loads',
        updated_at: new Date().toISOString(),
      });
    } else if (poster && poster.size > 0) {
      const fileExt = poster.name.split('.').pop();
      const fileName = `hero-poster-${uuidv4()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, poster, {
          contentType: poster.type,
          upsert: true,
        });

      if (uploadError) {
        console.error('[HERO-SETTINGS] Poster upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      updates.push({
        setting_key: 'hero_poster_url',
        setting_value: urlData.publicUrl,
        setting_type: 'image',
        description: 'Poster image shown before video loads',
        updated_at: new Date().toISOString(),
      });
    } else if (posterUrl) {
      // Handle direct URL input
      updates.push({
        setting_key: 'hero_poster_url',
        setting_value: posterUrl,
        setting_type: 'image',
        description: 'Poster image shown before video loads',
        updated_at: new Date().toISOString(),
      });
    }

    // Upsert settings
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: upsertError } = await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'setting_key' });

        if (upsertError) {
          console.error('[HERO-SETTINGS] Upsert error:', upsertError);
          throw upsertError;
        }
      }
    }

    // Fetch updated settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('*')
      .in('setting_key', ['hero_video_url', 'hero_poster_url']);

    const settingsObj = {};
    settings?.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });

    return NextResponse.json({
      success: true,
      message: 'Hero settings updated successfully',
      settings: {
        hero_video_url: settingsObj.hero_video_url || '',
        hero_poster_url: settingsObj.hero_poster_url || '',
      },
    });
  } catch (error) {
    console.error('[HERO-SETTINGS] Update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update hero settings' },
      { status: 500 }
    );
  }
}
