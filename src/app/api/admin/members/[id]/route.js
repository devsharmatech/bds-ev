import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

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
        is_member_verified,
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
          license_number,
          years_of_experience,
          id_card_url,
          personal_photo_url,
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
      user: user,
      member: user, // Keep for backward compatibility
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
    let verificationIdCard = null;
    let verificationPersonalPhoto = null;
    let setPersonalAsProfile = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      if (formData.get('full_name') !== null) updateUser.full_name = formData.get('full_name');
      if (formData.get('email') !== null) updateUser.email = formData.get('email');
      // Handle password update if provided
      const passwordValue = formData.get('password');
      if (passwordValue && typeof passwordValue === 'string' && passwordValue.trim().length > 0) {
        if (passwordValue.trim().length < 6) {
          return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
        }
        // Hash the password before storing
        const password_hash = await bcrypt.hash(passwordValue.trim(), 10);
        updateUser.password_hash = password_hash;
      }
      if (formData.get('phone') !== null) updateUser.phone = formData.get('phone') || null;
      if (formData.get('mobile') !== null) updateUser.mobile = formData.get('mobile') || null;
      if (formData.get('membership_status') !== null) updateUser.membership_status = formData.get('membership_status') || null;
      if (formData.get('membership_type') !== null) {
        const rawType = String(formData.get('membership_type') || '').trim().toLowerCase();
        if (rawType === 'paid' || rawType === 'free') {
          updateUser.membership_type = rawType;
        }
      }
      if (formData.get('membership_expiry_date') !== null) {
        const rawExpiry = formData.get('membership_expiry_date');
        if (rawExpiry && typeof rawExpiry === 'string' && rawExpiry.trim()) {
          // Store as end-of-day UTC for the selected date
          const date = new Date(rawExpiry.trim());
          if (!Number.isNaN(date.getTime())) {
            date.setUTCHours(23, 59, 59, 999);
            updateUser.membership_expiry_date = date.toISOString();
          }
        } else {
          // Allow clearing expiry date
          updateUser.membership_expiry_date = null;
        }
      }
      if (formData.get('role') !== null) updateUser.role = formData.get('role') || null;
      if (formData.get('subscription_plan') !== null) {
        const rawPlan = String(formData.get('subscription_plan') || '').trim().toLowerCase();
        if (!rawPlan) {
          updateUser.current_subscription_plan_id = null;
          updateUser.current_subscription_plan_name = null;
        } else {
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('id, display_name')
            .eq('name', rawPlan)
            .maybeSingle();
          if (plan) {
            updateUser.current_subscription_plan_id = plan.id;
            updateUser.current_subscription_plan_name = plan.display_name;
          }
        }
      }
      if (formData.get('membership_code') !== null) updateUser.membership_code = formData.get('membership_code') || null;
      if (formData.get('is_member_verified') !== null) updateUser.is_member_verified = formData.get('is_member_verified') === 'true';
      if (formData.get('set_personal_as_profile') !== null) setPersonalAsProfile = formData.get('set_personal_as_profile') === 'true';

      // Only capture profile fields that are actually present in the form
      profileData = {};
      const profileKeys = [
        'gender','dob','address','city','state','pin_code','cpr_id','nationality',
        'type_of_application','membership_date','work_sector','employer','position',
        'specialty','category','license_number','years_of_experience'
      ];
      for (const key of profileKeys) {
        if (formData.has(key)) {
          const val = formData.get(key);
          // Allow empty string to clear a field explicitly; otherwise keep as provided
          profileData[key] = val === '' ? null : val;
        }
      }

      newProfileImage = formData.get('profile_image');
      removeProfile = formData.get('remove_profile') === 'true';
      verificationIdCard = formData.get('verification_id_card');
      verificationPersonalPhoto = formData.get('verification_personal_photo');
      setPersonalAsProfile = formData.get('set_personal_as_profile') === 'true';

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
      if (body.email !== undefined) updateUser.email = body.email;
      // Handle password update if provided
      if (body.password && typeof body.password === 'string' && body.password.trim().length > 0) {
        if (body.password.trim().length < 6) {
          return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
        }
        // Hash the password before storing
        const password_hash = await bcrypt.hash(body.password.trim(), 10);
        updateUser.password_hash = password_hash;
      }
      if (body.phone !== undefined) updateUser.phone = body.phone;
      if (body.mobile !== undefined) updateUser.mobile = body.mobile;
      if (body.membership_status !== undefined) updateUser.membership_status = body.membership_status;
      if (body.membership_type !== undefined) {
        const rawType = String(body.membership_type || '').trim().toLowerCase();
        if (rawType === 'paid' || rawType === 'free') {
          updateUser.membership_type = rawType;
        }
      }
      if (body.role !== undefined) updateUser.role = body.role;
      if (body.membership_code !== undefined) updateUser.membership_code = body.membership_code;

      profileData = body.member_profile || {};

      if (body.subscription_plan !== undefined) {
        const rawPlan = String(body.subscription_plan || '').trim().toLowerCase();
        if (!rawPlan) {
          updateUser.current_subscription_plan_id = null;
          updateUser.current_subscription_plan_name = null;
        } else {
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('id, display_name')
            .eq('name', rawPlan)
            .maybeSingle();
          if (plan) {
            updateUser.current_subscription_plan_id = plan.id;
            updateUser.current_subscription_plan_name = plan.display_name;
          }
        }
      }

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

    // handle verification documents upload
    const verificationAllowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    const verificationMaxSize = 10 * 1024 * 1024;

    if (verificationIdCard && verificationIdCard.size > 0) {
      if (!verificationAllowedTypes.includes(verificationIdCard.type)) {
        return NextResponse.json({ success: false, error: 'ID card must be image or PDF' }, { status: 400 });
      }
      if (verificationIdCard.size > verificationMaxSize) {
        return NextResponse.json({ success: false, error: 'ID card too large (max 10MB)' }, { status: 400 });
      }
      const ext = (verificationIdCard.name || 'file').split('.').pop();
      const filename = `${uuidv4()}.${ext}`;
      const path = `verification/${id}/id_card_${filename}`;
      const { error: upErr } = await supabase.storage.from('profile_pictures').upload(path, verificationIdCard, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('profile_pictures').getPublicUrl(path);
      profileData.id_card_url = urlData.publicUrl || null;
    }

    if (verificationPersonalPhoto && verificationPersonalPhoto.size > 0) {
      if (!verificationAllowedTypes.includes(verificationPersonalPhoto.type)) {
        return NextResponse.json({ success: false, error: 'Personal photo must be image or PDF' }, { status: 400 });
      }
      if (verificationPersonalPhoto.size > verificationMaxSize) {
        return NextResponse.json({ success: false, error: 'Personal photo too large (max 10MB)' }, { status: 400 });
      }
      const ext = (verificationPersonalPhoto.name || 'file').split('.').pop();
      const filename = `${uuidv4()}.${ext}`;
      const path = `verification/${id}/personal_${filename}`;
      const { error: upErr } = await supabase.storage.from('profile_pictures').upload(path, verificationPersonalPhoto, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('profile_pictures').getPublicUrl(path);
      profileData.personal_photo_url = urlData.publicUrl || null;
      // Optionally set this personal photo as profile image for the user
      if (setPersonalAsProfile && profileData.personal_photo_url) {
        updateUser.profile_image = profileData.personal_photo_url;
      }
    }

    // Handle setting existing personal photo as profile if checkbox is checked and no new file uploaded
    if (setPersonalAsProfile && !verificationPersonalPhoto) {
      // Check if existing personal photo exists
      const { data: existingProfile } = await supabase
        .from('member_profiles')
        .select('personal_photo_url')
        .eq('user_id', id)
        .single();
      
      if (existingProfile?.personal_photo_url) {
        updateUser.profile_image = existingProfile.personal_photo_url;
      }
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
        // Build patch only with provided keys to avoid overwriting existing values with nulls
        const patch = {};
        for (const [k, v] of Object.entries(profileData)) {
          patch[k] = v;
        }
        const { error: profileUpdateErr } = await supabase
          .from('member_profiles')
          .update(patch)
          .eq('user_id', id);
        if (profileUpdateErr) throw profileUpdateErr;
      } else {
        const insertPayload = { user_id: id, ...profileData };
        const { error: profileInsertErr } = await supabase
          .from('member_profiles')
          .insert(insertPayload);
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
        id,email,full_name,phone,mobile,profile_image,membership_code,membership_status,is_member_verified,role,created_at,updated_at,
        member_profile:member_profiles (
          id, gender, dob, address, city, state, pin_code, cpr_id, nationality, type_of_application, membership_date,
          work_sector, employer, position, specialty, category, license_number, years_of_experience,
          id_card_url, personal_photo_url, created_at
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
