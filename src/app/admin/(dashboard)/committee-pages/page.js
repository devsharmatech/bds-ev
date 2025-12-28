"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  Users,
  Calendar,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Save,
  Layout,
  BookOpen,
  Hash,
  Link,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Components
import Modal from "@/components/Modal";
import RichTextEditor from "@/components/admin/RichTextEditor";
import DeleteModal from "@/components/DeleteModal";

export default function AdminCommitteePagesPage() {
  const [loading, setLoading] = useState(true);
  const [committees, setCommittees] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState("");
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
    sortBy: "sort_order",
    sortOrder: "asc",
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    committee_id: "",
    slug: "",
    title: "",
    content: "",
    sort_order: 0,
    is_active: true,
  });

  // Load committees
  const loadCommittees = async () => {
    try {
      const res = await fetch("/api/admin/committees");
      const data = await res.json();
      if (data.success) setCommittees(data.committees || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load committees");
    }
  };

  // Load pages with pagination and filters
  const loadPages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(selectedCommitteeId && { committee_id: selectedCommitteeId }),
        ...filters,
      });

      const res = await fetch(`/api/admin/committee-pages?${params}`);
      const data = await res.json();
      if (data.success) {
        setPages(data.pages || []);
        setPagination(data.pagination || {
          page: 1,
          limit: 9,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else {
        toast.error(data.error || "Failed to load pages");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load committee pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommittees();
  }, []);

  useEffect(() => {
    loadPages();
  }, [selectedCommitteeId, pagination.page, filters]);

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

  // Open create modal
  const openCreateModal = () => {
    setEditing(null);
    setForm({
      committee_id: selectedCommitteeId || "",
      slug: "",
      title: "",
      content: "",
      sort_order: 0,
      is_active: true,
    });
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (page) => {
    setEditing(page);
    setForm({
      committee_id: page.committee_id,
      slug: page.slug,
      title: page.title,
      content: page.content || "",
      sort_order: page.sort_order || 0,
      is_active: !!page.is_active,
    });
    setShowCreateModal(true);
  };

  // Open delete modal
  const openDeleteModal = (page) => {
    setSelectedPage(page);
    setShowDeleteModal(true);
  };

  // Handle form submission
  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    
    try {
      if (!form.committee_id) {
        toast.error("Please select a committee");
        setModalLoading(false);
        return;
      }

      const payload = { 
        ...form, 
        sort_order: Number(form.sort_order) || 0 
      };

      const res = await fetch(
        editing 
          ? `/api/admin/committee-pages/${editing.id}`
          : "/api/admin/committee-pages",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Save failed");
      }

      toast.success("Committee page saved successfully");
      setShowCreateModal(false);
      loadPages();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedPage) return;

    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/committee-pages/${selectedPage.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Delete failed");
      }

      toast.success("Page deleted successfully");
      setShowDeleteModal(false);
      setSelectedPage(null);
      loadPages();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Get committee name by ID
  const getCommitteeName = (id) => {
    const committee = committees.find(c => c.id === id);
    return committee ? committee.name : "Unknown Committee";
  };

  // Status badge
  const StatusBadge = ({ isActive }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      isActive 
        ? "bg-green-100 text-green-700" 
        : "bg-gray-100 text-gray-600"
    }`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedPage && (
          <DeleteModal
            item={selectedPage}
            itemType="page"
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
            title={editing ? "Edit Committee Page" : "Create New Page"}
            size="xl"
          >
            <form onSubmit={handleSave} className="space-y-6">
              {/* Meta Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Page Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Committee *
                    </label>
                    <select
                      value={form.committee_id}
                      onChange={(e) => setForm({ ...form, committee_id: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                    >
                      <option value="">Select committee</option>
                      {committees.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">/</span>
                      </div>
                      <input
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        required
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                        placeholder="overview, objectives, members"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                      placeholder="Enter page title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-end md:justify-start">
                    <label className="flex items-center gap-2 p-4 bg-white border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      {form.is_active ? (
                        <CheckSquare className="w-5 h-5 text-[#03215F]" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Active Page
                      </span>
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* Content Editor */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Page Content
                </h3>
                
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => setForm({ ...form, content: html })}
                  height={400}
                  className="bg-gray-50"
                />
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 flex items-start gap-2">
                    <span className="mt-0.5">💡</span>
                    <span>
                      <strong>Tip:</strong> Use "Code View" in the editor to edit raw HTML. 
                      You can add Tailwind CSS classes for custom styling. Common utilities 
                      are safelisted and will render correctly on the live site.
                    </span>
                  </p>
                </div>
              </motion.div>

              {/* Modal Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
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
                      {editing ? "Update Page" : "Create Page"}
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
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                  Committee Pages
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage informational pages for each committee
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
              Create New Page
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
                placeholder="Search pages..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
              />
            </div>

            {/* Committee Filter */}
            <div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedCommitteeId}
                  onChange={(e) => setSelectedCommitteeId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent appearance-none"
                >
                  <option value="">All Committees</option>
                  {committees.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent appearance-none"
              >
                <option value="sort_order">Sort Order</option>
                <option value="title">Title</option>
                <option value="created_at">Created Date</option>
                <option value="updated_at">Updated Date</option>
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

        {/* PAGES GRID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#03215F] animate-spin mb-4" />
              <p className="text-gray-600">Loading committee pages...</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                No pages found
              </p>
              <p className="text-gray-500 text-sm mb-6">
                {filters.search || selectedCommitteeId
                  ? "Try changing your filters"
                  : "Create your first page to get started"}
              </p>
              <button
                onClick={openCreateModal}
                className="px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Page
              </button>
            </div>
          ) : (
            <>
              {/* Cards Grid */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pages.map((page) => (
                    <motion.div
                      key={page.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                    >
                      {/* Card Header */}
                      <div className="p-5 border-b border-gray-200/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50">
                                <FileText className="w-4 h-4 text-[#03215F]" />
                              </div>
                              <h3 className="font-semibold text-gray-900 truncate capitalize">
                                {page.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <StatusBadge isActive={page.is_active} />
                              <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded">
                                Order: {page.sort_order || 0}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => openDeleteModal(page)}
                            className="p-2 rounded-lg  hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Slug */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                          <Link className="w-4 h-4" />
                          <span className="font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            /{page.slug}
                          </span>
                        </div>

                        {/* Committee */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <Users className="w-4 h-4" />
                          <span className="truncate">
                            {getCommitteeName(page.committee_id)}
                          </span>
                        </div>
                      </div>

                      {/* Card Content Preview */}
                      <div className="p-5">
                        <div className="text-sm text-gray-600 line-clamp-3 mb-4 min-h-[60px]">
                          {page.content ? (
                            <div 
                              dangerouslySetInnerHTML={{ 
                                __html: page.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...' 
                              }} 
                            />
                          ) : (
                            <span className="text-gray-400 italic">No content</span>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200/60">
                          <div className="text-xs text-gray-500">
                            Updated: {new Date(page.updated_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => window.open(`/committees/${page.committee_id}/${page.slug}`, '_blank')}
                              className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 transition-colors hover:scale-105 active:scale-95"
                              title="View Live"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(page)}
                              className="p-2 rounded-lg bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed] text-[#03215F] hover:text-[#03215F] transition-colors hover:scale-105 active:scale-95"
                              title="Edit Page"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
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
                    pages
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