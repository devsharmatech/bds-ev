"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  MessageSquare,
  Save,
  Loader2,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function FeedbackModal({
  isOpen,
  onClose,
  eventMemberId,
  eventId,
  attendanceLogId,
  existingFeedback,
  onSuccess,
}) {
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [feedbackText, setFeedbackText] = useState(existingFeedback?.feedback_text || "");
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    if (existingFeedback) {
      setRating(existingFeedback.rating || 0);
      setFeedbackText(existingFeedback.feedback_text || "");
    } else {
      setRating(0);
      setFeedbackText("");
    }
  }, [existingFeedback, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feedbackText.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setLoading(true);
    try {
      const url = existingFeedback
        ? "/api/dashboard/feedback"
        : "/api/dashboard/feedback";
      const method = existingFeedback ? "PUT" : "POST";

      const body = existingFeedback
        ? {
            feedback_id: existingFeedback.id,
            rating: rating || null,
            feedback_text: feedbackText.trim(),
          }
        : {
            event_member_id: eventMemberId,
            event_id: eventId,
            attendance_log_id: attendanceLogId || null,
            rating: rating || null,
            feedback_text: feedbackText.trim(),
            feedback_date: new Date().toISOString().split("T")[0],
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          existingFeedback
            ? "Feedback updated successfully"
            : "Feedback submitted successfully"
        );
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingFeedback) return;

    if (
      !confirm(
        "Are you sure you want to delete this feedback? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/dashboard/feedback?id=${existingFeedback.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Feedback deleted successfully");
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to delete feedback");
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Failed to delete feedback");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#03215F] to-[#03215F]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {existingFeedback ? "Edit Feedback" : "Submit Feedback"}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {existingFeedback
                    ? "Update your feedback for this event"
                    : "Share your experience and help us improve"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Rating (Optional)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || rating)
                          ? "text-[#ECCF0F] fill-[#ECCF0F]"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-sm font-medium text-gray-600">
                    {rating} out of 5
                  </span>
                )}
              </div>
            </div>

            {/* Feedback Text */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Feedback <span className="text-[#b8352d]">*</span>
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts about the event, what you liked, what could be improved, or any suggestions..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                {feedbackText.length} characters
              </p>
            </div>

            {/* Date Info */}
            {existingFeedback && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Feedback date:{" "}
                    {new Date(existingFeedback.feedback_date).toLocaleDateString(
                      "en-BH",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            {existingFeedback && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-[#b8352d] text-white rounded-lg font-medium hover:bg-[#b8352d]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || !feedbackText.trim()}
                className="px-6 py-2 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {existingFeedback ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {existingFeedback ? "Update Feedback" : "Submit Feedback"}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

