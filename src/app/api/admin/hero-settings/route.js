import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/hero-settings
 * Get hero section settings (video, poster)
 */
export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('*')
      .in('setting_key', ['hero_video_url', 'hero_poster_url']);

    if (error) {
      console.error('[HERO-SETTINGS] Error fetching settings:', error);
      throw error;
    }

    // Convert array to object for easier access
    const settingsObj = {};
    settings?.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });

    return NextResponse.json({
      success: true,
      settings: {
        hero_video_url: settingsObj.hero_video_url || '/file.mp4',
        hero_poster_url: settingsObj.hero_poster_url || '/bgn.png',
      },
    });
  } catch (error) {
    console.error('[HERO-SETTINGS] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hero settings' },
      { status: 500 }
    );
  }
}
