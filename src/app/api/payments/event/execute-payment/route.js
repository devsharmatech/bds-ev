import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { executeEventPayment } from '@/lib/myfatoorah';
import { getUserEventPrice } from '@/lib/eventPricing';

// Local sanitizer to conform to MyFatoorah CustomerMobile constraints
// - digits only
// - remove leading '973' (Bahrain country code) if present
// - max 11 digits (keep last 11 if longer)
// - return '' if too short/invalid
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
    const { event_id, user_id, payment_method_id } = requestData;

    console.log('[EVENT-EXECUTE-PAYMENT] Request received:', {
      event_id,
      user_id,
      payment_method_id,
      timestamp: new Date().toISOString()
    });

    if (!event_id || !user_id || !payment_method_id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'event_id, user_id, and payment_method_id are required'
        },
        { status: 400 }
      );
    }

    // Verify authentication
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
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Verify user matches
    if (decoded.user_id !== user_id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get event details - include all pricing fields for category-based pricing
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
      console.error('[EVENT-EXECUTE-PAYMENT] Event not found or not paid:', { event_id, error: eventError });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Event not found or does not require payment'
        },
        { status: 404 }
      );
    }

    // Get user details - include category and position for pricing
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id, full_name, email, phone, mobile, membership_type, membership_status, membership_expiry_date,
        member_profiles!member_profiles_user_id_fkey(category, position, specialty)
      `)
      .eq('id', user_id)
      .single();

    // Flatten category and position from member_profiles
    if (user && user.member_profiles) {
      user.category = user.member_profiles.category;
      user.position = user.member_profiles.position;
      user.specialty = user.member_profiles.specialty;
    }

    if (userError || !user) {
      console.error('[EVENT-EXECUTE-PAYMENT] User not found:', { user_id, error: userError });
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found'
        },
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
        { 
          success: false, 
          message: 'You have already paid for this event'
        },
        { status: 409 }
      );
    }

    // Determine amount to charge
    // Prefer any provisional coupon usage created at invoice step (discounted amount_after)
    // Fallback to base price from pricing utility if no coupon usage found
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
      console.log('[EVENT-EXECUTE-PAYMENT] Using discounted amount from coupon usage:', {
        amount_before: provisionalUsage.amount_before,
        discount_amount: provisionalUsage.discount_amount,
        amount_after: provisionalUsage.amount_after,
      });
    } else {
      // Calculate price using the pricing utility
      // This handles member type, category (student, hygienist), and pricing tier (early bird, standard, onsite)
      priceInfo = getUserEventPrice(event, user);
      amount = priceInfo.price;
    }
    
    // Determine if user is a BDS member based on pricing category and active membership
    const now = new Date();
    const membershipValid = user && user.membership_type === 'paid' && user.membership_status === 'active' && (!user.membership_expiry_date || new Date(user.membership_expiry_date) > now);
    const isMember = (priceInfo && priceInfo.category === 'member') || membershipValid;

    console.log('[EVENT-EXECUTE-PAYMENT] Price calculated for execute-payment:', {
      user_category: priceInfo?.category,
      pricing_tier: priceInfo?.tier,
      amount,
      user_membership_type: user.membership_type,
      user_profile_category: user.category,
      isMember,
      used_discounted_amount: !!provisionalUsage,
    });

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Event price is not set for your category'
        },
        { status: 400 }
      );
    }

    // Get base URL
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    
    if (!baseUrl || baseUrl.includes('localhost')) {
      const origin = request.headers.get('origin') || request.headers.get('host');
      if (origin) {
        if (origin.startsWith('http')) {
          baseUrl = origin;
        } else {
          const protocol = request.headers.get('x-forwarded-proto') || 'https';
          baseUrl = `${protocol}://${origin}`;
        }
      } else {
        baseUrl = 'https://bds-ev.vercel.app';
      }
    }
    
    baseUrl = baseUrl.replace(/\/$/, '');
    
    const callbackUrl = `${baseUrl}/api/payments/event/callback?event_id=${event_id}&user_id=${user_id}`;
    const errorUrl = `${baseUrl}/events?error=payment_failed`;

    // Create invoice items
    const invoiceItems = [{
      ItemName: `Event Registration - ${event.title}`,
      Quantity: 1,
      UnitPrice: amount
    }];

    const rawMobile = (user.mobile || user.phone || '').trim() || '';
    const customerMobile = sanitizeMobileForMyFatoorrah(rawMobile);

    console.log('[EVENT-EXECUTE-PAYMENT] Calling MyFatoorah ExecutePayment:', {
      invoiceAmount: amount,
      paymentMethodId: payment_method_id,
      customerName: user.full_name,
      customerEmail: user.email,
      event_id
    });

    // Execute payment with selected method
    const executeResult = await executeEventPayment({
      invoiceAmount: amount,
      customerName: user.full_name,
      customerEmail: user.email,
      customerMobile: customerMobile,
      invoiceItems,
      callbackUrl,
      errorUrl,
      referenceId: `EVT-${event_id}-${user_id}`,
      paymentMethodId: payment_method_id,
      logoUrl: process.env.NEXT_PUBLIC_SITE_LOGO_URL
    });

    if (!executeResult.success) {
      console.error('[EVENT-EXECUTE-PAYMENT] MyFatoorah ExecutePayment failed:', {
        error: executeResult.message,
        event_id,
        payment_method_id
      });
      return NextResponse.json(
        { 
          success: false, 
          message: executeResult.message || 'Failed to execute payment',
          error: executeResult.error || executeResult.message
        },
        { status: 500 }
      );
    }

    console.log('[EVENT-EXECUTE-PAYMENT] MyFatoorah ExecutePayment successful:', {
      invoiceId: executeResult.invoiceId,
      paymentUrl: executeResult.paymentUrl ? '***' : null,
      event_id
    });

    // Check if event member already exists (in case payment was completed in another request)
    // Re-check since the first check was before payment execution
    // Handle multiple records by getting the most recent or the one with payment
    const { data: currentMembers } = await supabase
      .from('event_members')
      .select('id, price_paid, joined_at')
      .eq('event_id', event_id)
      .eq('user_id', user_id)
      .order('joined_at', { ascending: false });

    // Declare eventMember outside the if/else block so it's accessible later
    let eventMember = null;
    let currentMember = null;
    
    if (currentMembers && currentMembers.length > 0) {
      // Prefer the one with payment, otherwise the most recent
      currentMember = currentMembers.find(m => m.price_paid && parseFloat(m.price_paid) > 0) || currentMembers[0];
      eventMember = currentMember;
      
      if (currentMembers.length > 1) {
        console.warn('[EVENT-EXECUTE-PAYMENT] Multiple event member records found:', {
          total_records: currentMembers.length,
          selected_id: currentMember.id,
          all_ids: currentMembers.map(m => ({ id: m.id, price_paid: m.price_paid }))
        });
      }
    }

    // If member exists and already paid, don't create duplicate
    if (currentMember && currentMember.price_paid && parseFloat(currentMember.price_paid) > 0) {
      console.log('[EVENT-EXECUTE-PAYMENT] Event member already exists and paid:', {
        event_member_id: currentMember.id,
        price_paid: currentMember.price_paid
      });
      // Return payment URL even if already paid (user might be retrying)
      return NextResponse.json({
        success: true,
        paymentUrl: executeResult.paymentUrl,
        invoiceId: executeResult.invoiceId,
        alreadyPaid: true
      });
    } else if (currentMember) {
      // Member exists but not paid yet - don't create duplicate, just use existing record
      console.log('[EVENT-EXECUTE-PAYMENT] Event member already exists (unpaid), using existing record:', {
        event_member_id: currentMember.id,
        price_paid: currentMember.price_paid
      });
      eventMember = currentMember;
    } else {
      // Create pending event member record (will be confirmed in callback)
      // Note: We create this with price_paid = 0, and callback will update it after payment confirmation
      const eventMemberToken = `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      // Build insert data with only columns that exist in the schema
      const insertData = {
        event_id: event_id,
        user_id: user_id,
        token: eventMemberToken,
        is_member: isMember,
        price_paid: 0, // Will be updated after payment confirmation
        joined_at: new Date().toISOString()
      };
      
      // Try to insert event member record
      // If it fails (e.g., duplicate), callback will handle it
      const { data: newEventMember, error: memberError } = await supabase
        .from('event_members')
        .insert(insertData)
        .select()
        .single();

      if (memberError) {
        // Check if it's a duplicate key error (user already has a record)
        if (memberError.code === '23505' || memberError.message?.includes('duplicate') || memberError.message?.includes('unique')) {
          console.log('[EVENT-EXECUTE-PAYMENT] Event member already exists (duplicate), using existing record:', {
            event_id,
            user_id
          });
          // Use the currentMember we already found, or fetch it again
          if (!eventMember && currentMember) {
            eventMember = currentMember;
          } else if (!eventMember) {
            // Fetch the most recent one
            const { data: existingRecords } = await supabase
              .from('event_members')
              .select('id')
              .eq('event_id', event_id)
              .eq('user_id', user_id)
              .order('joined_at', { ascending: false })
              .limit(1);
            if (existingRecords && existingRecords.length > 0) {
              eventMember = existingRecords[0];
            }
          }
        } else {
          console.warn('[EVENT-EXECUTE-PAYMENT] Could not create event member record (will be created/updated in callback):', {
            error: memberError,
            event_id,
            note: 'Payment was executed successfully, callback will create/update the record'
          });
        }
        // Don't fail the request, payment was executed successfully
        // The callback will create/update the record when payment is confirmed
      } else {
        eventMember = newEventMember;
        console.log('[EVENT-EXECUTE-PAYMENT] Event member record created:', {
          event_member_id: eventMember?.id,
          event_id
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log('[EVENT-EXECUTE-PAYMENT] Request completed successfully:', {
      event_id,
      invoice_id: executeResult.invoiceId,
      duration_ms: duration
    });

    return NextResponse.json({
      success: true,
      paymentUrl: executeResult.paymentUrl,
      invoiceId: executeResult.invoiceId,
      isDirectPayment: executeResult.isDirectPayment,
      event_member_id: eventMember?.id
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[EVENT-EXECUTE-PAYMENT] Unexpected error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      requestData,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to execute payment',
        error: {
          name: error.name,
          message: error.message,
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
      },
      { status: 500 }
    );
  }
}

