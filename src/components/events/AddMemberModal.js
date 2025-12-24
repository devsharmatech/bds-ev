// components/events/AddMemberModal.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Search,
  User,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Loader2,
  Check,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AddMemberModal({ eventId, event, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    price_paid: null,
    is_member: false,
  });

  // Search users
  const handleSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.users || []);
      } else {
        toast.error(data.message || "Search failed");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Handle user selection
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery("");
    setSearchResults([]);
    
    // Set default values based on user and event
    let price = null;
    if (event?.is_paid) {
      if (user.membership_type === 'paid' && event.member_price) {
        price = event.member_price;
      } else if (event.regular_price) {
        price = event.regular_price;
      }
    }

    setFormData({
      price_paid: price,
      is_member: user.membership_type === 'paid',
    });
  };

  // Clear selected user
  const handleClearSelection = () => {
    setSelectedUser(null);
    setSearchQuery("");
    setSearchResults([]);
    setFormData({
      price_paid: null,
      is_member: false,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/events/${eventId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          price_paid: formData.price_paid,
          is_member: formData.is_member,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Member added successfully");
        onSuccess();
      } else {
        toast.error(data.message || "Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Add Member to Event
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {event?.title}
            </p>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          {/* User Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search User
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone, or membership code..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                disabled={!!selectedUser}
              />
              {searching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && !selectedUser && (
              <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {user.full_name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.membership_code && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Shield className="w-3 h-3" />
                              <span>{user.membership_code}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.membership_type === 'paid' 
                            ? 'bg-[#9cc2ed] text-[#03215F]'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.membership_type === 'paid' ? 'Member' : 'Guest'}
                        </span>
                        <Check className="w-5 h-5 text-[#AE9B66] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected User */}
            {selectedUser && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] border border-[#9cc2ed]/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    Selected User
                  </h3>
                  <button
                    onClick={handleClearSelection}
                    className="text-sm text-[#b8352d] hover:text-[#b8352d]"
                  >
                    Change
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {selectedUser.profile_image ? (
                    <img
                      src={selectedUser.profile_image}
                      alt={selectedUser.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#03215F] flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {selectedUser.full_name}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{selectedUser.email}</span>
                      </div>
                      {(selectedUser.phone || selectedUser.mobile) && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{selectedUser.phone || selectedUser.mobile}</span>
                        </div>
                      )}
                      {selectedUser.membership_code && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Shield className="w-3 h-3" />
                          <span>{selectedUser.membership_code}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Member Details Form */}
          <form onSubmit={handleSubmit}>
            {event?.is_paid && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Paid ({event?.currency || 'BHD'})
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.price_paid || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      price_paid: e.target.value ? parseFloat(e.target.value) : null 
                    }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {event.member_price ? `Member price: ${event.member_price} ${event?.currency || 'BHD'}` : ''}
                  {event.regular_price ? ` | Regular price: ${event.regular_price} ${event?.currency || 'BHD'}` : ''}
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_member}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_member: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-[#03215F] focus:ring-[#03215F]"
                />
                <span className="text-sm text-gray-700">
                  Register as society member
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Members may receive special pricing and benefits
              </p>
            </div>

            {/* Info Note */}
            <div className="mb-6 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-600">
                A unique token will be automatically generated for attendance tracking.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedUser || loading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Add Member
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}