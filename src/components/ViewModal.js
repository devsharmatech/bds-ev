"use client";

import { motion } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Globe,
  Building,
  Edit2,
  User,
  Phone,
  Mail,
  Shield,
  Award,
  FileText,
  ClipboardCheck,
  ExternalLink,
  CalendarCheck,
  Tag,
  AlertCircle,
  CheckCircle,
  Star,
  Printer,
  Download,
  Share2,
  Eye,
  EyeOff,
  Bone,
  Stethoscope,
  Mic,
  ListChecks,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Briefcase,
  MapPin as MapPinIcon,
} from "lucide-react";
import { useState } from "react";

// Bahrain Flag Component
const BahrainFlag = () => (
  <svg className="w-4 h-4" viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="480" fill="#b8352d"/>
    <rect width="640" height="160" y="160" fill="#fff"/>
    <path d="M0 0h160v480H0z" fill="#fff"/>
    <path d="M0 0h120v480H0z" fill="#b8352d"/>
  </svg>
);

// Format BHD currency
const formatBHD = (amount) => {
  if (!amount) return 'Free';
  return new Intl.NumberFormat('en-BH', {
    style: 'currency',
    currency: 'BHD',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
};

// Format date for Bahrain
const formatDateBH = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-BH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Bahrain',
    ...options
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

// Format time without date
const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString.substring(0, 5); // Returns HH:MM format
};

// Format agenda date
const formatAgendaDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-BH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Bahrain'
  });
};

// Get status color and icon
const getStatusConfig = (status) => {
  switch (status) {
    case 'upcoming':
      return {
        color: 'bg-[#9cc2ed] text-[#03215F]',
        icon: Calendar,
        label: 'Upcoming'
      };
    case 'ongoing':
      return {
        color: 'bg-[#AE9B66] text-white',
        icon: Clock,
        label: 'Ongoing'
      };
    case 'completed':
      return {
        color: 'bg-[#03215F] text-white',
        icon: CheckCircle,
        label: 'Completed'
      };
    case 'cancelled':
      return {
        color: 'bg-[#b8352d] text-white',
        icon: AlertCircle,
        label: 'Cancelled'
      };
    default:
      return {
        color: 'bg-gray-100 text-[#03215F]',
        icon: Calendar,
        label: status
      };
  }
};

