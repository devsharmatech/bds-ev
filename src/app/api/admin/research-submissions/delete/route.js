import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/research-submissions/delete
 * Delete research submissions and their uploaded files
 */
export async function POST(request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No submissions specified' },
        { status: 400 }
      );
    }

    // Get submissions to find file paths
    const { data: submissions, error: fetchError } = await supabase
      .from('research_submissions')
      .select('id, profile_image_url, abstract_url, research_document_url, featured_image_url')
      .in('id', ids);

    if (fetchError) throw fetchError;

    // Collect all file paths to delete
    const filePaths = [];
    for (const sub of (submissions || [])) {
      const urls = [sub.profile_image_url, sub.abstract_url, sub.research_document_url, sub.featured_image_url];
      for (const url of urls) {
        if (url) {
          // Extract path from URL: research-submissions/email/filename
          const parts = url.split('/');
          const idx = parts.indexOf('research-submissions');
          if (idx !== -1) {
            filePaths.push(parts.slice(idx).join('/'));
          }
        }
      }
    }

    // Delete files from storage
    if (filePaths.length > 0) {
      await supabase.storage.from('research').remove(filePaths);
    }

    // Delete records
    const { error: deleteError } = await supabase
      .from('research_submissions')
      .delete()
      .in('id', ids);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: `${ids.length} submission(s) deleted successfully`,
    });
  } catch (error) {
    console.error('Research Submissions Delete Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete submissions', error: error.message },
      { status: 500 }
    );
  }
}
