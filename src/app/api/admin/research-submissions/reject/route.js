import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { sendResearchRejectionEmail } from '@/lib/email';

/**
 * POST /api/admin/research-submissions/reject
 * Reject research submissions
 */
export async function POST(request) {
  try {
    const { ids, reason } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No submissions specified' },
        { status: 400 }
      );
    }

    // Fetch submission details before updating (for email)
    const { data: submissions } = await supabase
      .from('research_submissions')
      .select('id, email, full_name, research_title, research_category')
      .in('id', ids);

    // Update status to rejected
    const { error: updateError } = await supabase
      .from('research_submissions')
      .update({
        status: 'rejected',
        rejection_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids);

    if (updateError) throw updateError;

    // Send rejection emails
    if (submissions && submissions.length > 0) {
      for (const sub of submissions) {
        try {
          await sendResearchRejectionEmail(sub.email, {
            full_name: sub.full_name,
            research_title: sub.research_title,
            research_category: sub.research_category,
            rejection_reason: reason || null,
          });
        } catch (emailErr) {
          console.error(`Failed to send rejection email to ${sub.email}:`, emailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length} submission(s) rejected`,
    });
  } catch (error) {
    console.error('Research Submissions Reject Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reject submissions', error: error.message },
      { status: 500 }
    );
  }
}
