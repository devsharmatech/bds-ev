"use client";

import { useState, useEffect } from "react";
import { Shield, Award, Users, CheckCircle, FileText, DollarSign, Crown, Check, RefreshCw, UserPlus, GraduationCap, Loader2, ArrowRight, LogIn, AlertCircle } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PaymentMethodModal from "@/components/modals/PaymentMethodModal";

const planIcons = {
  free: Users,
  active: Shield,
  associate: Users,
  honorary: Award,
  student: GraduationCap,
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

export default function MembershipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentData, setPaymentData] = useState(null);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  const getEligibleUpgradePlans = () => {
    const paidPlans = plans.filter((plan) => (plan.name || "").toLowerCase() !== "free");

    if (!user) return paidPlans;

    const nationality = (user.nationality || "").trim();
    const isBahraini = nationality === "Bahrain";
    const categoryLower = (user.category || "").toLowerCase();
    const workSectorLower = (user.work_sector || "").toLowerCase();
    const positionLower = (user.position || "").toLowerCase();

    const isStudentCategory = categoryLower.includes("student");
    const isStudentWorkSector = workSectorLower.includes("student");
    const isStudentPosition = positionLower === "student";
    const isStudent = isStudentCategory || isStudentWorkSector || isStudentPosition;

    return paidPlans.filter((plan) => {
      const planName = (plan.name || "").toLowerCase();

      if (isBahraini) {
        // For Bahrain nationals:
        // - If student: only show student plan
        // - If not student: show non-student, non-associate plans (Active, Honorary, etc.)
        if (isStudent) {
          return planName === "student";
        }
        return planName !== "associate" && planName !== "student";
      }

      if (nationality && nationality !== "Bahrain") {
        // Non-Bahrain users can only join Associate plan
        return planName === "associate";
      }

      // Fallback: just use paid plans list
      return true;
    });
  };

  useEffect(() => {
    checkUser();
    fetchPlans();
  }, []);

  const checkUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (data.user) {
          fetchUserSubscription();
        }
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch("/api/dashboard/subscriptions", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentSubscription(data.currentSubscription);
        }
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      // Plans can be fetched without authentication (public endpoint)
      const response = await fetch("/api/dashboard/subscriptions", {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setPlans(data.plans || []);
        // If user is logged in, also set current subscription
        if (data.currentSubscription) {
          setCurrentSubscription(data.currentSubscription);
        }
      } else {
        toast.error("Failed to load subscription plans");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const initiatePaymentFlow = async (subscriptionId, payment, actionType = 'upgrade') => {
    setLoadingPaymentMethods(true);
    try {
      let paymentId, paymentType, amount;

      if (payment.registration_fee > 0 && payment.annual_fee > 0) {
        // User needs to pay both registration and annual fees
        // Start with registration fee
        paymentId = payment.registration_payment_id || payment.subscription_id;
        paymentType = 'subscription_registration';
        amount = payment.registration_fee;
      } else if (payment.registration_fee > 0) {
        // User only needs to pay registration fee
        paymentId = payment.registration_payment_id || payment.subscription_id;
        paymentType = 'subscription_registration';
        amount = payment.registration_fee;
      } else if (payment.annual_fee > 0) {
        // User only needs to pay annual fee (registration already paid or waived)
        paymentId = payment.annual_payment_id || payment.subscription_id;
        paymentType = actionType === 'renew' ? 'subscription_renewal' : 'subscription_annual';
        amount = payment.annual_fee;
      } else {
        // Fallback: use total amount (shouldn't happen if logic is correct)
        paymentId = payment.annual_payment_id || payment.registration_payment_id || payment.subscription_id;
        paymentType = actionType === 'renew' ? 'subscription_renewal' : 'subscription_annual';
        amount = payment.total_amount;
      }

      // Create invoice and get payment methods
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
          redirect_to: "/membership", // Redirect back to membership page after payment
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
          redirect_to: "/membership",
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
    // Redirect to payment gateway
    window.location.href = paymentUrl;
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setPaymentMethods([]);
    setPaymentData(null);
  };

  // Note: Upgrade/Downgrade functionality has been disabled.
  // Users can only renew their current plan when it expires.
  // Contact admin for any plan changes.

  const handleUpgrade = async (plan) => {
    if (!user) {
      toast.error("Please login to upgrade your subscription");
      router.push("/auth/login?redirect=/membership");
      return;
    }

    if (processing || !plan?.id || !plan?.name) return;

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

      if (!data.success) {
        toast.error(data.message || "Failed to upgrade subscription");
        return;
      }

      if (data.payment) {
        await initiatePaymentFlow(
          data.subscription.id,
          {
            total_amount: data.payment.total_amount,
            registration_fee: data.payment.registration_fee,
            annual_fee: data.payment.annual_fee,
            registration_payment_id: data.payment.registration_payment_id,
            annual_payment_id: data.payment.annual_payment_id,
            subscription_id: data.payment.subscription_id,
          },
          "upgrade"
        );
      } else {
        toast.success("Subscription upgraded successfully");
        fetchUserSubscription();
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      toast.error("Failed to upgrade subscription");
    } finally {
      setProcessing(false);
    }
  };

  const handleRenew = async () => {
    if (!user) {
      toast.error("Please login to renew your subscription");
      router.push("/auth/login?redirect=/membership");
      return;
    }

    if (processing || !currentSubscription) return;

    // Disallow renew if not expired
    const expired =
      currentSubscription?.expires_at &&
      new Date(currentSubscription.expires_at) < new Date();
    if (!expired) {
      toast.error("Your membership is not expired yet.");
      return;
    }

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
          // Payment required - initiate payment and show modal
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
          fetchUserSubscription();
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

  const isCurrentPlan = (plan) => {
    if (!currentSubscription) return false;
    return currentSubscription.subscription_plan_id === plan.id || 
           currentSubscription.subscription_plan_name === plan.name;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#03215F] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading membership plans...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentPlan = plans.find(p => isCurrentPlan(p));
  const isFreeCurrentPlan =
    !!currentPlan && (currentPlan.name || "").toLowerCase() === "free";

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#9cc2ed]/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <Crown className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                {plans.length} Membership Plans Available
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Membership</h1>
            <p className="text-lg opacity-90">
              {user 
                ? currentSubscription
                  ? isFreeCurrentPlan
                    ? "You are on a free membership. You can upgrade your plan below or keep enjoying free benefits."
                    : "Renew your subscription when it expires. Contact admin for plan changes."
                  : "Select a membership plan that fits your needs"
                : "Join Bahrain Dental Society with flexible subscription options. Sign up to get started."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Current Subscription Status (for logged-in users) */}
      {user && currentSubscription && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-br from-[#AE9B66] to-[#AE9B66] rounded-xl p-6 text-white shadow-lg max-w-4xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Current Subscription</h2>
                <p className="opacity-90">
                  {currentSubscription.subscription_plan?.display_name || currentSubscription.subscription_plan_name}
                  {currentSubscription.expires_at && (
                    <span className="ml-2">
                      • Expires: {new Date(currentSubscription.expires_at).toLocaleDateString("en-BH")}
                    </span>
                  )}
                </p>
              </div>
              {(() => {
                const expired =
                  currentSubscription?.expires_at &&
                  new Date(currentSubscription.expires_at) < new Date();
                if (!expired) return null;
                return (
                <button
                  onClick={handleRenew}
                  disabled={processing}
                  className="px-6 py-3 bg-white text-[#03215F] rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                  Renew Subscription
                </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="container mx-auto px-4 py-12">
        {user && currentSubscription ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Your Membership Plan
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {isFreeCurrentPlan
                  ? "You are currently on a free membership. You can upgrade to a paid plan below."
                  : "You can renew when your subscription expires. For plan changes, please contact the admin."
                }
              </p>
            </div>

            <div className="max-w-md mx-auto mb-12">
              {(() => {
                const plan = plans.find(p => isCurrentPlan(p));
                if (!plan) return null;
                const Icon = planIcons[plan.name] || Shield;
                const isFree = plan.name === 'free';

                return (
                  <div
                    className="bg-white rounded-xl shadow-xl p-6 border-2 border-[#03215F] relative"
                  >
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-[#03215F] text-white rounded-full text-sm font-semibold">
                      Current Plan
                    </div>

                    <div className="mb-4 mt-2">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full mb-3 text-xs ${
                        plan.name === 'free' ? 'bg-gray-100 text-gray-700' :
                        plan.name === 'active' ? 'bg-[#9cc2ed] text-[#03215F]' :
                        plan.name === 'associate' ? 'bg-[#ECCF0F] text-[#03215F]' :
                        plan.name === 'honorary' ? 'bg-[#AE9B66] text-white' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        <Icon className="w-3 h-3 mr-1" />
                        <span className="font-medium">{plan.subtitle || plan.display_name}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {plan.display_name}
                      </h3>
                      <div className="text-3xl font-bold text-[#03215F] mb-1">
                        {plan.registration_waived && plan.annual_waived 
                          ? "FREE"
                          : formatBHD((plan.registration_fee || 0) + (plan.annual_fee || 0))
                        }
                      </div>
                      {plan.description && (
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      )}
                    </div>

                    {/* Pricing Breakdown */}
                    {(plan.registration_fee > 0 || plan.annual_fee > 0) && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs">
                        {!plan.registration_waived && plan.registration_fee > 0 && (
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">Registration:</span>
                            <span className="font-semibold text-[#03215F]">
                              {formatBHD(plan.registration_fee)}
                            </span>
                          </div>
                        )}
                        {!plan.annual_waived && plan.annual_fee > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Annual Fee:</span>
                            <span className="font-semibold text-[#03215F]">
                              {formatBHD(plan.annual_fee)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Core Benefits */}
                    {plan.core_benefits && plan.core_benefits.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Core Benefits
                        </h4>
                        <div className="space-y-1">
                          {plan.core_benefits.slice(0, 4).map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-[#03215F]" />
                              <span className="line-clamp-1">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-auto">
                      <div className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-lg text-center font-medium text-sm flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Current Plan
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Info and upgrade options for logged-in users with subscription */}
            {isFreeCurrentPlan ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-4xl mx-auto mb-8">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">Upgrade from Free Membership</h3>
                      <p className="text-sm text-blue-800">
                        As a free member, you can upgrade your plan online. Select one of the paid plans below to continue.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
                  {getEligibleUpgradePlans().map((plan) => {
                      const Icon = planIcons[plan.name] || Shield;

                      return (
                        <div
                          key={plan.id}
                          className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:shadow-xl transition-all h-full flex flex-col"
                        >
                          <div className="mb-4">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full mb-3 text-xs ${
                              plan.name === "active"
                                ? "bg-[#9cc2ed] text-[#03215F]"
                                : plan.name === "associate"
                                ? "bg-[#ECCF0F] text-[#03215F]"
                                : plan.name === "honorary"
                                ? "bg-[#AE9B66] text-white"
                                : "bg-purple-100 text-purple-700"
                            }`}>
                              <Icon className="w-3 h-3 mr-1" />
                              <span className="font-medium">{plan.subtitle || plan.display_name}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {plan.display_name}
                            </h3>
                            <div className="text-3xl font-bold text-[#03215F] mb-1">
                              {plan.registration_waived && plan.annual_waived
                                ? "FREE"
                                : formatBHD((plan.registration_fee || 0) + (plan.annual_fee || 0))}
                            </div>
                            {plan.description && (
                              <p className="text-sm text-gray-600">{plan.description}</p>
                            )}
                          </div>

                          {(plan.registration_fee > 0 || plan.annual_fee > 0) && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs">
                              {!plan.registration_waived && plan.registration_fee > 0 && (
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-gray-600">Registration:</span>
                                  <span className="font-semibold text-[#03215F]">
                                    {formatBHD(plan.registration_fee)}
                                  </span>
                                </div>
                              )}
                              {!plan.annual_waived && plan.annual_fee > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Annual Fee:</span>
                                  <span className="font-semibold text-[#03215F]">
                                    {formatBHD(plan.annual_fee)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {plan.core_benefits && plan.core_benefits.length > 0 && (
                            <div className="mb-6 flex-grow">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                Core Benefits
                              </h4>
                              <div className="space-y-1">
                                {plan.core_benefits.slice(0, 4).map((benefit, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 text-sm text-gray-700"
                                  >
                                    <Check className="w-4 h-4 text-[#03215F]" />
                                    <span className="line-clamp-1">{benefit}</span>
                                  </div>
                                ))}
                                {plan.core_benefits.length > 4 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    +{plan.core_benefits.length - 4} more
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-auto">
                            <button
                              type="button"
                              onClick={() => handleUpgrade(plan)}
                              disabled={processing}
                              className="w-full py-2.5 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all text-center font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                              {processing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <ArrowRight className="w-4 h-4" />
                              )}
                              <span>Upgrade to {plan.display_name}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-4xl mx-auto mb-12">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Need to change your plan?</h3>
                    <p className="text-sm text-blue-800">
                      Plan upgrades or downgrades are not available online. 
                      Please contact the admin if you need to change your membership plan.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // Not logged in OR no subscription - show all plans
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Available Subscription Plans
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {user 
                  ? "Choose a plan that best fits your professional needs"
                  : "Select a plan and sign up to get started"
                }
              </p>
            </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
          {plans.map((plan) => {
            const Icon = planIcons[plan.name] || Shield;
            const isCurrent = isCurrentPlan(plan);
            const isFree = plan.name === 'free';

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 ${
                  isCurrent
                    ? "border-[#03215F] shadow-xl"
                    : "border-gray-200 hover:shadow-xl"
                } transition-all h-full flex flex-col`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-[#03215F] text-white rounded-full text-sm font-semibold">
                    Current Plan
                  </div>
                )}

                <div className="mb-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full mb-3 text-xs ${
                    plan.name === 'free' ? 'bg-gray-100 text-gray-700' :
                    plan.name === 'active' ? 'bg-[#9cc2ed] text-[#03215F]' :
                    plan.name === 'associate' ? 'bg-[#ECCF0F] text-[#03215F]' :
                    plan.name === 'honorary' ? 'bg-[#AE9B66] text-white' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    <Icon className="w-3 h-3 mr-1" />
                    <span className="font-medium">{plan.subtitle || plan.display_name}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.display_name}
                  </h3>
                  <div className="text-3xl font-bold text-[#03215F] mb-1">
                    {plan.registration_waived && plan.annual_waived 
                      ? "FREE"
                      : formatBHD((plan.registration_fee || 0) + (plan.annual_fee || 0))
                    }
                  </div>
                  {plan.description && (
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  )}
                </div>

                {/* Pricing Breakdown */}
                {(plan.registration_fee > 0 || plan.annual_fee > 0) && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs">
                    {!plan.registration_waived && plan.registration_fee > 0 && (
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600">Registration:</span>
                        <span className="font-semibold text-[#03215F]">
                          {formatBHD(plan.registration_fee)}
                        </span>
                      </div>
                    )}
                    {!plan.annual_waived && plan.annual_fee > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Annual Fee:</span>
                        <span className="font-semibold text-[#03215F]">
                          {formatBHD(plan.annual_fee)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Governance Rights */}
                {plan.governance_rights && plan.governance_rights.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Governance Rights
                    </h4>
                    <div className="space-y-1">
                      {plan.governance_rights.slice(0, 3).map((right, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-[#AE9B66]" />
                          <span>{right}</span>
                        </div>
                      ))}
                      {plan.governance_rights.length > 3 && (
                        <p className="text-xs text-gray-500 mt-1">
                          +{plan.governance_rights.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Core Benefits */}
                {plan.core_benefits && plan.core_benefits.length > 0 && (
                  <div className="mb-6 flex-grow">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Core Benefits
                    </h4>
                    <div className="space-y-1">
                      {plan.core_benefits.slice(0, 4).map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-[#03215F]" />
                          <span className="line-clamp-1">{benefit}</span>
                        </div>
                      ))}
                      {plan.core_benefits.length > 4 && (
                        <p className="text-xs text-gray-500 mt-1">
                          +{plan.core_benefits.length - 4} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="mt-auto">
                  {!user ? (
                    // Not logged in - show signup
                    <Link
                      href={`/auth/register${plan.name !== 'free' ? `?plan=${plan.name}` : ''}`}
                      className="block w-full py-2.5 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all text-center font-medium text-sm"
                    >
                      {isFree ? "Sign Up Free" : `Join ${plan.display_name}`}
                    </Link>
                  ) : isCurrent ? (
                    // Current plan - show green badge
                    <div className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-lg text-center font-medium text-sm flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Current Plan
                    </div>
                  ) : (
                    // Other plans - show disabled message
                    <div className="w-full py-2.5 bg-gray-100 text-gray-500 rounded-lg text-center font-medium text-sm border border-gray-200">
                      <div className="flex items-center justify-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Plan change not available</span>
                      </div>
                      <p className="text-xs mt-1">Contact admin for changes</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
          </>
        )}

        {/* Info for logged-in users without subscription */}
        {user && !currentSubscription && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-4xl mx-auto mb-12">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Member Information</h3>
                <p className="text-sm text-blue-800">
                  Select a membership plan to get started. Once subscribed, you can renew when your membership expires.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-xl p-6 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-3">
                Join Bahrain's Dental Community
              </h2>
              <p className="opacity-90 text-sm">
                {user 
                  ? "Manage your subscription and unlock premium benefits"
                  : "Flexible subscription options for every stage of your career"
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {!user ? (
                <>
                  <Link
                    href="/auth/register"
                    className="px-6 py-2.5 bg-white text-[#03215F] rounded-lg hover:bg-gray-100 hover:shadow-md transition-all font-medium text-sm text-center"
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    href="/auth/login"
                    className="px-6 py-2.5 border border-white text-white rounded-lg hover:bg-white/10 transition-all font-medium text-sm text-center flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                </>
              ) : (
                <Link
                  href="/member/dashboard/subscriptions"
                  className="px-6 py-2.5 bg-white text-[#03215F] rounded-lg hover:bg-gray-100 hover:shadow-md transition-all font-medium text-sm text-center flex items-center justify-center gap-2"
                >
                  Manage Subscription
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
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
        redirect_to={paymentData?.redirect_to || "/membership"}
      />
    </MainLayout>
  );
}
