import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * GET /api/search/events
 * Search events by title, description, or other fields
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        events: [],
        message: 'Query must be at least 2 characters'
      });
    }

    const searchTerm = query.trim();

    // Search events by title, description, venue, or city
    // Using ilike for case-insensitive search
    const { data: events, error } = await supabase
      .from('events')
      .select('id, title, description, slug, banner_url, start_datetime, end_datetime, venue_name, city, status')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,venue_name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
      .neq('status', 'cancelled')
      .order('start_datetime', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching events:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to search events',
          error: error.message 
        },
        { status: 500 }
      );
    }

    // Format events for display
    const formattedEvents = (events || []).map(event => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      banner_url: event.banner_url,
      description: event.description ? event.description.substring(0, 150) + '...' : '',
      venue: event.venue_name || event.city || 'Location TBD',
      date: event.start_datetime ? new Date(event.start_datetime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'Date TBD',
      status: event.status
    }));

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      count: formattedEvents.length
    });

  } catch (error) {
    console.error('Search events error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while searching',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

