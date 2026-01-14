import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/speaker-requests/delete
 * Delete speaker requests
 */
export async function POST(request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No requests specified' },
        { status: 400 }
      );
    }

    // Delete requests
    const { error } = await supabase
      .from('speaker_requests')
      .delete()
      .in('id', ids);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `${ids.length} request(s) deleted successfully`,
    });
  } catch (error) {
    console.error('[ADMIN-SPEAKER-DELETE] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete requests' },
      { status: 500 }
    );
  }
}
