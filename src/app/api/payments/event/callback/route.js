import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/myfatoorah';
import { redirect } from 'next/navigation';

/**
 * GET /api/payments/event/callback
 * Handle MyFatoorah payment callback for event payments
 */
export async function GET(request) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const userId = searchParams.get('user_id');
    const invoiceId = searchParams.get('paymentId') || searchParams.get('Id');

    console.log('[EVENT-PAYMENT-CALLBACK] Callback received:', {
      event_id: eventId,
      user_id: userId,
      invoice_id: invoiceId,
      allParams: Object.fromEntries(searchParams.entries()),
      timestamp: new Date().toISOString()
    });

    if (!eventId || !userId) {
      console.error('[EVENT-PAYMENT-CALLBACK] Missing required parameters');
      return redirect('/events?error=invalid_callback');
    }

    // Get event member record
    // Handle case where multiple records exist (get the most recent one or the one with payment)
    console.log('[EVENT-PAYMENT-CALLBACK] Fetching event member record:', { event_id: eventId, user_id: userId });
    
    // Fetch all event member records (not using .single() or .maybeSingle() to handle multiple records)
    // Use .limit() to ensure we get an array response, not a single object
    let { data: eventMembers, error: memberError } = await supabase
      .from('event_members')
      .select(`
        *,
        event:events (id, title, is_paid, regular_price, member_price),
        user:users (id, full_name, email, membership_type)
      `)
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(10); // Limit to prevent too many results, but ensures array response
    
    let eventMember = null;
    
    // Ensure eventMembers is always an array
    if (!Array.isArray(eventMembers)) {
      eventMembers = eventMembers ? [eventMembers] : [];
    }
    
    if (memberError) {
      // If error is about multiple rows, that's expected - we'll handle it
      if (memberError.code === 'PGRST116' && memberError.message?.includes('multiple')) {
        console.warn('[EVENT-PAYMENT-CALLBACK] Multiple rows detected, fetching all records:', {
          event_id: eventId,
          user_id: userId
        });
        // Retry without .single() - fetch all records
        const { data: allMembers, error: retryError } = await supabase
          .from('event_members')
          .select(`
            *,
            event:events (id, title, is_paid, regular_price, member_price),
            user:users (id, full_name, email, membership_type)
          `)
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .order('joined_at', { ascending: false })
          .limit(10);
        
        if (retryError) {
          console.error('[EVENT-PAYMENT-CALLBACK] Error fetching event members after retry:', {
            error: retryError,
            event_id: eventId,
            user_id: userId
          });
        } else {
          // Ensure allMembers is an array
          eventMembers = Array.isArray(allMembers) ? allMembers : (allMembers ? [allMembers] : []);
          memberError = null; // Clear error since we got the data
        }
      } else {
        console.error('[EVENT-PAYMENT-CALLBACK] Error fetching event members:', {
          error: memberError,
          event_id: eventId,
          user_id: userId
        });
      }
    }
    
    // Process the results
    if (!memberError && eventMembers && eventMembers.length > 0) {
      // If multiple records exist, prefer the one with payment, otherwise the most recent
      eventMember = eventMembers.find(m => m.price_paid && parseFloat(m.price_paid) > 0) || eventMembers[0];
      
      if (eventMembers.length > 1) {
        console.warn('[EVENT-PAYMENT-CALLBACK] Multiple event member records found, using:', {
          selected_id: eventMember.id,
          total_records: eventMembers.length,
          selected_price_paid: eventMember.price_paid,
          all_ids: eventMembers.map(m => ({ id: m.id, price_paid: m.price_paid, joined_at: m.joined_at }))
        });
      } else {
        console.log('[EVENT-PAYMENT-CALLBACK] Event member found:', {
          event_member_id: eventMember.id,
          price_paid: eventMember.price_paid
        });
      }
    }

    // If event member doesn't exist, create it (payment was successful, so create the record)
    if (!eventMember) {
      console.log('[EVENT-PAYMENT-CALLBACK] Event member not found, creating record after successful payment');
      
      // Get event and user details to create the record
      const { data: event } = await supabase
        .from('events')
        .select('id, title, is_paid, regular_price, member_price')
        .eq('id', eventId)
        .single();
      
      const { data: user } = await supabase
        .from('users')
        .select('id, full_name, email, membership_type')
        .eq('id', userId)
        .single();

      if (event && user) {
        const isMember = user.membership_type === 'paid';
        const eventMemberToken = `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        
        // Create event member record
        const { data: newMember, error: createError } = await supabase
          .from('event_members')
          .insert({
            event_id: eventId,
            user_id: userId,
            token: eventMemberToken,
            is_member: isMember,
            price_paid: 0, // Will be updated below
            joined_at: new Date().toISOString()
          })
          .select(`
            *,
            event:events (id, title, is_paid, regular_price, member_price),
            user:users (id, full_name, email, membership_type)
          `)
          .single();

        if (createError) {
          console.error('[EVENT-PAYMENT-CALLBACK] Error creating event member record:', {
            error: createError,
            event_id: eventId,
            user_id: userId
          });
          return redirect('/events?error=payment_record_creation_failed');
        }

        eventMember = newMember;
        console.log('[EVENT-PAYMENT-CALLBACK] Event member record created:', {
          event_member_id: eventMember.id,
          event_id: eventId
        });
      } else {
        console.error('[EVENT-PAYMENT-CALLBACK] Could not fetch event or user to create member record:', {
          event_found: !!event,
          user_found: !!user,
          event_id: eventId,
          user_id: userId
        });
        return redirect('/events?error=payment_not_found');
      }
    }
    
    // If we still don't have an event member, redirect with error
    if (!eventMember) {
      console.error('[EVENT-PAYMENT-CALLBACK] Event member not found and could not be created:', {
        event_id: eventId,
        user_id: userId,
        memberError: memberError
      });
      return redirect('/events?error=payment_not_found');
    }

    console.log('[EVENT-PAYMENT-CALLBACK] Event member found:', {
      event_member_id: eventMember.id,
      event_id: eventMember.event_id,
      user_id: eventMember.user_id,
      price_paid: eventMember.price_paid
    });

    // Check if payment is already confirmed (price_paid > 0)
    if (eventMember.price_paid && parseFloat(eventMember.price_paid) > 0) {
      console.log('[EVENT-PAYMENT-CALLBACK] Payment already confirmed:', {
        event_member_id: eventMember.id,
        price_paid: eventMember.price_paid,
        event_id: eventId
      });
      // Payment already confirmed, redirect to success
      return redirect(`/events?success=payment_completed&event=${encodeURIComponent(eventMember.event?.title || 'Event')}`);
    }

    // Get invoice ID from URL parameter
    let invoiceIdToCheck = invoiceId;

    if (!invoiceIdToCheck) {
      console.error('[EVENT-PAYMENT-CALLBACK] No invoice ID found in callback URL');
      // If no invoice ID but callback was triggered, check if we can still verify payment
      // by checking if event member exists and payment might have been processed
      if (eventMember) {
        console.warn('[EVENT-PAYMENT-CALLBACK] No invoice ID but event member exists, checking if payment was already processed');
        // If price_paid is still 0, we can't verify, so show error
        if (!eventMember.price_paid || parseFloat(eventMember.price_paid) === 0) {
          return redirect('/events?error=payment_verification_failed');
        }
      } else {
        return redirect('/events?error=invalid_callback');
      }
    }

    console.log('[EVENT-PAYMENT-CALLBACK] Checking payment status with MyFatoorah:', {
      invoice_id: invoiceIdToCheck,
      event_id: eventId
    });

    // Check payment status with MyFatoorah
    // The InvoiceId from ExecutePayment response is the numeric ID (e.g., 6392538)
    // But the callback URL might have a different format (e.g., 07076392538322682974)
    // Try multiple approaches to verify payment
    
    let statusResult = null;
    
    // First, try as InvoiceId (the numeric ID from ExecutePayment)
    // Extract numeric part if it's in a longer format
    const numericInvoiceId = invoiceIdToCheck.replace(/^0+/, ''); // Remove leading zeros
    if (numericInvoiceId && numericInvoiceId.length <= 10) {
      console.log('[EVENT-PAYMENT-CALLBACK] Trying InvoiceId format (numeric):', numericInvoiceId);
      statusResult = await getPaymentStatus(numericInvoiceId, false, 'InvoiceId');
    }
    
    // If that fails, try the original ID as InvoiceId
    if (!statusResult || !statusResult.success) {
      console.log('[EVENT-PAYMENT-CALLBACK] Trying InvoiceId format (original):', invoiceIdToCheck);
      statusResult = await getPaymentStatus(invoiceIdToCheck, false, 'InvoiceId');
    }
    
    // If that fails, try as PaymentId (the longer ID from callback URL)
    if (!statusResult || !statusResult.success) {
      if (invoiceIdToCheck && invoiceIdToCheck.length > 10) {
        console.log('[EVENT-PAYMENT-CALLBACK] Trying PaymentId format:', invoiceIdToCheck);
        statusResult = await getPaymentStatus(invoiceIdToCheck, false, 'PaymentId');
      }
    }

    // Also try to get the InvoiceId from ExecutePayment if we can find it
    // The InvoiceId from ExecutePayment is stored in the response, but we need to track it
    // For now, we'll use the ID from the callback URL

    console.log('[EVENT-PAYMENT-CALLBACK] Payment status result:', {
      success: statusResult?.success,
      status: statusResult?.status,
      message: statusResult?.message,
      invoice_id: invoiceIdToCheck,
      fullResult: statusResult
    });

    // Check if payment is confirmed as paid
    const isPaid = statusResult && statusResult.success && (
      statusResult.status === 'Paid' || 
      statusResult.status === 'paid' ||
      statusResult.status === 'PAID'
    );

    // If payment status check failed, but callback was triggered by MyFatoorah,
    // MyFatoorah typically only triggers callbacks for processed payments
    // However, we should verify payment status before updating
    if (!statusResult || !statusResult.success) {
      console.warn('[EVENT-PAYMENT-CALLBACK] Payment status check failed, but callback was triggered:', {
        statusResult,
        invoice_id: invoiceIdToCheck,
        event_id: eventId,
        note: 'MyFatoorah callback was triggered. Payment status verification failed, but callback suggests payment may have been processed.'
      });
      
      // If status check completely failed, we can't verify payment
      // Don't update the record without verification
      // User should contact support if payment was deducted
    }

    if (isPaid) {
      console.log('[EVENT-PAYMENT-CALLBACK] Payment confirmed as paid, updating event member record');

      // Calculate price - get from event data
      const isMember = eventMember.user?.membership_type === 'paid';
      let amount = 0;
      
      if (eventMember.event) {
        if (eventMember.event.is_paid) {
          amount = isMember 
            ? (eventMember.event.member_price ?? eventMember.event.regular_price ?? 0)
            : (eventMember.event.regular_price ?? 0);
        }
      }

      // If amount is 0, try to get from existing price_paid or calculate from event
      if (amount === 0 && eventMember.price_paid) {
        amount = parseFloat(eventMember.price_paid) || 0;
      }

      if (amount === 0) {
        console.error('[EVENT-PAYMENT-CALLBACK] Cannot determine payment amount:', {
          event_member_id: eventMember.id,
          event_data: eventMember.event,
          user_data: eventMember.user
        });
        // Still update with a minimal amount to confirm payment
        amount = eventMember.event?.regular_price || 0;
      }

      console.log('[EVENT-PAYMENT-CALLBACK] Updating event member with payment amount:', {
        event_member_id: eventMember.id,
        amount: amount,
        is_member: isMember,
        event_regular_price: eventMember.event?.regular_price,
        event_member_price: eventMember.event?.member_price
      });

      // Update event member record
      // Update price_paid to confirm payment (this is the main indicator)
      // price_paid > 0 means payment is confirmed
      const updateData = {
        price_paid: amount
      };

      const { error: updateError } = await supabase
        .from('event_members')
        .update(updateData)
        .eq('id', eventMember.id);

      if (updateError) {
        console.error('[EVENT-PAYMENT-CALLBACK] Error updating event member:', {
          error: updateError,
          code: updateError.code,
          message: updateError.message,
          event_member_id: eventMember.id,
          updateData
        });
        return redirect('/events?error=payment_update_failed');
      }

      // Verify the update was successful
      const { data: updatedMember } = await supabase
        .from('event_members')
        .select('price_paid')
        .eq('id', eventMember.id)
        .single();

      console.log('[EVENT-PAYMENT-CALLBACK] Event member updated successfully:', {
        event_member_id: eventMember.id,
        price_paid: updatedMember?.price_paid || amount,
        verified: updatedMember?.price_paid > 0,
        duration_ms: Date.now() - startTime
      });

      // Redirect to events page with success message
      return redirect(`/events?success=payment_completed&event=${encodeURIComponent(eventMember.event?.title || 'Event')}`);
    } else {
      // Payment status check failed or payment not confirmed
      // Check if payment might have been processed anyway (callback was triggered)
      console.warn('[EVENT-PAYMENT-CALLBACK] Payment not confirmed as paid:', {
        success: statusResult.success,
        status: statusResult.status,
        message: statusResult.message,
        invoice_id: invoiceIdToCheck,
        event_id: eventId,
        current_price_paid: eventMember.price_paid
      });
      
      // If we have an invoice ID and callback was triggered, but status check failed,
      // it could mean:
      // 1. Payment is still processing
      // 2. Payment failed
      // 3. Status check API is having issues
      
      // Check if payment was already processed (price_paid > 0)
      if (eventMember.price_paid && parseFloat(eventMember.price_paid) > 0) {
        console.log('[EVENT-PAYMENT-CALLBACK] Payment already confirmed in database, redirecting to success');
        return redirect(`/events?success=payment_completed&event=${encodeURIComponent(eventMember.event?.title || 'Event')}`);
      }
      
      // Payment failed or could not be verified
      return redirect('/events?error=payment_failed&message=Payment could not be verified. Please contact support if payment was deducted.');
    }
  } catch (error) {
    // Next.js redirect() throws a NEXT_REDIRECT error internally - this is expected behavior
    if (error.message === 'NEXT_REDIRECT' || error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors so Next.js can handle them
    }

    const duration = Date.now() - startTime;
    console.error('[EVENT-PAYMENT-CALLBACK] Unexpected error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });
    
    return redirect('/events?error=payment_error');
  }
}

