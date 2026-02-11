import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * POST /api/events/speaker-request
 * Submit a speaker application for an event.
 * Supports both:
 *   1) JSON body with pre-uploaded file paths (new, avoids timeout)
 *   2) multipart/form-data with files (legacy fallback)
 */
export async function POST(request) {
  const startTime = Date.now();

  try {
    const contentType = request.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let event_id, full_name, email, phone, affiliation_institution,
        country_of_practice, professional_title, category,
        presentation_topics, presentation_topic_other,
        consent_for_publication, bio;
    let profileImageUrl = null;
    let abstractFormUrl = null;
    let articlePresentationUrl = null;
    let declaration_cpd_title, declaration_speaker_name, declaration_presentation_title,
        declaration_presentation_date, declaration_contact_number, declaration_email,
        declaration_abstract, declaration_final_speaker_name, declaration_final_date,
        declaration_final_signature;
    let declaration_statements = [];

    if (isJson) {
      // ─── NEW: JSON body with pre-uploaded file paths ───
      const body = await request.json();
      event_id = body.event_id;
      full_name = body.full_name;
      email = body.email?.toLowerCase();
      phone = body.phone;
      affiliation_institution = body.affiliation_institution;
      country_of_practice = body.country_of_practice;
      professional_title = body.professional_title;
      category = body.category;
      presentation_topics = body.presentation_topics; // already an array
      presentation_topic_other = body.presentation_topic_other;
      consent_for_publication = body.consent_for_publication;
      bio = body.bio;

      // Files already uploaded by client
      profileImageUrl = body.profile_image_url || null;
      abstractFormUrl = body.abstract_form_url || null;
      articlePresentationUrl = body.article_presentation_url || null;

      // Declaration data
      const decl = body.declaration || {};
      declaration_cpd_title = decl.declaration_cpd_title;
      declaration_speaker_name = decl.declaration_speaker_name;
      declaration_presentation_title = decl.declaration_presentation_title;
      declaration_presentation_date = decl.declaration_presentation_date;
      declaration_contact_number = decl.declaration_contact_number;
      declaration_email = decl.declaration_email;
      declaration_abstract = decl.declaration_abstract;
      declaration_final_speaker_name = decl.declaration_final_speaker_name;
      declaration_final_date = decl.declaration_final_date;
      declaration_final_signature = decl.declaration_final_signature;
      for (let i = 0; i < 10; i++) {
        declaration_statements.push(decl[`declaration_statement_${i}`] || null);
      }

      // Ensure topics is an array
      if (typeof presentation_topics === 'string') {
        try { presentation_topics = JSON.parse(presentation_topics); } catch { presentation_topics = []; }
      }
    } else {
      // ─── LEGACY: multipart/form-data with file uploads ───
      const formData = await request.formData();

      event_id = formData.get('event_id');
      full_name = formData.get('full_name');
      email = formData.get('email')?.toLowerCase();
      phone = formData.get('phone');
      affiliation_institution = formData.get('affiliation_institution');
      country_of_practice = formData.get('country_of_practice');
      professional_title = formData.get('professional_title');
      category = formData.get('category');
      presentation_topics = formData.get('presentation_topics');
      presentation_topic_other = formData.get('presentation_topic_other');
      consent_for_publication = formData.get('consent_for_publication');
      bio = formData.get('bio');

      declaration_cpd_title = formData.get('declaration_cpd_title');
      declaration_speaker_name = formData.get('declaration_speaker_name');
      declaration_presentation_title = formData.get('declaration_presentation_title');
      declaration_presentation_date = formData.get('declaration_presentation_date');
      declaration_contact_number = formData.get('declaration_contact_number');
      declaration_email = formData.get('declaration_email');
      declaration_abstract = formData.get('declaration_abstract');
      declaration_final_speaker_name = formData.get('declaration_final_speaker_name');
      declaration_final_date = formData.get('declaration_final_date');
      declaration_final_signature = formData.get('declaration_final_signature');
      for (let i = 0; i < 10; i++) {
        declaration_statements.push(formData.get(`declaration_statement_${i}`));
      }

      try { presentation_topics = JSON.parse(presentation_topics || '[]'); } catch { presentation_topics = []; }

      // Upload files from form data (legacy path)
      const profileImage = formData.get('profile_image');
      const abstractFile = formData.get('abstract_file');
      const articleFile = formData.get('article_file');

      try {
        if (profileImage && typeof profileImage.name === 'string') {
          const profileFileName = `${event_id}/${email}/profile_${Date.now()}_${profileImage.name}`;
          const { error: profileError, data: profileData } = await supabase.storage
            .from('speaker-documents')
            .upload(profileFileName, profileImage, { upsert: true });
          if (profileError) throw new Error(`Profile image upload failed: ${profileError.message}`);
          profileImageUrl = profileData?.path;
        }
        if (abstractFile && typeof abstractFile.name === 'string') {
          const abstractFileName = `${event_id}/${email}/abstract_${Date.now()}_${abstractFile.name}`;
          const { error: abstractError, data: abstractData } = await supabase.storage
            .from('speaker-documents')
            .upload(abstractFileName, abstractFile, { upsert: true });
          if (abstractError) throw new Error(`Abstract upload failed: ${abstractError.message}`);
          abstractFormUrl = abstractData?.path;
        }
        if (articleFile && typeof articleFile.name === 'string') {
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
    }

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

    const parsedTopics = Array.isArray(presentation_topics) ? presentation_topics : [];

    if (parsedTopics.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please select at least one presentation topic' },
        { status: 400 }
      );
    }

    if (!bio || !bio.trim()) {
      return NextResponse.json(
        { success: false, message: 'Bio is required' },
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
          // New fields
          profile_image_url: profileImageUrl,
          bio,
          // Declaration fields
          declaration_cpd_title,
          declaration_speaker_name,
          declaration_presentation_title,
          declaration_presentation_date,
          declaration_contact_number,
          declaration_email,
          declaration_abstract,
          declaration_statement_0: declaration_statements[0],
          declaration_statement_1: declaration_statements[1],
          declaration_statement_2: declaration_statements[2],
          declaration_statement_3: declaration_statements[3],
          declaration_statement_4: declaration_statements[4],
          declaration_statement_5: declaration_statements[5],
          declaration_statement_6: declaration_statements[6],
          declaration_statement_7: declaration_statements[7],
          declaration_statement_8: declaration_statements[8],
          declaration_statement_9: declaration_statements[9],
          declaration_final_speaker_name,
          declaration_final_date,
          declaration_final_signature,
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

      // Send confirmation email to applicant (do not await)
      (async () => {
        try {
          const { sendEmail } = await import('@/lib/email');
          const subject = 'Your Speaker Application Submission - Bahrain Dental Society';
          const html = `
            <h2>Thank you for your speaker application!</h2>
            <p>Dear ${full_name},</p>
            <p>Your application for <b>${event_id}</b> has been received. Here are your submitted details:</p>
            <h3>Profile Information</h3>
            <ul>
              <li><b>Name:</b> ${full_name}</li>
              <li><b>Email:</b> ${email}</li>
              <li><b>Phone:</b> ${phone}</li>
              <li><b>Affiliation/Institution:</b> ${affiliation_institution}</li>
              <li><b>Country of Practice:</b> ${country_of_practice}</li>
              <li><b>Professional Title:</b> ${professional_title}</li>
              <li><b>Category:</b> ${category}</li>
              <li><b>Bio:</b> ${bio}</li>
            </ul>
            <h3>Presentation Topics</h3>
            <div>${parsedTopics && parsedTopics.length > 0 ? parsedTopics.join(', ') : 'N/A'}</div>
            ${presentation_topic_other ? `<div><b>Other Topic:</b> ${presentation_topic_other}</div>` : ''}
            <h3>Consent for Publication</h3>
            <div>${consent_for_publication === 'agree' ? 'Agreed' : 'Not Agreed'}</div>
            <h3>NHRA Speaker Declaration</h3>
            <ul>
              <li><b>CPD Activity Title:</b> ${declaration_cpd_title}</li>
              <li><b>Speaker Name:</b> ${declaration_speaker_name}</li>
              <li><b>Presentation Title:</b> ${declaration_presentation_title}</li>
              <li><b>Presentation Date:</b> ${declaration_presentation_date}</li>
              <li><b>Contact Number:</b> ${declaration_contact_number}</li>
              <li><b>Email:</b> ${declaration_email}</li>
              <li><b>Abstract:</b> ${declaration_abstract}</li>
            </ul>
            <div><b>Declaration Statements:</b><ol>
              ${declaration_statements.map((s, i) => `<li>${s ? s : 'Not answered'}</li>`).join('')}
            </ol></div>
            <ul>
              <li><b>Final Speaker Name:</b> ${declaration_final_speaker_name}</li>
              <li><b>Final Date:</b> ${declaration_final_date}</li>
              <li><b>Digital Signature:</b> ${declaration_final_signature}</li>
            </ul>
            <p>Thank you for your submission.<br>Bahrain Dental Society Team</p>
          `;
          await sendEmail(email, subject, '', html);
        } catch (mailErr) {
          console.error('[SPEAKER-REQUEST] Error sending confirmation email:', mailErr);
        }
      })();
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
