"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CreditCard, AlertCircle, CheckCircle, ArrowRight, Lock, Shield } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { toast } from "sonner";
import Link from "next/link";

function RegistrationPaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: payment summary, 2: select method, 3: processing

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

  const handleInitiatePayment = async () => {
    if (!paymentData || loadingMethods) return;

    setLoadingMethods(true);
    setError(null);
    try {
      // Start with registration payment if it exists
      const paymentToProcess = paymentData.payments.registration || paymentData.payments.annual;
      
      if (!paymentToProcess) {
        toast.error("No payment to process");
        setLoadingMethods(false);
        return;
      }

      const paymentType = paymentData.payments.registration 
        ? 'subscription_registration' 
        : 'subscription_annual';

      // Initiate payment to get payment methods
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
          redirect_to: "/auth/login", // Redirect to login after payment completion
        }),
      });

      const invoiceData = await response.json();

      if (invoiceData.success && invoiceData.paymentMethods) {
        setPaymentMethods(invoiceData.paymentMethods);
        setStep(2); // Move to payment method selection
        toast.success("Please select a payment method");
      } else {
        setError(invoiceData.message || "Failed to load payment methods");
        toast.error(invoiceData.message || "Failed to load payment methods");
      }
    } catch (err) {
      console.error("Error initiating payment:", err);
      setError("Failed to load payment methods. Please try again.");
      toast.error("Failed to load payment methods. Please try again.");
    } finally {
      setLoadingMethods(false);
    }
  };

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
  };

  const handleExecutePayment = async () => {
    if (!paymentData || !selectedMethod || processing) return;

    setProcessing(true);
    setError(null);
    try {
      const paymentToProcess = paymentData.payments.registration || paymentData.payments.annual;
      
      if (!paymentToProcess) {
        toast.error("No payment to process");
        setProcessing(false);
        return;
      }

      // Execute payment with selected method
      const response = await fetch("/api/payments/subscription/execute-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription_id: paymentData.subscription.id,
          payment_id: paymentToProcess.id,
          payment_method_id: selectedMethod.id,
          redirect_to: "/auth/login", // Redirect to login after payment completion
        }),
      });

      const executeData = await response.json();

      if (executeData.success && executeData.paymentUrl) {
        setStep(3);
        // Redirect to MyFatoorah payment page
        window.location.href = executeData.paymentUrl;
      } else {
        setError(executeData.message || "Failed to process payment");
        toast.error(executeData.message || "Failed to process payment");
        setProcessing(false);
      }
    } catch (err) {
      console.error("Error executing payment:", err);
      setError("Failed to process payment. Please try again.");
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
            <div className="bg-[#b8352d] border border-[#b8352d] rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-white mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Payment Not Found</h2>
              <p className="text-white mb-6">{error || "No pending payment found for this account."}</p>
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

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-[#b8352d] border border-[#b8352d] rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <p className="text-white text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Payment Button - Step 1: Initiate Payment */}
            {step === 1 && (
              <button
                onClick={handleInitiatePayment}
                disabled={loadingMethods}
                className="w-full py-4 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loadingMethods ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading Payment Methods...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Continue to Payment
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}

            {/* Payment Methods Selection - Step 2 */}
            {step === 2 && paymentMethods.length > 0 && (
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Payment Method</h3>
                  <p className="text-sm text-gray-600">Choose your preferred payment method</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleSelectMethod(method)}
                      className={`p-4 border-2 rounded-lg transition-all text-left ${
                        selectedMethod?.id === method.id
                          ? 'border-[#03215F] bg-[#03215F]/5 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {method.imageUrl && (
                          <div className="flex-shrink-0">
                            <img
                              src={method.imageUrl}
                              alt={method.name}
                              className="w-12 h-8 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{method.name}</div>
                          {method.serviceCharge > 0 && (
                            <div className="text-xs text-gray-500">
                              Service Charge: {method.serviceCharge.toFixed(3)} {method.currency}
                            </div>
                          )}
                        </div>
                        {selectedMethod?.id === method.id && (
                          <CheckCircle className="w-5 h-5 text-[#03215F] flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedMethod && (
                  <button
                    onClick={handleExecutePayment}
                    disabled={processing}
                    className="w-full py-4 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Pay with {selectedMethod.name}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedMethod(null);
                    setPaymentMethods([]);
                  }}
                  className="w-full py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Processing - Step 3 */}
            {step === 3 && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-[#03215F] animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Redirecting to payment gateway...</p>
              </div>
            )}

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

