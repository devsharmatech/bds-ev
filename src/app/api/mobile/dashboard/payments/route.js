// app/api/dashboard/payments/route.js
import { supabase } from "@/lib/supabaseAdmin";
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";
import { NextResponse } from "next/server";
export async function GET(req) {
  try {
    const decoded = verifyTokenMobile(req);
    const userId = decoded.user_id;

    // Fetch all records directly from payment_history
    const { data: histPayments, error: histError } = await supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (histError) throw histError;

    // Format payments for the dashboard timeline
    const allPayments = (histPayments || []).map(payment => {
      const isEvent = payment.payment_for === 'event_registration';
      const isMembership = !isEvent;

      return {
        id: payment.id,
        payment_type: isEvent ? 'event' : 'membership',
        amount: payment.amount,
        currency: payment.currency || 'BHD',
        paid: payment.status === 'completed',
        paid_at: payment.status === 'completed' ? payment.created_at : null,
        status: payment.status,
        reference: payment.invoice_id || `${isEvent ? 'EVT' : 'MEM'}-${String(payment.id).slice(0, 8).toUpperCase()}`,
        description: isEvent
          ? `Event: ${payment.details?.event_title || 'Registration'}`
          : `Membership ${payment.payment_for ? payment.payment_for.replace(/_/g, " ") : ''}`,
        created_at: payment.created_at,
        event_title: isEvent ? payment.details?.event_title : undefined,
        period: isMembership && payment.details?.plan_name ? payment.details.plan_name : null
      };
    });

    return NextResponse.json({
      success: true,
      payments: allPayments,
      count: allPayments.length
    });

  } catch (error) {
    console.error("PAYMENTS API ERROR:", error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}