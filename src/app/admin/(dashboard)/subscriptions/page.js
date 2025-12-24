"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Shield,
  Users,
  Award,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";

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

export default function SubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/subscription-plans", {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setPlans(data.plans || []);
      } else {
        toast.error(data.message || "Failed to load subscription plans");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async (planData) => {
    try {
      const isEdit = editingPlan?.id;
      const url = "/api/admin/subscription-plans";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(isEdit ? { id: editingPlan.id, ...planData } : planData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(isEdit ? "Plan updated successfully" : "Plan created successfully");
        setEditingPlan(null);
        setShowAddModal(false);
        fetchPlans();
      } else {
        toast.error(data.message || "Failed to save plan");
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Failed to save plan");
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm("Are you sure you want to delete this subscription plan?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/subscription-plans?id=${planId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Plan deleted successfully");
        fetchPlans();
      } else {
        toast.error(data.message || "Failed to delete plan");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete plan");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#03215F] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
            Subscription Plans
          </h1>
          <p className="text-gray-600 mt-2">Manage subscription plans and pricing</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setShowAddModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = planIcons[plan.name] || CreditCard;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    plan.name === 'free' ? 'bg-gray-100' :
                    plan.name === 'active' ? 'bg-[#9cc2ed]' :
                    plan.name === 'associate' ? 'bg-[#ECCF0F]' :
                    plan.name === 'honorary' ? 'bg-[#AE9B66]' :
                    'bg-purple-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      plan.name === 'free' ? 'text-gray-600' :
                      plan.name === 'active' ? 'text-[#03215F]' :
                      plan.name === 'associate' ? 'text-[#03215F]' :
                      plan.name === 'honorary' ? 'text-white' :
                      'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{plan.display_name}</h3>
                    {plan.subtitle && (
                      <p className="text-sm text-gray-600">{plan.subtitle}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="p-2 text-[#03215F] hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit plan"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {plan.name !== 'free' && (
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 text-[#b8352d] hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {plan.description && (
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              )}

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Registration Fee</span>
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

              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  plan.is_active
                    ? 'bg-[#AE9B66] text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </span>
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
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Core Benefits</h4>
                  <div className="space-y-1">
                    {plan.core_benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-[#03215F]" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Edit/Add Modal */}
      {(showAddModal || editingPlan) && (
        <SubscriptionPlanModal
          plan={editingPlan}
          isOpen={true}
          onClose={() => {
            setShowAddModal(false);
            setEditingPlan(null);
          }}
          onSave={handleSavePlan}
        />
      )}
    </div>
  );
}

// Subscription Plan Modal Component
function SubscriptionPlanModal({ plan, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    display_name: plan?.display_name || '',
    subtitle: plan?.subtitle || '',
    description: plan?.description || '',
    registration_fee: plan?.registration_fee || 0,
    annual_fee: plan?.annual_fee || 0,
    registration_waived: plan?.registration_waived || false,
    annual_waived: plan?.annual_waived || false,
    is_active: plan?.is_active !== undefined ? plan.is_active : true,
    sort_order: plan?.sort_order || 0,
    icon_name: plan?.icon_name || '',
    governance_rights: plan?.governance_rights || [],
    core_benefits: plan?.core_benefits || [],
  });
  const [saving, setSaving] = useState(false);
  const [newRight, setNewRight] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const addRight = () => {
    if (newRight.trim()) {
      setFormData({
        ...formData,
        governance_rights: [...formData.governance_rights, newRight.trim()]
      });
      setNewRight('');
    }
  };

  const removeRight = (index) => {
    setFormData({
      ...formData,
      governance_rights: formData.governance_rights.filter((_, i) => i !== index)
    });
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData({
        ...formData,
        core_benefits: [...formData.core_benefits, newBenefit.trim()]
      });
      setNewBenefit('');
    }
  };

  const removeBenefit = (index) => {
    setFormData({
      ...formData,
      core_benefits: formData.core_benefits.filter((_, i) => i !== index)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#03215F] to-[#03215F]">
          <h2 className="text-2xl font-bold text-white">
            {plan ? 'Edit Subscription Plan' : 'Add Subscription Plan'}
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plan Name (ID) <span className="text-[#b8352d]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                  required
                  disabled={!!plan}
                  placeholder="e.g., active, associate"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Display Name <span className="text-[#b8352d]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Pricing</h3>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reg_waived"
                  checked={formData.registration_waived}
                  onChange={(e) => setFormData({ ...formData, registration_waived: e.target.checked })}
                  className="w-4 h-4 text-[#03215F] rounded focus:ring-[#03215F]"
                />
                <label htmlFor="reg_waived" className="text-sm text-gray-700">Registration Fee Waived</label>
              </div>

              {!formData.registration_waived && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Fee (BHD)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.registration_fee}
                    onChange={(e) => setFormData({ ...formData, registration_fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                    min="0"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ann_waived"
                  checked={formData.annual_waived}
                  onChange={(e) => setFormData({ ...formData, annual_waived: e.target.checked })}
                  className="w-4 h-4 text-[#03215F] rounded focus:ring-[#03215F]"
                />
                <label htmlFor="ann_waived" className="text-sm text-gray-700">Annual Fee Waived</label>
              </div>

              {!formData.annual_waived && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Annual Fee (BHD)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.annual_fee}
                    onChange={(e) => setFormData({ ...formData, annual_fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                    min="0"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                  min="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#03215F] rounded focus:ring-[#03215F]"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
              </div>
            </div>

            {/* Benefits & Rights */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Governance Rights</h3>
              <div className="space-y-2">
                {formData.governance_rights.map((right, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-[#AE9B66]" />
                    <span className="flex-1 text-sm">{right}</span>
                    <button
                      type="button"
                      onClick={() => removeRight(idx)}
                      className="p-1 text-[#b8352d] hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRight}
                    onChange={(e) => setNewRight(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRight())}
                    placeholder="Add governance right"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={addRight}
                    className="px-4 py-2 bg-[#03215F] text-white rounded-lg text-sm font-medium hover:bg-[#03215F]/90"
                  >
                    Add
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mt-6">Core Benefits</h3>
              <div className="space-y-2">
                {formData.core_benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-[#03215F]" />
                    <span className="flex-1 text-sm">{benefit}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(idx)}
                      className="p-1 text-[#b8352d] hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    placeholder="Add core benefit"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-4 py-2 bg-[#03215F] text-white rounded-lg text-sm font-medium hover:bg-[#03215F]/90"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {plan ? 'Update Plan' : 'Create Plan'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
