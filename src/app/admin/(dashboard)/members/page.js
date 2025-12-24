"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  UserPlus,
  User,
  Mail,
  Phone,
  Trash2,
  Edit2,
  Eye,
  X,
  Download,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Shield,
  Calendar,
  Building,
  Briefcase,
  CreditCard,
  UserCheck,
  UserX,
  Users,
  Upload,
  FileText
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Custom Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-[#b8352d]">
                <AlertCircle className="w-6 h-6 text-[#b8352d]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {message}
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <p className="text-gray-700 text-sm">
                This action cannot be undone. All associated data will be
                permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#b8352d] to-[#b8352d] text-white rounded-xl font-medium hover:from-[#b8352d] hover:to-[#b8352d] transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Custom Modal Components with Animation
const BaseModal = ({ isOpen, onClose, children, size = "md" }) => {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto modal-scrollbar"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`${sizes[size]} w-full max-w-[95vw] sm:max-w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("created_at.desc");
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [activeMember, setActiveMember] = useState(null);
  const [deleteConfig, setDeleteConfig] = useState({ type: "single", ids: [] });

  // Form state
  const initialForm = {
    email: "",
    password: "",
    full_name: "",
    phone: "",
    mobile: "",
    role: "member",
    membership_code: "",
    membership_status: "active",
    gender: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    pin_code: "",
    cpr_id: "",
    nationality: "",
    type_of_application: "",
    membership_date: "",
    work_sector: "",
    employer: "",
    position: "",
    specialty: "",
    category: "",
    membership_fee_registration: 30.0,
    membership_fee_annual: 20.0,
    membership_pay_now: false,
    payment_reference: "",
  };
  const [form, setForm] = useState(initialForm);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const fileInputRef = useRef(null);

  // Theme colors
  const themeColors = {
    primary: "#03215F",
    secondary: "#AE9B66",
    accentRed: "#b8352d",
    accentBlue: "#9cc2ed",
    accentYellow: "#ECCF0F",
    success: "#AE9B66",
    warning: "#ECCF0F",
    danger: "#b8352d",
    info: "#9cc2ed",
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query, sort]);

  async function fetchMembers() {
    setLoading(true);
    try {
      const url = new URL("/api/admin/members", window.location.origin);
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", String(perPage));
      if (query) url.searchParams.set("q", query);
      if (sort) url.searchParams.set("sort", sort);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setMembers(data.data || []);
        setTotal((data.meta && data.meta.total) || 0);
      } else {
        toast.error("Failed to load members: " + (data.error || "Unknown"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching members");
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === members.length && members.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(members.map((m) => m.id)));
    }
  }

  function openAddModal() {
    setForm(initialForm);
    setProfileImageFile(null);
    setShowAddModal(true);
  }

  function openEditModal(member) {
    setActiveMember(member);
    const p = member.member_profile || {};
    setForm({
      ...initialForm,
      email: member.email || "",
      password: "",
      full_name: member.full_name || "",
      phone: member.phone || "",
      mobile: member.mobile || "",
      role: member.role || "member",
      membership_code: member.membership_code || "",
      membership_status: member.membership_status || "active",
      gender: p.gender || "",
      dob: p.dob || "",
      address: p.address || "",
      city: p.city || "",
      state: p.state || "",
      pin_code: p.pin_code || "",
      cpr_id: p.cpr_id || "",
      nationality: p.nationality || "",
      type_of_application: p.type_of_application || "",
      membership_date: p.membership_date || "",
      work_sector: p.work_sector || "",
      employer: p.employer || "",
      position: p.position || "",
      specialty: p.specialty || "",
      category: p.category || "",
    });
    setProfileImageFile(null);
    setShowEditModal(true);
  }

  function openViewModal(member) {
    setActiveMember(member);
    setShowViewModal(true);
  }

  function openDeleteModal(type = "single", id = null) {
    if (type === "single" && id) {
      setDeleteConfig({ type: "single", ids: [id] });
      const member = members.find((m) => m.id === id);
      if (member) setActiveMember(member);
    } else if (type === "bulk") {
      setDeleteConfig({ type: "bulk", ids: Array.from(selectedIds) });
    }
    setShowDeleteModal(true);
  }

  async function handleAddSubmit(e) {
    e.preventDefault();

    if (!form.email || !form.full_name || !form.password) {
      toast.error("Please provide name, email and password for new member.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("email", form.email);
      fd.append("password_hash", form.password);
      fd.append("full_name", form.full_name);
      if (form.phone) fd.append("phone", form.phone);
      if (form.mobile) fd.append("mobile", form.mobile);
      fd.append("role", form.role);
      if (form.membership_code)
        fd.append("membership_code", form.membership_code);
      fd.append("membership_status", form.membership_status);

      const profileKeys = [
        "gender",
        "dob",
        "address",
        "city",
        "state",
        "pin_code",
        "cpr_id",
        "nationality",
        "type_of_application",
        "membership_date",
        "work_sector",
        "employer",
        "position",
        "specialty",
        "category",
      ];
      profileKeys.forEach((k) => {
        if (form[k]) fd.append(k, String(form[k]));
      });

      if (profileImageFile) fd.append("profile_image", profileImageFile);

      if (form.membership_fee_registration !== undefined)
        fd.append(
          "membership_fee_registration",
          String(form.membership_fee_registration)
        );
      if (form.membership_fee_annual !== undefined)
        fd.append("membership_fee_annual", String(form.membership_fee_annual));
      fd.append(
        "membership_pay_now",
        form.membership_pay_now ? "true" : "false"
      );
      if (form.payment_reference)
        fd.append("payment_reference", form.payment_reference);

      const res = await fetch("/api/admin/members", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        fetchMembers();
        toast.success("Member created successfully!");
      } else {
        toast.error("Create failed: " + (data.error || "Unknown"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Create error");
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!activeMember) return;

    try {
      const fd = new FormData();
      fd.append("full_name", form.full_name);
      fd.append("email", form.email);
      if (form.phone) fd.append("phone", form.phone);
      if (form.mobile) fd.append("mobile", form.mobile);
      fd.append("membership_status", form.membership_status);
      fd.append("role", form.role);
      if (form.membership_code)
        fd.append("membership_code", form.membership_code);

      const profileKeys = [
        "gender",
        "dob",
        "address",
        "city",
        "state",
        "pin_code",
        "cpr_id",
        "nationality",
        "type_of_application",
        "membership_date",
        "work_sector",
        "employer",
        "position",
        "specialty",
        "category",
      ];
      profileKeys.forEach((k) => {
        if (form[k] !== undefined) fd.append(k, String(form[k] || ""));
      });

      if (profileImageFile) fd.append("profile_image", profileImageFile);
      if (form.membership_fee_registration)
        fd.append(
          "membership_fee_registration",
          String(form.membership_fee_registration)
        );
      if (form.membership_fee_annual)
        fd.append("membership_fee_annual", String(form.membership_fee_annual));
      fd.append(
        "membership_pay_now",
        form.membership_pay_now ? "true" : "false"
      );
      if (form.payment_reference)
        fd.append("payment_reference", form.payment_reference);

      const res = await fetch(`/api/admin/members/${activeMember.id}`, {
        method: "PUT",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        setActiveMember(null);
        fetchMembers();
        toast.success("Member updated successfully!");
      } else {
        toast.error("Update failed: " + (data.error || "Unknown"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Update error");
    }
  }

  async function handleDelete() {
    try {
      if (deleteConfig.type === "single") {
        const res = await fetch(`/api/admin/members/${deleteConfig.ids[0]}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          fetchMembers();
          toast.success("Member deleted successfully!");
        } else {
          toast.error("Delete failed: " + (data.error || "Unknown"));
        }
      } else {
        const res = await fetch("/api/admin/members", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: deleteConfig.ids }),
        });
        const data = await res.json();
        if (data.success) {
          setSelectedIds(new Set());
          fetchMembers();
          toast.success(
            `${deleteConfig.ids.length} members deleted successfully!`
          );
        } else {
          toast.error("Bulk delete failed: " + (data.error || "Unknown"));
        }
      }
      setShowDeleteModal(false);
      setDeleteConfig({ type: "single", ids: [] });
    } catch (err) {
      console.error(err);
      toast.error("Delete error");
    }
  }

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0];
    setProfileImageFile(f || null);
  }

  function renderMemberRow(member, index) {
    const statusColors = {
      active:
        "bg-[#AE9B66] text-white",
      inactive:
        "bg-[#ECCF0F] text-[#03215F]",
      blocked: "bg-[#b8352d] text-white",
    };

    return (
      <motion.tr
        key={member.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="hover:bg-gray-50 transition-colors border-b border-gray-200"
      >
        <td className="p-3 sm:p-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedIds.has(member.id)}
              onChange={() => toggleSelect(member.id)}
              className="w-4 h-4 rounded border-gray-300 text-[#03215F] focus:ring-[#03215F]"
            />
          </div>
        </td>
        <td className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200"
            >
              {member.profile_image ? (
                <img
                  src={member.profile_image}
                  alt={member.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </motion.div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {member.full_name}
              </div>
              <div className="text-sm text-gray-500 truncate flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {member.email}
              </div>
            </div>
          </div>
        </td>
        <td className="p-3 sm:p-4 hidden md:table-cell">
          <div className="text-xs sm:text-sm text-gray-700 flex items-center gap-1">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{member.mobile || member.phone || "-"}</span>
          </div>
        </td>
        <td className="p-3 sm:p-4 hidden lg:table-cell">
          <div className="text-xs sm:text-sm font-mono text-gray-700">
            {member.member_profile?.cpr_id || "-"}
          </div>
        </td>
        <td className="p-3 sm:p-4 hidden lg:table-cell">
          <div className="text-xs sm:text-sm text-gray-700">
            {member.member_profile?.category || "-"}
          </div>
        </td>
        <td className="p-3 sm:p-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColors[member.membership_status] ||
              "bg-gray-100 text-gray-800"
            }`}
          >
            {member.membership_status}
          </span>
        </td>
        <td className="p-3 sm:p-4">
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openViewModal(member)}
              className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-[#03215F] transition-colors"
              title="View"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openEditModal(member)}
              className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed]/80 text-[#03215F] hover:opacity-80 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openDeleteModal("single", member.id)}
              className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-[#b8352d] to-[#b8352d]/80 text-white hover:opacity-80 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.button>
          </div>
        </td>
      </motion.tr>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6">
      <Toaster position="top-right" />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={
          deleteConfig.type === "single"
            ? "Delete Member"
            : `Delete ${deleteConfig.ids.length} Members`
        }
        message={
          deleteConfig.type === "single"
            ? `Are you sure you want to delete "${activeMember?.full_name}"?`
            : `Are you sure you want to delete ${deleteConfig.ids.length} selected members?`
        }
        loading={bulkDeleting}
      />

      <div className="mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                Members Management
              </h1>
              <p className="text-gray-600 mt-2">
                Create, edit, view and manage members and membership fees.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 self-start sm:self-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/admin/members/bulk-upload')}
                className="px-6 py-3 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white rounded-xl font-medium hover:from-[#AE9B66] hover:to-[#AE9B66] transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <Upload className="w-5 h-5" />
                Bulk Upload
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openAddModal}
                className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#AE9B66] transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                Add Member
              </motion.button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <motion.div
              whileFocus={{ scale: 1.02 }}
              className="flex-1 relative"
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email, or membership code..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
              />
            </motion.div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchMembers()}
                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSelectAll}
                className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                title="Toggle Select All"
              >
                <Check className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectedIds.size > 0 && openDeleteModal("bulk")}
                disabled={selectedIds.size === 0}
                className="px-6 py-3 bg-gradient-to-r from-[#b8352d] to-[#b8352d] text-white rounded-xl font-medium hover:from-[#b8352d] hover:to-[#b8352d] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedIds.size})
              </motion.button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Members",
                value: total,
                icon: Users,
                color: "from-[#9cc2ed] to-[#03215F]",
              },
              {
                label: "Active Members",
                value: members.filter((m) => m.membership_status === "active")
                  .length,
                icon: UserCheck,
                color: "from-[#AE9B66] to-[#AE9B66]",
              },
              {
                label: "Inactive Members",
                value: members.filter((m) => m.membership_status === "inactive")
                  .length,
                icon: UserX,
                color: "from-[#ECCF0F] to-[#ECCF0F]",
              },
              {
                label: "Blocked Members",
                value: members.filter((m) => m.membership_status === "blocked")
                  .length,
                icon: Shield,
                color: "from-[#b8352d] to-[#b8352d]",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-full bg-gradient-to-br ${stat.color}`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.header>

        {/* Members Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto custom-scrollbar-thin">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white">
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.size === members.length &&
                        members.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#03215F] focus:ring-[#03215F]"
                    />
                  </th>
                  <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-white">
                    Member
                  </th>
                  <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-white hidden md:table-cell">
                    Contact
                  </th>
                  <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-white hidden lg:table-cell">
                    CPR ID
                  </th>
                  <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-white hidden lg:table-cell">
                    Category
                  </th>
                  <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-white">
                    Status
                  </th>
                  <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#03215F]" />
                        <p className="text-gray-600">
                          Loading members...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : members.length ? (
                  members.map((member, index) => renderMemberRow(member, index))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Users className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-600">
                          No members found
                        </p>
                        <p className="text-sm text-gray-500">
                          Try adjusting your search or add a new member
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg"
        >
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold">{(page - 1) * perPage + 1}</span> -{" "}
            <span className="font-semibold">
              {Math.min(page * perPage, total)}
            </span>{" "}
            of <span className="font-semibold">{total}</span> members
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <span className="px-4 py-2 bg-gradient-to-r from-[#03215F]/10 to-[#AE9B66]/10 text-[#03215F] rounded-lg font-medium">
              Page {page}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => p + 1)}
              disabled={page * perPage >= total}
              className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.footer>
      </div>

      {/* Add Modal */}
      <BaseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="xl"
      >
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                Add New Member
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                Fill in the member details
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form
            onSubmit={handleAddSubmit}
            className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] modal-scrollbar"
          >
            {/* Form content - Similar to your original but styled */}
            <div className="space-y-4 sm:space-y-6">
              {/* Basic Information Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    required
                    value={form.full_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, full_name: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile
                  </label>
                  <input
                    value={form.mobile}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mobile: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>

              {/* ... Rest of the form similar to above but styled ... */}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#AE9B66] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Member
                </button>
              </div>
            </div>
          </form>
        </div>
      </BaseModal>

      {/* View Modal */}
      <BaseModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        size="lg"
      >
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Member Details
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                View complete member information
              </p>
            </div>
            <button
              onClick={() => setShowViewModal(false)}
              className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {activeMember && (
              <>
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg"
                  >
                    {activeMember.profile_image ? (
                      <img
                        src={activeMember.profile_image}
                        alt={activeMember.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#03215F] to-[#AE9B66]">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activeMember.membership_status === "active"
                            ? "bg-[#AE9B66] text-white"
                            : activeMember.membership_status === "inactive"
                            ? "bg-[#ECCF0F] text-[#03215F]"
                            : "bg-[#b8352d] text-white"
                        }`}
                      >
                        {activeMember.membership_status}
                      </span>
                    </div>
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 truncate">
                          {activeMember.full_name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {activeMember.email}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-gradient-to-r from-[#03215F]/10 to-[#03215F]/10 text-[#03215F] rounded-full text-sm font-medium">
                        {activeMember.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>
                          {activeMember.mobile ||
                            activeMember.phone ||
                            "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {activeMember.membership_date
                            ? new Date(
                                activeMember.membership_date
                              ).toLocaleDateString()
                            : "Not set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>
                          {activeMember.member_profile?.gender ||
                            "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information Card */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#03215F]/10">
                        <User className="w-5 h-5 text-[#03215F]" />
                      </div>
                      Personal Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CPR ID
                        </p>
                        <p className="text-sm text-gray-900 font-mono mt-1">
                          {activeMember.member_profile?.cpr_id ||
                            "Not provided"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nationality
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {activeMember.member_profile?.nationality ||
                              "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date of Birth
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {activeMember.member_profile?.dob
                              ? new Date(
                                  activeMember.member_profile.dob
                                ).toLocaleDateString()
                              : "Not set"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {activeMember.member_profile?.address ||
                            "Not provided"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{activeMember.member_profile?.city}</span>
                          <span>{activeMember.member_profile?.state}</span>
                          <span>{activeMember.member_profile?.pin_code}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information Card */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#03215F]/10">
                        <Briefcase className="w-5 h-5 text-[#03215F]" />
                      </div>
                      Professional Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Work Sector
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {activeMember.member_profile?.work_sector ||
                            "Not specified"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employer
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {activeMember.member_profile?.employer ||
                              "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {activeMember.member_profile?.position ||
                              "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Specialty
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {activeMember.member_profile?.specialty ||
                              "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {activeMember.member_profile?.category ||
                              "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type of Application
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {activeMember.member_profile?.type_of_application ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Membership Information Card */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#03215F]/10">
                        <Shield className="w-5 h-5 text-[#03215F]" />
                      </div>
                      Membership Information
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Membership Code
                          </p>
                          <p className="text-sm text-gray-900 mt-1 font-mono">
                            {activeMember.membership_code || "Not assigned"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </p>
                          <p className="text-sm text-gray-900 mt-1 capitalize">
                            {activeMember.role}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registration Fee
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {activeMember.membership_fee_registration
                              ? `${activeMember.membership_fee_registration} BHD`
                              : "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Annual Fee
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {activeMember.membership_fee_annual
                              ? `${activeMember.membership_fee_annual} BHD`
                              : "Not set"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created Date
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {activeMember.created_at
                            ? new Date(
                                activeMember.created_at
                              ).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activity Card */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#03215F]/10">
                        <Calendar className="w-5 h-5 text-[#03215F]" />
                      </div>
                      Recent Activity
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Events Attended
                          </p>
                          <p className="text-xs text-gray-500">
                            Last 30 days
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-[#03215F]/10 text-white rounded-full text-sm font-medium">
                          0
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Total Payments
                          </p>
                          <p className="text-xs text-gray-500">
                            All time
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-[#AE9B66] text-white rounded-full text-sm font-medium">
                          0 BHD
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 text-center py-4">
                        <p>Detailed activity logs coming soon</p>
                        <p className="text-xs mt-1">
                          Check API for complete logs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-8 mt-8 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setTimeout(() => openEditModal(activeMember), 300);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-[#9cc2ed] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Member
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setTimeout(
                        () => openDeleteModal("single", activeMember.id),
                        300
                      );
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-[#b8352d] to-[#b8352d] text-white rounded-xl font-medium hover:from-[#b8352d] hover:to-[#b8352d] transition-all duration-200 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Member
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </BaseModal>

      {/* Edit Modal */}
      <BaseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        size="xl"
      >
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Edit Member
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Update member information
              </p>
            </div>
            <button
              onClick={() => setShowEditModal(false)}
              className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={handleEditSubmit}
            className="p-6 overflow-y-auto max-h-[70vh]"
          >
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#03215F]/10">
                    <User className="w-5 h-5 text-[#03215F]" />
                  </div>
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      required
                      value={form.full_name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, full_name: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Enter email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <input
                      value={form.mobile}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, mobile: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Enter mobile number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Membership Status *
                    </label>
                    <select
                      value={form.membership_status}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          membership_status: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      value={form.role}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, role: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#03215F]/10">
                    <User className="w-5 h-5 text-[#03215F]" />
                  </div>
                  Profile Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, gender: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, dob: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPR ID
                    </label>
                    <input
                      value={form.cpr_id}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, cpr_id: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Enter CPR ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nationality
                    </label>
                    <input
                      value={form.nationality}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nationality: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Enter nationality"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Enter category"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type of Application
                    </label>
                    <input
                      value={form.type_of_application}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          type_of_application: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Enter application type"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#03215F]/10">
                    <Building className="w-5 h-5 text-[#03215F]" />
                  </div>
                  Address Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={form.address}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, address: e.target.value }))
                      }
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all resize-none"
                      placeholder="Enter full address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        value={form.city}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, city: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        placeholder="Enter city"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        value={form.state}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, state: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        placeholder="Enter state"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code
                      </label>
                      <input
                        value={form.pin_code}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, pin_code: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        placeholder="Enter PIN code"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#03215F]/10">
                    <Briefcase className="w-5 h-5 text-[#03215F]" />
                  </div>
                  Professional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Sector
                    </label>
                    <input
                      value={form.work_sector}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, work_sector: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Enter work sector"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employer
                    </label>
                    <input
                      value={form.employer}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, employer: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Enter employer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <input
                      value={form.position}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, position: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Enter position"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialty
                    </label>
                    <input
                      value={form.specialty}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, specialty: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Enter specialty"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Image Upload */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#03215F]/10">
                    <User className="w-5 h-5 text-[#03215F]" />
                  </div>
                  Profile Image
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      {activeMember?.profile_image && !profileImageFile ? (
                        <img
                          src={activeMember.profile_image}
                          alt="Current profile"
                          className="w-full h-full object-cover"
                        />
                      ) : profileImageFile ? (
                        <img
                          src={URL.createObjectURL(profileImageFile)}
                          alt="New profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block mb-2">
                        <span className="px-4 py-2.5 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#AE9B66] transition-all duration-200 inline-flex items-center gap-2 cursor-pointer">
                          <Upload className="w-4 h-4" />
                          Upload New Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </span>
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        Recommended: Square image, max 5MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#AE9B66] transition-all duration-200 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </BaseModal>
    </div>
  );
}
