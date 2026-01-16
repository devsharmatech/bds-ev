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
  QrCode,
  DollarSign,
  CreditCard,
} from "lucide-react";
import EventModal from "@/components/modals/EventModal";
import LoginModal from "@/components/modals/LoginModal";
import RegistrationLiteModal from "@/components/modals/RegistrationLiteModal";
import SpeakerApplicationModal from "@/components/SpeakerApplicationModal";
import { motion } from "framer-motion";
import { toast } from "sonner";
import EventDetailsModal from "@/components/modals/EventDetailsModal";
import PricingModal from "@/components/modals/PricingModal";
import {
  getUserEventPrice,
  calculateSavings,
  formatBHD as formatBHDPrice,
  getPricingTier,
  getTierDisplayName,
  hasMultiplePricingTiers,
} from "@/lib/eventPricing";
import EventQRModal from "@/components/modals/EventQRModal";

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

// Derive status from start/end datetimes (overrides inconsistent server status)
const deriveEventStatus = (event) => {
  const rawStatus = (event.status || "").toLowerCase();
  if (rawStatus === "cancelled") return "cancelled";
  const now = new Date();
  const start = event.start_datetime ? new Date(event.start_datetime) : null;
  const end = event.end_datetime ? new Date(event.end_datetime) : null;
  if (start && now < start) return "upcoming";
  if (start && now >= start) {
    if (!end || now <= end) return "ongoing";
    if (end && now > end) return "past";
  }
  // Fallbacks if dates are missing
  if (!start && end && now <= end) return "ongoing";
  if (!start && end && now > end) return "past";
  // If we can't determine from dates, use server status or default to upcoming
  if (rawStatus === "ongoing" || rawStatus === "upcoming") return rawStatus;
  return "upcoming";
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
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [selectedSpeakerEvent, setSelectedSpeakerEvent] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedQREvent, setSelectedQREvent] = useState(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedPricingEvent, setSelectedPricingEvent] = useState(null);

  const handleViewDetails = (event) => {
    setSelectedDetailsEvent(event);
    setIsDetailsModalOpen(true);
  };

  // Handle pricing modal
  const handleViewPrices = (event) => {
    setSelectedPricingEvent(event);
    setIsPricingModalOpen(true);
  };

  // Handle QR code modal
  const handleQRCode = (event) => {
    setSelectedQREvent(event);
    setIsQRModalOpen(true);
  };

  const handleJoinAsSpeaker = (event) => {
    // No login required - anyone can apply as speaker
    setSelectedSpeakerEvent(event);
    setIsSpeakerModalOpen(true);
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
        // Show only upcoming events in this section
        const upcoming = Array.isArray(data.events)
          ? data.events.filter((e) => deriveEventStatus(e) === "upcoming")
          : [];
        setEvents(upcoming);
        // Adjust pagination locally for the filtered list
        const pageSize = 6;
        setTotalPages(Math.max(1, Math.ceil(upcoming.length / pageSize)));
        setCurrentPage(1);
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
    // Only allow joining upcoming events; otherwise open details
    const status = deriveEventStatus(event);
    if (status !== "upcoming") {
      handleViewDetails(event);
      return;
    }
    // Ensure fresh auth check to avoid false negatives
    let authedUser = user;
    if (!authedUser) {
      try {
        const resp = await fetch("/api/auth/me", { credentials: "include" });
        if (resp.ok) {
          const data = await resp.json();
          if (data?.user) {
            setUser(data.user);
            authedUser = data.user;
          }
        }
      } catch {
        // ignore
      }
    }

    // If after re-check still not logged in, open join modal and let it request signup
    if (!authedUser) {
      setSelectedEvent(event);
      setIsEventModalOpen(true);
      return;
    }

    // If already joined:
    // - For paid events with unpaid status, allow completing payment
    // - For paid+paid or free, show already joined
    if (event.joined) {
      const isPaidEvent = !!event.is_paid;
      const hasPaid = !!(
        event.payment_paid ||
        (event.event_member_data &&
          Number(event.event_member_data.price_paid) > 0)
      );
      if (isPaidEvent && !hasPaid) {
        setSelectedEvent(event);
        setIsEventModalOpen(true);
        return;
      }
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

                  // Use new pricing utility
                  const priceInfo = getUserEventPrice(event, user);
                  const priceToPay = priceInfo.isFree
                    ? "FREE"
                    : formatBHDPrice(priceInfo.price);
                  const savings = calculateSavings(event, user);
                  const savingsDisplay =
                    savings > 0 ? formatBHDPrice(savings) : null;
                  const currentTier = getPricingTier(event);
                  const tierDisplay = getTierDisplayName(currentTier);
                  // Early Bird badge logic
                  const isEarlyBird =
                    currentTier === "earlybird" && event.is_paid;
                  const getEarlyBirdCountdown = () => {
                    if (!event.early_bird_deadline) return null;
                    const deadline = new Date(event.early_bird_deadline);
                    const now = new Date();
                    if (now >= deadline) return null;
                    const diff = deadline - now;
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor(
                      (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                    );
                    if (days > 0)
                      return `${days} day${days > 1 ? "s" : ""} left`;
                    if (hours > 0)
                      return `${hours} hour${hours > 1 ? "s" : ""} left`;
                    return "Ending soon!";
                  };
                  const earlyBirdCountdown = getEarlyBirdCountdown();

                  const hasPaid = !!(
                    event.payment_paid ||
                    (event.event_member_data &&
                      Number(event.event_member_data.price_paid) > 0)
                  );
                  const derivedStatus = deriveEventStatus(event);

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
                                  derivedStatus === "upcoming"
                                    ? "bg-[#9cc2ed]/80 text-white"
                                    : derivedStatus === "ongoing"
                                    ? "bg-[#AE9B66]/80 text-white"
                                    : "bg-gray-500/80 text-white"
                                }`}
                              >
                                {derivedStatus.charAt(0).toUpperCase() +
                                  derivedStatus.slice(1)}
                              </span>
                            </div>

                            {/* Price Badge */}
                            <div className="flex flex-col items-end gap-1.5">
                              <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-md rounded-xl shadow-xl border border-white/50 overflow-hidden">
                                {event.is_paid ? (
                                  <div className="px-2.5 py-2 md:px-3 md:py-2.5">
                                    <div className="flex items-center gap-1.5 justify-end">
                                      <BahrainFlag />
                                      <span className="text-sm md:text-base font-bold text-[#03215F]">
                                        {priceToPay}
                                      </span>
                                    </div>
                                    {(user &&
                                      priceInfo.category !== "regular") ||
                                    hasMultiplePricingTiers(event) ? (
                                      <div className="flex flex-col items-end mt-0.5">
                                        {user &&
                                          priceInfo.category !== "regular" && (
                                            <span className="text-[9px] md:text-[10px] text-[#AE9B66] font-semibold">
                                              {priceInfo.categoryDisplay}
                                            </span>
                                          )}
                                        {hasMultiplePricingTiers(event) && (
                                          <span className="text-[9px] md:text-[10px] text-gray-500 font-medium">
                                            {tierDisplay}
                                          </span>
                                        )}
                                      </div>
                                    ) : null}
                                  </div>
                                ) : (
                                  <div className="px-3 py-2 md:px-4 md:py-2.5">
                                    <span className="text-sm md:text-base font-bold text-[#AE9B66]">
                                      FREE
                                    </span>
                                  </div>
                                )}
                              </div>
                              {/* More Prices Link */}
                              {event.is_paid &&
                                (event.price > 0 ||
                                  event.member_price > 0 ||
                                  event.student_price > 0) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewPrices(event);
                                    }}
                                    className="px-2 py-1 md:px-2.5 md:py-1.5 bg-[#03215F]/90 backdrop-blur-sm rounded-lg text-[9px] md:text-[10px] font-medium text-white hover:bg-[#03215F] shadow-lg flex items-center gap-1 transition-all hover:scale-105 hover:shadow-xl"
                                    title="View all prices"
                                  >
                                    <DollarSign className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                    <span className="hidden xs:inline">
                                      More prices
                                    </span>
                                    <span className="xs:hidden">More</span>
                                  </button>
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

                              {/* Savings Badge */}
                              {savingsDisplay && (
                                <div className="px-3 py-1.5 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5">
                                  <Gift className="w-3 h-3" />
                                  Save {savingsDisplay}
                                </div>
                              )}

                              {/* Joined / Payment Pending */}
                              {event.payment_pending ? (
                                <div className="px-3 py-1.5 bg-gradient-to-r from-[#ECCF0F] to-[#b8352d] backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5">
                                  <CreditCard className="w-3 h-3" />
                                  Payment Pending
                                </div>
                              ) : event.joined ? (
                                <div className="px-3 py-1.5 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5">
                                  <CheckCircle className="w-3 h-3" />
                                  Joined
                                </div>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {isEarlyBird && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center gap-1 mr-1">
                                <Sparkles className="w-3 h-3" /> EARLY BIRD
                                {earlyBirdCountdown && (
                                  <span className="flex items-center gap-1 ml-1 pl-1.5 border-l border-white/30">
                                    <Clock className="w-3 h-3" />
                                    {earlyBirdCountdown}
                                  </span>
                                )}
                              </span>
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
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDetails(event)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                              >
                                <Eye className="w-4 h-4" />
                                Details
                              </button>

                              {/* View Prices Button */}
                              {event.is_paid && (
                                <button
                                  onClick={() => handleViewPrices(event)}
                                  className="px-3 py-2.5 bg-gradient-to-r from-[#AE9B66]/20 to-[#AE9B66]/10 text-[#AE9B66] border border-[#AE9B66]/30 rounded-lg hover:bg-[#AE9B66]/20 transition-colors flex items-center justify-center"
                                  title="View All Prices"
                                >
                                  <DollarSign className="w-4 h-4" />
                                </button>
                              )}

                              {/* QR Code Button */}
                              <button
                                onClick={() => handleQRCode(event)}
                                className="px-3 py-2.5 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] text-[#03215F] rounded-lg hover:opacity-90 transition-colors flex items-center justify-center"
                                title="Share QR Code"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>

                              {!event.joined &&
                              !event.payment_pending &&
                              derivedStatus === "upcoming" &&
                              !isFull ? (
                                <button
                                  onClick={() => handleJoinNow(event)}
                                  className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white hover:shadow-lg"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                  Join
                                </button>
                              ) : event.payment_pending ? (
                                <button
                                  onClick={() => handleJoinNow(event)}
                                  className="flex-1 py-2.5 bg-gradient-to-r from-[#ECCF0F] to-[#b8352d] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-90"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  Complete Payment
                                </button>
                              ) : event.joined ? (
                                <button
                                  onClick={() => handleViewDetails(event)}
                                  className="flex-1 py-2.5 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-90"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Joined
                                </button>
                              ) : null}
                            </div>

                            {/* Join as Speaker Button */}
                            {derivedStatus === "upcoming" && (
                              <button
                                onClick={() => handleJoinAsSpeaker(event)}
                                className="w-full py-2 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                              >
                                <Briefcase className="w-4 h-4" />
                                Join as Speaker
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
          onLoginRequired={() => {
            setIsEventModalOpen(false);
            setIsQuickSignupOpen(true);
          }}
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

      {/* Speaker Application Modal */}
      {selectedSpeakerEvent && (
        <SpeakerApplicationModal
          event={selectedSpeakerEvent}
          isOpen={isSpeakerModalOpen}
          onClose={() => {
            setIsSpeakerModalOpen(false);
            setSelectedSpeakerEvent(null);
          }}
        />
      )}

      {/* QR Code Modal */}
      {selectedQREvent && (
        <EventQRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          event={selectedQREvent}
        />
      )}

      {/* Pricing Modal */}
      {selectedPricingEvent && (
        <PricingModal
          event={selectedPricingEvent}
          user={user}
          isOpen={isPricingModalOpen}
          onClose={() => {
            setIsPricingModalOpen(false);
            setSelectedPricingEvent(null);
          }}
        />
      )}
    </>
  );
}
