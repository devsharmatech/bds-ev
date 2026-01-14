"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import MainLayout from "@/components/MainLayout";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ExternalLink,
  User,
  Award,
  BookOpen,
  Share2,
  Loader2,
  Mail,
  Phone,
  CalendarDays,
  Timer,
  Building2,
  Globe,
  TrendingUp,
  Info,
  QrCode,
  Download,
  Mic,
} from "lucide-react";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import LoginModal from "@/components/modals/LoginModal";
import RegistrationLiteModal from "@/components/modals/RegistrationLiteModal";
import EventModal from "@/components/modals/EventModal";
import SpeakerApplicationModal from "@/components/SpeakerApplicationModal";

const formatBHD = (amount) => {
  if (!amount) return "FREE";
  return new Intl.NumberFormat("en-BH", {
    style: "currency",
    currency: "BHD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-BH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-BH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-BH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatAgendaTime = (timeString) => {
  if (!timeString) return "";
  // timeString is in format "HH:MM:SS" or "HH:MM"
  const parts = timeString.split(":");
  const hours = parseInt(parts[0]);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
};

const formatAgendaDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-BH", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return "";
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0 && minutes > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
};

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isQuickSignupOpen, setIsQuickSignupOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    fetchEvent();
    checkAuth();
  }, [params.slug]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/event/${params.slug}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setEvent(data.event);
      } else {
        toast.error(data.message || "Event not found");
        router.push("/events");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Failed to load event");
      router.push("/events");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = () => {
    if (!user) {
      setIsQuickSignupOpen(true);
      return;
    }

    if (event.joined) {
      toast.info("You are already registered for this event");
      return;
    }

    // Block joining for past or cancelled events based on dates
    const now = new Date();
    const startDate = event.start_datetime ? new Date(event.start_datetime) : null;
    const endDate = event.end_datetime ? new Date(event.end_datetime) : null;
    if ((event.status && event.status.toLowerCase() === "cancelled") || (endDate && now > endDate)) {
      toast.error("Registration is not available for this event.");
      return;
    }

    setSelectedEvent(event);
    setIsJoinModalOpen(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const calculateProgress = () => {
    if (!event || !event.capacity) return 0;
    return Math.min(100, (event.registered_count / event.capacity) * 100);
  };

  const getEventStatus = () => {
    if (!event) return null;
    const now = new Date();
    const startDate = new Date(event.start_datetime);
    const endDate = new Date(event.end_datetime);

    if (event.status === "cancelled") {
      return { label: "Cancelled", color: "bg-[#b8352d]", textColor: "text-white" };
    }

    if (startDate > now) {
      return { label: "Upcoming", color: "bg-[#9cc2ed]", textColor: "text-[#03215F]" };
    }

    if (startDate <= now && endDate >= now) {
      return { label: "Ongoing", color: "bg-[#AE9B66]", textColor: "text-white" };
    }

    return { label: "Past", color: "bg-gray-500", textColor: "text-white" };
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#03215F] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading event details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-[#b8352d] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push("/events")}
              className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Back to Events
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const status = getEventStatus();
  const progress = calculateProgress();
  const duration = calculateDuration(event.start_datetime, event.end_datetime);
  const spotsLeft = event.capacity ? event.capacity - event.registered_count : null;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#03215F] hover:text-[#AE9B66] transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Events</span>
          </button>
        </div>

        {/* Hero Section with Banner */}
        <div className="relative mb-8">
          {event.banner_url ? (
            <div className="h-80 md:h-[500px] w-full overflow-hidden rounded-2xl mx-4 md:mx-auto max-w-7xl shadow-2xl">
              <img
                src={event.banner_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
          ) : (
            <div className="h-80 md:h-[500px] w-full bg-gradient-to-r from-[#03215F] to-[#AE9B66] flex items-center justify-center rounded-2xl mx-4 md:mx-auto max-w-7xl shadow-2xl">
              <Calendar className="w-32 h-32 text-white/30" />
            </div>
          )}

          {/* Event Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container mx-auto max-w-7xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {status && (
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${status.color} ${status.textColor} shadow-lg`}>
                    {status.label}
                  </span>
                )}
                {event.joined && (
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-[#AE9B66] text-white flex items-center gap-2 shadow-lg">
                    <CheckCircle className="w-4 h-4" />
                    Registered
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3 drop-shadow-2xl leading-tight">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  <span className="font-medium">{formatDate(event.start_datetime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}</span>
                </div>
                {event.venue_name && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">{event.venue_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Info Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="bg-gradient-to-br from-[#03215F] to-[#03215F] rounded-xl p-5 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-6 h-6" />
                    <h3 className="font-semibold">Start Date</h3>
                  </div>
                  <p className="text-2xl font-bold">{formatDate(event.start_datetime)}</p>
                  <p className="text-sm opacity-90 mt-1">{formatTime(event.start_datetime)}</p>
                </div>

                <div className="bg-gradient-to-br from-[#AE9B66] to-[#AE9B66] rounded-xl p-5 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Timer className="w-6 h-6" />
                    <h3 className="font-semibold">Duration</h3>
                  </div>
                  <p className="text-2xl font-bold">{duration || "TBD"}</p>
                  {event.end_datetime && (
                    <p className="text-sm opacity-90 mt-1">Ends: {formatTime(event.end_datetime)}</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] rounded-xl p-5 text-[#03215F] shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6" />
                    <h3 className="font-semibold">Capacity</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {event.registered_count} / {event.capacity || "∞"}
                  </p>
                  {spotsLeft !== null && (
                    <p className="text-sm mt-1">{spotsLeft} spots left</p>
                  )}
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-[#03215F] to-[#AE9B66] rounded-lg">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-[#03215F]">About This Event</h2>
                </div>
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: event.description || "No description available." }}
                />
              </motion.div>

              {/* Location Details */}
              {(event.venue_name || event.address || event.city || event.state || event.pin_code) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-[#ECCF0F] to-[#ECCF0F] rounded-lg">
                      <MapPin className="w-6 h-6 text-[#03215F]" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#03215F]">Location Details</h2>
                  </div>
                  <div className="space-y-4">
                    {event.venue_name && (
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-[#03215F] mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Venue</p>
                          <p className="font-semibold text-gray-900 text-lg">{event.venue_name}</p>
                        </div>
                      </div>
                    )}
                    {event.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#03215F] mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium text-gray-900">{event.address}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4">
                      {event.city && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{event.city}</span>
                        </div>
                      )}
                      {event.state && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{event.state}</span>
                        </div>
                      )}
                      {event.pin_code && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">PIN: {event.pin_code}</span>
                        </div>
                      )}
                    </div>
                    {event.google_map_url && (
                      <a
                        href={event.google_map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#03215F] text-white rounded-lg hover:bg-[#AE9B66] transition-colors font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View on Google Maps
                      </a>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Event Agenda */}
              {event.event_agendas && event.event_agendas.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-[#03215F] to-[#AE9B66] rounded-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#03215F]">Event Agenda</h2>
                  </div>
                  <div className="space-y-4">
                    {event.event_agendas.map((agenda, index) => (
                      <div
                        key={agenda.id || index}
                        className="p-5 border-l-4 border-[#03215F] bg-gradient-to-r from-gray-50 to-white rounded-r-xl hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-2">{agenda.title}</h3>
                            {agenda.agenda_date && (
                              <div className="flex items-center gap-2 text-sm text-[#03215F] mb-1">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">{formatAgendaDate(agenda.agenda_date)}</span>
                              </div>
                            )}
                          </div>
                          {(agenda.start_time || agenda.end_time) && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-[#03215F]/10 rounded-lg">
                              <Clock className="w-4 h-4 text-[#03215F]" />
                              <span className="font-semibold text-[#03215F]">
                                {agenda.start_time ? formatAgendaTime(agenda.start_time) : ""}
                                {agenda.start_time && agenda.end_time ? " - " : ""}
                                {agenda.end_time ? formatAgendaTime(agenda.end_time) : ""}
                              </span>
                            </div>
                          )}
                        </div>
                        {agenda.description && (
                          <p className="text-gray-700 leading-relaxed">{agenda.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Event Hosts */}
              {event.event_hosts && event.event_hosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-[#AE9B66] to-[#AE9B66] rounded-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#03215F]">Event Hosts & Organizers</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {event.event_hosts.map((host, index) => (
                      <div
                        key={host.id || index}
                        className="flex items-start gap-4 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
                      >
                        {host.profile_image ? (
                          <img
                            src={host.profile_image}
                            alt={host.name}
                            className="w-20 h-20 rounded-full object-cover border-4 border-[#03215F]/20 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#03215F] to-[#AE9B66] flex items-center justify-center border-4 border-[#03215F]/20 flex-shrink-0">
                            <User className="w-10 h-10 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{host.name}</h3>
                          {host.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Mail className="w-4 h-4" />
                              <a href={`mailto:${host.email}`} className="hover:text-[#03215F] hover:underline">
                                {host.email}
                              </a>
                            </div>
                          )}
                          {host.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Phone className="w-4 h-4" />
                              <a href={`tel:${host.phone}`} className="hover:text-[#03215F] hover:underline">
                                {host.phone}
                              </a>
                            </div>
                          )}
                          {host.bio && (
                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{host.bio}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 sticky top-6"
              >
                <h3 className="text-xl font-bold text-[#03215F] mb-6">Event Information</h3>
                <div className="space-y-5">
                  {/* Date */}
                  <div className="flex items-start gap-3 p-3 bg-[#9cc2ed]/10 rounded-lg">
                    <div className="p-2 bg-[#9cc2ed] rounded-lg flex-shrink-0">
                      <Calendar className="w-5 h-5 text-[#03215F]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                      <p className="font-bold text-gray-900">{formatDate(event.start_datetime)}</p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-3 p-3 bg-[#AE9B66]/10 rounded-lg">
                    <div className="p-2 bg-[#AE9B66] rounded-lg flex-shrink-0">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Time</p>
                      <p className="font-bold text-gray-900">
                        {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
                      </p>
                      {duration && (
                        <p className="text-sm text-gray-600 mt-1">Duration: {duration}</p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3 p-3 bg-[#ECCF0F]/10 rounded-lg">
                    <div className="p-2 bg-[#ECCF0F] rounded-lg flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#03215F]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</p>
                      <p className="font-bold text-gray-900">{event.location_display}</p>
                      {event.address && (
                        <p className="text-sm text-gray-600 mt-1">{event.address}</p>
                      )}
                      {event.google_map_url && (
                        <a
                          href={event.google_map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#03215F] hover:underline flex items-center gap-1 mt-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on Map
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-start gap-3 p-3 bg-[#03215F]/10 rounded-lg">
                    <div className="p-2 bg-[#03215F] rounded-lg flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Price</p>
                      <p className="font-bold text-gray-900 text-xl">{event.price_to_show}</p>
                      {event.is_paid && event.member_price && (
                        <p className="text-sm text-[#AE9B66] mt-1 font-medium">
                          Member: {formatBHD(event.member_price)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Registration Stats */}
                  {event.capacity && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700">Registrations</p>
                        <p className="text-sm font-bold text-[#03215F]">
                          {event.registered_count} / {event.capacity}
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progress >= 100
                              ? "bg-[#b8352d]"
                              : progress >= 80
                              ? "bg-[#ECCF0F]"
                              : "bg-[#AE9B66]"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {spotsLeft !== null && (
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          {spotsLeft > 0 ? `${spotsLeft} spots remaining` : "Event is full"}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    {!event.joined ? (
                      <button
                        onClick={handleJoinEvent}
                        className="w-full px-6 py-4 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg text-lg"
                      >
                        <CheckCircle className="w-6 h-6" />
                        Register for Event
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-5 bg-gradient-to-br from-[#AE9B66]/20 to-[#AE9B66]/10 rounded-xl border-2 border-[#AE9B66]">
                          <div className="flex items-center gap-2 text-[#AE9B66] mb-3">
                            <CheckCircle className="w-6 h-6" />
                            <span className="font-bold text-lg">You're Registered!</span>
                          </div>
                          {event.event_member_data?.token && (
                            <div className="bg-white p-3 rounded-lg border border-[#AE9B66]/30 mb-3">
                              <p className="text-xs text-gray-500 mb-1">Your Registration Token</p>
                              <p className="font-mono font-bold text-[#03215F] text-sm break-all">
                                {event.event_member_data.token}
                              </p>
                            </div>
                          )}
                          <button
                            onClick={() => setShowQR(!showQR)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            <QrCode className="w-5 h-5" />
                            {showQR ? "Hide QR Code" : "Show QR Code"}
                          </button>
                        </div>

                        {/* QR Code Section */}
                        {showQR && event.event_member_data?.token && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border-2 border-[#03215F]/20"
                          >
                            <div className="text-center mb-6">
                              <h3 className="text-2xl font-bold text-[#03215F] mb-2 flex items-center justify-center gap-2">
                                <QrCode className="w-6 h-6" />
                                Your Event Ticket
                              </h3>
                              <p className="text-gray-600">Show this QR code at the registration desk</p>
                            </div>

                            {/* QR Code Display */}
                            <div
                              ref={qrRef}
                              className="bg-white p-6 rounded-xl shadow-lg inline-block mx-auto mb-6"
                            >
                              <QRCodeCanvas
                                value={JSON.stringify({
                                  type: "EVENT_CHECKIN",
                                  token: event.event_member_data.token,
                                  event_id: event.id,
                                })}
                                size={220}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                level="H"
                                includeMargin
                              />
                            </div>

                            {/* Download Button */}
                            <button
                              onClick={() => {
                                const canvas = qrRef.current?.querySelector("canvas");
                                if (!canvas) return;

                                const pngUrl = canvas
                                  .toDataURL("image/png")
                                  .replace("image/png", "image/octet-stream");

                                const downloadLink = document.createElement("a");
                                downloadLink.href = pngUrl;
                                downloadLink.download = `event-qr-${event.id}.png`;
                                document.body.appendChild(downloadLink);
                                downloadLink.click();
                                document.body.removeChild(downloadLink);
                                toast.success("QR code downloaded!");
                              }}
                              className="w-full px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
                            >
                              <Download className="w-5 h-5" />
                              Download QR Code
                            </button>

                            <div className="mt-4 text-center">
                              <p className="text-xs text-gray-500">
                                Valid for: {formatDate(event.start_datetime)}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={handleShare}
                      className="w-full px-6 py-3 bg-white border-2 border-[#03215F] text-[#03215F] rounded-xl font-semibold hover:bg-[#03215F] hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      Share Event
                    </button>

                    {/* Join as Speaker Button - only for upcoming events */}
                    {status?.label === "Upcoming" && (
                      <button
                        onClick={() => setIsSpeakerModalOpen(true)}
                        className="w-full px-6 py-3 bg-white border-2 border-[#AE9B66] text-[#AE9B66] rounded-xl font-semibold hover:bg-[#AE9B66] hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <Mic className="w-5 h-5" />
                        Join as Speaker
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={() => {
            setIsLoginModalOpen(false);
            checkAuth();
          }}
          onRegisterClick={() => {
            setIsLoginModalOpen(false);
            setIsQuickSignupOpen(true);
          }}
        />
      )}

      {/* Quick Signup */}
      <RegistrationLiteModal
        isOpen={isQuickSignupOpen}
        onClose={() => setIsQuickSignupOpen(false)}
        onSuccess={async () => {
          setIsQuickSignupOpen(false);
          await checkAuth();
          setSelectedEvent(event);
          setIsJoinModalOpen(true);
        }}
        onLoginClick={() => {
          setIsQuickSignupOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {isJoinModalOpen && selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={isJoinModalOpen}
          onClose={() => {
            setIsJoinModalOpen(false);
            setSelectedEvent(null);
          }}
          onSuccess={() => {
            setIsJoinModalOpen(false);
            setSelectedEvent(null);
            fetchEvent();
            checkAuth();
          }}
        />
      )}

      {/* Speaker Application Modal */}
      {event && (
        <SpeakerApplicationModal
          isOpen={isSpeakerModalOpen}
          onClose={() => setIsSpeakerModalOpen(false)}
          event={event}
        />
      )}
    </MainLayout>
  );
}
