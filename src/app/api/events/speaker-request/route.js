import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * POST /api/events/speaker-request
 * Submit a speaker application for an event
 */
export async function POST(request) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();

    // Extract form fields
    const event_id = formData.get('event_id');
    const full_name = formData.get('full_name');
    const email = formData.get('email')?.toLowerCase();
    const phone = formData.get('phone');
    const affiliation_institution = formData.get('affiliation_institution');
    const country_of_practice = formData.get('country_of_practice');
    const professional_title = formData.get('professional_title');
    const category = formData.get('category');
    const presentation_topics = formData.get('presentation_topics'); // JSON string
    const presentation_topic_other = formData.get('presentation_topic_other');
    const consent_for_publication = formData.get('consent_for_publication'); // 'agree' or 'disagree'

    // Validate required fields
    if (!event_id || !full_name || !email || !phone || !affiliation_institution || 
        !country_of_practice || !professional_title || !category) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if already applied
    const { data: existingApplication } = await supabase
      .from('speaker_requests')
      .select('id')
      .eq('email', email)
      .eq('event_id', event_id)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: 'You have already applied for this event', alreadyApplied: true },
        { status: 400 }
      );
    }

    // Parse presentation topics
    let parsedTopics = [];
    try {
      parsedTopics = JSON.parse(presentation_topics || '[]');
    } catch (e) {
      parsedTopics = [];
    }

    if (parsedTopics.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please select at least one presentation topic' },
        { status: 400 }
      );
    }

    // Get files
    const abstractFile = formData.get('abstract_file');
    const articleFile = formData.get('article_file');

    if (!abstractFile) {
      return NextResponse.json(
        { success: false, message: 'Abstract submission form is required' },
        { status: 400 }
      );
    }

    console.log('[SPEAKER-REQUEST] Application received:', {
      event_id,
      email,
      full_name,
      professional_title,
      timestamp: new Date().toISOString(),
    });

    // Upload files to Supabase Storage
    let abstractFormUrl = null;
    let articlePresentationUrl = null;

    try {
      // Upload Abstract Form (Required)
      if (abstractFile) {
        const abstractFileName = `${event_id}/${email}/abstract_${Date.now()}_${abstractFile.name}`;
        const { error: abstractError, data: abstractData } = await supabase.storage
          .from('speaker-documents')
          .upload(abstractFileName, abstractFile, { upsert: true });

        if (abstractError) throw new Error(`Abstract upload failed: ${abstractError.message}`);
        abstractFormUrl = abstractData?.path;
      }

      // Upload Article/Presentation (Optional)
      if (articleFile) {
        const articleFileName = `${event_id}/${email}/article_${Date.now()}_${articleFile.name}`;
        const { error: articleError, data: articleData } = await supabase.storage
          .from('speaker-documents')
          .upload(articleFileName, articleFile, { upsert: true });

        if (articleError) throw new Error(`Article upload failed: ${articleError.message}`);
        articlePresentationUrl = articleData?.path;
      }
    } catch (fileError) {
      console.error('[SPEAKER-REQUEST] File upload error:', fileError);
      return NextResponse.json(
        { success: false, message: fileError.message || 'File upload failed' },
        { status: 500 }
      );
    }

    // Save to database
    try {
      const { data, error } = await supabase
        .from('speaker_requests')
        .insert({
          event_id,
          full_name,
          email,
          phone,
          affiliation_institution,
          country_of_practice,
          professional_title,
          category,
          presentation_topics: parsedTopics,
          presentation_topic_other: presentation_topic_other || null,
          abstract_form_url: abstractFormUrl,
          article_presentation_url: articlePresentationUrl,
          consent_for_publication: consent_for_publication || 'agree',
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[SPEAKER-REQUEST] Application saved successfully:', {
        id: data.id,
        event_id,
        email,
        duration: Date.now() - startTime,
      });

      return NextResponse.json({
        success: true,
        message: 'Speaker application submitted successfully',
        data: {
          id: data.id,
          status: data.status,
        },
      });
    } catch (dbError) {
      console.error('[SPEAKER-REQUEST] Database error:', dbError);
      return NextResponse.json(
        { success: false, message: dbError.message || 'Failed to save application. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[SPEAKER-REQUEST] Error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
