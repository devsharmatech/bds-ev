"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Mail,
  FileText,
  X,
  Loader2,
  Printer,
  Users,
  Calendar,
  Building,
  Globe,
  Briefcase,
  UserCheck,
  FileCheck,
  Shield,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";

// NHRA Declaration Statements
const NHRA_STATEMENTS = [
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
];

export default function SpeakerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [filters, setFilters] = useState({
    event_id: "",
    status: "",
    search: "",
    category: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    request: null,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState(false);
  
  const PARTICIPANT_CATEGORIES = [
    "VIP",
    "Delegate",
    "Speaker",
    "Organizer",
    "Participant",
    "Exhibitor",
    "Sponsor",
  ];

  const STATUS_COLORS = {
    pending: "bg-yellow-50 border-yellow-200 text-yellow-800",
    approved: "bg-green-50 border-green-200 text-green-800",
    rejected: "bg-red-50 border-red-200 text-red-800",
    confirmed: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const CATEGORY_COLORS = {
    VIP: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200",
    Delegate: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200",
    Speaker: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200",
    Organizer: "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200",
    Participant: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200",
    Exhibitor: "bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-800 border-indigo-200",
    Sponsor: "bg-gradient-to-r from-rose-100 to-red-100 text-rose-800 border-rose-200",
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/event/public?limit=100&isUpcoming=false");
      const data = await res.json();
      if (data.events) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
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

      const res = await fetch(`/api/admin/speaker-requests?${params}`);
      const data = await res.json();

      if (data.success) {
        setRequests(data.requests || []);
        setPagination((prev) => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 1,
        }));
      } else {
        toast.error(data.message || "Failed to load speaker requests");
      }
    } catch (error) {
      toast.error("Failed to load speaker requests");
    } finally {
      setLoading(false);
    }
  }, [
    filters.event_id,
    filters.status,
    filters.category,
    filters.search,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    fetchEvents();
    fetchRequests();
  }, [fetchRequests]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchRequests();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRequests(requests.map((r) => r.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedRequests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleApprove = async (ids) => {
    if (!ids.length) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/speaker-requests/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`✅ ${ids.length} request(s) approved successfully!`, {
          icon: '🎉',
          duration: 3000,
        });
        setSelectedRequests([]);
        fetchRequests();
      } else {
        toast.error(data.message || "Failed to approve");
      }
    } catch (error) {
      toast.error("Failed to approve requests");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (ids) => {
    if (!ids.length) return;
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return; // User cancelled
    
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/speaker-requests/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`❌ ${ids.length} request(s) rejected`, {
          duration: 3000,
        });
        setSelectedRequests([]);
        fetchRequests();
      } else {
        toast.error(data.message || "Failed to reject");
      }
    } catch (error) {
      toast.error("Failed to reject requests");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (ids) => {
    if (!ids.length) return;
    if (!window.confirm(`Are you sure you want to delete ${ids.length} request(s)? This action cannot be undone.`))
      return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/speaker-requests/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`🗑️ ${ids.length} request(s) deleted`, {
          duration: 3000,
        });
        setSelectedRequests([]);
        fetchRequests();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete requests");
    } finally {
      setActionLoading(false);
    }
  };

  // Function to print the full application form
  const handlePrintApplication = (request) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print the form");
      return;
    }

    // Get the event
    const event = events.find((e) => e.id === request.event_id) || {};
    
    // Format topics
    const topics = Array.isArray(request.presentation_topics) 
      ? [...request.presentation_topics]
      : request.presentation_topics 
        ? JSON.parse(request.presentation_topics) 
        : [];
    
    if (request.presentation_topic_other && topics.includes("Other")) {
      const otherIndex = topics.indexOf("Other");
      topics[otherIndex] = `Other: ${request.presentation_topic_other}`;
    }

    // Format consent
    const consentText = request.consent_for_publication === "agree" 
      ? "✓ Yes, I agree to publication" 
      : "✗ No, I do not agree to publication";

    // Get current date
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate application ID
    const generateApplicationId = () => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `APP-${timestamp.slice(-6)}-${random}`;
    };
    
    const applicationId = generateApplicationId();

    // Parse declaration statements
    const declarationStatements = [];
    for (let i = 0; i < NHRA_STATEMENTS.length; i++) {
      const statementKey = `declaration_statement_${i}`;
      const response = request[statementKey];
      if (response) {
        declarationStatements.push({
          number: i + 1,
          statement: NHRA_STATEMENTS[i],
          response: response === "agree" ? "✓ Agree" : "✗ Disagree",
          responseColor: response === "agree" ? "#065F46" : "#991B1B",
          responseBg: response === "agree" ? "#D1FAE5" : "#FEE2E2"
        });
      }
    }

    // Create HTML content for printing
    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Speaker Application Form - ${request.full_name}</title>
      <style>
        @media print {
          @page {
            margin: 8mm 6mm;
            size: A4;
          }
          @page :first {
            margin-top: 8mm;
          }
          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            line-height: 1.3;
            color: #000;
            font-size: 10pt;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
          }
          .page-break {
            page-break-before: always;
          }
          .no-break {
            page-break-inside: avoid;
          }
          .keep-with-next {
            page-break-after: avoid;
          }
        }
        
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          line-height: 1.3;
          color: #000;
          font-size: 10pt;
          margin: 0;
          padding: 0;
        }
        
        .container {
          max-width: 190mm;
          margin: 0 auto;
        }
        
        /* Header */
        .print-header {
          text-align: center;
          padding-bottom: 4mm;
          margin-bottom: 4mm;
          border-bottom: 2px solid #03215F;
        }
        
        .title-section h1 {
          color: #03215F;
          margin: 0 0 1mm 0;
          font-size: 16pt;
          font-weight: bold;
        }
        
        .title-section h2 {
          color: #444;
          margin: 0;
          font-size: 11pt;
          font-weight: normal;
        }
        
        .application-info {
          display: flex;
          justify-content: space-between;
          margin-top: 3mm;
          padding: 2mm;
          background: #F8F9FA;
          border-radius: 3px;
          font-size: 9pt;
        }
        
        .info-left {
          font-weight: 500;
        }
        
        .info-right {
          color: #03215F;
          font-weight: bold;
        }
        
        /* Compact Table */
        .compact-section {
          margin-bottom: 5mm;
        }
        
        .section-title {
          background: #03215F;
          color: white;
          padding: 2mm 3mm;
          margin: 0 0 2mm 0;
          font-size: 11pt;
          font-weight: bold;
          border-radius: 2px;
        }
        
        .compact-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9.5pt;
        }
        
        .compact-table th {
          background: #E9ECEF;
          border: 1px solid #DEE2E6;
          padding: 2mm;
          text-align: left;
          font-weight: 600;
          width: 30%;
        }
        
        .compact-table td {
          border: 1px solid #DEE2E6;
          padding: 2mm;
          width: 70%;
        }
        
        .compact-table tr:nth-child(even) {
          background: #F8F9FA;
        }
        
        /* Two Column Layout for Personal Info */
        .two-column-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9.5pt;
        }
        
        .two-column-table td {
          border: 1px solid #DEE2E6;
          padding: 2mm;
          vertical-align: top;
          width: 50%;
        }
        
        .two-column-table .field-label {
          font-weight: 600;
          color: #03215F;
          margin-bottom: 0.5mm;
          display: block;
        }
        
        .two-column-table .field-value {
          color: #000;
          min-height: 6mm;
        }
        
        /* Statements Grid */
        .statements-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5mm;
          margin-bottom: 4mm;
        }
        
        .statement-item {
          border: 1px solid #E2E8F0;
          padding: 2mm;
          font-size: 8.5pt;
          line-height: 1.4;
          background: #FAFBFC;
        }
        
        .statement-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1mm;
          padding-bottom: 1mm;
          border-bottom: 1px solid #E2E8F0;
        }
        
        .statement-number {
          background: #03215F;
          color: white;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 8pt;
        }
        
        .statement-response {
          font-weight: 600;
          font-size: 8.5pt;
          padding: 0.5mm 1mm;
          border-radius: 2px;
        }
        
        /* Bio and Abstract */
        .text-content {
          background: #F8F9FA;
          border: 1px solid #DEE2E6;
          border-radius: 3px;
          padding: 2mm;
          font-size: 9.5pt;
          line-height: 1.4;
          margin-bottom: 3mm;
          max-height: 40mm;
          overflow: hidden;
        }
        
        /* Signature Section */
        .signature-section {
          margin-top: 5mm;
          padding-top: 3mm;
          border-top: 2px dashed #DEE2E6;
        }
        
        .signature-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 4mm;
        }
        
        .signature-table td {
          border: 1px solid #DEE2E6;
          padding: 2mm;
          vertical-align: top;
        }
        
        .signature-line {
          margin-top: 8mm;
          border-top: 1px solid #000;
          width: 80mm;
          text-align: center;
          padding-top: 1mm;
          font-size: 9pt;
        }
        
        /* Footer */
        .footer {
          margin-top: 5mm;
          padding-top: 2mm;
          border-top: 1px solid #E2E8F0;
          text-align: center;
          font-size: 8pt;
          color: #666;
        }
        
        /* Print Button */
        .print-button {
          display: none;
        }
        
        @media print {
          .print-button {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Page 1 -->
        <div class="print-header no-break">
          <div class="title-section">
            <h1>SPEAKER APPLICATION FORM</h1>
            <h2>${event.title || "Event"}</h2>
          </div>
          
          <div class="application-info">
            <div class="info-left">
              
              <strong>Submission Date:</strong> ${new Date(request.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </div>
            <div class="info-right">
              CONFIDENTIAL
            </div>
          </div>
        </div>
        
        <!-- Section 1: Personal Information -->
        <div class="compact-section no-break keep-with-next">
          <div class="section-title">1. PERSONAL INFORMATION</div>
          
          <table class="two-column-table">
            <tbody>
              <tr>
                <td>
                  <span class="field-label">Full Name</span>
                  <div class="field-value">${request.full_name || ""}</div>
                </td>
                <td>
                  <span class="field-label">Email Address</span>
                  <div class="field-value">${request.email || ""}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <span class="field-label">Phone Number</span>
                  <div class="field-value">${request.phone || ""}</div>
                </td>
                <td>
                  <span class="field-label">Country of Practice</span>
                  <div class="field-value">${request.country_of_practice || ""}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <span class="field-label">Affiliation / Institution</span>
                  <div class="field-value">${request.affiliation_institution || ""}</div>
                </td>
                <td>
                  <span class="field-label">Professional Title</span>
                  <div class="field-value">${request.professional_title || ""}</div>
                </td>
              </tr>
              <tr>
                <td colspan="2">
                  <span class="field-label">Category</span>
                  <div class="field-value">${request.category || ""}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Section 2: Presentation Details -->
        <div class="compact-section no-break">
          <div class="section-title">2. PRESENTATION DETAILS</div>
          
          <table class="compact-table">
            <tbody>
              <tr>
                <th>Presentation Topics</th>
                <td>${topics.length > 0 ? topics.join(", ") : ""}</td>
              </tr>
              <tr>
                <th>Consent for Publication</th>
                <td>${consentText}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 2mm;">
            <div style="font-weight: 600; margin-bottom: 1mm; color: #03215F;">Professional Bio</div>
            <div class="text-content">${request.bio || ""}</div>
          </div>
        </div>
        
        <!-- Page Break for Page 2 -->
        <div class="page-break">
          <!-- NHRA Header for Page 2 -->
          <div style="text-align: center; margin-bottom: 3mm; padding-bottom: 2mm; border-bottom: 1px solid #03215F;">
            <div style="display: inline-block; padding: 1mm 3mm; background: #03215F; color: white; font-weight: bold; font-size: 10pt; border-radius: 2px;">
              NHRA SPEAKER DECLARATION
            </div>
            <div style="font-size: 9pt; color: #666; margin-top: 1mm;">
               Page 2 of 2
            </div>
          </div>
          
          <!-- Section 3: NHRA Declaration -->
          <div class="compact-section no-break">
            <div class="section-title">3. NHRA DECLARATION DETAILS</div>
            
            <table class="compact-table">
              <tbody>
                <tr>
                  <th>CPD Activity Title</th>
                  <td>${request.declaration_cpd_title || ""}</td>
                </tr>
                <tr>
                  <th>Speaker Name</th>
                  <td>${request.declaration_speaker_name || ""}</td>
                </tr>
                <tr>
                  <th>Presentation Title</th>
                  <td>${request.declaration_presentation_title || ""}</td>
                </tr>
                <tr>
                  <th>Presentation Date</th>
                  <td>${request.declaration_presentation_date || ""}</td>
                </tr>
                <tr>
                  <th>Contact Number</th>
                  <td>${request.declaration_contact_number || ""}</td>
                </tr>
                <tr>
                  <th>Email Address</th>
                  <td>${request.declaration_email || ""}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="margin-top: 3mm;">
              <div style="font-weight: 600; margin-bottom: 1mm; color: #03215F;">Scientific Content / Abstract</div>
              <div class="text-content">${request.declaration_abstract || ""}</div>
            </div>
          </div>
          
          <!-- Section 4: Declaration Statements -->
          <div class="compact-section no-break">
            <div class="section-title">4. DECLARATION STATEMENTS</div>
            
            <div class="statements-grid">
              ${declarationStatements.map(item => `
                <div class="statement-item">
                  <div class="statement-header">
                    <div class="statement-number">${item.number}</div>
                    <div class="statement-response" style="color: ${item.responseColor}; background: ${item.responseBg};">
                      ${item.response}
                    </div>
                  </div>
                  <div class="statement-content">${item.statement}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Section 5: Final Declaration & Signature -->
          <div class="compact-section">
            <div class="section-title">5. FINAL DECLARATION & SIGNATURE</div>
            
            <table class="signature-table">
              <tbody>
                <tr>
                  <td width="40%">
                    <div style="font-weight: 600; margin-bottom: 1mm;">Speaker Name</div>
                    <div style="font-size: 10.5pt; min-height: 6mm;">${request.declaration_final_speaker_name || ""}</div>
                  </td>
                  <td width="30%">
                    <div style="font-weight: 600; margin-bottom: 1mm;">Date</div>
                    <div style="font-size: 10.5pt;">${request.declaration_final_date || ""}</div>
                  </td>
                  <td width="30%">
                    <div style="font-weight: 600; margin-bottom: 1mm;">Digital Signature</div>
                    <div style="font-size: 10.5pt; font-style: italic; color: #03215F;">${request.declaration_final_signature || ""}</div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div style="margin-top: 4mm; font-size: 9.5pt; line-height: 1.4;">
              <p><strong>Declaration:</strong> I have carefully read and declare that I am the above-mentioned speaker, and I have filled this form to the best of my ability.</p>
            </div>
            
            <div style="text-align: center; margin-top: 8mm;">
              
              <div style="font-size: 10pt; margin-top: 1mm;">
                ${request.full_name || ""}
              </div>
              <div style="font-size: 9pt; color: #666; margin-top: 0.5mm;">
                ${currentDate}
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p><strong>NHRA Speaker Application System</strong></p>
            <p>${event.title || "Event"} | Application ID: ${applicationId} | Printed: ${currentDate}</p>
            <div class="print-button">
              <button onclick="window.print()" style="
                background: #03215F;
                color: white;
                border: none;
                padding: 6px 16px;
                border-radius: 3px;
                cursor: pointer;
                margin: 10px 0;
                font-size: 10pt;
                font-weight: 600;
              ">
                Print This Form
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        // Auto-print when the print window loads
        window.onload = function() {
          setTimeout(() => {
            window.print();
            setTimeout(() => {
              window.close();
            }, 500);
          }, 300);
        };
      </script>
    </body>
    </html>
    `;

    // Write content to print window
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    toast.success("📄 Application form generated for printing");
  };

  // ... (keep all other existing functions: handlePrintBadge, getStatusBadge, getCategoryBadge, StatsCard)

  const handlePrintBadge = (request) => {
    const event = events.find((e) => e.id === request.event_id);
    if (!event) {
      toast.error("Event information not found");
      return;
    }

    const printWindow = window.open("", "_blank", "width=800,height=600");
    const badgeHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Speaker Badge - ${request.full_name}</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 0; }
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 20px;
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
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 30px;
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
            .qr-section {
              display: flex;
              justify-content: center;
            }
            .qr-container {
              background: white;
              padding: 8px;
              border-radius: 12px;
            }
          </style>
        </head>
        <body>
          <div class="badge-container">
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
              <div class="category">${(request.category || "SPEAKER").toUpperCase()}</div>
            </div>
            <div class="speaker-info">
              <div class="speaker-name">${request.full_name.toUpperCase()}</div>
              <div class="speaker-title-text">${request.professional_title || "Professional Speaker"}</div>
              <div class="speaker-designation">${request.affiliation_institution || ""}</div>
            </div>
            <div class="event-info">
              <div class="event-title">${event.title}</div>
              <div class="event-details">
                <div>${new Date(event.start_datetime).toLocaleDateString("en-BH", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</div>
                ${event.venue_name ? `<div>${event.venue_name}</div>` : ""}
              </div>
            </div>
            <div class="qr-section">
              <div class="qr-container" id="qr-container"></div>
            </div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
          <script>
            const qrData = JSON.stringify({
              type: 'SPEAKER_VERIFICATION',
              speaker_id: '${request.id}',
              speaker_name: '${request.full_name}',
              event_id: '${event.id}',
              event_title: '${event.title}'
            });
            
            const qr = qrcode(0, 'M');
            qr.addData(qrData);
            qr.make();
            
            document.getElementById('qr-container').innerHTML = qr.createImgTag(3, 4);
            
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 1000);
            }, 1000);
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(badgeHTML);
    printWindow.document.close();
    toast.success("📄 Speaker badge generated for printing");
  };

  const getStatusBadge = (status) => {
    return (
      <span style={{width:"fit-content"}} className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${STATUS_COLORS[status] || "bg-gray-100 text-gray-800 border-gray-200"} flex items-center gap-1.5`}>
        {status === "approved" && <CheckCircle className="w-3 h-3" />}
        {status === "rejected" && <XCircle className="w-3 h-3" />}
        {status === "pending" && <Loader2 className="w-3 h-3 animate-spin" />}
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    return (
      <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${CATEGORY_COLORS[category] || "bg-gray-100 text-gray-800"} uppercase tracking-wide`}>
        {category || "N/A"}
      </span>
    );
  };

  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-[#03215F] to-[#1a3a8f] bg-clip-text text-transparent">
              Speaker Requests
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and review speaker applications for events
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRequests}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Requests"
            value={pagination.total}
            icon={Users}
            color="bg-blue-100 text-blue-600"
          />
          <StatsCard
            title="Pending"
            value={requests.filter(r => r.status === "pending").length}
            icon={Loader2}
            color="bg-yellow-100 text-yellow-600"
          />
          <StatsCard
            title="Approved"
            value={requests.filter(r => r.status === "approved").length}
            icon={CheckCircle}
            color="bg-green-100 text-green-600"
          />
          <StatsCard
            title="Rejected"
            value={requests.filter(r => r.status === "rejected").length}
            icon={XCircle}
            color="bg-red-100 text-red-600"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border mb-6 overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h2>
            <button
              onClick={() => setExpandedFilters(!expandedFilters)}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              {expandedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expandedFilters ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>
        
        <div className={`p-6 ${expandedFilters ? 'block' : 'hidden md:block'}`}>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <select
                value={filters.event_id}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, event_id: e.target.value }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent bg-white appearance-none"
              >
                <option value="">All Events</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, status: e.target.value }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent bg-white appearance-none"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <select
                value={filters.category}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, category: e.target.value }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent bg-white appearance-none"
              >
                <option value="">All Categories</option>
                {PARTICIPANT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-4 flex gap-3">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#1a3a8f] text-white rounded-xl hover:from-[#021845] hover:to-[#03215F] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"
              >
                <Filter className="w-4 h-4" />
                Apply Filters
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    event_id: "",
                    status: "",
                    search: "",
                    category: "",
                  });
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-800">
                  {selectedRequests.length} request(s) selected
                </p>
                <p className="text-sm text-blue-600">
                  Choose an action to perform on selected requests
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleApprove(selectedRequests)}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => handleReject(selectedRequests)}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => handleDelete(selectedRequests)}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-gradient-to-r from-gray-500 to-slate-600 text-white rounded-lg hover:from-gray-600 hover:to-slate-700 transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRequests.length === requests.length && requests.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#03215F] focus:ring-[#03215F]"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Speaker
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Event & Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Category & Status
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 animate-spin text-[#03215F]" />
                      <p className="text-gray-600">Loading speaker requests...</p>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <Users className="w-12 h-12 opacity-50" />
                      <p className="text-lg">No speaker requests found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={() => handleSelectOne(request.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#03215F] focus:ring-[#03215F]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                          <span className="font-bold text-[#03215F] text-sm">
                            {request.full_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{request.full_name}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {request.professional_title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 truncate max-w-[200px]" title={request.events?.title}>
                        {request.events?.title || "N/A"}
                      </p>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-sm text-gray-600 flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          {request.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(request.created_at).toLocaleDateString("en-BH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div>{getCategoryBadge(request.category)}</div>
                        <div>{getStatusBadge(request.status)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setDetailsModal({ open: true, request })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {request.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove([request.id])}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject([request.id])}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {request.status === "approved" && (
                          <button
                            onClick={() => handlePrintBadge(request)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Print Badge"
                          >
                            <Printer className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete([request.id])}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
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
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                <span className="font-semibold">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                of <span className="font-semibold">{pagination.total}</span> results
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                        className={`w-10 h-10 rounded-lg transition-colors ${pagination.page === pageNum
                            ? "bg-[#03215F] text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal (3xl) */}
      {detailsModal.open && detailsModal.request && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-7xl my-8 shadow-2xl max-h-[90vh] overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#03215F] via-[#1a3a8f] to-[#03215F] px-8 py-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Speaker Request Details</h3>
                  <p className="text-white/90 text-sm mt-1">
                    Review and manage this speaker application
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModal({ open: false, request: null })}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Print Button */}
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => handlePrintApplication(detailsModal.request)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-3 font-semibold"
                >
                  <Printer className="w-5 h-5" />
                  Print Full Application
                </button>
              </div>

              {/* Main Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h4 className="text-lg font-bold text-[#03215F] mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Full Name</label>
                        <p className="font-semibold text-gray-900 text-lg">
                          {detailsModal.request.full_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="font-semibold text-gray-900">{detailsModal.request.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <p className="font-semibold text-gray-900">{detailsModal.request.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Category</label>
                        <div className="flex items-center gap-2">
                          <select
                            className="font-semibold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                            value={detailsModal.request.category || ""}
                            onChange={async (e) => {
                              const newCategory = e.target.value;
                              const originalCategory = detailsModal.request.category;
                              
                              setDetailsModal((modal) => ({
                                ...modal,
                                request: { ...modal.request, category: newCategory },
                              }));
                              
                              try {
                                const res = await fetch(
                                  `/api/admin/speaker-requests/update-category`,
                                  {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      id: detailsModal.request.id,
                                      category: newCategory,
                                    }),
                                  },
                                );
                                
                                const data = await res.json();
                                if (data.success) {
                                  toast.success(`✅ Category updated from "${originalCategory}" to "${newCategory}"`, {
                                    duration: 3000,
                                    icon: '🎯',
                                    style: {
                                      background: '#10B981',
                                      color: 'white',
                                    },
                                  });
                                  fetchRequests(); // Refresh the list
                                } else {
                                  toast.error(data.message || "Failed to update category");
                                  // Revert on error
                                  setDetailsModal((modal) => ({
                                    ...modal,
                                    request: { ...modal.request, category: originalCategory },
                                  }));
                                }
                              } catch (err) {
                                toast.error("Failed to update category");
                                setDetailsModal((modal) => ({
                                  ...modal,
                                  request: { ...modal.request, category: originalCategory },
                                }));
                              }
                            }}
                          >
                            <option value="">Select Category</option>
                            {PARTICIPANT_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          {getCategoryBadge(detailsModal.request.category)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                    <h4 className="text-lg font-bold text-[#03215F] mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Professional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Professional Title</label>
                        <p className="font-semibold text-gray-900">
                          {detailsModal.request.professional_title}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Status</label>
                        <div className="mt-1">{getStatusBadge(detailsModal.request.status)}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Affiliation/Institution</label>
                        <p className="font-semibold text-gray-900">
                          {detailsModal.request.affiliation_institution || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Country of Practice</label>
                        <p className="font-semibold text-gray-900">
                          {detailsModal.request.country_of_practice || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Files */}
                  {(detailsModal.request.abstract_form_url || detailsModal.request.article_presentation_url) && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                      <h4 className="text-lg font-bold text-[#03215F] mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Attached Files
                      </h4>
                      <div className="space-y-3">
                        {detailsModal.request.abstract_form_url && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/speaker-documents/${detailsModal.request.abstract_form_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-amber-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-amber-600" />
                              <div>
                                <p className="font-medium">Abstract Form</p>
                                <p className="text-sm text-gray-500">Click to download</p>
                              </div>
                            </div>
                            <Download className="w-4 h-4 text-gray-400" />
                          </a>
                        )}
                        {detailsModal.request.article_presentation_url && (
                          <a
                            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/speaker-documents/${detailsModal.request.article_presentation_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-amber-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileCheck className="w-5 h-5 text-amber-600" />
                              <div>
                                <p className="font-medium">Article/Presentation</p>
                                <p className="text-sm text-gray-500">Click to download</p>
                              </div>
                            </div>
                            <Download className="w-4 h-4 text-gray-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Profile Image & Bio */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h4 className="text-lg font-bold text-[#03215F] mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Speaker Profile
                    </h4>
                    <div className="flex flex-col md:flex-row gap-6">
                      {detailsModal.request.profile_image_url && (
                        <div className="flex-shrink-0">
                          <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
                            <img
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/speaker-documents/${detailsModal.request.profile_image_url}`}
                              alt="Speaker Profile"
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                      )}
                      {detailsModal.request.bio && (
                        <div className="flex-1">
                          <label className="text-sm text-gray-600">Professional Bio</label>
                          <p className="font-medium text-gray-700 mt-2 whitespace-pre-line leading-relaxed">
                            {detailsModal.request.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Topics & Consent */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                    <h4 className="text-lg font-bold text-[#03215F] mb-4 flex items-center gap-2">
                      <FileCheck className="w-5 h-5" />
                      Presentation Details
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">Presentation Topics</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Array.isArray(detailsModal.request.presentation_topics) 
                            ? detailsModal.request.presentation_topics.map((topic, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1.5 bg-white text-blue-800 text-sm font-medium rounded-full border border-blue-200 shadow-sm"
                                >
                                  {topic}
                                </span>
                              ))
                            : detailsModal.request.presentation_topics 
                              ? JSON.parse(detailsModal.request.presentation_topics).map((topic, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1.5 bg-white text-blue-800 text-sm font-medium rounded-full border border-blue-200 shadow-sm"
                                  >
                                    {topic}
                                  </span>
                                ))
                              : null
                          }
                        </div>
                        {detailsModal.request.presentation_topic_other && (
                          <p className="mt-3 text-sm text-gray-700">
                            <span className="font-medium">Other:</span> {detailsModal.request.presentation_topic_other}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Consent for Publication</label>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mt-2 ${detailsModal.request.consent_for_publication === "agree"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                          }`}>
                          {detailsModal.request.consent_for_publication === "agree" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span className="font-medium capitalize">
                            {detailsModal.request.consent_for_publication || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h4 className="text-lg font-bold text-[#03215F] mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Application Timeline
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Applied On</span>
                        <span className="font-medium text-gray-900">
                          {new Date(detailsModal.request.created_at).toLocaleString("en-BH", {
                            timeZone: "Asia/Bahrain",
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      {detailsModal.request.rejection_reason && (
                        <div>
                          <label className="text-sm text-gray-600">Rejection Reason</label>
                          <p className="font-medium text-red-600 mt-1 bg-red-50 p-3 rounded-lg">
                            {detailsModal.request.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Speaker Declaration Form (if exists) */}
              {(detailsModal.request.declaration_cpd_title ||
                detailsModal.request.declaration_speaker_name) && (
                <div className="mt-8 border-t pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-bold text-[#03215F] flex items-center gap-2">
                      <Shield className="w-6 h-6" />
                      Speaker Declaration Form (NHRA)
                    </h4>
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      NHRA Certified
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">CPD Activity Title</label>
                        <p className="font-medium">{detailsModal.request.declaration_cpd_title || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Presentation Title</label>
                        <p className="font-medium">
                          {detailsModal.request.declaration_presentation_title || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Presentation Date</label>
                        <p className="font-medium">
                          {detailsModal.request.declaration_presentation_date || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">Speaker Name</label>
                        <p className="font-medium">
                          {detailsModal.request.declaration_speaker_name || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Contact Number</label>
                        <p className="font-medium">
                          {detailsModal.request.declaration_contact_number || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email Address</label>
                        <p className="font-medium">{detailsModal.request.declaration_email || "-"}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Abstract */}
                  {detailsModal.request.declaration_abstract && (
                    <div className="mt-6">
                      <label className="text-sm font-medium text-gray-700">Scientific Content / Abstract</label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                        <p className="text-gray-700 whitespace-pre-line">{detailsModal.request.declaration_abstract}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* NHRA Declaration Statements */}
                  <div className="mt-8">
                    <h5 className="text-lg font-semibold text-gray-800 mb-4">NHRA Declaration Statements</h5>
                    <div className="space-y-3">
                      {NHRA_STATEMENTS.map((statement, index) => {
                        const response = detailsModal.request[`declaration_statement_${index}`];
                        return (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  response === 'agree' 
                                    ? 'bg-green-100 text-green-800' 
                                    : response === 'disagree'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {response === 'agree' ? '✓ Agree' : response === 'disagree' ? '✗ Disagree' : 'Not Answered'}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm">{statement}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Final Declaration */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <h5 className="text-lg font-semibold text-gray-800 mb-4">Final Declaration</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Speaker Name</label>
                        <p className="font-semibold text-gray-900">
                          {detailsModal.request.declaration_final_speaker_name || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Date</label>
                        <p className="font-semibold text-gray-900">
                          {detailsModal.request.declaration_final_date || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Digital Signature</label>
                        <p className="font-semibold text-gray-900 italic">
                          {detailsModal.request.declaration_final_signature || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-white rounded-lg border">
                      <p className="text-gray-700">
                        <strong>Declaration:</strong> I have carefully read and declare that I am the above-mentioned speaker, 
                        and I have filled this form to the best of my ability.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {detailsModal.request.status === "pending" && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        handleApprove([detailsModal.request.id]);
                        setDetailsModal({ open: false, request: null });
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-semibold"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Request
                    </button>
                    <button
                      onClick={() => {
                        handleReject([detailsModal.request.id]);
                        setDetailsModal({ open: false, request: null });
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-semibold"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}