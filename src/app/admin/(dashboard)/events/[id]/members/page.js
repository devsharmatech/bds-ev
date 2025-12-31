// app/admin/events/[id]/members/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  Upload,
  X,
  UserCheck,
  UserX,
  CreditCard,
  Tag,
  Calendar,
  Mail,
  Phone,
  Building,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Shield,
  RefreshCw,
  UserPlus,
  FileText,
  Printer,
  User,
  MessageSquare,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Components
import AddMemberModal from "@/components/events/AddMemberModal";
import BulkAddModal from "@/components/events/BulkAddModal";
import DeleteModal2 from "@/components/DeleteModal2";
import MemberDetailsModal from "@/components/events/MemberDetailsModal";
import CheckInModal from "@/components/events/CheckInModal";
import EventTabs from "@/components/events/EventTabs";

// Format BHD currency
const formatBHD = (amount) => {
  if (!amount) return "Free";
  return new Intl.NumberFormat("en-BH", {
    style: "currency",
    currency: "BHD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
};

// Format date for Bahrain
const formatDateBH = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-BH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Bahrain",
  });
};

// Format time for Bahrain
const formatTimeBH = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-BH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bahrain",
  });
};

export default function EventMembersPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id;

  const [event, setEvent] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    notCheckedIn: 0,
    paid: 0,
    free: 0,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "", // all, checked-in, not-checked-in
    sortBy: "joined_at",
    sortOrder: "desc",
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch event details and members
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch event details
      const eventRes = await fetch(`/api/admin/events/${eventId}`);
      const eventData = await eventRes.json();

      if (eventData.success) {
        setEvent(eventData.event);
      } else {
        toast.error(eventData.message || "Failed to fetch event details");
        router.push("/admin/events");
        return;
      }

      // Fetch members
      await fetchMembers();
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters,
      });

      const response = await fetch(
        `/api/admin/events/${eventId}/members?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setMembers(data.members);
        setPagination(data.pagination);

        // Fetch accurate stats from stats API
        try {
          const statsResponse = await fetch(`/api/admin/events/${eventId}/stats`);
          const statsData = await statsResponse.json();
          
          if (statsData.success) {
            setStats({
              total: statsData.stats.total_members || 0,
              checkedIn: statsData.stats.checked_in_members || 0,
              notCheckedIn: (statsData.stats.total_members || 0) - (statsData.stats.checked_in_members || 0),
              paid: statsData.stats.paid_members || 0,
              free: (statsData.stats.total_members || 0) - (statsData.stats.paid_members || 0),
            });
          } else {
            // Fallback to pagination-based calculation if stats API fails
            const total = data.pagination.total;
            const checkedIn = data.members.filter((m) => m.checked_in).length;
            const paid = data.members.filter((m) => m.price_paid && m.price_paid > 0).length;
            setStats({
              total,
              checkedIn,
              notCheckedIn: total - checkedIn,
              paid,
              free: total - paid,
            });
          }
        } catch (statsError) {
          console.error("Error fetching stats:", statsError);
          // Fallback to pagination-based calculation
          const total = data.pagination.total;
          const checkedIn = data.members.filter((m) => m.checked_in).length;
          const paid = data.members.filter((m) => m.price_paid && m.price_paid > 0).length;
          setStats({
            total,
            checkedIn,
            notCheckedIn: total - checkedIn,
            paid,
            free: total - paid,
          });
        }
      } else {
        toast.error(data.message || "Failed to fetch members");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to fetch members");
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchData();
    }
  }, [eventId, pagination.page, filters]);

  // Auto-refresh members list every 30 seconds and when page becomes visible
  useEffect(() => {
    if (!eventId) return;
    
    const interval = setInterval(() => {
      fetchMembers();
    }, 30000); // Refresh every 30 seconds

    // Refresh when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchMembers();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [eventId]);

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

  // Handle add member
  const handleAddMember = () => {
    setSelectedMember(null);
    setShowAddModal(true);
  };

  // Handle bulk add
  const handleBulkAdd = () => {
    setShowBulkModal(true);
  };

  // Handle view details
  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
  };

  // Handle check-in/out
  const handleCheckInOut = (member) => {
    setSelectedMember(member);
    setShowCheckInModal(true);
  };

  // Handle delete member
  const handleDeleteClick = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedMember) {
      toast.error("No member selected");
      return;
    }

    console.log("Deleting member:", selectedMember.id, "from event:", eventId);

    setModalLoading(true);
    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/members/${selectedMember.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      console.log("Delete response:", data);

      if (data.success) {
        toast.success("Member removed successfully");
        // Remove the member from local state immediately
        setMembers((prevMembers) =>
          prevMembers.filter((m) => m.id !== selectedMember.id)
        );

        // Update stats
        setStats((prev) => ({
          ...prev,
          total: prev.total - 1,
          checkedIn: selectedMember.checked_in
            ? prev.checkedIn - 1
            : prev.checkedIn,
          notCheckedIn: !selectedMember.checked_in
            ? prev.notCheckedIn - 1
            : prev.notCheckedIn,
          paid: selectedMember.price_paid ? prev.paid - 1 : prev.paid,
          free: !selectedMember.price_paid ? prev.free - 1 : prev.free,
        }));

        setShowDeleteModal(false);
        setSelectedMember(null);
      } else {
        toast.error(data.message || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Failed to remove member. Please check console for details.");
    } finally {
      setModalLoading(false);
    }
  };

  // Handle check-in/out confirmation
  const handleCheckInConfirm = async (checkedIn) => {
    if (!selectedMember) return;

    setModalLoading(true);
    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/members/${selectedMember.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ checked_in: checkedIn }),
        }
      );
      const data = await response.json();

      if (data.success) {
        toast.success(
          checkedIn
            ? "Member checked in successfully"
            : "Member checked out successfully"
        );
        fetchMembers();
        setShowCheckInModal(false);
        setSelectedMember(null);
      } else {
        toast.error(data.message || "Failed to update check-in status");
      }
    } catch (error) {
      console.error("Error updating check-in:", error);
      toast.error("Failed to update check-in status");
    } finally {
      setModalLoading(false);
    }
  };

  // Handle export members
  const handleExport = async () => {
    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/members?limit=1000`
      );
      const data = await response.json();

      if (data.success) {
        const csvContent = convertToCSV(data.members);
        downloadCSV(csvContent, `event-${eventId}-members.csv`);
        toast.success("Members exported successfully");
      } else {
        toast.error(data.message || "Failed to export members");
      }
    } catch (error) {
      console.error("Error exporting members:", error);
      toast.error("Failed to export members");
    }
  };

  const convertToCSV = (members) => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Membership Code",
      "Token",
      "Status",
      "Check-in Time",
      "Price Paid",
    ];
    const rows = members.map((member) => [
      member.users?.full_name || "",
      member.users?.email || "",
      member.users?.phone || member.users?.mobile || "",
      member.users?.membership_code || "",
      member.token,
      member.checked_in ? "Checked In" : "Not Checked In",
      member.checked_in_at ? formatTimeBH(member.checked_in_at) : "",
      member.price_paid ? formatBHD(member.price_paid) : "Free",
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle form success
  const handleFormSuccess = () => {
    setShowAddModal(false);
    setShowBulkModal(false);
    fetchMembers();
  };

  if (loading && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#03215F] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddMemberModal
            eventId={eventId}
            event={event}
            onClose={() => setShowAddModal(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </AnimatePresence>

      {/* Bulk Add Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <BulkAddModal
            eventId={eventId}
            event={event}
            onClose={() => setShowBulkModal(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedMember && (
          <DeleteModal2
            title="Remove Member"
            description={`Are you sure you want to remove ${selectedMember.users?.full_name} from this event? This action cannot be undone.`}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteConfirm}
            loading={modalLoading}
          />
        )}
      </AnimatePresence>

      {/* Member Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedMember && (
          <MemberDetailsModal
            member={selectedMember}
            eventId={eventId}
            onClose={() => setShowDetailsModal(false)}
            onRefresh={fetchMembers}
          />
        )}
      </AnimatePresence>

      {/* Check-in Modal */}
      <AnimatePresence>
        {showCheckInModal && selectedMember && (
          <CheckInModal
            member={selectedMember}
            onClose={() => setShowCheckInModal(false)}
            onConfirm={handleCheckInConfirm}
            loading={modalLoading}
          />
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
              <button
                onClick={() => router.push("/admin/events")}
                className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#03215F] to-[#03215F] shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                  {event?.title}
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage event members and attendance
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => {
                fetchMembers();
                fetchData();
                toast.success("Members list refreshed");
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border-2 border-gray-300 text-[#03215F] rounded-xl font-medium hover:bg-gray-50 hover:border-[#03215F] transition-all duration-200 flex items-center justify-center gap-2"
              title="Refresh members list"
            >
              <RefreshCw className="w-4 h-4 text-[#03215F]" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border-2 border-gray-300 text-[#03215F] rounded-xl font-medium hover:bg-gray-50 hover:border-[#03215F] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-[#03215F]" />
              Export CSV
            </button>
            <button
              onClick={handleBulkAdd}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#03215F] text-white rounded-xl font-medium hover:bg-[#03215F]/90 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 text-white" />
              Bulk Add
            </button>
            <button
              onClick={handleAddMember}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#AE9B66] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-white" />
              Add Member
            </button>
          </div>
        </motion.div>

        {/* STATS CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-gradient-to-br from-white to-[#9cc2ed] rounded-2xl shadow-lg border border-[#9cc2ed]/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Members
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#9cc2ed]">
                <Users className="w-6 h-6 text-[#03215F]" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-[#AE9B66] rounded-2xl shadow-lg border border-[#AE9B66]/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Checked In
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.checkedIn}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#AE9B66]">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-[#b8352d] rounded-2xl shadow-lg border border-[#b8352d]/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Check-in
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.notCheckedIn}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#b8352d]">
                <UserX className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-[#03215F] rounded-2xl shadow-lg border border-[#03215F]/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Paid Members
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.paid}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#03215F]">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* FILTERS AND SEARCH */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
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
                <option value="">All Members</option>
                <option value="checked-in">Checked In</option>
                <option value="not-checked-in">Not Checked In</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent appearance-none"
              >
                <option value="joined_at">Registration Date</option>
                <option value="checked_in_at">Check-in Time</option>
                <option value="users.full_name">Name</option>
                <option value="price_paid">Price</option>
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

        {/* MEMBERS TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#03215F] animate-spin mb-4" />
              <p className="text-gray-600">
                Loading members...
              </p>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Users className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                No members found
              </p>
              <p className="text-gray-500 text-sm mb-6">
                {filters.search || filters.status
                  ? "Try changing your filters"
                  : "Add members to get started"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAddMember}
                  className="px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </button>
                <button
                  onClick={handleBulkAdd}
                  className="px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Bulk Add
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Member Details
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Registration Info
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Payment
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            {member.users?.profile_image ? (
                              <img
                                src={member.users.profile_image}
                                alt={member.users.full_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] flex items-center justify-center">
                                <User className="w-5 h-5 text-[#03215F]" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {member.users?.full_name || "Unknown User"}
                              </h3>
                              <div className="flex flex-col gap-1 mt-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="w-3 h-3 text-[#03215F]" />
                                  {member.users?.email || "No email"}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-3 h-3 text-[#03215F]" />
                                  {member.users?.phone ||
                                    member.users?.mobile ||
                                    "No phone"}
                                </div>
                                {member.users?.membership_code && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Tag className="w-3 h-3 text-[#03215F]" />
                                    {member.users.membership_code}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Tag className="w-4 h-4 text-[#03215F]" />
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                {member.token}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-3 h-3 text-[#03215F]" />
                              {formatDateBH(member.joined_at)}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div
                              className={`inline-flex items-center gap-1 text-sm font-medium ${
                                member.price_paid
                                  ? "text-[#AE9B66]"
                                  : "text-gray-600"
                              }`}
                            >
                              <CreditCard className={`w-3 h-3 ${
                                member.price_paid
                                  ? "text-[#AE9B66]"
                                  : "text-gray-600"
                              }`} />
                              {member.price_paid
                                ? formatBHD(member.price_paid)
                                : "Free"}
                            </div>
                            {member.is_member && (
                              <div className="inline-flex items-center gap-1 text-xs text-[#03215F] bg-[#9cc2ed] px-2 py-1 rounded-full">
                                <Shield className="w-3 h-3 text-[#03215F]" />
                                Member
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-2">
                            <div
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium w-fit ${
                                member.checked_in
                                  ? "bg-[#AE9B66] text-white"
                                  : "bg-[#b8352d] text-white"
                              }`}
                            >
                              {member.checked_in ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" title="Checked In"/>
                                  
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-4 h-4" title="Not Checked In"/>
                                  
                                </div>
                              )}
                            </div>
                            {member.checked_in_at && (
                              <div className="text-xs text-gray-500">
                                {formatTimeBH(member.checked_in_at)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(member)}
                              className="p-2 rounded-lg bg-white border-2 border-gray-300 text-[#03215F] hover:bg-gray-50 hover:border-[#03215F] transition-colors hover:scale-110 active:scale-95"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-[#03215F]" />
                            </button>
                            <button
                              onClick={() => handleCheckInOut(member)}
                              className={`p-2 rounded-lg transition-colors hover:scale-110 active:scale-95 ${
                                member.checked_in
                                  ? "bg-[#b8352d] text-white hover:bg-[#b8352d]/90"
                                  : "bg-[#AE9B66] text-white hover:bg-[#AE9B66]/90"
                              }`}
                              title={
                                member.checked_in ? "Check Out" : "Check In"
                              }
                            >
                              {member.checked_in ? (
                                <UserX className="w-4 h-4 text-white" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-white" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteClick(member)}
                              className="p-2 rounded-lg bg-[#b8352d] text-white hover:bg-[#b8352d]/90 transition-colors hover:scale-110 active:scale-95"
                              title="Remove Member"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
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
                    members
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
                          } else if (
                            pagination.page >=
                            pagination.totalPages - 2
                          ) {
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
