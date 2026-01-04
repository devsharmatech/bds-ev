import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// GET - Get single research
export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { data: research, error } = await supabase
      .from('research')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Research not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      research
    });
  } catch (error) {
    console.error('Research GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update research
export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if research exists
    const { data: existingResearch, error: fetchError } = await supabase
      .from('research')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingResearch) {
      return NextResponse.json(
        { success: false, error: 'Research not found' },
        { status: 404 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    let updateData = {};
    let featuredImageFile = null;
    let researchContentFile = null;
    let removeFeaturedImage = false;
    let removeResearchContent = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      if (formData.get('title') !== null) updateData.title = formData.get('title');
      if (formData.get('description') !== null) updateData.description = formData.get('description') || null;
      if (formData.get('researcher_name') !== null) updateData.researcher_name = formData.get('researcher_name');
      if (formData.get('external_link') !== null) updateData.external_link = formData.get('external_link') || null;
      
      // Parse more_information JSON if provided
      const moreInfoStr = formData.get('more_information');
      if (moreInfoStr !== null) {
        try {
          updateData.more_information = moreInfoStr ? JSON.parse(moreInfoStr) : {};
        } catch {
          updateData.more_information = {};
        }
      }

      // Handle featured image
      if (formData.get('remove_featured_image') === 'true') {
        removeFeaturedImage = true;
      }
      featuredImageFile = formData.get('featured_image');

      // Handle research content
      if (formData.get('remove_research_content') === 'true') {
        removeResearchContent = true;
      }
      researchContentFile = formData.get('research_content');
    } else {
      const body = await request.json();
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description || null;
      if (body.researcher_name !== undefined) updateData.researcher_name = body.researcher_name;
      if (body.external_link !== undefined) updateData.external_link = body.external_link || null;
      if (body.more_information !== undefined) updateData.more_information = body.more_information || {};
    }

    // Handle featured image removal
    if (removeFeaturedImage && existingResearch.featured_image_url) {
      const oldPath = existingResearch.featured_image_url.split('/').slice(-2).join('/');
      await supabase.storage.from('research').remove([oldPath]);
      updateData.featured_image_url = null;
    }

    // Handle featured image upload
    if (featuredImageFile && featuredImageFile.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(featuredImageFile.type)) {
        return NextResponse.json(
          { success: false, message: 'Featured image must be JPEG/PNG/WebP' },
          { status: 400 }
        );
      }

      // Delete old image if exists
      if (existingResearch.featured_image_url) {
        const oldPath = existingResearch.featured_image_url.split('/').slice(-2).join('/');
        await supabase.storage.from('research').remove([oldPath]);
      }

      const ext = featuredImageFile.name.split('.').pop();
      const filename = `${uuidv4()}.${ext}`;
      const path = `featured/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('research')
        .upload(path, featuredImageFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Featured image upload error:', uploadError);
        return NextResponse.json(
          { success: false, message: 'Failed to upload featured image', error: uploadError.message },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage.from('research').getPublicUrl(path);
      updateData.featured_image_url = urlData.publicUrl || null;
    }

    // Handle research content removal
    if (removeResearchContent && existingResearch.research_content_url) {
      const oldPath = existingResearch.research_content_url.split('/').slice(-2).join('/');
      await supabase.storage.from('research').remove([oldPath]);
      updateData.research_content_url = null;
    }

    // Handle research content upload
    if (researchContentFile && researchContentFile.size > 0) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 50 * 1024 * 1024; // 50MB

      if (!allowedTypes.includes(researchContentFile.type)) {
        return NextResponse.json(
          { success: false, message: 'Research content must be PDF or DOC/DOCX' },
          { status: 400 }
        );
      }

      if (researchContentFile.size > maxSize) {
        return NextResponse.json(
          { success: false, message: 'Research content file too large (max 50MB)' },
          { status: 400 }
        );
      }

      // Delete old content if exists
      if (existingResearch.research_content_url) {
        const oldPath = existingResearch.research_content_url.split('/').slice(-2).join('/');
        await supabase.storage.from('research').remove([oldPath]);
      }

      const ext = researchContentFile.name.split('.').pop();
      const filename = `${uuidv4()}.${ext}`;
      const path = `content/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('research')
        .upload(path, researchContentFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Research content upload error:', uploadError);
        return NextResponse.json(
          { success: false, message: 'Failed to upload research content', error: uploadError.message },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage.from('research').getPublicUrl(path);
      updateData.research_content_url = urlData.publicUrl || null;
    }

    updateData.updated_at = new Date().toISOString();

    // Update research
    const { data: research, error: updateError } = await supabase
      .from('research')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Research updated successfully',
      research
    });
  } catch (error) {
    console.error('Research PUT Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update research', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete research
export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get research to delete files
    const { data: research, error: fetchError } = await supabase
      .from('research')
      .select('featured_image_url, research_content_url')
      .eq('id', id)
      .single();

    if (fetchError || !research) {
      return NextResponse.json(
        { success: false, error: 'Research not found' },
        { status: 404 }
      );
    }

    // Delete files from storage
    if (research.featured_image_url) {
      const imgPath = research.featured_image_url.split('/').slice(-2).join('/');
      await supabase.storage.from('research').remove([imgPath]);
    }

    if (research.research_content_url) {
      const contentPath = research.research_content_url.split('/').slice(-2).join('/');
      await supabase.storage.from('research').remove([contentPath]);
    }

    // Delete research record
    const { error: deleteError } = await supabase
      .from('research')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Research deleted successfully'
    });
  } catch (error) {
    console.error('Research DELETE Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete research', error: error.message },
      { status: 500 }
    );
  }
}

