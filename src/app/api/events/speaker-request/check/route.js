import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * GET /api/events/speaker-request/check
 * Check if an email has already applied for an event
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const event_id = searchParams.get('event_id');

    if (!email || !event_id) {
      return NextResponse.json(
        { success: false, message: 'Email and event_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('speaker_requests')
      .select('id, status, created_at')
      .eq('email', email.toLowerCase())
      .eq('event_id', event_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected if not applied
      console.error('[SPEAKER-CHECK] Error:', error);
      return NextResponse.json(
        { success: false, message: 'Error checking application' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      exists: !!data,
      status: data?.status || null,
    });
  } catch (error) {
    console.error('[SPEAKER-CHECK] Error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
