"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  CheckCircle,
  Crown,
  Loader2,
  ArrowRight,
  Users,
  Shield,
  Award,
  GraduationCap,
} from "lucide-react";

const planIcons = {
  free: Users,
  active: Shield,
  associate: Users,
  honorary: Award,
  student: GraduationCap,
};

const formatBHD = (amount) => {
  if (!amount || amount === 0) return "FREE";
  return new Intl.NumberFormat("en-BH", {
    style: "currency",
    currency: "BHD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
};

export default function PlanSelectionModal({
  isOpen,
  onClose,
  plans = [],
  currentPlanId = null,
  loading = false,
  onPlanSelect,
}) {
  const [selectedPlan, setSelectedPlan] = useState(null);

  if (!isOpen) return null;

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleConfirm = () => {
    if (selectedPlan && onPlanSelect) {
      onPlanSelect(selectedPlan);
    }
  };

  const isCurrentPlan = (planId) => {
    return planId === currentPlanId;
  };

  const isUpgrade = (plan) => {
    if (!currentPlanId) return true;
    const currentPlan = plans.find((p) => p.id === currentPlanId);
    if (!currentPlan) return true;
    // Compare by annual_fee to determine if it's an upgrade
    return plan.annual_fee > currentPlan.annual_fee;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select a Plan</h2>
            <p className="text-gray-600 mt-1">Choose your membership plan</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-[#03215F] animate-spin mb-4" />
              <p className="text-gray-600">Loading plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No plans available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const Icon = planIcons[plan.name] || Users;
                const isCurrent = isCurrentPlan(plan.id);
                const isUpgradePlan = isUpgrade(plan);

                return (
                  <button
                    key={plan.id}
                    onClick={() => !isCurrent && handleSelectPlan(plan)}
                    disabled={isCurrent || loading}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedPlan?.id === plan.id
                        ? "border-[#03215F] bg-[#03215F]/5 shadow-lg scale-105"
                        : isCurrent
                        ? "border-[#AE9B66] bg-[#AE9B66]/10 cursor-not-allowed opacity-75"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#03215F]/10 rounded-lg">
                          <Icon className="w-6 h-6 text-[#03215F]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {plan.display_name || plan.name}
                          </h3>
                          {plan.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {plan.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedPlan?.id === plan.id && (
                        <CheckCircle className="w-6 h-6 text-[#03215F] flex-shrink-0" />
                      )}
                      {isCurrent && (
                        <span className="px-2 py-1 bg-[#AE9B66] text-white rounded text-xs font-medium">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-2xl font-bold text-[#03215F]">
                          {formatBHD(plan.annual_fee)}
                        </div>
                        <div className="text-sm text-gray-500">per year</div>
                      </div>

                      {plan.registration_fee > 0 && (
                        <div className="text-sm text-gray-600">
                          Registration: {formatBHD(plan.registration_fee)}
                        </div>
                      )}

                      {isCurrent ? (
                        <div className="pt-2 text-sm text-gray-600">
                          This is your current plan
                        </div>
                      ) : (
                        <div className="pt-2">
                          <span className="text-sm font-medium text-[#03215F]">
                            {isUpgradePlan ? "Upgrade" : "Downgrade"} to this plan
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPlan || loading || isCurrentPlan(selectedPlan?.id)}
            className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {selectedPlan && isUpgrade(selectedPlan) ? "Upgrade" : "Change"} Plan
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}




