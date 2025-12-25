import { supabase } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      fullNameEng,
      fullNameArb,
      email,
      password,
      mobile,
      cpr,
      gender,
      nationality,
      category,
      workSector,
      employer,
      position,
      specialty,
      address,
      membershipType, // "free" | "paid"
      subscriptionPlanId, // UUID of selected subscription plan
      typeOfApplication,
      membershipDate,
    } = body;

    // --------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------
    if (!fullNameEng || !email || !password || !mobile || !cpr) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // DUPLICATE EMAIL CHECK
    // --------------------------------------------------
    const { data: emailExists } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (emailExists) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // DUPLICATE CPR CHECK
    // --------------------------------------------------
    const { data: cprExists } = await supabase
      .from("member_profiles")
      .select("id")
      .eq("cpr_id", cpr)
      .maybeSingle();

    if (cprExists) {
      return NextResponse.json(
        { success: false, message: "CPR already registered" },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // MEMBERSHIP LOGIC
    // --------------------------------------------------
    // Get subscription plan details if provided
    let subscriptionPlan = null;
    let isPaid = membershipType === "paid";
    let amount = 0;
    let registrationFee = 0;
    let annualFee = 0;

    if (subscriptionPlanId) {
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', subscriptionPlanId)
        .eq('is_active', true)
        .single();

      if (!planError && plan) {
        subscriptionPlan = plan;
        registrationFee = plan.registration_waived ? 0 : (plan.registration_fee || 0);
        annualFee = plan.annual_waived ? 0 : (plan.annual_fee || 0);
        amount = registrationFee + annualFee;
        isPaid = amount > 0;
      }
    } else {
      // Fallback to old logic if no plan ID provided
      amount = isPaid ? 40 : 0;
    }

    const startDate = isPaid
      ? new Date()
      : null;

    const endDate = isPaid
      ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      : null;

    // --------------------------------------------------
    // PASSWORD HASH
    // --------------------------------------------------
    const passwordHash = await bcrypt.hash(password, 10);

    // --------------------------------------------------
    // CREATE USER
    // --------------------------------------------------
    // membership_type must be "free" or "paid" (database constraint)
    // The actual subscription plan name is stored in current_subscription_plan_name
    // IMPORTANT: If payment is required, user status should be "pending" until payment is confirmed
    const membershipTypeValue = isPaid ? "paid" : "free";
    const membershipStatus = isPaid ? "pending" : "active"; // Pending until payment is confirmed
    
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        full_name: fullNameEng,
        full_name_ar: fullNameArb,
        email,
        password_hash: passwordHash,
        phone: mobile,
        mobile: mobile,
        role: "member",
        membership_type: membershipTypeValue,
        current_subscription_plan_id: subscriptionPlan ? subscriptionPlan.id : null,
        current_subscription_plan_name: subscriptionPlan ? subscriptionPlan.display_name : null,
        membership_expiry_date: endDate,
        membership_status: membershipStatus, // "pending" if payment required, "active" if free
      })
      .select()
      .single();

    if (userError) throw userError;

    // --------------------------------------------------
    // CREATE MEMBER PROFILE
    // --------------------------------------------------
    const { error: profileError } = await supabase
      .from("member_profiles")
      .insert({
        user_id: user.id,
        gender,
        nationality,
        category,
        work_sector: workSector,
        employer,
        position,
        specialty,
        address,
        cpr_id: cpr,
        type_of_application: typeOfApplication,
        membership_date: membershipDate || new Date(),
      });

    if (profileError) throw profileError;

    // --------------------------------------------------
    // CREATE SUBSCRIPTION AND PAYMENT RECORDS
    // --------------------------------------------------
    let newSubscription = null;
    let registrationPaymentId = null;
    let annualPaymentId = null;

    if (subscriptionPlan) {
      const { data: subscriptionData, error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          subscription_plan_id: subscriptionPlan.id,
          subscription_plan_name: subscriptionPlan.name,
          status: isPaid ? 'pending_payment' : 'active',
          started_at: startDate ? startDate.toISOString() : new Date().toISOString(),
          expires_at: endDate ? endDate.toISOString() : null,
          registration_paid: subscriptionPlan.registration_waived,
          annual_paid: subscriptionPlan.annual_waived,
          auto_renew: false
        })
        .select()
        .single();

      if (subError) {
        console.error('Error creating subscription:', subError);
        // Continue with registration even if subscription creation fails
      } else {
        newSubscription = subscriptionData;

        if (isPaid && newSubscription) {
          // Create payment records for paid subscriptions
          if (registrationFee > 0) {
            const { data: regPayment, error: regPaymentError } = await supabase
              .from('membership_payments')
              .insert({
                user_id: user.id,
                payment_type: 'subscription_registration',
                subscription_id: newSubscription.id,
                amount: registrationFee,
                currency: 'BHD',
                paid: false,
                reference: `SUB-REG-${newSubscription.id.substring(0, 8).toUpperCase()}`
              })
              .select()
              .single();

            if (regPaymentError) {
              console.error('Error creating registration payment:', regPaymentError);
            } else {
              registrationPaymentId = regPayment.id;
            }
          }

          if (annualFee > 0) {
            const { data: annPayment, error: annPaymentError } = await supabase
              .from('membership_payments')
              .insert({
                user_id: user.id,
                payment_type: 'subscription_annual',
                subscription_id: newSubscription.id,
                amount: annualFee,
                currency: 'BHD',
                paid: false,
                reference: `SUB-ANN-${newSubscription.id.substring(0, 8).toUpperCase()}`
              })
              .select()
              .single();

            if (annPaymentError) {
              console.error('Error creating annual payment:', annPaymentError);
            } else {
              annualPaymentId = annPayment.id;
            }
          }
        }
      }
    } else {
      // Fallback: Create old-style membership payment record
      const { error: paymentError } = await supabase
        .from("membership_payments")
        .insert({
          user_id: user.id,
          payment_type: isPaid ? "paid" : "free",
          amount,
          paid: !isPaid, // FREE auto-approved
          membership_start_date: startDate,
          membership_end_date: endDate,
        });

      if (paymentError) throw paymentError;
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------
    // Get payment IDs if they were created (already set above, but fetch if needed)
    let subscriptionId = null;

    if (subscriptionPlan && isPaid && newSubscription) {
      subscriptionId = newSubscription.id;
      
      // If payment IDs weren't set (e.g., due to errors), try to fetch them
      if (!registrationPaymentId && !annualPaymentId) {
        const { data: payments } = await supabase
          .from('membership_payments')
          .select('id, payment_type')
          .eq('subscription_id', subscriptionId)
          .eq('paid', false);

        if (payments) {
          payments.forEach(payment => {
            if (payment.payment_type === 'subscription_registration') {
              registrationPaymentId = payment.id;
            } else if (payment.payment_type === 'subscription_annual') {
              annualPaymentId = payment.id;
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: {
        user_id: user.id,
        email: user.email,
        membership: isPaid ? "paid" : "free",
        payable_amount: amount,
        membership_valid_till: endDate,
        paymentRequired: isPaid,
        paymentDetails: isPaid ? {
          subscription_id: subscriptionId,
          registration_payment_id: registrationPaymentId,
          annual_payment_id: annualPaymentId,
          registration_fee: registrationFee,
          annual_fee: annualFee,
          total_amount: amount
        } : null
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    );
  }
}
