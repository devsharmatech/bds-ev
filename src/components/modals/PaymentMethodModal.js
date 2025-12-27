"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

const formatBHD = (amount) => {
  if (!amount || amount === 0) return "FREE";
  return new Intl.NumberFormat("en-BH", {
    style: "currency",
    currency: "BHD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
};

export default function PaymentMethodModal({
  isOpen,
  onClose,
  paymentMethods = [],
  amount,
  currency = "BHD",
  subscription_id,
  payment_id,
  payment_type,
  loading = false,
  onPaymentExecute,
  redirect_to,
}) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    setError(null);
  };

  const handleExecutePayment = async () => {
    if (!selectedMethod || !subscription_id || !payment_id) {
      setError("Please select a payment method");
      return;
    }

    if (processing) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/subscription/execute-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          subscription_id,
          payment_id,
          payment_method_id: selectedMethod.id,
          redirect_to: redirect_to,
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // Call custom handler if provided
        if (onPaymentExecute) {
          onPaymentExecute(data.paymentUrl);
        } else {
          // Default: redirect to payment gateway
          window.location.href = data.paymentUrl;
        }
      } else {
        setError(data.message || "Failed to process payment");
        toast.error(data.message || "Failed to process payment");
        setProcessing(false);
      }
    } catch (err) {
      console.error("Error executing payment:", err);
      setError("Failed to process payment. Please try again.");
      toast.error("Failed to process payment. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Payment Method</h2>
            <p className="text-gray-600 mt-1">Choose your preferred payment method</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={processing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Display */}
          <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Amount</p>
                <p className="text-3xl font-bold mt-1">{formatBHD(amount)}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <CreditCard className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-[#03215F] animate-spin mb-4" />
              <p className="text-gray-600">Loading payment methods...</p>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payment methods available</p>
            </div>
          ) : (
            <>
              {/* Payment Methods */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Available Payment Methods
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleSelectMethod(method)}
                      disabled={processing}
                      className={`p-4 border-2 rounded-xl transition-all text-left ${
                        selectedMethod?.id === method.id
                          ? "border-[#03215F] bg-[#03215F]/5 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      } ${processing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-3">
                        {method.imageUrl && (
                          <div className="flex-shrink-0">
                            <img
                              src={method.imageUrl}
                              alt={method.name}
                              className="w-12 h-8 object-contain"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate">
                            {method.name}
                          </div>
                          {method.serviceCharge > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Service Charge: {formatBHD(method.serviceCharge)}
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
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <Shield className="w-5 h-5 text-[#03215F] flex-shrink-0" />
                <span>Secure payment powered by MyFatoorah • 256-bit SSL encryption</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            disabled={processing}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExecutePayment}
            disabled={!selectedMethod || processing || loading}
            className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Pay {formatBHD(amount)}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}





