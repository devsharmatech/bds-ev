"use client";

import { motion } from "framer-motion";
import { AlertTriangle, X, Loader2 } from "lucide-react";

export default function DeleteModal2({ 
  title = "Confirm Delete", 
  description, 
  onClose, 
  onConfirm, 
  loading = false 
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#b8352d]">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#03215F]">
                {title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6">
          <p className="text-gray-700 mb-6">
            {description}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-[#b8352d] to-[#b8352d] text-white rounded-xl font-medium hover:from-[#b8352d] hover:to-[#b8352d] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}