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
  Camera,
  Briefcase,
  UserCircle,
  Target,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Save,
  Hash,
  Sparkles,
  Mail,
  Phone,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Modal from "@/components/Modal";
import DeleteModal2 from "@/components/DeleteModal2";

export default function AdminSiteMembersPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
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
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    title: "",
    role: "",
    bio: "",
    email: "",
    phone: "",
    instagram: "",
    linkedin: "",
    facebook: "",
    twitter: "",
    sort_order: 0,
    is_active: true,
    photo_file: null,
    photo_preview: "",
    photo_url: "",
  });

  // Load members with pagination and filters
  const loadMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters,
      });

      const res = await fetch(`/api/admin/site-members?${params}`, { 
        credentials: "include" 
      });
      const data = await res.json();
      
      if (data.success) {
        setMembers(data.members || []);
        setPagination(data.pagination || {
          page: 1,
          limit: 9,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else {
        toast.error(data.message || "Failed to load members");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
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
      name: "",
      title: "",
      role: "",
      bio: "",
      email: "",
      phone: "",
      instagram: "",
      linkedin: "",
      facebook: "",
      twitter: "",
      sort_order: 0,
      is_active: true,
      photo_file: null,
      photo_preview: "",
      photo_url: "",
    });
  };

  // Open create modal
  const openCreateModal = () => {
    setEditing(null);
    resetForm();
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (member) => {
    setEditing(member);
    setForm({
      name: member.name || "",
      title: member.title || "",
      role: member.role || "",
      bio: member.bio || "",
      email: member.email || "",
      phone: member.phone || "",
      instagram: member.instagram || "",
      linkedin: member.linkedin || "",
      facebook: member.facebook || "",
      twitter: member.twitter || "",
      sort_order: member.sort_order || 0,
      is_active: !!member.is_active,
      photo_file: null,
      photo_preview: member.photo_url || "",
      photo_url: member.photo_url || "",
    });
    setShowCreateModal(true);
  };

  // Open delete modal
  const openDeleteModal = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  // Handle photo selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPG, PNG, WEBP, GIF)");
      return;
    }
    
    if (file.size > maxSize) {
      toast.error("Image size should be less than 2MB");
      return;
    }
    
    setForm((prev) => ({ 
      ...prev, 
      photo_file: file, 
      photo_preview: URL.createObjectURL(file) 
    }));
  };

  // Handle save
  const handleSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    
    try {
      if (!form.name.trim()) {
        toast.error("Name is required");
        setModalLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("title", form.title || "");
      fd.append("role", form.role || "");
      fd.append("bio", form.bio || "");
      fd.append("email", form.email || "");
      fd.append("phone", form.phone || "");
      fd.append("instagram", form.instagram || "");
      fd.append("linkedin", form.linkedin || "");
      fd.append("facebook", form.facebook || "");
      fd.append("twitter", form.twitter || "");
      fd.append("sort_order", String(Number(form.sort_order) || 0));
      fd.append("is_active", String(!!form.is_active));
      
      if (form.photo_file) {
        fd.append("photo", form.photo_file);
      } else if (!editing && form.photo_url) {
        fd.append("photo_url", form.photo_url);
      }

      const url = editing 
        ? `/api/admin/site-members/${editing.id}` 
        : "/api/admin/site-members";
      
      const method = editing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        body: fd,
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Save failed");
      }
      
      toast.success(editing ? "Team member updated successfully" : "Team member added successfully");
      setShowCreateModal(false);
      resetForm();
      await loadMembers();
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedMember) return;

    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/site-members/${selectedMember.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Delete failed");
      }
      
      toast.success("Team member deleted successfully");
      setShowDeleteModal(false);
      setSelectedMember(null);
      await loadMembers();
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setModalLoading(false);
    }
  };

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

  // Position badge component
  const TitleBadge = ({ title }) => {
    if (!title) return null;
    
    const getTitleColor = (titleText) => {
      const lowerTitle = titleText.toLowerCase();
      if (lowerTitle.includes('chair') || lowerTitle.includes('president') || lowerTitle.includes('director')) {
        return "bg-gradient-to-r from-[#AE9B66] to-[#ECCF0F] text-[#03215F]";
      } else if (lowerTitle.includes('vice') || lowerTitle.includes('deputy') || lowerTitle.includes('head')) {
        return "bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed] text-[#03215F]";
      } else if (lowerTitle.includes('secretary') || lowerTitle.includes('treasurer') || lowerTitle.includes('coordinator')) {
        return "bg-gradient-to-r from-[#03215F] to-[#03215F] text-white";
      }
      return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700";
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getTitleColor(title)}`}>
        <Briefcase className="w-3 h-3" />
        {title}
      </span>
    );
  };

  // Role badge component
  const RoleBadge = ({ role }) => {
    if (!role) return null;
    
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
        <Target className="w-3 h-3" />
        {role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedMember && (
          <DeleteModal2
            title="Delete Team Member"
            description={
              <>
                Are you sure you want to delete <span className="font-semibold">"{selectedMember.name}"</span>?
                <p className="text-sm text-gray-600 mt-1">
                  This action cannot be undone.
                </p>
              </>
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
            onClose={() => setShowCreateModal(false)}
            title={editing ? "Edit Team Member" : "Add New Team Member"}
            size="lg"
          >
            <form onSubmit={handleSave} className="space-y-6">
              {/* Member Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserCircle className="w-5 h-5" />
                  Team Member Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                      placeholder="Enter team member's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title / Position
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                        placeholder="e.g., President, Director, Member"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role / Specialization
                    </label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                        placeholder="e.g., Orthodontics, Administration"
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

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio / Description
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent h-32 resize-none"
                    placeholder="Brief bio or description..."
                    rows={4}
                  />
                </div>
              </motion.div>

              {/* Contact & Social */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact & Social
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                        placeholder="+973 0000 0000"
                      />
                    </div>
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.instagram}
                        onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.linkedin}
                        onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.facebook}
                        onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                        placeholder="https://facebook.com/username"
                      />
                    </div>
                  </div>

                  {/* X (Twitter) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      X (Twitter)
                    </label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.twitter}
                        onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Profile Photo */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Profile Photo
                </h3>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Photo Preview */}
                  <div className="flex-1">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 overflow-hidden mx-auto md:mx-0">
                      {form.photo_preview ? (
                        <img 
                          src={form.photo_preview} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                          <UserCircle className="w-12 h-12 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500 text-center">
                            No photo
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Upload Controls */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Profile Photo
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-[#9cc2ed] file:to-[#9cc2ed] file:text-[#03215F] hover:file:opacity-90"
                        />
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700">
                        <span className="font-semibold">Recommended:</span> Square image (1:1 ratio), 
                        JPG or PNG format, under 2MB. Ideal size: 400×400 pixels.
                      </p>
                    </div>
                    
                    {/* Photo URL fallback */}
                    {!form.photo_file && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Or enter photo URL
                        </label>
                        <input
                          type="text"
                          value={form.photo_url}
                          onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                          placeholder="https://example.com/photo.jpg"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Active Status */}
                <div className="mt-4 flex items-center gap-2 p-4 bg-white border border-gray-300 rounded-xl">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#03215F] rounded focus:ring-[#03215F]"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active (visible on team page)
                  </label>
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
                      {editing ? "Update Member" : "Add Team Member"}
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                  Team Members
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage team members displayed on the Team page
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
              Add Team Member
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
                placeholder="Search team members..."
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
                <option value="title">Title</option>
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
          
          {/* Team Info */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Sparkles className="w-4 h-4" />
              <span>
                <strong>Display:</strong> All team members are displayed on the main Team page
              </span>
            </div>
          </div>
        </motion.div>

        {/* MEMBERS GRID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#03215F] animate-spin mb-4" />
              <p className="text-gray-600">Loading team members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Users className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                No team members found
              </p>
              <p className="text-gray-500 text-sm mb-6">
                {filters.search
                  ? "Try changing your search term"
                  : "Add your first team member to get started"}
              </p>
              <button
                onClick={openCreateModal}
                className="px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Team Member
              </button>
            </div>
          ) : (
            <>
              {/* Cards Grid */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                    >
                      {/* Card Header */}
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Profile Photo */}
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-white shadow-md overflow-hidden">
                              {member.photo_url ? (
                                <img
                                  src={member.photo_url}
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed]">
                                  <UserCircle className="w-8 h-8 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#AE9B66] to-[#ECCF0F] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                              {member.sort_order || 0}
                            </div>
                          </div>

                          {/* Member Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-gray-900 truncate capitalize">
                                {member.name}
                              </h3>
                              <button
                                onClick={() => openDeleteModal(member)}
                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-1.5 mt-2 mb-3">
                              <TitleBadge title={member.title} />
                              <RoleBadge role={member.role} />
                              <StatusBadge isActive={member.is_active} />
                            </div>

                            {/* Sort Order */}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Hash className="w-4 h-4" />
                              <span className="truncate">
                                Display Order: {member.sort_order || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        {member.bio && (
                          <div className="mt-4 pt-4 border-t border-gray-200/60">
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {member.bio}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200/60">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => window.open('/team', '_blank')}
                            className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 transition-colors hover:scale-105 active:scale-95"
                            title="View on Team Page"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(member)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed] text-[#03215F] hover:text-[#03215F] transition-colors hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span className="text-sm font-medium">Edit</span>
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
                    team members
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