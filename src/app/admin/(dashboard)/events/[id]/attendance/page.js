// app/admin/events/[id]/attendance/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  X,
  Calendar,
  Clock,
  MapPin,
  Smartphone,
  User,
  Mail,
  Phone,
  Tag,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  QrCode,
  ScanLine,
  Printer,
  RefreshCw,
  Eye,
  FileText,
  TrendingUp,
  BarChart3,
  History,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Components
import ScanAttendanceModal from "@/components/events/ScanAttendanceModal";
import AttendanceStats from "@/components/events/AttendanceStats";
import EventTabs from "@/components/events/EventTabs";
import MemberDetailsModal from "@/components/events/MemberDetailsModal";

// Format date for Bahrain
const formatDateBH = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-BH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Bahrain'
  });
};

// Format time for Bahrain
const formatTimeBH = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-BH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bahrain'
  });
};

export default function EventAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id;

  const [event, setEvent] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScans: 0,
    uniqueAttendees: 0,
    todayScans: 0,
    peakHour: null,
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
    sortBy: "scan_time",
    sortOrder: "desc",
  });

  // Modal states
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Fetch event details and attendance logs
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

      // Fetch attendance logs
      await fetchAttendanceLogs();

      // Fetch statistics
      await fetchStatistics();
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters,
      });

      const response = await fetch(`/api/admin/events/${eventId}/attendance?${params}`);
      const data = await response.json();

      if (data.success) {
        setAttendanceLogs(data.logs);
        setPagination(data.pagination);
      } else {
        toast.error(data.message || "Failed to fetch attendance logs");
      }
    } catch (error) {
      console.error("Error fetching attendance logs:", error);
      toast.error("Failed to fetch attendance logs");
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/stats`);
      const data = await response.json();

      if (data.success) {
        setStats({
          totalScans: data.stats.attendance_logs,
          uniqueAttendees: data.stats.checked_in_members,
          todayScans: data.stats.recent_checkins,
          checkinRate: data.stats.checkin_rate,
        });
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchData();
    }
  }, [eventId, pagination.page, filters]);

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

  // Handle scan attendance
  const handleScanAttendance = () => {
    setShowScanModal(true);
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member || null);
    setShowDetailsModal(!!member);
  };

  // Handle scan submission
  const handleScanSubmit = async (token) => {
    setScanning(true);
    try {
      // Get current user from auth
      let scannerId = null;
      try {
        const userRes = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          scannerId = userData.user?.id || userData.user?.user_id;
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }

      const response = await fetch(`/api/admin/events/${eventId}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token: token.trim().toUpperCase(),
          scanned_by: scannerId,
          location: "Event Venue", // Get from GPS or manual input
          device_info: navigator.userAgent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Attendance recorded successfully!");
        fetchData();
        return { success: true, data: data.log };
      } else {
        toast.error(data.message || "Failed to record attendance");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Error scanning attendance:", error);
      toast.error("Failed to record attendance");
      return { success: false, message: "Network error" };
    } finally {
      setScanning(false);
    }
  };

  // Handle export attendance
  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/attendance?limit=1000`);
      const data = await response.json();

      if (data.success) {
        const csvContent = convertToCSV(data.logs);
        downloadCSV(csvContent, `event-${eventId}-attendance.csv`);
        toast.success("Attendance logs exported successfully");
      } else {
        toast.error(data.message || "Failed to export attendance logs");
      }
    } catch (error) {
      console.error("Error exporting attendance:", error);
      toast.error("Failed to export attendance logs");
    }
  };

  const convertToCSV = (logs) => {
    const headers = ["Name", "Email", "Token", "Scan Time", "Scanner", "Location", "Device"];
    const rows = logs.map(log => [
      log.event_members?.users?.full_name || "",
      log.event_members?.users?.email || "",
      log.event_members?.token || "",
      formatTimeBH(log.scan_time),
      log.scanner?.full_name || "",
      log.location || "",
      log.device_info || ""
    ]);

    return [headers, ...rows].map(row => row.join(",")).join("\n");
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

 

  if (loading && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#03215F] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      

      {/* Scan Attendance Modal */}
      <AnimatePresence>
        {showScanModal && event && (
          <ScanAttendanceModal
            event={event}
            onClose={() => setShowScanModal(false)}
            onScan={handleScanSubmit}
            scanning={scanning}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetailsModal && selectedMember && (
          <MemberDetailsModal
            member={selectedMember}
            eventId={eventId}
            onClose={() => setShowDetailsModal(false)}
            onRefresh={() => {
              fetchAttendanceLogs();
            }}
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
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                  {event?.title} - Attendance
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Track and manage event attendance
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            
            <button
              onClick={handleExport}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleScanAttendance}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ScanLine className="w-4 h-4" />
              Scan Attendance
            </button>
          </div>
        </motion.div>

        {/* STATS */}
        <AttendanceStats stats={stats} />

        {/* FILTERS AND SEARCH */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search attendees..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent appearance-none"
              >
                <option value="scan_time">Scan Time</option>
                <option value="event_members.users.full_name">Name</option>
                <option value="location">Location</option>
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

        {/* ATTENDANCE LOGS */}
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
                Loading attendance logs...
              </p>
            </div>
          ) : attendanceLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <History className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                No attendance records found
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Start scanning attendance to record check-ins
              </p>
              <button
                onClick={handleScanAttendance}
                className="px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 flex items-center gap-2"
              >
                <ScanLine className="w-4 h-4" />
                Scan First Attendee
              </button>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Attendee Details
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Scan Information
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Scanner Details
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceLogs.map((log) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            {log.event_members?.users?.profile_image ? (
                              <img
                                src={log.event_members.users.profile_image}
                                alt={log.event_members.users.full_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] flex items-center justify-center">
                                <User className="w-5 h-5 text-[#03215F]" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {log.event_members?.users?.full_name || "Unknown Attendee"}
                              </h3>
                              <div className="flex flex-col gap-1 mt-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Tag className="w-3 h-3" />
                                  <span className="font-mono">{log.event_members?.token}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="w-3 h-3" />
                                  {log.event_members?.users?.email || "No email"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Clock className="w-4 h-4" />
                              {formatTimeBH(log.scan_time)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {formatDateBH(log.scan_time)}
                            </div>
                            {log.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {log.location}
                              </div>
                            )}
                            {log.device_info && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Smartphone className="w-3 h-3" />
                                {log.device_info.substring(0, 30)}...
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AE9B66] to-[#AE9B66] flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {log.scanner?.full_name || "Unknown Scanner"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {log.scanner?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(log.event_members)}
                              className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 active:scale-95"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                // Rescan action
                                handleScanAttendance();
                              }}
                              className="p-2 rounded-lg bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed] text-[#03215F] hover:text-[#03215F] transition-colors hover:scale-110 active:scale-95"
                              title="Rescan"
                            >
                              <RefreshCw className="w-4 h-4" />
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
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {pagination.total}
                    </span>{" "}
                    attendance records
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
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
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
                      })}
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

        {/* REAL-TIME STATS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Live Attendance Monitor
            </h3>
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#9cc2ed]/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#9cc2ed]">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Check-in Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.checkinRate || "0%"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#AE9B66]/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#AE9B66]">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Attendees</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.uniqueAttendees}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#03215F]/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#03215F]">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Scans</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalScans}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}