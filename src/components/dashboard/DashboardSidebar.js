'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  User,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  FileText,
  QrCode,
  Users,
  Shield,
  Menu,
  X,
  ChevronDown,
  Badge,
  CheckCircle
} from 'lucide-react'

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [avatarLoadError, setAvatarLoadError] = useState(false)
  const [planName, setPlanName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const fetchedRef = useRef(false)
  const dropdownRef = useRef(null)
  const DASHBOARD_PATH = "/member/dashboard";
  const isDashboardActive = pathname === DASHBOARD_PATH;
  const menuItems = [
    { name: 'Dashboard', href: '/member/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'My Events', href: '/member/dashboard/events', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Check-Ins', href: '/member/dashboard/check-ins', icon: <CheckCircle className="w-5 h-5" /> },
    { name: 'Membership', href: '/member/dashboard/subscriptions', icon: <Shield className="w-5 h-5" /> },
    { name: 'Membership Card', href: '/member/dashboard/membership', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Certificates', href: '/member/dashboard/certificates', icon: <Badge className="w-5 h-5" /> },
    { name: 'Profile', href: '/member/dashboard/profile', icon: <User className="w-5 h-5" /> },
    { name: 'History', href: '/member/dashboard/history', icon: <FileText className="w-5 h-5" /> },
  ]

  // Fetch user data on component mount
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          const derived =
            data?.user?.current_subscription_plan_display_name ||
            data?.user?.current_subscription_plan_name ||
            (data?.user?.membership_type === 'paid' ? 'Paid Membership' : 'Free Membership')
          setPlanName(derived || '')
        } else {
          // Redirect to login if not authenticated
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  // Fetch current subscription for accurate plan name
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch('/api/dashboard/subscriptions', {
          credentials: 'include',
        })
        if (!res.ok) return
        const data = await res.json()
        const display =
          data?.currentSubscription?.subscription_plan?.display_name ||
          data?.currentSubscription?.subscription_plan_name ||
          planName ||
          (user?.membership_type === 'paid' ? 'Premium' : 'Standard')
        if (display) setPlanName(display)
      } catch {
        // ignore
      }
    }
    fetchSubscription()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      // Clear local state
      setUser(null)
      setIsUserDropdownOpen(false)
      setIsMobileMenuOpen(false)

      // Redirect to login page
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const profileImageUrl =
    typeof user?.profile_image === 'string' && user.profile_image.trim()
      ? user.profile_image.trim()
      : typeof user?.profile_image_url === 'string' && user.profile_image_url.trim()
      ? user.profile_image_url.trim()
      : ''

  useEffect(() => {
    setAvatarLoadError(false)
  }, [profileImageUrl])

  if (isLoading) {
    return (
      <aside className="fixed lg:static inset-y-0 left-0 z-[1000] w-64 bg-white border-r border-gray-200 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white font-bold">BDS</span>
          </div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </aside>
    )
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.full_name) return 'U'
    return user.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!user?.full_name) return 'Member'
    const firstName = user.full_name.split(' ')[0]
    return user.title ? `${user.title} ${firstName}` : firstName
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[1000] w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out h-full flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 py-4 border-b border-gray-200">
          <Link href="/member/dashboard" className="flex items-center space-x-3">

            <div>
              <img src="/long-logo2.png" alt="BDS Logo" className="h-10 object-contain" />
              
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isDashboard = item.href === DASHBOARD_PATH;

            const isActive = isDashboard
              ? pathname === DASHBOARD_PATH
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
          flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
          ${isActive
                    ? isDashboard
                      ? "bg-gradient-to-r from-[#03215F] to-[#03215F] text-white"
                      : "bg-gradient-to-r from-[#03215F] to-[#03215F] text-white"
                    : "hover:bg-gray-100 text-gray-700"
                  }
        `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>


        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="relative" ref={dropdownRef}>
            {/* User Profile Card - Clickable for dropdown */}
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors mb-4"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center overflow-hidden">
                {profileImageUrl && !avatarLoadError ? (
                  <img
                    src={profileImageUrl}
                    alt={user?.full_name || 'Member'}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarLoadError(true)}
                  />
                ) : (
                  <span className="text-white font-bold">{getUserInitials()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-gray-900 truncate">
                  {user?.full_name || 'Member'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {planName || (user?.membership_type === 'paid' ? 'Premium' : 'Member')}
                  {user?.membership_id && ` • ID: ${user.membership_id}`}
                </p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                {/* User Info Section */}
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{getUserInitials()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {user?.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <Link
                  href="/member/dashboard/profile"
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">My Profile</span>
                </Link>



                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-[#b8352d] hover:bg-[#b8352d] hover:text-white transition-colors border-t border-gray-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Main Logout Button (visible when dropdown is closed) */}
          {!isUserDropdownOpen && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          )}

          {/* Back to Website Link */}
          <Link
            href="/"
            className="block w-full text-center mt-3 text-sm text-[#03215F] hover:text-[#03215F] transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ← Back to Website
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  )
}