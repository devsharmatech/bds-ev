"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Star,
  Sparkles,
  Tag,
  Award,
  User as UserIcon,
  TrendingUp,
  Eye,
  Zap,
  Gift,
  Shield,
  Briefcase,
  Globe,
} from "lucide-react";
import EventModal from "@/components/modals/EventModal";
import LoginModal from "@/components/modals/LoginModal";
import RegistrationLiteModal from "@/components/modals/RegistrationLiteModal";
import { motion } from "framer-motion";
import { toast } from "sonner";
import EventDetailsModal from "@/components/modals/EventDetailsModal";

// Bahrain flag component
const BahrainFlag = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 640 480"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="640" height="480" fill="#b8352d" />
    <path
      d="
      M0 0
      L200 0
      L160 48
      L200 96
      L160 144
      L200 192
      L160 240
      L200 288
      L160 336
      L200 384
      L160 432
      L200 480
      L0 480
      Z
    "
      fill="#ffffff"
    />
  </svg>
);

// Format BHD currency
const formatBHD = (amount) => {
  if (!amount) return "FREE";
  return new Intl.NumberFormat("en-BH", {
    style: "currency",
    currency: "BHD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
};

// Format date for display
const formatDateDisplay = (dateString) => {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-BH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Bahrain",
  });
};

// Format time for display
const formatTimeDisplay = (startDateString, endDateString) => {
  if (!startDateString) return "";

  const start = new Date(startDateString);
  const startTime = start.toLocaleTimeString("en-BH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bahrain",
  });

  if (!endDateString) return startTime;

  const end = new Date(endDateString);
  const endTime = end.toLocaleTimeString("en-BH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bahrain",
  });

  return `${startTime} - ${endTime}`;
};

// Format relative date (Today, Tomorrow, In X days)
const formatRelativeDate = (dateString) => {
  if (!dateString) return "";
  const eventDate = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset times for comparison
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  return "";
};

// Get event type based on title/description
const getEventType = (event) => {
  const title = event.title?.toLowerCase() || "";
  const description = event.description?.toLowerCase() || "";

  if (title.includes("workshop") || description.includes("workshop")) {
    return {
      label: "Workshop",
      icon: <Briefcase className="w-3 h-3" />,
      color: "bg-[#03215F]",
    };
  }
  if (title.includes("conference") || description.includes("conference")) {
    return {
      label: "Conference",
      icon: <Globe className="w-3 h-3" />,
      color: "bg-[#9cc2ed]",
    };
  }
  if (title.includes("networking") || description.includes("networking")) {
    return {
      label: "Networking",
      icon: <Users className="w-3 h-3" />,
      color: "bg-[#AE9B66]",
    };
  }
  if (title.includes("training") || description.includes("training")) {
    return {
      label: "Training",
      icon: <Zap className="w-3 h-3" />,
      color: "bg-[#ECCF0F]",
    };
  }
  return {
    label: "Event",
    icon: <Calendar className="w-3 h-3" />,
    color: "bg-gray-500",
  };
};

// Calculate progress percentage
const calculateProgress = (registered, capacity) => {
  if (!capacity || capacity === 0) return 0;
  return Math.min(100, (registered / capacity) * 100);
};

