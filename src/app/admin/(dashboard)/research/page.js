"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Download,
  Upload,
  X,
  Clock,
  User,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Image as ImageIcon,
  File,
  Save,
  AlertCircle,
  CheckCircle,
  Filter,
  BarChart3,
  FileDown,
  Users,
  TrendingUp,
  MoreVertical,
  Shield,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Modal from "@/components/Modal";
import DeleteModal2 from "@/components/DeleteModal2";

export default function AdminResearchPage() {
  const [loading, setLoading] = useState(true);
  const [research, setResearch] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    sort: "created_at.desc",
  });
  const [stats, setStats] = useState({
    total: 0,
    recent: 0,
    authors: 0,
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    researcher_name: "",
    external_link: "",
    more_information: {},
    featured_image: null,
    featured_preview: "",
    research_content: null,
    research_content_name: "",
    remove_featured_image: false,
    remove_research_content: false,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Load research
  const loadResearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        per_page: pagination.per_page.toString(),
        ...(filters.search && { q: filters.search }),
        sort: filters.sort,
      });

      const res = await fetch(`/api/admin/research?${params}`, { credentials: "include" });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to load research");
      }

      setResearch(data.research || []);
      setPagination({
        ...pagination,
        total: data.pagination?.total || 0,
        total_pages: data.pagination?.total_pages || 0,
      });

      // Update stats
      setStats({
        total: data.pagination?.total || 0,
        recent: data.research?.filter(r => {
          const date = new Date(r.created_at);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return date > weekAgo;
        }).length || 0,
        authors: new Set(data.research?.map(r => r.researcher_name)).size || 0,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResearch();
  }, [pagination.page, filters.search, filters.sort]);

  // Reset form
  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      researcher_name: "",
      external_link: "",
      more_information: {},
      featured_image: null,
      featured_preview: "",
      research_content: null,
      research_content_name: "",
      remove_featured_image: false,
      remove_research_content: false,
    });
    setEditing(null);
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      researcher_name: item.researcher_name || "",
      external_link: item.external_link || "",
      more_information: item.more_information || {},
      featured_image: null,
      featured_preview: item.featured_image_url || "",
      research_content: null,
      research_content_name: item.research_content_url ? "Current file attached" : "",
      remove_featured_image: false,
      remove_research_content: false,
    });
    setShowCreateModal(true);
  };

  // Handle featured image
  const handleFeaturedImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload JPEG, PNG, WebP, or GIF image (Max 5MB)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setForm({
      ...form,
      featured_image: file,
      featured_preview: URL.createObjectURL(file),
      remove_featured_image: false,
    });
  };

  // Handle research content
  const handleResearchContent = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload PDF or DOC/DOCX file (Max 25MB)");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be less than 25MB");
      return;
    }

    setForm({
      ...form,
      research_content: file,
      research_content_name: file.name,
      remove_research_content: false,
    });
  };

  // Handle save
  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (!form.title.trim() || !form.researcher_name.trim()) {
        toast.error("Title and researcher name are required");
        setModalLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim() || "");
      fd.append("researcher_name", form.researcher_name.trim());
      fd.append("external_link", form.external_link.trim() || "");
      fd.append("more_information", JSON.stringify(form.more_information || {}));

      if (form.featured_image) {
        fd.append("featured_image", form.featured_image);
      }

      if (form.remove_featured_image) {
        fd.append("remove_featured_image", "true");
      }

      if (form.research_content) {
        fd.append("research_content", form.research_content);
      }

      if (form.remove_research_content) {
        fd.append("remove_research_content", "true");
      }

      const url = editing ? `/api/admin/research/${editing.id}` : "/api/admin/research";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd, credentials: "include" });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Save failed");
      }

      toast.success(editing ? "Research updated successfully" : "Research created successfully", {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      });
      setShowCreateModal(false);
      resetForm();
      await loadResearch();
    } catch (err) {
      toast.error(err.message, {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      });
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/research/${selectedItem.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Delete failed");
      }

      toast.success("Research deleted successfully", {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      });
      setShowDeleteModal(false);
      setSelectedItem(null);
      await loadResearch();
    } catch (err) {
      toast.error(err.message, {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      });
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === research.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(research.map(item => item.id)));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.size === 0) {
      toast.error("No items selected");
      return;
    }

    if (action === 'delete') {
      // Confirm bulk delete
      const confirm = window.confirm(`Are you sure you want to delete ${selectedItems.size} research items?`);
      if (!confirm) return;

      try {
        const res = await fetch('/api/admin/research/bulk', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: "include",
          body: JSON.stringify({ ids: Array.from(selectedItems) }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        toast.success(`Successfully deleted ${selectedItems.size} items`);
        setSelectedItems(new Set());
        await loadResearch();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        }}
      />

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedItem && (
          <DeleteModal2
            title="Delete Research Paper"
            description={
              <div className="space-y-2">
                <p>Are you sure you want to delete this research paper?</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-semibold text-red-700">{selectedItem.title}</p>
                      <p className="text-sm text-red-600">By {selectedItem.researcher_name}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
              </div>
            }
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
            onClose={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            title={
              <div className="flex items-center gap-3">
                {editing ? (
                  <>
                    <Edit2 className="w-6 h-6 text-[#03215F]" />
                    <span>Edit Research Paper</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-[#03215F]" />
                    <span>Create New Research</span>
                  </>
                )}
              </div>
            }
            size="xl"
          >
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] bg-white/50 transition-all"
                      placeholder="Enter research title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Researcher Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.researcher_name}
                      onChange={(e) => setForm({ ...form, researcher_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] bg-white/50 transition-all"
                      placeholder="Enter researcher's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      External Link
                    </label>
                    <input
                      type="url"
                      value={form.external_link}
                      onChange={(e) => setForm({ ...form, external_link: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] bg-white/50 transition-all"
                      placeholder="https://example.com/publication"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Featured Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-[#03215F] transition-colors">
                      {form.featured_preview ? (
                        <div className="relative">
                          <img
                            src={form.featured_preview}
                            alt="Preview"
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (editing && editing.featured_image_url) {
                                setForm({
                                  ...form,
                                  featured_image: null,
                                  featured_preview: "",
                                  remove_featured_image: true,
                                });
                              } else {
                                setForm({
                                  ...form,
                                  featured_image: null,
                                  featured_preview: "",
                                });
                              }
                            }}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-8">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 mb-2">Drop image here or click to upload</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFeaturedImage}
                        className="hidden"
                        id="featured-image-upload"
                      />
                      <label
                        htmlFor="featured-image-upload"
                        className="mt-4 inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                      >
                        Choose Image
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] bg-white/50 transition-all resize-none"
                  placeholder="Brief description about the research..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Research Document <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-[#03215F] transition-colors">
                  {form.research_content_name ? (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <File className="w-8 h-8 text-[#03215F]" />
                        <div>
                          <p className="font-medium text-gray-800">{form.research_content_name}</p>
                          <p className="text-sm text-gray-500">PDF, DOC, DOCX up to 25MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (editing && editing.research_content_url) {
                            setForm({
                              ...form,
                              research_content: null,
                              research_content_name: "",
                              remove_research_content: true,
                            });
                          } else {
                            setForm({
                              ...form,
                              research_content: null,
                              research_content_name: "",
                            });
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileDown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">Upload research document</p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 25MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResearchContent}
                    required={!editing || !editing.research_content_url}
                    className="hidden"
                    id="research-content-upload"
                  />
                  <label
                    htmlFor="research-content-upload"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#03215F] text-white rounded-lg hover:bg-[#03215F]/90 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#0A2A7A] text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                      {editing ? "Updating..." : "Creating..."}
                    </>
                  ) : editing ? (
                    <>
                      <Save className="w-5 h-5 inline mr-2" />
                      Update Research
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 inline mr-2" />
                      Create Research
                    </>
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="p-2 bg-gradient-to-br from-[#03215F] to-[#0A2A7A] rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Research Management</h1>
              </motion.div>
              <p className="text-gray-600">Manage research publications, papers, and documents</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#0A2A7A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Research
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Total Research</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="w-6 h-6 text-[#03215F]" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              All research papers and publications
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Last 7 Days</p>
                <p className="text-3xl font-bold text-gray-900">{stats.recent}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              New research added this week
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Unique Authors</p>
                <p className="text-3xl font-bold text-gray-900">{stats.authors}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Different researchers contributed
            </div>
          </motion.div>
        </div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search research by title, researcher, description..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({ ...filters, search: e.target.value });
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] bg-gray-50/50 transition-all"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters({ ...filters, search: "" })}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center gap-2 px-4 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              <select
                value={filters.sort}
                onChange={(e) => {
                  setFilters({ ...filters, sort: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
                className="px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] bg-gray-50/50"
              >
                <option value="created_at.desc">Newest First</option>
                <option value="created_at.asc">Oldest First</option>
                <option value="title.asc">Title A-Z</option>
                <option value="title.desc">Title Z-A</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 pt-6 border-t border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{selectedItems.size}</span> items selected
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedItems(new Set())}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Research Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : research.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-[#03215F]/10 to-[#AE9B66]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No research found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search
                ? "Try adjusting your search terms or filters"
                : "Get started by creating your first research publication"}
            </p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#0A2A7A] text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add Research
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {research.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition-all ${
                    selectedItems.has(item.id) 
                      ? 'border-[#03215F] ring-2 ring-[#03215F]/20' 
                      : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="relative">
                    {item.featured_image_url ? (
                      <img
                        src={item.featured_image_url}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-[#03215F]/5 via-[#AE9B66]/5 to-[#03215F]/5 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedItems);
                          if (e.target.checked) {
                            newSelected.add(item.id);
                          } else {
                            newSelected.delete(item.id);
                          }
                          setSelectedItems(newSelected);
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-[#03215F] focus:ring-[#03215F]"
                      />
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white shadow-sm"
                        >
                          <Edit2 className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white shadow-sm"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <CalendarDays className="w-3 h-3" />
                      <span>{formatDate(item.created_at)}</span>
                      {item.updated_at !== item.created_at && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full">Updated</span>
                        </>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 hover:text-[#03215F] transition-colors">
                      {item.title}
                    </h3>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{item.researcher_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowViewModal(true);
                        }}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      {item.research_content_url && (
                        <a
                          href={item.research_content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 bg-gradient-to-r from-[#03215F] to-[#0A2A7A] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {((pagination.page - 1) * pagination.per_page) + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min(pagination.page * pagination.per_page, pagination.total)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">{pagination.total}</span>{" "}
                  results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                      let pageNum;
                      if (pagination.total_pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.total_pages - 2) {
                        pageNum = pagination.total_pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => setPagination({ ...pagination, page: pageNum })}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            pagination.page === pageNum
                              ? "bg-[#03215F] text-white"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.total_pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* View Modal */}
        <AnimatePresence>
          {showViewModal && selectedItem && (
            <Modal
              open={showViewModal}
              onClose={() => {
                setShowViewModal(false);
                setSelectedItem(null);
              }}
              title={
                <div className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-[#03215F]" />
                  <span className="truncate">{selectedItem.title}</span>
                </div>
              }
              size="xl"
            >
              <div className="space-y-6">
                {selectedItem.featured_image_url && (
                  <div className="rounded-xl overflow-hidden">
                    <img
                      src={selectedItem.featured_image_url}
                      alt={selectedItem.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Description</h4>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                      {selectedItem.description || "No description provided"}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Researcher</h4>
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-800">{selectedItem.researcher_name}</span>
                    </div>
                  </div>
                </div>
                
                {selectedItem.external_link && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">External Link</h4>
                    <a
                      href={selectedItem.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {selectedItem.external_link}
                    </a>
                  </div>
                )}
                
                {selectedItem.research_content_url && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Research Document</h4>
                    <a
                      href={selectedItem.research_content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#0A2A7A] text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Download Research Paper
                    </a>
                  </div>
                )}
                
                <div className="pt-6 border-t">
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      <span>Created: {formatDate(selectedItem.created_at)}</span>
                    </div>
                    {selectedItem.updated_at !== selectedItem.created_at && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Updated: {formatDate(selectedItem.updated_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => openEditModal(selectedItem)}
                    className="px-6 py-2 bg-[#03215F] text-white rounded-lg hover:bg-[#03215F]/90 transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}