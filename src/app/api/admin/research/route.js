import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// GET - List all research with pagination and search
export async function GET(request) {
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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const per_page = parseInt(url.searchParams.get('per_page') || '20', 10);
    const q = (url.searchParams.get('q') || '').trim();
    const category = url.searchParams.get('category') || '';
    const sort = url.searchParams.get('sort') || 'created_at.desc';

    const from = Math.max(0, (page - 1) * per_page);
    const to = from + per_page - 1;

    let query = supabase
      .from('research')
      .select('*', { count: 'exact' });

    // Search filter
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,researcher_name.ilike.%${q}%`);
    }

    // Category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Sort
    if (sort) {
      const [col, dir] = sort.split('.');
      if (col && dir && ['asc', 'desc'].includes(dir.toLowerCase())) {
        query = query.order(col, { ascending: dir.toLowerCase() === 'asc' });
      }
    }

    query = query.range(from, to);

    const { data: research, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      research: research || [],
      pagination: {
        page,
        per_page,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / per_page)
      }
    });
  } catch (error) {
    console.error('Research GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new research
export async function POST(request) {
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

    const contentType = request.headers.get('content-type') || '';
    let researchData = {};
    let featuredImageFile = null;
    let researchContentFile = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      researchData.title = formData.get('title');
      researchData.description = formData.get('description') || null;
      researchData.category = formData.get('category') || null;
      researchData.researcher_name = formData.get('researcher_name');
      researchData.external_link = formData.get('external_link') || null;
      
      // Parse more_information JSON if provided
      const moreInfoStr = formData.get('more_information');
      if (moreInfoStr) {
        try {
          researchData.more_information = JSON.parse(moreInfoStr);
        } catch {
          researchData.more_information = {};
        }
      } else {
        researchData.more_information = {};
      }

      featuredImageFile = formData.get('featured_image');
      researchContentFile = formData.get('research_content');
    } else {
      const body = await request.json();
      researchData = {
        title: body.title,
        description: body.description || null,
        category: body.category || null,
        researcher_name: body.researcher_name,
        external_link: body.external_link || null,
        more_information: body.more_information || {}
      };
    }

    // Validation
    if (!researchData.title || !researchData.researcher_name) {
      return NextResponse.json(
        { success: false, message: 'Title and researcher name are required' },
        { status: 400 }
      );
    }

    // Upload featured image if provided
    if (featuredImageFile && featuredImageFile.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(featuredImageFile.type)) {
        return NextResponse.json(
          { success: false, message: 'Featured image must be JPEG/PNG/WebP' },
          { status: 400 }
        );
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
      researchData.featured_image_url = urlData.publicUrl || null;
    }

    // Upload research content if provided
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

      const ext = researchContentFile.name.split('.').pop();
      const filename = `${uuidv4()}.${ext}`;
      const path = `content/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('research')
        .upload(path, researchContentFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Research content upload error:', uploadError);
        // Clean up featured image if it was uploaded
        if (researchData.featured_image_url) {
          const imgPath = researchData.featured_image_url.split('/').slice(-2).join('/');
          await supabase.storage.from('research').remove([imgPath]);
        }
        return NextResponse.json(
          { success: false, message: 'Failed to upload research content', error: uploadError.message },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage.from('research').getPublicUrl(path);
      researchData.research_content_url = urlData.publicUrl || null;
    }

    // Insert research
    const { data: research, error: insertError } = await supabase
      .from('research')
      .insert(researchData)
      .select()
      .single();

    if (insertError) {
      // Clean up uploaded files
      if (researchData.featured_image_url) {
        const imgPath = researchData.featured_image_url.split('/').slice(-2).join('/');
        await supabase.storage.from('research').remove([imgPath]);
      }
      if (researchData.research_content_url) {
        const contentPath = researchData.research_content_url.split('/').slice(-2).join('/');
        await supabase.storage.from('research').remove([contentPath]);
      }
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: 'Research created successfully',
      research
    });
  } catch (error) {
    console.error('Research POST Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create research', error: error.message },
      { status: 500 }
    );
  }
}


