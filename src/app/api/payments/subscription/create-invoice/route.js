import { supabase } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { createSubscriptionPaymentInvoice } from '@/lib/myfatoorah';

/**
 * POST /api/payments/subscription/create-invoice
 * Create MyFatoorah invoice for subscription payment
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bds_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;

    const { subscription_id, payment_id, amount, payment_type } = await request.json();

    if (!subscription_id || !payment_id || !amount) {
      return NextResponse.json(
        { success: false, message: 'subscription_id, payment_id, and amount are required' },
        { status: 400 }
      );
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, phone, mobile')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans (*)
      `)
      .eq('id', subscription_id)
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Create payment invoice
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/payments/subscription/callback?payment_id=${payment_id}`;
    const errorUrl = `${baseUrl}/member/dashboard/subscriptions?error=payment_failed`;

    const invoiceItems = [{
      ItemName: payment_type === 'subscription_registration' 
        ? `Registration Fee - ${subscription.subscription_plan.display_name}`
        : payment_type === 'subscription_renewal'
        ? `Renewal Fee - ${subscription.subscription_plan.display_name}`
        : `Annual Fee - ${subscription.subscription_plan.display_name}`,
      Quantity: 1,
      UnitPrice: amount
    }];

    const invoiceResult = await createSubscriptionPaymentInvoice({
      invoiceAmount: amount,
      customerName: user.full_name,
      customerEmail: user.email,
      customerMobile: user.mobile || user.phone || '',
      invoiceItems,
      callbackUrl,
      errorUrl,
      referenceId: payment_id
    });

    if (!invoiceResult.success) {
      return NextResponse.json(
        { success: false, message: invoiceResult.message || 'Failed to create payment invoice' },
        { status: 500 }
      );
    }

    // Update payment record with invoice ID
    await supabase
      .from('membership_payments')
      .update({
        invoice_id: invoiceResult.invoiceId,
        payment_gateway: 'myfatoorah',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment_id);

    return NextResponse.json({
      success: true,
      paymentUrl: invoiceResult.paymentUrl,
      invoiceId: invoiceResult.invoiceId
    });

  } catch (error) {
    console.error('Create subscription invoice error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create payment invoice' },
      { status: 500 }
    );
  }
}

