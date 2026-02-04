import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;
    const { id } = await params;

    let paymentData = null;

    // Membership payment
    const { data: membership } = await supabase
      .from("membership_payments")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (membership) {
      paymentData = {
        type: "membership",
        reference: `MEM-${membership.id.slice(0, 8).toUpperCase()}`,
        description: "Membership Payment",
        amount: membership.amount,
        paid_at: membership.created_at,
        period: {
          start: membership.membership_start_date,
          end: membership.membership_end_date,
        },
      };
    } else {
      // Event payment
      const { data: event } = await supabase
        .from("event_members")
        .select(`id, price_paid, joined_at, events(title)`)
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (event) {
        paymentData = {
          type: "event",
          reference: `EVT-${event.id.slice(0, 8).toUpperCase()}`,
          description: `Event: ${event.events?.title}`,
          amount: event.price_paid,
          paid_at: event.joined_at,
        };
      }
    }

    if (!paymentData) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("full_name, email, membership_code, membership_type, membership_status, membership_expiry_date")
      .eq("id", userId)
      .single();

    return NextResponse.json({
      success: true,
      receipt: {
        ...paymentData,
        user,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
