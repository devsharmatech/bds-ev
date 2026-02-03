"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Percent,
  Tag,
  Calendar as CalendarIcon,
  Plus,
  X,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import Modal from "@/components/Modal";

// Simple helper to generate a readable random coupon code
function generateCouponCode(prefix = "BDS") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${randomPart}`;
}

export default function AdminEventCouponsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    event_id: "",
    is_active: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form, setForm] = useState({
    event_id: "",
    event_title: "",
    code: "",
    description: "",
    discount_type: "fixed",
    discount_value: "",
    max_uses: "",
    valid_from: "",
    valid_until: "",
    is_active: true,
  });

  const loadEvents = async () => {
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "200",
      });
      const res = await fetch(`/api/admin/events?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      console.log('Events API response:', data);
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
        console.log('Loaded events count:', data.events.length);
      } else {
        console.error('Failed to load events:', data.message || data.error);
        // Try to use data directly if it's an array
        if (Array.isArray(data)) {
          setEvents(data);
        }
      }
    } catch (e) {
      console.error('Error loading events:', e);
    }
  };

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      if (filters.search) params.set("search", filters.search);
      if (filters.event_id) params.set("event_id", filters.event_id);
      if (filters.is_active) params.set("is_active", filters.is_active);

      const res = await fetch(`/api/admin/event-coupons?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      } else {
        toast.error(data.message || "Failed to load coupons");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    loadCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.event_id, filters.is_active]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const openCreateModal = () => {
    setEditing(null);
    setForm({
      event_id: "",
      event_title: "",
      code: "",
      description: "",
      discount_type: "fixed",
      discount_value: "",
      max_uses: "",
      valid_from: "",
      valid_until: "",
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (coupon) => {
    setEditing(coupon);
    setForm({
      event_id: coupon.event_id || "",
      event_title: coupon.event_title || "",
      code: coupon.code || "",
      description: coupon.description || "",
      discount_type: coupon.discount_type || "fixed",
      discount_value: coupon.discount_value != null ? String(coupon.discount_value) : "",
      max_uses: coupon.max_uses != null ? String(coupon.max_uses) : "",
      valid_from: coupon.valid_from ? coupon.valid_from.substring(0, 16) : "",
      valid_until: coupon.valid_until ? coupon.valid_until.substring(0, 16) : "",
      is_active: !!coupon.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (!form.event_id) {
        toast.error("Please select an event");
        setModalLoading(false);
        return;
      }
      if (!form.code.trim()) {
        toast.error("Please enter a coupon code");
        setModalLoading(false);
        return;
      }

      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
      };

      const res = await fetch(
        editing ? `/api/admin/event-coupons/${editing.id}` : "/api/admin/event-coupons",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Save failed");
      }
      toast.success("Coupon saved successfully");
      setShowModal(false);
      loadCoupons();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    try {
      const res = await fetch(`/api/admin/event-coupons/${coupon.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failed");
      toast.success("Coupon deleted");
      loadCoupons();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getEventName = (id) => {
    const ev = events.find((e) => e.id === id);
    return ev ? ev.title : "Unknown Event";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />

      <div className="mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#03215F] to-[#03215F] shadow-lg">
                <Percent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                  Event Coupons
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage discount codes for paid events
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <button
              onClick={openCreateModal}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Coupon
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
        >
          <div className="flex-1 flex items-center gap-3">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by code or event"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
              />
            </div>

            <select
              value={filters.event_id}
              onChange={(e) => handleFilterChange("event_id", e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
            >
              <option value="">All events</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>

            <select
              value={filters.is_active}
              onChange={(e) => handleFilterChange("is_active", e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
            >
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </motion.div>

        {/* Coupons List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              No coupons found. Create your first coupon.
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#03215F]/20 hover:shadow-sm transition-all"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-1 rounded-lg bg-[#03215F]/5 text-[#03215F] text-xs font-semibold">
                        {coupon.code}
                      </span>
                      {coupon.is_active ? (
                        <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {coupon.event_title || getEventName(coupon.event_id)}
                    </div>
                    {coupon.description && (
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {coupon.description}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}% off`
                          : `${coupon.discount_value} BHD off`}
                      </span>
                      {coupon.max_uses != null && (
                        <span>
                          Uses: {coupon.used_count || 0}/{coupon.max_uses}
                        </span>
                      )}
                      {coupon.valid_until && (
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          Expires: {new Date(coupon.valid_until).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    <button
                      onClick={() => openEditModal(coupon)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:border-[#03215F] hover:text-[#03215F] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <Modal
            open={showModal}
            onClose={() => setShowModal(false)}
            title={editing ? "Edit Coupon" : "Create Coupon"}
            size="lg"
          >
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event *
                  </label>
                  <select
                    value={form.event_id}
                    onChange={(e) => {
                      const value = e.target.value;
                      const ev = events.find((ev) => ev.id === value);
                      setForm((prev) => ({
                        ...prev,
                        event_id: value,
                        event_title: ev?.title || prev.event_title,
                      }));
                    }}
                    required
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm"
                  >
                    <option value="">
                      {events.length === 0 ? "No events found" : "Select event"}
                    </option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                  {events.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No events available. Please create events first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coupon Code *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          code: e.target.value.toUpperCase(),
                        }))
                      }
                      required
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm tracking-widest uppercase"
                      placeholder="E.g. BDS2025"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const prefix = form.event_title
                          ? form.event_title
                              .toUpperCase()
                              .replace(/[^A-Z0-9]+/g, "")
                              .slice(0, 6) || "BDS"
                          : "BDS";
                        const code = generateCouponCode(prefix);
                        setForm((prev) => ({ ...prev, code }));
                      }}
                      className="px-3 py-2.5 bg-[#03215F] text-white rounded-xl text-xs md:text-sm font-medium hover:opacity-90 whitespace-nowrap"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Click "Generate" to auto-create a unique code, or type your own.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, discount_type: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm"
                  >
                    <option value="fixed">Fixed amount (BHD)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={form.discount_value}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, discount_value: e.target.value }))
                    }
                    required
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm"
                    placeholder={form.discount_type === "percentage" ? "10 = 10%" : "5 = 5 BHD"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Uses (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.max_uses}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, max_uses: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm"
                    placeholder="Leave blank for unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid From
                  </label>
                  <input
                    type="datetime-local"
                    value={form.valid_from}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, valid_from: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="datetime-local"
                    value={form.valid_until}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, valid_until: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm resize-none"
                    placeholder="Internal note about how this coupon should be used"
                  />
                </div>

                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, is_active: e.target.checked }))
                    }
                    className="w-4 h-4 text-[#03215F] rounded focus:ring-[#03215F]"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Coupon is active
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Coupon"
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
