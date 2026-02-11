import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sendResearchSubmissionEmail } from '@/lib/email';

/**
 * POST /api/research/submit
 * Public endpoint - anyone can submit research for admin approval
 * Supports both:
 *   1) JSON body with pre-uploaded file URLs (new, avoids timeout)
 *   2) multipart/form-data with files (legacy fallback)
 */
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let full_name, email, phone, country_code, affiliation_institution,
        country_of_practice, professional_title, research_title,
        research_category, description, external_link, bio,
        consent_for_publication, declaration_data, presentation_topics,
        presentation_topic_other;
    let profile_image_url = null;
    let abstract_url = null;
    let research_document_url = null;
    let featured_image_url = null;

    if (isJson) {
      // ─── NEW: JSON body with pre-uploaded file URLs ───
      const body = await request.json();
      full_name = body.full_name?.trim();
      email = body.email?.trim()?.toLowerCase();
      phone = body.phone?.trim() || null;
      country_code = body.country_code?.trim() || '+973';
      affiliation_institution = body.affiliation_institution?.trim() || null;
      country_of_practice = body.country_of_practice?.trim() || 'Bahrain';
      professional_title = body.professional_title?.trim() || null;
      research_title = body.research_title?.trim();
      research_category = body.research_category?.trim() || null;
      description = body.description?.trim() || null;
      external_link = body.external_link?.trim() || null;
      bio = body.bio?.trim() || null;
      consent_for_publication = body.consent_for_publication?.trim() || null;
      declaration_data = body.declaration_data || null;
      presentation_topics = Array.isArray(body.presentation_topics) ? body.presentation_topics : [];
      presentation_topic_other = body.presentation_topic_other?.trim() || null;

      // Pre-uploaded file URLs
      profile_image_url = body.profile_image_url || null;
      abstract_url = body.abstract_url || null;
      research_document_url = body.research_document_url || null;
      featured_image_url = body.featured_image_url || null;
    } else {
      // ─── LEGACY: multipart/form-data with file uploads ───
      if (!contentType.includes('multipart/form-data')) {
        return NextResponse.json(
          { success: false, message: 'Content type must be multipart/form-data or application/json' },
          { status: 400 }
        );
      }

      const formData = await request.formData();
      full_name = formData.get('full_name')?.trim();
      email = formData.get('email')?.trim()?.toLowerCase();
      phone = formData.get('phone')?.trim() || null;
      country_code = formData.get('country_code')?.trim() || '+973';
      affiliation_institution = formData.get('affiliation_institution')?.trim() || null;
      country_of_practice = formData.get('country_of_practice')?.trim() || 'Bahrain';
      professional_title = formData.get('professional_title')?.trim() || null;
      research_title = formData.get('research_title')?.trim();
      research_category = formData.get('research_category')?.trim() || null;
      description = formData.get('description')?.trim() || null;
      external_link = formData.get('external_link')?.trim() || null;
      bio = formData.get('bio')?.trim() || null;
      consent_for_publication = formData.get('consent_for_publication')?.trim() || null;
      presentation_topic_other = formData.get('presentation_topic_other')?.trim() || null;

      const declarationStr = formData.get('declaration_data');
      if (declarationStr) {
        try { declaration_data = JSON.parse(declarationStr); } catch { declaration_data = null; }
      }

      const topicsStr = formData.get('presentation_topics');
      if (topicsStr) {
        try { presentation_topics = JSON.parse(topicsStr); } catch { presentation_topics = []; }
      } else {
        presentation_topics = [];
      }

      // Upload files from form data (legacy)
      const profileImageFile = formData.get('profile_image');
      const abstractFile = formData.get('abstract');
      const researchDocFile = formData.get('research_document');
      const featuredImageFile = formData.get('featured_image');
      const uploadedPaths = [];

      try {
        if (profileImageFile && profileImageFile.size > 0) {
          const ext = profileImageFile.name.split('.').pop();
          const path = `research-submissions/${email}/profile_${uuidv4()}.${ext}`;
          const { error } = await supabase.storage.from('research').upload(path, profileImageFile, { cacheControl: '3600', upsert: false });
          if (error) throw new Error('Failed to upload profile image');
          const { data: urlData } = supabase.storage.from('research').getPublicUrl(path);
          profile_image_url = urlData.publicUrl;
          uploadedPaths.push(path);
        }
        if (abstractFile && abstractFile.size > 0) {
          const ext = abstractFile.name.split('.').pop();
          const path = `research-submissions/${email}/abstract_${uuidv4()}.${ext}`;
          const { error } = await supabase.storage.from('research').upload(path, abstractFile, { cacheControl: '3600', upsert: false });
          if (error) throw new Error('Failed to upload abstract');
          const { data: urlData } = supabase.storage.from('research').getPublicUrl(path);
          abstract_url = urlData.publicUrl;
          uploadedPaths.push(path);
        }
        if (researchDocFile && researchDocFile.size > 0) {
          const ext = researchDocFile.name.split('.').pop();
          const path = `research-submissions/${email}/document_${uuidv4()}.${ext}`;
          const { error } = await supabase.storage.from('research').upload(path, researchDocFile, { cacheControl: '3600', upsert: false });
          if (error) throw new Error('Failed to upload research document');
          const { data: urlData } = supabase.storage.from('research').getPublicUrl(path);
          research_document_url = urlData.publicUrl;
          uploadedPaths.push(path);
        }
        if (featuredImageFile && featuredImageFile.size > 0) {
          const ext = featuredImageFile.name.split('.').pop();
          const path = `research-submissions/${email}/featured_${uuidv4()}.${ext}`;
          const { error } = await supabase.storage.from('research').upload(path, featuredImageFile, { cacheControl: '3600', upsert: false });
          if (error) throw new Error('Failed to upload featured image');
          const { data: urlData } = supabase.storage.from('research').getPublicUrl(path);
          featured_image_url = urlData.publicUrl;
          uploadedPaths.push(path);
        }
      } catch (uploadErr) {
        if (uploadedPaths.length > 0) {
          await supabase.storage.from('research').remove(uploadedPaths);
        }
        throw uploadErr;
      }
    }

    // Validate required fields
    if (!full_name) {
      return NextResponse.json({ success: false, message: 'Full name is required' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid email address' }, { status: 400 });
    }
    if (!research_title) {
      return NextResponse.json({ success: false, message: 'Research title is required' }, { status: 400 });
    }

    // Check for duplicate submission (same email + same title)
    const { data: existing } = await supabase
      .from('research_submissions')
      .select('id')
      .eq('email', email)
      .ilike('research_title', research_title)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'You have already submitted research with this title' },
        { status: 400 }
      );
    }

    // Insert submission
    const { data: submission, error: insertError } = await supabase
      .from('research_submissions')
      .insert({
        full_name,
        email,
        phone,
        country_code,
        affiliation_institution,
        country_of_practice,
        professional_title,
        research_title,
        research_category,
        description,
        presentation_topics,
        presentation_topic_other,
        external_link,
        profile_image_url,
        abstract_url,
        research_document_url,
        featured_image_url,
        bio,
        consent_for_publication,
        declaration_data,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Send confirmation email to researcher
    try {
      await sendResearchSubmissionEmail(email, {
        full_name,
        research_title,
        research_category: research_category || 'General',
      });
    } catch (emailErr) {
      console.error('Failed to send research submission email:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Research submitted successfully! It will be reviewed by our team before publishing.',
      data: { id: submission.id, status: 'pending' },
    });

  } catch (error) {
    console.error('Research Submit Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to submit research' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/research/submit/check
 * Check if email has already submitted with same title
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const title = searchParams.get('title');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 });
    }

    let query = supabase
      .from('research_submissions')
      .select('id, status')
      .eq('email', email.toLowerCase());

    if (title) {
      query = query.ilike('research_title', title);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      exists: data && data.length > 0,
      submissions: data || [],
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
