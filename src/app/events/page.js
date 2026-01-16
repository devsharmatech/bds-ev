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
  BadgeCheck,
  Printer,
  QrCode,
  DollarSign,
  CreditCard,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { QRCodeCanvas } from "qrcode.react";
import LoginModal from "@/components/modals/LoginModal";
import RegistrationLiteModal from "@/components/modals/RegistrationLiteModal";
import EventDetailsModal from "@/components/modals/EventDetailsModal";
import EventModal from "@/components/modals/EventModal"; // Your join modal
import SpeakerApplicationModal from "@/components/SpeakerApplicationModal";
import EventQRModal from "@/components/modals/EventQRModal";
import PricingModal from "@/components/modals/PricingModal";
import {
  getUserEventPrice,
  calculateSavings,
  formatBHD as formatBHDPrice,
  getPricingTier,
  getTierDisplayName,
  getAllEventPrices,
  hasMultiplePricingTiers,
} from "@/lib/eventPricing";

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
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [selectedSpeakerEvent, setSelectedSpeakerEvent] = useState(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [badgeFormData, setBadgeFormData] = useState({ event_id: '', email: '' });
  const [badgeVerifying, setBadgeVerifying] = useState(false);
  const [badgeData, setBadgeData] = useState(null);
  const [badgeStatus, setBadgeStatus] = useState(null); // 'approved', 'rejected', 'not_found'
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedQREvent, setSelectedQREvent] = useState(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedPricingEvent, setSelectedPricingEvent] = useState(null);

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
    // Always open details modal for a consistent UX
    setSelectedDetailsEvent(event);
    setIsDetailsModalOpen(true);
  };

  // Handle QR code modal
  const handleQRCode = (event) => {
    setSelectedQREvent(event);
    setIsQRModalOpen(true);
  };

  // Handle view prices modal
  const handleViewPrices = (event) => {
    setSelectedPricingEvent(event);
    setIsPricingModalOpen(true);
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

  // Handle badge verification
  const handleBadgeVerify = async (e) => {
    e.preventDefault();
    
    if (!badgeFormData.event_id || !badgeFormData.email) {
      toast.error('Please select an event and enter your email');
      return;
    }

    setBadgeVerifying(true);
    setBadgeData(null);
    setBadgeStatus(null);

    try {
      // First try to get approved speaker badge
      const badgeRes = await fetch(`/api/speaker-badge/verify?event_id=${badgeFormData.event_id}&email=${encodeURIComponent(badgeFormData.email)}`);

      if (badgeRes.ok) {
        const data = await badgeRes.json();
        if (data.success) {
          setBadgeData(data);
          setBadgeStatus('approved');
        } else {
          // Check if there's a pending/rejected request
          const checkRes = await fetch(`/api/events/speaker-request/check?event_id=${badgeFormData.event_id}&email=${encodeURIComponent(badgeFormData.email)}`);

          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData.exists) {
              setBadgeStatus(checkData.status);
            } else {
              setBadgeStatus('not_found');
            }
          } else {
            setBadgeStatus('not_found');
          }
        }
      } else {
        // Check if there's a pending/rejected request
        const checkRes = await fetch(`/api/events/speaker-request/check?event_id=${badgeFormData.event_id}&email=${encodeURIComponent(badgeFormData.email)}`);

        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData.exists) {
            setBadgeStatus(checkData.status);
          } else {
            setBadgeStatus('not_found');
          }
        } else {
          setBadgeStatus('not_found');
        }
      }
    } catch (error) {
      console.error('Badge verification error:', error);
      setBadgeStatus('error');
    } finally {
      setBadgeVerifying(false);
    }
  };

  // Handle badge print
  const handleBadgePrint = () => {
    const printContent = document.getElementById('speaker-badge-print');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const badgeHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Speaker Badge - ${badgeData?.speaker?.full_name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 20px;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .badge-container {
              width: 400px;
              height: 600px;
              background: linear-gradient(135deg, #03215F 0%, #1a3a7f 100%);
              border-radius: 20px;
              padding: 30px;
              color: white;
              position: relative;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(3, 33, 95, 0.3);
            }
            .badge-bg {
              position: absolute;
              top: -100px;
              right: -100px;
              width: 300px;
              height: 300px;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 50%;
            }
            .badge-bg2 {
              position: absolute;
              bottom: -150px;
              left: -150px;
              width: 400px;
              height: 400px;
              background: rgba(255, 255, 255, 0.03);
              border-radius: 50%;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 30px;
              position: relative;
              z-index: 2;
            }
            .logo-section {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .logo {
              width: 50px;
              height: 50px;
              background: white;
              border-radius: 12px;
              padding: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .org-info h3 {
              font-size: 14px;
              font-weight: 700;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .org-info p {
              font-size: 10px;
              opacity: 0.8;
              letter-spacing: 1px;
            }
            .speaker-title {
              text-align: center;
              margin: 30px 0;
              position: relative;
              z-index: 2;
            }
            .speaker-title h1 {
              font-size: 32px;
              font-weight: 900;
              letter-spacing: 2px;
              margin-bottom: 8px;
            }
            .category {
              font-size: 18px;
              background: rgba(255, 255, 255, 0.2);
              padding: 8px 20px;
              border-radius: 25px;
              display: inline-block;
              font-weight: 700;
              letter-spacing: 2px;
              text-transform: uppercase;
            }
            .speaker-info {
              text-align: center;
              margin-bottom: 25px;
              position: relative;
              z-index: 2;
            }
            .speaker-name {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .speaker-title-text {
              font-size: 16px;
              opacity: 0.9;
              margin-bottom: 4px;
            }
            .speaker-designation {
              font-size: 14px;
              opacity: 0.8;
            }
            .event-info {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 15px;
              padding: 20px;
              margin-bottom: 25px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              position: relative;
              z-index: 2;
            }
            .event-title {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 12px;
              line-height: 1.3;
            }
            .event-details {
              font-size: 12px;
              opacity: 0.9;
              line-height: 1.4;
            }
            .event-date {
              margin-bottom: 6px;
              font-weight: 500;
            }
            .event-end-date {
              margin-bottom: 6px;
              font-weight: 400;
              color: rgba(255, 255, 255, 0.8);
            }
            .event-agendas {
              margin-bottom: 6px;
              font-weight: 500;
              color: rgba(255, 255, 255, 0.9);
            }
            .event-venue {
              opacity: 0.8;
            }
            .qr-section {
              display: flex;
              justify-content: center;
              position: relative;
              z-index: 2;
            }
            .qr-container {
              background: white;
              padding: 8px;
              border-radius: 12px;
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            }
            @media print {
              body { margin: 0; padding: 0; }
              .badge-container { 
                width: 100%;
                max-width: 400px;
                height: auto;
                min-height: 600px;
                margin: 0 auto;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="badge-container">
            <div class="badge-bg"></div>
            <div class="badge-bg2"></div>
            
            <div class="header">
              <div class="logo-section">
                <div class="logo">
                  <img src="/logo.png" alt="BDS Logo" style="width: 100%; height: 100%; object-fit: contain;" />
                </div>
                <div class="org-info">
                  <h3>BAHRAIN DENTAL SOCIETY</h3>
                  <p>OFFICIAL SPEAKER</p>
                </div>
              </div>
            </div>
            
            <div class="speaker-title">
              
              <div class="category">${(badgeData?.speaker?.category || 'SPEAKER').toUpperCase()}</div>
            </div>
            
            <div class="speaker-info">
              <div class="speaker-name">${badgeData?.speaker?.full_name?.toUpperCase()}</div>
              <div class="speaker-title-text">${badgeData?.speaker?.professional_title || 'Professional Speaker'}</div>
              <div class="speaker-designation">${badgeData?.speaker?.designation || ''}</div>
            </div>
            
            <div class="event-info">
              <div class="event-title">${badgeData?.event?.title}</div>
              <div class="event-details">
                <div class="event-date">Start: ${badgeData?.event?.start_datetime ? new Date(badgeData.event.start_datetime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : ''}</div>
                ${badgeData?.event?.end_datetime ? `<div class="event-end-date">End: ${new Date(badgeData.event.end_datetime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>` : ''}
                ${badgeData?.event?.event_agendas && badgeData.event.event_agendas.length > 0 ? `<div class="event-agendas">Total Agendas: ${badgeData.event.event_agendas.length}</div>` : ''}
                ${badgeData?.event?.venue_name ? `<div class="event-venue">${badgeData.event.venue_name}</div>` : ''}
              </div>
            </div>
            
            <div class="qr-section">
              <div class="qr-container" id="qr-container">
                <!-- QR Code will be inserted here -->
              </div>
            </div>
          </div>
          
          <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
          <script>
            // Generate QR code
            const qrData = JSON.stringify({
              type: 'SPEAKER_VERIFICATION',
              speaker_id: '${badgeData?.speaker?.id}',
              speaker_name: '${badgeData?.speaker?.full_name}',
              event_id: '${badgeData?.event?.id}',
              event_title: '${badgeData?.event?.title}',
              category: '${(badgeData?.speaker?.category || 'SPEAKER').toUpperCase()}'
            });
            
            const qr = qrcode(0, 'M');
            qr.addData(qrData);
            qr.make();
            
            const qrContainer = document.getElementById('qr-container');
            qrContainer.innerHTML = qr.createImgTag(3, 4);
            
            // Auto print after a short delay
            setTimeout(() => {
              window.print();
            }, 1000);
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(badgeHTML);
    printWindow.document.close();
  };

  // Get user price using new pricing utility
  const getUserPriceInfo = (event) => {
    return getUserEventPrice(event, user);
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
        <div className={`sticky top-0 z-40 p-4 border-b ${urlMessageType === 'success'
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
              <p className={`text-sm font-medium flex-1 ${urlMessageType === 'success' ? 'text-green-800' : 'text-white'
                }`}>
                {urlMessage}
              </p>
              <button
                onClick={() => {
                  setUrlMessage(null);
                  setUrlMessageType(null);
                }}
                className={`flex-shrink-0 ${urlMessageType === 'success' ? 'text-green-600 hover:text-green-700' : 'text-white hover:text-gray-200'
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
              Upcoming <span className="text-[#AE9B66]">Events</span>
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

            {/* Speaker Badge Button */}
            <div className="mt-8">
              <button
                onClick={() => {
                  setIsBadgeModalOpen(true);
                  setBadgeFormData({ event_id: '', email: '' });
                  setBadgeData(null);
                  setBadgeStatus(null);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#AE9B66] hover:bg-[#9a8a5a] text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <BadgeCheck className="w-5 h-5" />
                Speaker Badge
              </button>
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
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === "all"
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
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === "upcoming"
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
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === "running"
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
                    const priceInfo = getUserPriceInfo(event);
                    const priceToPay = priceInfo.isFree ? "FREE" : formatBHDPrice(priceInfo.price);
                    const savings = calculateSavings(event, user);
                    const savingsDisplay = savings > 0 ? formatBHDPrice(savings) : null;
                    const currentTier = getPricingTier(event);
                    const tierDisplay = getTierDisplayName(currentTier);

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
                          className={`absolute -inset-0.5 bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000 ${hoveredCard === event.id ? "opacity-20" : ""
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
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${event.status === "upcoming"
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
                              <div className="flex flex-col items-end gap-1.5">
                                <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-md rounded-xl shadow-xl border border-white/50 overflow-hidden">
                                    {event.is_paid ? (
                                      <div className="px-2.5 py-2 md:px-3 md:py-2.5">
                                        <div className="flex items-center gap-1.5 justify-end">
                                          <BahrainFlag />
                                          <span className="text-sm md:text-base font-bold text-[#03215F]">{priceToPay}</span>
                                          {/* Early Bird Badge */}
                                          {currentTier === 'earlybird' && (
                                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFD700]/90 text-[#03215F] text-[10px] font-semibold animate-pulse shadow-md">
                                              <Sparkles className="w-3 h-3 text-[#AE9B66]" /> Early Bird
                                            </span>
                                          )}
                                        </div>
                                        {(user && priceInfo.category !== 'regular') || hasMultiplePricingTiers(event) ? (
                                          <div className="flex flex-col items-end mt-0.5">
                                            {user && priceInfo.category !== 'regular' && (
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
                                        <span className="text-sm md:text-base font-bold text-[#AE9B66]">FREE</span>
                                      </div>
                                    )}
                                </div>
                                {/* Show More Prices Button */}
                                {event.is_paid && (event.price > 0 || event.member_price > 0 || event.student_price > 0) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewPrices(event);
                                    }}
                                    className="px-2 py-1 md:px-2.5 md:py-1.5 bg-[#03215F]/90 backdrop-blur-sm rounded-lg text-[9px] md:text-[10px] font-medium text-white hover:bg-[#03215F] shadow-lg flex items-center gap-1 transition-all hover:scale-105 hover:shadow-xl"
                                    title="View all prices"
                                  >
                                    <DollarSign className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                    <span className="hidden xs:inline">More prices</span>
                                    <span className="xs:hidden">More</span>
                                  </button>
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

                                {/* Savings Badge */}
                                {savingsDisplay && (
                                  <div className="px-2.5 py-1 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5">
                                    <Gift className="w-3 h-3" />
                                    Save {savingsDisplay}
                                  </div>
                                )}

                                {/* Already Joined / Payment Pending */}
                                {event.payment_pending ? (
                                  <div className="px-2.5 py-1 bg-gradient-to-r from-[#ECCF0F] to-[#b8352d] backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5">
                                    <CreditCard className="w-3 h-3" />
                                    Payment Pending
                                  </div>
                                ) : event.joined ? (
                                  <div className="px-2.5 py-1 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5">
                                    <CheckCircle className="w-3 h-3" />
                                    Joined
                                  </div>
                                ) : null}
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
                                          ` +${event.event_hosts.length - 1
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
                                    className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${event.isFull
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
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                {/* Details Button - Opens EventDetailsModal */}
                                <button
                                  onClick={() => handleViewDetails(event)}
                                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                                >
                                  <Eye className="w-4 h-4" />
                                  Details
                                </button>

                                {/* QR Code Button */}
                                <button
                                  onClick={() => handleQRCode(event)}
                                  className="px-3 py-2 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] text-[#03215F] rounded-lg hover:opacity-90 transition-colors flex items-center justify-center"
                                  title="Share QR Code"
                                >
                                  <QrCode className="w-4 h-4" />
                                </button>

                                {/* View Prices Button */}
                                {(event.price > 0 || event.member_price > 0 || event.student_price > 0) && (
                                  <button
                                    onClick={() => handleViewPrices(event)}
                                    className="px-3 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center"
                                    title="View Prices"
                                  >
                                    <DollarSign className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Join allowed only for upcoming and not full; otherwise show details or joined */}
                                {!event.joined && !event.payment_pending && event.status === "upcoming" && !event.isFull ? (
                                  <button
                                    onClick={() => handleJoinClick(event)}
                                    disabled={joiningEvent === event.id}
                                    className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${joiningEvent === event.id
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-gradient-to-r from-[#03215F] to-[#03215F] text-white hover:shadow-lg"
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
                                ) : event.payment_pending ? (
                                  <button
                                    onClick={() => handleJoinClick(event)}
                                    className="flex-1 py-2 bg-gradient-to-r from-[#ECCF0F] to-[#b8352d] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-90"
                                  >
                                    <CreditCard className="w-4 h-4" />
                                    Complete Payment
                                  </button>
                                ) : event.joined ? (
                                  <button
                                    onClick={() => handleViewDetails(event)}
                                    className="flex-1 py-2 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-90"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Joined
                                  </button>
                                ) : null}
                              </div>
                              
                              {/* Join as Speaker - only for upcoming events */}
                              {event.status === "upcoming" && (
                                <button
                                  onClick={() => {
                                    setSelectedSpeakerEvent(event);
                                    setIsSpeakerModalOpen(true);
                                  }}
                                  className="w-full py-2 border-2 border-[#AE9B66] text-[#AE9B66] rounded-lg font-medium text-sm hover:bg-[#AE9B66] hover:text-white transition-all flex items-center justify-center gap-1.5"
                                >
                                  <Mic className="w-4 h-4" />
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

      {/* Speaker Application Modal */}
      {selectedSpeakerEvent && (
        <SpeakerApplicationModal
          isOpen={isSpeakerModalOpen}
          onClose={() => {
            setIsSpeakerModalOpen(false);
            setSelectedSpeakerEvent(null);
          }}
          event={selectedSpeakerEvent}
        />
      )}

      {/* Speaker Badge Verification Modal */}
      <AnimatePresence>
        {isBadgeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsBadgeModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#03215F] to-[#1a3a7f] p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <BadgeCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Speaker Badge</h2>
                      <p className="text-white/70 text-sm">Verify your speaker status</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsBadgeModalOpen(false)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {!badgeStatus ? (
                  <form onSubmit={handleBadgeVerify} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                      <select
                        value={badgeFormData.event_id}
                        onChange={e => setBadgeFormData(prev => ({ ...prev, event_id: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Choose an event...</option>
                        {events.map(event => (
                          <option key={event.id} value={event.id}>{event.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={badgeFormData.email}
                        onChange={e => setBadgeFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        placeholder="Enter your registered email"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={badgeVerifying}
                      className="w-full py-3 bg-gradient-to-r from-[#03215F] to-[#1a3a7f] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {badgeVerifying ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <BadgeCheck className="w-5 h-5" />
                          Verify Badge
                        </>
                      )}
                    </button>
                  </form>
                ) : badgeStatus === 'approved' && badgeData ? (
                  <div className="space-y-6">
                    {/* Enhanced Badge Preview - Matching Admin Design */}
                    <div id="speaker-badge-print" className="w-full flex justify-center">
                      <div className="w-[320px] h-[500px] bg-gradient-to-br from-[#03215F] to-[#1a3a7f] rounded-2xl p-5 text-white relative overflow-hidden shadow-2xl">
                        {/* Background decorations */}
                        <div className="absolute top-[-80px] right-[-80px] w-48 h-48 bg-white/5 rounded-full"></div>
                        <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-white/[0.03] rounded-full"></div>
                        
                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col">
                          {/* Header with logo */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white rounded-xl p-1.5 flex items-center justify-center">
                              <img src="/logo.png" alt="BDS" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-[#03215F] font-bold text-xs">BDS</span>'; }} />
                            </div>
                            <div>
                              <h3 className="text-xs font-bold tracking-wide">BAHRAIN DENTAL SOCIETY</h3>
                              <p className="text-[10px] opacity-80 tracking-wider">OFFICIAL SPEAKER</p>
                            </div>
                          </div>
                          
                          {/* BIG Speaker title and category */}
                          <div className="text-center mb-4 mt-0">
                            <div className="inline-block bg-white/20 px-5 py-2 rounded-full">
                              <span className="text-lg font-bold tracking-widest uppercase">
                                {badgeData.speaker?.category || 'SPEAKER'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Speaker info */}
                          <div className="text-center mb-2">
                            <h4 className="text-xl font-bold mb-1 uppercase tracking-wide">{badgeData.speaker?.full_name}</h4>
                            <p className="text-sm opacity-90 mb-0.5">{badgeData.speaker?.speaker_title || ''}</p>
                            <p className="text-xs opacity-80">{badgeData.speaker?.affiliation || ''}</p>
                          </div>
                          
                          {/* Event info */}
                          <div className="bg-white/10 rounded-xl p-3 mb-3 border border-white/20">
                            <p className="font-semibold text-center capitalize text-sm mb-2 leading-tight">{badgeData.event?.title}</p>
                            <div className="text-[11px] space-y-1">
                              <p className="font-medium">
                                Start: {badgeData.event?.start_datetime && new Date(badgeData.event.start_datetime).toLocaleDateString('en-US', {
                                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}
                              </p>
                              {badgeData.event?.end_datetime && (
                                <p className="opacity-80">
                                  End: {new Date(badgeData.event.end_datetime).toLocaleDateString('en-US', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                  })}
                                </p>
                              )}
                              {badgeData.event?.event_agendas && badgeData.event.event_agendas.length > 0 && (
                                <p className="opacity-90 font-medium">
                                  Total Agendas: {badgeData.event.event_agendas.length}
                                </p>
                              )}
                              {badgeData.event?.venue_name && (
                                <p className="opacity-80">{badgeData.event.venue_name}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* QR Code */}
                          <div className="flex justify-center mt-auto">
                            <div className="bg-white p-1.5 rounded-lg shadow-lg">
                              <QRCodeCanvas
                                value={JSON.stringify({
                                  type: 'SPEAKER_VERIFICATION',
                                  speaker_id: badgeData.speaker?.id,
                                  speaker_name: badgeData.speaker?.full_name,
                                  event_id: badgeData.event?.id,
                                  event_title: badgeData.event?.title,
                                  category: (badgeData.speaker?.category || 'SPEAKER').toUpperCase()
                                })}
                                size={100}
                                level="M"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleBadgePrint}
                        className="flex-1 py-3 bg-[#AE9B66] text-white rounded-xl font-semibold hover:bg-[#9a8a5a] transition-all flex items-center justify-center gap-2"
                      >
                        <Printer className="w-5 h-5" />
                        Print Badge
                      </button>
                      <button
                        onClick={() => {
                          setBadgeStatus(null);
                          setBadgeData(null);
                          setBadgeFormData({ event_id: '', email: '' });
                        }}
                        className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {badgeStatus === 'pending' && (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto flex items-center justify-center">
                          <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Application Pending</h3>
                        <p className="text-gray-600">Your speaker application is currently under review. You will receive an email once it&apos;s approved.</p>
                      </div>
                    )}
                    {badgeStatus === 'rejected' && (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Application Rejected</h3>
                        <p className="text-gray-600">Unfortunately, your speaker application was not approved. Please contact us for more information.</p>
                      </div>
                    )}
                    {(badgeStatus === 'not_found' || badgeStatus === 'error') && (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No Application Found</h3>
                        <p className="text-gray-600">We couldn&apos;t find a speaker application with this email for the selected event.</p>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setBadgeStatus(null);
                        setBadgeData(null);
                        setBadgeFormData({ event_id: '', email: '' });
                      }}
                      className="mt-6 px-6 py-3 bg-[#03215F] text-white rounded-xl font-semibold hover:bg-[#03215F]/90 transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {isQRModalOpen && selectedQREvent && (
          <EventQRModal
            isOpen={isQRModalOpen}
            onClose={() => setIsQRModalOpen(false)}
            event={selectedQREvent}
          />
        )}
      </AnimatePresence>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        event={selectedPricingEvent}
        user={user}
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
