"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import {
  X,
  QrCode,
  Copy,
  Download,
  Share2,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function EventQRModal({ isOpen, onClose, event }) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  if (!event) return null;

  // Generate the event URL
  const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://bds.org.bh'}/events/${event.slug || event.id}`;

  // Copy URL to clipboard
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      toast.success("Event link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  // Download QR code as image
  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = `${event.title}-qr-code.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("QR code downloaded!");
    }
  };

  // Share via Web Share API (if supported)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
          url: eventUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      // Fallback to copy URL
      handleCopyUrl();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200/50 w-full max-w-md mx-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] p-4 sm:p-6 text-white flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-start gap-3 sm:gap-4 pr-12">
                <div className="p-2 sm:p-3 bg-white/20 rounded-xl flex-shrink-0">
                  <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold mb-1">Share Event</h2>
                  <p className="text-white/80 text-sm">
                    Share this QR code with friends
                  </p>
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Event Info */}
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {formatDate(event.start_datetime)}
                </p>
                {event.venue_name && (
                  <p className="text-gray-500 text-sm truncate px-2">
                    {event.venue_name}
                  </p>
                )}
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div 
                  ref={qrRef}
                  className="p-3 sm:p-4 bg-white rounded-xl shadow-lg border border-gray-200/50"
                >
                  <QRCodeCanvas
                    value={eventUrl}
                    size={180}
                    level="M"
                    includeMargin={true}
                    fgColor="#03215F"
                    bgColor="#ffffff"
                    className="w-full h-auto max-w-[180px]"
                  />
                </div>
              </div>

              {/* URL Display */}
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200/50">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span>Event Link</span>
                </div>
                <div className="text-xs text-gray-500 font-mono break-all leading-relaxed">
                  {eventUrl}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  onClick={handleCopyUrl}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] text-[#03215F] rounded-xl hover:opacity-90 transition-all"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  <span className="text-xs font-medium leading-tight text-center">
                    {copied ? "Copied!" : "Copy Link"}
                  </span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-gradient-to-br from-[#AE9B66] to-[#AE9B66] text-white rounded-xl hover:opacity-90 transition-all"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs font-medium leading-tight text-center">Download</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-gradient-to-br from-[#ECCF0F] to-[#ECCF0F] text-[#03215F] rounded-xl hover:opacity-90 transition-all"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs font-medium leading-tight text-center">Share</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}