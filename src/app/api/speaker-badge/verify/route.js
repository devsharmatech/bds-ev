import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * GET /api/speaker-badge/verify
 * Verify if speaker is approved and return badge data
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const event_id = searchParams.get('event_id');
    const email = searchParams.get('email')?.toLowerCase();

    console.log('[SPEAKER-BADGE-VERIFY] Request:', { event_id, email });

    if (!event_id || !email) {
      return NextResponse.json(
        { success: false, message: 'Event ID and email are required' },
        { status: 400 }
      );
    }

    // Find approved speaker request
    const { data: speaker, error } = await supabase
      .from('speaker_requests')
      .select(`
        id,
        full_name,
        email,
        phone,
        professional_title,
        category,
        affiliation_institution,
        country_of_practice,
        presentation_topics,
        status,
        events (
          id,
          title,
          start_datetime,
          end_datetime,
          venue_name
        )
      `)
      .eq('event_id', event_id)
      .eq('email', email)
      .eq('status', 'approved')
      .single();

    console.log('[SPEAKER-BADGE-VERIFY] Query result:', { speaker, error });

    if (error && error.code !== 'PGRST116') {
      console.error('[SPEAKER-BADGE-VERIFY] Database error:', error);
      throw error;
    }

    if (!speaker) {
      console.log('[SPEAKER-BADGE-VERIFY] No approved speaker found');
      return NextResponse.json({
        success: false,
        message: 'No approved speaker found with this email for the selected event',
      });
    }

    // Format response for frontend
    const response = {
      success: true,
      speaker: {
        id: speaker.id,
        full_name: speaker.full_name,
        email: speaker.email,
        designation: speaker.professional_title || speaker.category,
        affiliation: speaker.affiliation_institution,
        country: speaker.country_of_practice,
        topics: speaker.presentation_topics,
      },
      event: speaker.events ? {
        id: speaker.events.id,
        title: speaker.events.title,
        start_datetime: speaker.events.start_datetime,
        end_datetime: speaker.events.end_datetime,
        venue_name: speaker.events.venue_name,
      } : null,
    };

    console.log('[SPEAKER-BADGE-VERIFY] Success response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('[SPEAKER-BADGE-VERIFY] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Verification failed', error: error.message },
      { status: 500 }
    );
  }
}
