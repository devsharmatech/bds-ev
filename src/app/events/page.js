"use client";

import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Filter,
  Search,
  ChevronRight,
  ExternalLink,
  Tag,
  Award,
  BookOpen,
  Mic,
  Video,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle,
  CalendarDays,
  ListChecks,
  Mail,
  ArrowRight,
  Loader2,
  Sparkles,
  Star,
  Zap,
  Globe,
  Briefcase,
  Gift,
  Shield,
  Eye,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  User as UserIcon,
  TrendingUp,
  AlertCircle,
  X,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import LoginModal from "@/components/modals/LoginModal";
import RegistrationLiteModal from "@/components/modals/RegistrationLiteModal";
import EventDetailsModal from "@/components/modals/EventDetailsModal";
import EventModal from "@/components/modals/EventModal"; // Your join modal

// Bahrain Flag Component
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

// Get event status (upcoming, ongoing, completed, cancelled)
const getEventStatus = (startDate, endDate, status) => {
  if (status === "cancelled") return "cancelled";
  if (status === "completed") return "completed";

  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (now < start) return "upcoming";
  if (end && now > end) return "completed";
  return "ongoing";
};

function EventsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'upcoming', 'running'
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [joiningEvent, setJoiningEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEventForLogin, setSelectedEventForLogin] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailsEvent, setSelectedDetailsEvent] = useState(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedJoinEvent, setSelectedJoinEvent] = useState(null);
  const [urlMessage, setUrlMessage] = useState(null);
  const [urlMessageType, setUrlMessageType] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalAllCount, setTotalAllCount] = useState(0);
  const [isQuickSignupOpen, setIsQuickSignupOpen] = useState(false);

  const categories = [
    "All",
    "Conference",
    "Workshop",
    "Training",
    "Networking",
    "Seminar",
    "Community",
  ];

  // Check if user is logged in
  useEffect(() => {
    checkAuth();
  }, []);

  // Check for URL parameters (success/error messages from payment callback)
  useEffect(() => {
    const success = searchParams.get('success');
    const errorParam = searchParams.get('error');
    const message = searchParams.get('message');
    const eventName = searchParams.get('event');

    if (success || errorParam) {
      const messageType = success ? 'success' : 'error';
      let displayMessage = message;
      
      if (!displayMessage) {
        if (success === 'payment_completed') {
          displayMessage = eventName 
            ? `Payment completed successfully! You are now registered for "${eventName}".`
            : 'Payment completed successfully! You are now registered for the event.';
        } else if (errorParam === 'payment_failed') {
          displayMessage = message || 'Payment was not completed. Please try again.';
        } else if (errorParam === 'payment_error') {
          displayMessage = 'An error occurred during payment processing. Please contact support if payment was deducted.';
        } else if (errorParam === 'invalid_callback') {
          displayMessage = 'Invalid payment callback. Please contact support.';
        } else if (errorParam === 'payment_not_found') {
          displayMessage = 'Payment record not found. Please contact support if payment was deducted.';
        } else if (errorParam === 'payment_update_failed') {
          displayMessage = 'Payment was successful but could not update registration. Please contact support.';
        } else if (errorParam === 'payment_verification_failed') {
          displayMessage = 'Payment verification failed. Please contact support if payment was deducted.';
        } else {
          displayMessage = errorParam || success || 'An error occurred.';
        }
      }

      setUrlMessageType(messageType);
      setUrlMessage(displayMessage);

      // Show toast notification
      if (messageType === 'success') {
        toast.success('Payment Completed!', {
          description: displayMessage,
          duration: 5000,
        });
      } else {
        toast.error('Payment Error', {
          description: displayMessage,
          duration: 5000,
        });
      }

      // Clear URL parameters after displaying message
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      // Refresh events to update joined status
      if (success === 'payment_completed') {
        fetchEvents(currentPage);
      }
    }
  }, [searchParams, currentPage]);

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
  const fetchEvents = async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      // For 'all' and 'running' tabs, include all events (past, ongoing, upcoming)
      // For 'upcoming' tab, only future events
      const includeAll = activeTab === "all" || activeTab === "running";
      const sortOrder = activeTab === "upcoming" ? "asc" : "desc";
      const response = await fetch(`/api/event/public?page=${page}&limit=9&isUpcoming=${includeAll ? "false" : "true"}&sortBy=start_datetime&sortOrder=${sortOrder}`);
      const data = await response.json();

      if (data.success) {
        const processedEvents = data.events.map((event) => {
          const eventType = getEventType(event);
          const relativeDate = formatRelativeDate(event.start_datetime);
          const progress = calculateProgress(
            event.registered_count || 0,
            event.capacity
          );
          const memberSavings = event.member_price
            ? event.regular_price - event.member_price
            : 0;
          const status = getEventStatus(
            event.start_datetime,
            event.end_datetime,
            event.status
          );

          return {
            ...event,
            eventType,
            relativeDate,
            progress,
            memberSavings,
            isAlmostFull: progress >= 80 && progress < 100,
            isFull: progress >= 100,
            status,
          };
        });

        setEvents((prev) => (append ? [...prev, ...processedEvents] : processedEvents));
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(data.pagination?.page || 1);

        // Keep a stable "All Events" total from server regardless of active tab
        if (includeAll && typeof data.pagination?.total === "number") {
          setTotalAllCount(data.pagination.total);
        } else if (!includeAll && totalAllCount === 0 && typeof data.pagination?.total === "number") {
          // Initialize once on first load in case tab starts elsewhere
          setTotalAllCount(data.pagination.total);
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchEvents(1, false);
  }, []);

  // Refetch when tab changes
  useEffect(() => {
    fetchEvents(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Filter events based on active tab and filters
  const filteredEvents = events.filter((event) => {
    // Status filter
    if (activeTab === "upcoming" && event.status !== "upcoming") return false;
    if (activeTab === "running" && event.status !== "ongoing") return false;

    // Category filter
    if (
      selectedCategory !== "All" &&
      event.eventType.label !== selectedCategory
    )
      return false;

    // Search filter
    if (searchQuery !== "") {
      const query = searchQuery.toLowerCase();
      return (
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.event_hosts?.some((host) =>
          host.name?.toLowerCase().includes(query)
        )
      );
    }

    return true;
  });

  // Handle view details
  const handleViewDetails = (event) => {
    if (event.slug) {
      router.push(`/events/${event.slug}`);
    } else {
      // Fallback to modal if no slug
      setSelectedDetailsEvent(event);
      setIsDetailsModalOpen(true);
    }
  };

  // Handle join event click - opens your EventModal
  const handleJoinClick = (event) => {
    setSelectedJoinEvent(event);
    setIsJoinModalOpen(true);
  };

  // Handle join event from EventModal
  const handleJoinEvent = async (event) => {
    // If not logged in, open login modal
    if (!user) {
      setSelectedEventForLogin(event);
      setIsQuickSignupOpen(true);
      return;
    }

    // If already joined, show message
    if (event.joined) {
      toast.success("You have already joined this event!");
      return;
    }

    // Check if event is full
    if (event.isFull) {
      toast.error("This event is sold out!");
      return;
    }

    setJoiningEvent(event.id);

    try {
      const response = await fetch("/api/event/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: event.id,
          payment_reference: event.is_paid
            ? `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Successfully joined the event!");

        // Update the event's joined status locally
        setEvents((prevEvents) =>
          prevEvents.map((ev) =>
            ev.id === event.id
              ? {
                  ...ev,
                  joined: true,
                  registered_count: (ev.registered_count || 0) + 1,
                  progress: calculateProgress(
                    (ev.registered_count || 0) + 1,
                    ev.capacity
                  ),
                  isAlmostFull:
                    calculateProgress(
                      (ev.registered_count || 0) + 1,
                      ev.capacity
                    ) >= 80 &&
                    calculateProgress(
                      (ev.registered_count || 0) + 1,
                      ev.capacity
                    ) < 100,
                  isFull:
                    calculateProgress(
                      (ev.registered_count || 0) + 1,
                      ev.capacity
                    ) >= 100,
                }
              : ev
          )
        );
      } else {
        toast.error(data.message || "Failed to join event");
      }
    } catch (error) {
      console.error("Join error:", error);
      toast.error("Failed to join event. Please try again.");
    } finally {
      setJoiningEvent(null);
    }
  };

  // Handle join success from EventModal
  const handleJoinSuccess = () => {
    toast.success("Successfully joined the event!");
    setIsJoinModalOpen(false);
    fetchEvents(currentPage); // Refresh events to update joined status
  };

  // Handle login success
  const handleLoginSuccess = async () => {
    toast.success("Login successful!");
    await checkAuth();
    setIsLoginModalOpen(false);

    // If there was an event waiting, open join modal
    if (selectedEventForLogin) {
      setSelectedJoinEvent(selectedEventForLogin);
      setIsJoinModalOpen(true);
      setSelectedEventForLogin(null);
    }
  };

  const handleQuickSignupSuccess = async () => {
    await checkAuth();
    setIsQuickSignupOpen(false);
    if (selectedEventForLogin) {
      setSelectedJoinEvent(selectedEventForLogin);
      setIsJoinModalOpen(true);
      setSelectedEventForLogin(null);
    }
  };

  // Get user price
  const getUserPrice = (event) => {
    if (!event.is_paid) return null;
    if (user?.membership_type === "paid" && event.member_price) {
      return event.member_price;
    }
    return event.regular_price;
  };

  // Get running and upcoming counts
  const runningEventsCount =
    activeTab === "running"
      ? filteredEvents.length
      : events.filter((e) => e.status === "ongoing").length;
  const upcomingEventsCount =
    activeTab === "upcoming"
      ? filteredEvents.length
      : events.filter((e) => e.status === "upcoming").length;

  // Pagination handlers removed in favor of "Load More"

  return (
    <MainLayout>
      {/* URL Success/Error Message Banner */}
      {urlMessage && (
        <div className={`sticky top-0 z-40 p-4 border-b ${
          urlMessageType === 'success' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-[#b8352d] border-[#b8352d]'
        }`}>
          <div className="container mx-auto">
            <div className="flex items-start gap-3 max-w-7xl mx-auto">
              {urlMessageType === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm font-medium flex-1 ${
                urlMessageType === 'success' ? 'text-green-800' : 'text-white'
              }`}>
                {urlMessage}
              </p>
              <button
                onClick={() => {
                  setUrlMessage(null);
                  setUrlMessageType(null);
                }}
                className={`flex-shrink-0 ${
                  urlMessageType === 'success' ? 'text-green-600 hover:text-green-700' : 'text-white hover:text-gray-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with EventSection Style */}
      <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] py-16 md:py-20">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                Premium Events
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Upcoming <span className="text-[#ECCF0F]">Events</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Join our professional development events, workshops, and
              conferences. Limited spots available!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-white/10">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {upcomingEventsCount}
                  </div>
                  <div className="text-sm">Upcoming Events</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-white/10">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{runningEventsCount}</div>
                  <div className="text-sm">Running Now</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-white/10">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {events.reduce(
                      (sum, event) => sum + (event.event_hosts?.length || 0),
                      0
                    )}
                    +
                  </div>
                  <div className="text-sm">Expert Hosts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Tabs and Filters */}
        <div className="mb-8 md:mb-12">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-[#03215F] to-[#03215F] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Globe className="w-4 h-4" />
              All Events
              <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded-full">
                {totalAllCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === "upcoming"
                  ? "bg-gradient-to-r from-[#03215F] to-[#03215F] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Upcoming
              <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded-full">
                {upcomingEventsCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("running")}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === "running"
                  ? "bg-gradient-to-r from-[#03215F] to-[#03215F] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              Running Now
              <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded-full">
                {runningEventsCount}
              </span>
            </button>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events by title, description, or host..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">
                    Filter:
                  </span>
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#03215F]/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#03215F] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-lg text-gray-600">
              Loading events...
            </p>
          </div>
        ) : (
          <>
            {/* Events Grid */}
            {filteredEvents.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event, index) => {
                    const userPrice = getUserPrice(event);
                    const priceToPay =
                      userPrice !== null ? formatBHD(userPrice) : "FREE";
                    const memberSavings =
                      user?.membership_type === "paid" && event.member_price
                        ? formatBHD(event.regular_price - event.member_price)
                        : null;

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

                        <div className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 group-hover:border-[#03215F]/30 h-full flex flex-col">
                          {/* Event Banner with Gradient Overlay */}
                          <div className="relative h-48 md:h-56 overflow-hidden">
                            {event.banner_url ? (
                              <>
                                <img
                                  src={event.banner_url}
                                  alt={event.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#03215F] via-[#03215F] to-[#03215F] flex items-center justify-center">
                                <Calendar className="w-16 h-16 text-white/50" />
                              </div>
                            )}

                            {/* Top badges */}
                            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                              <div className="flex flex-col gap-1.5">
                                {/* Event Type */}
                                <div
                                  className={`px-2.5 py-1 ${event.eventType.color} backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5`}
                                >
                                  {event.eventType.icon}
                                  {event.eventType.label}
                                </div>

                                {/* Status Badge */}
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                                    event.status === "upcoming"
                                      ? "bg-[#9cc2ed]/80 text-white"
                                      : event.status === "ongoing"
                                      ? "bg-[#AE9B66]/80 text-white"
                                      : "bg-gray-500/80 text-white"
                                  }`}
                                >
                                  {event.status?.charAt(0).toUpperCase() +
                                    event.status?.slice(1)}
                                </span>
                              </div>

                              {/* Price Badge */}
                              <div className="px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                                {event.is_paid ? (
                                  <>
                                    <BahrainFlag />
                                    {priceToPay}
                                    {event.member_price &&
                                      user?.membership_type === "paid" && (
                                        <span className="text-xs text-gray-500 ml-1">
                                          | {formatBHD(event.member_price)}{" "}
                                          member
                                        </span>
                                      )}
                                  </>
                                ) : (
                                  <span className="text-[#AE9B66]">FREE</span>
                                )}
                              </div>
                            </div>

                            {/* Bottom badges */}
                            <div className="absolute bottom-3 left-3 right-3">
                              <div className="flex flex-wrap gap-1.5">
                                {/* Urgent badge */}
                                {event.relativeDate && (
                                  <div className="px-2.5 py-1 bg-gradient-to-r from-[#ECCF0F] to-[#b8352d] backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5">
                                    <Zap className="w-3 h-3" />
                                    {event.relativeDate}
                                  </div>
                                )}

                                {/* Member Savings */}
                                {memberSavings && (
                                  <div className="px-2.5 py-1 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5">
                                    <Gift className="w-3 h-3" />
                                    Save {memberSavings}
                                  </div>
                                )}

                                {/* Already Joined */}
                                {event.joined && (
                                  <div className="px-2.5 py-1 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5">
                                    <CheckCircle className="w-3 h-3" />
                                    Joined
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Event Details */}
                          <div className="p-4 md:p-5 flex-1 flex flex-col">
                            {/* Title and Description */}
                            <div className="mb-3 md:mb-4 flex-1">
                              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-[#03215F] transition-colors capitalize">
                                {event.title}
                              </h3>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {event.description ||
                                  "Join this amazing event for professional growth and networking opportunities."}
                              </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="mb-3 md:mb-4 grid grid-cols-2 gap-2 md:gap-3">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="p-1 bg-[#03215F]/10 rounded-lg">
                                  <Calendar className="w-3.5 h-3.5 text-[#03215F]" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 text-xs md:text-sm">
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
                                <div className="p-1 bg-[#03215F]/10 rounded-lg">
                                  <MapPin className="w-3.5 h-3.5 text-[#03215F]" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 text-xs md:text-sm line-clamp-1">
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
                                <div className="mb-3 md:mb-4">
                                  <div className="flex items-center justify-between mb-1.5">
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
                                                className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white shadow"
                                                loading="lazy"
                                              />
                                            ) : (
                                              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] border-2 border-white flex items-center justify-center shadow">
                                                <UserIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#03215F]" />
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
                            <div className="mb-3 md:mb-4">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-[#03215F]" />
                                  <span className="text-gray-700">
                                    {event.registered_count || 0} /{" "}
                                    {event.capacity || "∞"} registered
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {event.isAlmostFull && (
                                    <span className="text-[#ECCF0F] text-xs font-medium">
                                      Almost Full!
                                    </span>
                                  )}
                                  {event.isFull && (
                                    <span className="text-[#b8352d] text-xs font-medium">
                                      Sold Out
                                    </span>
                                  )}
                                  {event.capacity && (
                                    <span className="text-[#03215F] font-medium">
                                      {Math.round(event.progress)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              {event.capacity && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                                  <div
                                    className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${
                                      event.isFull
                                        ? "bg-[#b8352d]"
                                        : event.isAlmostFull
                                        ? "bg-[#ECCF0F]"
                                        : "bg-gradient-to-r from-[#03215F] to-[#03215F]"
                                    }`}
                                    style={{ width: `${event.progress}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>

                            {/* Features/Tags */}
                            <div className="mb-3 md:mb-4 flex flex-wrap gap-1">
                              {event.is_paid && (
                                <span className="px-2 py-1 bg-gradient-to-r from-[#9cc2ed]/10 to-[#03215F]/10 rounded text-xs text-[#03215F] flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  Certificate
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
                              {/* Details Button - Opens EventDetailsModal */}
                              <button
                                onClick={() => handleViewDetails(event)}
                                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                              >
                                <Eye className="w-4 h-4" />
                                Details
                              </button>

                              {/* Join Button - Opens EventModal */}
                              {!event.joined ? (
                                <button
                                  onClick={() => handleJoinClick(event)}
                                  disabled={
                                    event.status !== "upcoming" ||
                                    event.isFull ||
                                    joiningEvent === event.id
                                  }
                                  className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
                                    event.status === "upcoming" && !event.isFull
                                      ? "bg-gradient-to-r from-[#03215F] to-[#03215F] text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  }`}
                                >
                                  {joiningEvent === event.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Joining...
                                    </>
                                  ) : (
                                    <>
                                      <ArrowRight className="w-4 h-4" />
                                      Join
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleViewDetails(event)}
                                  className="flex-1 py-2 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-90"
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

                {/* Load More */}
                {currentPage < totalPages && (
                  <div className="flex items-center justify-center mt-8 md:mt-12">
                    <button
                      onClick={() => fetchEvents(currentPage + 1, true)}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More
                          <ChevronRightIcon className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* No Events Found */
              <div className="text-center py-12 md:py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#03215F]/10 to-[#03215F]/10 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-[#03215F]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No Events Found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  {searchQuery ||
                  selectedCategory !== "All" ||
                  activeTab !== "all"
                    ? "Try adjusting your filters or search term. New events are added regularly!"
                    : "There are no events scheduled at the moment. Check back soon!"}
                </p>
                {(searchQuery ||
                  selectedCategory !== "All" ||
                  activeTab !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setActiveTab("all");
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] py-12 md:py-16 mt-8 md:mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {events.length}+
              </div>
              <div className="text-white/90 text-sm md:text-base">
                Total Events
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {events.reduce(
                  (sum, event) => sum + (event.registered_count || 0),
                  0
                )}
                +
              </div>
              <div className="text-white/90 text-sm md:text-base">
                Total Registrations
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {events.reduce(
                  (sum, event) => sum + (event.event_hosts?.length || 0),
                  0
                )}
                +
              </div>
              <div className="text-white/90 text-sm md:text-base">
                Expert Speakers
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                95%
              </div>
              <div className="text-white/90 text-sm md:text-base">
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal - for viewing event details */}
      {selectedDetailsEvent && (
        <EventDetailsModal
          event={selectedDetailsEvent}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          user={user}
          onJoinClick={handleJoinClick}
        />
      )}

      {/* Event Join Modal - for joining events with success animation */}
      {selectedJoinEvent && (
        <EventModal
          event={selectedJoinEvent}
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          user={user}
          onLoginRequired={() => {
            setSelectedEventForLogin(selectedJoinEvent);
            setIsQuickSignupOpen(true);
          }}
          onJoinSuccess={handleJoinSuccess}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setSelectedEventForLogin(null);
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
    </MainLayout>
  );
}

// Wrap the component in Suspense to handle useSearchParams()
export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-[#03215F] animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading events...</p>
            </div>
          </div>
        </MainLayout>
      }
    >
      <EventsPageContent />
    </Suspense>
  );
}
