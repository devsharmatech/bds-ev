"use client";

import React, { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Search,
  RefreshCw,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Tag,
} from "lucide-react";

const STATUS_COLORS = {
  completed: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
};

const TYPE_LABELS = {
  subscription_registration: "Membership Registration",
  subscription_annual: "Annual Fee",
  subscription_renewal: "Membership Renewal",
  subscription_combined: "Registration + Annual",
  membership_payment: "Membership Payment",
  event_registration: "Event Registration",
};

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all"); // all | membership | event
  const [dateRange, setDateRange] = useState("all"); // today | yesterday | week | month | year | all

  // Stats
  const [stats, setStats] = useState({
    totalAmount: 0,
    completed: 0,
    pending: 0,
    failed: 0,
  });

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        date_range: dateRange,
      });

      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);

      const res = await fetch(`/api/admin/payment-history/get?${params.toString()}`);
      const json = await res.json();

      if (!json.success) {
        toast.error(json.error || "Failed to load payment history");
        setPayments([]);
        setTotal(0);
        setTotalPages(1);
      } else {
        const list = json.payments || [];
        setPayments(list);
        const totalItems = json.pagination?.total || list.length || 0;
        setTotal(totalItems);
        setTotalPages(Math.max(1, json.pagination?.totalPages || Math.ceil(totalItems / limit)));

        // Compute stats
        const totalAmount = list.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const completed = list.filter((p) => p.status === "completed").length;
        const pending = list.filter((p) => p.status === "pending").length;
        const failed = list.filter((p) => p.status === "failed").length;

        setStats({ totalAmount, completed, pending, failed });
      }
    } catch (err) {
      console.error("Error loading payment history:", err);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, categoryFilter, dateRange]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const formatCurrency = (amount, currency = "BHD") => {
    const value = Number(amount || 0);
    return new Intl.NumberFormat("en-BH", {
      style: "currency",
      currency,
      minimumFractionDigits: 3,
    }).format(value);
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return date.toLocaleString("en-BH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Bahrain",
    });
  };

  const getTypeLabel = (payment) => {
    const raw = payment.payment_for || "";
    return TYPE_LABELS[raw] || (payment.details?.type === "event" ? "Event" : "Membership");
  };

  const getUserName = (payment) => {
    return (
      payment.user_full_name ||
      payment.details?.user_name ||
      payment.user_email ||
      payment.details?.user_email ||
      (payment.user_id ? `User ${String(payment.user_id).slice(0, 8)}...` : "Unknown")
    );
  };

  const getUserEmail = (payment) => {
    return payment.user_email || payment.details?.user_email || null;
  };

  const getSubInfo = (payment) => {
    if (payment.details?.type === "event") {
      return payment.details.event_title || `Event #${payment.details.event_id || "—"}`;
    }
    if (payment.details?.type === "membership") {
      if (payment.details.plan_name) return payment.details.plan_name;
      return "Membership Payment";
    }
    return payment.payment_for || "—";
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-40" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
            <div className="h-6 bg-gray-200 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
            borderRadius: "0.75rem",
            border: "1px solid #374151",
          },
        }}
      />

      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
              Payment History
            </h1>
            <p className="text-gray-600 mt-2">
              Track all membership and event payments with quick filters.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by user, payment or invoice ID, event..."
                className="w-full sm:w-72 pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none"
              >
                <option value="all">All Types</option>
                <option value="membership">Membership</option>
                <option value="event">Event</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="year">Last 12 months</option>
                <option value="all">All Time</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadPayments}
                className="p-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-blue rounded-lg">
                <DollarSign className="w-6 h-6 text-[#03215F]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold mt-1">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold mt-1">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold mt-1">{stats.failed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          renderSkeleton()
        ) : payments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
              <DollarSign className="w-full h-full opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No payment history</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Payments will appear here once members start paying for memberships or events.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Member & Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Payment Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => {
                    const statusClass = STATUS_COLORS[payment.status] || "bg-gray-100 text-gray-700";
                    const typeLabel = getTypeLabel(payment);
                    const userName = getUserName(payment);
                    const userEmail = getUserEmail(payment);
                    const subInfo = getSubInfo(payment);

                    return (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                              <User className="w-4 h-4 text-gray-400" />
                              <span>{userName}</span>
                            </div>
                            {userEmail && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {userEmail}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Tag className="w-3 h-3" />
                              <span>{typeLabel}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm">
                            <div className="text-gray-900">{subInfo}</div>
                            <div className="text-xs text-gray-500">
                              PID: {payment.payment_id || "—"} | INV: {payment.invoice_id || "—"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-lg font-bold">
                            {formatCurrency(payment.amount, payment.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusClass}`}>
                            {payment.status ? payment.status.toUpperCase() : "UNKNOWN"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDateTime(payment.created_at)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination & page size */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{payments.length}</span> of{" "}
                <span className="font-semibold">{total}</span> payments
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Rows per page</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-accent-blue focus:border-transparent outline-none text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page <span className="font-semibold">{page}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
