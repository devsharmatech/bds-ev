import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Helper function to create slug
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
    .substring(0, 100);
}

// Helper function to upload image
async function uploadImage(file, folder, maxSize = 5 * 1024 * 1024) {
  if (!file || file.size === 0) return null;

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPEG, JPG, PNG, and WebP images are allowed');
  }

  if (file.size > maxSize) {
    throw new Error(`Image size should be less than ${maxSize / (1024 * 1024)}MB`);
  }

  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const filePath = `${folder}/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('events')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Image upload error:', uploadError);
    throw new Error('Failed to upload image');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('events')
    .getPublicUrl(filePath);

  return publicUrl;
}

// GET all events with pagination and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    let query = supabase
      .from('events')
      .select(`
        *,
        created_by_user:users!events_created_by_fkey(
          id,
          full_name,
          email
        ),
        event_agendas(*),
        event_hosts(*)
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,venue_name.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(startIndex, endIndex);

    const { data: events, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      events: events || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasNextPage: endIndex < (count || 0),
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error('Events GET Error:', err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}

// POST create new event with hosts and agendas
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let title, description, start_datetime, end_datetime, timezone, venue_name, address, city,
        created_by, province, pin_code, google_map_url, capacity, is_paid,
        regular_price, member_price, student_price, hygienist_price,
        regular_standard_price, member_standard_price, student_standard_price, hygienist_standard_price,
        regular_onsite_price, member_onsite_price, student_onsite_price, hygienist_onsite_price,
        early_bird_deadline, status, nera_cme_hours, nera_code;
    let agendas = [];
    let hosts = [];
    let banner_url = null;
    let bannerImage = null;
    let hostImageFiles = {};

    if (isJson) {
      // ─── NEW: JSON body with pre-uploaded file URLs ───
      const body = await request.json();
      title = body.title;
      description = body.description || null;
      start_datetime = body.start_datetime;
      end_datetime = body.end_datetime || null;
      timezone = body.timezone || 'Asia/Bahrain';
      venue_name = body.venue_name || null;
      address = body.address || null;
      city = body.city || null;
      created_by = body.created_by || null;
      province = body.province || null;
      pin_code = body.pin_code || null;
      google_map_url = body.google_map_url || null;
      capacity = body.capacity ? parseInt(body.capacity) : null;
      is_paid = body.is_paid === true || body.is_paid === 'true';
      regular_price = body.regular_price ? parseFloat(body.regular_price) : null;
      member_price = body.member_price ? parseFloat(body.member_price) : null;
      student_price = body.student_price ? parseFloat(body.student_price) : null;
      hygienist_price = body.hygienist_price ? parseFloat(body.hygienist_price) : null;
      regular_standard_price = body.regular_standard_price ? parseFloat(body.regular_standard_price) : null;
      member_standard_price = body.member_standard_price ? parseFloat(body.member_standard_price) : null;
      student_standard_price = body.student_standard_price ? parseFloat(body.student_standard_price) : null;
      hygienist_standard_price = body.hygienist_standard_price ? parseFloat(body.hygienist_standard_price) : null;
      regular_onsite_price = body.regular_onsite_price ? parseFloat(body.regular_onsite_price) : null;
      member_onsite_price = body.member_onsite_price ? parseFloat(body.member_onsite_price) : null;
      student_onsite_price = body.student_onsite_price ? parseFloat(body.student_onsite_price) : null;
      hygienist_onsite_price = body.hygienist_onsite_price ? parseFloat(body.hygienist_onsite_price) : null;
      early_bird_deadline = body.early_bird_deadline || null;
      status = body.status || 'upcoming';
      nera_cme_hours = body.nera_cme_hours ? parseFloat(body.nera_cme_hours) : null;
      nera_code = body.nera_code || null;
      agendas = body.agendas || [];
      hosts = body.hosts || [];
      // Pre-uploaded banner URL
      banner_url = body.banner_image_url || null;
      if (body.remove_banner) banner_url = null;
    } else {
      // ─── LEGACY: multipart/form-data ───
      const formData = await request.formData();
      title = formData.get('title');
      description = formData.get('description');
      start_datetime = formData.get('start_datetime');
      end_datetime = formData.get('end_datetime');
      timezone = formData.get('timezone');
      venue_name = formData.get('venue_name');
      address = formData.get('address');
      city = formData.get('city');
      created_by = formData.get('created_by');
      province = formData.get('province');
      pin_code = formData.get('pin_code');
      google_map_url = formData.get('google_map_url');
      capacity = formData.get('capacity') ? parseInt(formData.get('capacity')) : null;
      is_paid = formData.get('is_paid') === 'true';
      regular_price = formData.get('regular_price') ? parseFloat(formData.get('regular_price')) : null;
      member_price = formData.get('member_price') ? parseFloat(formData.get('member_price')) : null;
      student_price = formData.get('student_price') ? parseFloat(formData.get('student_price')) : null;
      hygienist_price = formData.get('hygienist_price') ? parseFloat(formData.get('hygienist_price')) : null;
      regular_standard_price = formData.get('regular_standard_price') ? parseFloat(formData.get('regular_standard_price')) : null;
      member_standard_price = formData.get('member_standard_price') ? parseFloat(formData.get('member_standard_price')) : null;
      student_standard_price = formData.get('student_standard_price') ? parseFloat(formData.get('student_standard_price')) : null;
      hygienist_standard_price = formData.get('hygienist_standard_price') ? parseFloat(formData.get('hygienist_standard_price')) : null;
      regular_onsite_price = formData.get('regular_onsite_price') ? parseFloat(formData.get('regular_onsite_price')) : null;
      member_onsite_price = formData.get('member_onsite_price') ? parseFloat(formData.get('member_onsite_price')) : null;
      student_onsite_price = formData.get('student_onsite_price') ? parseFloat(formData.get('student_onsite_price')) : null;
      hygienist_onsite_price = formData.get('hygienist_onsite_price') ? parseFloat(formData.get('hygienist_onsite_price')) : null;
      early_bird_deadline = formData.get('early_bird_deadline');
      status = formData.get('status') || 'upcoming';
      nera_cme_hours = formData.get('nera_cme_hours') ? parseFloat(formData.get('nera_cme_hours')) : null;
      nera_code = formData.get('nera_code') || null;
      bannerImage = formData.get('banner_image');
      const agendasJson = formData.get('agendas');
      agendas = agendasJson ? JSON.parse(agendasJson) : [];
      const hostsJson = formData.get('hosts');
      hosts = hostsJson ? JSON.parse(hostsJson) : [];
      // Collect host image files
      for (const [index] of hosts.entries()) {
        const hostImage = formData.get(`host_profile_image_${index}`);
        if (hostImage && hostImage.size > 0) hostImageFiles[index] = hostImage;
      }
    }

    // Validation
    if (!title || !start_datetime) {
      return NextResponse.json({
        success: false,
        error: 'Title and start date are required'
      }, { status: 400 });
    }

    // Validate agendas if provided
    if (agendas && agendas.length > 0) {
      for (const agenda of agendas) {
        if (!agenda.agenda_date || !agenda.title) {
          return NextResponse.json({
            success: false,
            error: 'Agenda date and title are required for each agenda item'
          }, { status: 400 });
        }
      }
    }

    // Validate hosts if provided
    if (hosts && hosts.length > 0) {
      for (const host of hosts) {
        if (!host.name) {
          return NextResponse.json({
            success: false,
            error: 'Host name is required for each host'
          }, { status: 400 });
        }
      }
    }

    // Create slug from title
    const slug = createSlug(title);

    // Upload event banner image if provided (legacy FormData path only)
    if (!isJson && bannerImage && bannerImage.size > 0) {
      try {
        banner_url = await uploadImage(bannerImage, 'events');
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 400 });
      }
    }

    // Process host profile images
    const processedHosts = [];
    for (const [index, host] of hosts.entries()) {
      let profile_image = null;

      if (isJson) {
        // JSON path: host already has profile_image_url from client
        profile_image = host.profile_image_url || host.profile_image || null;
      } else {
        // Legacy FormData path: upload from form
        const hostImage = hostImageFiles[index];
        if (hostImage) {
          try {
            profile_image = await uploadImage(hostImage, 'hosts');
          } catch (error) {
            return NextResponse.json({
              success: false,
              error: `Host ${index + 1}: ${error.message}`
            }, { status: 400 });
          }
        }
      }
      
      processedHosts.push({
        ...host,
        profile_image: profile_image || host.profile_image || null
      });
    }

    // Create event in database
    const eventData = {
      title,
      slug,
      description: description || null,
      start_datetime: new Date(start_datetime).toISOString(),
      end_datetime: end_datetime ? new Date(end_datetime).toISOString() : null,
      timezone: timezone || 'Asia/Bahrain',
      venue_name: venue_name || null,
      address: address || null,
      city: city || null,
      state: province || null,
      pin_code: pin_code || null,
      google_map_url: google_map_url || null,
      capacity,
      is_paid,
      regular_price,
      member_price,
      student_price,
      hygienist_price,
      regular_standard_price,
      member_standard_price,
      student_standard_price,
      hygienist_standard_price,
      regular_onsite_price,
      member_onsite_price,
      student_onsite_price,
      hygienist_onsite_price,
      early_bird_deadline: early_bird_deadline ? new Date(early_bird_deadline).toISOString() : null,
      status,
      banner_url,
      created_by: created_by || null,
      nera_cme_hours,
      nera_code
    };

    // Start transaction: Insert event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (eventError) {
      console.error('Event insert error:', eventError);
      throw eventError;
    }

    // Insert agendas if provided
    if (agendas && agendas.length > 0) {
      const agendaData = agendas.map(agenda => ({
        event_id: event.id,
        agenda_date: agenda.agenda_date,
        title: agenda.title,
        description: agenda.description || null,
        start_time: agenda.start_time || null,
        end_time: agenda.end_time || null
      }));

      const { error: agendaError } = await supabase
        .from('event_agendas')
        .insert(agendaData);

      if (agendaError) {
        console.error('Agenda insert error:', agendaError);
        throw agendaError;
      }
    }

    // Insert hosts if provided
    if (processedHosts && processedHosts.length > 0) {
      const hostData = processedHosts.map(host => ({
        event_id: event.id,
        name: host.name,
        email: host.email || null,
        phone: host.phone || null,
        bio: host.bio || null,
        profile_image: host.profile_image || null,
        is_primary: host.is_primary || false,
        display_order: host.display_order || 1
      }));

      const { error: hostError } = await supabase
        .from('event_hosts')
        .insert(hostData);

      if (hostError) {
        console.error('Host insert error:', hostError);
        throw hostError;
      }
    }

    // Fetch event with all relations
    const { data: eventWithRelations } = await supabase
      .from('events')
      .select(`
        *,
        event_agendas(*),
        event_hosts(*)
      `)
      .eq('id', event.id)
      .single();

    return NextResponse.json({
      success: true,
      event: eventWithRelations,
      message: 'Event created successfully'
    });
  } catch (err) {
    console.error('Event POST Error:', err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}