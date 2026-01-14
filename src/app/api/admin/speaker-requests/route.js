import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/speaker-requests
 * List all speaker requests with filters and pagination
 */
export async function GET(request) {
  try {
    console.log('[ADMIN-SPEAKER-REQUESTS] Starting request...');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const event_id = searchParams.get('event_id');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    console.log('[ADMIN-SPEAKER-REQUESTS] Params:', { page, limit, event_id, status, category, search });

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('speaker_requests')
      .select(`
        *,
        events (id, title, start_datetime)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (event_id) {
      query = query.eq('event_id', event_id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    console.log('[ADMIN-SPEAKER-REQUESTS] Query result:', { dataLength: data?.length, count, error });

    if (error) {
      console.error('[ADMIN-SPEAKER-REQUESTS] Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      requests: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('[ADMIN-SPEAKER-REQUESTS] Error:', error.message, error.code, error.details);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch speaker requests', error: error.message },
      { status: 500 }
    );
  }
}
