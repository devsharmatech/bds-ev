"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  X,
  LogOut,
  User,
  ChevronRight,
  Bell,
  FileText,
  Shield,
  Building2,
  CreditCard,
  BarChart3,
  HelpCircle,
  Globe,
  Database,
  Key,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
// import { jwtDecode } from "jwt-decode";

export default function Sidebar({
  role = "admin",
  isOpen = false,
  onClose,
}) {
  const isAdmin = role === "admin";
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    // Prefer server session: fetch current user from API (works with HttpOnly cookies)
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUserInfo({
              name: data.user.full_name || "Admin User",
              email: data.user.email || "admin@bds.com",
              role: data.user.role || "Administrator",
            });
            return;
          }
        }
      } catch (e) {
        // ignore, fallback below
      }

      // Fallback to localStorage hints
      const storedName = localStorage.getItem("admin_full_name");
      const storedEmail = localStorage.getItem("admin_email");
      const storedRole = localStorage.getItem("role");
      setUserInfo({
        name: storedName || "Admin User",
        email: storedEmail || "admin@bds.com",
        role: storedRole || "Administrator",
      });
    };

    loadUser();
  }, []);

  // Main menu items as requested
  const mainMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard", badge: null },
    { name: "Events", icon: Calendar, href: "/admin/events", badge: null },
    { name: "Members", icon: Users, href: "/admin/members", badge: null },
    { name: "CheckIn", icon: Users, href: "/admin/check-in", badge: null },
    { name: "Committees", icon: Globe, href: "/admin/committees", badge: null },
    { name: "Committee Pages", icon: FileText, href: "/admin/committee-pages", badge: null },
    { name: "Committee Members", icon: Users, href: "/admin/committee-members", badge: null },
    { name: "Subscriptions", icon: CreditCard, href: "/admin/subscriptions", badge: null },
    { name: "Contact Messages", icon: Mail, href: "/admin/contact-messages", badge: null },
    { name: "Notifications", icon: Bell, href: "/admin/notifications", badge: null },
  ];

  // Settings submenu items
  const settingsMenuItems = [
    { name: "General Settings", icon: Settings, href: "/admin/settings/general" },
    { name: "Security", icon: Shield, href: "/admin/settings/security" },
    { name: "Notifications", icon: Bell, href: "/admin/settings/notifications" },
    { name: "Billing", icon: CreditCard, href: "/admin/settings/billing" },
    { name: "Company Profile", icon: Building2, href: "/admin/settings/company" },
  ];

  // Additional tools menu
  const toolsMenuItems = [
    { name: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { name: "Reports", icon: FileText, href: "/admin/reports" },
    { name: "API Keys", icon: Key, href: "/admin/api" },
    { name: "Database", icon: Database, href: "/admin/database" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; Max-Age=0; path=/";
    window.location.href = "/admin/login";
  };

  const sidebarContent = (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-64 bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-xl shadow-2xl h-full flex flex-col z-50 fixed lg:relative lg:z-auto overflow-hidden border-r border-gray-300/30"
    >
      {/* Header */}
      <div className="p-6 py-4 border-b border-gray-300/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#03215F] to-[#03215F] rounded-xl flex items-center justify-center shadow-lg border border-[#ECCF0F]/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                BDS Admin
              </h2>
              
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg bg-gradient-to-r from-gray-100 to-white border border-gray-300/50 transition-all duration-200 hover:shadow-lg"
          >
            <X className="w-4 h-4 text-gray-600" />
          </motion.button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Main Menu Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Main Menu
          </h3>
          <div className="space-y-1">
            {mainMenuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={`group flex items-center justify-between gap-3 px-3 py-3 rounded-xl transition-all duration-300 font-medium text-sm relative overflow-hidden ${
                      isActive
                        ? "bg-gradient-to-r from-[#03215F]/10 to-[#03215F]/10 text-[#03215F] border border-[#03215F]/20 shadow-lg"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100/50 hover:to-gray-50/50 hover:text-gray-900 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-gradient-to-r from-[#03215F] to-[#03215F] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <item.icon size={16} />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] text-gray-900">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#03215F] to-[#03215F] rounded-l-full"></div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-300/30 space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50/50 to-white/50 rounded-xl border border-gray-300/30">
          <div className="w-10 h-10 bg-gradient-to-br from-[#03215F] to-[#03215F] rounded-xl flex items-center justify-center border border-[#ECCF0F]/30">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userInfo.name || "Admin User"}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {userInfo.email || "admin@bds.com"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-[#AE9B66] rounded-full animate-pulse"></div>
              <span className="text-xs text-[#AE9B66] font-medium">
                Online
              </span>
            </div>
          </div>
        </div>

       

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 bg-gradient-to-r from-[#b8352d]/50 to-[#b8352d]/30 hover:from-[#b8352d]/50 hover:to-[#b8352d]/50 text-[#b8352d] hover:text-[#b8352d] rounded-xl transition-all duration-300 border border-[#b8352d]/50 group"
        >
          <div className="p-2 rounded-lg bg-[#b8352d]/50 group-hover:bg-[#b8352d]/50">
            <LogOut size={16} />
          </div>
          <span className="text-sm font-semibold flex-1 text-left">Logout</span>
          <ChevronRight size={16} className="opacity-50" />
        </motion.button>

        {/* Footer Note */}
        <div className="text-center pt-2 border-t border-gray-300/30">
          <p className="text-xs text-gray-500">
            © 2025 BDS System
          </p>
          <p className="text-xs text-gray-400 mt-1">
            v1.0.0 • Bahrain
          </p>
        </div>
      </div>
    </motion.aside>
  );

  return (
    <>
      {/* Desktop Sidebar - Always visible on lg and above */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Mobile/Tablet Sidebar - Only shows when isOpen is true */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <div className="lg:hidden">
              {sidebarContent}
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}