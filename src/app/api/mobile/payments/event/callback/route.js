import { supabase } from '@/lib/supabaseAdmin';
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";
import { NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/myfatoorah';
import { sendEventJoinEmail } from '@/lib/email';
import { getUserEventPrice, getUserPricingCategory } from '@/lib/eventPricing';

/**
 * POST /api/mobile/payments/event/callback
 * Handle MyFatoorah payment callback for mobile event payments
 * Returns JSON responses (not redirects) for mobile clients
 *
 * Body: { event_id, invoice_id }
 */
export async function POST(request) {
  const startTime = Date.now();

  try {
    // Verify authentication
    let decoded;
    try {
      decoded = verifyTokenMobile(request);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error.message || 'Authentication required' },
        { status: 401 }
      );
    }
    const tokenUserId = decoded.user_id;

    const body = await request.json();
    const eventId = body.event_id || body.eventId;
    const invoiceId = body.invoice_id || body.invoiceId || body.paymentId;

    console.log('[MOBILE-EVENT-CALLBACK] Callback received:', {
      event_id: eventId,
      user_id: tokenUserId,
      invoice_id: invoiceId,
      timestamp: new Date().toISOString()
    });

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: 'event_id is required' },
        { status: 400 }
      );
    }

    // Get event member record
    let { data: eventMembers, error: memberError } = await supabase
      .from('event_members')
      .select(`
        *,
        event:events (
          id, title, is_paid, start_datetime, venue_name, early_bird_deadline,
          regular_price, regular_standard_price, regular_onsite_price,
          member_price, member_standard_price, member_onsite_price,
          student_price, student_standard_price, student_onsite_price,
          hygienist_price, hygienist_standard_price, hygienist_onsite_price
        ),
        user:users (
          id, full_name, email, membership_type, membership_status, membership_expiry_date,
          member_profiles!member_profiles_user_id_fkey(category, position, specialty)
        )
      `)
      .eq('event_id', eventId)
      .eq('user_id', tokenUserId)
      .order('joined_at', { ascending: false })
      .limit(10);

    if (!Array.isArray(eventMembers)) {
      eventMembers = eventMembers ? [eventMembers] : [];
    }

    let eventMember = null;

    if (!memberError && eventMembers && eventMembers.length > 0) {
      eventMember = eventMembers.find(m => m.price_paid && parseFloat(m.price_paid) > 0) || eventMembers[0];

      if (eventMembers.length > 1) {
        console.warn('[MOBILE-EVENT-CALLBACK] Multiple event member records found, using:', {
          selected_id: eventMember.id,
          total_records: eventMembers.length
        });
      }
    }

    // If event member doesn't exist, create it
    if (!eventMember) {
      console.log('[MOBILE-EVENT-CALLBACK] Event member not found, creating record');

      const { data: event } = await supabase
        .from('events')
        .select(`
          id, title, is_paid, start_datetime, venue_name, early_bird_deadline,
          regular_price, regular_standard_price, regular_onsite_price,
          member_price, member_standard_price, member_onsite_price,
          student_price, student_standard_price, student_onsite_price,
          hygienist_price, hygienist_standard_price, hygienist_onsite_price
        `)
        .eq('id', eventId)
        .single();

      const { data: user } = await supabase
        .from('users')
        .select(`
          id, full_name, email, membership_type, membership_status, membership_expiry_date,
          member_profiles!member_profiles_user_id_fkey(category, position, specialty)
        `)
        .eq('id', tokenUserId)
        .single();

      if (event && user) {
        if (user.member_profiles) {
          user.category = user.member_profiles.category;
          user.position = user.member_profiles.position;
          user.specialty = user.member_profiles.specialty;
        }

        const now = new Date();
        const membershipValid = user && user.membership_type === 'paid' && user.membership_status === 'active' && (!user.membership_expiry_date || new Date(user.membership_expiry_date) > now);
        const isMember = membershipValid;
        const eventMemberToken = `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        const registration_category = getUserPricingCategory(user);

        const { data: newMember, error: createError } = await supabase
          .from('event_members')
          .insert({
            event_id: eventId,
            user_id: tokenUserId,
            token: eventMemberToken,
            is_member: isMember,
            price_paid: 0,
            joined_at: new Date().toISOString(),
            registration_category,
            payment_status: "pending"
          })
          .select(`
            *,
            event:events (
              id, title, is_paid, start_datetime, venue_name, early_bird_deadline,
              regular_price, regular_standard_price, regular_onsite_price,
              member_price, member_standard_price, member_onsite_price,
              student_price, student_standard_price, student_onsite_price,
              hygienist_price, hygienist_standard_price, hygienist_onsite_price
            ),
            user:users (
              id, full_name, email, membership_type, membership_status, membership_expiry_date,
              member_profiles!member_profiles_user_id_fkey(category, position, specialty)
            )
          `)
          .single();

        if (createError) {
          console.error('[MOBILE-EVENT-CALLBACK] Error creating event member:', createError);
          return NextResponse.json(
            { success: false, message: 'Failed to create event member record' },
            { status: 500 }
          );
        }

        eventMember = newMember;
      } else {
        return NextResponse.json(
          { success: false, message: 'Event or user not found' },
          { status: 404 }
        );
      }
    }

    // Check if payment is already confirmed
    if (eventMember.price_paid && parseFloat(eventMember.price_paid) > 0) {
      return NextResponse.json({
        success: true,
        message: 'Payment already confirmed',
        payment_status: 'paid',
        already_confirmed: true,
        event_member_id: eventMember.id,
        event_title: eventMember.event?.title
      });
    }

    // Verify payment with MyFatoorah
    let invoiceIdToCheck = invoiceId;

    if (!invoiceIdToCheck) {
      return NextResponse.json(
        { success: false, message: 'invoice_id is required to verify payment' },
        { status: 400 }
      );
    }

    console.log('[MOBILE-EVENT-CALLBACK] Checking payment status:', {
      invoice_id: invoiceIdToCheck,
      event_id: eventId
    });

    let statusResult = null;

    // Try as InvoiceId first
    const numericInvoiceId = invoiceIdToCheck.replace(/^0+/, '');
    if (numericInvoiceId && numericInvoiceId.length <= 10) {
      statusResult = await getPaymentStatus(numericInvoiceId, false, 'InvoiceId');
    }

    if (!statusResult || !statusResult.success) {
      statusResult = await getPaymentStatus(invoiceIdToCheck, false, 'InvoiceId');
    }

    if (!statusResult || !statusResult.success) {
      if (invoiceIdToCheck && invoiceIdToCheck.length > 10) {
        statusResult = await getPaymentStatus(invoiceIdToCheck, false, 'PaymentId');
      }
    }

    console.log('[MOBILE-EVENT-CALLBACK] Payment status result:', {
      success: statusResult?.success,
      status: statusResult?.status,
      invoice_id: invoiceIdToCheck
    });

    const isPaid = statusResult && statusResult.success && (
      statusResult.status === 'Paid' ||
      statusResult.status === 'paid' ||
      statusResult.status === 'PAID'
    );

    if (isPaid) {
      console.log('[MOBILE-EVENT-CALLBACK] Payment confirmed as paid');

      // Determine amount
      let amount = 0;
      let usedDiscountedAmount = false;

      const { data: latestUsage } = await supabase
        .from('event_coupon_usages')
        .select('id, amount_before, discount_amount, amount_after')
        .eq('event_id', eventId)
        .eq('user_id', eventMember.user_id)
        .is('event_member_id', null)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestUsage && latestUsage.amount_after != null) {
        amount = Number(latestUsage.amount_after) || 0;
        usedDiscountedAmount = true;
      }

      if (amount === 0 && eventMember.event && eventMember.event.is_paid && eventMember.user) {
        const userForPricing = { ...eventMember.user };
        if (userForPricing.member_profiles) {
          userForPricing.category = userForPricing.member_profiles.category;
          userForPricing.position = userForPricing.member_profiles.position;
          userForPricing.specialty = userForPricing.member_profiles.specialty;
        }

        const priceInfo = getUserEventPrice(eventMember.event, userForPricing);
        amount = priceInfo.price;
      }

      if (amount === 0 && eventMember.price_paid) {
        amount = parseFloat(eventMember.price_paid) || 0;
      }

      if (amount === 0) {
        amount = eventMember.event?.regular_price || 0;
      }

      // Update event member record
      const updateData = {
        price_paid: amount,
        payment_status: "completed"
      };

      const { error: updateError } = await supabase
        .from('event_members')
        .update(updateData)
        .eq('id', eventMember.id);

      if (updateError) {
        console.error('[MOBILE-EVENT-CALLBACK] Error updating event member:', updateError);
        return NextResponse.json(
          { success: false, message: 'Payment verified but failed to update record', payment_status: 'paid' },
          { status: 500 }
        );
      }

      // Log payment history
      try {
        await supabase.from('payment_history').insert({
          user_id: eventMember.user_id,
          payment_id: invoiceIdToCheck,
          invoice_id: invoiceIdToCheck,
          amount: amount,
          currency: 'BHD',
          status: 'completed',
          payment_for: 'event_registration',
          details: {
            type: 'event',
            source: 'mobile',
            event_id: eventId,
            event_member_id: eventMember.id,
            event_title: eventMember.event?.title || null,
            user_name: eventMember.user?.full_name || null,
            user_email: eventMember.user?.email || null
          }
        });
      } catch (historyError) {
        console.error('[MOBILE-EVENT-CALLBACK] Failed to log payment_history:', historyError);
      }

      // Update coupon usage records
      try {
        const { data: provisionalUsages } = await supabase
          .from('event_coupon_usages')
          .select('id, coupon_id, discount_amount')
          .eq('event_id', eventId)
          .eq('user_id', eventMember.user_id)
          .is('event_member_id', null);

        if (Array.isArray(provisionalUsages) && provisionalUsages.length > 0) {
          const usageIds = provisionalUsages.map((u) => u.id);

          await supabase
            .from('event_coupon_usages')
            .update({
              event_member_id: eventMember.id,
              payment_id: invoiceIdToCheck,
              invoice_id: invoiceIdToCheck,
              metadata: { stage: 'paid' },
            })
            .in('id', usageIds);

          for (const u of provisionalUsages) {
            await supabase.rpc('increment_event_coupon_used_count', {
              coupon_row_id: u.coupon_id,
            });
          }
        }
      } catch (couponErr) {
        console.error('[MOBILE-EVENT-CALLBACK] Failed to finalize coupon usage:', couponErr);
      }

      // Send event join confirmation email
      try {
        if (eventMember.user?.email) {
          await sendEventJoinEmail(eventMember.user.email, {
            name: eventMember.user.full_name || 'Member',
            event_name: eventMember.event?.title || 'Event',
            event_date: eventMember.event?.start_datetime
              ? new Date(eventMember.event.start_datetime).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Bahrain'
              })
              : null,
            event_location: eventMember.event?.venue_name || null,
            event_code: eventMember.token,
            price_paid: amount
          });
        }
      } catch (emailError) {
        console.error('[MOBILE-EVENT-CALLBACK] Failed to send email:', emailError);
      }

      // Return JSON success response
      return NextResponse.json({
        success: true,
        message: 'Event payment confirmed successfully',
        payment_status: 'paid',
        event_member_id: eventMember.id,
        event_id: eventId,
        event_title: eventMember.event?.title,
        amount_paid: amount,
        token: eventMember.token
      });
    } else {
      // Payment not confirmed
      console.warn('[MOBILE-EVENT-CALLBACK] Payment not confirmed:', {
        status: statusResult?.status,
        invoice_id: invoiceIdToCheck
      });

      // Log failed payment
      try {
        await supabase.from('payment_history').insert({
          user_id: tokenUserId,
          payment_id: invoiceIdToCheck,
          invoice_id: invoiceIdToCheck,
          amount: 0,
          currency: 'BHD',
          status: 'failed',
          payment_for: 'event_registration',
          details: {
            type: 'event',
            source: 'mobile',
            event_id: eventId,
            event_member_id: eventMember?.id || null,
            event_title: eventMember?.event?.title || null
          },
          error_message: statusResult?.message || 'Payment not confirmed as paid'
        });
      } catch (historyError) {
        console.error('[MOBILE-EVENT-CALLBACK] Failed to log failed payment:', historyError);
      }

      return NextResponse.json({
        success: false,
        message: 'Payment not completed',
        payment_status: statusResult?.status || 'unknown',
        event_id: eventId
      });
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const duration = Date.now() - startTime;
    console.error('[MOBILE-EVENT-CALLBACK] Unexpected error:', {
      error: { name: error.name, message: error.message, stack: error.stack },
      duration_ms: duration
    });

    return NextResponse.json(
      { success: false, message: 'Payment callback processing failed', error: error.message },
      { status: 500 }
    );
  }
}
