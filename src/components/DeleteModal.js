"use client";

import { motion } from "framer-motion";
import { 
  X, 
  AlertTriangle, 
  Trash2, 
  Loader2,
  Calendar,
  MapPin,
  Users,
  Clock
} from "lucide-react";

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
const formatDateBH = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-BH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Bahrain'
  });
};

export default function DeleteModal({ event, onClose, onConfirm, loading }) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-[#03215F]/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#b8352d] to-[#b8352d] text-white">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#03215F]">
                Delete Event
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Confirm deletion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-[#03215F] transition-colors hover:scale-110 active:scale-95 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6">
          {/* Event Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-[#b8352d] to-[#b8352d] border border-[#b8352d]/50">
              <AlertTriangle className="w-5 h-5 text-white mt-0.5" />
              <div>
                <p className="text-white font-medium">
                  Warning: This action cannot be undone
                </p>
                <p className="text-white/90 text-sm mt-1">
                  All event data, registrations, and attendance records will be permanently deleted.
                </p>
              </div>
            </div>

            {/* Event Info Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200/50">
              <div className="flex items-start gap-3">
                {event.banner_url ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={event.banner_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] border border-[#9cc2ed]/50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-[#03215F]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#03215F] mb-1">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDateBH(event.start_datetime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(event.start_datetime).toLocaleTimeString('en-BH', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Asia/Bahrain'
                        })}
                      </span>
                    </div>
                    {event.venue_name && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.venue_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-200/50">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#03215F]">
                    {event.is_paid ? formatBHD(event.price) : 'Free'}
                  </div>
                  <div className="text-xs text-gray-500">Price</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#03215F]">
                    {event.capacity || '∞'}
                  </div>
                  <div className="text-xs text-gray-500">Capacity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#03215F] capitalize">
                    {event.status}
                  </div>
                  <div className="text-xs text-gray-500">Status</div>
                </div>
              </div>
            </div>

            {/* Deletion Impact */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#b8352d] to-[#b8352d] border border-[#b8352d]/50">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-white" />
                Deletion Impact
              </h4>
              <ul className="space-y-1 text-sm text-white">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  Event will be removed from all listings
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  All dentist registrations will be cancelled
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  Attendance records will be permanently deleted
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  Event banner image will be removed from storage
                </li>
              </ul>
            </div>
          </div>

          {/* Confirmation Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-[#b8352d] to-[#b8352d] text-white rounded-xl font-medium hover:from-[#b8352d] hover:to-[#b8352d] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Event
                </>
              )}
            </button>
          </div>

          {/* Warning Note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              This action is irreversible. Please ensure you have backed up any important data.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}