import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { sendResearchApprovalEmail } from '@/lib/email';

/**
 * POST /api/admin/research-submissions/approve
 * Approve research submissions
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

    // Fetch submission details before updating (for email)
    const { data: submissions } = await supabase
      .from('research_submissions')
      .select('id, email, full_name, phone, country_code, affiliation_institution, country_of_practice, professional_title, research_title, research_category, description, presentation_topics, presentation_topic_other, external_link, featured_image_url, research_document_url, bio, consent_for_publication')
      .in('id', ids);

    if (!submissions || submissions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No submissions found for approval' },
        { status: 404 }
      );
    }

    // Insert approved submissions into public research table (if not already present)
    for (const sub of submissions) {
      const { data: existing } = await supabase
        .from('research')
        .select('id')
        .eq('title', sub.research_title)
        .eq('researcher_name', sub.full_name)
        .maybeSingle();

      if (existing) continue;

      const { error: insertError } = await supabase
        .from('research')
        .insert({
          title: sub.research_title,
          description: sub.description || null,
          category: sub.research_category || null,
          featured_image_url: sub.featured_image_url || null,
          researcher_name: sub.full_name,
          research_content_url: sub.research_document_url || null,
          external_link: sub.external_link || null,
          more_information: {
            submission_id: sub.id,
            bio: sub.bio || null,
            affiliation_institution: sub.affiliation_institution || null,
            country_of_practice: sub.country_of_practice || null,
            professional_title: sub.professional_title || null,
            presentation_topics: sub.presentation_topics || [],
            presentation_topic_other: sub.presentation_topic_other || null,
            consent_for_publication: sub.consent_for_publication || null,
            contact: {
              email: sub.email || null,
              phone: sub.phone || null,
              country_code: sub.country_code || null,
            }
          },
          is_active: true,
        });

      if (insertError) throw insertError;
    }

    // Update status to approved
    const { error: updateError } = await supabase
      .from('research_submissions')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', ids);

    if (updateError) throw updateError;

    // Send approval emails
    if (submissions && submissions.length > 0) {
      for (const sub of submissions) {
        try {
          await sendResearchApprovalEmail(sub.email, {
            full_name: sub.full_name,
            research_title: sub.research_title,
            research_category: sub.research_category,
          });
        } catch (emailErr) {
          console.error(`Failed to send approval email to ${sub.email}:`, emailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length} submission(s) approved successfully`,
    });
  } catch (error) {
    console.error('Research Submissions Approve Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to approve submissions', error: error.message },
      { status: 500 }
    );
  }
}
