"use client";
import {
  LogOut,
  Menu,
  User,
  Settings,
  ChevronDown,
  Bell,
  Search,
  Shield,
  Building2,
  Globe,
  Key,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  BarChart3,
  Calendar,
  Users,
  FileText,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export default function Navbar({
  role = "admin",
  onMenuClick,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
  const dropdownRef = useRef(null);
  const [userInfo, setUserInfo] = useState({ name: "", email: "", role: "" });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const tokenCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));

    if (tokenCookie) {
      const token = tokenCookie.split("=")[1];
      try {
        const decoded = jwtDecode(token);
        setUserInfo({
          name: decoded.name || "Admin User",
          email: decoded.email || "admin@bds.com",
          role: decoded.role || "Administrator",
        });
      } catch (error) {
        console.error("Failed to decode JWT:", error);
      }
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    document.cookie = "token=; Max-Age=0; path=/";
    window.location.href = "/admin/login";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userMenuItems = [
    {
      icon: User,
      label: "My Profile",
      description: "View & edit your profile",
      color: "from-[#03215F] to-[#03215F]",
      onClick: () => console.log("Profile clicked"),
    },
    {
      icon: Settings,
      label: "Account Settings",
      description: "Privacy, security & preferences",
      color: "from-[#ECCF0F] to-[#ECCF0F]",
      onClick: () => console.log("Settings clicked"),
    },
   
  ];

  const quickStats = [
    { label: "Active Sessions", value: "24", color: "text-[#AE9B66]", icon: Users },
    { label: "Pending Tasks", value: "12", color: "text-[#ECCF0F]", icon: Calendar },
    { label: "Messages", value: "8", color: "text-[#03215F]", icon: Mail },
    { label: "Reports", value: "5", color: "text-[#03215F]", icon: FileText },
  ];

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white shadow-lg border-b border-gray-200 px-6 py-3 flex justify-between items-center relative z-40"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-xl bg-[#AE9B66] hover:bg-[#AE9B66] transition-all duration-200"
        >
          <Menu className="w-5 h-5 text-white" />
        </motion.button>

        {/* Brand Logo/Name */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#03215F] to-[#AE9B66] rounded-xl flex items-center justify-center shadow-lg border border-[#ECCF0F]/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#03215F]">
                BDS Admin Portal
              </h1>
              <p className="text-xs text-[#03215F] font-medium">
                BDS Bahrain
              </p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden md:flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-300 shadow-inner overflow-hidden"
            >
              <Search className="w-4 h-4 text-[#03215F]" />
              <input
                type="text"
                placeholder="Search dashboard..."
                className="bg-transparent border-none outline-none text-sm text-[#03215F] placeholder-gray-400 flex-1 min-w-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-3 h-3 text-[#03215F]" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="p-2.5 rounded-xl bg-[#AE9B66] hover:bg-[#AE9B66] transition-all duration-200"
        >
          <Search className="w-5 h-5 text-white" />
        </motion.button>

      

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-[#AE9B66] hover:bg-[#AE9B66] transition-all duration-200 relative"
            onClick={() => setNotificationCount(0)}
          >
            <Bell className="w-5 h-5 text-white" />
            {notificationCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] rounded-full border border-white flex items-center justify-center"
              >
                <span className="text-[10px] font-bold text-gray-900">
                  {notificationCount}
                </span>
              </motion.span>
            )}
          </motion.button>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-200"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-[#03215F] to-[#03215F] rounded-xl flex items-center justify-center shadow-lg border border-[#ECCF0F]/30">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#AE9B66] rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-[#03215F] truncate max-w-[140px]">
                {userInfo.name || "Admin User"}
              </p>
              <p className="text-xs text-[#03215F] truncate max-w-[140px]">
                {userInfo.role || "Administrator"}
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#03215F] transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </motion.button>

          {/* Enhanced Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-full mt-2 w-80 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-300/30 overflow-hidden z-50"
              >
                {/* User Info Header */}
                <div className="p-5 border-b border-gray-300/30 bg-gradient-to-r from-gray-50/50 to-white/50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#03215F] to-[#03215F] rounded-xl flex items-center justify-center shadow-lg border border-[#ECCF0F]/30">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#AE9B66] rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {userInfo.name || "Admin User"}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {userInfo.email || "admin@bds.com"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-[#03215F]/10 to-[#03215F]/10 text-[#03215F] border border-[#03215F]/20">
                          {userInfo.role || "Administrator"}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#AE9B66] font-medium">
                          <div className="w-1.5 h-1.5 bg-[#AE9B66] rounded-full animate-pulse"></div>
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  {userMenuItems.map((item, index) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        item.onClick();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left group hover:bg-gradient-to-r hover:from-gray-100/50 hover:to-white/50 mb-1"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} shadow-sm`}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.description}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 transform -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="p-3 border-t border-gray-300/30 bg-gradient-to-r from-gray-50/50 to-white/50">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => console.log("View full profile")}
                      className="text-xs text-gray-600 hover:text-[#03215F] transition-colors font-medium"
                    >
                      View Full Profile →
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#b8352d] to-[#b8352d] hover:from-[#b8352d] hover:to-[#b8352d] text-[#b8352d] hover:text-[#b8352d] transition-all duration-200 border border-[#b8352d]/50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-semibold">Logout</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}

// Add X icon component
const X = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);