"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Mail,
  FileText,
  X,
  Loader2,
  Users,
  Calendar,
  Building,
  Globe,
  Briefcase,
  Tag,
  Clock,
  Download,
  ExternalLink,
  BookOpen,
  File,
  Phone,
  User,
  AlertCircle,
  Printer,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ResearchSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    submission: null,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState([]);

  const STATUS_COLORS = {
    pending: "bg-yellow-50 border-yellow-200 text-yellow-800",
    approved: "bg-green-50 border-green-200 text-green-800",
    rejected: "bg-red-50 border-red-200 text-red-800",
  };

  const STATUS_ICONS = {
    pending: <Clock className="w-3.5 h-3.5" />,
    approved: <CheckCircle className="w-3.5 h-3.5" />,
    rejected: <XCircle className="w-3.5 h-3.5" />,
  };

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const res = await fetch(`/api/admin/research-submissions?${params}`);
      const data = await res.json();

      if (data.success) {
        setSubmissions(data.submissions || []);
        setPagination((prev) => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 1,
        }));
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast.error(data.message || "Failed to load submissions");
      }
    } catch (error) {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.search, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchSubmissions();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(submissions.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleApprove = async (ids) => {
    if (!ids.length) return;
    setActionLoading(true);
    setProcessingIds(ids);
    try {
      const res = await fetch("/api/admin/research-submissions/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${ids.length} submission(s) approved!`);
        setSelectedIds([]);
        fetchSubmissions();
      } else {
        toast.error(data.message || "Failed to approve");
      }
    } catch (error) {
      toast.error("Failed to approve submissions");
    } finally {
      setActionLoading(false);
      setProcessingIds([]);
    }
  };

  const handleReject = async (ids) => {
    if (!ids.length) return;
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return;

    setActionLoading(true);
    setProcessingIds(ids);
    try {
      const res = await fetch("/api/admin/research-submissions/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${ids.length} submission(s) rejected`);
        setSelectedIds([]);
        fetchSubmissions();
      } else {
        toast.error(data.message || "Failed to reject");
      }
    } catch (error) {
      toast.error("Failed to reject submissions");
    } finally {
      setActionLoading(false);
      setProcessingIds([]);
    }
  };

  const handleDelete = async (ids) => {
    if (!ids.length) return;
    if (!window.confirm(`Delete ${ids.length} submission(s)? This cannot be undone.`)) return;

    setActionLoading(true);
    setProcessingIds(ids);
    try {
      const res = await fetch("/api/admin/research-submissions/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${ids.length} submission(s) deleted`);
        setSelectedIds([]);
        fetchSubmissions();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete submissions");
    } finally {
      setActionLoading(false);
      setProcessingIds([]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-BH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Bahrain",
    });
  };

  const getTopics = (submission) => {
    if (!submission.presentation_topics) return [];
    if (Array.isArray(submission.presentation_topics)) return submission.presentation_topics;
    try { return JSON.parse(submission.presentation_topics); } catch { return []; }
  };

  const DECLARATION_STATEMENTS = [
    "The content of my research/presentation will promote quality improvement in practice, remain evidence-based, balanced, and unbiased, and will not promote the business interests of any commercial entity.",
    "I confirm that no material used in my research infringes copyright. Where copyrighted material is included, I have obtained the necessary permissions. NHRA will not be held responsible for any misrepresentation in this regard.",
    "I understand that the NHRA approval process may require review of my credentials, research, and content in advance, and I will provide all requested materials accordingly.",
    "For live events, I acknowledge that NHRA CPD Committee members may attend to ensure the presentation is educational and not promotional.",
    "When referring to products or services, I will use generic names whenever possible. If trade names are used, they will represent more than one company where available.",
    "If I have been trained or engaged by a commercial entity, I confirm that no promotional aspects will be included in my research.",
    "If my research is funded by a commercial entity, I confirm it will be presented in line with accepted scientific principles and without promoting the funding company.",
    "My research content will remain purely scientific or clinical, and any reference to drugs, products, treatments, or services will be for teaching purposes only and in generic form.",
    "In line with NHRA regulations, I will not endorse any commercial products, materials, or services in my research.",
    "An Ethical Confederation declaration will be included as part of my research."
  ];

  const handlePrintApplication = (submission) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print the form");
      return;
    }

    const topics = getTopics(submission);
    if (submission.presentation_topic_other && topics.includes("Other")) {
      const idx = topics.indexOf("Other");
      topics[idx] = `Other: ${submission.presentation_topic_other}`;
    }

    const consentText = submission.consent_for_publication || "N/A";
    const currentDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    // Parse declaration data
    let decl = submission.declaration_data || {};
    if (typeof decl === 'string') { try { decl = JSON.parse(decl); } catch { decl = {}; } }

    const declarationStatements = [];
    for (let i = 0; i < DECLARATION_STATEMENTS.length; i++) {
      const response = decl[`declaration_statement_${i}`];
      if (response) {
        declarationStatements.push({
          number: i + 1,
          statement: DECLARATION_STATEMENTS[i],
          response: response === "agree" ? "✓ Agree" : "✗ Disagree",
          responseColor: response === "agree" ? "#065F46" : "#991B1B",
          responseBg: response === "agree" ? "#D1FAE5" : "#FEE2E2"
        });
      }
    }

    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Research Application - ${submission.full_name}</title>
      <style>
        @media print {
          @page { margin: 8mm 6mm; size: A4; }
          @page :first { margin-top: 8mm; }
          body { font-family: 'Arial', sans-serif; line-height: 1.3; color: #000; font-size: 10pt; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          .page-break { page-break-before: always; }
          .no-break { page-break-inside: avoid; }
          .keep-with-next { page-break-after: avoid; }
        }
        body { font-family: 'Arial', sans-serif; line-height: 1.3; color: #000; font-size: 10pt; margin: 0; padding: 0; }
        .container { max-width: 190mm; margin: 0 auto; }
        .print-header { text-align: center; padding-bottom: 4mm; margin-bottom: 4mm; border-bottom: 2px solid #03215F; }
        .title-section h1 { color: #03215F; margin: 0 0 1mm 0; font-size: 16pt; font-weight: bold; }
        .title-section h2 { color: #444; margin: 0; font-size: 11pt; font-weight: normal; }
        .application-info { display: flex; justify-content: space-between; margin-top: 3mm; padding: 2mm; background: #F8F9FA; border-radius: 3px; font-size: 9pt; }
        .compact-section { margin-bottom: 5mm; }
        .section-title { background: #03215F; color: white; padding: 2mm 3mm; margin: 0 0 2mm 0; font-size: 11pt; font-weight: bold; border-radius: 2px; }
        .compact-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
        .compact-table th { background: #E9ECEF; border: 1px solid #DEE2E6; padding: 2mm; text-align: left; font-weight: 600; width: 30%; }
        .compact-table td { border: 1px solid #DEE2E6; padding: 2mm; width: 70%; }
        .compact-table tr:nth-child(even) { background: #F8F9FA; }
        .two-column-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
        .two-column-table td { border: 1px solid #DEE2E6; padding: 2mm; vertical-align: top; width: 50%; }
        .two-column-table .field-label { font-weight: 600; color: #03215F; margin-bottom: 0.5mm; display: block; }
        .two-column-table .field-value { color: #000; min-height: 6mm; }
        .statements-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5mm; margin-bottom: 4mm; }
        .statement-item { border: 1px solid #E2E8F0; padding: 2mm; font-size: 8.5pt; line-height: 1.4; background: #FAFBFC; }
        .statement-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1mm; padding-bottom: 1mm; border-bottom: 1px solid #E2E8F0; }
        .statement-number { background: #03215F; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 8pt; }
        .statement-response { font-weight: 600; font-size: 8.5pt; padding: 0.5mm 1mm; border-radius: 2px; }
        .text-content { background: #F8F9FA; border: 1px solid #DEE2E6; border-radius: 3px; padding: 2mm; font-size: 9.5pt; line-height: 1.4; margin-bottom: 3mm; max-height: 40mm; overflow: hidden; }
        .signature-table { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
        .signature-table td { border: 1px solid #DEE2E6; padding: 2mm; vertical-align: top; }
        .footer { margin-top: 5mm; padding-top: 2mm; border-top: 1px solid #E2E8F0; text-align: center; font-size: 8pt; color: #666; }
        @media print { .no-print { display: none !important; } }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Page 1 -->
        <div class="print-header no-break">
          <div class="title-section">
            <h1>RESEARCH SUBMISSION FORM</h1>
            <h2>Bahrain Dental Society</h2>
          </div>
          <div class="application-info">
            <div><strong>Submission Date:</strong> ${submission.created_at ? new Date(submission.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : 'N/A'}</div>
            <div style="color: #03215F; font-weight: bold;">CONFIDENTIAL</div>
          </div>
        </div>

        <!-- Section 1: Personal Information -->
        <div class="compact-section no-break keep-with-next">
          <div class="section-title">1. PERSONAL INFORMATION</div>
          <table class="two-column-table">
            <tbody>
              <tr>
                <td><span class="field-label">Full Name</span><div class="field-value">${submission.full_name || ""}</div></td>
                <td><span class="field-label">Email Address</span><div class="field-value">${submission.email || ""}</div></td>
              </tr>
              <tr>
                <td><span class="field-label">Phone Number</span><div class="field-value">${submission.country_code || ''} ${submission.phone || ""}</div></td>
                <td><span class="field-label">Country of Practice</span><div class="field-value">${submission.country_of_practice || ""}</div></td>
              </tr>
              <tr>
                <td><span class="field-label">Affiliation / Institution</span><div class="field-value">${submission.affiliation_institution || ""}</div></td>
                <td><span class="field-label">Professional Title</span><div class="field-value">${submission.professional_title || ""}</div></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Section 2: Research Details -->
        <div class="compact-section no-break">
          <div class="section-title">2. RESEARCH DETAILS</div>
          <table class="compact-table">
            <tbody>
              <tr><th>Research Title</th><td>${submission.research_title || ""}</td></tr>
              <tr><th>Category</th><td>${submission.research_category || ""}</td></tr>
              <tr><th>Research Topics</th><td>${topics.length > 0 ? topics.join(", ") : "N/A"}</td></tr>
              <tr><th>Consent for Publication</th><td>${consentText}</td></tr>
              ${submission.external_link ? `<tr><th>External Link</th><td>${submission.external_link}</td></tr>` : ''}
            </tbody>
          </table>
          ${submission.description ? `
          <div style="margin-top: 2mm;">
            <div style="font-weight: 600; margin-bottom: 1mm; color: #03215F;">Description / Abstract</div>
            <div class="text-content">${submission.description}</div>
          </div>` : ''}
          ${submission.bio ? `
          <div style="margin-top: 2mm;">
            <div style="font-weight: 600; margin-bottom: 1mm; color: #03215F;">Professional Bio</div>
            <div class="text-content">${submission.bio}</div>
          </div>` : ''}
        </div>

        <!-- Page Break for Page 2 -->
        <div class="page-break">
          <div style="text-align: center; margin-bottom: 3mm; padding-bottom: 2mm; border-bottom: 1px solid #03215F;">
            <div style="display: inline-block; padding: 1mm 3mm; background: #03215F; color: white; font-weight: bold; font-size: 10pt; border-radius: 2px;">
              NHRA RESEARCHER DECLARATION
            </div>
            <div style="font-size: 9pt; color: #666; margin-top: 1mm;">Page 2 of 2</div>
          </div>

          <!-- Section 3: NHRA Declaration -->
          <div class="compact-section no-break">
            <div class="section-title">3. NHRA DECLARATION DETAILS</div>
            <table class="compact-table">
              <tbody>
                <tr><th>CPD Activity Title</th><td>${decl.declaration_cpd_title || ""}</td></tr>
                <tr><th>Speaker / Researcher Name</th><td>${decl.declaration_speaker_name || ""}</td></tr>
                <tr><th>Presentation / Research Title</th><td>${decl.declaration_presentation_title || ""}</td></tr>
                <tr><th>Presentation / Submission Date</th><td>${decl.declaration_presentation_date || ""}</td></tr>
                <tr><th>Contact Number</th><td>${decl.declaration_contact_number || ""}</td></tr>
                <tr><th>Email Address</th><td>${decl.declaration_email || ""}</td></tr>
              </tbody>
            </table>
            ${decl.declaration_abstract ? `
            <div style="margin-top: 3mm;">
              <div style="font-weight: 600; margin-bottom: 1mm; color: #03215F;">Scientific Content / Abstract</div>
              <div class="text-content">${decl.declaration_abstract}</div>
            </div>` : ''}
          </div>

          <!-- Section 4: Declaration Statements -->
          ${declarationStatements.length > 0 ? `
          <div class="compact-section no-break">
            <div class="section-title">4. DECLARATION STATEMENTS</div>
            <div class="statements-grid">
              ${declarationStatements.map(item => `
                <div class="statement-item">
                  <div class="statement-header">
                    <div class="statement-number">${item.number}</div>
                    <div class="statement-response" style="color: ${item.responseColor}; background: ${item.responseBg};">${item.response}</div>
                  </div>
                  <div>${item.statement.length > 120 ? item.statement.substring(0, 120) + '...' : item.statement}</div>
                </div>
              `).join('')}
            </div>
          </div>` : ''}

          <!-- Section 5: Final Declaration & Signature -->
          <div class="compact-section">
            <div class="section-title">5. FINAL DECLARATION & SIGNATURE</div>
            <table class="signature-table">
              <tbody>
                <tr>
                  <td width="40%"><div style="font-weight: 600; margin-bottom: 1mm;">Researcher Name</div><div style="font-size: 10.5pt; min-height: 6mm;">${decl.declaration_final_speaker_name || ""}</div></td>
                  <td width="30%"><div style="font-weight: 600; margin-bottom: 1mm;">Date</div><div style="font-size: 10.5pt;">${decl.declaration_final_date || ""}</div></td>
                  <td width="30%"><div style="font-weight: 600; margin-bottom: 1mm;">Digital Signature</div><div style="font-size: 10.5pt; font-style: italic; color: #03215F;">${decl.declaration_final_signature || ""}</div></td>
                </tr>
              </tbody>
            </table>
            <div style="margin-top: 4mm; font-size: 9.5pt; line-height: 1.4;">
              <p><strong>Declaration:</strong> I have carefully read and declare that I am the above-mentioned researcher, and I have filled this form to the best of my ability.</p>
            </div>
            <div style="text-align: center; margin-top: 8mm;">
              <div style="font-size: 10pt; margin-top: 1mm;">${submission.full_name || ""}</div>
              <div style="font-size: 9pt; color: #666; margin-top: 0.5mm;">${currentDate}</div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Bahrain Dental Society - Research Submission</strong></p>
            <p>Printed: ${currentDate}</p>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(() => { window.print(); setTimeout(() => { window.close(); }, 500); }, 300);
        };
      </script>
    </body>
    </html>`;

    printWindow.document.write(printContent);
    printWindow.document.close();
    toast.success("📄 Research application form generated for printing");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Research Submissions</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and review research submissions from the public form
          </p>
        </div>
        <button
          onClick={() => { setPagination(p => ({ ...p, page: 1 })); fetchSubmissions(); }}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "bg-blue-50 text-blue-700 border-blue-200", icon: <FileText className="w-5 h-5" /> },
          { label: "Pending", value: stats.pending, color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: <Clock className="w-5 h-5" /> },
          { label: "Approved", value: stats.approved, color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle className="w-5 h-5" /> },
          { label: "Rejected", value: stats.rejected, color: "bg-red-50 text-red-700 border-red-200", icon: <XCircle className="w-5 h-5" /> },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} border rounded-xl p-4 flex items-center gap-3`}>
            {stat.icon}
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs opacity-80">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search by name, email, title..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all"
              />
            </div>
          </form>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, status: e.target.value }));
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all min-w-[150px]"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t">
            <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
            <button
              onClick={() => handleApprove(selectedIds)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              {actionLoading ? "Processing" : "Approve"}
            </button>
            <button
              onClick={() => handleReject(selectedIds)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              {actionLoading ? "Processing" : "Reject"}
            </button>
            <button
              onClick={() => handleDelete(selectedIds)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {actionLoading ? "Processing" : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Submissions Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#03215F]" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No submissions found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="md:hidden p-4 space-y-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {sub.profile_image_url ? (
                        <img src={sub.profile_image_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#03215F]/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-[#03215F]" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{sub.full_name}</p>
                        <p className="text-xs text-gray-500">{sub.email}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(sub.id)}
                      onChange={() => handleSelectOne(sub.id)}
                      className="rounded border-gray-300"
                    />
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900">{sub.research_title}</p>
                    <p className="text-xs text-gray-500">{sub.professional_title || ""}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {sub.research_category || "N/A"}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[sub.status] || STATUS_COLORS.pending}`}>
                      {STATUS_ICONS[sub.status]}
                      {sub.status?.charAt(0).toUpperCase() + sub.status?.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(sub.created_at)}</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => setDetailsModal({ open: true, submission: sub })}
                      className="px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      View
                    </button>
                    {sub.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove([sub.id])}
                          disabled={actionLoading || processingIds.includes(sub.id)}
                          className="px-3 py-2 text-xs text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {processingIds.includes(sub.id) ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject([sub.id])}
                          disabled={actionLoading || processingIds.includes(sub.id)}
                          className="px-3 py-2 text-xs text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                        >
                          {processingIds.includes(sub.id) ? "Rejecting..." : "Reject"}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete([sub.id])}
                      disabled={actionLoading || processingIds.includes(sub.id)}
                      className="px-3 py-2 text-xs text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {processingIds.includes(sub.id) ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === submissions.length && submissions.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Researcher</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Research Title</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(sub.id)}
                        onChange={() => handleSelectOne(sub.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {sub.profile_image_url ? (
                          <img src={sub.profile_image_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#03215F]/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-[#03215F]" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{sub.full_name}</p>
                          <p className="text-xs text-gray-500">{sub.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-900 max-w-[250px] truncate">{sub.research_title}</p>
                      <p className="text-xs text-gray-500">{sub.professional_title || ''}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        {sub.research_category || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[sub.status] || STATUS_COLORS.pending}`}>
                        {STATUS_ICONS[sub.status]}
                        {sub.status?.charAt(0).toUpperCase() + sub.status?.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">{formatDate(sub.created_at)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setDetailsModal({ open: true, submission: sub })}
                          className="p-2 text-gray-500 hover:text-[#03215F] hover:bg-[#03215F]/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {sub.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove([sub.id])}
                              disabled={actionLoading || processingIds.includes(sub.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              {processingIds.includes(sub.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleReject([sub.id])}
                              disabled={actionLoading || processingIds.includes(sub.id)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              {processingIds.includes(sub.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete([sub.id])}
                          disabled={actionLoading || processingIds.includes(sub.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {processingIds.includes(sub.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="p-2 border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700 px-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {detailsModal.open && detailsModal.submission && (() => {
        const sub = detailsModal.submission;
        let decl = sub.declaration_data || {};
        if (typeof decl === 'string') { try { decl = JSON.parse(decl); } catch { decl = {}; } }
        return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#03215F] to-[#AE9B66] p-5 text-white shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Research Submission Details</h2>
                  <p className="text-white/80 text-sm mt-0.5">
                    Submitted on {formatDate(sub.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintApplication(sub)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="Print Declaration Form"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setDetailsModal({ open: false, submission: null })}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${STATUS_COLORS[sub.status]}`}>
                  {STATUS_ICONS[sub.status]}
                  {sub.status?.charAt(0).toUpperCase() + sub.status?.slice(1)}
                </span>
                {sub.rejection_reason && (
                  <span className="text-sm text-red-600">
                    Reason: {sub.rejection_reason}
                  </span>
                )}
              </div>

              {/* Profile Section */}
              <div className="flex items-start gap-4">
                {sub.profile_image_url ? (
                  <img src={sub.profile_image_url} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#03215F]/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-[#03215F]" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{sub.full_name}</h3>
                  <p className="text-sm text-gray-600">{sub.professional_title || 'N/A'}</p>
                  {sub.bio && (
                    <p className="text-sm text-gray-500 mt-1">{sub.bio}</p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a href={`mailto:${sub.email}`} className="text-sm text-[#03215F] hover:underline">{sub.email}</a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{sub.country_code} {sub.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Institution</p>
                    <p className="text-sm text-gray-900">{sub.affiliation_institution || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Country</p>
                    <p className="text-sm text-gray-900">{sub.country_of_practice || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Research Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#03215F]" />
                  Research Details
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Research Title</p>
                    <p className="text-sm font-medium text-gray-900">{sub.research_title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Category</p>
                      <p className="text-sm text-gray-900">{sub.research_category || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Consent for Publication</p>
                      <p className="text-sm text-gray-900">{sub.consent_for_publication || 'N/A'}</p>
                    </div>
                  </div>
                  {sub.description && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Description / Abstract</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{sub.description}</p>
                    </div>
                  )}
                  {sub.external_link && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">External Link</p>
                      <a href={sub.external_link} target="_blank" rel="noopener noreferrer" className="text-sm text-[#03215F] hover:underline flex items-center gap-1">
                        {sub.external_link} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Topics */}
              {getTopics(sub).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#03215F]" />
                    Research Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getTopics(sub).map((topic, i) => (
                      <span key={i} className="px-3 py-1 bg-[#03215F]/10 text-[#03215F] text-xs font-medium rounded-full">{topic}</span>
                    ))}
                    {sub.presentation_topic_other && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                        Other: {sub.presentation_topic_other}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Files */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <File className="w-4 h-4 text-[#03215F]" />
                  Uploaded Files
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sub.research_document_url && (
                    <a href={sub.research_document_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-green-900">Research Document</p><p className="text-xs text-green-600">Click to view / download</p></div>
                      <Download className="w-4 h-4 text-green-500" />
                    </a>
                  )}
                  {sub.abstract_url && (
                    <a href={sub.abstract_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-blue-900">Abstract</p><p className="text-xs text-blue-600">Click to view / download</p></div>
                      <Download className="w-4 h-4 text-blue-500" />
                    </a>
                  )}
                  {sub.featured_image_url && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-2">Featured Image</p>
                      <img src={sub.featured_image_url} alt="Featured" className="w-full h-40 object-cover rounded-lg border" />
                    </div>
                  )}
                  {!sub.abstract_url && !sub.research_document_url && !sub.featured_image_url && (
                    <p className="text-sm text-gray-400 col-span-2">No files uploaded</p>
                  )}
                </div>
              </div>

              {/* NHRA Declaration Data */}
              {Object.keys(decl).length > 0 && (
                <div className="border-2 border-[#03215F]/20 rounded-xl overflow-hidden">
                  <div className="bg-[#03215F] p-3 text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <h4 className="text-sm font-bold">NHRA Declaration Form</h4>
                  </div>
                  <div className="p-4 space-y-4 bg-gray-50/50">
                    {/* Declaration Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { label: 'CPD Activity Title', value: decl.declaration_cpd_title },
                        { label: 'Speaker / Researcher Name', value: decl.declaration_speaker_name },
                        { label: 'Presentation / Research Title', value: decl.declaration_presentation_title },
                        { label: 'Presentation / Submission Date', value: decl.declaration_presentation_date },
                        { label: 'Contact Number', value: decl.declaration_contact_number },
                        { label: 'Email', value: decl.declaration_email },
                      ].map((field, i) => (
                        <div key={i} className="p-2.5 bg-white rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500">{field.label}</p>
                          <p className="text-sm text-gray-900 font-medium">{field.value || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                    {decl.declaration_abstract && (
                      <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500">Abstract / Summary</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap mt-0.5">{decl.declaration_abstract}</p>
                      </div>
                    )}

                    {/* Declaration Statements */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Declaration Statements</p>
                      <div className="grid grid-cols-1 gap-2">
                        {DECLARATION_STATEMENTS.map((statement, idx) => {
                          const response = decl[`declaration_statement_${idx}`];
                          return (
                            <div key={idx} className={`p-3 rounded-lg border ${response === 'agree' ? 'bg-green-50/70 border-green-200' : response === 'disagree' ? 'bg-red-50/70 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-[#03215F] text-white text-[10px] flex items-center justify-center shrink-0 font-bold">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs font-semibold text-gray-600">Statement {idx + 1}</span>
                                </div>
                                <span className={`text-[11px] font-bold px-2 py-1 rounded self-start ${response === 'agree' ? 'text-green-700 bg-green-100' : response === 'disagree' ? 'text-red-700 bg-red-100' : 'text-gray-500 bg-gray-100'}`}>
                                  {response === 'agree' ? '✓ Agree' : response === 'disagree' ? '✗ Disagree' : '—'}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-gray-700 leading-relaxed">{statement}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Signature */}
                    <div className="border-t pt-3">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Digital Signature</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500">Full Name</p>
                          <p className="text-sm text-gray-900 font-medium">{decl.declaration_final_speaker_name || 'N/A'}</p>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm text-gray-900 font-medium">{decl.declaration_final_date || 'N/A'}</p>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500">Signature</p>
                          <p className="text-sm text-[#03215F] font-medium italic">{decl.declaration_final_signature || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-gray-50 shrink-0">
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setDetailsModal({ open: false, submission: null })}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePrintApplication(sub)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-[#03215F] text-[#03215F] rounded-lg hover:bg-[#03215F]/5 transition-colors text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Print Declaration Form
                </button>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {sub.status === "pending" && (
                  <>
                    <button
                      onClick={() => { handleApprove([sub.id]); setDetailsModal({ open: false, submission: null }); }}
                      disabled={actionLoading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => { handleReject([sub.id]); setDetailsModal({ open: false, submission: null }); }}
                      disabled={actionLoading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => { handleDelete([sub.id]); setDetailsModal({ open: false, submission: null }); }}
                  disabled={actionLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
