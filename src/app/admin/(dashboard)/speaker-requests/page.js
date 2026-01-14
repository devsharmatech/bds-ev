'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Eye, Trash2, CheckCircle, XCircle, 
  Download, RefreshCw, ChevronLeft, ChevronRight, 
  Mail, FileText, X, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SpeakerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [filters, setFilters] = useState({
    event_id: '',
    status: '',
    search: '',
    category: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [detailsModal, setDetailsModal] = useState({ open: false, request: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      console.log('[FETCH-EVENTS] Starting...');
      const res = await fetch('/api/event/public?limit=100&isUpcoming=false');
      const data = await res.json();
      console.log('[FETCH-EVENTS] Response:', { status: res.status, data });
      if (data.events) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('[FETCH-EVENTS] Error:', error);
    }
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.event_id && { event_id: filters.event_id }),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
      });

      console.log('[FETCH-REQUESTS] Starting with params:', params.toString());
      const res = await fetch(`/api/admin/speaker-requests?${params}`);
      const data = await res.json();
      console.log('[FETCH-REQUESTS] Response:', { status: res.status, data });

      if (data.success) {
        setRequests(data.requests || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 1,
        }));
      } else {
        console.error('[FETCH-REQUESTS] API Error:', data.message, data.error);
        toast.error(data.message || 'Failed to load speaker requests');
      }
    } catch (error) {
      console.error('[FETCH-REQUESTS] Error:', error);
      toast.error('Failed to load speaker requests');
    } finally {
      setLoading(false);
    }
  }, [filters.event_id, filters.status, filters.category, filters.search, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchEvents();
    fetchRequests();
  }, [fetchRequests]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRequests();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRequests(requests.map(r => r.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedRequests(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleApprove = async (ids) => {
    if (!ids.length) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/speaker-requests/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${ids.length} request(s) approved`);
        setSelectedRequests([]);
        fetchRequests();
      } else {
        toast.error(data.message || 'Failed to approve');
      }
    } catch (error) {
      toast.error('Failed to approve requests');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (ids) => {
    if (!ids.length) return;
    const reason = prompt('Enter rejection reason (optional):');
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/speaker-requests/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${ids.length} request(s) rejected`);
        setSelectedRequests([]);
        fetchRequests();
      } else {
        toast.error(data.message || 'Failed to reject');
      }
    } catch (error) {
      toast.error('Failed to reject requests');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (ids) => {
    if (!ids.length) return;
    if (!confirm(`Are you sure you want to delete ${ids.length} request(s)?`)) return;
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/speaker-requests/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${ids.length} request(s) deleted`);
        setSelectedRequests([]);
        fetchRequests();
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete requests');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      confirmed: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Speaker Requests</h1>
        <p className="text-gray-600 mt-1">Manage speaker applications for events</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.event_id}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, event_id: e.target.value }));
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03215F] bg-white min-w-[180px]"
          >
            <option value="">All Events</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, status: e.target.value }));
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03215F] bg-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, category: e.target.value }));
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03215F] bg-white"
          >
            <option value="">All Categories</option>
            <option value="VIP">VIP</option>
            <option value="Delegate">Delegate</option>
            <option value="Speaker">Speaker</option>
            <option value="Organizer">Organizer</option>
            <option value="Participant">Participant</option>
            <option value="Exhibitor">Exhibitor</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-[#03215F] text-white rounded-lg hover:bg-[#021845] flex items-center gap-2"
          >
            <Filter size={18} />
            Filter
          </button>

          <button
            type="button"
            onClick={() => {
              setFilters({ event_id: '', status: '', search: '', category: '' });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Reset
          </button>
        </form>
      </div>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <span className="text-blue-800 font-medium">
            {selectedRequests.length} request(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(selectedRequests)}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle size={18} />
              Approve
            </button>
            <button
              onClick={() => handleReject(selectedRequests)}
              disabled={actionLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 disabled:opacity-50"
            >
              <XCircle size={18} />
              Reject
            </button>
            <button
              onClick={() => handleDelete(selectedRequests)}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRequests.length === requests.length && requests.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-2">Loading...</p>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                    No speaker requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={() => handleSelectOne(request.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{request.full_name}</div>
                      <div className="text-sm text-gray-500">{request.professional_title}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{request.email}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                      {request.events?.title || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {request.category || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setDetailsModal({ open: true, request })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove([request.id])}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleReject([request.id])}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete([request.id])}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-3 py-1 text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {detailsModal.open && detailsModal.request && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-[#03215F] px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Request Details</h3>
              <button
                onClick={() => setDetailsModal({ open: false, request: null })}
                className="text-white hover:bg-white/20 p-2 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  <p className="font-medium">{detailsModal.request.full_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{detailsModal.request.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="font-medium">{detailsModal.request.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Category</label>
                  <p className="font-medium">{detailsModal.request.category || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Professional Title</label>
                  <p className="font-medium">{detailsModal.request.professional_title}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p>{getStatusBadge(detailsModal.request.status)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Affiliation/Institution</label>
                  <p className="font-medium">{detailsModal.request.affiliation_institution || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Country of Practice</label>
                  <p className="font-medium">{detailsModal.request.country_of_practice || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Presentation Topics</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {detailsModal.request.presentation_topics?.map((topic, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                  {detailsModal.request.presentation_topic_other && (
                    <p className="mt-2 text-sm text-gray-600">Other: {detailsModal.request.presentation_topic_other}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500">Consent for Publication</label>
                  <p className="font-medium capitalize">{detailsModal.request.consent_for_publication || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Applied On</label>
                  <p className="font-medium">{new Date(detailsModal.request.created_at).toLocaleString()}</p>
                </div>
                {detailsModal.request.abstract_form_url && (
                  <div>
                    <label className="text-sm text-gray-500">Abstract Form</label>
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/speaker-documents/${detailsModal.request.abstract_form_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <FileText size={16} />
                      Download
                    </a>
                  </div>
                )}
                {detailsModal.request.article_presentation_url && (
                  <div>
                    <label className="text-sm text-gray-500">Article/Presentation</label>
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/speaker-documents/${detailsModal.request.article_presentation_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <FileText size={16} />
                      Download
                    </a>
                  </div>
                )}
                {detailsModal.request.rejection_reason && (
                  <div className="col-span-2">
                    <label className="text-sm text-gray-500">Rejection Reason</label>
                    <p className="font-medium text-red-600">{detailsModal.request.rejection_reason}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {detailsModal.request.status === 'pending' && (
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => {
                      handleApprove([detailsModal.request.id]);
                      setDetailsModal({ open: false, request: null });
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleReject([detailsModal.request.id]);
                      setDetailsModal({ open: false, request: null });
                    }}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
