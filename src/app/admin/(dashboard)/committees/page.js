"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  Building,
  Target,
  Mail,
  Globe,
  Hash,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Save,
  Shield,
  Sparkles,
  Layout,
  Zap,
  Database,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Modal from "@/components/Modal";
import DeleteModal from "@/components/DeleteModal";
import { uploadFile } from "@/lib/uploadClient";

const generateSlugPreview = (name) => {
  return (name || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function AdminCommitteesPage() {
  const [loading, setLoading] = useState(true);
  const [committees, setCommittees] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "active",
    sortBy: "sort_order",
    sortOrder: "asc",
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    hero_title: "",
    hero_subtitle: "",
    focus: "",
    description: "",
    banner_image: "",
    contact_email: "",
    sort_order: 0,
    is_active: true,
  });
  const [bannerImageFile, setBannerImageFile] = useState(null);

  // Committees are now fully configurable; no fixed templates

  // Load committees with pagination and filters
  const loadCommittees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters,
      });

      const res = await fetch(`/api/admin/committees?${params}`, { 
        credentials: "include" 
      });
      const data = await res.json();
      
      if (data.success) {
        setCommittees(data.committees || []);
        setPagination(data.pagination || {
          page: 1,
          limit: 9,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else {
        toast.error(data.message || "Failed to load committees");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load committees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommittees();
  }, [pagination.page, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      slug: "",
      name: "",
      hero_title: "",
      hero_subtitle: "",
      focus: "",
      description: "",
      banner_image: "",
      contact_email: "",
      sort_order: 0,
      is_active: true,
    });
    setBannerImageFile(null);
  };

  // Open create modal
  const openCreateModal = () => {
    setEditing(null);
    resetForm();
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (committee) => {
    setEditing(committee);
    setForm({
      slug: committee.slug || "",
      name: committee.name || "",
      hero_title: committee.hero_title || "",
      hero_subtitle: committee.hero_subtitle || "",
      focus: committee.focus || "",
      description: committee.description || "",
      banner_image: committee.banner_image || "",
      contact_email: committee.contact_email || "",
      sort_order: committee.sort_order || 0,
      is_active: !!committee.is_active,
    });
    setShowCreateModal(true);
    setBannerImageFile(null);
  };

  // Open delete modal
  const openDeleteModal = (committee) => {
    setSelectedCommittee(committee);
    setShowDeleteModal(true);
  };

  // Handle save
  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      // Upload banner image directly to Supabase if a new file was selected
      let bannerImageUrl = form.banner_image || null;
      if (bannerImageFile) {
        const result = await uploadFile(bannerImageFile, "media", "committees");
        bannerImageUrl = result.publicUrl;
      }

      const payload = {
        name: form.name || "",
        hero_title: form.hero_title || "",
        hero_subtitle: form.hero_subtitle || "",
        focus: form.focus || "",
        description: form.description || "",
        banner_image: bannerImageUrl,
        contact_email: form.contact_email || "",
        sort_order: Number(form.sort_order) || 0,
        is_active: !!form.is_active,
      };
      if (editing) {
        payload.id = editing.id;
      }

      const res = await fetch(
        editing ? `/api/admin/committees/${editing.id}` : "/api/admin/committees",
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

      toast.success(editing ? "Committee updated successfully" : "Committee created successfully");
      setShowCreateModal(false);
      resetForm();
      await loadCommittees();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedCommittee) return;

    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/committees/${selectedCommittee.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Delete failed");
      }
      
      toast.success("Committee deleted successfully");
      setShowDeleteModal(false);
      setSelectedCommittee(null);
      await loadCommittees();
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // No seed/templating logic; committees are created manually

  // Status badge component
  const StatusBadge = ({ isActive }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      isActive 
        ? "bg-green-100 text-green-700" 
        : "bg-gray-100 text-gray-600"
    }`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );

  // Focus badge component
  const FocusBadge = ({ focus }) => {
    if (!focus) return null;
    
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
        <Target className="w-3 h-3" />
        {focus}
      </span>
    );
  };

  // Get committee icon based on slug
  const getCommitteeIcon = (slug) => {
    if (slug.includes('professional')) return <Shield className="w-5 h-5" />;
    if (slug.includes('scientific')) return <Zap className="w-5 h-5" />;
    if (slug.includes('social') || slug.includes('health')) return <Users className="w-5 h-5" />;
    if (slug.includes('media')) return <Globe className="w-5 h-5" />;
    return <Building className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedCommittee && (
          <DeleteModal
            item={selectedCommittee}
            itemType="committee"
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteConfirm}
            loading={modalLoading}
          />
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title={editing ? "Edit Committee" : "Create New Committee"}
            size="xl"
          >
            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={editing ? form.slug : generateSlugPreview(form.name)}
                      readOnly
                      disabled
                      className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                      placeholder="Auto-generated from committee name"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Slug is generated automatically from the committee name.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Committee Name *
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                      placeholder="Professional Affairs Committee"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Focus Area
                    </label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        value={form.focus}
                        onChange={(e) => setForm({ ...form, focus: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                        placeholder="Promoting high standards of practice..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={form.sort_order}
                        onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Hero Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Hero Content
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Title
                    </label>
                    <input
                      value={form.hero_title}
                      onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                      placeholder="Advancing Professional Excellence"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Subtitle
                    </label>
                    <input
                      value={form.hero_subtitle}
                      onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                      placeholder="Setting standards for dental practice in Bahrain"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Additional Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Additional Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent h-32 resize-none"
                      placeholder="Detailed description of the committee's mission and activities..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Banner Image
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition">
                          <span>{bannerImageFile ? "Change Image" : "Upload Image"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setBannerImageFile(file);
                            }}
                          />
                        </label>
                        {form.banner_image && !bannerImageFile && (
                          <img
                            src={form.banner_image}
                            alt="Banner preview"
                            className="mt-2 sm:mt-0 w-24 h-16 object-cover rounded border border-gray-200"
                          />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Optional banner image shown at the top of the committee page.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={form.contact_email}
                          onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                          placeholder="committee@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-white border border-gray-300 rounded-xl">
                    <input
                      id="is_active"
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-4 h-4 text-[#03215F] rounded focus:ring-[#03215F]"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Active Committee (visible on website)
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* Modal Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200"
              >
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editing ? "Update Committee" : "Create Committee"}
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      <div className="mx-auto space-y-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#03215F] to-[#03215F] shadow-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                  Committees
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage organizational committees and their details
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
              New Committee
            </button>
          </div>
        </motion.div>

        {/* FILTERS AND SEARCH */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search committees..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent appearance-none"
              >
                <option value="sort_order">Sort Order</option>
                <option value="name">Name</option>
                <option value="created_at">Created Date</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleFilterChange(
                    "sortOrder",
                    filters.sortOrder === "asc" ? "desc" : "asc"
                  )
                }
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* COMMITTEES GRID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#03215F] animate-spin mb-4" />
              <p className="text-gray-600">Loading committees...</p>
            </div>
          ) : committees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Building className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                No committees found
              </p>
              <p className="text-gray-500 text-sm mb-6">
                {filters.search || filters.status !== "all"
                  ? "Try changing your filters"
                  : "Create your first committee to get started"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={openCreateModal}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Committee
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Cards Grid */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {committees.map((committee) => (
                    <motion.div
                      key={committee.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                    >
                      {/* Card Header */}
                      <div className="p-5 border-b border-gray-200/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed]">
                              {getCommitteeIcon(committee.slug)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 truncate capitalize">
                                  {committee.name}
                                </h3>
                                <StatusBadge isActive={committee.is_active} />
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200 text-xs">
                                  /{committee.slug}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Order: {committee.sort_order || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => openDeleteModal(committee)}
                            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Focus Area */}
                        {committee.focus && (
                          <div className="mt-3">
                            <FocusBadge focus={committee.focus} />
                          </div>
                        )}

                        {/* Description */}
                        {committee.description && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {committee.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        {/* Hero Info */}
                        <div className="space-y-3 text-sm">
                          {committee.hero_title && (
                            <div className="flex items-start gap-2 text-gray-700">
                              <Layout className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span className="font-medium">Title: </span>
                              <span className="truncate">{committee.hero_title}</span>
                            </div>
                          )}
                          
                          {committee.contact_email && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{committee.contact_email}</span>
                            </div>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="mt-4 pt-4 border-t border-gray-200/60">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => window.open(`/committees/${committee.slug}`, '_blank')}
                              className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 transition-colors hover:scale-105 active:scale-95"
                              title="View Live"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(committee)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed] text-[#03215F] hover:text-[#03215F] transition-colors hover:scale-105 active:scale-95 flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Edit</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {(pagination.page - 1) * pagination.limit + 1}-
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {pagination.total}
                    </span>{" "}
                    committees
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transition-transform"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.page >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = pagination.page - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                                pagination.page === pageNum
                                  ? "bg-gradient-to-r from-[#03215F] to-[#03215F] text-white"
                                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transition-transform"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}