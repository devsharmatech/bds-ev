"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Trash2,
  CheckCircle,
  CheckCheck,
  AlertCircle,
  Calendar,
  Award,
  Users,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-BH", {
    month: "short",
    day: "numeric",
  });
};

const getNotificationIcon = (type) => {
  switch (type) {
    case "event":
      return <Calendar className="w-5 h-5" />;
    case "certificate":
      return <Award className="w-5 h-5" />;
    case "membership":
      return <Users className="w-5 h-5" />;
    case "payment":
      return <FileText className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

export default function NotificationsDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/dashboard/notifications", {
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch("/api/dashboard/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ notification_id: notificationId }),
      });

      const data = await response.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        toast.error(data.message || "Failed to mark as read");
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ mark_all_read: true }),
      });

      const data = await response.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      } else {
        toast.error(data.message || "Failed to mark all as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const response = await fetch(
        `/api/dashboard/notifications?id=${notificationId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        );
        // Update unread count if deleted notification was unread
        const deleted = notifications.find((n) => n.id === notificationId);
        if (deleted && !deleted.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        toast.success("Notification deleted");
      } else {
        toast.error(data.message || "Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all notifications? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/dashboard/notifications?delete_all=true`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.success) {
        setNotifications([]);
        setUnreadCount(0);
        toast.success("All notifications deleted");
      } else {
        toast.error(data.message || "Failed to delete all notifications");
      }
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error("Failed to delete all notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate if action_url is provided
    if (notification.action_url) {
      // Close dropdown first
      setIsOpen(false);
      
      // Use Next.js router for client-side navigation
      const url = notification.action_url.startsWith('http')
        ? notification.action_url
        : notification.action_url;
      
      // If it's a relative URL, use router.push
      if (!url.startsWith('http')) {
        router.push(url);
      } else {
        window.location.href = url;
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 md:w-6 md:h-6 text-[#03215F]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-[#b8352d] text-white rounded-full text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed md:absolute right-2 md:right-0 top-16 md:top-full mt-0 md:mt-2 w-[calc(100vw-1rem)] md:w-80 lg:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[calc(100vh-5rem)] md:max-h-[80vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#03215F] to-[#03215F]">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-white/20 text-white rounded-full text-xs font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Actions Bar */}
              {notifications.length > 0 && (
                <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={loading || unreadCount === 0}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#03215F] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#b8352d] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete all
                  </button>
                </div>
              )}

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.is_read ? "bg-[#03215F]/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 ${
                              !notification.is_read
                                ? "bg-gradient-to-br from-[#03215F] to-[#AE9B66]"
                                : "bg-gray-100"
                            }`}
                          >
                            <div
                              className={`${
                                !notification.is_read
                                  ? "text-white"
                                  : "text-gray-600"
                              }`}
                            >
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4
                                className={`font-semibold text-sm ${
                                  !notification.is_read
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.title}
                              </h4>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-[#03215F] rounded-full flex-shrink-0 mt-1.5"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(notification.created_at)}</span>
                              </div>
                              {notification.action_url && (
                                <ExternalLink className="w-3 h-3 text-[#03215F]" />
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            {!notification.is_read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Mark as read"
                              >
                                <CheckCircle className="w-4 h-4 text-[#AE9B66]" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-[#b8352d]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

