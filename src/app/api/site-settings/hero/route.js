import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * GET /api/site-settings/hero
 * Public endpoint to get hero section settings
 */
export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['hero_video_url', 'hero_poster_url']);

    if (error) {
      console.error('[SITE-SETTINGS-HERO] Error:', error);
      // Return defaults if table doesn't exist or error
      return NextResponse.json({
        success: true,
        video_url: '/file.mp4',
        poster_url: '/bgn.png',
      });
    }

    // Convert to object
    const settingsObj = {};
    settings?.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });

    // Fetch active hero slides from dedicated table
    let slides = [];
    try {
      const { data: slideRows, error: slidesError } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (slidesError) {
        console.error('[SITE-SETTINGS-HERO] hero_slides fetch error:', slidesError);
      } else if (Array.isArray(slideRows)) {
        slides = slideRows;
      }
    } catch (e) {
      console.error('[SITE-SETTINGS-HERO] hero_slides unexpected error:', e);
    }

    return NextResponse.json({
      success: true,
      video_url: settingsObj.hero_video_url || '/file.mp4',
      poster_url: settingsObj.hero_poster_url || '/bgn.png',
      slides,
    });
  } catch (error) {
    console.error('[SITE-SETTINGS-HERO] Error:', error);
    // Return defaults on error
    return NextResponse.json({
      success: true,
      video_url: '/file.mp4',
      poster_url: '/bgn.png',
    });
  }
}
