
"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Receipt,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  Search,
  TrendingUp,
  BarChart3,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import ReceiptModal from "@/components/ReceiptModal";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-BH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatBHD = (amount) => {
  if (!amount || amount === 0) return "BHD 0.000";
  return new Intl.NumberFormat("en-BH", {
    style: "currency",
    currency: "BHD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
};

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [receipt, setReceipt] = useState(null);

  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    amount: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/dashboard/payments", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPayments(data.payments || []);
          calculateStats(data.payments || []);
        }
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsList) => {
    const stats = {
      total: paymentsList.length,
      paid: paymentsList.filter((p) => p.paid).length,
      pending: paymentsList.filter((p) => !p.paid).length,
      amount: paymentsList
        .filter((p) => p.paid)
        .reduce((sum, p) => sum + (p.amount || 0), 0),
    };

    setStats(stats);
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((payment) => {
        if (filters.status === "paid") return payment.paid;
        if (filters.status === "pending") return !payment.paid;
        if (filters.status === "failed") return payment.status === "failed";
        return true;
      });
    }

    // Filter by type
    if (filters.type !== "all") {
      filtered = filtered.filter((payment) => {
        if (filters.type === "membership")
          return payment.payment_type === "membership";
        if (filters.type === "event") return payment.payment_type === "event";
        return true;
      });
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate >= startDate;
      });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate <= endDate;
      });
    }

    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.reference?.toLowerCase().includes(searchTerm) ||
          payment.payment_type?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredPayments(filtered);
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const res = await fetch(`/api/dashboard/receipts/${paymentId}`, {
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        setReceipt(data.receipt);
      } else {
        toast.error("Failed to load receipt");
      }
    } catch {
      toast.error("Error loading receipt");
    }
  };

  const handleRefresh = () => {
    fetchPayments();
  };

  const getStatusColor = (payment) => {
    if (payment.paid) return "green";
    if (payment.status === "failed") return "red";
    return "yellow";
  };

  const getStatusText = (payment) => {
    if (payment.paid) return "Completed";
    if (payment.status === "failed") return "Failed";
    return "Pending";
  };

  const getStatusIcon = (payment) => {
    if (payment.paid) return <CheckCircle className="w-5 h-5" />;
    if (payment.status === "failed") return <XCircle className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#03215F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading payment history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Payment History
            </h1>
            <p className="text-white/80">
              View and manage your payment transactions
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#9cc2ed] rounded-lg">
              <CreditCard className="w-6 h-6 text-[#03215F]" />
            </div>
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <p className="text-gray-600 text-sm">
            Total Payments
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#AE9B66] rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">{stats.paid}</span>
          </div>
          <p className="text-gray-600 text-sm">Completed</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#ECCF0F] rounded-lg">
              <Clock className="w-6 h-6 text-[#03215F]" />
            </div>
            <span className="text-2xl font-bold">{stats.pending}</span>
          </div>
          <p className="text-gray-600 text-sm">Pending</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#03215F] rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">
              {formatBHD(stats.amount)}
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Total Amount
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reference or type..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-transparent"
            >
              <option value="all">All Status</option>
              <option value="paid">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-transparent"
            >
              <option value="all">All Types</option>
              <option value="membership">Membership</option>
              <option value="event">Event</option>
            </select>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() =>
                setFilters({
                  status: "all",
                  type: "all",
                  search: "",
                  startDate: "",
                  endDate: "",
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => {
                  const statusColor = getStatusColor(payment);
                  const statusText = getStatusText(payment);
                  const statusIcon = getStatusIcon(payment);

                  return (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {payment.reference || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.description || payment.payment_type}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.payment_type === "membership"
                              ? "bg-[#9cc2ed] text-[#03215F]"
                              : "bg-[#AE9B66] text-white"
                          }`}
                        >
                          {payment.payment_type === "membership"
                            ? "Membership"
                            : "Event"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">
                          {formatBHD(payment.amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.currency || "BHD"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`mr-2 ${
                              statusColor === "green"
                                ? "text-[#AE9B66]"
                                : statusColor === "red"
                                ? "text-[#b8352d]"
                                : "text-[#ECCF0F]"
                            }`}
                          >
                            {statusIcon}
                          </div>
                          <span
                            className={`font-medium ${
                              statusColor === "green"
                                ? "text-[#AE9B66]"
                                : statusColor === "red"
                                ? "text-[#b8352d]"
                                : "text-[#ECCF0F]"
                            }`}
                          >
                            {statusText}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.paid_at || payment.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {payment.paid && (
                            <button
                              onClick={() => handleDownloadReceipt(payment.id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Receipt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No payments found
                    </h3>
                    <p className="text-gray-600">
                      {payments.length === 0
                        ? "You have no payment history yet."
                        : "No payments match your filters."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination or Summary */}
        {filteredPayments.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredPayments.length} of {payments.length} payments
              </div>

              <div className="mt-2 md:mt-0">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="font-semibold">Total: </span>
                    {formatBHD(
                      filteredPayments
                        .filter((p) => p.paid)
                        .reduce((sum, p) => sum + (p.amount || 0), 0)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Card */}
      {filteredPayments.length > 0 && (
        <div className="bg-gradient-to-r from-[#9cc2ed]/10 to-[#9cc2ed]/10 rounded-xl p-6 border border-[#9cc2ed]/20">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Payment Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <BarChart3 className="w-5 h-5 text-[#03215F] mr-2" />
                <h4 className="font-semibold">Payment Distribution</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Membership
                  </span>
                  <span className="font-medium">
                    {
                      filteredPayments.filter(
                        (p) => p.payment_type === "membership"
                      ).length
                    }{" "}
                    payments
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Events
                  </span>
                  <span className="font-medium">
                    {
                      filteredPayments.filter((p) => p.payment_type === "event")
                        .length
                    }{" "}
                    payments
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 text-[#AE9B66] mr-2" />
                <h4 className="font-semibold">Status Overview</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Completed
                  </span>
                  <span className="font-medium text-[#AE9B66]">
                    {filteredPayments.filter((p) => p.paid).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Pending
                  </span>
                  <span className="font-medium text-[#ECCF0F]">
                    {filteredPayments.filter((p) => !p.paid).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 text-[#03215F] mr-2" />
                <h4 className="font-semibold">Total Amount</h4>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">
                  {formatBHD(
                    filteredPayments
                      .filter((p) => p.paid)
                      .reduce((sum, p) => sum + (p.amount || 0), 0)
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Total paid amount from all completed transactions
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {receipt && (
        <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  );
}
