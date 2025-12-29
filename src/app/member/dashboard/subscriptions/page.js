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
  Clock,
  BadgeCheck,
  Target,
  TrendingUp,
  ChevronRight,
  Info,
  Heart,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import PaymentMethodModal from "@/components/modals/PaymentMethodModal";

const planIcons = {
  free: Users,
  active: Shield,
  associate: Users,
  honorary: Award,
  student: GraduationCap,
};

const planColors = {
  free: { 
    primary: "#6B7280", 
    secondary: "#F3F4F6",
    gradient: "from-gray-100 to-gray-200",
    text: "text-gray-700",
    bg: "bg-gradient-to-br from-gray-50 to-gray-100"
  },
  active: { 
    primary: "#03215F", 
    secondary: "#9cc2ed",
    gradient: "from-[#03215F] to-[#9cc2ed]",
    text: "text-white",
    bg: "bg-gradient-to-br from-[#03215F] to-[#03215F]"
  },
  associate: { 
    primary: "#03215F", 
    secondary: "#ECCF0F",
    gradient: "from-[#03215F] to-[#ECCF0F]",
    text: "text-white",
    bg: "bg-gradient-to-br from-[#03215F] to-[#03215F]"
  },
  honorary: { 
    primary: "#AE9B66", 
    secondary: "#ECCF0F",
    gradient: "from-[#AE9B66] to-[#ECCF0F]",
    text: "text-white",
    bg: "bg-gradient-to-br from-[#AE9B66] to-[#AE9B66]"
  },
  student: { 
    primary: "#7C3AED", 
    secondary: "#C4B5FD",
    gradient: "from-purple-600 to-purple-400",
    text: "text-white",
    bg: "bg-gradient-to-br from-purple-600 to-purple-500"
  },
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
    month: "short",
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentData, setPaymentData] = useState(null);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success === 'payment_completed') {
      toast.success("Payment completed successfully! Your subscription has been activated.", {
        duration: 5000,
        icon: '✅',
      });
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => {
        fetchSubscriptions();
      }, 1000);
    } else if (error) {
      const errorMessages = {
        'payment_failed': 'Payment failed. Please try again.',
        'payment_not_found': 'Payment record not found. Please contact support.',
        'invalid_callback': 'Invalid payment callback. Please contact support.',
        'payment_error': 'An error occurred during payment processing. Please try again.',
      };
      toast.error(errorMessages[error] || 'Payment failed. Please try again.', {
        duration: 5000,
      });
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      fetchSubscriptions();
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
          await initiatePaymentFlow(
            data.subscription.id,
            data.payment,
            'upgrade'
          );
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

  const initiatePaymentFlow = async (subscriptionId, payment, actionType) => {
    setLoadingPaymentMethods(true);
    setShowPaymentModal(false);
    setPaymentMethods([]);
    setPaymentData(null);

    try {
      let paymentId;
      let paymentType;
      let amount;

      if (payment.registration_fee > 0) {
        paymentId = payment.registration_payment_id || payment.subscription_id;
        paymentType = 'subscription_registration';
        amount = payment.registration_fee;
      } else if (payment.annual_fee > 0) {
        paymentId = payment.annual_payment_id || payment.subscription_id;
        paymentType = actionType === 'renew' ? 'subscription_renewal' : 'subscription_annual';
        amount = payment.annual_fee;
      } else {
        paymentId = payment.annual_payment_id || payment.registration_payment_id || payment.subscription_id;
        paymentType = actionType === 'renew' ? 'subscription_renewal' : 'subscription_annual';
        amount = payment.total_amount;
      }

      const invoiceResponse = await fetch("/api/payments/subscription/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          subscription_id: subscriptionId,
          payment_id: paymentId,
          amount: amount,
          payment_type: paymentType,
          redirect_to: "/member/dashboard/subscriptions",
        }),
      });

      const invoiceData = await invoiceResponse.json();

      if (invoiceData.success && invoiceData.paymentMethods) {
        setPaymentMethods(invoiceData.paymentMethods);
        setPaymentData({
          subscription_id: subscriptionId,
          payment_id: paymentId,
          amount: amount,
          payment_type: paymentType,
          redirect_to: "/member/dashboard/subscriptions",
        });
        setShowPaymentModal(true);
      } else {
        toast.error(invoiceData.message || "Failed to load payment methods");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handlePaymentExecute = (paymentUrl) => {
    window.location.href = paymentUrl;
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setPaymentMethods([]);
    setPaymentData(null);
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
          await initiatePaymentFlow(
            data.subscription.id,
            {
              total_amount: data.payment.amount,
              annual_fee: data.payment.amount,
              registration_fee: 0,
              annual_payment_id: data.payment.payment_id,
              registration_payment_id: null,
            },
            'renew'
          );
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
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-[#03215F] border-t-transparent rounded-full mx-auto mb-6"
          />
          <p className="text-gray-600 text-lg">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  // Determine current plan
  let currentPlan = null;
  if (currentSubscription) {
    if (currentSubscription.subscription_plan?.id) {
      currentPlan = plans.find(p => p.id === currentSubscription.subscription_plan.id);
    }
    if (!currentPlan && currentSubscription.subscription_plan_id) {
      currentPlan = plans.find(p => p.id === currentSubscription.subscription_plan_id);
    }
    if (!currentPlan && currentSubscription.subscription_plan_name) {
      currentPlan = plans.find(p => 
        p.display_name === currentSubscription.subscription_plan_name || 
        p.name === currentSubscription.subscription_plan_name.toLowerCase().replace(/\s+/g, '_')
      );
    }
  }
  if (!currentPlan && userMembership) {
    if (userMembership.plan_id) {
      currentPlan = plans.find(p => p.id === userMembership.plan_id);
    }
    if (!currentPlan && userMembership.plan_name) {
      currentPlan = plans.find(p => 
        p.display_name === userMembership.plan_name || 
        p.name === userMembership.plan_name.toLowerCase().replace(/\s+/g, '_')
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="mx-auto w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200/50 p-6 md:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#03215F] to-[#03215F] shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Membership Plans</h1>
                  <p className="text-gray-600 mt-2">Upgrade or renew your membership to access exclusive benefits</p>
                </div>
              </div>
            </div>
            
            {currentSubscription && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRenew}
                disabled={processing}
                className="px-8 py-4 bg-gradient-to-r from-[#AE9B66] to-[#ECCF0F] text-[#03215F] rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
                <span className="text-lg">Renew Subscription</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-[#03215F]/10 p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="w-8 h-8 text-[#03215F]" />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Current Membership</h2>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-[#03215F]">
                    {currentSubscription.subscription_plan?.display_name || currentSubscription.subscription_plan_name || "No Plan"}
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                    currentSubscription.status === 'active'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {currentSubscription.status === 'active' ? 'Active' : currentSubscription.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white shadow-sm">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Start Date</p>
                    <p className="font-bold text-gray-900">
                      {formatDate(currentSubscription.started_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 border border-amber-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white shadow-sm">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-700 font-medium">Expiry Date</p>
                    <p className="font-bold text-gray-900">
                      {currentSubscription.expires_at ? formatDate(currentSubscription.expires_at) : "Lifetime"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white shadow-sm">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-700 font-medium">Payment Status</p>
                    <p className="font-bold text-gray-900">
                      {currentSubscription.registration_paid && currentSubscription.annual_paid
                        ? "Fully Paid"
                        : currentSubscription.registration_paid
                        ? "Registration Paid"
                        : currentSubscription.annual_paid
                        ? "Annual Paid"
                        : "Payment Pending"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white shadow-sm">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-700 font-medium">Plan Type</p>
                    <p className="font-bold text-gray-900">
                      {currentPlan?.display_name || "Not Assigned"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Available Plans Section */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Available Plans</h2>
              <p className="text-gray-600">Compare and choose the best membership for your needs</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <select className="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent">
                  <option>Sort by: Recommended</option>
                  <option>Sort by: Price Low to High</option>
                  <option>Sort by: Price High to Low</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                  <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Plans Grid - Equal Height Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8">
            {plans.map((plan) => {
              const Icon = planIcons[plan.name] || CreditCard;
              const colors = planColors[plan.name] || planColors.free;
              const isCurrentPlan = currentPlan?.id === plan.id;
              const isUpgrade = currentPlan && plan.sort_order > currentPlan.sort_order;
              const isDowngrade = currentPlan && plan.sort_order < currentPlan.sort_order;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 hover:shadow-2xl transition-all duration-300 flex flex-col h-full ${
                    isCurrentPlan 
                      ? "border-[#03215F] ring-4 ring-[#03215F]/10 transform scale-[1.02]" 
                      : "border-gray-200 hover:border-[#03215F]/50"
                  }`}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-5 py-2 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-full text-sm font-bold shadow-lg z-10">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-white" />
                        Current Plan
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className={`relative overflow-hidden rounded-t-2xl p-6 ${colors.bg} text-center`}>
                    <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 w-20 h-20 rounded-full bg-white/10" />
                    
                    <div className="relative z-10">
                      <div className="inline-flex p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
                        <Icon className={`w-8 h-8 ${colors.text}`} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.display_name}</h3>
                      {plan.subtitle && (
                        <p className="text-white/90 text-sm mb-4">{plan.subtitle}</p>
                      )}
                    </div>
                  </div>

                  {/* Plan Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Description */}
                    {plan.description && (
                      <p className="text-gray-600 mb-6 text-center">{plan.description}</p>
                    )}

                    {/* Pricing */}
                    <div className="mb-6 space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-700">Registration</span>
                        </div>
                        <span className={`font-bold text-lg ${
                          plan.registration_waived ? "text-green-600" : "text-[#03215F]"
                        }`}>
                          {plan.registration_waived ? "Waived" : formatBHD(plan.registration_fee)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-700">Annual Fee</span>
                        </div>
                        <span className={`font-bold text-lg ${
                          plan.annual_waived ? "text-green-600" : "text-[#03215F]"
                        }`}>
                          {plan.annual_waived ? "Waived" : formatBHD(plan.annual_fee)}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6 flex-1">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Key Features</h4>
                      <div className="space-y-2">
                        {(plan.core_benefits || []).slice(0, 3).map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{benefit}</span>
                          </div>
                        ))}
                        {plan.governance_rights && plan.governance_rights.length > 0 && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-start gap-2 text-sm text-[#03215F] font-medium">
                              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>Governance Rights Included</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto pt-4 border-t border-gray-200">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUpgrade(plan)}
                        disabled={processing || isCurrentPlan || plan.name === 'free'}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                          isCurrentPlan
                            ? "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 cursor-not-allowed"
                            : plan.name === 'free'
                            ? "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 cursor-not-allowed"
                            : `bg-gradient-to-r ${colors.gradient} text-white hover:shadow-xl hover:opacity-95`
                        } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : isCurrentPlan ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Current Plan
                          </>
                        ) : plan.name === 'free' ? (
                          "Free Plan"
                        ) : (
                          <>
                            {isUpgrade ? "Upgrade Now" : isDowngrade ? "Downgrade" : "Select Plan"}
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Subscription History */}
        {subscriptionHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-8 h-8 text-[#03215F]" />
              <h2 className="text-3xl font-bold text-gray-900">Subscription History</h2>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="text-left py-5 px-6 font-bold text-gray-700">Plan</th>
                      <th className="text-left py-5 px-6 font-bold text-gray-700">Status</th>
                      <th className="text-left py-5 px-6 font-bold text-gray-700">Started</th>
                      <th className="text-left py-5 px-6 font-bold text-gray-700">Expires</th>
                      <th className="text-left py-5 px-6 font-bold text-gray-700">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subscriptionHistory.map((sub, index) => (
                      <motion.tr
                        key={sub.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                              <CreditCard className="w-5 h-5 text-gray-600" />
                            </div>
                            <span className="font-semibold text-gray-900">
                              {sub.subscription_plan?.display_name || sub.subscription_plan_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            sub.status === 'active'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white'
                              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-gray-600">
                          {formatDate(sub.started_at)}
                        </td>
                        <td className="py-5 px-6 text-gray-600">
                          {sub.expires_at ? formatDate(sub.expires_at) : "—"}
                        </td>
                        <td className="py-5 px-6">
                          <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                            sub.registration_paid && sub.annual_paid
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {sub.registration_paid && sub.annual_paid ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Paid
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3" />
                                Partial
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-xl bg-white shadow-sm mb-4">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Need Help Choosing?</h4>
              <p className="text-sm text-gray-600">Contact our support team for personalized guidance.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex p-3 rounded-xl bg-white shadow-sm mb-4">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Satisfaction Guaranteed</h4>
              <p className="text-sm text-gray-600">30-day refund policy on all new subscriptions.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex p-3 rounded-xl bg-white shadow-sm mb-4">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Instant Access</h4>
              <p className="text-sm text-gray-600">Immediate access to all membership benefits.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={handlePaymentModalClose}
        paymentMethods={paymentMethods}
        amount={paymentData?.amount || 0}
        currency="BHD"
        subscription_id={paymentData?.subscription_id}
        payment_id={paymentData?.payment_id}
        payment_type={paymentData?.payment_type}
        loading={loadingPaymentMethods}
        onPaymentExecute={handlePaymentExecute}
        redirect_to={paymentData?.redirect_to || "/member/dashboard/subscriptions"}
      />
    </div>
  );
}