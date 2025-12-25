"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CreditCard, AlertCircle, CheckCircle, ArrowRight, Lock } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { toast } from "sonner";
import Link from "next/link";

// Force dynamic rendering because we use useSearchParams()
export const dynamic = 'force-dynamic';

function RegistrationPaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      setError("Email parameter is required");
      setLoading(false);
      return;
    }

    fetchPendingPayment();
  }, [email]);

  const fetchPendingPayment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/auth/register/pending-payment?email=${encodeURIComponent(email)}`);

      const data = await response.json();

      if (data.success) {
        setPaymentData(data);
      } else {
        setError(data.message || "No pending payment found");
      }
    } catch (err) {
      console.error("Error fetching pending payment:", err);
      setError("Failed to load payment information");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentData || processing) return;

    setProcessing(true);
    try {
      // Start with registration payment if it exists
      const paymentToProcess = paymentData.payments.registration || paymentData.payments.annual;
      
      if (!paymentToProcess) {
        toast.error("No payment to process");
        setProcessing(false);
        return;
      }

      const paymentType = paymentData.payments.registration 
        ? 'subscription_registration' 
        : 'subscription_annual';

      // Create MyFatoorah invoice
      const response = await fetch("/api/payments/subscription/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription_id: paymentData.subscription.id,
          payment_id: paymentToProcess.id,
          amount: paymentToProcess.amount,
          payment_type: paymentType,
        }),
      });

      const invoiceData = await response.json();

      if (invoiceData.success) {
        // Redirect to MyFatoorah payment page
        window.location.href = invoiceData.paymentUrl;
      } else {
        toast.error(invoiceData.message || "Failed to create payment invoice");
        setProcessing(false);
      }
    } catch (err) {
      console.error("Error creating payment invoice:", err);
      toast.error("Failed to process payment. Please try again.");
      setProcessing(false);
    }
  };

  const formatBHD = (amount) => {
    if (!amount) return "0.000 BHD";
    return new Intl.NumberFormat("en-BH", {
      style: "currency",
      currency: "BHD",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#03215F] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading payment information...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !paymentData) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Not Found</h2>
              <p className="text-gray-600 mb-6">{error || "No pending payment found for this account."}</p>
              <Link
                href="/auth/login"
                className="inline-flex items-center px-6 py-3 bg-[#03215F] text-white rounded-lg hover:bg-[#03215F]/90 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#03215F]/10 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-[#03215F]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Registration</h1>
            <p className="text-lg text-gray-600">
              Please complete the payment to activate your {paymentData.subscription.plan_display_name} membership
            </p>
          </div>

          {/* Payment Summary Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment Summary</h2>
                <p className="text-sm text-gray-500 mt-1">Member: {paymentData.user.full_name}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="text-2xl font-bold text-[#03215F]">
                  {formatBHD(paymentData.totals.total_amount)}
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="space-y-4 mb-6">
              {paymentData.payments.registration && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">Registration Fee</div>
                    <div className="text-sm text-gray-500">{paymentData.subscription.plan_display_name}</div>
                  </div>
                  <div className="text-lg font-semibold text-[#03215F]">
                    {formatBHD(paymentData.payments.registration.amount)}
                  </div>
                </div>
              )}

              {paymentData.payments.annual && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">Annual Fee</div>
                    <div className="text-sm text-gray-500">Yearly membership fee</div>
                  </div>
                  <div className="text-lg font-semibold text-[#03215F]">
                    {formatBHD(paymentData.payments.annual.amount)}
                  </div>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg mb-6">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <div className="font-semibold mb-1">Secure Payment</div>
                <div>Your payment will be processed securely through MyFatoorah. We do not store your card details.</div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full py-4 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Help Text */}
            <p className="text-center text-sm text-gray-500 mt-4">
              You will be redirected to MyFatoorah to complete the payment securely
            </p>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help?{" "}
              <Link href="/contact" className="text-[#03215F] hover:underline font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Wrap the component in Suspense to handle useSearchParams()
export default function RegistrationPaymentPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-[#03215F] animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading payment page...</p>
            </div>
          </div>
        </MainLayout>
      }
    >
      <RegistrationPaymentPageContent />
    </Suspense>
  );
}

