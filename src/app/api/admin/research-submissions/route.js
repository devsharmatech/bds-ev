import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/research-submissions
 * List all research submissions with filters and pagination
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('research_submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,research_title.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Get status counts
    const { count: pendingCount } = await supabase
      .from('research_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: approvedCount } = await supabase
      .from('research_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    const { count: rejectedCount } = await supabase
      .from('research_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected');

    return NextResponse.json({
      success: true,
      submissions: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      stats: {
        pending: pendingCount || 0,
        approved: approvedCount || 0,
        rejected: rejectedCount || 0,
        total: (pendingCount || 0) + (approvedCount || 0) + (rejectedCount || 0),
      },
    });
  } catch (error) {
    console.error('Research Submissions GET Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch submissions', error: error.message },
      { status: 500 }
    );
  }
}
