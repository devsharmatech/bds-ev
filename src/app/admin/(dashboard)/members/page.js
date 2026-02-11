"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/lib/uploadClient";
import {
  Search,
  Plus,
  UserPlus,
  User,
  ShieldCheck,
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
  FileText,
  CheckCircle,
  AlertTriangle,
  FileImage,
  Camera,
  IdCard,
  Image as ImageIcon,
  FileUp,
  Clock,
  Verified,
  Globe
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
                <AlertCircle className="w-6 h-6 text-white" />
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
            className={`${sizes[size]} w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Custom File Upload Component for Verification
const VerificationFileUpload = ({
  label,
  icon: Icon,
  file,
  onFileChange,
  accept = "image/*,application/pdf",
  required = true,
  description = "",
  existingUrl = null
}) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (file) {
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      } else {
        setPreview(null);
      }
    } else if (existingUrl) {
      setPreview(existingUrl);
    } else {
      setPreview(null);
    }
  }, [file, existingUrl]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-900">
        {label} {required && <span className="text-[#b8352d]">*</span>}
      </label>

      <div className={`relative border-2 ${file ? 'border-[#AE9B66]' : 'border-gray-300'} border-dashed rounded-2xl p-6 transition-all duration-200 hover:border-[#03215F] ${file ? 'bg-[#AE9B66]/5' : 'bg-gray-50'}`}>
        <input
          type="file"
          accept={accept}
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          required={required}
        />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className={`p-4 rounded-full ${file ? 'bg-[#AE9B66]/20' : 'bg-gray-100'}`}>
            <Icon className={`w-8 h-8 ${file ? 'text-[#AE9B66]' : 'text-gray-400'}`} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg font-medium text-sm">
                <Upload className="w-4 h-4 inline mr-2" />
                {file ? 'Change File' : 'Upload File'}
              </div>
            </div>

            <p className="text-sm text-gray-500">
              {file ? (
                <span className="flex items-center justify-center gap-2 text-[#AE9B66] font-medium">
                  <CheckCircle className="w-4 h-4" />
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </span>
              ) : existingUrl ? (
                <span className="flex items-center justify-center gap-2 text-[#10B981] font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Document already uploaded
                </span>
              ) : (
                `Click to upload ${accept.includes('pdf') ? 'PDF or image' : 'image'}`
              )}
            </p>

            {description && (
              <p className="text-xs text-gray-400 mt-2">{description}</p>
            )}
          </div>
        </div>

        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-2"
          >
            <p className="text-sm font-medium text-gray-700">Preview:</p>
            <div className="relative h-48 rounded-xl overflow-hidden border border-gray-200">
              {file && file.type && file.type.includes('application/pdf') ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{file.name}</p>
                  </div>
                </div>
              ) : existingUrl && existingUrl.toLowerCase().endsWith('.pdf') ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <a
                      href={existingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#03215F] hover:underline"
                    >
                      View PDF Document
                    </a>
                  </div>
                </div>
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain bg-gray-50"
                />
              )}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-lg">
                {file && file.type ? (file.type.includes('image') ? 'Image' : 'PDF') : 
                 existingUrl && existingUrl.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Image'}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default function MembersPage() {
  const router = useRouter();
  
  // Option constants (same as RegistrationLiteModal)
  const COUNTRY_OPTIONS = [
    { label: "Bahrain", code: "BH", dial: "+973" },
    { label: "Saudi Arabia", code: "SA", dial: "+966" },
    { label: "United Arab Emirates", code: "AE", dial: "+971" },
    { label: "Qatar", code: "QA", dial: "+974" },
    { label: "Kuwait", code: "KW", dial: "+965" },
    { label: "Oman", code: "OM", dial: "+968" },
    { label: "India", code: "IN", dial: "+91" },
    { label: "Other", code: "OT", dial: "+" },
  ];
  const SPECIALIZATION_OPTIONS = [
    "General Dentistry",
    "Orthodontics",
    "Endodontics",
    "Prosthodontics",
    "Oral & Maxillofacial Surgery",
    "Pediatric Dentistry",
    "Oral Medicine / Radiology",
    "Dental Hygiene",
    "Student",
    "Other",
  ];
  const CATEGORY_OPTIONS = [
    "Dentist",
    "Dental Hygienist",
    "Dental Technologist",
    "Dental Assistant",
    "Student - Undergraduate",
    "Student - Postgraduate",
    "Others (Non Dental)",
  ];
  const POSITION_OPTIONS = [
    "General Dentist",
    "Specialist",
    "Consultant",
    "Resident",
    "Intern",
    "HOD / Lead",
    "Faculty / Lecturer",
    "Dental Hygienist",
    "Dental Assistant",
    "Dental Technologist",
    "Student",
    "Administrator",
    "Other",
  ];
  const WORK_SECTOR_OPTIONS = [
    "Public",
    "Private",
    "Academic",
    "Student",
    "Other",
  ];

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("created_at.desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // all | today
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [summaryCounts, setSummaryCounts] = useState({
    total: 0,
    today: 0,
    active: 0,
    inactive: 0,
    blocked: 0,
    paid: 0,
    free: 0,
    verified: 0,
    pending: 0,
    expiringSoon: 0,
  });
  const [planStats, setPlanStats] = useState([]);
  
  // Country options state (for nationality dropdown)
  const [countryOptions, setCountryOptions] = useState(COUNTRY_OPTIONS);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [activeMember, setActiveMember] = useState(null);
  const [viewFeeSummary, setViewFeeSummary] = useState(null);
  const [viewAttendanceLogs, setViewAttendanceLogs] = useState([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyIdCard, setVerifyIdCard] = useState(null);
  const [verifyPersonalPhoto, setVerifyPersonalPhoto] = useState(null);
  const [usePersonalAsProfile, setUsePersonalAsProfile] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ type: "single", ids: [] });
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Form state
  const initialForm = {
    email: "",
    password: "",
    full_name: "",
    phone: "",
    mobile: "",
    countryDial: "+973",
    nationalityCode: "BH",
    role: "member",
    membership_code: "",
    membership_status: "active",
    membership_type: "free",
    subscription_plan: "",
    membership_expiry_date: "",
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
    license_number: "",
    years_of_experience: "",
    membership_fee_registration: 30.0,
    membership_fee_annual: 20.0,
    membership_pay_now: false,
    payment_reference: "",
  };
  const [form, setForm] = useState(initialForm);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [addIdCardFile, setAddIdCardFile] = useState(null);
  const [addPersonalPhotoFile, setAddPersonalPhotoFile] = useState(null);
  const fileInputRef = useRef(null);

  // Theme colors
  const themeColors = {
    primary: "#03215F",
    secondary: "#AE9B66",
    accentRed: "#b8352d",
    accentBlue: "#9cc2ed",
    accentYellow: "#ECCF0F",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#b8352d",
    info: "#3B82F6",
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query, sort, perPage, statusFilter, planFilter, verifiedFilter, dateFilter, fromDate, toDate]);

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch full country list for nationality dropdown
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd");
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const mapped = data
          .map((c) => {
            const code = c.cca2;
            const label = c.name?.common || code;
            const root = c.idd?.root || "";
            const suffixes = c.idd?.suffixes || [];
            const dial = root ? root + (suffixes[0] || "") : "";
            return { label, code, dial };
          })
          .filter((c) => c.label)
          .sort((a, b) => a.label.localeCompare(b.label));
        if (!cancelled) setCountryOptions(mapped);
      } catch {
        // ignore; fallback list already present
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function fetchSummary() {
    try {
      const per = 200;
      const firstUrl = new URL("/api/admin/members", window.location.origin);
      firstUrl.searchParams.set("page", "1");
      firstUrl.searchParams.set("per_page", String(per));
      const firstRes = await fetch(firstUrl.toString());
      const firstData = await firstRes.json();
      if (!firstData?.success) return;

      let all = Array.isArray(firstData.data) ? firstData.data : [];
      const totalAll = (firstData.meta && firstData.meta.total) || all.length;
      const totalPages = Math.max(1, Math.ceil(totalAll / per));

      const promises = [];
      for (let p = 2; p <= totalPages; p++) {
        const url = new URL("/api/admin/members", window.location.origin);
        url.searchParams.set("page", String(p));
        url.searchParams.set("per_page", String(per));
        promises.push(fetch(url.toString()).then((r) => r.json()).catch(() => null));
      }

      if (promises.length) {
        const results = await Promise.all(promises);
        results.forEach((d) => {
          if (d?.success && Array.isArray(d.data)) {
            all = all.concat(d.data);
          }
        });
      }

      const nonAdmins = all.filter((m) => m.role !== "admin");
      const totalCount = nonAdmins.length;
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayCount = nonAdmins.filter((m) =>
        m.created_at && m.created_at.slice(0, 10) === todayStr
      ).length;
      const activeCount = nonAdmins.filter((m) => m.membership_status === "active").length;
      const inactiveCount = nonAdmins.filter((m) => m.membership_status === "inactive").length;
      const blockedCount = nonAdmins.filter((m) => m.membership_status === "blocked").length;
      const paidCount = nonAdmins.filter((m) => m.membership_type === "paid").length;
      // Free members are explicitly marked as "free" or have no membership_type set
      const freeCount = nonAdmins.filter((m) => !m.membership_type || m.membership_type === "free").length;
      const verifiedCount = nonAdmins.filter((m) => m.is_member_verified === true).length;
      // Pending approvals = members who are NOT verified yet
      const pendingCount = nonAdmins.filter((m) => !m.is_member_verified).length;

      // Members whose membership is expiring in the next 30 days
      const now = new Date();
      const in30Days = new Date(now);
      in30Days.setDate(in30Days.getDate() + 30);
      const expiringSoonCount = nonAdmins.filter((m) => {
        if (!m.membership_expiry_date) return false;
        const d = new Date(m.membership_expiry_date);
        if (Number.isNaN(d.getTime())) return false;
        return d >= now && d <= in30Days;
      }).length;

      // Distribution by membership plan type (exact 5 buckets)
      const planMap = {
        Active: 0,
        Associate: 0,
        Student: 0,
        Honorary: 0,
        Free: 0,
      };

      nonAdmins.forEach((m) => {
        // All non-paid (or missing type) members are counted in Free
        if (!m.membership_type || m.membership_type === "free") {
          planMap.Free += 1;
          return;
        }

        const rawName = (m.current_subscription_plan_name || "").toLowerCase().trim();

        if (rawName.includes("student")) planMap.Student += 1;
        else if (rawName.includes("associate")) planMap.Associate += 1;
        else if (rawName.includes("honorary")) planMap.Honorary += 1;
        else if (rawName.includes("free")) planMap.Free += 1;
        else if (rawName.includes("active") || rawName.includes("dentist")) planMap.Active += 1;
        else planMap.Active += 1; // default bucket for paid without clear plan name
      });

      const orderedPlans = ["Active", "Associate", "Student", "Honorary", "Free"];
      const planStatsData = orderedPlans.map((name) => {
        const count = planMap[name] || 0;
        return {
          name,
          count,
          percentage: totalCount ? Math.round((count / totalCount) * 100) : 0,
        };
      });

      setSummaryCounts({
        total: totalCount,
        today: todayCount,
        active: activeCount,
        inactive: inactiveCount,
        blocked: blockedCount,
        paid: paidCount,
        free: freeCount,
        verified: verifiedCount,
        pending: pendingCount,
        expiringSoon: expiringSoonCount,
      });
      setPlanStats(planStatsData);
    } catch {
      // ignore
    }
  }

  async function fetchMembers() {
    setLoading(true);
    try {
      const url = new URL("/api/admin/members", window.location.origin);
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", String(perPage));
      url.searchParams.set("role", "member");
      if (query) url.searchParams.set("q", query);
      if (sort) url.searchParams.set("sort", sort);
      if (statusFilter && statusFilter !== "all") {
        url.searchParams.set("status", statusFilter);
      }
      if (planFilter && planFilter !== "all") {
        url.searchParams.set("plan", planFilter);
      }
      if (verifiedFilter && verifiedFilter !== "all") {
        url.searchParams.set("verified", verifiedFilter === "verified" ? "true" : "false");
      }
      if (dateFilter === "today") {
        url.searchParams.set("date", "today");
      }
      if (fromDate) {
        url.searchParams.set("from_date", fromDate);
      }
      if (toDate) {
        url.searchParams.set("to_date", toDate);
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setMembers(data.data || []);
        setTotal((data.meta && data.meta.total) || 0);
        fetchSummary();
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

  function formatDateISO(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toISOString().split("T")[0];
  }

  async function handleExportCSV() {
    try {
      setExporting(true);

      const per = 500;
      const firstUrl = new URL("/api/admin/members", window.location.origin);
      firstUrl.searchParams.set("page", "1");
      firstUrl.searchParams.set("per_page", String(per));
      const firstRes = await fetch(firstUrl.toString());
      const firstData = await firstRes.json();
      if (!firstData?.success) {
        toast.error("Failed to export members: " + (firstData?.error || "Unknown"));
        return;
      }

      let all = Array.isArray(firstData.data) ? firstData.data : [];
      const totalAll = (firstData.meta && firstData.meta.total) || all.length;
      const totalPages = Math.max(1, Math.ceil(totalAll / per));

      const promises = [];
      for (let p = 2; p <= totalPages; p++) {
        const url = new URL("/api/admin/members", window.location.origin);
        url.searchParams.set("page", String(p));
        url.searchParams.set("per_page", String(per));
        promises.push(fetch(url.toString()).then((r) => r.json()).catch(() => null));
      }

      if (promises.length) {
        const results = await Promise.all(promises);
        results.forEach((d) => {
          if (d?.success && Array.isArray(d.data)) {
            all = all.concat(d.data);
          }
        });
      }

      const nonAdmins = all.filter((m) => m.role !== "admin");

      const headers = [
        "email",
        "full_name",
        "membership_code",
        "membership_status",
        "membership_type",
        "membership_expiry_date",
        "phone",
        "mobile",
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
        "license_number",
        "years_of_experience",
      ];

      const rows = nonAdmins.map((m) => {
        const p = m.member_profile || {};
        return [
          m.email || "",
          m.full_name || "",
          m.membership_code || "",
          m.membership_status || "",
          m.membership_type || "",
          formatDateISO(m.membership_expiry_date),
          m.phone || "",
          m.mobile || "",
          p.gender || "",
          formatDateISO(p.dob),
          p.address || "",
          p.city || "",
          p.state || "",
          p.pin_code || "",
          p.cpr_id || "",
          p.nationality || "",
          p.type_of_application || "",
          formatDateISO(p.membership_date),
          p.work_sector || "",
          p.employer || "",
          p.position || "",
          p.specialty || "",
          p.category || "",
          p.license_number || "",
          p.years_of_experience || "",
        ];
      });

      const content = [headers, ...rows]
        .map((row) => row.map((value) => {
          if (value == null) return "";
          const str = String(value);
          if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
            return '"' + str.replace(/"/g, '""') + '"';
          }
          return str;
        }).join(","))
        .join("\n");

      const blob = new Blob([content], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "members_export_with_expiry.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Members CSV exported successfully");
    } catch (err) {
      console.error("Export members CSV error", err);
      toast.error("Failed to export members CSV");
    } finally {
      setExporting(false);
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
    // Find country code from nationality
    const nationalityStr = p.nationality || "";
    const foundCountry = countryOptions.find(
      (c) => c.label === nationalityStr || c.code === nationalityStr
    );
    const natCode = foundCountry?.code || "BH";
    const natDial = foundCountry?.dial || "+973";
    
    setForm({
      ...initialForm,
      email: member.email || "",
      password: "",
      full_name: member.full_name || "",
      phone: member.phone || "",
      mobile: member.mobile || "",
      countryDial: natDial,
      nationalityCode: natCode,
      role: member.role || "member",
      membership_code: member.membership_code || "",
      membership_status: member.membership_status || "active",
      membership_type: member.membership_type || "free",
      subscription_plan:
        (member.current_subscription_plan_name || "").toLowerCase().includes("active")
          ? "active"
          : (member.current_subscription_plan_name || "").toLowerCase().includes("associate")
          ? "associate"
          : (member.current_subscription_plan_name || "").toLowerCase().includes("honorary")
          ? "honorary"
          : (member.current_subscription_plan_name || "").toLowerCase().includes("student")
          ? "student"
          : "",
      membership_expiry_date: member.membership_expiry_date
        ? formatDateISO(member.membership_expiry_date)
        : "",
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
      license_number: p.license_number || "",
      years_of_experience: p.years_of_experience || "",
    });
    setProfileImageFile(null);
    setShowEditModal(true);
  }

  function openVerifyModal(member) {
    setActiveMember(member);
    setVerifyIdCard(null);
    setVerifyPersonalPhoto(null);
    setShowVerifyModal(true);
  }

  async function handleVerifySubmit(e) {
    e.preventDefault();
    if (!activeMember) return;

    // Check if documents exist or are being uploaded
    const hasIdCard = verifyIdCard || activeMember?.member_profile?.id_card_url;
    const hasPersonalPhoto = verifyPersonalPhoto || activeMember?.member_profile?.personal_photo_url;

    if (!hasIdCard || !hasPersonalPhoto) {
      toast.error("Please upload both ID card and personal photo, or use existing documents.");
      return;
    }

    // Validate file types (only if new files are being uploaded)
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    const allowedPdfTypes = ['application/pdf'];

    if (verifyIdCard) {
      if (![...allowedImageTypes, ...allowedPdfTypes].includes(verifyIdCard.type)) {
        toast.error("ID card must be an image (JPG, PNG, GIF, WEBP) or PDF file.");
        return;
      }
      // Validate file size (10MB max for verification documents)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (verifyIdCard.size > maxSize) {
        toast.error("ID card file size must be less than 10MB.");
        return;
      }
    }

    if (verifyPersonalPhoto) {
      if (!allowedImageTypes.includes(verifyPersonalPhoto.type)) {
        toast.error("Personal photo must be an image file (JPG, PNG, GIF, WEBP).");
        return;
      }
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (verifyPersonalPhoto.size > maxSize) {
        toast.error("Personal photo file size must be less than 10MB.");
        return;
      }
    }

    try {
      setVerifying(true);

      // Upload verification documents directly to Supabase
      const payload = {
        is_member_verified: "true",
        set_personal_as_profile: usePersonalAsProfile ? "true" : "false",
        verification_date: new Date().toISOString(),
        verified_by_admin: "true",
      };

      if (verifyIdCard) {
        const result = await uploadFile(verifyIdCard, "profile_pictures", `verification/${activeMember.id}`);
        payload.verification_id_card_url = result.publicUrl;
      }
      if (verifyPersonalPhoto) {
        const result = await uploadFile(verifyPersonalPhoto, "profile_pictures", `verification/${activeMember.id}`);
        payload.verification_personal_photo_url = result.publicUrl;
      }

      const res = await fetch(`/api/admin/members/${activeMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Member verified successfully! ✅");
        setShowVerifyModal(false);
        setActiveMember(null);
        fetchMembers();

        // Show success message
        setTimeout(() => {
          toast.success("Verification completed. Member status updated.");
        }, 500);
      } else {
        toast.error(data.error || "Verification failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error during verification. Please check your connection.");
    } finally {
      setVerifying(false);
    }
  }

  function openViewModal(member) {
    setActiveMember(member);
    setShowViewModal(true);
    setViewFeeSummary(null);
    setViewAttendanceLogs([]);
    (async () => {
      try {
        setViewLoading(true);
        const res = await fetch(`/api/admin/members/${member.id}`);
        const data = await res.json();
        if (data?.success) {
          // API returns both 'user' and 'member' for backward compatibility
          const memberData = data.user || data.member;
          if (memberData) {
            setActiveMember(memberData);
          }
          if (data.fee_summary) {
            setViewFeeSummary(data.fee_summary);
          }
          if (Array.isArray(data.attendance_logs)) {
            setViewAttendanceLogs(data.attendance_logs);
          }
        } else {
          toast.error(data.error || "Failed to load member details");
        }
      } catch (e) {
        console.error("Error fetching member details:", e);
        toast.error("Failed to load member details. Please try again.");
      } finally {
        setViewLoading(false);
      }
    })();
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
      const payload = {
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        role: form.role,
        membership_status: form.membership_status,
        membership_type: form.membership_type || "free",
        subscription_plan: form.subscription_plan || "",
        membership_expiry_date: form.membership_expiry_date || "",
      };

      if (form.phone) payload.phone = form.phone;
      if (form.mobile) payload.mobile = form.mobile;
      if (form.membership_code) payload.membership_code = form.membership_code;

      const profileKeys = [
        "gender", "dob", "address", "city", "state", "cpr_id",
        "nationality", "work_sector", "employer", "position",
        "specialty", "category", "license_number", "years_of_experience",
      ];
      profileKeys.forEach((k) => {
        if (form[k] !== undefined && form[k] !== "") {
          payload[k] = String(form[k]);
        }
      });

      // Upload files directly to Supabase
      if (profileImageFile) {
        const result = await uploadFile(profileImageFile, "profile_pictures", "profile");
        payload.profile_image_url = result.publicUrl;
      }
      if (addIdCardFile) {
        const result = await uploadFile(addIdCardFile, "profile_pictures", "verification");
        payload.id_card_url = result.publicUrl;
      }
      if (addPersonalPhotoFile) {
        const result = await uploadFile(addPersonalPhotoFile, "profile_pictures", "verification");
        payload.personal_photo_url = result.publicUrl;
      }

      // If both documents are provided, mark as verified
      if (addIdCardFile && addPersonalPhotoFile) {
        payload.is_verified = "true";
      }

      if (form.membership_fee_registration !== undefined)
        payload.membership_fee_registration = String(form.membership_fee_registration);
      if (form.membership_fee_annual !== undefined)
        payload.membership_fee_annual = String(form.membership_fee_annual);
      payload.membership_pay_now = form.membership_pay_now ? "true" : "false";
      if (form.payment_reference)
        payload.payment_reference = form.payment_reference;

      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setAddIdCardFile(null);
        setAddPersonalPhotoFile(null);
        setProfileImageFile(null);
        fetchMembers();
        toast.success(addIdCardFile && addPersonalPhotoFile ? "Member created and verified successfully!" : "Member created successfully!");
      } else {
        toast.error("Create failed: " + (data.error || "Unknown"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Create error");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!activeMember) return;
    setIsEditing(true);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        membership_status: form.membership_status,
        role: form.role,
      };

      // Only send password if provided (to update it)
      if (form.password && form.password.trim().length > 0) {
        if (form.password.trim().length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }
        payload.password = form.password;
      }
      if (form.phone) payload.phone = form.phone;
      if (form.mobile) payload.mobile = form.mobile;
      if (form.membership_type !== undefined) {
        payload.membership_type = form.membership_type || "free";
      }
      if (form.subscription_plan !== undefined) {
        payload.subscription_plan = form.subscription_plan || "";
      }
      if (form.membership_expiry_date !== undefined) {
        payload.membership_expiry_date = form.membership_expiry_date || "";
      }
      if (form.membership_code) payload.membership_code = form.membership_code;

      const profileKeys = [
        "gender", "dob", "address", "city", "state", "cpr_id",
        "nationality", "work_sector", "employer", "position",
        "specialty", "category", "license_number", "years_of_experience",
      ];
      profileKeys.forEach((k) => {
        if (form[k] !== undefined) payload[k] = String(form[k] || "");
      });

      // Upload profile image directly if provided
      if (profileImageFile) {
        const result = await uploadFile(profileImageFile, "profile_pictures", "profiles");
        payload.profile_image_url = result.publicUrl;
      }
      if (form.membership_fee_registration)
        payload.membership_fee_registration = String(form.membership_fee_registration);
      if (form.membership_fee_annual)
        payload.membership_fee_annual = String(form.membership_fee_annual);
      payload.membership_pay_now = form.membership_pay_now ? "true" : "false";
      if (form.payment_reference)
        payload.payment_reference = form.payment_reference;

      const res = await fetch(`/api/admin/members/${activeMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        setActiveMember(null);
        setProfileImageFile(null);
        fetchMembers();
        toast.success("Member updated successfully!");
      } else {
        toast.error("Update failed: " + (data.error || "Unknown"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Update error");
    } finally {
      setIsEditing(false);
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
      active: "bg-[#10B981] text-white",
      inactive: "bg-[#ECCF0F] text-[#03215F]",
      blocked: "bg-[#b8352d] text-white",
      pending: "bg-[#F59E0B] text-white",
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
              className="relative w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200"
            >
              {member.profile_image ? (
                <img
                  src={member.profile_image}
                  alt={member.full_name}
                  className="w-full h-full object-cover rounded-full "
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400 rounded-full " />
                </div>
              )}
              {member.is_member_verified && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#10B981] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate flex items-center gap-2">
                {member.full_name}
                {member.is_member_verified && (
                  <Verified className="w-4 h-4 text-[#10B981]" />
                )}
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
        <td className="p-3 sm:p-4 hidden lg:table-cell">
          <div className="text-xs sm:text-sm text-gray-700">
            {member.current_subscription_plan_name || (member.membership_type === "paid" ? "Active" : "Free")}
          </div>
        </td>
        <td className="p-3 sm:p-4 hidden lg:table-cell">
          <div className="text-xs sm:text-sm text-gray-700">
            {member.membership_expiry_date
              ? formatDateISO(member.membership_expiry_date)
              : "-"}
          </div>
        </td>
        <td className="p-3 sm:p-4">
          <div className="flex flex-row items-center gap-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[member.membership_status] ||
                "bg-gray-100 text-gray-800"
                }`}
            >
              {member.membership_status}
            </span>
            {member.is_member_verified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#10B981]">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B]">
                <Clock className="w-3 h-3" />
                Pending
              </span>
            )}
          </div>
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
              onClick={() => openVerifyModal(member)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${member.is_member_verified
                ? 'bg-gradient-to-r from-[#10B981]/20 to-[#10B981]/20 text-[#10B981] hover:opacity-80'
                : 'bg-gradient-to-r from-[#AE9B66]/20 to-[#AE9B66]/20 text-[#AE9B66] hover:opacity-80'}`}
              title={member.is_member_verified ? "Verified" : "Verify Member"}
            >
              {member.is_member_verified ? (
                <Verified className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-3">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            color: '#111827',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            style: {
              background: '#F0FDF4',
              color: '#065F46',
              border: '1px solid #A7F3D0',
            },
            icon: '✅',
          },
          error: {
            style: {
              background: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FECACA',
            },
            icon: '❌',
          },
        }}
      />

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
            <div className="flex flex-wrap gap-3 self-start sm:self-auto justify-start sm:justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportCSV}
                  disabled={exporting}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Export CSV
                    </>
                  )}
                </motion.button>
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
          <div className="flex flex-col xl:flex-row gap-4 mb-6">
            <motion.div
              whileFocus={{ scale: 1.02 }}
              className="w-full xl:w-1/3"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by name, email, or membership code..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                />
              </div>
            </motion.div>
            <div className="w-full xl:w-2/3 flex flex-col gap-3 items-stretch">
              <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={planFilter}
                  onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm"
                >
                  <option value="all">All Plans</option>
                  <option value="active">Active</option>
                  <option value="associate">Associate</option>
                  <option value="student">Student</option>
                  <option value="honorary">Honorary</option>
                  <option value="free">Free</option>
                </select>
                <select
                  value={verifiedFilter}
                  onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm"
                >
                  <option value="all">All Verification</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
                </div>
                <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
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
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-xl px-3 py-1.5">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="hidden sm:inline">Registration Date:</span>
                  <select
                    value={dateFilter}
                    onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                    className="px-2 py-1 bg-transparent border-none text-sm focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="today">Today</option>
                  </select>
                  <span className="text-gray-300">|</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                    className="px-2 py-1 bg-transparent border-none text-sm focus:outline-none min-w-[110px]"
                    placeholder="From"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                    className="px-2 py-1 bg-transparent border-none text-sm focus:outline-none min-w-[110px]"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Stats Cards - Members CRM style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "New Registrations",
                value: summaryCounts.today,
                icon: Users,
                color: "from-[#10B981] to-[#10B981]",
              },
              {
                label: "Expiring Soon (30 Days)",
                value: summaryCounts.expiringSoon,
                icon: Calendar,
                color: "from-[#F59E0B] to-[#F59E0B]",
              },
              {
                label: "Pending Approvals",
                value: summaryCounts.pending,
                icon: Shield,
                color: "from-[#9cc2ed] to-[#03215F]",
              },
              {
                label: "Total Records",
                value: summaryCounts.total,
                icon: Users,
                color: "from-[#AE9B66] to-[#AE9B66]",
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

          {/* Membership Distribution by Plan */}
          {planStats.length > 0 && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Membership Distribution by Plan</h3>
                <p className="text-sm text-gray-500">
                  {summaryCounts.total} total records
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {planStats.map((plan) => (
                  <div
                    key={plan.name}
                    className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {plan.name}
                        </p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {plan.count}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-[#03215F] to-[#AE9B66]"
                          style={{ width: `${Math.min(plan.percentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {plan.percentage}% of total base
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-white hidden lg:table-cell">
                    Type
                  </th>
                  <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-white hidden lg:table-cell">
                    Expiry
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
                    <td colSpan={9} className="p-8 text-center">
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
                    <td colSpan={9} className="p-8 text-center">
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
          <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-gray-600">
            <span>
              Showing{" "}
              <span className="font-semibold">{total === 0 ? 0 : (page - 1) * perPage + 1}</span> -{" "}
              <span className="font-semibold">
                {Math.min(page * perPage, total)}
              </span>{" "}
              of <span className="font-semibold">{total}</span> members
            </span>
            <div className="flex items-center gap-2">
              <span>Per page:</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value) || 10); setPage(1); }}
                className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-sm"
              >
                {[10, 50, 100, 200, 500].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
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

      {/* Add Modal (truncated for brevity) */}
      <BaseModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddIdCardFile(null);
          setAddPersonalPhotoFile(null);
          setProfileImageFile(null);
        }}
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
              onClick={() => {
                setShowAddModal(false);
                setAddIdCardFile(null);
                setAddPersonalPhotoFile(null);
                setProfileImageFile(null);
              }}
              className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form
            onSubmit={handleAddSubmit}
            className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] modal-scrollbar"
          >
            <div className="space-y-6">
              {/* Profile Picture Upload Section */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#03215F]/10">
                    <Camera className="w-5 h-5 text-[#03215F]" />
                  </div>
                  Profile Picture
                </h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                    {profileImageFile ? (
                      <img
                        src={URL.createObjectURL(profileImageFile)}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="add-profile-image-upload"
                    />
                    <label
                      htmlFor="add-profile-image-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg font-medium cursor-pointer hover:opacity-90 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      {profileImageFile ? "Change Photo" : "Upload Photo"}
                    </label>
                    {profileImageFile && (
                      <button
                        type="button"
                        onClick={() => setProfileImageFile(null)}
                        className="ml-2 text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      JPEG, PNG or WebP (max 5MB)
                    </p>
                  </div>
                </div>
              </div>

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
                      Phone Number
                    </label>
                    <input
                      type="tel"
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
                      Membership Type *
                    </label>
                    <select
                      value={form.membership_type}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, membership_type: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subscription Plan
                    </label>
                    <select
                      value={form.subscription_plan}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, subscription_plan: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    >
                      <option value="">None</option>
                      <option value="active">Active</option>
                      <option value="associate">Associate</option>
                      <option value="honorary">Honorary</option>
                      <option value="student">Student</option>
                    </select>
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
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Membership Expiry Date
                    </label>
                    <input
                      type="date"
                      value={form.membership_expiry_date}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          membership_expiry_date: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    />
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

              {/* Personal Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#03215F]/10">
                    <User className="w-5 h-5 text-[#03215F]" />
                  </div>
                  Personal Information
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
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
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
                      Nationality
                    </label>
                    <select
                      value={form.nationalityCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        const found = countryOptions.find((c) => c.code === code);
                        setForm((f) => ({
                          ...f,
                          nationalityCode: code,
                          nationality: found?.label || "",
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    >
                      {countryOptions.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
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

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, address: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Full address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, city: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State / Governorate
                      </label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, state: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        placeholder="State"
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

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Work Sector
                      </label>
                      <select
                        value={form.work_sector}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, work_sector: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      >
                        <option value="">Select</option>
                        {WORK_SECTOR_OPTIONS.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employer
                      </label>
                      <input
                        type="text"
                        value={form.employer}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, employer: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        placeholder="Employer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position
                      </label>
                      <select
                        value={form.position}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, position: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      >
                        <option value="">Select</option>
                        {POSITION_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialty
                      </label>
                      <select
                        value={form.specialty}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, specialty: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      >
                        <option value="">Select</option>
                        {SPECIALIZATION_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, category: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      >
                        <option value="">Select</option>
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Number
                      </label>
                      <input
                        type="text"
                        value={form.license_number}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, license_number: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        placeholder="License number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <select
                        value={form.years_of_experience}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, years_of_experience: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      >
                        <option value="">Select experience</option>
                        <option value="0-1">0-1 years</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Documents */}
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Verification Documents</h4>
                    <p className="text-sm text-emerald-600">Upload both documents to auto-verify member</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <VerificationFileUpload
                    label="ID Card (CPR) Copy *"
                    icon={IdCard}
                    file={addIdCardFile}
                    onFileChange={setAddIdCardFile}
                    accept="image/*,.pdf"
                    description="Upload clear copy of CPR/ID card"
                  />
                  <VerificationFileUpload
                    label="Personal Photo *"
                    icon={Camera}
                    file={addPersonalPhotoFile}
                    onFileChange={setAddPersonalPhotoFile}
                    accept="image/*"
                    description="Upload passport-style photo"
                  />
                </div>

                {addIdCardFile && addPersonalPhotoFile && (
                  <div className="mt-4 p-3 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                      Both documents uploaded - Member will be automatically verified upon creation
                    </span>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddIdCardFile(null);
                    setAddPersonalPhotoFile(null);
                    setProfileImageFile(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#AE9B66] transition-all duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Member
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </BaseModal>

      {/* Enhanced Verify Member Modal */}
      <BaseModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        size="lg"
      >
        {/* MAIN MODAL WRAPPER */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

          {/* ================= HEADER (FIXED) ================= */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669]">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Verify Member</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Upload required documents for verification
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowVerifyModal(false)}
              className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 transition hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ================= SCROLLABLE CONTENT ================= */}
          <form
            onSubmit={handleVerifySubmit}
            className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          >

            {/* ================= MEMBER INFO ================= */}
            {activeMember && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-[#03215F]/5 to-[#AE9B66]/5 rounded-2xl p-5 border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg">
                    {activeMember.profile_image ? (
                      <img
                        src={activeMember.profile_image}
                        alt={activeMember.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#03215F] to-[#AE9B66]">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      {activeMember.full_name}
                    </h3>

                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {activeMember.email}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-[#03215F]/10 text-[#03215F] text-xs rounded-full">
                        CPR: {activeMember.member_profile?.cpr_id || "Not provided"}
                      </span>

                      <span
                        className={`px-2 py-1 text-xs rounded-full ${activeMember.membership_status === "active"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : "bg-[#F59E0B]/10 text-[#F59E0B]"
                          }`}
                      >
                        {activeMember.membership_status}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= REQUIRED DOCUMENTS ================= */}
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                Required Documents
              </h3>
              <p className="text-sm text-gray-600">
                Please upload clear copies of the following documents:
              </p>
            </div>

            {/* ================= FILE UPLOADS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VerificationFileUpload
                label="ID Card (CPR) Copy"
                icon={IdCard}
                file={verifyIdCard}
                onFileChange={setVerifyIdCard}
                accept="image/*,application/pdf"
                description="Upload a clear CPR card copy (PDF, JPG, PNG)"
                existingUrl={activeMember?.member_profile?.id_card_url}
                required={!activeMember?.member_profile?.id_card_url}
              />

              <VerificationFileUpload
                label="Personal Photo"
                icon={Camera}
                file={verifyPersonalPhoto}
                onFileChange={setVerifyPersonalPhoto}
                accept="image/*"
                description="Upload a recent passport-sized photo"
                existingUrl={activeMember?.member_profile?.personal_photo_url}
                required={!activeMember?.member_profile?.personal_photo_url}
              />
            </div>

            {/* Show existing documents links */}
            {(activeMember?.member_profile?.id_card_url || activeMember?.member_profile?.personal_photo_url) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Existing Documents:</p>
                <div className="flex flex-wrap gap-2">
                  {activeMember?.member_profile?.id_card_url && (
                    <a
                      href={activeMember.member_profile.id_card_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-sm text-blue-700 hover:bg-blue-50"
                    >
                      <FileText className="w-4 h-4" />
                      View ID Card
                    </a>
                  )}
                  {activeMember?.member_profile?.personal_photo_url && (
                    <a
                      href={activeMember.member_profile.personal_photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-sm text-blue-700 hover:bg-blue-50"
                    >
                      <FileText className="w-4 h-4" />
                      View Personal Photo
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* ================= GUIDELINES ================= */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-5 border border-yellow-200"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900">
                    Verification Guidelines
                  </h4>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc pl-4 mt-2">
                    <li>Documents must be clear and readable</li>
                    <li>Photos must be taken within last 6 months</li>
                    <li>Maximum file size: 5MB</li>
                    <li>Formats: JPG, PNG, WEBP, PDF</li>
                    <li>Information must match member details</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* ================= FILE STATUS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "ID Card", file: verifyIdCard },
                { label: "Personal Photo", file: verifyPersonalPhoto }
              ].map((item) => (
                <div
                  key={item.label}
                  className={`p-4 rounded-xl border ${item.file
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-100 border-gray-200"
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">
                      {item.label}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${item.file
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-800"
                        }`}
                    >
                      {item.file ? "Ready" : "Pending"}
                    </span>
                  </div>

                  {item.file && (
                    <p className="text-sm text-gray-600 mt-2 truncate">
                      {item.file.name}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* ================= FOOTER ACTIONS ================= */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Uploaded documents are securely stored & encrypted
              </p>

              <div className="flex gap-3 items-center flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-medium"
                >
                  Cancel
                </button>

                <label className="flex items-center gap-2 text-sm text-gray-700 mr-2">
                  <input
                    type="checkbox"
                    checked={usePersonalAsProfile}
                    onChange={(e) => setUsePersonalAsProfile(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#03215F] focus:ring-[#03215F]"
                  />
                  Use personal photo as profile picture
                </label>

                <button
                  type="submit"
                  disabled={
                    verifying ||
                    (!verifyIdCard && !activeMember?.member_profile?.id_card_url) ||
                    (!verifyPersonalPhoto && !activeMember?.member_profile?.personal_photo_url)
                  }
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Complete Verification
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </BaseModal>


      {/* View Modal (truncated for brevity) */}
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
            {viewLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#03215F] mb-4" />
                <p className="text-gray-600">Loading member details...</p>
              </div>
            ) : activeMember ? (
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
                        className={`px-2 py-1 rounded-full text-xs font-medium ${activeMember.membership_status === "active"
                            ? "bg-[#10B981] text-white"
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
                          {activeMember.is_member_verified && (
                            <Verified className="w-5 h-5 text-[#10B981] inline ml-2" />
                          )}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {activeMember.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-[#03215F]/10 to-[#03215F]/10 text-[#03215F] rounded-full text-sm font-medium">
                          {activeMember.role}
                        </span>
                        {activeMember.is_member_verified ? (
                          <span className="px-3 py-1 bg-gradient-to-r from-[#10B981]/10 to-[#10B981]/10 text-[#10B981] rounded-full text-sm font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gradient-to-r from-[#F59E0B]/10 to-[#F59E0B]/10 text-[#F59E0B] rounded-full text-sm font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending Verification
                          </span>
                        )}
                      </div>
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
                            ).toLocaleDateString('en-BH', { timeZone: 'Asia/Bahrain' })
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
                              ).toLocaleDateString('en-BH', { timeZone: 'Asia/Bahrain' })
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            License Number
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {activeMember.member_profile?.license_number ||
                              "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Years of Experience
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {activeMember.member_profile?.years_of_experience ||
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
                            ).toLocaleDateString('en-BH', { timeZone: 'Asia/Bahrain' })
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
                        <span className="px-3 py-1 bg-[#03215F]/10 text-[#03215F] rounded-full text-sm font-medium">
                          {(() => {
                            const cutoff = new Date();
                            cutoff.setDate(cutoff.getDate() - 30);
                            const unique = new Set(
                              (viewAttendanceLogs || [])
                                .filter(l => l?.scan_time && new Date(l.scan_time) >= cutoff)
                                .map(l => l.event_member_id)
                                .filter(Boolean)
                            );
                            return unique.size;
                          })()}
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
                          {(() => {
                            const total = Number(viewFeeSummary?.total_paid || 0);
                            return `${total.toLocaleString('en-BH', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} BHD`;
                          })()}
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

                {/* Verification Documents */}
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#03215F]/10">
                      <ShieldCheck className="w-5 h-5 text-[#03215F]" />
                    </div>
                    Verification
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">ID Card (CPR) Copy</span>
                      {activeMember?.member_profile?.id_card_url ? (
                        <a
                          href={activeMember.member_profile.id_card_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:bg-gray-200"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">Not uploaded</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Personal Picture</span>
                      {activeMember?.member_profile?.personal_photo_url ? (
                        <a
                          href={activeMember.member_profile.personal_photo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:bg-gray-200"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">Not uploaded</span>
                      )}
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
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No member data available</p>
              </div>
            )}
          </div>
        </div>
      </BaseModal>

      {/* Edit Modal (truncated for brevity) */}
      <BaseModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setProfileImageFile(null);
        }}
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
              onClick={() => {
                setShowEditModal(false);
                setProfileImageFile(null);
              }}
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
              {/* Profile Picture Update Section */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#03215F]/10">
                    <Camera className="w-5 h-5 text-[#03215F]" />
                  </div>
                  Profile Picture
                </h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                    {profileImageFile ? (
                      <img
                        src={URL.createObjectURL(profileImageFile)}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : activeMember?.profile_image ? (
                      <img
                        src={activeMember.profile_image}
                        alt="Current profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="edit-profile-image-upload"
                    />
                    <label
                      htmlFor="edit-profile-image-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg font-medium cursor-pointer hover:opacity-90 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      {profileImageFile ? "Change Photo" : activeMember?.profile_image ? "Update Photo" : "Upload Photo"}
                    </label>
                    {(profileImageFile || activeMember?.profile_image) && (
                      <button
                        type="button"
                        onClick={() => setProfileImageFile(null)}
                        className="ml-2 text-sm text-red-500 hover:text-red-700"
                      >
                        {profileImageFile ? "Remove New" : ""}
                      </button>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      JPEG, PNG or WebP (max 5MB)
                    </p>
                  </div>
                </div>
              </div>

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
                      Password
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Leave empty to keep current password"
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Only fill this field if you want to change the password
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
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
                      Membership Type *
                    </label>
                    <select
                      value={form.membership_type}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, membership_type: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subscription Plan
                    </label>
                    <select
                      value={form.subscription_plan}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, subscription_plan: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    >
                      <option value="">None</option>
                      <option value="active">Active</option>
                      <option value="associate">Associate</option>
                      <option value="honorary">Honorary</option>
                      <option value="student">Student</option>
                    </select>
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
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Membership Expiry Date
                    </label>
                    <input
                      type="date"
                      value={form.membership_expiry_date}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          membership_expiry_date: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    />
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

              {/* Personal Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#03215F]/10">
                    <User className="w-5 h-5 text-[#03215F]" />
                  </div>
                  Personal Information
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
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
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
                      Nationality
                    </label>
                    <select
                      value={form.nationalityCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        const found = countryOptions.find((c) => c.code === code);
                        setForm((f) => ({
                          ...f,
                          nationalityCode: code,
                          nationality: found?.label || "",
                          countryDial: found?.dial || "+973",
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    >
                      {countryOptions.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
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

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, address: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Full address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, city: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State / Governorate
                      </label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, state: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        placeholder="State"
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

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Work Sector
                      </label>
                      <select
                        value={form.work_sector}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, work_sector: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      >
                        <option value="">Select</option>
                        {WORK_SECTOR_OPTIONS.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employer
                      </label>
                      <input
                        type="text"
                        value={form.employer}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, employer: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        placeholder="Employer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position
                      </label>
                      <select
                        value={form.position}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, position: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      >
                        <option value="">Select</option>
                        {POSITION_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialty
                      </label>
                      <select
                        value={form.specialty}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, specialty: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      >
                        <option value="">Select</option>
                        {SPECIALIZATION_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, category: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      >
                        <option value="">Select</option>
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Number
                      </label>
                      <input
                        type="text"
                        value={form.license_number}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, license_number: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        placeholder="License number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <select
                        value={form.years_of_experience}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, years_of_experience: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      >
                        <option value="">Select experience</option>
                        <option value="0-1">0-1 years</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setProfileImageFile(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#AE9B66] transition-all duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isEditing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </BaseModal>
    </div>
  );
}