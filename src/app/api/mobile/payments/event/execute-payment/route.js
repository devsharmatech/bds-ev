import { supabase } from '@/lib/supabaseAdmin';
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";
import { NextResponse } from 'next/server';
import { executeEventPayment } from '@/lib/myfatoorah';
import { getUserEventPrice } from '@/lib/eventPricing';

// Local sanitizer to conform to MyFatoorah CustomerMobile constraints
function sanitizeMobileForMyFatoorrah(mobile) {
  if (!mobile) return '';
  let digits = String(mobile).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('973') && digits.length > 8) {
    digits = digits.slice(3);
  }
  if (digits.length > 11) digits = digits.slice(-11);
  if (digits.length < 6) return '';
  return digits;
}

/**
 * POST /api/payments/event/execute-payment
 * Execute event payment with selected payment method
 */
export async function POST(request) {
  const startTime = Date.now();
  let requestData = null;
  
  try {
    requestData = await request.json();
    
    // Support both snake_case and camelCase
    const event_id = requestData.event_id || requestData.eventId;
    const body_user_id = requestData.user_id || requestData.userId;
    const payment_method_id = requestData.payment_method_id || requestData.paymentMethodId;

    // Verify authentication and get user_id from token
    let decoded;
    try {
      decoded = verifyTokenMobile(request);
    } catch (error) {
      console.error('[EVENT-EXECUTE-PAYMENT] Auth error:', error.message);
      return NextResponse.json(
        { success: false, message: error.message || 'Authentication required' },
        { status: 401 }
      );
    }

    const user_id = decoded.user_id;

    console.log('[EVENT-EXECUTE-PAYMENT] Request received:', {
      event_id,
      user_id,
      body_user_id,
      payment_method_id,
      timestamp: new Date().toISOString()
    });

    if (!event_id || !user_id || !payment_method_id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'event_id and payment_method_id are required'
        },
        { status: 400 }
      );
    }

    // Verify user matches if both provided
    if (body_user_id && body_user_id !== user_id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: user_id mismatch' },
        { status: 403 }
      );
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id, title, is_paid, start_datetime, early_bird_deadline,
        regular_price, regular_standard_price, regular_onsite_price,
        member_price, member_standard_price, member_onsite_price,
        student_price, student_standard_price, student_onsite_price,
        hygienist_price, hygienist_standard_price, hygienist_onsite_price
      `)
      .eq('id', event_id)
      .single();

    if (eventError || !event || !event.is_paid) {
      return NextResponse.json(
        { success: false, message: 'Event not found or does not require payment' },
        { status: 404 }
      );
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id, full_name, email, phone, mobile, membership_type, membership_status, membership_expiry_date,
        member_profiles!member_profiles_user_id_fkey(category, position, specialty)
      `)
      .eq('id', user_id)
      .single();

    if (user && user.member_profiles) {
      user.category = user.member_profiles.category;
      user.position = user.member_profiles.position;
      user.specialty = user.member_profiles.specialty;
    }

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already joined and paid
    const { data: existingMember } = await supabase
      .from('event_members')
      .select('id, price_paid')
      .eq('event_id', event_id)
      .eq('user_id', user_id)
      .maybeSingle();

    if (existingMember && existingMember.price_paid > 0) {
      return NextResponse.json(
        { success: false, message: 'You have already paid for this event' },
        { status: 409 }
      );
    }

    // Determine amount to charge
    let amount; 
    let priceInfo = null;

    const { data: provisionalUsage, error: usageError } = await supabase
      .from('event_coupon_usages')
      .select('*')
      .eq('event_id', event_id)
      .eq('user_id', user_id)
      .is('event_member_id', null)
      .order('used_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!usageError && provisionalUsage && provisionalUsage.amount_after != null) {
      amount = Number(provisionalUsage.amount_after);
    } else {
      priceInfo = getUserEventPrice(event, user);
      amount = priceInfo.price;
    }
    
    const now = new Date();
    const membershipValid = user && user.membership_type === 'paid' && user.membership_status === 'active' && (!user.membership_expiry_date || new Date(user.membership_expiry_date) > now);
    const isMember = (priceInfo && priceInfo.category === 'member') || membershipValid;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Event price is not set for your category' },
        { status: 400 }
      );
    }

    // For mobile APIs, always use production URL for MyFatoorah callbacks
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost'))
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
      : 'https://bds-ev.vercel.app';
    
    const callbackUrl = `${baseUrl}/api/mobile/payments/event/payment-complete?event_id=${event_id}&status=success`;
    const errorUrl = `${baseUrl}/api/mobile/payments/event/payment-complete?event_id=${event_id}&status=failed`;

    // Execute payment
    const executeResult = await executeEventPayment({
      invoiceAmount: amount,
      customerName: user.full_name,
      customerEmail: user.email,
      customerMobile: sanitizeMobileForMyFatoorrah((user.mobile || user.phone || '').trim() || ''),
      invoiceItems: [{
        ItemName: `Event Registration - ${event.title}`,
        Quantity: 1,
        UnitPrice: amount
      }],
      callbackUrl,
      errorUrl,
      referenceId: `EVT-${event_id}-${user_id}`,
      paymentMethodId: payment_method_id,
      logoUrl: process.env.NEXT_PUBLIC_SITE_LOGO_URL
    });

    if (!executeResult.success) {
      return NextResponse.json(
        { success: false, message: executeResult.message || 'Failed to execute payment' },
        { status: 500 }
      );
    }

    // Check if event member already exists
    const { data: currentMember } = await supabase
      .from('event_members')
      .select('id, price_paid, joined_at')
      .eq('event_id', event_id)
      .eq('user_id', user_id)
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let eventMember = currentMember;

    if (currentMember && currentMember.price_paid && parseFloat(currentMember.price_paid) > 0) {
      return NextResponse.json({
        success: true,
        paymentUrl: executeResult.paymentUrl,
        invoiceId: executeResult.invoiceId,
        alreadyPaid: true
      });
    } else if (!currentMember) {
      const eventMemberToken = `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const { data: newMember } = await supabase
        .from('event_members')
        .insert({
          event_id: event_id,
          user_id: user_id,
          token: eventMemberToken,
          is_member: isMember,
          price_paid: 0,
          joined_at: new Date().toISOString()
        })
        .select()
        .single();
      eventMember = newMember;
    }

    return NextResponse.json({
      success: true,
      paymentUrl: executeResult.paymentUrl,
      invoiceId: executeResult.invoiceId,
      isDirectPayment: executeResult.isDirectPayment,
      event_member_id: eventMember?.id
    });

  } catch (error) {
    console.error('[EVENT-EXECUTE-PAYMENT] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to execute payment', error: error.message },
      { status: 500 }
    );
  }
}