export default function ViewModal({ event, onClose, onEdit }) {
  const [expandedSections, setExpandedSections] = useState({
    hosts: true,
    agendas: true,
    details: true
  });

  if (!event) return null;

  const statusConfig = getStatusConfig(event.status);
  const StatusIcon = statusConfig.icon;
  
  // Get hosts and agendas from event
  const hosts = event.event_hosts || [];
  const agendas = event.event_agendas || [];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get event price display
  const getPriceDisplay = () => {
    if (!event.is_paid) return 'Free Event';
    
    if (event.regular_price && event.member_price) {
      return `${formatBHD(event.regular_price)} Regular / ${formatBHD(event.member_price)} Member`;
    } else if (event.regular_price) {
      return `${formatBHD(event.regular_price)}`;
    } else if (event.price) {
      return `${formatBHD(event.price)}`;
    }
    return 'Free';
  };

  return (
    <div className="fixed inset-0 bg-[#03215F]/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Header with Banner - Fixed */}
        <div className="relative flex-shrink-0">
          {event.banner_url ? (
            <div className="h-48 sm:h-56 w-full overflow-hidden">
              <img
                src={event.banner_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03215F]/60 via-[#03215F]/30 to-transparent" />
            </div>
          ) : (
            <div className="h-48 sm:h-56 w-full bg-gradient-to-br from-[#03215F] to-[#03215F] relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <Bone className="w-24 sm:w-32 h-24 sm:h-32 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#03215F]/40 via-transparent to-transparent" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 active:scale-95"
              title="Print Details"
            >
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 active:scale-95"
              title="Edit Event"
            >
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 active:scale-95"
              title="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Event Title and Status */}
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-6 right-3 sm:right-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg truncate">
                  {event.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} flex items-center gap-1 sm:gap-2`}>
                    <StatusIcon className="w-3 h-3" />
                    <span className="hidden sm:inline">{statusConfig.label}</span>
                    <span className="sm:hidden">{statusConfig.label.charAt(0)}</span>
                  </span>
                  {event.is_paid && (
                    <span className="px-2 py-1 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] text-gray-900 rounded-full text-xs font-medium flex items-center gap-1 sm:gap-2">
                      <BahrainFlag />
                      <span className="hidden sm:inline">{getPriceDisplay()}</span>
                      <span className="sm:hidden">Paid</span>
                    </span>
                  )}
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-medium flex items-center gap-1 sm:gap-2">
                    <Bone className="w-3 h-3" />
                    <span className="hidden sm:inline">Dental Event</span>
                    <span className="sm:hidden">Dental</span>
                  </span>
                  {hosts.length > 0 && (
                    <span className="px-2 py-1 bg-[#9cc2ed]/20 backdrop-blur-sm text-white rounded-full text-xs font-medium flex items-center gap-1 sm:gap-2">
                      <Mic className="w-3 h-3" />
                      <span className="hidden sm:inline">{hosts.length} host{hosts.length !== 1 ? 's' : ''}</span>
                      <span className="sm:hidden">{hosts.length}</span>
                    </span>
                  )}
                  {agendas.length > 0 && (
                    <span className="px-2 py-1 bg-[#AE9B66]/20 backdrop-blur-sm text-white rounded-full text-xs font-medium flex items-center gap-1 sm:gap-2">
                      <ListChecks className="w-3 h-3" />
                      <span className="hidden sm:inline">{agendas.length} agenda{agendas.length !== 1 ? 's' : ''}</span>
                      <span className="sm:hidden">{agendas.length}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-0">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] border border-[#9cc2ed]/50">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#03215F]" />
                <span className="text-xs sm:text-sm font-medium text-[#03215F]">Date</span>
              </div>
              <p className="text-sm sm:text-base md:text-lg font-bold text-[#03215F] truncate">
                {formatDateBH(event.start_datetime, { month: 'short', day: 'numeric' })}
              </p>
            </div>
            
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-[#AE9B66] to-[#AE9B66] border border-[#AE9B66]/50">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <span className="text-xs sm:text-sm font-medium text-white/90">Time</span>
              </div>
              <p className="text-sm sm:text-base md:text-lg font-bold text-white truncate">
                {formatTimeBH(event.start_datetime)}
                {event.end_datetime && (
                  <>
                    <span className="hidden sm:inline"> - {formatTimeBH(event.end_datetime)}</span>
                    <span className="sm:hidden">-{formatTimeBH(event.end_datetime)}</span>
                  </>
                )}
              </p>
            </div>
            
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-[#03215F] to-[#03215F] border border-[#03215F]/50">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <span className="text-xs sm:text-sm font-medium text-white/90">Capacity</span>
              </div>
              <p className="text-sm sm:text-base md:text-lg font-bold text-white truncate">
                {event.capacity || 'Unlimited'}
              </p>
            </div>
            
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-[#b8352d] to-[#b8352d] border border-[#b8352d]/50">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <span className="text-xs sm:text-sm font-medium text-white/90">Type</span>
              </div>
              <p className="text-sm sm:text-base md:text-lg font-bold text-white truncate">
                {event.is_paid ? 'Paid' : 'Free'}
              </p>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Date & Time Details */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#03215F]" />
                Date & Time Details
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Start Date & Time</p>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {formatDateBH(event.start_datetime)} at {formatTimeBH(event.start_datetime)}
                    </p>
                  </div>
                </div>
                
                {event.end_datetime && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">End Date & Time</p>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        {formatDateBH(event.end_datetime)} at {formatTimeBH(event.end_datetime)}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50">
                  <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Timezone</p>
                    <p className="text-gray-600 text-xs sm:text-sm">{event.timezone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue Details */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#03215F]" />
                Venue Details
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {event.venue_name && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50">
                    <Building className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">Venue Name</p>
                      <p className="text-gray-600 text-xs sm:text-sm">{event.venue_name}</p>
                    </div>
                  </div>
                )}
                
                {event.address && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50">
                    <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">Address</p>
                      <p className="text-gray-600 text-xs sm:text-sm">{event.address}</p>
                      {event.city && event.state && (
                        <p className="text-gray-600 text-xs sm:text-sm mt-1">
                          {event.city}, {event.state} {event.pin_code}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {event.google_map_url && (
                  <a
                    href={event.google_map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed] border border-[#9cc2ed]/50 hover:border-[#03215F] transition-colors group"
                  >
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#03215F]" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">Location on Map</p>
                      <p className="text-[#03215F] text-xs sm:text-sm truncate group-hover:underline">
                        View on Google Maps
                      </p>
                    </div>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-[#03215F] group-hover:text-[#03215F] flex-shrink-0" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Event Hosts Section */}
          {hosts.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('hosts')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50 hover:border-gray-300 transition-colors mb-3 sm:mb-4"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-[#03215F]" />
                  Event Hosts ({hosts.length})
                </h3>
                {expandedSections.hosts ? (
                  <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.hosts && (
                <div className="space-y-3 sm:space-y-4">
                  {hosts.map((host, index) => (
                    <div key={host.id || index} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-shrink-0">
                          {host.profile_image ? (
                            <img
                              src={host.profile_image}
                              alt={host.name}
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] border-2 border-gray-200 flex items-center justify-center">
                              <User className="w-6 h-6 sm:w-8 sm:h-8 text-[#03215F]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                                {host.name}
                                {host.is_primary && (
                                  <span className="ml-2 text-xs px-2 py-1 bg-[#9cc2ed] text-[#03215F] rounded-full">
                                    Primary Host
                                  </span>
                                )}
                              </h4>
                              {host.bio && (
                                <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                                  {host.bio}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:gap-3">
                            {host.email && (
                              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                                <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="truncate">{host.email}</span>
                              </div>
                            )}
                            {host.phone && (
                              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{host.phone}</span>
                              </div>
                            )}
                            <div className="text-xs sm:text-sm text-gray-500">
                              Order: {host.display_order || 1}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Event Agendas Section */}
          {agendas.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('agendas')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50 hover:border-gray-300 transition-colors mb-3 sm:mb-4"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 sm:w-5 sm:h-5 text-[#03215F]" />
                  Event Agenda ({agendas.length} items)
                </h3>
                {expandedSections.agendas ? (
                  <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.agendas && (
                <div className="space-y-3 sm:space-y-4">
                  {agendas.map((agenda, index) => (
                    <div key={agenda.id || index} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 bg-[#9cc2ed] text-[#03215F] rounded-full">
                              {formatAgendaDate(agenda.agenda_date)}
                            </span>
                            {(agenda.start_time || agenda.end_time) && (
                              <span className="text-xs px-2 py-1 bg-[#AE9B66] text-white rounded-full">
                                {agenda.start_time && formatTime(agenda.start_time)}
                                {agenda.end_time && ` - ${formatTime(agenda.end_time)}`}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">
                            {agenda.title}
                          </h4>
                          {agenda.description && (
                            <p className="text-xs sm:text-sm text-gray-600">
                              {agenda.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <button
                onClick={() => toggleSection('details')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50 hover:border-gray-300 transition-colors mb-3 sm:mb-4"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#03215F]" />
                  Event Description
                </h3>
                {expandedSections.details ? (
                  <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.details && (
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 text-sm sm:text-base whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment & Registration Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#03215F]" />
                Payment Information
              </h3>
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">Event Type</span>
                    <span className={`font-medium text-xs sm:text-sm ${event.is_paid ? 'text-[#AE9B66]' : 'text-[#03215F]'}`}>
                      {event.is_paid ? 'Paid Event' : 'Free Event'}
                    </span>
                  </div>
                  {event.is_paid && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-xs sm:text-sm">Regular Price</span>
                        <span className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1">
                          <BahrainFlag />
                          {formatBHD(event.regular_price || event.price)}
                        </span>
                      </div>
                      {event.member_price && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-xs sm:text-sm">Member Price</span>
                          <span className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1">
                            <BahrainFlag />
                            {formatBHD(event.member_price)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">Registration Status</span>
                    <span className="font-medium text-gray-900 text-xs sm:text-sm capitalize">
                      Open for Dentists
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div >
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#03215F]" />
                Registration Details
              </h3>
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">Maximum Capacity</span>
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">
                      {event.capacity || 'Unlimited'} Dentists
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">Event Duration</span>
                    <span className="font-medium text-gray-900 text-xs sm:text-sm">
                      {event.end_datetime 
                        ? `${Math.round((new Date(event.end_datetime) - new Date(event.start_datetime)) / (1000 * 60 * 60))} hours`
                        : 'To be determined'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">CME Credits</span>
                    <span className="font-medium text-[#AE9B66] text-xs sm:text-sm flex items-center gap-1">
                      <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                      Available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Created Info */}
          <div className="pb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#03215F]" />
              Event Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span className="text-xs sm:text-sm text-gray-600">Created On</span>
                </div>
                <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                  {formatDateBH(event.created_at)}
                </p>
              </div>
              
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span className="text-xs sm:text-sm text-gray-600">Event ID</span>
                </div>
                <p className="font-medium text-gray-900 text-xs font-mono truncate">
                  {event.id}
                </p>
              </div>
              
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <Bone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span className="text-xs sm:text-sm text-gray-600">Event Slug</span>
                </div>
                <p className="font-medium text-gray-900 text-xs truncate">
                  {event.slug}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions - Fixed */}
        <div className="flex-shrink-0 p-3 sm:p-6 border-t border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              <p className="truncate">BDS Event #{event.id.slice(0, 8)} • Last updated: {formatDateBH(event.updated_at, { month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onEdit}
                className="px-4 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 flex items-center gap-2 text-sm sm:text-base"
              >
                <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Edit Event</span>
                <span className="sm:hidden">Edit</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}