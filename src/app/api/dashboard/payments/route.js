// app/api/dashboard/payments/route.js
import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;

    // Fetch membership payments
    const { data: membershipPayments, error: membershipError } = await supabase
      .from("membership_payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (membershipError) throw membershipError;

    // Fetch event payments
    const { data: eventPayments, error: eventError } = await supabase
      .from("event_members")
      .select(`
        id,
        price_paid,
        joined_at,
        events (
          title
        )
      `)
      .eq("user_id", userId)
      .gt("price_paid", 0)
      .order("joined_at", { ascending: false });

    if (eventError) throw eventError;

    // Format membership payments
    const formattedMembershipPayments = (membershipPayments || []).map(payment => ({
      id: payment.id,
      payment_type: 'membership',
      amount: payment.amount,
      currency: payment.currency,
      paid: payment.paid,
      paid_at: payment.paid_at,
      status: payment.paid ? 'completed' : payment.status || 'pending',
      reference: payment.reference,
      description: `Membership ${payment.membership_start_date ? 'Renewal' : 'Payment'}`,
      created_at: payment.created_at,
      period: payment.membership_start_date && payment.membership_end_date 
        ? `${new Date(payment.membership_start_date).toLocaleDateString('en-BH', { month: 'short', year: 'numeric' })} - ${new Date(payment.membership_end_date).toLocaleDateString('en-BH', { month: 'short', year: 'numeric' })}`
        : null
    }));

    // Format event payments
    const formattedEventPayments = (eventPayments || []).map(payment => ({
      id: payment.id,
      payment_type: 'event',
      amount: payment.price_paid,
      currency: 'BHD',
      paid: true,
      paid_at: payment.joined_at,
      status: 'completed',
      reference: `EVT-${payment.id.slice(0, 8).toUpperCase()}`,
      description: `Event: ${payment.events?.title || 'Event Registration'}`,
      created_at: payment.joined_at,
      event_title: payment.events?.title
    }));

    // Combine and sort all payments
    const allPayments = [...formattedMembershipPayments, ...formattedEventPayments]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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