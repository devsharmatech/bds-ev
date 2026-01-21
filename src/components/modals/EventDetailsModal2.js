"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Download,
  QrCode,
  ExternalLink,
  User,
  Ticket,
  Award,
  Phone,
  Mail,
  Navigation,
  Share2,
  Info as InfoIcon,
  Tag,
  Globe,
  ChevronRight,
  ChevronLeft,
  Menu,
  Smartphone,
  BookOpen,
  List,
  Mic,
  Target,
  Sparkles,
  Zap,
  Briefcase,
  TrendingUp,
  Shield,
  FileText,
  ArrowRight,
  Crown,
  Star,
  CreditCard,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import Link from "next/link";
import { motion } from "framer-motion";

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

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-BH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Bahrain",
  });
};

// Format time
const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-BH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bahrain",
  });
};

// Format BHD currency
const formatBHD = (amount) => {
  if (!amount || amount === 0) return "FREE";
  return new Intl.NumberFormat("en-BH", {
    style: "currency",
    currency: "BHD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
};

// Format agenda time
const formatAgendaTime = (timeString) => {
  if (!timeString) return "";
  return timeString.slice(0, 5); // Get HH:MM format
};

// Get duration between two dates
const getEventDuration = (start, end) => {
  if (!start || !end) return "";
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffHours = Math.abs(endDate - startDate) / 36e5;

  if (diffHours < 1) {
    const diffMinutes = Math.round(diffHours * 60);
    return `${diffMinutes} minutes`;
  } else if (diffHours < 24) {
    return `${Math.round(diffHours)} hours`;
  } else {
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} days`;
  }
};

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

// Mobile tabs navigation component
const MobileTabsMenu = ({ activeTab, setActiveTab, event }) => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
    <div className="flex justify-around p-2">
      <button
        onClick={() => setActiveTab("overview")}
        className={`flex flex-col items-center p-2 rounded-lg ${
          activeTab === "overview"
            ? "bg-[#9cc2ed] text-[#03215F]"
            : "text-gray-500"
        }`}
      >
        <BookOpen className="w-5 h-5 mb-1" />
        <span className="text-xs">Overview</span>
      </button>
      <button
        onClick={() => setActiveTab("agenda")}
        className={`flex flex-col items-center p-2 rounded-lg ${
          activeTab === "agenda"
            ? "bg-[#9cc2ed] text-[#03215F]"
            : "text-gray-500"
        }`}
      >
        <List className="w-5 h-5 mb-1" />
        <span className="text-xs">Agenda</span>
      </button>
      <button
        onClick={() => setActiveTab("hosts")}
        className={`flex flex-col items-center p-2 rounded-lg ${
          activeTab === "hosts"
            ? "bg-[#9cc2ed] text-[#03215F]"
            : "text-gray-500"
        }`}
      >
        <Users className="w-5 h-5 mb-1" />
        <span className="text-xs">Hosts</span>
      </button>
      <button
        onClick={() => setActiveTab("myticket")}
        className={`flex flex-col items-center p-2 rounded-lg ${
          activeTab === "myticket"
            ? "bg-[#9cc2ed] text-[#03215F]"
            : "text-gray-500"
        }`}
      >
        <Ticket className="w-5 h-5 mb-1" />
        <span className="text-xs">Ticket</span>
      </button>
    </div>
  </div>
);

export default function EventDetailsModal({ event, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showQR, setShowQR] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useIsMobile();
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("overview");
      setShowQR(false);
      setShowMobileMenu(false);

      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Calculate progress
  const progress = event?.capacity
    ? Math.min(100, ((event.registered_count || 0) / event.capacity) * 100)
    : 0;

  // Get event type
  const getEventType = () => {
    const title = event?.title?.toLowerCase() || "";
    const desc = event?.description?.toLowerCase() || "";

    if (title.includes("workshop") || desc.includes("workshop"))
      return "Workshop";
    if (title.includes("conference") || desc.includes("conference"))
      return "Conference";
    if (title.includes("seminar") || desc.includes("seminar")) return "Seminar";
    if (title.includes("training") || desc.includes("training"))
      return "Training";
    if (title.includes("networking") || desc.includes("networking"))
      return "Networking";
    return "Event";
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description?.substring(0, 100) || "Check out this event!",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Event link copied to clipboard!");
    }
  };

  // Get status information
  const getStatusInfo = () => {
    const now = new Date();
    const eventDate = new Date(event?.start_datetime);

    if (event?.event_status === "cancelled") {
      return {
        label: "Cancelled",
        color: "red",
        icon: <XCircle className="w-4 h-4" />,
      };
    }

    if (event?.checked_in) {
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
        icon: <Calendar className="w-4 h-4" />,
      };
    }

    return {
      label: "Upcoming",
      color: "blue",
      icon: <CheckCircle className="w-4 h-4" />,
    };
  };

  const status = getStatusInfo();
  const eventType = getEventType();
  const eventDuration = getEventDuration(
    event?.start_datetime,
    event?.end_datetime
  );

  // Determine if the attendee is allowed to access/download the ticket
  // - Free events: always allowed (no payment required)
  // - Paid events: only after successful payment (price_paid > 0 and not payment_pending)
  const canAccessTicket = !event?.is_paid || (
    !!event?.price_paid &&
    Number(event.price_paid) > 0 &&
    !event?.payment_pending
  );

  // QR Code value
  const qrValue = JSON.stringify({
    type: "EVENT_CHECKIN",
    token: event?.token,
    event_id: event?.id,
  });

  const qrRef = useRef(null);

  // Download QR Code
  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `event-qr-${event?.id}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-50 overflow-y-auto touch-none">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col overflow-y-auto max-h-[95vh] border border-white/20 relative"
          style={{
            maxWidth: isMobile ? "calc(100vw - 16px)" : "",
           
            height: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Close Button - Fixed Position */}
          <button
            onClick={onClose}
            className="absolute top-2 md:top-4 right-2 md:right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 shadow-lg active:scale-95 z-30"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Scrollable Content Container */}
          <div 
            className="flex-1 "
            style={{
              
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Header with Gradient */}
            <div className="relative h-24 sm:h-32 md:h-40 lg:h-48 bg-gradient-to-r from-[#03215F] to-[#03215F] overflow-hidden">
            {event?.banner_url ? (
              <>
                <img
                  src={event.banner_url}
                  alt={event?.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#03215F] via-[#03215F] to-[#03215F] flex items-center justify-center">
                <Calendar className="w-16 h-16 md:w-20 md:h-20 text-white/50" />
              </div>
            )}

            {/* Event Title and Status */}
            <div className="absolute bottom-3 md:bottom-4 left-3 md:left-6 right-3 md:right-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                <div className="flex-1">
                  <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2 line-clamp-2 capitalize">
                    {event?.title}
                  </h2>
                  <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                    <span
                      className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm flex items-center gap-1 ${
                        status.color === "red"
                          ? "bg-[#b8352d]/80 text-white"
                          : status.color === "green"
                          ? "bg-[#AE9B66]/80 text-white"
                          : status.color === "blue"
                          ? "bg-[#9cc2ed]/80 text-white"
                          : "bg-gray-500/80 text-white"
                      }`}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                    <span className="px-2 py-1 md:px-3 md:py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs md:text-sm">
                      {eventType}
                    </span>
                   
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2 self-end md:self-auto">
                  <button
                    onClick={handleShare}
                    className="p-1.5 md:p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors active:scale-95"
                    title="Share event"
                    aria-label="Share event"
                  >
                    <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  {event?.google_map_url && (
                    <a
                      href={event.google_map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 md:p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors active:scale-95"
                      title="Open in Maps"
                      aria-label="Open in Maps"
                    >
                      <Navigation className="w-4 h-4 md:w-5 md:h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

            {/* User Status Bar */}
            <div className="border-b border-gray-200 bg-white">
            <div className="px-3 md:px-6 py-3 md:py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <div
                    className={`p-1.5 md:p-2 rounded-lg ${
                      event?.checked_in
                        ? "bg-gradient-to-r from-[#AE9B66] to-[#AE9B66]"
                        : "bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed]"
                    }`}
                  >
                    {event?.checked_in ? (
                      <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    ) : (
                      <Ticket className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm md:text-base text-gray-900 truncate">
                      {event?.checked_in
                        ? "You attended this event"
                        : "You are registered for this event"}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">
                      {event?.checked_in
                        ? `Checked in at ${formatTime(event.checked_in_at)}`
                        : `Joined on ${formatDate(event.joined_at)}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3">
                  {/* Price / Payment Status */}
                  <div className="text-right">
                    {event?.is_paid ? (
                      <>
                        <div className="text-xs md:text-sm text-gray-600">
                          {canAccessTicket ? "You Paid" : "Amount Due"}
                        </div>
                        <div className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-1">
                          <BahrainFlag />
                          <span className="truncate">
                            {canAccessTicket
                              ? formatBHD(event?.price_paid)
                              : formatBHD(event?.member_price ?? event?.regular_price)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs md:text-sm text-gray-600">
                          Ticket Price
                        </div>
                        <div className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-1">
                          <BahrainFlag />
                          <span className="truncate">FREE</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Ticket ID - only show when ticket is accessible */}
                  {canAccessTicket && (
                    <div className="hidden md:block text-right">
                      <div className="text-xs md:text-sm text-gray-600">
                        Token ID
                      </div>
                      <div className="font-mono font-bold text-sm md:text-base text-gray-900 truncate">
                        {event?.token || event?.id?.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

            {/* Tabs - Hidden on mobile (replaced by bottom nav) */}
            <div className="hidden md:flex border-b border-gray-200 bg-white">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === "overview"
                    ? "text-[#03215F] border-b-2 border-[#03215F]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("agenda")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === "agenda"
                    ? "text-[#03215F] border-b-2 border-[#03215F]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-4 h-4" />
                Agenda
              </button>
              <button
                onClick={() => setActiveTab("hosts")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === "hosts"
                    ? "text-[#03215F] border-b-2 border-[#03215F]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users className="w-4 h-4" />
                Hosts & Speakers
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === "details"
                    ? "text-[#03215F] border-b-2 border-[#03215F]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Target className="w-4 h-4" />
                Details
              </button>
              <button
                onClick={() => setActiveTab("myticket")}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === "myticket"
                    ? "text-[#03215F] border-b-2 border-[#03215F]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Ticket className="w-4 h-4" />
                My Ticket
              </button>
            </div>
          </div>

            {/* Content */}
            <div className="p-3 md:p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-4 md:space-y-6">
                {/* Key Information Grid - Mobile Stack */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                      <div className="p-1.5 md:p-2 bg-[#9cc2ed] rounded-lg">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs md:text-sm text-gray-600">
                         Start Date
                        </div>
                        <div className="font-semibold text-sm md:text-base text-gray-900 truncate">
                          {formatDate(event?.start_datetime)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 pl-10 md:pl-11 truncate">
                      {formatTime(event?.start_datetime)}
                      
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                      <div className="p-1.5 md:p-2 bg-[#9cc2ed] rounded-lg">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs md:text-sm text-gray-600">
                          End Date
                        </div>
                        <div className="font-semibold text-sm md:text-base text-gray-900 truncate">
                          {formatDate(event?.end_datetime)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 pl-10 md:pl-11 truncate">
                      
                      {event?.end_datetime &&
                        `${formatTime(event.end_datetime)}`}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                      <div className="p-1.5 md:p-2 bg-[#AE9B66] rounded-lg">
                        <MapPin className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs md:text-sm text-gray-600">
                          Venue
                        </div>
                        <div className="font-semibold text-sm md:text-base text-gray-900 truncate">
                          {event?.venue_name || "Online Event"}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 pl-10 md:pl-11 truncate">
                      {event?.address || "Virtual"}
                      {event?.city && `, ${event.city}`}
                    </div>
                  </div>

                 
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                    About This Event
                  </h3>
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 md:p-5">
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line overflow-y-auto max-h-32 md:max-h-64">
                      {event?.description ||
                        "No description available for this event."}
                    </p>
                  </div>
                </div>

                {/* Event Highlights */}
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                    What You'll Get
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed] rounded-lg">
                      <Award className="w-4 h-4 md:w-5 md:h-5 text-[#03215F] flex-shrink-0" />
                      <span className="text-xs md:text-sm text-gray-700 truncate">
                        Certificate of Participation
                      </span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] rounded-lg">
                      <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-gray-700 flex-shrink-0" />
                      <span className="text-xs md:text-sm text-gray-700 truncate">
                        Networking Opportunities
                      </span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gradient-to-r from-[#03215F]/30 to-[#03215F]/30 rounded-lg">
                      <Globe className="w-4 h-4 md:w-5 md:h-5 text-[#03215F] flex-shrink-0" />
                      <span className="text-xs md:text-sm text-gray-700 truncate">
                        Industry Insights
                      </span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] rounded-lg">
                      <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-gray-700 flex-shrink-0" />
                      <span className="text-xs md:text-sm text-gray-700 truncate">
                        Skill Development
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Agenda Tab */}
            {activeTab === "agenda" && (
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                    <List className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                    Event Schedule
                  </h3>
                  {event?.event_agendas?.length > 0 && (
                    <div className="text-xs md:text-sm text-gray-600">
                      {event.event_agendas.length} sessions
                    </div>
                  )}
                </div>

                {event?.event_agendas && event.event_agendas.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {event.event_agendas.map((agenda, index) => (
                      <div key={index} className="relative">
                        {/* Timeline */}
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#03215F] via-[#03215F] to-transparent"></div>

                        <div className="ml-4 md:ml-6">
                          <div className="flex flex-col md:flex-row gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/50 hover:border-[#03215F]/30 transition-colors">
                            {/* Time Badge */}
                            <div className="flex-shrink-0">
                              <div className="px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-lg text-white font-medium text-center">
                                <div className="text-xs md:text-sm">
                                  {formatAgendaTime(agenda.start_time)}
                                </div>
                                <div className="text-[10px] md:text-xs opacity-90">
                                  to
                                </div>
                                <div className="text-xs md:text-sm">
                                  {formatAgendaTime(agenda.end_time) || "TBD"}
                                </div>
                              </div>
                            </div>

                            {/* Agenda Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-1 md:gap-0">
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-1 truncate">
                                    {agenda.title}
                                  </h4>
                                  {agenda.agenda_date && (
                                    <div className="text-xs text-gray-500 mb-1 md:mb-2">
                                      {formatDate(agenda.agenda_date)}
                                    </div>
                                  )}
                                </div>
                                {agenda.speaker && (
                                  <div className="flex items-center gap-1 md:gap-2 px-2 py-1 bg-gray-100 rounded-full self-start">
                                    <User className="w-3 h-3 md:w-4 md:h-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-xs md:text-sm text-gray-600 truncate">
                                      {agenda.speaker}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {agenda.description && (
                                <p className="text-gray-600 text-xs md:text-sm mt-2 line-clamp-2 md:line-clamp-3">
                                  {agenda.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8">
                    <Calendar className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" />
                    <p className="text-sm md:text-base text-gray-500">
                      Agenda details will be announced soon
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Hosts Tab */}
            {activeTab === "hosts" && (
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                    Event Hosts & Speakers
                  </h3>
                  {event?.event_hosts?.length > 0 && (
                    <div className="text-xs md:text-sm text-gray-600">
                      {event.event_hosts.length} host
                      {event.event_hosts.length > 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                {event?.event_hosts && event.event_hosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {event.event_hosts.map((host, index) => (
                      <div
                        key={index}
                        className="p-3 md:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/50 hover:border-[#03215F]/30 transition-colors"
                      >
                        <div className="flex items-start gap-3 md:gap-4">
                          {/* Host Avatar */}
                          <div className="relative flex-shrink-0">
                            {host.profile_image ? (
                              <img
                                src={host.profile_image}
                                alt={host.name}
                                className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white shadow-lg"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] border-2 border-white flex items-center justify-center shadow-lg">
                                <User className="w-6 h-6 md:w-8 md:h-8 text-[#03215F]" />
                              </div>
                            )}
                            {host.is_primary && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 md:w-6 md:h-6 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] rounded-full flex items-center justify-center border border-white shadow">
                                <Award className="w-2 h-2 md:w-3 md:h-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Host Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-start justify-between mb-1 gap-1">
                              <h4 className="font-bold text-sm md:text-base text-gray-900 truncate">
                                {host.name}
                              </h4>
                              {host.is_primary && (
                                <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-gradient-to-r from-[#ECCF0F]/10 to-[#ECCF0F]/10 rounded text-[10px] md:text-xs font-medium text-[#ECCF0F] self-start">
                                  <Award className="w-2 h-2 md:w-3 md:h-3 inline mr-0.5 md:mr-1" />
                                  Primary
                                </span>
                              )}
                            </div>

                            {host.bio && (
                              <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3 line-clamp-2">
                                {host.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8">
                    <Users className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" />
                    <p className="text-sm md:text-base text-gray-500">
                      Host information will be announced soon
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="space-y-4 md:space-y-6">
                {/* Event Requirements */}
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                    Requirements & Details
                  </h3>
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 md:p-5">
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <div className="font-semibold text-sm md:text-base text-gray-900 mb-1 md:mb-2">
                          What to Bring
                        </div>
                        <ul className="list-disc list-inside text-gray-600 space-y-1 text-xs md:text-sm">
                          <li>Valid ID or Membership Card</li>
                          <li>Notebook and Pen (optional)</li>
                          <li>Laptop (for workshops)</li>
                          <li>Business Cards (for networking)</li>
                        </ul>
                      </div>

                      <div>
                        <div className="font-semibold text-sm md:text-base text-gray-900 mb-1 md:mb-2">
                          Dress Code
                        </div>
                        <p className="text-gray-600 text-xs md:text-sm">
                          Business Casual or Smart Casual
                        </p>
                      </div>

                      <div>
                        <div className="font-semibold text-sm md:text-base text-gray-900 mb-1 md:mb-2">
                          Language
                        </div>
                        <p className="text-gray-600 text-xs md:text-sm">
                          Primary: English | Secondary: Arabic
                        </p>
                      </div>

                      {event?.capacity && (
                        <div>
                          <div className="font-semibold text-sm md:text-base text-gray-900 mb-1 md:mb-2">
                            Capacity
                          </div>
                          <p className="text-gray-600 text-xs md:text-sm">
                            Limited to {event.capacity} participants
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                    Contact & Support
                  </h3>
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 md:p-5">
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs md:text-sm text-gray-600">
                            Email
                          </div>
                          <div className="font-medium text-sm md:text-base text-gray-900 truncate">
                           info@bds-bh.org
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-3">
                        <Phone className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs md:text-sm text-gray-600">
                            Phone
                          </div>
                          <div className="font-medium text-sm md:text-base text-gray-900 truncate">
                             +973 37990963
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-3">
                        <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs md:text-sm text-gray-600">
                            Support Hours
                          </div>
                          <div className="font-medium text-sm md:text-base text-gray-900 truncate">
                            9:00 AM - 5:00 PM
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* My Ticket Tab */}
            {activeTab === "myticket" && (
              <div className="space-y-4 md:space-y-6">
                {canAccessTicket ? (
                  <>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 md:mb-2">
                        Your Event Ticket
                      </h3>
                      <p className="text-sm text-gray-600">
                        Show this at the event registration desk
                      </p>
                    </div>

                    {/* Ticket Card */}
                    <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-2xl p-4 md:p-6 text-white relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-white rounded-full -translate-y-8 md:-translate-y-16 translate-x-8 md:translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 md:w-48 md:h-48 bg-white rounded-full -translate-x-12 md:-translate-x-24 translate-y-12 md:translate-y-24"></div>
                      </div>

                      <div className="relative">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-2">
                          <div>
                            <div className="text-xs md:text-sm opacity-90">
                              BDS
                            </div>
                            <div className="text-lg md:text-xl font-bold">
                              EVENT TICKET
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs md:text-sm opacity-90">
                              Token ID
                            </div>
                            <div className="font-mono font-bold text-sm md:text-base">
                              {event?.token || event?.id?.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 md:mb-6">
                          <div className="text-xs md:text-sm opacity-90 mb-1">
                            EVENT
                          </div>
                          <div className="text-base md:text-lg font-bold truncate capitalize">
                            {event?.title}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-6">
                          <div>
                            <div className="text-xs md:text-sm opacity-90 mb-1">
                              DATE
                            </div>
                            <div className="font-semibold text-sm md:text-base">
                              {formatDate(event?.start_datetime)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs md:text-sm opacity-90 mb-1">
                              TIME
                            </div>
                            <div className="font-semibold text-sm md:text-base">
                              {formatTime(event?.start_datetime)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs md:text-sm opacity-90 mb-1">
                              VENUE
                            </div>
                            <div className="font-semibold text-sm md:text-base truncate">
                              {event?.venue_name || "Online"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs md:text-sm opacity-90 mb-1">
                              STATUS
                            </div>
                            <div className="font-semibold text-sm md:text-base truncate">
                              {status.label.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 md:pt-6 border-t border-white/20 gap-3">
                          <div className="text-xs md:text-sm opacity-90">
                            Check-in: Show QR at registration
                          </div>
                          <button
                            onClick={() => setShowQR(!showQR)}
                            className="px-3 py-2 md:px-4 md:py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors active:scale-95 flex items-center justify-center gap-2 text-sm"
                          >
                            <QrCode className="w-3 h-3 md:w-4 md:h-4" />
                            {showQR ? "Hide QR" : "Show QR Code"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    {showQR && (
                      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 md:p-6 text-center">
                        <div className="mb-3 md:mb-4">
                          <div className="font-semibold text-sm md:text-base text-gray-900 mb-1 md:mb-2">
                            Check-in QR Code
                          </div>
                          <div className="text-xs md:text-sm text-gray-600">
                            Show this QR code at the registration desk
                          </div>
                        </div>

                        {/* QR CODE */}
                        <div
                          ref={qrRef}
                          className="bg-white p-3 md:p-6 rounded-lg inline-block shadow mx-auto"
                        >
                          <QRCodeCanvas
                            value={qrValue}
                            size={isMobile ? 180 : 220}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                            includeMargin
                          />
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-3 md:mt-4 flex flex-col sm:flex-row justify-center gap-2">
                          <button
                            onClick={downloadQRCode}
                            className="px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download QR
                          </button>
                        </div>

                        <div className="mt-2 md:mt-3 text-xs text-gray-500">
                          Valid for: {formatDate(event?.start_datetime)}
                        </div>
                      </div>
                    )}

                    {/* Ticket Instructions */}
                    <div className="bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed] rounded-xl p-3 md:p-5">
                      <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                        <InfoIcon className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                        Ticket Instructions
                      </h4>
                      <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-[#AE9B66] mt-0.5 flex-shrink-0" />
                          <span>Bring your ID that matches the ticket name</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-[#AE9B66] mt-0.5 flex-shrink-0" />
                          <span>Check in 30 minutes before event starts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-[#AE9B66] mt-0.5 flex-shrink-0" />
                          <span>Digital or printed ticket accepted</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-[#AE9B66] mt-0.5 flex-shrink-0" />
                          <span>Contact support if you have issues</span>
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 md:space-y-6 text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 md:mb-2">
                      Ticket Available After Payment
                    </h3>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                      This is a paid event. Please complete your payment to
                      generate and download your event ticket.
                    </p>
                    <div className="flex justify-center">
                      <a
                        href={event?.slug ? `/events/${event.slug}` : undefined}
                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity gap-2"
                      >
                        <CreditCard className="w-5 h-5" />
                        Complete Payment
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-3 md:p-6 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="text-xs md:text-sm text-gray-600 text-center md:text-left">
                Need help? Contact us at info@bds-bh.org
              </div>
              <div className="flex items-center justify-center md:justify-end gap-2 md:gap-3">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors active:scale-95 text-sm md:text-base flex-1 md:flex-none"
                >
                  Close
                </button>
              </div>
            </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && isOpen && (
        <MobileTabsMenu
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          event={event}
        />
      )}
    </>
  );
}
