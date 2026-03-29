'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CertificateTemplate from '@/components/certificates/CertificateTemplate';
import { Loader2, Download, Printer, AlertCircle, Share2, Award } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function PublicCertificateViewPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificateData, setCertificateData] = useState(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        // Using the NEW PUBLIC API that requires no token
        const response = await fetch(`/api/public/certificates/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Certificate not found');
        }

        const cert = data.certificate;
        
        // Transform the PUBLIC API response to match CertificateTemplate props
        const formattedData = {
          certificate_id: cert.certificate_id,
          event_title: cert.event.title,
          event_date: cert.event.start_datetime,
          venue_name: cert.event.venue_name,
          member_name: cert.attendee.name,
          nera_cme_hours: cert.nera_cme_hours,
          nera_code: cert.nera_code,
          checked_in_at: cert.attendance.checked_in_at
        };

        setCertificateData({
          certificate: formattedData,
          user: cert.attendee
        });
      } catch (err) {
        console.error('Error fetching public certificate:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPublicData();
    }
  }, [id]);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 816) {
        // Calculate scale to fit 816px + 32px padding into viewport
        const newScale = (window.innerWidth - 32) / 816;
        setScale(newScale);
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My BDS Certificate',
          text: `Check out my certificate for ${certificateData.certificate.event_title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-[#0B1A42] animate-spin mb-4" />
        <p className="text-slate-600 font-medium animate-pulse">Loading Certificate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Certificate</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] print:bg-white overflow-hidden flex flex-col">
      <Toaster position="top-center" />
      
      {/* 
          Main Responsive Viewport
          - Uses CSS Transform Scale to 'Zoom Out' on smaller screens automatically
      */}
      <main className="flex-1 overflow-auto p-4 md:p-12 flex justify-center items-start print:block print:p-0 bg-gray-100">
        <div 
          className="print:block shadow-2xl print:shadow-none bg-white origin-top"
          style={{ 
            transform: `scale(${scale})`,
            transition: 'transform 0.2s ease-out'
          }}
        >
          <div 
            style={{ 
                width: '816px', // Standard Portrait A4
                minWidth: '816px',
                display: 'block' 
            }}
          >
            {certificateData && (
              <div id="certificate-content">
                <CertificateTemplate 
                  certificate={certificateData.certificate} 
                  user={certificateData.user} 
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Minimalist Floating Action Button - Optimized for direct Download */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg px-2 py-2 bg-[#03215F]/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 z-50 print:hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
        <button
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-4 px-8 py-4 bg-white text-[#03215F] rounded-xl font-bold text-base tracking-widest hover:bg-gray-100 active:scale-[0.98] transition-all shadow-lg overflow-hidden group"
        >
          <div className="relative">
            <Award className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full scale-150"></div>
          </div>
          <span className="whitespace-nowrap">DOWNLOAD CERTIFICATE</span>
        </button>
      </div>

      <style jsx global>{`
        @media print {
          header { display: none !important; }
          .fixed { display: none !important; }
          main { padding: 0 !important; overflow: visible !important; display: block !important; }
          body { background: white !important; }
          .origin-top { transform: scale(1) !important; }
          @page {
            size: 8.5in 11in;
            margin: 0;
          }
        }
        /* Hide scrollbars but keep functionality */
        .overflow-auto {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .overflow-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

