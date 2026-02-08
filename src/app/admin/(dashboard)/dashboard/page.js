"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  CalendarDays,
  Ticket,
  BarChart3,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  Gift,
  DollarSign,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Simple stat card used for main overview metrics
const StatCard = ({ title, value, icon: Icon, color = "blue", isLoading, onClick }) => {
  const colorClasses = {
    blue: "bg-white border-gray-200",
    green: "bg-white border-gray-200",
    orange: "bg-white border-gray-200",
    indigo: "bg-white border-gray-200",
  };

  const gradientColors = {
    blue: "from-[#03215F] to-[#03215F]",
    green: "from-[#AE9B66] to-[#AE9B66]",
    orange: "from-[#b8352d] to-[#b8352d]",
    indigo: "from-[#03215F] to-[#03215F]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: onClick ? -6 : -3, scale: onClick ? 1.03 : 1.01 }}
      onClick={onClick}
      className={`relative group ${onClick ? "cursor-pointer" : ""}`}
    >
      <div
        className={`relative h-full rounded-2xl p-5 shadow-lg border ${colorClasses[color]} overflow-hidden flex flex-col justify-between`}
      >
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
            {isLoading ? (
              <div className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
            ) : (
              <p className="text-base font-semibold text-gray-900 break-words">
                {typeof value === "number" ? value.toLocaleString() : value ?? 0}
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl bg-gradient-to-r ${gradientColors[color]} text-white`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Compact event card for today / highlight events
const EventCard = ({ event, type = "today" }) => {
  if (!event) return null;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-BH", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Bahrain",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-BH", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Bahrain",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className="p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 border border-gray-200/60 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`p-1.5 rounded-lg ${
                type === "today"
                  ? "bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white"
                  : "bg-gradient-to-r from-[#9cc2ed] to-[#03215F] text-white"
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 truncate">{event.title}</h4>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            {event.start_datetime && (
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>{formatTime(event.start_datetime)}</span>
                {event.end_datetime && (
                  <>
                    <span>-</span>
                    <span>{formatTime(event.end_datetime)}</span>
                  </>
                )}
              </div>
            )}
            {event.start_datetime && type === "upcoming" && (
              <div className="flex items-center gap-2">
                <CalendarDays className="w-3 h-3" />
                <span>{formatDate(event.start_datetime)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [todayEvents, setTodayEvents] = useState([]);
  const [highlightOngoing, setHighlightOngoing] = useState(null);
  const [highlightUpcoming, setHighlightUpcoming] = useState(null);
  const [eventFilterOptions, setEventFilterOptions] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [eventAnalytics, setEventAnalytics] = useState(null);
  const [eventAnalyticsLoading, setEventAnalyticsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch dashboard data");
      }

      setStats(data.stats || {});
      setTodayEvents(data.today_events || []);
      setHighlightOngoing(data.highlight_ongoing_event || null);
      setHighlightUpcoming(data.highlight_upcoming_event || null);
      setEventFilterOptions(data.event_filter_options || []);

      setLastUpdated(
        new Date().toLocaleTimeString("en-BH", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Bahrain",
        })
      );
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEventAnalytics = async (eventId) => {
    setEventAnalyticsLoading(true);
    try {
      const query = eventId ? `?event_id=${eventId}` : "";
      const res = await fetch(`/api/admin/dashboard/event-stats${query}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Failed to load event analytics", data);
        return;
      }

      setEventAnalytics(data);
      if (!eventId && data.event?.id) {
        setSelectedEventId(data.event.id);
      }
    } catch (err) {
      console.error("Event analytics fetch error:", err);
    } finally {
      setEventAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Initial analytics: let API choose latest upcoming/default event
    loadEventAnalytics();
  }, []);

  const todayPaidJoins = stats?.today_paid_joins || 0;
  const todayRegistrations = stats?.today_registrations || 0;
  const todayEventJoins = stats?.today_event_joins || 0;

   const totalEvents = stats?.total_events || 0;
   const completedEvents = stats?.completed_events || 0;
   const upcomingEvents = stats?.upcoming_events || 0;
   const totalCoupons = stats?.total_coupons || 0;
   const couponUsedMembers = stats?.coupon_used_members || 0;

   const totalEventRevenue = stats?.total_event_revenue || 0;
   const totalSubscriptionRevenue = stats?.total_subscription_revenue || 0;

   const formatBHD = (amount) => {
     const value = Number(amount || 0);
     return `BHD ${value.toLocaleString("en-BH", {
       minimumFractionDigits: 3,
       maximumFractionDigits: 3,
     })}`;
   };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative mx-auto w-28 h-28">
            <div className="absolute inset-0 border-4 border-[#03215F]/20 rounded-full animate-pulse" />
            <div className="absolute inset-4 border-4 border-t-[#03215F] border-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
              Loading Admin Dashboard
            </p>
            <p className="text-gray-500 text-sm">Fetching event and member data...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#9cc2ed]/30 ">
      <div className="mx-auto space-y-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#03215F] to-[#03215F] shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-[#ECCF0F]" />
                  Clean overview of members and events
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 shadow-sm">
              <div className="w-2 h-2 bg-[#AE9B66] rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">{lastUpdated ? "Live" : "Offline"}</span>
              {lastUpdated && (
                <span className="text-xs text-gray-500 ml-2">Updated: {lastUpdated}</span>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={fetchDashboardData}
              disabled={loading}
              className="px-4 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl flex items-center gap-2 text-sm font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </motion.button>
          </div>
        </motion.div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SECTION 1: KEY STATS */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#03215F]" />
            Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <StatCard
              title="Total Records"
              value={stats?.total_members}
              icon={Users}
              color="blue"
              isLoading={loading}
              onClick={() => router.push("/admin/members")}
            />
            <StatCard
              title="Paid Members"
              value={stats?.paid_members}
              icon={UserCheck}
              color="green"
              isLoading={loading}
              onClick={() => router.push("/admin/members")}
            />
            <StatCard
              title="Free Members"
              value={stats?.free_members}
              icon={UserX}
              color="orange"
              isLoading={loading}
              onClick={() => router.push("/admin/members")}
            />
            <StatCard
              title="Today’s Registrations"
              value={todayRegistrations}
              icon={CalendarDays}
              color="indigo"
              isLoading={loading}
              onClick={() => router.push("/admin/members")}
            />
            <StatCard
              title="Today’s Event Joins"
              value={todayEventJoins}
              icon={Ticket}
              color="green"
              isLoading={loading}
              onClick={() => router.push("/admin/events")}
            />
            <StatCard
              title="Total Event Joins"
              value={stats?.event_members}
              icon={Ticket}
              color="blue"
              isLoading={loading}
              onClick={() => router.push("/admin/events")}
            />
            <StatCard
              title="Total Events"
              value={totalEvents}
              icon={Calendar}
              color="indigo"
              isLoading={loading}
              onClick={() => router.push("/admin/events")}
            />
            <StatCard
              title="Completed Events"
              value={completedEvents}
              icon={Calendar}
              color="green"
              isLoading={loading}
              onClick={() => router.push("/admin/events")}
            />
            <StatCard
              title="Upcoming Events"
              value={upcomingEvents}
              icon={CalendarDays}
              color="orange"
              isLoading={loading}
              onClick={() => router.push("/admin/events")}
            />
            <StatCard
              title="Total Coupons"
              value={totalCoupons}
              icon={Gift}
              color="blue"
              isLoading={loading}
              onClick={() => router.push("/admin/event-coupons")}
            />
            <StatCard
              title="Members Used Coupons"
              value={couponUsedMembers}
              icon={Users}
              color="indigo"
              isLoading={loading}
              onClick={() => router.push("/admin/event-coupons")}
            />
            <StatCard
              title="Event Earnings (Total)"
              value={formatBHD(totalEventRevenue)}
              icon={DollarSign}
              color="green"
              isLoading={loading}
              onClick={() => router.push("/admin/payment-history?category=event")}
            />
            <StatCard
              title="Membership Earnings (Total)"
              value={formatBHD(totalSubscriptionRevenue)}
              icon={DollarSign}
              color="orange"
              isLoading={loading}
              onClick={() => router.push("/admin/payment-history?category=membership")}
            />
          </div>
        </div>

        {/* SECTION 2: TODAY & HIGHLIGHT EVENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Events list + highlights */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Today&apos;s Events</h3>
                    <p className="text-gray-500 text-sm">
                      {(stats?.today_events_count || todayEvents.length || 0) + " events scheduled"}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString([], {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              <div className="space-y-4">
                {todayEvents.length > 0 ? (
                  todayEvents.map((event) => <EventCard key={event.id} event={event} type="today" />)
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No events scheduled for today</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200/60">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed]">
                    <p className="text-2xl font-bold text-[#03215F]">
                      {stats?.today_unique_checkins ?? 0}
                    </p>
                    <p className="text-sm text-[#03215F]/80">Unique Check-ins Today</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-[#AE9B66] to-[#AE9B66]">
                    <p className="text-2xl font-bold text-white">{todayPaidJoins}</p>
                    <p className="text-sm text-white/90">Today&apos;s Paid Joins</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-[#03215F] to-[#03215F]">
                    <p className="text-2xl font-bold text-white">{todayRegistrations}</p>
                    <p className="text-sm text-white/90">Today&aposs New Members</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Highlight ongoing / upcoming */}
          <div>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200/60 p-6 h-full flex flex-col">
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#03215F]" />
                    Ongoing Event
                  </h3>
                  {highlightOngoing ? (
                    <div className="space-y-2">
                      <EventCard event={highlightOngoing} type="today" />
                      <div className="grid grid-cols-2 gap-3 text-xs mt-2">
                        <div className="p-3 rounded-xl bg-white border border-gray-200">
                          <p className="text-xs text-gray-500">Today&apos;s Joins</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {highlightOngoing.today_joins ?? 0}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-gray-200">
                          <p className="text-xs text-gray-500">Total Joins</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {highlightOngoing.total_joins ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No ongoing event right now.</p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200/60">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#03215F]" />
                    Upcoming Event
                  </h3>
                  {highlightUpcoming ? (
                    <div className="space-y-2">
                      <EventCard event={highlightUpcoming} type="upcoming" />
                      <div className="grid grid-cols-2 gap-3 text-xs mt-2">
                        <div className="p-3 rounded-xl bg-white border border-gray-200">
                          <p className="text-xs text-gray-500">Today&apos;s Joins</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {highlightUpcoming.today_joins ?? 0}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-gray-200">
                          <p className="text-xs text-gray-500">Total Joins</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {highlightUpcoming.total_joins ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No upcoming event scheduled.</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/admin/events"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-100 to-white text-gray-700 hover:text-gray-900 transition-colors duration-200 flex items-center justify-center gap-2 border border-gray-200/50"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">View All Events</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: EVENT ANALYTICS */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200/60 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#03215F] to-[#03215F] text-white">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Event Join Analytics</h3>
                <p className="text-gray-500 text-sm">Filter by event and see join trend</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Event</span>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedEventId(id);
                  if (id) loadEventAnalytics(id);
                }}
                className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm min-w-[220px]"
              >
                {eventFilterOptions.length === 0 && <option value="">No events available</option>}
                {eventFilterOptions.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {eventAnalyticsLoading || !eventAnalytics ? (
            <div className="h-72 flex items-center justify-center text-gray-500 text-sm">
              {eventAnalyticsLoading ? "Loading event analytics..." : "Select an event to see analytics."}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={eventAnalytics.trend || []}>
                    <defs>
                      <linearGradient id="evJoins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#03215F" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#03215F" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        padding: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="joins"
                      stroke="#03215F"
                      strokeWidth={2}
                      fill="url(#evJoins)"
                      name="Joins"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Event</p>
                  <p className="text-sm font-semibold text-gray-900">{eventAnalytics.event?.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {eventAnalytics.event?.start_datetime &&
                      new Date(eventAnalytics.event.start_datetime).toLocaleString("en-BH", {
                        timeZone: "Asia/Bahrain",
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] text-[#03215F]">
                    <p className="text-xs text-[#03215F]/80">Total Joins</p>
                    <p className="text-2xl font-bold mt-1">{eventAnalytics.stats?.total_joins ?? 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#AE9B66] to-[#AE9B66] text-white">
                    <p className="text-xs text-white/80">Today&apos;s Joins</p>
                    <p className="text-2xl font-bold mt-1">{eventAnalytics.stats?.today_joins ?? 0}</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/admin/events/${eventAnalytics.event?.id}/members`)}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#03215F] to-[#03215F] text-white text-sm font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  View Event Members
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
