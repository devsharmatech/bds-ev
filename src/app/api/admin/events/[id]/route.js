import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// GET single event with hosts and agendas
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const { data: event, error } = await supabase
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
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Event not found'
        }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      event
    });
  } catch (err) {
    console.error('Event GET Error:', err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}

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

// Helper function to delete image
async function deleteImage(imageUrl, folder) {
  if (!imageUrl) return;

  const fileName = imageUrl.split('/').pop();
  if (fileName) {
    await supabase.storage
      .from('events')
      .remove([`${folder}/${fileName}`]);
  }
}

// PUT update event with hosts and agendas
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const contentType = request.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    // Check if event exists
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select(`
        *,
        event_hosts(*)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 });
    }

    let title, description, start_datetime, end_datetime, timezone, venue_name, address, city,
      created_by, province, pin_code, google_map_url, capacity, is_paid,
      regular_price, member_price, student_price, hygienist_price,
      regular_standard_price, member_standard_price, student_standard_price, hygienist_standard_price,
      regular_onsite_price, member_onsite_price, student_onsite_price, hygienist_onsite_price,
      early_bird_deadline, status, nera_cme_hours, nera_code;
    let bannerImage = null;
    let removeBanner = false;
    let bannerImageUrl = null;
    let agendas = [];
    let updateAgendas = false;
    let hosts = [];
    let updateHosts = false;
    let hostImageFiles = {};

    if (isJson) {
      const body = await request.json();
      title = body.title;
      description = body.description;
      start_datetime = body.start_datetime;
      end_datetime = body.end_datetime;
      timezone = body.timezone;
      venue_name = body.venue_name;
      address = body.address;
      city = body.city;
      created_by = body.created_by;
      province = body.province;
      pin_code = body.pin_code;
      google_map_url = body.google_map_url;
      capacity = body.capacity ? parseInt(body.capacity) : undefined;
      is_paid = body.is_paid !== undefined ? (body.is_paid === true || body.is_paid === 'true') : undefined;
      const parsePrice = (val) => { if (val === undefined) return undefined; return (val === null || val === '') ? null : (isNaN(parseFloat(val)) ? null : parseFloat(val)); };
      regular_price = parsePrice(body.regular_price);
      member_price = parsePrice(body.member_price);
      student_price = parsePrice(body.student_price);
      hygienist_price = parsePrice(body.hygienist_price);
      regular_standard_price = parsePrice(body.regular_standard_price);
      member_standard_price = parsePrice(body.member_standard_price);
      student_standard_price = parsePrice(body.student_standard_price);
      hygienist_standard_price = parsePrice(body.hygienist_standard_price);
      regular_onsite_price = parsePrice(body.regular_onsite_price);
      member_onsite_price = parsePrice(body.member_onsite_price);
      student_onsite_price = parsePrice(body.student_onsite_price);
      hygienist_onsite_price = parsePrice(body.hygienist_onsite_price);
      early_bird_deadline = body.early_bird_deadline;
      status = body.status;
      nera_cme_hours = body.nera_cme_hours;
      nera_code = body.nera_code;
      removeBanner = body.remove_banner === true;
      bannerImageUrl = body.banner_image_url || null;
      agendas = body.agendas || [];
      updateAgendas = body.update_agendas === true;
      hosts = body.hosts || [];
      updateHosts = body.update_hosts === true;
    } else {
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
      const parsePriceF = (val) => (val === null || val === undefined || val === '') ? null : (isNaN(parseFloat(val)) ? null : parseFloat(val));
      regular_price = parsePriceF(formData.get('regular_price'));
      member_price = parsePriceF(formData.get('member_price'));
      student_price = parsePriceF(formData.get('student_price'));
      hygienist_price = parsePriceF(formData.get('hygienist_price'));
      regular_standard_price = parsePriceF(formData.get('regular_standard_price'));
      member_standard_price = parsePriceF(formData.get('member_standard_price'));
      student_standard_price = parsePriceF(formData.get('student_standard_price'));
      hygienist_standard_price = parsePriceF(formData.get('hygienist_standard_price'));
      regular_onsite_price = parsePriceF(formData.get('regular_onsite_price'));
      member_onsite_price = parsePriceF(formData.get('member_onsite_price'));
      student_onsite_price = parsePriceF(formData.get('student_onsite_price'));
      hygienist_onsite_price = parsePriceF(formData.get('hygienist_onsite_price'));
      early_bird_deadline = formData.get('early_bird_deadline');
      status = formData.get('status');
      bannerImage = formData.get('banner_image');
      removeBanner = formData.get('remove_banner') === 'true';
      nera_cme_hours = formData.get('nera_cme_hours');
      nera_code = formData.get('nera_code');
      const agendasJson = formData.get('agendas');
      agendas = agendasJson ? JSON.parse(agendasJson) : [];
      updateAgendas = formData.get('update_agendas') === 'true';
      const hostsJson = formData.get('hosts');
      hosts = hostsJson ? JSON.parse(hostsJson) : [];
      updateHosts = formData.get('update_hosts') === 'true';
      for (const [index] of hosts.entries()) {
        const hostImage = formData.get(`host_profile_image_${index}`);
        if (hostImage && hostImage.size > 0) hostImageFiles[index] = hostImage;
      }
    }

    // Prepare event update data
    const updateData = {};

    if (title && title !== existingEvent.title) {
      updateData.title = title;
      // Update slug if title changed
      const slug = createSlug(title);
      updateData.slug = slug;
    }

    if (description !== undefined) updateData.description = description;
    if (start_datetime) updateData.start_datetime = new Date(start_datetime).toISOString();
    if (end_datetime !== undefined) updateData.end_datetime = end_datetime ? new Date(end_datetime).toISOString() : null;
    if (timezone) updateData.timezone = timezone;
    if (venue_name !== undefined) updateData.venue_name = venue_name;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (province !== undefined) updateData.state = province;
    if (pin_code !== undefined) updateData.pin_code = pin_code;
    if (google_map_url !== undefined) updateData.google_map_url = google_map_url;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (is_paid !== undefined) updateData.is_paid = is_paid;
    if (regular_price !== undefined) updateData.regular_price = regular_price;
    if (member_price !== undefined) updateData.member_price = member_price;
    if (student_price !== undefined) updateData.student_price = student_price;
    if (hygienist_price !== undefined) updateData.hygienist_price = hygienist_price;
    if (regular_standard_price !== undefined) updateData.regular_standard_price = regular_standard_price;
    if (member_standard_price !== undefined) updateData.member_standard_price = member_standard_price;
    if (student_standard_price !== undefined) updateData.student_standard_price = student_standard_price;
    if (hygienist_standard_price !== undefined) updateData.hygienist_standard_price = hygienist_standard_price;
    if (regular_onsite_price !== undefined) updateData.regular_onsite_price = regular_onsite_price;
    if (member_onsite_price !== undefined) updateData.member_onsite_price = member_onsite_price;
    if (student_onsite_price !== undefined) updateData.student_onsite_price = student_onsite_price;
    if (hygienist_onsite_price !== undefined) updateData.hygienist_onsite_price = hygienist_onsite_price;
    if (early_bird_deadline !== undefined) updateData.early_bird_deadline = early_bird_deadline ? new Date(early_bird_deadline).toISOString() : null;
    if (created_by !== undefined) updateData.created_by = created_by;
    if (status) updateData.status = status;
    updateData.updated_at = new Date().toISOString();
    if (nera_cme_hours !== null && nera_cme_hours !== undefined) {
      const parsed = nera_cme_hours === "" ? null : parseFloat(nera_cme_hours);
      updateData.nera_cme_hours = isNaN(parsed) ? null : parsed;
    }
    if (nera_code !== undefined) updateData.nera_code = nera_code || null;

    // Handle event banner image
    if (removeBanner && existingEvent.banner_url) {
      await deleteImage(existingEvent.banner_url, 'events');
      updateData.banner_url = null;
    } else if (bannerImageUrl) {
      // JSON path: client already uploaded, just use the URL
      if (existingEvent.banner_url) {
        await deleteImage(existingEvent.banner_url, 'events');
      }
      updateData.banner_url = bannerImageUrl;
    } else if (bannerImage && bannerImage.size > 0) {
      // Legacy FormData path
      if (existingEvent.banner_url) {
        await deleteImage(existingEvent.banner_url, 'events');
      }
      try {
        updateData.banner_url = await uploadImage(bannerImage, 'events');
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 400 });
      }
    }

    // Start transaction
    // 1. Update event
    const { data: event, error: updateError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 2. Handle agendas if update requested
    if (updateAgendas) {
      // Delete existing agendas
      const { error: deleteAgendaError } = await supabase
        .from('event_agendas')
        .delete()
        .eq('event_id', id);

      if (deleteAgendaError) throw deleteAgendaError;

      // Insert new agendas if provided
      if (agendas && agendas.length > 0) {
        // Validate agendas
        for (const agenda of agendas) {
          if (!agenda.agenda_date || !agenda.title) {
            return NextResponse.json({
              success: false,
              error: 'Agenda date and title are required for each agenda item'
            }, { status: 400 });
          }
        }

        const agendaData = agendas.map(agenda => ({
          event_id: id,
          agenda_date: agenda.agenda_date,
          title: agenda.title,
          description: agenda.description || null,
          start_time: agenda.start_time || null,
          end_time: agenda.end_time || null
        }));

        const { error: agendaError } = await supabase
          .from('event_agendas')
          .insert(agendaData);

        if (agendaError) throw agendaError;
      }
    }

    // 3. Handle hosts if update requested
    if (updateHosts) {
      // Process hosts with their profile images
      const processedHosts = [];

      for (const [index, host] of hosts.entries()) {
        let profile_image = host.profile_image || null;

        if (isJson) {
          // JSON path: client already uploaded, use profile_image_url if provided
          if (host.profile_image_url) {
            profile_image = host.profile_image_url;
          } else if (host.remove_profile_image === true) {
            if (host.profile_image) {
              await deleteImage(host.profile_image, 'hosts');
            }
            profile_image = null;
          }
        } else {
          // Legacy FormData path
          const hostImage = hostImageFiles[index];
          if (hostImage && hostImage.size > 0) {
            try {
              profile_image = await uploadImage(hostImage, 'hosts');
            } catch (error) {
              return NextResponse.json({
                success: false,
                error: `Host ${index + 1}: ${error.message}`
              }, { status: 400 });
            }
          } else if (host.remove_profile_image === true) {
            if (host.profile_image) {
              await deleteImage(host.profile_image, 'hosts');
              profile_image = null;
            }
          }
        }

        processedHosts.push({
          ...host,
          profile_image: profile_image
        });
      }

      // Delete existing hosts
      const { error: deleteHostError } = await supabase
        .from('event_hosts')
        .delete()
        .eq('event_id', id);

      if (deleteHostError) throw deleteHostError;

      // Insert new hosts if provided
      if (processedHosts && processedHosts.length > 0) {
        // Validate hosts
        for (const host of processedHosts) {
          if (!host.name) {
            return NextResponse.json({
              success: false,
              error: 'Host name is required for each host'
            }, { status: 400 });
          }
        }

        const hostData = processedHosts.map(host => ({
          event_id: id,
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

        if (hostError) throw hostError;
      }
    }

    // Fetch updated event with all relations
    const { data: updatedEventWithRelations } = await supabase
      .from('events')
      .select(`
        *,
        event_agendas(*),
        event_hosts(*)
      `)
      .eq('id', id)
      .single();

    return NextResponse.json({
      success: true,
      event: updatedEventWithRelations,
      message: 'Event updated successfully'
    });
  } catch (err) {
    console.error('Event PUT Error:', err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}

// DELETE event (cascades to agendas and hosts)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if event exists
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select(`
        *,
        event_hosts(*)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 });
    }

    // Delete event banner image from storage if exists
    if (existingEvent.banner_url) {
      await deleteImage(existingEvent.banner_url, 'events');
    }

    // Delete host profile images
    if (existingEvent.event_hosts && existingEvent.event_hosts.length > 0) {
      for (const host of existingEvent.event_hosts) {
        if (host.profile_image) {
          await deleteImage(host.profile_image, 'hosts');
        }
      }
    }

    // Note: event_agendas and event_hosts will be automatically deleted due to foreign key cascade

    // Delete event from database
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (err) {
    console.error('Event DELETE Error:', err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}