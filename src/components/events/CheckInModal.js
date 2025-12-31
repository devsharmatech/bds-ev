// components/events/CheckInModal.js
"use client";

import { motion } from "framer-motion";
import {
  X,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Format time for Bahrain
const formatTimeBH = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-BH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bahrain'
  });
};

export default function CheckInModal({ member, onClose, onConfirm, loading }) {
  const isCheckedIn = member?.checked_in;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isCheckedIn
                ? 'bg-gradient-to-br from-[#b8352d] to-[#b8352d]'
                : 'bg-gradient-to-br from-[#AE9B66] to-[#AE9B66]'
            } shadow-lg`}>
              {isCheckedIn ? (
                <UserX className="w-6 h-6 text-white" />
              ) : (
                <UserCheck className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isCheckedIn ? "Check Out Member" : "Check In Member"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {member?.users?.full_name}
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

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Current Status */}
            <div className={`p-4 rounded-xl ${
              isCheckedIn
                ? 'bg-gradient-to-br from-[#b8352d]/20 to-[#b8352d]/30 border border-[#b8352d]/50'
                : 'bg-gradient-to-br from-[#AE9B66]/20 to-[#AE9B66]/30 border border-[#AE9B66]/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isCheckedIn ? 'bg-[#b8352d]' : 'bg-[#AE9B66]'
                }`}>
                  {isCheckedIn ? (
                    <UserX className="w-5 h-5 text-white bg-[#b8352d]" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-white bg-[#AE9B66]" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Current Status: {isCheckedIn ? "Checked In" : "Not Checked In"}
                  </p>
                  {isCheckedIn && member.checked_in_at && (
                    <p className="text-sm text-gray-600 mt-1">
                      Since {formatTimeBH(member.checked_in_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Member Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                {member?.users?.profile_image ? (
                  <img
                    src={member.users.profile_image}
                    alt={member.users.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-[#03215F]" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {member?.users?.full_name}
                  </h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-sm text-gray-600">
                      {member?.users?.email}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Tag className="w-3 h-3" />
                        <span className="font-mono">{member?.token}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#ECCF0F] to-[#ECCF0F] border border-[#ECCF0F]/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-black bg-[#ECCF0F] mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    {isCheckedIn ? "Check Out Note" : "Check In Note"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isCheckedIn
                      ? "Checking out will update the member's status but keep attendance logs. The member can check in again if needed."
                      : "Checking in will update the member's status and create an attendance log entry."
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(!isCheckedIn)}
                disabled={loading}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  isCheckedIn
                    ? 'bg-gradient-to-r from-[#b8352d] to-[#b8352d] hover:from-[#b8352d] hover:to-[#b8352d] text-white'
                    : 'bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] hover:from-[#AE9B66] hover:to-[#AE9B66] text-white'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : isCheckedIn ? (
                  <>
                    <UserX className="w-4 h-4" />
                    Check Out
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Check In
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Add missing Tag icon import
import { Tag } from "lucide-react";