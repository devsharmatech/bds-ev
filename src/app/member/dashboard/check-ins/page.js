"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Users,
  Ticket,
  Filter,
  Search,
  Download,
  QrCode,
  Building,
  User,
  Smartphone,
  FileText,
  AlertCircle,
  MessageSquare,
  Star,
  Edit2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import FeedbackModal from "@/components/feedback/FeedbackModal";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-BH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Bahrain",
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-BH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Bahrain",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
};

export default function CheckInsPage() {
  const [loading, setLoading] = useState(true);
  const [checkIns, setCheckIns] = useState([]);
  const [filteredCheckIns, setFilteredCheckIns] = useState([]);
  const [stats, setStats] = useState({
    total_events: 0,
    checked_in_count: 0,
    not_checked_in_count: 0,
    total_check_ins: 0,
  });
  const [filter, setFilter] = useState("all"); // all, checked_in, not_checked_in
  const [search, setSearch] = useState("");
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    fetchCheckIns();
  }, []);

  useEffect(() => {
    filterCheckIns();
  }, [checkIns, filter, search]);

  const fetchCheckIns = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/check-ins", {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        const allCheckIns = data.data.all || [];
        setCheckIns(allCheckIns);
        setStats(data.data.stats || {});

        // Extract feedback from check-ins data
        const allFeedback = [];
        allCheckIns.forEach(checkIn => {
          if (checkIn.feedback && checkIn.feedback.length > 0) {
            allFeedback.push(...checkIn.feedback);
          }
        });
        setFeedbackData(allFeedback);
      } else {
        toast.error(data.message || "Failed to load check-in information");
      }
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      toast.error("Failed to load check-in information");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await fetch("/api/dashboard/feedback", {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setFeedbackData(data.feedback || []);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const handleAddFeedback = (checkIn) => {
    setSelectedCheckIn(checkIn);
    // Check if feedback already exists for this event member
    const existing = feedbackData.find(
      (f) => f.event_member_id === checkIn.event_member_id
    );
    if (existing) {
      setSelectedFeedback(existing);
    } else {
      setSelectedFeedback(null);
    }
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSuccess = () => {
    // Refresh check-ins which will also refresh feedback
    fetchCheckIns();
  };

  const filterCheckIns = () => {
    let filtered = [...checkIns];

    // Apply status filter
    if (filter === "checked_in") {
      filtered = filtered.filter((ci) => ci.checked_in);
    } else if (filter === "not_checked_in") {
      filtered = filtered.filter((ci) => !ci.checked_in);
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (ci) =>
          ci.event?.title?.toLowerCase().includes(searchLower) ||
          ci.event?.venue_name?.toLowerCase().includes(searchLower) ||
          ci.token?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredCheckIns(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#03215F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading check-in information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                My Check-Ins
              </h1>
              <p className="text-gray-600 mt-2">
                View your event check-in history and attendance records
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#9cc2ed] rounded-lg">
                <Calendar className="w-6 h-6 text-[#03215F]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-[#03215F]">
                  {stats.total_events}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#AE9B66] rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Checked In</p>
                <p className="text-2xl font-bold text-[#AE9B66]">
                  {stats.checked_in_count}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#ECCF0F] rounded-lg">
                <Clock className="w-6 h-6 text-[#03215F]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Not Checked In</p>
                <p className="text-2xl font-bold text-[#03215F]">
                  {stats.not_checked_in_count}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#03215F] rounded-lg">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Check-Ins</p>
                <p className="text-2xl font-bold text-[#03215F]">
                  {stats.total_check_ins}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by event name, venue, or token..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${filter === "all"
                    ? "bg-[#03215F] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("checked_in")}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${filter === "checked_in"
                    ? "bg-[#AE9B66] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <CheckCircle className="w-4 h-4" />
                Checked In
              </button>
              <button
                onClick={() => setFilter("not_checked_in")}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${filter === "not_checked_in"
                    ? "bg-[#ECCF0F] text-[#03215F]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <Clock className="w-4 h-4" />
                Not Checked In
              </button>
            </div>
          </div>
        </div>

        {/* Check-Ins List */}
        <div className="space-y-4">
          {filteredCheckIns.length === 0 ? (
            <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No check-ins found
              </h3>
              <p className="text-gray-600">
                {search || filter !== "all"
                  ? "Try adjusting your filters"
                  : "You haven't registered for any events yet"}
              </p>
            </div>
          ) : (
            filteredCheckIns.map((checkIn) => (
              <div
                key={checkIn.event_member_id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Event Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {checkIn.event?.banner_url ? (
                          <img
                            src={checkIn.event.banner_url}
                            alt={checkIn.event.title}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#03215F] to-[#AE9B66] flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-10 h-10 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-[#03215F] mb-2">
                            {checkIn.event?.title || "Event"}
                          </h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatDate(checkIn.event?.start_datetime)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatTime(checkIn.event?.start_datetime)} -{" "}
                                {formatTime(checkIn.event?.end_datetime)}
                              </span>
                            </div>
                            {checkIn.event?.venue_name && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{checkIn.event.venue_name}</span>
                                {checkIn.event?.city && (
                                  <span className="text-gray-500">
                                    , {checkIn.event.city}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${checkIn.checked_in
                            ? "bg-[#AE9B66] text-white"
                            : "bg-[#ECCF0F] text-[#03215F]"
                          }`}
                      >
                        {checkIn.checked_in ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Checked In
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4" />
                            Not Checked In
                          </>
                        )}
                      </span>
                      {checkIn.token && (checkIn.payment_status === 'completed' || checkIn.payment_status === 'free' || !checkIn.event?.is_paid || (checkIn.price_paid != null && Number(checkIn.price_paid) > 0)) && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                          <QrCode className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-mono text-gray-700">
                            {checkIn.token}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Check-In Details */}
                {checkIn.checked_in && (
                  <div className="p-6 bg-gray-50">
                    <h4 className="font-semibold text-[#03215F] mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#AE9B66]" />
                      Check-In Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-[#03215F] mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Check-In Time</p>
                          <p className="font-medium text-gray-900">
                            {formatDateTime(checkIn.checked_in_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-[#03215F] mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Joined At</p>
                          <p className="font-medium text-gray-900">
                            {formatDateTime(checkIn.joined_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Logs */}
                    {checkIn.attendance_logs &&
                      checkIn.attendance_logs.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="font-semibold text-gray-900 mb-3">
                            Attendance Records (
                            {checkIn.attendance_logs.length})
                          </h5>
                          <div className="space-y-3">
                            {checkIn.attendance_logs.map((log, index) => (
                              <div
                                key={log.id || index}
                                className="bg-white rounded-lg p-4 border border-gray-200"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 space-y-2">
                                    {log.agenda && (
                                      <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-[#03215F]" />
                                        <span className="font-medium text-gray-900">
                                          {log.agenda.title}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Clock className="w-4 h-4" />
                                      <span>{formatDateTime(log.scan_time)}</span>
                                    </div>
                                    {log.location && (
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>{log.location}</span>
                                      </div>
                                    )}
                                    {log.device_info && (
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Smartphone className="w-4 h-4" />
                                        <span>{log.device_info}</span>
                                      </div>
                                    )}
                                    {log.scanner && (
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="w-4 h-4" />
                                        <span>
                                          Scanned by: {log.scanner.full_name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Feedback Section */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h5 className="font-bold text-lg text-[#03215F] flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                          Your Feedback
                        </h5>
                        <button
                          onClick={() => handleAddFeedback(checkIn)}
                          className="px-4 py-2.5 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm sm:text-base shadow-md"
                        >
                          {feedbackData.find(
                            (f) => f.event_member_id === checkIn.event_member_id
                          ) ? (
                            <>
                              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>Edit Feedback</span>
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>Add Feedback</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Display Existing Feedback */}
                      {feedbackData
                        .filter((f) => f.event_member_id === checkIn.event_member_id)
                        .map((feedback, idx) => (
                          <div
                            key={feedback.id || idx}
                            className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 sm:p-5 border-2 border-[#03215F]/20 mb-4 shadow-md hover:shadow-lg transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
                                {feedback.rating && (
                                  <div className="flex items-center gap-1 bg-[#ECCF0F]/20 px-3 py-1.5 rounded-lg w-fit">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-4 h-4 sm:w-5 sm:h-5 ${star <= feedback.rating
                                            ? "text-[#ECCF0F] fill-[#ECCF0F]"
                                            : "text-gray-300"
                                          }`}
                                      />
                                    ))}
                                  </div>
                                )}
                                <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg w-fit">
                                  {new Date(
                                    feedback.feedback_date
                                  ).toLocaleDateString("en-BH", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    timeZone: "Asia/Bahrain",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                  onClick={() => {
                                    setSelectedFeedback(feedback);
                                    setSelectedCheckIn(checkIn);
                                    setFeedbackModalOpen(true);
                                  }}
                                  className="px-4 py-2 bg-[#03215F] text-white rounded-lg hover:bg-[#03215F]/90 transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm hover:shadow-md flex-1 sm:flex-none justify-center"
                                  title="Edit feedback"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={async () => {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to delete this feedback? This action cannot be undone."
                                      )
                                    ) {
                                      try {
                                        const response = await fetch(
                                          `/api/dashboard/feedback?id=${feedback.id}`,
                                          {
                                            method: "DELETE",
                                            credentials: "include",
                                          }
                                        );
                                        const data = await response.json();
                                        if (data.success) {
                                          toast.success(
                                            "Feedback deleted successfully"
                                          );
                                          handleFeedbackSuccess();
                                        } else {
                                          toast.error(
                                            data.message ||
                                            "Failed to delete feedback"
                                          );
                                        }
                                      } catch (error) {
                                        console.error(
                                          "Error deleting feedback:",
                                          error
                                        );
                                        toast.error(
                                          "Failed to delete feedback"
                                        );
                                      }
                                    }
                                  }}
                                  className="px-4 py-2 bg-[#b8352d] text-white rounded-lg hover:bg-[#b8352d]/90 transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm hover:shadow-md flex-1 sm:flex-none justify-center"
                                  title="Delete feedback"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-3 sm:p-4 mb-3 border border-gray-200">
                              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                {feedback.feedback_text}
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 pt-3 border-t border-gray-200">
                              <div>
                                {feedback.updated_at !== feedback.created_at ? (
                                  <span className="text-[#AE9B66] font-medium">
                                    Last updated: {new Date(feedback.updated_at).toLocaleString("en-BH", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      timeZone: "Asia/Bahrain",
                                    })}
                                  </span>
                                ) : (
                                  <span>
                                    Submitted: {new Date(feedback.created_at).toLocaleString("en-BH", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      timeZone: "Asia/Bahrain",
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                      {!feedbackData.find(
                        (f) => f.event_member_id === checkIn.event_member_id
                      ) && (
                          <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm sm:text-base text-gray-600 font-medium mb-2">
                              No feedback submitted yet
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 mb-4">
                              Share your experience and help us improve
                            </p>
                            <button
                              onClick={() => handleAddFeedback(checkIn)}
                              className="px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Add Feedback
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Not Checked In Message */}
                {!checkIn.checked_in && (
                  <div className="p-6 bg-gray-50">
                    <div className="flex items-center gap-3 text-gray-600">
                      <AlertCircle className="w-5 h-5 text-[#ECCF0F]" />
                      <p>
                        You have registered for this event but haven't checked
                        in yet. Please check in at the event venue.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Feedback Modal */}
        {feedbackModalOpen && selectedCheckIn && (
          <FeedbackModal
            isOpen={feedbackModalOpen}
            onClose={() => {
              setFeedbackModalOpen(false);
              setSelectedCheckIn(null);
              setSelectedFeedback(null);
            }}
            eventMemberId={selectedCheckIn.event_member_id}
            eventId={selectedCheckIn.event?.id}
            attendanceLogId={
              selectedCheckIn.attendance_logs?.[0]?.id || null
            }
            existingFeedback={selectedFeedback}
            onSuccess={handleFeedbackSuccess}
          />
        )}
      </div>
    </div>
  );
}

