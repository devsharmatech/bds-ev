"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Download,
  Upload,
  X,
  Image as ImageIcon,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Building,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CalendarDays,
  Tag,
  Shield,
  FileText,
  User,
  Mic,
  ListChecks,
  MessageSquare,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Components
import EventModal from "@/components/EventModal";
import DeleteModal from "@/components/DeleteModal";
import ViewModal from "@/components/ViewModal";

// Bahrain data
const BAHRAIN_CITIES = [
  "Manama",
  "Riffa",
  "Muharraq",
  "Hamad Town",
  "A'ali",
  "Isa Town",
  "Sitra",
  "Budaiya",
  "Jidhafs",
  "Al-Malikiyah",
  "Adliya",
  "Hoora",
  "Seef",
  "Juffair",
  "Amwaj Islands",
  "Diyar Al-Muharraq",
  "Bahrain Bay",
];

const BAHRAIN_GOVERNORATES = [
  "Capital Governorate",
  "Muharraq Governorate",
  "Northern Governorate",
  "Southern Governorate",
];

const EVENT_STATUSES = [
  {
    value: "upcoming",
    label: "Upcoming",
    color: "bg-[#9cc2ed] text-[#03215F]",
  },
  {
    value: "ongoing",
    label: "Ongoing",
    color: "bg-[#AE9B66] text-white",
  },
  {
    value: "completed",
    label: "Completed",
    color:
      "bg-[#03215F] text-white",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-[#b8352d] text-white",
  },
];

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
    weekday: "short",
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

// Format time without date
const formatTime = (timeString) => {
  if (!timeString) return "";
  return timeString.substring(0, 5); // Returns HH:MM format
};

// Format agenda date
const formatAgendaDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-BH", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Bahrain",
  });
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
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
    status: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  // Fetch events with hosts and agendas
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters,
      });

      const response = await fetch(`/api/admin/events?${params}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
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

  // Handle create event
  const handleCreate = () => {
    setSelectedEvent(null);
    setShowCreateModal(true);
  };

  // Handle edit event
  const handleEdit = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  // Handle view event details
  const handleView = (event) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  // Handle delete event
  const handleDeleteClick = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;

    setModalLoading(true);
    try {
      const response = await fetch(`/api/admin/events/${selectedEvent.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Event deleted successfully");
        fetchEvents();
        setShowDeleteModal(false);
        setSelectedEvent(null);
      } else {
        toast.error(data.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    } finally {
      setModalLoading(false);
    }
  };

  // Handle form submission success
  const handleFormSuccess = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    fetchEvents();
    toast.success("Event saved successfully");
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig =
      EVENT_STATUSES.find((s) => s.value === status) || EVENT_STATUSES[0];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
      >
        {statusConfig.label}
      </span>
    );
  };

  // Helper function to get event stats
  const getEventStats = (event) => {
    const stats = {
      hosts: 0,
      agendas: 0,
      members: 0,
      capacity: event.capacity || 0,
    };

    if (event.event_hosts) {
      stats.hosts = event.event_hosts.length;
    }

    if (event.event_agendas) {
      stats.agendas = event.event_agendas.length;
    }

    // Note: event_members would need a separate API call
    return stats;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <EventModal
            mode="create"
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleFormSuccess}
            bahrainCities={BAHRAIN_CITIES}
            bahrainGovernorates={BAHRAIN_GOVERNORATES}
          />
        )}
      </AnimatePresence>

      {/* Edit Event Modal */}
      <AnimatePresence>
        {showEditModal && selectedEvent && (
          <EventModal
            mode="edit"
            event={selectedEvent}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleFormSuccess}
            bahrainCities={BAHRAIN_CITIES}
            bahrainGovernorates={BAHRAIN_GOVERNORATES}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedEvent && (
          <DeleteModal
            event={selectedEvent}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteConfirm}
            loading={modalLoading}
          />
        )}
      </AnimatePresence>

      {/* View Event Modal */}
      <AnimatePresence>
        {showViewModal && selectedEvent && (
          <ViewModal
            event={selectedEvent}
            onClose={() => setShowViewModal(false)}
            onEdit={() => {
              setShowViewModal(false);
              handleEdit(selectedEvent);
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
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#03215F] to-[#03215F] shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                  Event Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Create, manage, and track all events in Bahrain
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <button
              onClick={handleCreate}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Event
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
                placeholder="Search events..."
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
                <option value="">All Status</option>
                {EVENT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent appearance-none"
              >
                <option value="created_at">Created Date</option>
                <option value="start_datetime">Event Date</option>
                <option value="title">Title</option>
                <option value="capacity">Capacity</option>
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

        {/* EVENTS TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#03215F] animate-spin mb-4" />
              <p className="text-gray-600">
                Loading events...
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Calendar className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                No events found
              </p>
              <p className="text-gray-500 text-sm mb-6">
                {filters.search || filters.status
                  ? "Try changing your filters"
                  : "Create your first event to get started"}
              </p>
              <button
                onClick={handleCreate}
                className="px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Event
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
                        Event Details
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Date & Time
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                        Location
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
                    {events.map((event) => {
                      const stats = getEventStats(event);

                      return (
                        <motion.tr
                          key={event.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-start gap-4">
                              {event.banner_url ? (
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={event.banner_url}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] border border-[#9cc2ed]/50 flex items-center justify-center flex-shrink-0">
                                  <Calendar className="w-8 h-8 text-[#9cc2ed]" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-1 truncate capitalize">
                                  {event.title}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                  {event.description ||
                                    "No description provided"}
                                </p>
                                <div className="flex flex-wrap items-center gap-3">
                                  {event.is_paid ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#AE9B66]">
                                      <DollarSign className="w-3 h-3" />
                                      Regular: {formatBHD(event.regular_price)}
                                      {event.member_price && (
                                        <span className="text-gray-500 ml-1">
                                          | Member:{" "}
                                          {formatBHD(event.member_price)}
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                                      <Shield className="w-3 h-3" />
                                      Free
                                    </span>
                                  )}
                                  {event.capacity && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                                      <Users className="w-3 h-3" />
                                      {event.capacity} capacity
                                    </span>
                                  )}
                                  {stats.hosts > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                                      <User className="w-3 h-3" />
                                      {stats.hosts} host
                                      {stats.hosts !== 1 ? "s" : ""}
                                    </span>
                                  )}
                                  {stats.agendas > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                                      <ListChecks className="w-3 h-3" />
                                      {stats.agendas} agenda
                                      {stats.agendas !== 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <CalendarDays className="w-4 h-4" />
                                {formatDateBH(event.start_datetime)}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                {formatTimeBH(event.start_datetime)}
                                {event.end_datetime &&
                                  ` - ${formatTimeBH(event.end_datetime)}`}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              {event.venue_name && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Building className="w-4 h-4" />
                                  <span className="truncate max-w-[150px]">
                                    {event.venue_name}
                                  </span>
                                </div>
                              )}
                              {(event.city || event.state) && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  <span className="truncate max-w-[150px]">
                                    {event.city}
                                    {event.state && `, ${event.state}`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <StatusBadge status={event.status} />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {/* Add Members Button */}
                              <button
                                onClick={() =>
                                  router.push(
                                    `/admin/events/${event.id}/members`
                                  )
                                }
                                className="p-2 rounded-lg bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed] text-[#03215F] hover:text-[#03215F] transition-colors hover:scale-110 active:scale-95"
                                title="Manage Members"
                              >
                                <Users className="w-4 h-4" />
                              </button>

                              {/* Add Attendance Button */}
                              <button
                                onClick={() =>
                                  router.push(
                                    `/admin/events/${event.id}/attendance`
                                  )
                                }
                                className="p-2 rounded-lg bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white hover:opacity-90 transition-colors hover:scale-110 active:scale-95"
                                title="View Attendance"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>

                              {/* View Feedback Button */}
                              <button
                                onClick={() =>
                                  router.push(
                                    `/admin/events/${event.id}/feedback`
                                  )
                                }
                                className="p-2 rounded-lg bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] text-[#03215F] hover:opacity-90 transition-colors hover:scale-110 active:scale-95"
                                title="View Feedback"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleView(event)}
                                className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 active:scale-95"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(event)}
                                className="p-2 rounded-lg bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed] text-[#03215F] hover:text-[#03215F] transition-colors hover:scale-110 active:scale-95"
                                title="Edit Event"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(event)}
                                className="p-2 rounded-lg bg-gradient-to-r from-[#b8352d] to-[#b8352d] text-white hover:opacity-90 transition-colors hover:scale-110 active:scale-95"
                                title="Delete Event"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
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
                    events
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
