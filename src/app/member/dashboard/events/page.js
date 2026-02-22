// app/dashboard/events/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Download,
  QrCode,
  Filter,
  Search,
  CalendarDays,
  Users,
  Award,
  Ticket,
  Star,
  Crown,
  ExternalLink,
  Eye,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import EventDetailsModal2 from "@/components/modals/EventDetailsModal2";
import CertificateModal from "@/components/certificates/CertificateModal";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-BH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Bahrain",
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-BH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bahrain",
  });
};

export default function MyEventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    search: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    attended: 0,
    cancelled: 0,
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      await fetchUser();
      fetchEvents();
    };
    loadData();
  }, []);

  const fetchUser = async () => {
    try {
      setUserLoading(true);
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        // API returns { user: {...} } directly
        if (data.user) {
          setUser(data.user);
          console.log("User data loaded:", data.user);
        } else {
          console.error("User data not found in response:", data);
          toast.error("User data not available");
        }
      } else {
        console.error("Failed to fetch user:", res.status);
        toast.error("Failed to load user data");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    filterEvents();
  }, [events, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/dashboard/events", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEvents(data.events || []);
          calculateStats(data.events || []);
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (eventsList) => {
    const now = new Date();

    const stats = {
      total: eventsList.length,
      // Total registered/joined events count
      registered: eventsList.filter(
        (e) =>
          e?.joined === true ||
          !!e?.checked_in || // attended implies joined
          !!e?.event_member_data || // presence of membership data
          !!e?.event_member_id || // some APIs return id only
          e?.registration_status === 'joined'
      ).length,
      attended: eventsList.filter((e) => e.checked_in).length,
      cancelled: eventsList.filter((e) => e.event_status === "cancelled")
        .length,
    };

    setStats(stats);
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Filter by status
    if (filters.status !== "all") {
      const now = new Date();
      filtered = filtered.filter((event) => {
        if (filters.status === "upcoming") {
          return !event.checked_in && new Date(event.start_datetime) > now;
        } else if (filters.status === "past") {
          return new Date(event.start_datetime) < now;
        } else if (filters.status === "attended") {
          return event.checked_in;
        } else if (filters.status === "cancelled") {
          return event.event_status === "cancelled";
        }
        return true;
      });
    }

    // Filter by type
    if (filters.type !== "all") {
      filtered = filtered.filter((event) => {
        if (filters.type === "paid") {
          return event.is_paid && event.price_paid > 0;
        } else if (filters.type === "free") {
          return !event.is_paid || event.payment_status === 'free';
        } else if (filters.type === "pending") {
          return event.payment_pending;
        }
        return true;
      });
    }

    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.venue_name?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredEvents(filtered);
  };

  const isEventCompleted = (event) => {
    const now = new Date();
    // Event is completed if status is "completed" or end_datetime has passed
    return event.event_status === 'completed' ||
      (event.end_datetime && new Date(event.end_datetime) < now);
  }

  const handleViewCertificate = async (event) => {
    // Check if event is completed
    if (!isEventCompleted(event)) {
      toast.error("Certificate will be available after the event is completed.");
      return;
    }

    // Ensure user data is available
    if (userLoading) {
      toast.loading("Loading user data...");
      return;
    }

    if (!user) {
      toast.error("User data not available. Please refresh the page.");
      return;
    }

    try {
      toast.loading("Loading certificate data...");

      // Fetch certificate data from API
      const res = await fetch("/api/dashboard/certificates", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Find the certificate for this specific event
          const certificate = data.certificates?.find(
            (cert) => cert.event_id === event.id
          );

          if (certificate) {
            // Use the certificate data from API
            setSelectedCertificate(certificate);
            setShowCertificateModal(true);
            toast.dismiss();
          } else {
            // If certificate not found in API, use event data as fallback
            toast.dismiss();
            toast.error("Certificate data not found. Using event data.");

            const fallbackCertificate = {
              id: event.id,
              event_id: event.id,
              event_title: event.title || "Event",
              event_date: event.start_datetime,
              checked_in_at: event.checked_in_at || event.start_datetime,
              venue_name: event.venue_name || "Venue TBA",
              address: event.address,
              city: event.city,
              state: event.state,
            };

            setSelectedCertificate(fallbackCertificate);
            setShowCertificateModal(true);
          }
        } else {
          toast.dismiss();
          toast.error("Failed to load certificate data");
        }
      } else {
        toast.dismiss();
        toast.error("Failed to fetch certificate data");
      }
    } catch (error) {
      console.error("Error fetching certificate:", error);
      toast.dismiss();
      toast.error("Error loading certificate data");
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleViewEvent = (eventSlug) => {
    if (eventSlug) {
      router.push(`/events/${eventSlug}`);
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.start_datetime);

    if (event.event_status === "cancelled") {
      return {
        label: "Cancelled",
        color: "red",
        icon: <XCircle className="w-4 h-4" />,
      };
    }

    if (event.checked_in) {
      return {
        label: "Attended",
        color: "green",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }

    if (eventDate < now) {
      return {
        label: "Past",
        color: "gray",
        icon: <CalendarDays className="w-4 h-4" />,
      };
    }

    return {
      label: "Upcoming",
      color: "blue",
      icon: <AlertCircle className="w-4 h-4" />,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#03215F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading your events...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">My Events</h1>
            <p className="text-white/80">
              Track and manage all your event registrations
            </p>
          </div>
          <Link href="/events">
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Browse New Events
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#9cc2ed] rounded-lg">
              <Calendar className="w-6 h-6 text-[#03215F]" />
            </div>
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <p className="text-gray-600 text-sm">
            Total Events
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#AE9B66] rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">{stats.registered}</span>
          </div>
          <p className="text-gray-600 text-sm">Registered</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#03215F] rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">{stats.attended}</span>
          </div>
          <p className="text-gray-600 text-sm">Attended</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#b8352d] rounded-lg">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">{stats.cancelled}</span>
          </div>
          <p className="text-gray-600 text-sm">Cancelled</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg bg-transparent"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="attended">Attended</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-transparent"
            >
              <option value="all">All Types</option>
              <option value="paid">Paid Events</option>
              <option value="free">Free Events</option>
              <option value="pending">Payment Pending</option>
            </select>

            <button
              onClick={() =>
                setFilters({ status: "all", type: "all", search: "" })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const status = getEventStatus(event);
            return (
              <div
                key={event.id}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#03215F]/20 to-[#03215F]/20 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-[#03215F]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg capitalize">
                            {event.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color === "green"
                              ? "bg-[#AE9B66] text-white"
                              : status.color === "blue"
                                ? "bg-[#9cc2ed] text-[#03215F]"
                                : status.color === "red"
                                  ? "bg-[#b8352d] text-white"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {formatDate(event.start_datetime)} •{" "}
                            {formatTime(event.start_datetime)}
                          </div>

                          {event.venue_name && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {event.venue_name}
                            </div>
                          )}

                          <div className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            Registered as: <span className="ml-1 capitalize font-medium">{event.registration_category || 'N/A'}</span>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <Ticket className="w-4 h-4 mr-2" />
                            {event.payment_pending
                              ? <span className="text-orange-600 font-medium">Payment Pending</span>
                              : event.payment_status === 'free'
                                ? "Free Event"
                                : event.payment_status === 'completed'
                                  ? <span className="text-green-600 font-medium">Payment Completed</span>
                                  : event.price_paid > 0
                                    ? "Paid Event"
                                    : "Free Event"}
                            {event.price_paid > 0 && (
                              <span className="ml-2 font-medium">
                                (BHD {event.price_paid})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Additional info */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {event.event_hosts &&
                            event.event_hosts.length > 0 && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Users className="w-3 h-3 mr-1" />
                                {event.event_hosts.length} host
                                {event.event_hosts.length > 1 ? "s" : ""}
                              </div>
                            )}
                          {event.event_agendas &&
                            event.event_agendas.length > 0 && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                {event.event_agendas.length} session
                                {event.event_agendas.length > 1 ? "s" : ""}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    {/* Complete Payment Button for Pending Payments */}
                    {event.payment_pending && !event.checked_in && (
                      <Link href={`/events/${event.slug}`} className="w-full sm:w-auto">
                        <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center w-full justify-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Complete Payment
                        </button>
                      </Link>
                    )}

                    {event.checked_in && isEventCompleted(event) && (
                      <button
                        onClick={() => handleViewCertificate(event)}
                        className="px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#b8352d] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center w-full sm:w-auto justify-center"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Certificate
                      </button>
                    )}
                    {event.checked_in && !isEventCompleted(event) && (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed flex items-center w-full sm:w-auto justify-center"
                        title="Certificate will be available after the event is completed"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Certificate (Pending)
                      </button>
                    )}

                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleViewDetails(event)}
                        className="px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center flex-1 sm:flex-none"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 mb-6">
              {events.length === 0
                ? "You have not registered for any events yet."
                : "No events match your filters."}
            </p>
            <Link href="/events">
              <button className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Browse Events
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal2
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setTimeout(() => setSelectedEvent(null), 300);
          }}
        />
      )}

      {/* Certificate Modal - Only show when both certificate and user data are available */}
      {selectedCertificate && user && (
        <CertificateModal
          certificate={selectedCertificate}
          user={user}
          isOpen={showCertificateModal}
          onClose={() => {
            setShowCertificateModal(false);
            setSelectedCertificate(null);
          }}
        />
      )}
    </div>
  );
}
