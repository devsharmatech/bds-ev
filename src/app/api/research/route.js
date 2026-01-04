import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

// GET - List all active research with pagination and search (public)
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const per_page = parseInt(url.searchParams.get('per_page') || '12', 10);
    const q = (url.searchParams.get('q') || '').trim();
    const sort = url.searchParams.get('sort') || 'created_at.desc';

    const from = Math.max(0, (page - 1) * per_page);
    const to = from + per_page - 1;

    let query = supabase
      .from('research')
      .select('id, title, description, featured_image_url, researcher_name, external_link, research_content_url, created_at, updated_at', { count: 'exact' })
      .eq('is_active', true);

    // Search filter
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,researcher_name.ilike.%${q}%`);
    }

    // Sort
    if (sort) {
      const [col, dir] = sort.split('.');
      if (col && dir && ['asc', 'desc'].includes(dir.toLowerCase())) {
        query = query.order(col, { ascending: dir.toLowerCase() === 'asc' });
      }
    }

    query = query.range(from, to);

    const { data: research, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      research: research || [],
      pagination: {
        page,
        per_page,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / per_page)
      }
    });
  } catch (error) {
    console.error('Research GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

