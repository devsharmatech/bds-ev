"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Award,
  GraduationCap,
  CreditCard,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calendar,
  DollarSign,
  Loader2,
  Crown,
  Sparkles,
  Zap,
  Star,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const planIcons = {
  free: Users,
  active: Shield,
  associate: Users,
  honorary: Award,
  student: GraduationCap,
};

const planColors = {
  free: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
  active: { bg: "bg-[#9cc2ed]", text: "text-[#03215F]", border: "border-[#9cc2ed]" },
  associate: { bg: "bg-[#ECCF0F]", text: "text-[#03215F]", border: "border-[#ECCF0F]" },
  honorary: { bg: "bg-[#AE9B66]", text: "text-white", border: "border-[#AE9B66]" },
  student: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
};

const formatBHD = (amount) => {
  if (!amount) return "FREE";
  return new Intl.NumberFormat("en-BH", {
    style: "currency",
    currency: "BHD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-BH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [userMembership, setUserMembership] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
    
    // Check for payment success/error in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'payment_completed') {
      toast.success("Payment completed successfully! Your subscription has been activated.");
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (urlParams.get('error')) {
      toast.error("Payment failed. Please try again.");
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/subscriptions", {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setPlans(data.plans || []);
        setCurrentSubscription(data.currentSubscription);
        setSubscriptionHistory(data.subscriptionHistory || []);
        setUserMembership(data.userMembership);
      } else {
        toast.error(data.message || "Failed to load subscriptions");
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    if (processing) return;

    setProcessing(true);
    try {
      const response = await fetch("/api/dashboard/subscriptions/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          plan_id: plan.id,
          plan_name: plan.name,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.payment && data.payment.total_amount > 0) {
          // Payment required - create invoice for total amount
          // Use registration payment ID if registration fee exists, otherwise annual
          const paymentId = data.payment.registration_fee > 0 
            ? (data.payment.registration_payment_id || data.subscription.id)
            : (data.payment.annual_payment_id || data.subscription.id);
          const paymentType = data.payment.registration_fee > 0 
            ? 'subscription_registration' 
            : 'subscription_annual';

          const invoiceResponse = await fetch("/api/payments/subscription/create-invoice", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              subscription_id: data.subscription.id,
              payment_id: paymentId,
              amount: data.payment.total_amount,
              payment_type: paymentType,
            }),
          });

          const invoiceData = await invoiceResponse.json();

          if (invoiceData.success) {
            // Redirect to payment page
            window.location.href = invoiceData.paymentUrl;
          } else {
            toast.error(invoiceData.message || "Failed to create payment invoice");
          }
        } else {
          toast.success("Subscription upgraded successfully!");
          fetchSubscriptions();
        }
      } else {
        toast.error(data.message || "Failed to upgrade subscription");
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      toast.error("Failed to upgrade subscription");
    } finally {
      setProcessing(false);
    }
  };

  const handleRenew = async () => {
    if (processing || !currentSubscription) return;

    setProcessing(true);
    try {
      const response = await fetch("/api/dashboard/subscriptions/renew", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        if (data.payment) {
          // Payment required - create invoice
          const invoiceResponse = await fetch("/api/payments/subscription/create-invoice", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              subscription_id: data.subscription.id,
              payment_id: data.payment.payment_id,
              amount: data.payment.amount,
              payment_type: "subscription_renewal",
            }),
          });

          const invoiceData = await invoiceResponse.json();

          if (invoiceData.success) {
            // Redirect to payment page
            window.location.href = invoiceData.paymentUrl;
          } else {
            toast.error(invoiceData.message || "Failed to create payment invoice");
          }
        } else {
          toast.success("Subscription renewed successfully!");
          fetchSubscriptions();
        }
      } else {
        toast.error(data.message || "Failed to renew subscription");
      }
    } catch (error) {
      console.error("Error renewing subscription:", error);
      toast.error("Failed to renew subscription");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#03215F] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  const currentPlan = plans.find(p => p.name === currentSubscription?.subscription_plan_name || userMembership?.plan_name);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
            Subscriptions
          </h1>
          <p className="text-gray-600 mt-2">Upgrade or renew your membership</p>
        </div>
        {currentSubscription && (
          <button
            onClick={handleRenew}
            disabled={processing}
            className="px-6 py-3 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {processing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            Renew Subscription
          </button>
        )}
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-[#03215F]/20 shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#03215F] mb-2">Current Subscription</h2>
              <p className="text-gray-600">{currentSubscription.subscription_plan?.display_name || currentSubscription.subscription_plan_name}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              currentSubscription.status === 'active'
                ? 'bg-[#AE9B66] text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {currentSubscription.status === 'active' ? 'Active' : currentSubscription.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <Calendar className="w-5 h-5 text-[#03215F]" />
              <div>
                <p className="text-sm text-gray-500">Started</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(currentSubscription.started_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <Calendar className="w-5 h-5 text-[#AE9B66]" />
              <div>
                <p className="text-sm text-gray-500">Expires</p>
                <p className="font-semibold text-gray-900">
                  {currentSubscription.expires_at ? formatDate(currentSubscription.expires_at) : "Never"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <CheckCircle className="w-5 h-5 text-[#03215F]" />
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <p className="font-semibold text-gray-900">
                  {currentSubscription.registration_paid && currentSubscription.annual_paid
                    ? "Fully Paid"
                    : currentSubscription.registration_paid
                    ? "Registration Paid"
                    : currentSubscription.annual_paid
                    ? "Annual Paid"
                    : "Pending Payment"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Subscription Plans */}
      <div>
        <h2 className="text-2xl font-bold text-[#03215F] mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = planIcons[plan.name] || CreditCard;
            const colors = planColors[plan.name] || planColors.free;
            const isCurrentPlan = currentPlan?.id === plan.id;
            const isUpgrade = currentPlan && plan.sort_order > currentPlan.sort_order;
            const isDowngrade = currentPlan && plan.sort_order < currentPlan.sort_order;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative bg-white rounded-2xl p-6 border-2 ${
                  isCurrentPlan
                    ? "border-[#03215F] shadow-xl"
                    : "border-gray-200 shadow-lg hover:shadow-xl"
                } transition-all`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-[#03215F] text-white rounded-full text-sm font-semibold">
                    Current Plan
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex p-4 rounded-2xl ${colors.bg} mb-4`}>
                    <Icon className={`w-8 h-8 ${colors.text}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.display_name}</h3>
                  {plan.subtitle && (
                    <p className="text-sm text-gray-600 mb-4">{plan.subtitle}</p>
                  )}
                </div>

                {plan.description && (
                  <p className="text-sm text-gray-600 mb-4 text-center">{plan.description}</p>
                )}

                {/* Pricing */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Registration</span>
                    <span className="font-bold text-[#03215F]">
                      {plan.registration_waived ? "Waived" : formatBHD(plan.registration_fee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Annual Fee</span>
                    <span className="font-bold text-[#03215F]">
                      {plan.annual_waived ? "Waived" : formatBHD(plan.annual_fee)}
                    </span>
                  </div>
                </div>

                {/* Governance Rights */}
                {plan.governance_rights && plan.governance_rights.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Governance Rights</h4>
                    <div className="space-y-1">
                      {plan.governance_rights.map((right, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-[#AE9B66]" />
                          <span>{right}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Core Benefits */}
                {plan.core_benefits && plan.core_benefits.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Core Benefits</h4>
                    <div className="space-y-1">
                      {plan.core_benefits.slice(0, 3).map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-[#03215F]" />
                          <span className="line-clamp-1">{benefit}</span>
                        </div>
                      ))}
                      {plan.core_benefits.length > 3 && (
                        <p className="text-xs text-gray-500 mt-1">+{plan.core_benefits.length - 3} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={processing || isCurrentPlan || plan.name === 'free'}
                  className={`w-full py-3 rounded-xl font-semibold transition-opacity flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                      : plan.name === 'free'
                      ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white hover:opacity-90"
                  } disabled:opacity-50`}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Current Plan
                    </>
                  ) : plan.name === 'free' ? (
                    "Free Plan"
                  ) : (
                    <>
                      {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Select"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Subscription History */}
      {subscriptionHistory.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-[#03215F] mb-6">Subscription History</h2>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Plan</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Started</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionHistory.map((sub) => (
                    <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">
                          {sub.subscription_plan?.display_name || sub.subscription_plan_name}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          sub.status === 'active'
                            ? 'bg-[#AE9B66] text-white'
                            : sub.status === 'expired'
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {formatDate(sub.started_at)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {sub.expires_at ? formatDate(sub.expires_at) : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

