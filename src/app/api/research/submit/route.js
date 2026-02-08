import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sendResearchSubmissionEmail } from '@/lib/email';

/**
 * POST /api/research/submit
 * Public endpoint - anyone can submit research for admin approval
 * Uses research_submissions table (separate from research table)
 */
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, message: 'Content type must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    // Extract form fields
    const full_name = formData.get('full_name')?.trim();
    const email = formData.get('email')?.trim()?.toLowerCase();
    const phone = formData.get('phone')?.trim() || null;
    const country_code = formData.get('country_code')?.trim() || '+973';
    const affiliation_institution = formData.get('affiliation_institution')?.trim() || null;
    const country_of_practice = formData.get('country_of_practice')?.trim() || 'Bahrain';
    const professional_title = formData.get('professional_title')?.trim() || null;
    const research_title = formData.get('research_title')?.trim();
    const research_category = formData.get('research_category')?.trim() || null;
    const description = formData.get('description')?.trim() || null;
    const external_link = formData.get('external_link')?.trim() || null;
    const bio = formData.get('bio')?.trim() || null;
    const consent_for_publication = formData.get('consent_for_publication')?.trim() || null;

    // Declaration data (sent as JSON string)
    let declaration_data = null;
    const declarationStr = formData.get('declaration_data');
    if (declarationStr) {
      try {
        declaration_data = JSON.parse(declarationStr);
      } catch { declaration_data = null; }
    }

    // Presentation topics (sent as JSON array string)
    let presentation_topics = [];
    const topicsStr = formData.get('presentation_topics');
    if (topicsStr) {
      try {
        presentation_topics = JSON.parse(topicsStr);
      } catch { presentation_topics = []; }
    }
    const presentation_topic_other = formData.get('presentation_topic_other')?.trim() || null;

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

    // Get files
    const profileImageFile = formData.get('profile_image');
    const abstractFile = formData.get('abstract');
    const researchDocFile = formData.get('research_document');
    const featuredImageFile = formData.get('featured_image');

    let profile_image_url = null;
    let abstract_url = null;
    let research_document_url = null;
    let featured_image_url = null;
    const uploadedPaths = [];

    try {
      // Upload profile image
      if (profileImageFile && profileImageFile.size > 0) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(profileImageFile.type)) {
          return NextResponse.json({ success: false, message: 'Profile image must be JPEG, PNG, or WebP' }, { status: 400 });
        }
        if (profileImageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json({ success: false, message: 'Profile image must be less than 5MB' }, { status: 400 });
        }
        const ext = profileImageFile.name.split('.').pop();
        const path = `research-submissions/${email}/profile_${uuidv4()}.${ext}`;
        const { error } = await supabase.storage.from('research').upload(path, profileImageFile, { cacheControl: '3600', upsert: false });
        if (error) throw new Error('Failed to upload profile image');
        const { data: urlData } = supabase.storage.from('research').getPublicUrl(path);
        profile_image_url = urlData.publicUrl;
        uploadedPaths.push(path);
      }

      // Upload abstract
      if (abstractFile && abstractFile.size > 0) {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(abstractFile.type)) {
          return NextResponse.json({ success: false, message: 'Abstract must be PDF or DOC/DOCX' }, { status: 400 });
        }
        if (abstractFile.size > 25 * 1024 * 1024) {
          return NextResponse.json({ success: false, message: 'Abstract must be less than 25MB' }, { status: 400 });
        }
        const ext = abstractFile.name.split('.').pop();
        const path = `research-submissions/${email}/abstract_${uuidv4()}.${ext}`;
        const { error } = await supabase.storage.from('research').upload(path, abstractFile, { cacheControl: '3600', upsert: false });
        if (error) throw new Error('Failed to upload abstract');
        const { data: urlData } = supabase.storage.from('research').getPublicUrl(path);
        abstract_url = urlData.publicUrl;
        uploadedPaths.push(path);
      }

      // Upload research document
      if (researchDocFile && researchDocFile.size > 0) {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(researchDocFile.type)) {
          return NextResponse.json({ success: false, message: 'Research document must be PDF or DOC/DOCX' }, { status: 400 });
        }
        if (researchDocFile.size > 50 * 1024 * 1024) {
          return NextResponse.json({ success: false, message: 'Research document must be less than 50MB' }, { status: 400 });
        }
        const ext = researchDocFile.name.split('.').pop();
        const path = `research-submissions/${email}/document_${uuidv4()}.${ext}`;
        const { error } = await supabase.storage.from('research').upload(path, researchDocFile, { cacheControl: '3600', upsert: false });
        if (error) throw new Error('Failed to upload research document');
        const { data: urlData } = supabase.storage.from('research').getPublicUrl(path);
        research_document_url = urlData.publicUrl;
        uploadedPaths.push(path);
      }

      // Upload featured image
      if (featuredImageFile && featuredImageFile.size > 0) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(featuredImageFile.type)) {
          return NextResponse.json({ success: false, message: 'Featured image must be JPEG, PNG, or WebP' }, { status: 400 });
        }
        if (featuredImageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json({ success: false, message: 'Featured image must be less than 5MB' }, { status: 400 });
        }
        const ext = featuredImageFile.name.split('.').pop();
        const path = `research-submissions/${email}/featured_${uuidv4()}.${ext}`;
        const { error } = await supabase.storage.from('research').upload(path, featuredImageFile, { cacheControl: '3600', upsert: false });
        if (error) throw new Error('Failed to upload featured image');
        const { data: urlData } = supabase.storage.from('research').getPublicUrl(path);
        featured_image_url = urlData.publicUrl;
        uploadedPaths.push(path);
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
        // Don't fail the submission if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Research submitted successfully! It will be reviewed by our team before publishing.',
        data: { id: submission.id, status: 'pending' },
      });

    } catch (uploadOrInsertError) {
      // Clean up any uploaded files on error
      if (uploadedPaths.length > 0) {
        await supabase.storage.from('research').remove(uploadedPaths);
      }
      throw uploadOrInsertError;
    }

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
