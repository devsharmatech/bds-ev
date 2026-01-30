"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  User,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Settings,
  Home,
  Calendar,
  CreditCard,
  Shield,
  LayoutDashboard,
  Badge, FileText

} from "lucide-react";
import Link from "next/link";
import NotificationsDropdown from "@/components/notifications/NotificationsDropdown";

export default function DashboardHeader({ onMenuToggle }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [planName, setPlanName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Fetch user data and notifications
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          // Try to derive initial plan name from user
          const derived =
            data?.user?.current_subscription_plan_display_name ||
            data?.user?.current_subscription_plan_name ||
            (data?.user?.membership_type === "paid" ? "Premium" : "Standard");
          setPlanName(derived || "");
        } else {
          // Redirect to login if not authenticated
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Fetch current subscription to display accurate plan name
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch("/api/dashboard/subscriptions", {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        const display =
          data?.currentSubscription?.subscription_plan?.display_name ||
          data?.currentSubscription?.subscription_plan_name ||
          planName ||
          (user?.membership_type === "paid" ? "Premium" : "Standard");
        if (display) setPlanName(display);
      } catch {
        // ignore - fall back to derived name
      }
    };
    fetchSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      setIsUserMenuOpen(false);
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Implement search functionality
      setSearchQuery("");
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.full_name) return "U";
    return user.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user display name (first name only)
  const getUserDisplayName = () => {
    if (!user?.full_name) return "Member";
    return user.full_name.split(" ")[0];
  };

  // Quick actions for mobile menu
  const quickActions = [
    {
      name: "Dashboard",
      href: "/member/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "My Events",
      href: "/member/dashboard/events",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      name: "Membership Card",
      href: "/member/dashboard/membership",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      name: "Certificates",
      href: "/member/dashboard/certificates",
      icon: <Badge className="w-5 h-5" />,
    },
    {
      name: "Profile",
      href: "/member/dashboard/profile",
      icon: <User className="w-5 h-5" />,
    },
    {
      name: "History",
      href: "/member/dashboard/history",
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  if (isLoading) {
    return (
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Loading skeleton */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-64 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-32 h-9 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Mobile Menu & Search */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  if (onMenuToggle) onMenuToggle(!isMobileMenuOpen);
                }}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              {/* Site Logo */}
              <Link href="/" className="hidden sm:flex items-center shrink-0">
                <img
                  src="https://bds-web-iota.vercel.app/long-logo.png"
                  alt="Bahrain Dental Society Logo"
                  className="h-8 md:h-9 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Right: User Menu & Notifications */}
            <div className="flex items-center space-x-4">
              {/* Notifications Dropdown */}
              <NotificationsDropdown />

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {planName || "Standard"}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 overflow-hidden">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {getUserInitials()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {user?.full_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {planName || "Standard"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="py-1">
                      <Link
                        href="/member/dashboard/profile"
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">My Profile</span>
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-1"></div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-[#b8352d] hover:bg-[#b8352d] hover:text-white transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>

                    {/* Back to Website */}
                    <Link
                      href="/"
                      className="block px-4 py-2 text-center text-sm text-[#03215F] hover:text-[#03215F] hover:bg-gray-50 transition-colors border-t border-gray-200 mt-1"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      ← Back to Website
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
          onClick={() => {
            setIsMobileMenuOpen(false);
            if (onMenuToggle) onMenuToggle(false);
          }}
        ></div>
      )}

      {/* Mobile Quick Actions Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-16 left-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 z-30 overflow-hidden">
          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center">
                <span className="text-white text-base font-bold">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">
                  {user?.full_name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {planName || (user?.membership_type === "paid" ? "Premium" : "Member")}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 p-4">
            {quickActions.map((action) => (
              <a
                key={action.name}
                href={action.href}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onMenuToggle) onMenuToggle(false);
                }}
              >
                <div className="text-[#03215F] mb-2">{action.icon}</div>
                <span className="text-xs font-medium text-gray-700">
                  {action.name}
                </span>
              </a>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="p-2">
            <a
              href="/member/dashboard/profile"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onMenuToggle) onMenuToggle(false);
              }}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile Settings</span>
            </a>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-1"></div>

          {/* Mobile Footer Actions */}
          <div className="p-2">
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
                if (onMenuToggle) onMenuToggle(false);
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-[#b8352d] text-[#b8352d] rounded-lg hover:bg-[#b8352d] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>

            <a
              href="/"
              className="block w-full text-center mt-2 text-sm text-[#03215F] hover:text-[#03215F] py-2"
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onMenuToggle) onMenuToggle(false);
              }}
            >
              ← Back to Website
            </a>
          </div>
        </div>
      )}
    </>
  );
}
