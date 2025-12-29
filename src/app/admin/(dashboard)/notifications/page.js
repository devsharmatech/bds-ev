"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Send,
  Users,
  UserCheck,
  UserX,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  FileText,
  Clock,
  Target,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    withToken: 0,
    free: 0,
    paid: 0,
  });

  const [form, setForm] = useState({
    title: "",
    body: "",
    target: "all", // all, free, paid, membership_type, event
    membership_type: "",
    event_id: "",
    click_action: "",
  });

  useEffect(() => {
    fetchStats();
    fetchEvents();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/notifications/stats", {
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/events?limit=100", {
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.body) {
      toast.error("Please fill in title and message");
      return;
    }

    if (form.target === "membership_type" && !form.membership_type) {
      toast.error("Please select membership type");
      return;
    }

    if (form.target === "event" && !form.event_id) {
      toast.error("Please select an event");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          target: form.target,
          membership_type: form.membership_type || null,
          event_id: form.event_id || null,
          data: {
            click_action: form.click_action || "",
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Notifications sent! ${data.sent} successful, ${data.failed} failed`
        );
        setForm({
          title: "",
          body: "",
          target: "all",
          membership_type: "",
          event_id: "",
          click_action: "",
        });
        fetchStats();
      } else {
        toast.error(data.message || "Failed to send notifications");
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
      toast.error("Failed to send notifications");
    } finally {
      setSending(false);
    }
  };

  const sendEventNotification = async (eventId, type) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    let title, body;
    if (type === "start") {
      title = `Event Starting: ${event.title}`;
      body = `The event "${event.title}" is starting now! Don't miss it.`;
    } else {
      title = `Event Ended: ${event.title}`;
      body = `Thank you for attending "${event.title}". We hope you enjoyed it!`;
    }

    setSending(true);
    try {
      const response = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          body,
          target: "event",
          event_id: eventId,
          data: {
            click_action: `/events/${event.slug || event.id}`,
            type: type === "start" ? "event_start" : "event_end",
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `${type === "start" ? "Start" : "End"} notification sent to ${data.sent} members`
        );
      } else {
        toast.error(data.message || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending event notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <Toaster position="top-right" />

      <div className="w-full mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#03215F] to-[#AE9B66] rounded-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                Push Notifications
              </h1>
              <p className="text-gray-600 mt-1">
                Send push notifications to members
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#9cc2ed] rounded-lg">
                <Users className="w-5 h-5 text-[#03215F]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-[#03215F]">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#AE9B66] rounded-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">With Token</p>
                <p className="text-2xl font-bold text-[#AE9B66]">
                  {stats.withToken}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ECCF0F] rounded-lg">
                <UserX className="w-5 h-5 text-[#03215F]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Free Members</p>
                <p className="text-2xl font-bold text-[#03215F]">
                  {stats.free}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#03215F] rounded-lg">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paid Members</p>
                <p className="text-2xl font-bold text-[#03215F]">
                  {stats.paid}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Send Notification Form */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-[#03215F] mb-6">
            Send Notification
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Notification title"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Notification message"
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience *
              </label>
              <select
                value={form.target}
                onChange={(e) =>
                  setForm({ ...form, target: e.target.value, event_id: "", membership_type: "" })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                required
              >
                <option value="all">All Members</option>
                <option value="free">Free Members Only</option>
                <option value="paid">Paid Members Only</option>
                <option value="membership_type">By Membership Type</option>
                <option value="event">Event Attendees</option>
              </select>
            </div>

            {form.target === "membership_type" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Membership Type *
                </label>
                <select
                  value={form.membership_type}
                  onChange={(e) =>
                    setForm({ ...form, membership_type: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select type</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            )}

            {form.target === "event" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Event *
                </label>
                <select
                  value={form.event_id}
                  onChange={(e) =>
                    setForm({ ...form, event_id: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {new Date(event.start_datetime).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Click Action URL (Optional)
              </label>
              <input
                type="text"
                value={form.click_action}
                onChange={(e) =>
                  setForm({ ...form, click_action: e.target.value })
                }
                placeholder="/events/event-slug or full URL"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Event Notifications */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-[#03215F] mb-6">
            Event Notifications
          </h2>

          <div className="space-y-4">
            {events.slice(0, 10).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(event.start_datetime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(event.start_datetime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => sendEventNotification(event.id, "start")}
                    disabled={sending}
                    className="px-4 py-2 bg-[#AE9B66] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 text-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Send Start
                  </button>
                  <button
                    onClick={() => sendEventNotification(event.id, "end")}
                    disabled={sending}
                    className="px-4 py-2 bg-[#03215F] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 text-sm flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Send End
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

