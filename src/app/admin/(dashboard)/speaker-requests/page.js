'use client';

import { useState, useEffect, useCallback } from 'react';

import { 
  Search, Filter, Eye, Trash2, CheckCircle, XCircle, 
  Download, RefreshCw, ChevronLeft, ChevronRight, 
  Mail, FileText, X, Loader2, Printer
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
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

  // Handle print badge for approved speakers
  const handlePrintBadge = (request) => {
    const event = events.find(e => e.id === request.event_id);
    if (!event) {
      toast.error('Event information not found');
      return;
    }

    // Create a new window with the badge content
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const badgeHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Speaker Badge - ${request.full_name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 20px;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .badge-container {
              width: 400px;
              height: 600px;
              background: linear-gradient(135deg, #03215F 0%, #1a3a7f 100%);
              border-radius: 20px;
              padding: 30px;
              color: white;
              position: relative;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(3, 33, 95, 0.3);
            }
            .badge-bg {
              position: absolute;
              top: -100px;
              right: -100px;
              width: 300px;
              height: 300px;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 50%;
            }
            .badge-bg2 {
              position: absolute;
              bottom: -150px;
              left: -150px;
              width: 400px;
              height: 400px;
              background: rgba(255, 255, 255, 0.03);
              border-radius: 50%;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 30px;
              position: relative;
              z-index: 2;
            }
            .logo-section {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .logo {
              width: 50px;
              height: 50px;
              background: white;
              border-radius: 12px;
              padding: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .org-info h3 {
              font-size: 14px;
              font-weight: 700;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .org-info p {
              font-size: 10px;
              opacity: 0.8;
              letter-spacing: 1px;
            }
            .speaker-title {
              text-align: center;
              margin: 30px 0;
              position: relative;
              z-index: 2;
            }
            .speaker-title h1 {
              font-size: 32px;
              font-weight: 900;
              letter-spacing: 2px;
              margin-bottom: 8px;
            }
            .category {
              font-size: 18px;
              background: rgba(255, 255, 255, 0.2);
              padding: 8px 20px;
              border-radius: 25px;
              display: inline-block;
              font-weight: 700;
              letter-spacing: 2px;
              text-transform: uppercase;
            }
            .speaker-info {
              text-align: center;
              margin-bottom: 25px;
              position: relative;
              z-index: 2;
            }
            .speaker-name {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .speaker-title-text {
              font-size: 16px;
              opacity: 0.9;
              margin-bottom: 4px;
            }
            .speaker-designation {
              font-size: 14px;
              opacity: 0.8;
            }
            .event-info {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 15px;
              padding: 20px;
              margin-bottom: 25px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              position: relative;
              z-index: 2;
            }
            .event-title {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 12px;
              line-height: 1.3;
            }
            .event-details {
              font-size: 12px;
              opacity: 0.9;
              line-height: 1.4;
            }
            .event-date {
              margin-bottom: 6px;
              font-weight: 500;
            }
            .event-end-date {
              margin-bottom: 6px;
              font-weight: 400;
              color: rgba(255, 255, 255, 0.8);
            }
            .event-agendas {
              margin-bottom: 6px;
              font-weight: 500;
              color: rgba(255, 255, 255, 0.9);
            }
            .event-venue {
              opacity: 0.8;
            }
            .qr-section {
              display: flex;
              justify-content: center;
              position: relative;
              z-index: 2;
            }
            .qr-container {
              background: white;
              padding: 8px;
              border-radius: 12px;
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            }
            @media print {
              body { margin: 0; padding: 0; }
              .badge-container { 
                width: 100%;
                max-width: 400px;
                height: auto;
                min-height: 600px;
                margin: 0 auto;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="badge-container">
            <div class="badge-bg"></div>
            <div class="badge-bg2"></div>
            
            <div class="header">
              <div class="logo-section">
                <div class="logo">
                  <img src="/logo.png" alt="BDS Logo" style="width: 100%; height: 100%; object-fit: contain;" />
                </div>
                <div class="org-info">
                  <h3>BAHRAIN DENTAL SOCIETY</h3>
                  <p>OFFICIAL SPEAKER</p>
                </div>
              </div>
            </div>
            
            <div class="speaker-title">
              
              <div class="category">${(request.category || 'SPEAKER').toUpperCase()}</div>
            </div>
            
            <div class="speaker-info">
              <div class="speaker-name">${request.full_name.toUpperCase()}</div>
              <div class="speaker-title-text">${request.professional_title || 'Professional Speaker'}</div>
              <div class="speaker-designation">${request.affiliation_institution || ''}</div>
            </div>
            
            <div class="event-info">
              <div class="event-title">${event.title}</div>
              <div class="event-details">
                <div class="event-date">Start: ${new Date(event.start_datetime).toLocaleDateString('en-BH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'Asia/Bahrain'
                })}</div>
                ${event.end_datetime ? `<div class="event-end-date">End: ${new Date(event.end_datetime).toLocaleDateString('en-BH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'Asia/Bahrain'
                })}</div>` : ''}
                ${event.event_agendas && event.event_agendas.length > 0 ? `<div class="event-agendas">Total Agendas: ${event.event_agendas.length}</div>` : ''}
                ${event.venue_name ? `<div class="event-venue">${event.venue_name}</div>` : ''}
              </div>
            </div>
            
            <div class="qr-section">
              <div class="qr-container" id="qr-container">
                <!-- QR Code will be inserted here -->
              </div>
            </div>
          </div>
          
          <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
          <script>
            // Generate QR code
            const qrData = JSON.stringify({
              type: 'SPEAKER_VERIFICATION',
              speaker_id: '${request.id}',
              speaker_name: '${request.full_name}',
              event_id: '${event.id}',
              event_title: '${event.title}',
              category: '${(request.category || 'SPEAKER').toUpperCase()}'
            });
            
            const qr = qrcode(0, 'M');
            qr.addData(qrData);
            qr.make();
            
            const qrContainer = document.getElementById('qr-container');
            qrContainer.innerHTML = qr.createImgTag(3, 4);
            
            // Auto print after a short delay
            setTimeout(() => {
              window.print();
            }, 1000);
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(badgeHTML);
    printWindow.document.close();
    
    toast.success('Speaker badge generated for printing');
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
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 uppercase">
                        {request.category || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {new Date(request.created_at).toLocaleDateString('en-BH', { timeZone: 'Asia/Bahrain' })}
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
                        {request.status === 'approved' && (
                          <button
                            onClick={() => handlePrintBadge(request)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Print Speaker Badge"
                          >
                            <Printer size={18} />
                          </button>
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
                  <p className="font-medium">{new Date(detailsModal.request.created_at).toLocaleString('en-BH', { timeZone: 'Asia/Bahrain' })}</p>
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

              {/* Speaker Declaration Form Data */}
              {(detailsModal.request.declaration_cpd_title || detailsModal.request.declaration_speaker_name) && (
                <div className="mt-8 border-t pt-6">
                  <h4 className="text-lg font-bold text-[#03215F] mb-4">Speaker Declaration Form</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">CPD Activity Title</label>
                      <p className="font-medium">{detailsModal.request.declaration_cpd_title || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Speaker Name</label>
                      <p className="font-medium">{detailsModal.request.declaration_speaker_name || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Presentation Title</label>
                      <p className="font-medium">{detailsModal.request.declaration_presentation_title || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Presentation Date</label>
                      <p className="font-medium">{detailsModal.request.declaration_presentation_date || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Speaker’s Contact Number</label>
                      <p className="font-medium">{detailsModal.request.declaration_contact_number || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Speaker’s E-Mail Address</label>
                      <p className="font-medium">{detailsModal.request.declaration_email || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm text-gray-500">Scientific Content/Abstract</label>
                      <p className="font-medium whitespace-pre-line">{detailsModal.request.declaration_abstract || '-'}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="text-sm text-gray-500 font-semibold mb-2 block">Declaration Statements</label>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border text-xs md:text-sm">
                        <thead>
                          <tr className="bg-blue-100">
                            <th className="border px-2 py-1 text-left">Statement</th>
                            <th className="border px-2 py-1">Agree</th>
                            <th className="border px-2 py-1">Disagree</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            "The content of my presentation will promote quality improvement in practice, remain evidence-based, balanced, and unbiased, and will not promote the business interests of any commercial entity.",
                            "I confirm that no material used in my presentation infringes copyright. Where copyrighted material is included, I have obtained the necessary permissions. NHRA will not be held responsible for any misrepresentation in this regard.",
                            "I understand that the NHRA approval process may require review of my credentials, presentation, and content in advance, and I will provide all requested materials accordingly.",
                            "For live events, I acknowledge that NHRA CPD Committee members may attend to ensure the presentation is educational and not promotional.",
                            "When referring to products or services, I will use generic names whenever possible. If trade names are used, they will represent more than one company where available.",
                            "If I have been trained or engaged by a commercial entity, I confirm that no promotional aspects will be included in my presentation.",
                            "If my research is funded by a commercial entity, I confirm it will be presented in line with accepted scientific principles and without promoting the funding company.",
                            "My lecture content will remain purely scientific or clinical, and any reference to drugs, products, treatments, or services will be for teaching purposes only and in generic form.",
                            "In line with NHRA regulations, I will not endorse any commercial products, materials, or services in my presentation.",
                            "An Ethical Confederation declaration will be included as part of my presentation."
                          ].map((statement, idx) => (
                            <tr key={idx}>
                              <td className="border px-2 py-1 align-top">{statement}</td>
                              <td className="border px-2 py-1 text-center">
                                {detailsModal.request[`declaration_statement_${idx}`] === 'agree' ? '✔️' : ''}
                              </td>
                              <td className="border px-2 py-1 text-center">
                                {detailsModal.request[`declaration_statement_${idx}`] === 'disagree' ? '✔️' : ''}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div>
                      <label className="text-sm text-gray-500">Speaker Name (Final Declaration)</label>
                      <p className="font-medium">{detailsModal.request.declaration_final_speaker_name || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Date</label>
                      <p className="font-medium">{detailsModal.request.declaration_final_date || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Signature</label>
                      <p className="font-medium">{detailsModal.request.declaration_final_signature || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

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
