import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

// GET - List all active research with pagination and search (public)
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const per_page = parseInt(url.searchParams.get('per_page') || '12', 10);
    const q = (url.searchParams.get('q') || '').trim();
    const category = url.searchParams.get('category') || '';
    const year = url.searchParams.get('year') || '';
    const sort = url.searchParams.get('sort') || 'created_at.desc';

    const from = Math.max(0, (page - 1) * per_page);
    const to = from + per_page - 1;

    let query = supabase
      .from('research')
      .select('id, title, description, category, featured_image_url, researcher_name, external_link, research_content_url, created_at, updated_at', { count: 'exact' })
      .eq('is_active', true);

    // Search filter
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,researcher_name.ilike.%${q}%`);
    }

    // Category filter
    if (category) {
      query = query.eq('category', category);
    }

    if (year) {
      const yearNum = parseInt(year, 10);
      if (!Number.isNaN(yearNum)) {
        const startDate = new Date(Date.UTC(yearNum, 0, 1)).toISOString();
        const endDate = new Date(Date.UTC(yearNum + 1, 0, 1)).toISOString();
        query = query.gte('created_at', startDate).lt('created_at', endDate);
      }
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

    if ((count || 0) === 0) {
      const { count: totalResearchCount } = await supabase
        .from('research')
        .select('id', { count: 'exact', head: true });

      if ((totalResearchCount || 0) === 0) {
        let approvedQuery = supabase
          .from('research_submissions')
          .select('id, research_title, description, research_category, featured_image_url, full_name, external_link, research_document_url, created_at, approved_at', { count: 'exact' })
          .eq('status', 'approved');

        if (q) {
          approvedQuery = approvedQuery.or(`research_title.ilike.%${q}%,description.ilike.%${q}%,full_name.ilike.%${q}%`);
        }

        if (category) {
          approvedQuery = approvedQuery.eq('research_category', category);
        }

        if (year) {
          const yearNum = parseInt(year, 10);
          if (!Number.isNaN(yearNum)) {
            const startDate = new Date(Date.UTC(yearNum, 0, 1)).toISOString();
            const endDate = new Date(Date.UTC(yearNum + 1, 0, 1)).toISOString();
            approvedQuery = approvedQuery.gte('created_at', startDate).lt('created_at', endDate);
          }
        }

        if (sort) {
          const [col, dir] = sort.split('.');
          const sortCol = col === 'title' ? 'research_title' : col === 'created_at' ? 'created_at' : null;
          if (sortCol && dir && ['asc', 'desc'].includes(dir.toLowerCase())) {
            approvedQuery = approvedQuery.order(sortCol, { ascending: dir.toLowerCase() === 'asc' });
          } else {
            approvedQuery = approvedQuery.order('created_at', { ascending: false });
          }
        }

        approvedQuery = approvedQuery.range(from, to);

        const { data: approved, error: approvedError, count: approvedCount } = await approvedQuery;
        if (approvedError) throw approvedError;

        const mapped = (approved || []).map((item) => ({
          id: item.id,
          title: item.research_title,
          description: item.description,
          category: item.research_category,
          featured_image_url: item.featured_image_url,
          researcher_name: item.full_name,
          research_content_url: item.research_document_url,
          external_link: item.external_link,
          created_at: item.approved_at || item.created_at,
          updated_at: item.approved_at || item.created_at,
        }));

        return NextResponse.json({
          success: true,
          research: mapped,
          pagination: {
            page,
            per_page,
            total: approvedCount || 0,
            total_pages: Math.ceil((approvedCount || 0) / per_page)
          }
        });
      }
    }

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


