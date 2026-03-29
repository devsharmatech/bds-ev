'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CertificateTemplate from '@/components/certificates/CertificateTemplate';
import { Loader2, Download, Printer, ArrowLeft, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function CertificateViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificateData, setCertificateData] = useState(null);

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        setLoading(true);
        // Using the existing detail API that returns all necessary info for rendering
        const response = await fetch(`/api/mobile/dashboard/certificates/${id}/detail`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('bds_token') || ''}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch certificate data');
        }

        // Transform the detail API response to match CertificateTemplate props
        // The detail API returns: { success: true, certificate: { certificate_id, attendee, event, ... } }
        const cert = data.certificate;
        
        const formattedData = {
          certificate_id: cert.certificate_id,
          event_title: cert.event.title,
          event_date: cert.event.start_datetime,
          venue_name: cert.event.venue_name,
          member_name: cert.attendee.name,
          nhra_cme_hours: cert.nhra_hours, // Adjust if field name differs
          nhra_code: cert.nhra_code,
          checked_in_at: cert.attendance.checked_in_at
        };

        setCertificateData({
          certificate: formattedData,
          user: cert.attendee
        });
      } catch (err) {
        console.error('Error fetching certificate:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCertificateData();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-[#0B1A42] animate-spin mb-4" />
        <p className="text-gray-600 animate-pulse font-medium">Preparing your certificate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-[#0B1A42] text-white rounded-xl font-medium hover:bg-[#0B1A42]/90 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12 print:bg-white print:pb-0">
      <Toaster position="top-right" />
      
      {/* Navbar - Hidden on print */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 print:hidden shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-medium text-sm">Dashboard</span>
          </button>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm shadow-sm"
            >
              <Printer className="w-4 h-4 text-[#B19756]" />
              <span className="hidden sm:inline">Print to PDF</span>
              <span className="sm:hidden">Print</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0B1A42] to-[#0B1A42] text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm shadow-md"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </nav>

      {/* Certificate Container */}
      <div className="max-w-5xl mx-auto px-4 pt-8 md:pt-12 print:p-0 flex justify-center">
        <div className="bg-white shadow-2xl rounded-sm overflow-hidden print:shadow-none print:rounded-none">
          {certificateData && (
            <CertificateTemplate 
              certificate={certificateData.certificate} 
              user={certificateData.user} 
            />
          )}
        </div>
      </div>

      {/* Mobile Tips - Hidden on print */}
      <div className="max-w-lg mx-auto mt-8 px-4 text-center print:hidden">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3 text-left">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Pro Tip:</strong> When downloading, choose "Save as PDF" in the printer options. For best results on mobile, use landscape orientation.
          </p>
        </div>
      </div>
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: 8.5in 11in;
            margin: 0;
          }
          nav {
            display: none !important;
          }
          .min-h-screen {
            min-height: auto !important;
            padding-bottom: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
