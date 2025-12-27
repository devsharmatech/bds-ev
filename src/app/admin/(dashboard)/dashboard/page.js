"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  MapPin,
  Clock as ClockIcon,
  CalendarDays,
  Ticket,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";

// ------------------------------
// Small Components
// ------------------------------
const StatCard = ({ title, value, icon: Icon, color, isLoading, change, trendDirection = "up" }) => {
  const colorClasses = {
    blue: "bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] border-[#9cc2ed]",
    green: "bg-gradient-to-br from-[#AE9B66] to-[#AE9B66] border-[#AE9B66]",
    orange: "bg-gradient-to-br from-[#b8352d] to-[#b8352d] border-[#b8352d]",
    red: "bg-gradient-to-br from-[#b8352d] to-[#b8352d] border-[#b8352d]",
    indigo: "bg-gradient-to-br from-[#03215F] to-[#03215F] border-[#03215F]",
  };

  const iconColors = {
    blue: "text-[#03215F]",
    green: "text-white",
    orange: "text-white",
    red: "text-white",
    indigo: "text-white",
  };

  const gradientColors = {
    blue: "from-[#03215F] to-[#03215F]",
    green: "from-[#AE9B66] to-[#AE9B66]",
    orange: "from-[#b8352d] to-[#b8352d]",
    red: "from-[#b8352d] to-[#b8352d]",
    indigo: "from-[#03215F] to-[#03215F]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative group"
    >
      <div className={`relative rounded-2xl p-6 shadow-lg border ${colorClasses[color]} overflow-hidden`}>
        <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[color]} rounded-full`} />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className={`text-sm font-medium mb-2 ${
                color === 'indigo' || color === 'red' || color === 'orange' 
                  ? 'text-white/90' 
                  : 'text-gray-600'
              }`}>
                {title}
              </p>
              {isLoading ? (
                <div className="h-8 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
              ) : (
                <p className={`text-2xl font-bold ${
                  color === 'indigo' || color === 'red' || color === 'orange' 
                    ? 'text-white' 
                    : 'text-gray-900'
                }`}>
                  {typeof value === 'number' ? value.toLocaleString() : value ?? 0}
                </p>
              )}
            </div>

            <div className={`p-2.5 rounded-xl bg-white/50 backdrop-blur-sm border ${iconColors[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>

          {change && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200/50">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                trendDirection === "up" 
                  ? "bg-[#AE9B66] text-white" 
                  : "bg-[#b8352d] text-white"
              }`}>
                {trendDirection === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="font-semibold">{change}</span>
              </div>
              <span className={`text-xs ${
                color === 'indigo' || color === 'red' || color === 'orange' 
                  ? 'text-white/80' 
                  : 'text-gray-500'
              }`}>
                from last month
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const EventCard = ({ event, type = "today" }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className="p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 border border-gray-200/50 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${
              type === "today" 
                ? "bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white"
                : "bg-gradient-to-r from-[#9cc2ed] to-[#03215F] text-white"
            }`}>
              <Calendar className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {event.title}
            </h4>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-gray-600">
              <ClockIcon className="w-3 h-3" />
              <span>{formatTime(event.start_datetime)}</span>
              {event.end_datetime && (
                <>
                  <span>-</span>
                  <span>{formatTime(event.end_datetime)}</span>
                </>
              )}
            </div>
            
            {event.venue_name && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{event.venue_name}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                <Ticket className="w-3 h-3 text-gray-400" />
                <span className="text-gray-500 text-xs">
                  {event.capacity ? `${event.capacity} capacity` : 'Unlimited'}
                </span>
              </div>
              {type === "upcoming" && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed] text-[#03215F]">
                  {formatDate(event.start_datetime)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ------------------------------
// MAIN DASHBOARD PAGE
// ------------------------------
export default function Page() {
  const [stats, setStats] = useState(null);
  const [memberRegistrationData, setMemberRegistrationData] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch dashboard data");
      }

      if (data.success) {
        setStats(data.stats);
        setMemberRegistrationData(data.charts?.member_registration || generateDemoRegistrationData());
        setUpcomingEvents(data.upcoming_events || generateDemoUpcomingEvents());
        setTodayEvents(data.today_events || generateDemoTodayEvents());
        setLastUpdated(new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit'
        }));
      } else {
        throw new Error("Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message);
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  // Demo data generators
  const generateDemoRegistrationData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month) => ({
      month: `${month} 2025`,
      total: Math.floor(Math.random() * 100) + 50,
      active: Math.floor(Math.random() * 80) + 40,
      inactive: Math.floor(Math.random() * 20) + 5,
    }));
  };

  const generateDemoUpcomingEvents = () => [
    {
      id: '1',
      title: 'Annual Business Conference',
      start_datetime: new Date(Date.now() + 86400000).toISOString(),
      end_datetime: new Date(Date.now() + 86400000 * 2).toISOString(),
      venue_name: 'Grand Hotel Convention Center',
      capacity: 500,
    },
    {
      id: '2',
      title: 'Tech Innovation Workshop',
      start_datetime: new Date(Date.now() + 86400000 * 3).toISOString(),
      end_datetime: new Date(Date.now() + 86400000 * 4).toISOString(),
      venue_name: 'Tech Hub Downtown',
      capacity: 200,
    },
    {
      id: '3',
      title: 'Leadership Summit',
      start_datetime: new Date(Date.now() + 86400000 * 5).toISOString(),
      venue_name: 'Executive Business Center',
      capacity: 150,
    },
  ];

  const generateDemoTodayEvents = () => [
    {
      id: '1',
      title: 'Morning Networking Session',
      start_datetime: new Date().toISOString(),
      end_datetime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      venue_name: 'Main Conference Hall',
      capacity: 300,
    },
    {
      id: '2',
      title: 'Member Onboarding Workshop',
      start_datetime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      venue_name: 'Training Room A',
      capacity: 50,
    },
  ];

  const setFallbackData = () => {
    const demoStats = {
      upcoming_events: 12,
      ongoing_events: 5,
      completed_events: 28,
      cancelled_events: 2,
      total_events: 47,
      today_events_count: 2,
      today_attendance: 350,
      active_members: 1250,
      inactive_members: 150,
      blocked_members: 25,
      total_members: 1425,
      event_members: 3250,
      checked_in_members: 2850,
      conversion_rate: 87.7,
    };
    
    setStats(demoStats);
    setMemberRegistrationData(generateDemoRegistrationData());
    setUpcomingEvents(generateDemoUpcomingEvents());
    setTodayEvents(generateDemoTodayEvents());
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Loading UI
  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 border-4 border-[#03215F]/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 border-4 border-t-[#03215F] border-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-3">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent"
            >
              Loading Event Dashboard
            </motion.p>
            <p className="text-gray-500 text-sm">
              Fetching event and member data...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#9cc2ed]/30 p-4 md:p-6">
      <div className="mx-auto space-y-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
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
                  Event Dashboard
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ECCF0F]" />
                  Real-time event and member analytics
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 shadow-sm">
              <div className="w-2 h-2 bg-[#AE9B66] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                {lastUpdated ? 'Live' : 'Offline'}
              </span>
              {lastUpdated && (
                <span className="text-xs text-gray-500 ml-2">
                  Updated: {lastUpdated}
                </span>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchDashboardData}
              disabled={loading}
              className="px-4 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl flex items-center gap-2 text-sm font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </motion.button>
          </div>
        </motion.div>

        {/* ERROR MESSAGE */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-gradient-to-r from-[#b8352d] to-[#b8352d] border border-[#b8352d] rounded-xl flex items-start gap-4 shadow-lg"
          >
            <div className="p-2 bg-[#b8352d] rounded-lg">
              <AlertCircle className="w-6 h-6 text-[#b8352d]" />
            </div>
            <div className="flex-1">
              <p className="text-[#b8352d] font-semibold">API Connection Issue</p>
              <p className="text-[#b8352d] text-sm mt-1">{error}</p>
              <p className="text-[#b8352d] text-sm mt-3">
                Showing demo data. Try refreshing the page.
              </p>
            </div>
          </motion.div>
        )}

        {/* SECTION 1: EVENT STATUS COUNTS */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#03215F]" />
            Event Status Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Upcoming Events"
              value={stats?.upcoming_events}
              icon={Calendar}
              color="blue"
              isLoading={loading}
              change="+3"
              trendDirection="up"
            />
            <StatCard
              title="Ongoing Events"
              value={stats?.ongoing_events}
              icon={Clock}
              color="orange"
              isLoading={loading}
              change="+1"
              trendDirection="up"
            />
            <StatCard
              title="Completed Events"
              value={stats?.completed_events}
              icon={CheckCircle}
              color="green"
              isLoading={loading}
              change="+8"
              trendDirection="up"
            />
            <StatCard
              title="Cancelled Events"
              value={stats?.cancelled_events}
              icon={AlertCircle}
              color="red"
              isLoading={loading}
              change="-1"
              trendDirection="down"
            />
          </div>
        </div>

        {/* SECTION 2: TODAY'S EVENTS & ATTENDANCE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Events */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Today's Events
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {stats?.today_events_count || 0} events scheduled
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString([], { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              
              <div className="space-y-4">
                {todayEvents.length > 0 ? (
                  todayEvents.map((event, index) => (
                    <EventCard key={event.id} event={event} type="today" />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No events scheduled for today</p>
                  </div>
                )}
              </div>
              
              {/* Today's Attendance Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed]">
                    <p className="text-2xl font-bold text-[#03215F]">
                      {stats?.today_attendance || 0}
                    </p>
                    <p className="text-sm text-[#03215F]/80">Today's Attendance</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-[#AE9B66] to-[#AE9B66]">
                    <p className="text-2xl font-bold text-white">
                      {stats?.conversion_rate || 0}%
                    </p>
                    <p className="text-sm text-white/90">Check-in Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200/50 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#9cc2ed] to-[#03215F] text-white">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Upcoming Events
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Next 7 days
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium text-[#03215F]">
                  {stats?.upcoming_events || 0} total
                </div>
              </div>
              
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, index) => (
                    <EventCard key={event.id} event={event} type="upcoming" />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No upcoming events</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-100 to-white text-gray-700 hover:text-gray-900 transition-colors duration-200 flex items-center justify-center gap-2 border border-gray-200/50">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">View All Events</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: MEMBER REGISTRATION CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-[#03215F] to-[#03215F] text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Member Registration Trend
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Last 6 months
                  </p>
                </div>
              </div>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memberRegistrationData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#03215F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#03215F" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#AE9B66" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#AE9B66" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '12px'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#03215F"
                    strokeWidth={2}
                    fill="url(#colorTotal)"
                    name="Total Members"
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stroke="#AE9B66"
                    strokeWidth={2}
                    fill="url(#colorActive)"
                    name="Active Members"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MEMBER STATUS COUNTS */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-[#03215F] to-[#03215F] text-white">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Member Status
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Membership distribution
                  </p>
                </div>
              </div>
              <div className="text-sm font-medium text-[#03215F]">
                {stats?.total_members || 0} total
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Active Members */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] border border-[#AE9B66]/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#AE9B66] to-[#AE9B66]">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Active</p>
                    <p className="text-xs text-gray-600">Currently active members</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.active_members || 0}
                  </p>
                  <p className="text-xs text-[#AE9B66] font-medium">
                    {stats?.total_members ? Math.round((stats.active_members / stats.total_members) * 100) : 0}% of total
                  </p>
                </div>
              </div>
              
              {/* Inactive Members */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#b8352d] to-[#b8352d] border border-[#b8352d]/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#b8352d] to-[#b8352d]">
                    <UserX className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Inactive</p>
                    <p className="text-xs text-gray-600">Temporarily inactive</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.inactive_members || 0}
                  </p>
                  <p className="text-xs text-[#b8352d] font-medium">
                    {stats?.total_members ? Math.round((stats.inactive_members / stats.total_members) * 100) : 0}% of total
                  </p>
                </div>
              </div>
              
              {/* Blocked Members */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#b8352d] to-[#b8352d] border border-[#b8352d]/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#b8352d] to-[#b8352d]">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Blocked</p>
                    <p className="text-xs text-white/90">Suspended accounts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {stats?.blocked_members || 0}
                  </p>
                  <p className="text-xs text-white/80 font-medium">
                    {stats?.total_members ? Math.round((stats.blocked_members / stats.total_members) * 100) : 0}% of total
                  </p>
                </div>
              </div>
              
              {/* Event Members */}
              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-xl bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed]">
                    <p className="text-xl font-bold text-[#03215F]">
                      {stats?.event_members || 0}
                    </p>
                    <p className="text-xs text-[#03215F]/80">Event Registrations</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gradient-to-br from-[#03215F] to-[#03215F]">
                    <p className="text-xl font-bold text-white">
                      {stats?.checked_in_members || 0}
                    </p>
                    <p className="text-xs text-white/90">Checked-in Members</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}