"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  User,
  FileText,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Archive,
  MessageSquare,
  Eye,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "all", label: "All Messages", color: "bg-gray-500" },
  { value: "new", label: "New", color: "bg-blue-500" },
  { value: "read", label: "Read", color: "bg-yellow-500" },
  { value: "replied", label: "Replied", color: "bg-green-500" },
  { value: "archived", label: "Archived", color: "bg-gray-400" },
];

const STATUS_ICONS = {
  new: Clock,
  read: Eye,
  replied: CheckCircle,
  archived: Archive,
};

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAllAcrossPages, setSelectAllAcrossPages] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePayload, setDeletePayload] = useState({ ids: [], deleteAll: false });
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchMessages();
  }, [page, statusFilter, searchTerm]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter,
      });
      if (searchTerm) params.set('search', searchTerm);

      const response = await fetch(`/api/admin/contact-messages?${params}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages || []);
        setSelectedIds(new Set());
        setSelectAllAcrossPages(false);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      } else {
        toast.error(data.message || "Failed to load messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId, newStatus, adminNotes = null) => {
    try {
      const response = await fetch("/api/admin/contact-messages", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: messageId,
          status: newStatus,
          admin_notes: adminNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Message status updated");
        fetchMessages();
        if (selectedMessage?.id === messageId) {
          setSelectedMessage({ ...selectedMessage, status: newStatus, admin_notes: adminNotes });
        }
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating message status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
    
    // Mark as read if it's new
    if (message.status === "new") {
      updateMessageStatus(message.id, "read");
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectAllAcrossPages(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMessages.length && filteredMessages.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map((m) => m.id)));
    }
    setSelectAllAcrossPages(false);
  };

  const deleteMessages = async (ids, deleteAll = false) => {
    if (!deleteAll && !ids.length) return;
    try {
      setDeleting(true);
      const res = await fetch('/api/admin/contact-messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deleteAll
          ? { all: true, status: statusFilter, search: searchTerm }
          : { ids }
        )
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Message(s) deleted');
        setSelectedIds(new Set());
        setSelectAllAcrossPages(false);
        if (selectedMessage && ids.includes(selectedMessage.id)) {
          setShowDetailModal(false);
          setSelectedMessage(null);
        }
        fetchMessages();
      } else {
        toast.error(data.message || 'Failed to delete messages');
      }
    } catch (error) {
      console.error('Error deleting messages:', error);
      toast.error('Failed to delete messages');
    } finally {
      setDeleting(false);
    }
  };

  const requestDelete = (ids, deleteAll = false) => {
    if (!deleteAll && !ids.length) return;
    setDeletePayload({ ids, deleteAll });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const { ids, deleteAll } = deletePayload;
    await deleteMessages(ids, deleteAll);
    setShowDeleteConfirm(false);
    setDeletePayload({ ids: [], deleteAll: false });
  };

  const filteredMessages = messages.filter((message) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      message.name?.toLowerCase().includes(searchLower) ||
      message.email?.toLowerCase().includes(searchLower) ||
      message.message?.toLowerCase().includes(searchLower) ||
      message.title?.toLowerCase().includes(searchLower) ||
      message.phone?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-BH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#03215F] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading contact messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-1">
            Manage and respond to contact form submissions ({total} total)
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 bg-[#03215F] text-white rounded-lg hover:bg-[#03215F]/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or message..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F]"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setStatusFilter(option.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === option.value
                    ? `${option.color} text-white`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={toggleSelectAll}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
          >
            {selectedIds.size === filteredMessages.length && filteredMessages.length > 0
              ? 'Clear Selection'
              : 'Select All'}
          </button>
          <button
            onClick={() => {
              setSelectAllAcrossPages(true);
              setSelectedIds(new Set(filteredMessages.map((m) => m.id)));
            }}
            disabled={total <= filteredMessages.length}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select all across pages ({total})
          </button>
          <button
            onClick={() => requestDelete(Array.from(selectedIds), selectAllAcrossPages)}
            disabled={selectedIds.size === 0 && !selectAllAcrossPages}
            className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectAllAcrossPages ? total : selectedIds.size})
              </>
            )}
          </button>
        </div>
        {selectAllAcrossPages && (
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900 flex items-center justify-between">
            <span>
              All {total} messages in the current filter are selected.
            </span>
            <button
              onClick={() => {
                setSelectAllAcrossPages(false);
                setSelectedIds(new Set());
              }}
              className="text-blue-700 hover:text-blue-900 font-semibold"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "No contact messages yet"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMessages.map((message) => {
            const StatusIcon = STATUS_ICONS[message.status] || Clock;
            const statusOption = STATUS_OPTIONS.find((opt) => opt.value === message.status);

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewMessage(message)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(message.id)}
                      onChange={() => toggleSelect(message.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-[#03215F] border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#03215F]/10 rounded-lg">
                        <User className="w-5 h-5 text-[#03215F]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {message.name}
                        </h3>
                        {message.title && (
                          <p className="text-sm text-gray-500">{message.title}</p>
                        )}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                          statusOption?.color || "bg-gray-500"
                        } text-white`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusOption?.label || message.status}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          requestDelete([message.id]);
                        }}
                        disabled={deleting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{message.email}</span>
                      </div>
                      {message.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{message.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {message.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(message.created_at)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} messages
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {showDetailModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Message Details</h2>
                <p className="text-gray-600 mt-1">Contact form submission</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedMessage(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Sender Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Sender Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Name</label>
                    <p className="font-medium text-gray-900 mt-1">{selectedMessage.name}</p>
                  </div>
                  {selectedMessage.title && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Title</label>
                      <p className="font-medium text-gray-900 mt-1">{selectedMessage.title}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                    <p className="font-medium text-gray-900 mt-1 break-all">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Phone</label>
                      <p className="font-medium text-gray-900 mt-1">{selectedMessage.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Date</label>
                    <p className="font-medium text-gray-900 mt-1">{formatDate(selectedMessage.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          STATUS_OPTIONS.find((opt) => opt.value === selectedMessage.status)?.color || "bg-gray-500"
                        } text-white`}
                      >
                        {STATUS_OPTIONS.find((opt) => opt.value === selectedMessage.status)?.label || selectedMessage.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Message</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedMessage.admin_notes && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Admin Notes</label>
                  <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => requestDelete([selectedMessage.id])}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
                <button
                  onClick={() => updateMessageStatus(selectedMessage.id, "read")}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Mark as Read
                </button>
                <button
                  onClick={() => updateMessageStatus(selectedMessage.id, "replied")}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Replied
                </button>
                <button
                  onClick={() => updateMessageStatus(selectedMessage.id, "archived")}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: Your message to Bahrain Dental Society`}
                  className="px-4 py-2 bg-[#03215F] text-white rounded-lg hover:bg-[#03215F]/90 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Reply via Email
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                {deletePayload.deleteAll
                  ? `Delete all ${total} messages that match the current filters?`
                  : `Delete ${deletePayload.ids.length} message${deletePayload.ids.length > 1 ? 's' : ''}?`}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

