'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MembershipCardTemplate from '@/components/membership/MembershipCardTemplate';
import { Loader2, Download, Printer, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function MembershipCardViewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/mobile/dashboard/membership-info', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('bds_token') || ''}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch membership data');
        }

        setUserData(data.user);
      } catch (err) {
        console.error('Error fetching membership info:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-[#0B1A42]">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="animate-pulse font-semibold tracking-wide">Securing your membership details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-red-50 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">Verification Failed</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-4 bg-[#0B1A42] text-white rounded-2xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Safety
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] print:bg-white pb-20 print:pb-0">
      <Toaster position="top-right" />
      
      {/* Premium Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 sticky top-0 z-50 print:hidden shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm"
            >
              <Printer className="w-4 h-4 text-amber-600" />
              Download Card
            </button>
          </div>
        </div>
      </nav>

      {/* Main Experience */}
      <div className="max-w-4xl mx-auto px-6 pt-16 md:pt-24 print:pt-0 flex flex-col items-center">
        {/* Verification Badge */}
        <div className="mb-10 flex items-center gap-3 px-6 py-2.5 bg-green-50 rounded-full border border-green-100 shadow-sm print:hidden">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-bold text-sm uppercase tracking-widest">Verified Member</span>
        </div>

        {/* The Card */}
        <div className="mb-16 print:mb-0 transform transition-transform hover:scale-[1.01]">
          {userData && <MembershipCardTemplate user={userData} />}
        </div>

        {/* Benefits & Instructions */}
        <div className="w-full max-w-lg grid grid-cols-1 gap-6 print:hidden">
            <div className="p-6 bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100">
                <h3 className="text-[#0B1A42] font-black text-lg mb-4 flex items-center gap-2">
                    <div className="w-2 h-6 bg-amber-500 rounded-full" />
                    Member Benefits
                </h3>
                <ul className="space-y-3 text-sm text-gray-600 font-medium">
                    <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Exclusive access to dental workshops
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Priority registration for annual summits
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Professional networking opportunities
                    </li>
                </ul>
            </div>

            <div className="p-6 bg-[#0B1A42] rounded-3xl shadow-2xl shadow-blue-900/20 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Download className="w-20 h-20" />
                </div>
                <h3 className="font-black text-lg mb-2">Digital Member Card</h3>
                <p className="text-blue-200/80 text-sm leading-relaxed mb-6">
                    Showing this card at partner locations or events grants you immediate access. You can save this card as a PDF or high-resolution screenshot.
                </p>
                <button 
                  onClick={handlePrint}
                  className="w-full py-3 bg-white text-[#0B1A42] rounded-2xl font-black text-sm hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Save to Device
                </button>
            </div>
        </div>
      </div>

      {/* Modern Print Specific Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, nav, footer, button, .print\\:hidden {
            display: none !important;
          }
          @page {
            size: 600px 400px;
            margin: 0;
          }
          .min-h-screen {
            min-height: auto !important;
            padding: 0 !important;
          }
          .max-w-4xl {
            max-width: none !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
