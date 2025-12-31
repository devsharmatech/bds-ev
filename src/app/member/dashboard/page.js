'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Users, 
  Award, 
  CreditCard, 
  TrendingUp,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Shield,
  Star,
  Download,
  FileText,
  QrCode,
  ChevronRight,
  User,
  Zap,
  Crown,
  Clock3,
  CalendarDays,
  Receipt,
  Building,
  MapPin,
  Phone,
  Mail,
  BadgeCheck,
  RefreshCw,
  Home,
  FileText as FileTextIcon,
  Building2,
  BriefcaseMedical,
  GraduationCap,
  BookOpen,
  Trophy,
  Activity,
  Target
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

// Utility functions
const formatBHD = (amount) => {
  if (!amount || amount === 0) return 'BHD 0.000';
  return new Intl.NumberFormat('en-BH', {
    style: 'currency',
    currency: 'BHD',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
}

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-BH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-BH', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({})
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [membershipDetails, setMembershipDetails] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  const [planName, setPlanName] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    fetchDashboardData()
    fetchNotifications()
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch current subscription to display accurate plan name (same approach as DashboardHeader)
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch('/api/dashboard/subscriptions', {
          credentials: 'include'
        })
        if (!res.ok) return
        const data = await res.json()
        const display =
          data?.currentSubscription?.subscription_plan?.display_name ||
          data?.currentSubscription?.subscription_plan_name ||
          planName ||
          (user?.membership_type === 'paid' ? 'Paid' : 'Free')
        if (display) setPlanName(display)
      } catch {
        // ignore
      }
    }
    fetchSubscription()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const userRes = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (!userRes.ok) {
        toast.error('Session expired. Please login again.')
        router.push('/auth/login')
        return
      }
      
      const userData = await userRes.json()
      setUser(userData.user)
      // Derive initial plan name from user
      const derivedPlan =
        userData?.user?.current_subscription_plan_display_name ||
        userData?.user?.current_subscription_plan_name ||
        (userData?.user?.membership_type === 'paid' ? 'Paid' : 'Free')
      setPlanName(derivedPlan || '')
      
      const dashboardRes = await fetch('/api/dashboard/stats', {
        credentials: 'include'
      })
      
      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json()
        
        if (dashboardData.success) {
          setStats(dashboardData.stats || {
            totalEvents: 0,
            upcomingEvents: 0,
            creditsEarned: 0,
            totalPaid: 0,
            eventsAttended: 0,
            certificatesEarned: 0,
            attendanceRate: 0
          })
          
          setUpcomingEvents(dashboardData.upcomingEvents || [])
          setRecentActivities(dashboardData.recentActivities || [])
          setMembershipDetails(dashboardData.membership || {})
          
          setUser(prev => ({
            ...prev,
            ...dashboardData.user
          }))

          // Fallback/augment plan name from membership payload if present
          const membershipPlan =
            dashboardData?.membership?.plan_display_name ||
            dashboardData?.membership?.subscription_plan?.display_name ||
            dashboardData?.membership?.subscription_plan_name ||
            null
          if (membershipPlan) setPlanName(membershipPlan)
        }
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/dashboard/notifications', {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setNotifications(data.notifications || [])
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
    fetchNotifications()
  }

  const handleDownloadMembershipCard = async () => {
    try {
      toast.loading('Generating membership card...')
      
      const res = await fetch('/api/dashboard/membership-card', {
        credentials: 'include'
      })
      
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `BDS-Membership-Card-${user?.membership_code || 'card'}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast.dismiss()
        toast.success('Membership card downloaded successfully!')
      } else {
        toast.dismiss()
        const errorData = await res.json()
        toast.error(errorData.message || 'Failed to download membership card')
      }
    } catch (error) {
      console.error('Error downloading card:', error)
      toast.dismiss()
      toast.error('Failed to download membership card')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#03215F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const isPremiumMember = user?.membership_type === 'paid'
  const membershipExpired = user?.membership_expiry_date && new Date(user.membership_expiry_date) < new Date()
  // planName is managed via state (derived from user/membership and refreshed via API)

  const dashboardStats = [
    { 
      label: 'Total Events', 
      value: stats.totalEvents || 0, 
      icon: Calendar, 
      color: 'blue',
      change: `${stats.upcomingEvents || 0} upcoming`
    },
    { 
      label: 'Events Attended', 
      value: stats.eventsAttended || 0, 
      icon: Users, 
      color: 'green',
      change: `${stats.attendanceRate || 0}% attendance rate`
    },
    { 
      label: 'CME Hrs', 
      value: stats.creditsEarned || 0, 
      icon: Award, 
      color: 'purple',
      change: `${stats.certificatesEarned || 0} certificates`
    },
    { 
      label: 'Membership Plan', 
      value: planName || (isPremiumMember ? 'Paid' : 'Free'), 
      icon: isPremiumMember ? Crown : Shield, 
      color: isPremiumMember ? 'green' : 'gray',
      change: user?.membership_status === 'active' ? 'Active' : 'Inactive'
    }
  ]

  const quickActions = [
    {
      name: 'Membership Card',
      description: 'View and download your membership card',
      icon: <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-[#03215F]" />,
      color: 'from-[#9cc2ed] to-[#9cc2ed]',
      href: '/member/dashboard/membership'
    },
    {
      name: 'My Events',
      description: 'View all your registered events',
      icon: <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />,
      color: 'from-[#AE9B66] to-[#AE9B66]',
      href: '/member/dashboard/events'
    },
    {
      name: 'Check-Ins',
      description: 'View your event check-in history',
      icon: <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />,
      color: 'from-[#03215F]/40 to-[#03215F]/40',
      href: '/member/dashboard/check-ins'
    },
    {
      name: 'My Certificates',
      description: 'View and download your certificates',
      icon: <Award className="w-5 h-5 md:w-6 md:h-6 text-white" />,
      color: 'from-[#AE9B66] to-[#03215F]',
      href: '/member/dashboard/certificates'
    },
    {
      name: 'My Profile',
      description: 'Update your personal information',
      icon: <User className="w-5 h-5 md:w-6 md:h-6 text-white" />,
      color: 'from-[#b8352d] to-[#b8352d]',
      href: '/member/dashboard/profile'
    },
    {
      name: 'Payment History',
      description: 'View your payment transactions',
      icon: <Receipt className="w-5 h-5 md:w-6 md:h-6 text-white" />,
      color: 'from-[#ECCF0F] to-[#ECCF0F]',
      href: '/member/dashboard/history'
    }
  ]

  const profileDetails = [
    { label: 'Email', value: user?.email, icon: Mail },
    { label: 'Phone', value: user?.phone, icon: Phone },
    { label: 'Specialty', value: user?.specialty, icon: BriefcaseMedical },
    { label: 'Employer', value: user?.employer, icon: Building2 },
    { label: 'Position', value: user?.position, icon: GraduationCap },
    { label: 'Member Since', value: user?.membership_date ? formatDate(user.membership_date) : 'N/A', icon: CalendarDays },
    { label: 'Membership ID', value: user?.membership_code, icon: BadgeCheck },
    { label: 'Membership Type', value: planName || (isPremiumMember ? 'Paid' : 'Free'), icon: Crown }
  ]

  return (
    <div className="space-y-4 md:space-y-8 pb-16 md:pb-8">
      {/* Welcome Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-xl md:rounded-2xl p-4 md:p-8 text-white relative overflow-hidden mx-2 md:mx-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white rounded-full -translate-y-16 translate-x-16 md:-translate-y-32 md:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 md:w-96 md:h-96 bg-white rounded-full translate-y-24 -translate-x-24 md:translate-y-48 md:-translate-x-48"></div>
        </div>
        
        <div className="relative">
          {/* Mobile Header Row */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex-1">
              <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">
                Welcome, {user?.full_name?.split(' ')[0] || 'Member'}!
              </h1>
             
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline ml-2 text-sm font-medium">Refresh</span>
            </button>
          </div>
          
          {/* Membership Badges - Mobile Stacked */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
            <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm flex items-center justify-center md:justify-start">
              <BadgeCheck className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
              <span className="font-medium">ID: {user?.membership_code || 'N/A'}</span>
            </div>
            
            <div className={`px-3 py-1.5 backdrop-blur-sm rounded-full text-xs md:text-sm flex items-center justify-center md:justify-start ${
              user?.membership_status === 'active'
                ? 'bg-green-500/20 text-white'
                : 'bg-[#b8352d]/20 text-white'
            }`}>
              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1.5 md:mr-2 ${
                user?.membership_status === 'active' ? 'bg-green-500' : 'bg-[#b8352d]'
              }`}></div>
              {user?.membership_status === 'active' ? 'Active' : 'Inactive'}
            </div>
            
            {user?.membership_expiry_date && (
              <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs md:text-sm flex items-center justify-center md:justify-start">
                <CalendarDays className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                <span className="font-medium">Exp: {formatDate(user.membership_expiry_date)}</span>
              </div>
            )}
            
           
          </div>
        </div>
      </div>
      {/* Additional Profile Details - Mobile Accordion */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-5 lg:p-6 border border-gray-200">
        <h2 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Member Information</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {profileDetails.slice(4).map((detail, index) => (
            detail.value && (
              <div key={index} className="flex items-start p-3 bg-gray-50/50 rounded-lg">
                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                  <detail.icon className="w-4 h-4 text-[#03215F]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs md:text-sm text-gray-500 mb-1">
                    {detail.label}
                  </div>
                  <div className="font-medium text-gray-900 text-sm md:text-base">
                    {detail.value}
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
      <div className='px-2 md:px-0'>

      {/* Stats Grid - Mobile Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
        {dashboardStats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-lg shadow p-3 md:p-4 lg:p-5 border ${
              stat.color === 'amber' 
                ? 'border-[#ECCF0F]/20' 
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 md:p-2 rounded-lg flex-shrink-0 ${
                stat.color === 'blue' ? 'bg-[#9cc2ed]' :
                stat.color === 'green' ? 'bg-[#AE9B66]' :
                stat.color === 'purple' ? 'bg-[#03215F]' :
                stat.color === 'amber' ? 'bg-[#ECCF0F]' :
                'bg-gray-100'
              }`}>
                <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${
                  stat.color === 'blue' ? 'text-[#03215F]' :
                  stat.color === 'green' ? 'text-white' :
                  stat.color === 'purple' ? 'text-white' :
                  stat.color === 'amber' ? 'text-[#03215F]' :
                  'text-gray-600'
                }`} />
              </div>
              <div className={`text-xs font-semibold truncate ml-1 ${
                stat.color === 'blue' ? 'text-[#03215F]' :
                stat.color === 'green' ? 'text-green-500' :
                stat.color === 'purple' ? 'text-[#03215F]' :
                stat.color === 'amber' ? 'text-[#ECCF0F]' :
                'text-gray-600'
              }`}>
                {stat.change}
              </div>
            </div>
            <h3 className="text-base md:text-md lg:text-lg font-bold text-gray-900 mb-1 truncate">
              {stat.value}
            </h3>
            <p className="text-xs text-gray-600 truncate">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Grid - Mobile Stacked */}
      <div className="grid lg:grid-cols-3 mt-4 md:mt-5 gap-3 md:gap-4 lg:gap-6">
        {/* Profile Summary & Details */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4 lg:space-y-6">
          {/* Profile Card - Mobile Optimized */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-5 lg:p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 md:gap-4 lg:gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center sm:items-start">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg md:text-xl">
                    {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                  </span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-1">
                    {user?.full_name}
                  </h3>
                  <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600">
                    <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Info */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                {profileDetails.slice(0, 4).map((detail, index) => (
                  detail.value && (
                    <div key={index} className="flex items-start min-w-0">
                      <div className="p-1.5 bg-gray-100 rounded-lg mr-2 flex-shrink-0">
                        <detail.icon className="w-3 h-3 md:w-4 md:h-4 text-[#03215F]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 truncate">
                          {detail.label}
                        </div>
                        <div className="font-medium text-gray-900 text-xs md:text-sm truncate">
                          {detail.value}
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
            
            {/* Edit Profile Button */}
            <div className="mt-4 md:mt-6 pt-4 border-t border-gray-200">
              <Link href="/member/dashboard/profile">
                <button className="w-full px-4 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm md:text-base">
                  Edit Profile Information
                </button>
              </Link>
            </div>
          </div>

          {/* Upcoming Events - Mobile Optimized */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-5 lg:p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-bold text-gray-900">Upcoming Events</h2>
              <Link href="/member/dashboard/events" className="text-[#03215F] hover:underline font-semibold flex items-center text-xs md:text-sm">
                View All
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
              </Link>
            </div>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                {upcomingEvents.slice(0, isMobile ? 2 : 3).map((event) => (
                  <div 
                    key={event.id} 
                    className="p-2.5 md:p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                  >
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[#03215F]/20 to-[#03215F]/20 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-xs md:text-sm mb-1 capitalize truncate">
                          {event.title}
                        </h4>
                        <div className="space-y-0.5">
                          <div className="flex items-center text-xs text-gray-600">
                            <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{formatDate(event.start_datetime)} • {formatTime(event.start_datetime)}</span>
                          </div>
                          {event.venue_name && (
                            <div className="flex items-center text-xs text-gray-600">
                              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{event.venue_name}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            event.checked_in
                              ? 'bg-[#AE9B66] text-white'
                              : event.price_paid === 0 || !event.price_paid
                              ? 'bg-[#9cc2ed] text-[#03215F]'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.checked_in ? 'Attended' : event.price_paid === 0 || !event.price_paid ? 'Free' : 'Paid'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {upcomingEvents.length > (isMobile ? 2 : 3) && (
                  <div className="text-center pt-2">
                    <Link href="/member/dashboard/events">
                      <button className="text-[#03215F] hover:underline font-medium text-sm md:text-base">
                        View {upcomingEvents.length - (isMobile ? 2 : 3)} more events
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 md:py-8">
                <Calendar className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm md:text-base mb-4">No upcoming events registered</p>
                <Link href="/events">
                  <button className="px-4 py-2 md:px-6 md:py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm md:text-base">
                    Browse Events
                  </button>
                </Link>
              </div>
            )}
          </div>
          {/* Membership Status Card */}
          <div className="bg-gradient-to-r from-[#9cc2ed]/10 to-[#9cc2ed]/10 rounded-xl p-4 md:p-5 lg:p-6 border border-[#9cc2ed]/20">
            <div className="flex items-center mb-2 md:mb-3">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-[#03215F] mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-bold text-gray-900">Membership Status</h3>
                <p className="text-[#03215F] text-xs">
                  {planName ? `${planName}` : (isPremiumMember ? 'Paid Membership' : 'Free Membership')}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${
                user?.membership_status === 'active'
                  ? 'bg-[#AE9B66]/20 border border-[#AE9B66]/30'
                  : 'bg-[#b8352d]/20 border border-[#b8352d]/30'
              }`}>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    user?.membership_status === 'active' ? 'bg-[#AE9B66]' : 'bg-[#b8352d]'
                  }`}></div>
                  <span className="font-semibold text-sm md:text-base">
                    {user?.membership_status === 'active' ? 'Active Membership' : 'Membership Inactive'}
                  </span>
                </div>
                <p className="text-xs md:text-sm mt-1">
                  {user?.membership_status === 'active' 
                    ? 'Your membership is currently active and valid'
                    : 'Please contact support for assistance'}
                </p>
              </div>
              
              {user?.membership_expiry_date && (
                <div className="flex items-center justify-between p-3 bg-white/50/50 rounded-lg">
                  <div className="flex items-center">
                    <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-gray-600 mr-2" />
                    <div>
                      <div className="text-xs text-gray-500">Expiry Date</div>
                      <div className="font-semibold text-sm md:text-base">{formatDate(user.membership_expiry_date)}</div>
                    </div>
                  </div>
                  {membershipExpired ? (
                    <span className="px-2 py-1 bg-[#b8352d] text-white rounded text-xs font-medium">Expired</span>
                  ) : (
                    <span className="px-2 py-1 bg-[#AE9B66] text-white rounded text-xs font-medium">Active</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Recent Activities & Quick Actions */}
        <div className="space-y-3 md:space-y-4 lg:space-y-6">
          {/* Quick Actions - Mobile Grid */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-5 lg:p-6 border border-gray-200">
            <h2 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Quick Actions</h2>
            
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href || '#'}
                  className={`relative bg-white rounded-lg p-3 md:p-4 transition-all cursor-pointer group border block border-gray-200 hover:shadow-md hover:-translate-y-0.5`}
                  onClick={(e) => {
                    if (action.action) {
                      e.preventDefault()
                      action.action()
                    }
                  }}
                >
                  <div className={`mb-2 md:mb-3 p-2 md:p-2.5 rounded-lg inline-flex ${
                    action.color.includes('[#03215F]') ? 'bg-[#03215F]/80 text-[#03215F]' :
                    action.color.includes('[#AE9B66]') ? 'bg-[#AE9B66]/80 text-[#AE9B66]' :
                    action.color.includes('[#b8352d]') ? 'bg-[#b8352d]/80 text-[#b8352d]' :
                    action.color.includes('[#9cc2ed]') ? 'bg-[#9cc2ed]/80 text-[#03215F]' :
                    action.color.includes('[#ECCF0F]') ? 'bg-[#ECCF0F]/80 text-[#03215F]' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {action.icon}
                  </div>
                  
                  <h4 className="font-bold text-gray-900 text-sm md:text-base mb-1 line-clamp-1">
                    {action.name}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-2">
                    {action.description}
                  </p>
                  
                  <div className="mt-2">
                    <div className={`text-xs md:text-sm font-medium flex items-center ${
                      action.color.includes('[#03215F]') ? 'text-[#03215F]' :
                      action.color.includes('[#AE9B66]') ? 'text-[#AE9B66]' :
                      action.color.includes('[#b8352d]') ? 'text-[#b8352d]' :
                      action.color.includes('[#9cc2ed]') ? 'text-[#03215F]' :
                      action.color.includes('[#ECCF0F]') ? 'text-[#03215F]' :
                      'text-gray-600'
                    }`}>
                      <span>View</span>
                      <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activities - Mobile Optimized */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-5 lg:p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-bold text-gray-900">Recent Activities</h2>
              
            </div>
            
            {recentActivities.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                {recentActivities.slice(0, isMobile ? 3 : 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2">
                    <div className={`mt-0.5 p-1 rounded-full flex-shrink-0 ${
                      activity.status === 'success' 
                        ? 'bg-[#AE9B66]' 
                        : activity.status === 'pending'
                        ? 'bg-[#ECCF0F]'
                        : 'bg-gray-100'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="w-3 h-3 text-white" />
                      ) : activity.status === 'pending' ? (
                        <Clock3 className="w-3 h-3 text-[#03215F]" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-gray-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-gray-900 line-clamp-2">
                        {activity.action}
                      </p>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-500">
                          {activity.time}
                        </p>
                        {activity.event_title && (
                          <span className="text-xs text-[#03215F] font-medium truncate ml-2">
                            {activity.event_title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm">No recent activities</p>
              </div>
            )}
          </div>

          
        </div>
      </div>

      </div>

      

    </div>
  )
}