export default function EventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isQuickSignupOpen, setIsQuickSignupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailsEvent, setSelectedDetailsEvent] = useState(null);
  const handleViewDetails = (event) => {
    setSelectedDetailsEvent(event);
    setIsDetailsModalOpen(true);
  };
  // Check if user is logged in
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  // Fetch events from API
  const fetchEvents = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/event/public?page=${page}&limit=6`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.page);
      } else {
        setError(data.error || "Failed to fetch events");
        toast.error(data.error || "Failed to load events");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to connect to server");
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleJoinNow = async (event) => {
    // If not logged in, open login modal
    if (!user) {
      setSelectedEvent(event);
      // Offer quick signup flow instead of strict login
      setIsQuickSignupOpen(true);
      return;
    }

    // If already joined, show message
    if (event.joined) {
      toast.success("You have already joined this event!");
      return;
    }

    // Open event modal for payment/confirmation
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleLoginSuccess = async () => {
    toast.success("Login successful!");
    await checkAuth();
    setIsLoginModalOpen(false);

    // If there's a selected event waiting, open event modal
    if (selectedEvent) {
      setIsEventModalOpen(true);
    }
  };

  const handleQuickSignupSuccess = async (createdUser) => {
    await checkAuth();
    setIsQuickSignupOpen(false);
    if (selectedEvent) {
      setIsEventModalOpen(true);
    }
  };

  const handleRegisterRedirect = () => {
    setIsLoginModalOpen(false);
    toast.success("Redirecting to registration...");
    // You can implement router.push('/register') if needed
  };

  const handleEventJoinSuccess = () => {
    toast.success("Successfully joined the event!");
    setIsEventModalOpen(false);
    // Refresh events to update joined status
    fetchEvents(currentPage);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchEvents(newPage);
    }
  };

  if (loading && events.length === 0) {
    return (
      <section className="py-20 pt-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#03215F] mb-4">
              Upcoming <span className="text-[#03215F]">Events</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join our professional development events, workshops, and
              conferences
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 text-[#03215F] animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (error && events.length === 0) {
    return (
      <section className="py-20 pt-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#AE9B66] mb-4">
              Upcoming <span className="text-[#AE9B66]">Events</span>
            </h2>
          </div>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-[#b8352d] mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => fetchEvents()}
              className="mt-4 px-6 py-2 bg-[#03215F] text-white rounded-lg hover:bg-[#03215F] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20 pt-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#AE9B66]/10 to-[#AE9B66]/10 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-[#AE9B66]" />
              <span className="text-sm font-medium text-[#AE9B66]">
                Premium Events
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#AE9B66] mb-4">
              Upcoming <span className="text-[#AE9B66]">Events</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join our professional development events, workshops, and
              conferences. Limited spots available!
            </p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#AE9B66] mb-2">
                No Upcoming Events
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Check back soon for new events and workshops. Subscribe to our
                newsletter to stay updated!
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, index) => {
                  const eventType = getEventType(event);
                  const relativeDate = formatRelativeDate(event.start_datetime);
                  const progress = calculateProgress(
                    event.registered_count || 0,
                    event.capacity
                  );
                  const isAlmostFull = progress >= 80 && progress < 100;
                  const isFull = progress >= 100;
                  const memberSavings = event.member_price
                    ? event.regular_price - event.member_price
                    : 0;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative"
                      onMouseEnter={() => setHoveredCard(event.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      {/* Glow effect on hover */}
                      <div
                        className={`absolute -inset-0.5 bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000 ${
                          hoveredCard === event.id ? "opacity-20" : ""
                        }`}
                      ></div>

                      <div className="relative bg-white  rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 group-hover:border-[#03215F]/30 h-full flex flex-col">
                        {/* Event Banner with Gradient Overlay */}
                        <div className="relative h-56 overflow-hidden">
                          {event.banner_url ? (
                            <>
                              <img
                                src={event.banner_url}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#03215F] via-[#03215F] to-[#03215F] flex items-center justify-center">
                              <Calendar className="w-16 h-16 text-white/50" />
                            </div>
                          )}

                          {/* Top badges */}
                          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                            <div className="flex flex-col gap-2">
                              {/* Event Type */}
                              <div
                                className={`px-3 py-1.5 ${eventType.color} backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5`}
                              >
                                {eventType.icon}
                                {eventType.label}
                              </div>

                              {/* Status Badge */}
                              <span
                                className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                                  event.status === "upcoming"
                                    ? "bg-[#9cc2ed]/80 text-white"
                                    : event.status === "ongoing"
                                    ? "bg-[#AE9B66]/80 text-white"
                                    : "bg-gray-500/80 text-white"
                                }`}
                              >
                                {event.status.charAt(0).toUpperCase() +
                                  event.status.slice(1)}
                              </span>
                            </div>

                            {/* Price Badge */}
                            <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                              {event.is_paid ? (
                                <>
                                  <BahrainFlag />
                                  {formatBHD(event.regular_price)}
                                  {event.member_price && (
                                    <span className="text-xs text-gray-500 ml-1">
                                      | {formatBHD(event.member_price)} member
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-[#AE9B66]">FREE</span>
                              )}
                            </div>
                          </div>

                          {/* Bottom badges */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex flex-wrap gap-2">
                              {/* Urgent badge */}
                              {relativeDate && (
                                <div className="px-3 py-1.5 bg-gradient-to-r from-[#ECCF0F] to-[#b8352d] backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5">
                                  <Zap className="w-3 h-3" />
                                  {relativeDate}
                                </div>
                              )}

                              {/* Member Savings */}
                              {memberSavings > 0 && (
                                <div className="px-3 py-1.5 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5">
                                  <Gift className="w-3 h-3" />
                                  Save {formatBHD(memberSavings)}
                                </div>
                              )}

                              {/* Already Joined */}
                              {event.joined && (
                                <div className="px-3 py-1.5 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5">
                                  <CheckCircle className="w-3 h-3" />
                                  Joined
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="p-5 flex-1 flex flex-col">
                          {/* Title and Description */}
                          <div className="mb-4 flex-1">
                            <h3 className="text-lg font-bold text-[#03215F] mb-2 line-clamp-1 group-hover:text-[#AE9B66] transition-colors capitalize">
                              {event.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {event.description ||
                                "Join this amazing event for professional growth and networking opportunities."}
                            </p>
                          </div>

                          {/* Quick Stats */}
                          <div className="mb-4 grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="p-1.5 bg-[#AE9B66]/10 rounded-lg">
                                <Calendar className="w-3.5 h-3.5 text-[#AE9B66]" />
                              </div>
                              <div>
                                <div className="font-medium text-[#03215F]">
                                  {formatDateDisplay(event.start_datetime)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatTimeDisplay(
                                    event.start_datetime,
                                    event.end_datetime
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <div className="p-1.5 bg-[#AE9B66]/10 rounded-lg">
                                <MapPin className="w-3.5 h-3.5 text-[#AE9B66]" />
                              </div>
                              <div>
                                <div className="font-medium text-[#03215F] line-clamp-1">
                                  {event.venue_name || event.city || "Online"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {event.city || "Virtual Event"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Hosts Preview */}
                          {event.event_hosts &&
                            event.event_hosts.length > 0 && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <UserIcon className="w-3.5 h-3.5" />
                                    <span>Hosted by</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {event.event_hosts.length} host
                                    {event.event_hosts.length > 1 ? "s" : ""}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex -space-x-2">
                                    {event.event_hosts
                                      .slice(0, 3)
                                      .map((host, idx) => (
                                        <div
                                          key={idx}
                                          className="relative"
                                          title={host.name}
                                        >
                                          {host.profile_image ? (
                                            <img
                                              src={host.profile_image}
                                              alt={host.name}
                                              className="w-8 h-8 rounded-full border-2 border-white  shadow"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] border-2 border-white  flex items-center justify-center shadow">
                                              <UserIcon className="w-4 h-4 text-[#03215F]" />
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-xs text-gray-500 truncate">
                                      {event.event_hosts[0]?.name}
                                      {event.event_hosts.length > 1 &&
                                        ` +${
                                          event.event_hosts.length - 1
                                        } more`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Capacity Progress */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-[#AE9B66]" />
                                <span className="text-gray-700">
                                  {event.registered_count || 0} /{" "}
                                  {event.capacity || "∞"} registered
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {isAlmostFull && (
                                  <span className="text-[#ECCF0F] text-xs font-medium">
                                    Almost Full!
                                  </span>
                                )}
                                {isFull && (
                                  <span className="text-[#b8352d] text-xs font-medium">
                                    Sold Out
                                  </span>
                                )}
                                {event.capacity && (
                                  <span className="text-[#AE9B66] font-medium">
                                    {Math.round(progress)}%
                                  </span>
                                )}
                              </div>
                            </div>
                            {event.capacity && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    isFull
                                      ? "bg-[#b8352d]"
                                      : isAlmostFull
                                      ? "bg-[#ECCF0F]"
                                      : "bg-gradient-to-r from-[#AE9B66] to-[#AE9B66]"
                                  }`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            )}
                          </div>

                          {/* Features/Tags */}
                          <div className="mb-4 flex flex-wrap gap-1.5">
                            {event.is_paid && (
                              <span className="px-2 py-1 bg-gradient-to-r from-[#9cc2ed]/10 to-[#03215F]/10 rounded text-xs text-[#03215F] flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Certificate Included
                              </span>
                            )}
                            {event.venue_name &&
                              event.venue_name
                                .toLowerCase()
                                .includes("premium") && (
                                <span className="px-2 py-1 bg-gradient-to-r from-[#ECCF0F]/10 to-[#ECCF0F]/10 rounded text-xs text-[#ECCF0F] flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  Premium Venue
                                </span>
                              )}
                            {event.event_hosts &&
                              event.event_hosts.some((h) => h.is_primary) && (
                                <span className="px-2 py-1 bg-gradient-to-r from-[#03215F]/10 to-[#b8352d]/10 rounded text-xs text-[#03215F] flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  Expert Hosts
                                </span>
                              )}
                          </div>

                          {/* Action Button */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(event)}
                              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                            >
                              <Eye className="w-4 h-4" />
                              Details
                            </button>

                            {!event.joined ? (
                              <button
                                onClick={() => handleJoinNow(event)}
                                disabled={event.status !== "upcoming" || isFull}
                                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
                                  event.status === "upcoming" && !isFull
                                    ? "bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white hover:shadow-lg"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                <ArrowRight className="w-4 h-4" />
                                Join
                              </button>
                            ) : (
                              <button
                                onClick={() => handleViewDetails(event)}
                                className="flex-1 py-2.5 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-90"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Joined
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* View All Events Button */}
              <div className="text-center mt-12">
                <button
                  onClick={() => (window.location.href = "/events")}
                  className="inline-flex items-center px-6 py-3 border-2 border-[#AE9B66] text-[#AE9B66] rounded-xl hover:bg-[#AE9B66]/10 transition-all font-semibold group hover:scale-105"
                >
                  View All Events
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-gray-100  text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors hover:scale-110"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-[#03215F] to-[#03215F] text-white shadow-lg"
                              : "bg-gray-100  text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-gray-100  text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors hover:scale-110"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Event Modal for Payment/Confirmation */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          user={user}
          onLoginRequired={() => setIsLoginModalOpen(true)}
          onJoinSuccess={handleEventJoinSuccess}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setSelectedEvent(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        onRegisterClick={() => {
          setIsLoginModalOpen(false);
          setIsQuickSignupOpen(true);
        }}
      />

      {/* Quick Signup Modal */}
      <RegistrationLiteModal
        isOpen={isQuickSignupOpen}
        onClose={() => setIsQuickSignupOpen(false)}
        onSuccess={handleQuickSignupSuccess}
        onLoginClick={() => {
          setIsQuickSignupOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {selectedDetailsEvent && (
        <EventDetailsModal
          event={selectedDetailsEvent}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          user={user}
          onJoinClick={(event) => {
            setIsDetailsModalOpen(false);
            handleJoinNow(event);
          }}
        />
      )}
    </>
  );
}
