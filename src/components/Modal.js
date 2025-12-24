"use client";
import { motion } from "framer-motion";

export default function Modal({ open, onClose, title, children, size = "xl" }) {
  if (!open) return null;
  
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg", 
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-full mx-4"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        className={`w-full ${sizeClasses[size]} bg-white rounded-xl shadow-xl relative max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden my-auto`}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-white">
          <h2 className="text-lg sm:text-xl font-bold text-[#03215F]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-[#b8352d] p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0 custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  );
}