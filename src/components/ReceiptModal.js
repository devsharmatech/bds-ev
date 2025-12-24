'use client'

import { useEffect, useRef } from 'react';
import { X, Printer } from 'lucide-react';

export default function ReceiptModal({ receipt, onClose }) {
  const modalRef = useRef();

  if (!receipt) return null;

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Click outside to close
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const printReceipt = () => {
    const printContent = document.getElementById('printable-receipt');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receipt.reference}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color: #000;
            background: white;
            padding: 20px;
            width: 100%;
          }
          
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            background: white;
          }
          
          .header {
            text-align: center;
            border-bottom: 2px solid #03215F;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          
          .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 8px;
          }
          
          .logo-badge {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(to right, #03215F, #AE9B66);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          }
          
          h1 {
            font-size: 24px;
            font-weight: bold;
            background: linear-gradient(to right, #111827, #374151);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          
          .subtitle {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
            letter-spacing: 1px;
          }
          
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: #d1fae5;
            border-radius: 9999px;
            margin-top: 12px;
          }
          
          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #AE9B66;
          }
          
          .status-text {
            font-size: 12px;
            font-weight: 500;
            color: #065f46;
          }
          
          .receipt-header {
            background: linear-gradient(to right, rgba(34, 166, 172, 0.1), rgba(16, 185, 129, 0.05));
            border: 1px solid rgba(34, 166, 172, 0.2);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
          }
          
          .receipt-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .info-item p:first-child {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          
          .info-item p:last-child {
            font-size: 16px;
            font-weight: bold;
            color: #111827;
          }
          
          .section-title {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
          }
          
          .member-info {
            margin-bottom: 24px;
          }
          
          .member-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          
          .member-item p:first-child {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          
          .member-item p:last-child {
            font-size: 14px;
            font-weight: 500;
            color: #111827;
          }
          
          .payment-details {
            margin-bottom: 24px;
          }
          
          .payment-card {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
          }
          
          .payment-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .payment-row:last-child {
            border-bottom: none;
            padding-top: 16px;
            padding-bottom: 0;
          }
          
          .total-row {
            border-top: 2px solid #e5e7eb;
            padding-top: 16px;
            margin-top: 8px;
          }
          
          .total-label {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
          }
          
          .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #03215F;
          }
          
          .footer-note {
            text-align: center;
            background: #f9fafb;
            border-radius: 12px;
            padding: 16px;
            margin-top: 24px;
          }
          
          .footer-note p {
            font-size: 11px;
            color: #6b7280;
            line-height: 1.4;
          }
          
          .footer-note p:last-child {
            font-size: 10px;
            color: #9ca3af;
            margin-top: 4px;
          }
          
          @page {
            size: A4;
            margin: 20mm;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .receipt-container {
              border: none;
              padding: 0;
              max-width: 100%;
            }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }, 500);
  };

  // Get formatted date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-BH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get formatted period
  const formatPeriod = () => {
    if (!receipt.period) return null;
    return `
      ${formatDate(receipt.period.start)} – ${formatDate(receipt.period.end)}
    `;
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#03215F]/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-gradient-to-br from-white to-gray-50 w-full max-w-[95vw] sm:max-w-lg rounded-xl sm:rounded-2xl shadow-2xl animate-slideUp flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
      >
        {/* Header with decorative elements - Fixed */}
        <div className="relative p-4 sm:p-6 pb-0 flex-shrink-0">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#03215F] to-[#03215F] h-1.5 w-24 rounded-full"></div>
          
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#03215F] to-[#03215F] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs sm:text-sm">BD</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent truncate">
                  Bahrain Dental Society
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">OFFICIAL PAYMENT RECEIPT</p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#AE9B66] rounded-full mb-4 sm:mb-6">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium text-white">Payment Successful</span>
          </div>
        </div>

        {/* Printable Receipt Content - Scrollable */}
        <div id="printable-receipt" className="print:p-0 p-4 sm:p-6 flex-1 overflow-y-auto min-h-0">
          {/* Receipt Header Card */}
          <div className="bg-gradient-to-r from-[#03215F]/10 to-[#AE9B66] rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 border border-[#03215F]/20 print:shadow-none">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Receipt Number</p>
                <p className="text-base sm:text-lg font-bold text-[#03215F] break-words">{receipt.reference}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Date</p>
                <p className="text-base sm:text-lg font-bold text-[#03215F]">
                  {formatDate(receipt.paid_at)}
                </p>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">Member Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-sm sm:text-base font-medium text-[#03215F] break-words">{receipt.user?.full_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Membership ID</p>
                <p className="text-sm sm:text-base font-medium text-[#03215F] break-words">{receipt.user?.membership_code}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="text-sm sm:text-base font-medium text-[#03215F] break-words">{receipt.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">Payment Details</h3>
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3 print:shadow-none">
              <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-gray-600">Description</span>
                <span className="text-sm sm:text-base font-medium text-[#03215F] break-words text-right sm:text-left">{receipt.description}</span>
              </div>
              
              {receipt.type === "membership" && receipt.period && (
                <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0">
                  <span className="text-xs sm:text-sm text-gray-600">Membership Period</span>
                  <span className="text-sm sm:text-base font-medium text-[#03215F] text-right break-words">
                    {formatPeriod()}
                  </span>
                </div>
              )}

              <div className="pt-2 sm:pt-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <span className="text-base sm:text-lg font-semibold text-[#03215F]">Total Amount</span>
                  <div className="text-left sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold text-[#03215F] print:text-[#03215F]">
                      BHD {receipt.amount?.toFixed(3)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl print:shadow-none">
            <p className="text-xs text-gray-500 leading-relaxed">
              This receipt is computer generated and does not require a physical signature.
            </p>
            <p className="text-xs text-gray-400 mt-1 break-words">
              For any queries, contact: support@bahraindentalsociety.org
            </p>
          </div>
        </div>

        {/* Actions - Fixed Footer - Hidden during print */}
        <div className="p-4 sm:p-6 pt-0 flex gap-2 sm:gap-3 justify-end print:hidden flex-shrink-0 border-t border-gray-200">
          <button
            onClick={printReceipt}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg sm:rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[#03215F]/20 text-sm sm:text-base"
          >
            <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Print Receipt</span>
            <span className="sm:hidden">Print</span>
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          #printable-receipt,
          #printable-receipt * {
            visibility: visible !important;
          }
          
          #printable-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            padding: 20px !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          button, .print\\:hidden {
            display: none !important;
          }
          
          .bg-gradient-to-br,
          .bg-gradient-to-r {
            background-image: none !important;
            background-color: transparent !important;
          }
          
          .bg-clip-text {
            background-clip: border-box !important;
            color: #000 !important;
            -webkit-text-fill-color: #000 !important;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}