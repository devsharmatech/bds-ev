'use client';

import { useEffect, useRef } from 'react';
import { X, Printer, CheckCircle, Download, Copy, Calendar, User, CreditCard, FileText } from 'lucide-react';

export default function ReceiptModal({ receipt, onClose }) {
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  if (!receipt) return null;

  /* ================= UTIL ================= */
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-BH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Bahrain',
    });

  /* ================= CLOSE ================= */
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  /* ================= PRINT ================= */
  const printReceipt = () => {
    const win = window.open('', '_blank');

    win.document.write(`
<!DOCTYPE html>
<html>
<head>
<title>Receipt - ${receipt.reference}</title>

<style>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact;
}
body{
  font-family:Arial,Helvetica,sans-serif;
  background:#fff;
  color:#111;
}
@page{
  size:A4;
  margin:14mm;
}
.receipt{
  border:3px solid #03215F;
  padding:26px;
  position:relative;
}
.receipt:before{
  content:"OFFICIAL RECEIPT";
  position:absolute;
  top:45%;
  left:50%;
  transform:translate(-50%,-50%) rotate(-35deg);
  font-size:60px;
  font-weight:900;
  color:rgba(3,33,95,.05);
}
h1{
  text-align:center;
  font-size:26px;
  color:#03215F;
}
h2{
  text-align:center;
  font-size:13px;
  letter-spacing:3px;
  margin-bottom:18px;
  color:#555;
  text-transform:uppercase;
}
.box{
  border:1px solid #ddd;
  padding:14px;
  margin-bottom:16px;
}
.section-title{
  font-size:13px;
  font-weight:bold;
  color:#03215F;
  border-bottom:2px solid #AE9B66;
  padding-bottom:4px;
  margin-bottom:10px;
}
.row{
  display:flex;
  justify-content:space-between;
  margin-bottom:8px;
  font-size:13px;
}
.label{
  font-size:11px;
  color:#666;
  text-transform:uppercase;
}
.value{
  font-weight:bold;
}
.total{
  display:flex;
  justify-content:space-between;
  border-top:3px solid #03215F;
  padding-top:12px;
  margin-top:12px;
  font-size:22px;
  font-weight:900;
  color:#03215F;
}
.footer{
  text-align:center;
  font-size:10px;
  color:#666;
  margin-top:18px;
  line-height:1.5;
}
.receipt *{page-break-inside:avoid;}
</style>
</head>

<body>
<div class="receipt">

<h1>Bahrain Dental Society</h1>
<h2>Official Payment Receipt</h2>

<div class="box">
  <div class="row">
    <div>
      <div class="label">Receipt Number</div>
      <div class="value">${receipt.reference}</div>
    </div>
    <div style="text-align:right">
      <div class="label">Payment Date & Time</div>
      <div class="value">${formatDate(receipt.paid_at)}</div>
    </div>
  </div>
</div>

<div class="box">
  <div class="section-title">Member Information</div>
  <div class="row">
    <span>Full Name</span>
    <strong>${receipt.user?.full_name || 'N/A'}</strong>
  </div>
  <div class="row">
    <span>Membership ID</span>
    <strong>${receipt.user?.membership_code || 'N/A'}</strong>
  </div>
  <div class="row">
    <span>Email Address</span>
    <strong>${receipt.user?.email || 'N/A'}</strong>
  </div>
  <div class="row">
    <span>Payment Method</span>
    <strong>Credit / Debit Card</strong>
  </div>
</div>

<div class="box">
  <div class="section-title">Payment Details</div>
  <div class="row">
    <span>Description</span>
    <strong>${receipt.description}</strong>
  </div>
  <div class="row">
    <span>Payment Status</span>
    <strong style="color:#059669">COMPLETED</strong>
  </div>
  <div class="row">
    <span>Transaction Type</span>
    <strong>Membership Payment</strong>
  </div>

  <div class="total">
    <span>Total Amount Paid</span>
    <span>BHD ${receipt.amount?.toFixed(3)}</span>
  </div>
</div>

<div class="footer">
  This is an official receipt issued by Bahrain Dental Society.<br/>
  This document is computer-generated and does not require a signature.<br/>
  Bahrain.ds94@gmail.com | Tel: +973 3799 0963<br/>
  Receipt ID: ${receipt.reference}
</div>

</div>

<script>
window.onload=()=>{window.print();setTimeout(()=>window.close(),500);}
</script>
</body>
</html>
    `);

    win.document.close();
  };

  /* ================= MODAL UI ================= */
  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-br from-[#03215F]/90 via-[#03215F]/80 to-[#AE9B66]/60 backdrop-blur-lg flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl shadow-black/25 border border-white/20 overflow-hidden animate-slideUp flex flex-col max-h-[90vh]"
      >
        {/* FIXED HEADER */}
        <div className="flex-shrink-0 relative bg-gradient-to-r from-[#03215F] via-[#03215F]/95 to-[#03215F]/90 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-2xl text-white mb-1">Payment Confirmed</h2>
                <div className="flex items-center gap-3">
                  <span className="text-white/90 text-sm">Transaction #{receipt.reference}</span>
                  <span className="px-3 py-1 bg-emerald-400/30 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-emerald-400/50">
                    Success
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 group"
            >
              <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-8 space-y-8"
          style={{ maxHeight: 'calc(90vh - 140px)' }} // Adjust based on header/footer height
        >
          {/* Company Header */}
          <div className="text-center">
            <div className="inline-flex flex-col items-center bg-gradient-to-r from-[#03215F]/5 to-[#AE9B66]/5 rounded-2xl px-8 py-6 border border-[#03215F]/10 ">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                Bahrain Dental Society
              </h1>
              <p className="text-sm text-[#AE9B66] font-semibold tracking-[0.2em] uppercase mt-2">
                Official Payment Receipt
              </p>
            </div>
          </div>

          {/* Receipt Info Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#03215F]/10 rounded-lg">
                  <FileText className="w-5 h-5 text-[#03215F]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt Number</p>
                  <p className="font-mono font-bold text-lg text-[#03215F]">{receipt.reference}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#AE9B66]/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-[#AE9B66]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(receipt.paid_at)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</p>
                  <p className="font-semibold text-gray-900">Credit/Debit Card/Bank Transfer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Member & Payment Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Member Information Card */}
            <div className="bg-gradient-to-b from-white via-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-[#03215F] to-[#03215F] rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Member Information</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="font-bold text-lg text-gray-900 bg-gray-50 p-3 rounded-lg">{receipt.user?.full_name}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Membership ID</p>
                    <p className="font-semibold text-[#03215F] bg-gray-50 p-3 rounded-lg">{receipt.user?.membership_code}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</p>
                    <p className="font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg truncate">{receipt.user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-gradient-to-b from-white via-white to-gray-50 rounded-2xl p-6 border-2 border-[#03215F] shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Payment Summary</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-gray-900 bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                    {receipt.description}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Payment Status</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-emerald-700">PAYMENT SUCCESSFUL</span>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Total Amount</p>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-xl font-black text-[#03215F]">BHD {receipt.amount?.toFixed(3)}</p>
                      
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-600">Transaction Type</p>
                      <p className="font-semibold text-gray-900">Membership Payment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

         

          {/* Support Information */}
          <div className="bg-gradient-to-r from-[#03215F]/5 to-[#AE9B66]/5 rounded-2xl p-6 border border-[#03215F]/10">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Customer Support</h4>
                <p className="text-sm text-gray-600 mb-3">
                  For any queries regarding this payment, our support team is available to assist you.
                </p>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Email: </span>
                    <span className="text-[#03215F] font-semibold">Bahrain.ds94@gmail.com</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Phone: </span>
                    <span className="text-[#03215F] font-semibold">+973 3799 0963</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Hours: </span>
                    <span>Sun-Thu, 8:00 AM - 4:00 PM</span>
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Receipt Validity</h4>
                <p className="text-sm text-gray-600 mb-3">
                  This document serves as an official receipt from Bahrain Dental Society and is valid for:
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#AE9B66] rounded-full"></div>
                    <span>Tax reporting purposes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#AE9B66] rounded-full"></div>
                    <span>Membership verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#AE9B66] rounded-full"></div>
                    <span>Expense reimbursement</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Legal Note */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              This receipt has been generated electronically and does not require a physical signature.<br />
              All amounts are in Bahraini Dinar (BHD) and include any applicable taxes.
            </p>
          </div>
        </div>

        {/* FIXED FOOTER */}
        <div className="flex-shrink-0 border-t border-gray-200 px-8 py-6 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Payment verified • Secure transaction</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(receipt.reference)}
                className="px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy ID</span>
              </button>
              
              <button
                onClick={printReceipt}
                className="group relative px-8 py-3 rounded-xl bg-gradient-to-r from-[#03215F] via-[#03215F] to-[#03215F] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex items-center gap-3"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Printer className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
                <span className="relative z-10">Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            backdrop-filter: blur(0px);
          }
          to { 
            opacity: 1; 
            backdrop-filter: blur(8px);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Custom scrollbar for the content area */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
}