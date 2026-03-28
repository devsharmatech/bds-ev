// app/api/mobile/payments/confirm/route.js
// Unified payment confirmation API for mobile – verifies payment status with MyFatoorah
import { supabase } from "@/lib/supabaseAdmin";
import { verifyTokenMobile } from "@/lib/verifyTokenMobile";
import { NextResponse } from "next/server";

/**
 * POST /api/mobile/payments/confirm
 *
 * After MyFatoorah redirects or notifies the mobile app that payment is done,
 * the mobile app calls this endpoint with the paymentId to confirm the payment.
 *
 * Body: { paymentId: string, type: "event" | "subscription" }
 *
 * This endpoint:
 * 1. Calls MyFatoorah GetPaymentStatus to verify the payment
 * 2. Updates the corresponding records (event_members or membership_payments)
 * 3. Returns the confirmed status to the mobile app
 */
export async function POST(request) {
  try {
    const decoded = verifyTokenMobile(request);
    const userId = decoded.user_id;

    const body = await request.json();
    const { paymentId, type } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: "paymentId is required" },
        { status: 400 }
      );
    }

    if (!type || !["event", "subscription"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'type is required and must be "event" or "subscription"',
        },
        { status: 400 }
      );
    }

    // Import MyFatoorah helper dynamically
    const { getPaymentStatus } = await import("@/lib/myfatoorah");

    // Auto-detect KeyType based on paymentId format:
    // - InvoiceId is short numeric (e.g., "6392538")
    // - PaymentId is long numeric (e.g., "07076614069339404373")
    const isSubscriptionType = type === "subscription";
    const keyType = String(paymentId).length > 15 ? "PaymentId" : "InvoiceId";

    // Verify payment with MyFatoorah
    console.log("[MOBILE-PAYMENT-CONFIRM] Verifying payment:", {
      paymentId,
      type,
      userId,
      keyType,
    });

    let paymentStatus = await getPaymentStatus(paymentId, isSubscriptionType, keyType);

    // If first attempt fails, try the other key type
    if (!paymentStatus || !paymentStatus.success) {
      const fallbackKeyType = keyType === "PaymentId" ? "InvoiceId" : "PaymentId";
      console.log("[MOBILE-PAYMENT-CONFIRM] Retrying with fallback KeyType:", fallbackKeyType);
      paymentStatus = await getPaymentStatus(paymentId, isSubscriptionType, fallbackKeyType);
    }

    if (!paymentStatus || !paymentStatus.success) {
      console.error(
        "[MOBILE-PAYMENT-CONFIRM] Failed to get payment status:",
        paymentStatus
      );
      return NextResponse.json(
        {
          success: false,
          message: "Failed to verify payment status with payment gateway",
          payment_status: "unknown",
        },
        { status: 502 }
      );
    }

    // getPaymentStatus returns: { success, status, invoiceValue, invoiceDisplayValue, invoiceTransactions }
    const invoiceStatus = paymentStatus.status;
    
    // MyFatoorah returns invoiceValue in base currency (e.g. KWD) and invoiceDisplayValue in BHD (e.g. "70.000 BHD")
    let paidAmount = paymentStatus.invoiceValue || 0;
    if (paymentStatus.invoiceDisplayValue) {
      const parsedAmount = parseFloat(paymentStatus.invoiceDisplayValue.replace(/[^\d.]/g, ''));
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        paidAmount = parsedAmount;
      }
    }
    
    const transactions = paymentStatus.invoiceTransactions || [];
    const transactionId = transactions[0]?.TransactionId || null;
    const paymentMethod = transactions[0]?.PaymentGateway || "myfatoorah";
    const invoiceId = paymentStatus.invoiceId || paymentId;

    const isPaid = invoiceStatus === "Paid";

    console.log("[MOBILE-PAYMENT-CONFIRM] MyFatoorah status:", {
      invoiceStatus,
      invoiceId,
      paidAmount,
      transactionId,
      isPaid,
    });

    if (!isPaid) {
      return NextResponse.json({
        success: false,
        message: `Payment not completed. Status: ${invoiceStatus}`,
        payment_status: invoiceStatus,
        invoiceId,
      });
    }


    // --- Handle EVENT payment confirmation ---
    if (type === "event") {
      // Find the event_member record by matching user and looking for pending payment
      // The referenceId format is: EVT-{event_id}-{user_id}
      const customerRef =
        paymentStatus.data?.CustomerReference ||
        paymentStatus.data?.UserDefinedField || "";
      const refParts = customerRef.match(
        /^EVT-([0-9a-f-]+)-([0-9a-f-]+)$/i
      );

      let eventId = refParts ? refParts[1] : null;

      if (!eventId) {
        // Fallback: find by user's unpaid event member records
        const { data: pendingMembers } = await supabase
          .from("event_members")
          .select("id, event_id, price_paid")
          .eq("user_id", userId)
          .or("price_paid.is.null,price_paid.eq.0")
          .order("joined_at", { ascending: false })
          .limit(5);

        if (pendingMembers && pendingMembers.length > 0) {
          eventId = pendingMembers[0].event_id;
        }
      }

      if (!eventId) {
        return NextResponse.json(
          {
            success: false,
            message: "Could not determine which event this payment is for",
          },
          { status: 400 }
        );
      }

      // Update event_member record
      const { data: updatedMember, error: updateError } = await supabase
        .from("event_members")
        .update({
          price_paid: paidAmount,
          payment_status: "completed",
        })
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .select("id, event_id, token, price_paid, payment_status")
        .single();

      if (updatedMember) {
        // Finalize any provisional coupon usage records
        try {
          const { data: provisionalUsages } = await supabase
            .from("event_coupon_usages")
            .select("id, coupon_id")
            .eq("event_id", eventId)
            .eq("user_id", userId)
            .is("event_member_id", null);

          if (Array.isArray(provisionalUsages) && provisionalUsages.length > 0) {
            const usageIds = provisionalUsages.map((u) => u.id);

            await supabase
              .from("event_coupon_usages")
              .update({
                event_member_id: updatedMember.id,
                payment_id: String(invoiceId),
                invoice_id: String(invoiceId),
                metadata: { stage: "paid" },
              })
              .in("id", usageIds);

            for (const u of provisionalUsages) {
              await supabase.rpc("increment_event_coupon_used_count", {
                coupon_row_id: u.coupon_id,
              });
            }
          }
        } catch (couponErr) {
          console.error("[MOBILE-PAYMENT-CONFIRM] Failed to finalize coupon usage:", couponErr);
        }
      }

      if (updateError) {
        console.error(
          "[MOBILE-PAYMENT-CONFIRM] Error updating event member:",
          updateError
        );
        return NextResponse.json(
          {
            success: false,
            message: "Payment verified but failed to update event record",
            payment_status: "paid",
            invoiceId,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Event payment confirmed successfully",
        payment_status: "paid",
        invoiceId,
        transactionId,
        amount_paid: paidAmount,
        event_member: updatedMember,
      });
    }

    // --- Handle SUBSCRIPTION payment confirmation ---
    if (type === "subscription") {
      // Find the membership_payment by invoice_id
      const { data: payment, error: paymentError } = await supabase
        .from("membership_payments")
        .select(
          "id, user_id, subscription_id, amount, paid, payment_type"
        )
        .eq("invoice_id", String(invoiceId))
        .eq("user_id", userId)
        .maybeSingle();

      let targetPayment = payment;

      if (paymentError || !payment) {
        // Try matching by user + unpaid
        const { data: fallbackPayment } = await supabase
          .from("membership_payments")
          .select(
            "id, user_id, subscription_id, amount, paid, payment_type"
          )
          .eq("user_id", userId)
          .eq("paid", false)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!fallbackPayment) {
          return NextResponse.json(
            {
              success: false,
              message: "Payment record not found",
              payment_status: "paid",
              invoiceId,
            },
            { status: 404 }
          );
        }

        targetPayment = fallbackPayment;
      }

      if (targetPayment.paid) {
        return NextResponse.json({
          success: true,
          message: "Payment was already confirmed",
          payment_status: "paid",
          already_confirmed: true,
          invoiceId,
        });
      }

      // Mark payment as paid
      const { error: updatePaymentError } = await supabase
        .from("membership_payments")
        .update({
          paid: true,
          paid_at: new Date().toISOString(),
          payment_gateway: "myfatoorah",
          invoice_id: String(invoiceId),
        })
        .eq("id", targetPayment.id);

      if (updatePaymentError) {
        console.error(
          "[MOBILE-PAYMENT-CONFIRM] Error updating membership payment:",
          updatePaymentError
        );
      }

      // Update subscription status
      if (targetPayment.subscription_id) {
        const isRegistration =
          targetPayment.payment_type === "subscription_registration" ||
          targetPayment.payment_type === "subscription_combined";
        const isRenewal =
          targetPayment.payment_type === "subscription_renewal" ||
          targetPayment.payment_type === "subscription_annual";

        const updateData = { status: "active" };

        if (isRegistration) {
          updateData.registration_paid = true;
          updateData.started_at = new Date().toISOString();
        }

        if (isRenewal || targetPayment.payment_type === "subscription_combined") {
          updateData.annual_paid = true;
          // Set expiry 1 year from now
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          updateData.expires_at = expiryDate.toISOString();
        }

        await supabase
          .from("user_subscriptions")
          .update(updateData)
          .eq("id", targetPayment.subscription_id);

        // Update user membership type to paid
        await supabase.from("users").update({
          membership_type: "paid",
          membership_status: "active",
          membership_expiry_date: updateData.expires_at || null,
        }).eq("id", userId);
      }

      return NextResponse.json({
        success: true,
        message: "Subscription payment confirmed successfully",
        payment_status: "paid",
        invoiceId,
        transactionId,
        amount_paid: paidAmount,
        subscription_id: targetPayment.subscription_id,
      });
    }
  } catch (error) {
    console.error("[MOBILE-PAYMENT-CONFIRM] Error:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to confirm payment",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
