import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';


export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const per_page = parseInt(url.searchParams.get('per_page') || '20', 10);
    const q = (url.searchParams.get('q') || '').trim();
    const sort = url.searchParams.get('sort') || 'created_at.desc';

    const from = Math.max(0, (page - 1) * per_page);
    const to = from + per_page - 1;

    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone,
        mobile,
        profile_image,
        membership_code,
        membership_type,
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
      `).eq("role", "member");;

    if (q) {
      // search across multiple fields
      query = query.or(
        `full_name.ilike.%${q}%,email.ilike.%${q}%,membership_code.ilike.%${q}%`
      );
    }

    if (sort) {
      const [col, dir] = sort.split('.');
      if (col && dir && ['asc', 'desc'].includes(dir.toLowerCase())) {
        query = query.order(col, { ascending: dir.toLowerCase() === 'asc' });
      }
    }

    query = query.range(from, to);

    const { data: members, error } = await query;
    if (error) throw error;

    // total count
    const { count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: members,
      meta: { page, per_page, total: count ?? members.length }
    });
  } catch (err) {
    console.error('Members LIST Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST - create member
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body = {};
    let profileImage = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body.email = formData.get('email');
      body.password_hash = formData.get('password_hash'); 
      body.full_name = formData.get('full_name');
      body.phone = formData.get('phone') || null;
      body.mobile = formData.get('mobile') || null;
      body.role = formData.get('role') || 'member';
      body.membership_code = formData.get('membership_code') || null;
      body.membership_status = formData.get('membership_status') || 'active';

      body.member_profile = {
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

      profileImage = formData.get('profile_image');
      body.membership_fee_registration = formData.get('membership_fee_registration') ? parseFloat(formData.get('membership_fee_registration')) : undefined;
      body.membership_fee_annual = formData.get('membership_fee_annual') ? parseFloat(formData.get('membership_fee_annual')) : undefined;
      body.membership_pay_now = formData.get('membership_pay_now') === 'true';
      body.payment_reference = formData.get('payment_reference') || null;
    } else {
      body = await request.json();
    }

    // validate required fields
    if (!body.email || !body.password_hash || !body.full_name) {
      return NextResponse.json({ success: false, error: 'email, password_hash and full_name are required' }, { status: 400 });
    }

    // create user
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        email: body.email,
        password_hash: body.password_hash,
        full_name: body.full_name,
        phone: body.phone || null,
        mobile: body.mobile || null,
        role: body.role || 'member',
        membership_code: body.membership_code || null,
        membership_status: body.membership_status || 'active'
      })
      .select()
      .single();

    if (insertError) throw insertError;
    const userId = user.id;

    // handle profile image upload if provided
    let publicProfileUrl = null;
    if (profileImage && profileImage.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024;
      if (!allowedTypes.includes(profileImage.type)) {
        return NextResponse.json({ success: false, error: 'Profile image must be JPEG/PNG/WebP' }, { status: 400 });
      }
      if (profileImage.size > maxSize) {
        return NextResponse.json({ success: false, error: 'Profile image too large (max 5MB)' }, { status: 400 });
      }

      const ext = profileImage.name.split('.').pop();
      const filename = `${uuidv4()}.${ext}`;
      const path = `profiles/${filename}`;

      const { error: uploadErr } = await supabase.storage.from('profile_pictures').upload(path, profileImage, { cacheControl: '3600', upsert: false });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('profiles').getPublicUrl(path);
      publicProfileUrl = urlData.publicUrl || null;

      // update user with profile_image
      await supabase.from('users').update({ profile_image: publicProfileUrl }).eq('id', userId);
    }

    // create member_profile
    const profile = body.member_profile || {};
    const { error: profileErr } = await supabase
      .from('member_profiles')
      .insert({
        user_id: userId,
        gender: profile.gender || null,
        dob: profile.dob || null,
        address: profile.address || null,
        city: profile.city || null,
        state: profile.state || null,
        pin_code: profile.pin_code || null,
        cpr_id: profile.cpr_id || null,
        nationality: profile.nationality || null,
        type_of_application: profile.type_of_application || null,
        membership_date: profile.membership_date || null,
        work_sector: profile.work_sector || null,
        employer: profile.employer || null,
        position: profile.position || null,
        specialty: profile.specialty || null,
        category: profile.category || null
      });

    if (profileErr) throw profileErr;

    // membership payments (optional)
    const registrationAmount = typeof body.membership_fee_registration === 'number' ? body.membership_fee_registration : 30.0;
    const annualAmount = typeof body.membership_fee_annual === 'number' ? body.membership_fee_annual : 20.0;
    const payNow = body.membership_pay_now === true;

    const paymentsToInsert = [];
    if (registrationAmount > 0) {
      paymentsToInsert.push({
        user_id: userId,
        payment_type: 'registration',
        amount: registrationAmount,
        currency: 'B.D',
        paid: payNow,
        paid_at: payNow ? new Date().toISOString() : null,
        reference: body.payment_reference || null
      });
    }
    if (annualAmount > 0) {
      paymentsToInsert.push({
        user_id: userId,
        payment_type: 'annual',
        amount: annualAmount,
        currency: 'B.D',
        paid: payNow,
        paid_at: payNow ? new Date().toISOString() : null,
        reference: body.payment_reference || null
      });
    }
    if (paymentsToInsert.length) {
      const { error: payErr } = await supabase.from('membership_payments').insert(paymentsToInsert);
      if (payErr) throw payErr;
    }

    // return created user details
    const { data: createdUser } = await supabase
      .from('users')
      .select(`
        id,email,full_name,phone,mobile,profile_image,membership_code,membership_status,role,created_at,updated_at,
        member_profile:member_profiles (
          id, gender, dob, address, city, state, pin_code, cpr_id, nationality, type_of_application, membership_date,
          work_sector, employer, position, specialty, category, created_at
        )
      `)
      .eq('id', userId)
      .single();

    return NextResponse.json({ success: true, user: createdUser, message: 'Member created' }, { status: 201 });
  } catch (err) {
    console.error('Members CREATE Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE - bulk delete members
export async function DELETE(request) {
  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids : [];

    if (!ids.length) {
      return NextResponse.json({ success: false, error: 'No member ids provided' }, { status: 400 });
    }

    // fetch users for profile images
    const { data: users } = await supabase.from('users').select('id, profile_image').in('id', ids);

    const pathsToRemove = [];
    (users || []).forEach(u => {
      if (u.profile_image) {
        const fileName = u.profile_image.split('/').pop();
        if (fileName) pathsToRemove.push(`profiles/${fileName}`);
      }
    });
    if (pathsToRemove.length) {
      await supabase.storage.from('profile_pictures').remove(pathsToRemove);
    }

    // get event_member ids for these users
    const { data: eventMembers } = await supabase.from('event_members').select('id').in('user_id', ids);
    const eventMemberIds = (eventMembers || []).map(em => em.id);

    if (eventMemberIds.length) {
      await supabase.from('attendance_logs').delete().in('event_member_id', eventMemberIds);
      await supabase.from('event_members').delete().in('id', eventMemberIds);
    }

    // delete member_profiles
    await supabase.from('member_profiles').delete().in('user_id', ids);

    // delete membership_payments
    await supabase.from('membership_payments').delete().in('user_id', ids);

    // finally delete users
    const { error } = await supabase.from('users').delete().in('id', ids);
    if (error) throw error;

    return NextResponse.json({ success: true, message: `Deleted ${ids.length} members` });
  } catch (err) {
    console.error('Members BULK DELETE Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
