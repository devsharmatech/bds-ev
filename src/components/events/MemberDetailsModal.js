// components/events/MemberDetailsModal.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Tag,
  Calendar,
  MapPin,
  Building,
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
  Edit2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

// Format date for Bahrain
const formatDateBH = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-BH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Bahrain'
  });
};

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

// Format BHD currency
const formatBHD = (amount) => {
  if (!amount) return 'Free';
  return new Intl.NumberFormat('en-BH', {
    style: 'currency',
    currency: 'BHD',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
};

export default function MemberDetailsModal({ member, eventId, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [memberDetails, setMemberDetails] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);

  useEffect(() => {
    if (member) {
      fetchMemberDetails();
    }
  }, [member]);

  const fetchMemberDetails = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/members/${member.id}`);
      const data = await response.json();

      if (data.success) {
        setMemberDetails(data.member);
        setAttendanceLogs(data.member.attendance_logs || []);
      }
    } catch (error) {
      console.error("Error fetching member details:", error);
      toast.error("Failed to load member details");
    }
  };

  const handleCheckInOut = async () => {
    if (!memberDetails) return;

    setLoading(true);
    try {
      const newStatus = !memberDetails.checked_in;
      const response = await fetch(`/api/admin/events/${eventId}/members/${member.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ checked_in: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(newStatus ? "Member checked in successfully" : "Member checked out successfully");
        onRefresh();
        fetchMemberDetails();
      } else {
        toast.error(data.message || "Failed to update check-in status");
      }
    } catch (error) {
      console.error("Error updating check-in:", error);
      toast.error("Failed to update check-in status");
    } finally {
      setLoading(false);
    }
  };

  if (!memberDetails && member) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <Loader2 className="w-8 h-8 text-[#03215F] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading member details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#03215F] to-[#03215F] shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Member Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {memberDetails?.users?.full_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-start gap-4">
              {memberDetails?.users?.profile_image ? (
                <img
                  src={memberDetails.users.profile_image}
                  alt={memberDetails.users.full_name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#03215F] flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {memberDetails?.users?.full_name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{memberDetails?.users?.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{memberDetails?.users?.phone || memberDetails?.users?.mobile || "No phone"}</span>
                  </div>
                  {memberDetails?.users?.membership_code && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Tag className="w-4 h-4" />
                      <span>{memberDetails.users.membership_code}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span className="capitalize">{memberDetails?.users?.membership_status || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Registration Info */}
            <div className="bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] rounded-xl p-5">
              <h4 className="font-semibold text-gray-900 mb-3">Event Registration</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Token</p>
                  <p className="font-mono text-lg font-bold text-gray-900">
                    {memberDetails?.token}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Registered On</p>
                  <p className="text-gray-900">
                    {formatDateBH(memberDetails?.joined_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment</p>
                  <p className={`text-lg font-bold ${
                    memberDetails?.price_paid 
                      ? 'text-[#AE9B66]' 
                      : 'text-gray-600'
                  }`}>
                    {formatBHD(memberDetails?.price_paid)}
                  </p>
                </div>
              </div>
            </div>

            {/* Check-in Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${
                memberDetails?.checked_in
                  ? 'bg-gradient-to-br from-[#AE9B66] to-[#AE9B66] border border-[#AE9B66]/50'
                  : 'bg-gradient-to-br from-[#b8352d] to-[#b8352d] border border-[#b8352d]/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Check-in Status</p>
                    <div className="flex items-center gap-2 mt-2">
                      {memberDetails?.checked_in ? (
                        <CheckCircle className="w-5 h-5 text-[#AE9B66]" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[#b8352d]" />
                      )}
                      <span className={`font-semibold ${
                        memberDetails?.checked_in
                          ? 'text-[#AE9B66]'
                          : 'text-[#b8352d]'
                      }`}>
                        {memberDetails?.checked_in ? "Checked In" : "Not Checked In"}
                      </span>
                    </div>
                    {memberDetails?.checked_in_at && (
                      <p className="text-sm text-gray-500 mt-1">
                        {formatTimeBH(memberDetails.checked_in_at)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleCheckInOut}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      memberDetails?.checked_in
                        ? 'bg-[#b8352d] text-white hover:bg-[#b8352d]'
                        : 'bg-[#AE9B66] text-white hover:bg-[#AE9B66]'
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : memberDetails?.checked_in ? (
                      "Check Out"
                    ) : (
                      "Check In"
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-[#03215F] to-[#03215F] border border-[#03215F]/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Member Type</p>
                    <div className="flex items-center gap-2 mt-2">
                      {memberDetails?.is_member ? (
                        <Shield className="w-5 h-5 text-[#03215F]" />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-900">
                        {memberDetails?.is_member ? "Society Member" : "Guest"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance History */}
            {attendanceLogs.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Attendance History</h4>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Scan Time</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Scanner</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {attendanceLogs.map((log, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {formatTimeBH(log.scan_time)}
                              <div className="text-xs text-gray-500">
                                {formatDateBH(log.scan_time)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {log.scanner?.full_name || "Unknown"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {log.location || "Not specified"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Member Profile Info (if available) */}
            {memberDetails?.users?.member_profiles && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Profile Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {memberDetails.users.member_profiles.gender && (
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="text-gray-900 capitalize">
                        {memberDetails.users.member_profiles.gender}
                      </p>
                    </div>
                  )}
                  {memberDetails.users.member_profiles.dob && (
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="text-gray-900">
                        {formatDateBH(memberDetails.users.member_profiles.dob)}
                      </p>
                    </div>
                  )}
                  {memberDetails.users.member_profiles.city && (
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="text-gray-900">
                        {memberDetails.users.member_profiles.city}
                      </p>
                    </div>
                  )}
                  {memberDetails.users.member_profiles.employer && (
                    <div>
                      <p className="text-sm text-gray-600">Employer</p>
                      <p className="text-gray-900">
                        {memberDetails.users.member_profiles.employer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}