import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * Single-member route
 * - GET: fetch member with profile, joined events, attendance logs and fee summary
 * - PUT: update member and profile (supports multipart/form-data for profile image)
 * - DELETE: delete single member and related records
 */

// GET single member
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // fetch user + profile
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone,
        mobile,
        profile_image,
        membership_code,
        membership_status,
        role,
        created_at,
        updated_at,
        member_profile:member_profiles (
          id,
          gender,
          dob,
          address,
          city,
          state,
          pin_code,
          cpr_id,
          nationality,
          type_of_application,
          membership_date,
          work_sector,
          employer,
          position,
          specialty,
          category,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (userErr) {
      if (userErr.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
      }
      throw userErr;
    }

    // fetch events joined via event_members
    const { data: joined, error: joinedErr } = await supabase
      .from('event_members')
      .select(`
        id,
        event_id,
        token,
        checked_in,
        checked_in_at,
        joined_at,
        event:events (
          id,
          title,
          slug,
          start_datetime,
          end_datetime,
          venue_name,
          city,
          banner_url,
          status
        )
      `)
      .eq('user_id', id)
      .order('joined_at', { ascending: false });

    if (joinedErr) throw joinedErr;

    // attendance logs for these event_members
    const eventMemberIds = (joined || []).map(j => j.id);
    let attendance = [];
    if (eventMemberIds.length) {
      const { data: logs, error: logErr } = await supabase
        .from('attendance_logs')
        .select(`
          id,
          event_member_id,
          scanned_by:users ( id, full_name, email ),
          location,
          device_info,
          scan_time
        `)
        .in('event_member_id', eventMemberIds)
        .order('scan_time', { ascending: false });

      if (logErr) throw logErr;
      attendance = logs;
    }

    // fee summary (from view or compute)
    // try view member_fee_summary first
    let feeSummary = null;
    const { data: feeData, error: feeErr } = await supabase
      .from('member_fee_summary')
      .select('*')
      .eq('user_id', id)
      .single();

    if (!feeErr && feeData) {
      feeSummary = feeData;
    } else {
      // fallback: compute from membership_payments
      const { data: payments } = await supabase
        .from('membership_payments')
        .select('payment_type, amount, paid')
        .eq('user_id', id);

      const regPaid = (payments || []).filter(p => p.payment_type === 'registration').reduce((s, p) => s + Number(p.amount || 0), 0);
      const annPaid = (payments || []).filter(p => p.payment_type === 'annual').reduce((s, p) => s + Number(p.amount || 0), 0);
      const totalPaid = (payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
      feeSummary = {
        user_id: id,
        registration_paid: regPaid,
        annual_paid: annPaid,
        total_paid: totalPaid
      };
    }

    return NextResponse.json({
      success: true,
      member: user,
      joined_events: joined,
      attendance_logs: attendance,
      fee_summary: feeSummary
    });
  } catch (err) {
    console.error('Member GET Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT - update member
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    // verify user exists
    const { data: existingUser, error: fetchError } = await supabase.from('users').select('*').eq('id', id).single();
    if (fetchError || !existingUser) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    const contentType = request.headers.get('content-type') || '';
    let updateUser = {};
    let profileData = {};
    let newProfileImage = null;
    let removeProfile = false;
    let paymentsToAdd = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      if (formData.get('full_name') !== null) updateUser.full_name = formData.get('full_name');
      if (formData.get('phone') !== null) updateUser.phone = formData.get('phone') || null;
      if (formData.get('mobile') !== null) updateUser.mobile = formData.get('mobile') || null;
      if (formData.get('membership_status') !== null) updateUser.membership_status = formData.get('membership_status') || null;
      if (formData.get('role') !== null) updateUser.role = formData.get('role') || null;
      if (formData.get('membership_code') !== null) updateUser.membership_code = formData.get('membership_code') || null;

      profileData = {
        gender: formData.get('gender') || null,
        dob: formData.get('dob') || null,
        address: formData.get('address') || null,
        city: formData.get('city') || null,
        state: formData.get('state') || null,
        pin_code: formData.get('pin_code') || null,
        cpr_id: formData.get('cpr_id') || null,
        nationality: formData.get('nationality') || null,
        type_of_application: formData.get('type_of_application') || null,
        membership_date: formData.get('membership_date') || null,
        work_sector: formData.get('work_sector') || null,
        employer: formData.get('employer') || null,
        position: formData.get('position') || null,
        specialty: formData.get('specialty') || null,
        category: formData.get('category') || null
      };

      newProfileImage = formData.get('profile_image');
      removeProfile = formData.get('remove_profile') === 'true';

      // possible membership payment additions
      const registrationAmount = formData.get('membership_fee_registration') ? parseFloat(formData.get('membership_fee_registration')) : undefined;
      const annualAmount = formData.get('membership_fee_annual') ? parseFloat(formData.get('membership_fee_annual')) : undefined;
      const payNow = formData.get('membership_pay_now') === 'true';
      const reference = formData.get('payment_reference') || null;

      if (typeof registrationAmount === 'number') {
        paymentsToAdd.push({
          user_id: id,
          payment_type: 'registration',
          amount: registrationAmount,
          currency: 'B.D',
          paid: payNow,
          paid_at: payNow ? new Date().toISOString() : null,
          reference
        });
      }
      if (typeof annualAmount === 'number') {
        paymentsToAdd.push({
          user_id: id,
          payment_type: 'annual',
          amount: annualAmount,
          currency: 'B.D',
          paid: payNow,
          paid_at: payNow ? new Date().toISOString() : null,
          reference
        });
      }
    } else {
      const body = await request.json();
      if (body.full_name !== undefined) updateUser.full_name = body.full_name;
      if (body.phone !== undefined) updateUser.phone = body.phone;
      if (body.mobile !== undefined) updateUser.mobile = body.mobile;
      if (body.membership_status !== undefined) updateUser.membership_status = body.membership_status;
      if (body.role !== undefined) updateUser.role = body.role;
      if (body.membership_code !== undefined) updateUser.membership_code = body.membership_code;

      profileData = body.member_profile || {};

      // payments
      if (typeof body.membership_fee_registration === 'number') {
        paymentsToAdd.push({
          user_id: id,
          payment_type: 'registration',
          amount: body.membership_fee_registration,
          currency: 'B.D',
          paid: body.membership_pay_now === true,
          paid_at: body.membership_pay_now === true ? new Date().toISOString() : null,
          reference: body.payment_reference || null
        });
      }
      if (typeof body.membership_fee_annual === 'number') {
        paymentsToAdd.push({
          user_id: id,
          payment_type: 'annual',
          amount: body.membership_fee_annual,
          currency: 'B.D',
          paid: body.membership_pay_now === true,
          paid_at: body.membership_pay_now === true ? new Date().toISOString() : null,
          reference: body.payment_reference || null
        });
      }
    }

    // handle profile image remove or replace
    if (removeProfile && existingUser.profile_image) {
      const fileName = existingUser.profile_image.split('/').pop();
      if (fileName) {
        await supabase.storage.from('profile_pictures').remove([`profiles/${fileName}`]);
      }
      updateUser.profile_image = null;
    } else if (newProfileImage && newProfileImage.size > 0) {
      // delete old if exists
      if (existingUser.profile_image) {
        const oldFile = existingUser.profile_image.split('/').pop();
        if (oldFile) {
          await supabase.storage.from('profile_pictures').remove([`profiles/${oldFile}`]);
        }
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024;
      if (!allowedTypes.includes(newProfileImage.type)) {
        return NextResponse.json({ success: false, error: 'Profile image must be JPEG/PNG/WebP' }, { status: 400 });
      }
      if (newProfileImage.size > maxSize) {
        return NextResponse.json({ success: false, error: 'Profile image too large (max 5MB)' }, { status: 400 });
      }

      const ext = newProfileImage.name.split('.').pop();
      const filename = `${uuidv4()}.${ext}`;
      const path = `profiles/${filename}`;

      const { error: uploadErr } = await supabase.storage.from('profile_pictures').upload(path, newProfileImage, { cacheControl: '3600', upsert: false });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('profile_pictures').getPublicUrl(path);
      updateUser.profile_image = urlData.publicUrl || null;
    }

    // update users if needed
    if (Object.keys(updateUser).length) {
      updateUser.updated_at = new Date().toISOString();
      const { error: updateErr } = await supabase.from('users').update(updateUser).eq('id', id);
      if (updateErr) throw updateErr;
    }

    // upsert member_profiles
    if (profileData && Object.keys(profileData).length) {
      // check if exists
      const { data: profileExists } = await supabase.from('member_profiles').select('id').eq('user_id', id).single();
      if (profileExists && profileExists.id) {
        const { error: profileUpdateErr } = await supabase.from('member_profiles').update({
          gender: profileData.gender || null,
          dob: profileData.dob || null,
          address: profileData.address || null,
          city: profileData.city || null,
          state: profileData.state || null,
          pin_code: profileData.pin_code || null,
          cpr_id: profileData.cpr_id || null,
          nationality: profileData.nationality || null,
          type_of_application: profileData.type_of_application || null,
          membership_date: profileData.membership_date || null,
          work_sector: profileData.work_sector || null,
          employer: profileData.employer || null,
          position: profileData.position || null,
          specialty: profileData.specialty || null,
          category: profileData.category || null
        }).eq('user_id', id);
        if (profileUpdateErr) throw profileUpdateErr;
      } else {
        const { error: profileInsertErr } = await supabase.from('member_profiles').insert({
          user_id: id,
          gender: profileData.gender || null,
          dob: profileData.dob || null,
          address: profileData.address || null,
          city: profileData.city || null,
          state: profileData.state || null,
          pin_code: profileData.pin_code || null,
          cpr_id: profileData.cpr_id || null,
          nationality: profileData.nationality || null,
          type_of_application: profileData.type_of_application || null,
          membership_date: profileData.membership_date || null,
          work_sector: profileData.work_sector || null,
          employer: profileData.employer || null,
          position: profileData.position || null,
          specialty: profileData.specialty || null,
          category: profileData.category || null
        });
        if (profileInsertErr) throw profileInsertErr;
      }
    }

    // insert membership payments if requested
    if (paymentsToAdd.length) {
      const { error: payErr } = await supabase.from('membership_payments').insert(paymentsToAdd);
      if (payErr) throw payErr;
    }

    // return updated user
    const { data: updatedUser } = await supabase
      .from('users')
      .select(`
        id,email,full_name,phone,mobile,profile_image,membership_code,membership_status,role,created_at,updated_at,
        member_profile:member_profiles (
          id, gender, dob, address, city, state, pin_code, cpr_id, nationality, type_of_application, membership_date,
          work_sector, employer, position, specialty, category, created_at
        )
      `)
      .eq('id', id)
      .single();

    return NextResponse.json({ success: true, user: updatedUser, message: 'Member updated' });
  } catch (err) {
    console.error('Member PUT Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE single member
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // check exists
    const { data: existingUser, error: fetchError } = await supabase.from('users').select('*').eq('id', id).single();
    if (fetchError || !existingUser) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    // remove profile image
    if (existingUser.profile_image) {
      const fileName = existingUser.profile_image.split('/').pop();
      if (fileName) {
        await supabase.storage.from('profile_pictures').remove([`profiles/${fileName}`]);
      }
    }

    // event_members and attendance_logs
    const { data: eventMembers } = await supabase.from('event_members').select('id').eq('user_id', id);
    const eventMemberIds = (eventMembers || []).map(e => e.id);
    if (eventMemberIds.length) {
      await supabase.from('attendance_logs').delete().in('event_member_id', eventMemberIds);
      await supabase.from('event_members').delete().in('id', eventMemberIds);
    }

    // delete member_profile
    await supabase.from('member_profiles').delete().eq('user_id', id);

    // delete membership_payments
    await supabase.from('membership_payments').delete().eq('user_id', id);

    // delete user
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Member deleted' });
  } catch (err) {
    console.error('Member DELETE Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
