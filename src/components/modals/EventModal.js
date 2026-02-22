'use client'

import { useState, useEffect, useRef } from 'react'
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Shield,
  Mail,
  Phone,
  User,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Ticket,
  Award,
  Globe,
  Smartphone,
  CreditCard,
  Lock,
  Gift,
  Zap,
  List,
  Mic,
  UserCircle,
  LogIn,
  PartyPopper,
  Star,
  Check,
  Send,
  Menu,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Tag
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  getUserEventPrice,
  getAllEventPrices,
  formatBHD as formatBHDUtil,
  calculateSavings,
  getPricingTier,
  hasMultiplePricingTiers,
  hasCategoryPricing,
} from '@/lib/eventPricing'

// Bahrain flag component
const BahrainFlag = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 640 480"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="640" height="480" fill="#b8352d" />
    <path
      d="
      M0 0
      L200 0
      L160 48
      L200 96
      L160 144
      L200 192
      L160 240
      L200 288
      L160 336
      L200 384
      L160 432
      L200 480
      L0 480
      Z
    "
      fill="#ffffff"
    />
  </svg>
)

// Format BHD currency
const formatBHD = (amount) => {
  if (!amount || amount === 0) return 'FREE';
  return new Intl.NumberFormat('en-BH', {
    style: 'currency',
    currency: 'BHD',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-BH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Bahrain'
  });
}

// Format time
const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-BH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bahrain'
  });
}

// Format agenda time
const formatAgendaTime = (timeString) => {
  if (!timeString) return '';
  return timeString.slice(0, 5); // Get HH:MM format
}

// Derive event status from start/end datetimes (join allowed only if 'upcoming')
const deriveEventStatus = (event) => {
  const raw = (event?.status || '').toLowerCase();
  if (raw === 'cancelled') return 'cancelled';
  const now = new Date();
  const start = event?.start_datetime ? new Date(event.start_datetime) : null;
  const end = event?.end_datetime ? new Date(event.end_datetime) : null;
  if (start && now < start) return 'upcoming';
  if (start && now >= start) {
    if (!end || now <= end) return 'ongoing';
    if (end && now > end) return 'past';
  }
  if (!start && end && now <= end) return 'ongoing';
  if (!start && end && now > end) return 'past';
  if (raw === 'ongoing' || raw === 'upcoming') return raw;
  return 'upcoming';
}

// Custom Confetti component
const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(150)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: ['#03215F', '#03215F', '#03215F', '#AE9B66', '#ECCF0F', '#03215F'][Math.floor(Math.random() * 6)]
          }}
          initial={{ y: -10, opacity: 0, rotate: 0 }}
          animate={{
            y: window.innerHeight + 10,
            opacity: [0, 1, 0.8, 0],
            rotate: Math.random() * 720,
            x: Math.random() * 200 - 100
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  )
}

export default function EventModal({ event, isOpen, onClose, user, onLoginRequired, onJoinSuccess }) {
  const [loading, setLoading] = useState(false)
  const [loadingMethods, setLoadingMethods] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [paymentStep, setPaymentStep] = useState(1) // 1: join button, 2: payment methods, 3: processing
  const [error, setError] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [selectedPreviewCategory, setSelectedPreviewCategory] = useState(null) // For price preview switching
  const contentRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setActiveTab('details')
      setShowSuccess(false)
      setShowConfetti(false)
      setPaymentStep(1)
      setPaymentMethods([])
      setSelectedMethod(null)
      setError(null)
      setSelectedPreviewCategory(null) // Reset preview category on modal open
      setCouponCode('')
      setAppliedCoupon(null)
    }
  }, [isOpen])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100
        setScrollProgress(progress)
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll)
      return () => contentElement.removeEventListener('scroll', handleScroll)
    }
  }, [activeTab])

  const handleJoinEvent = async () => {
    const status = deriveEventStatus(event);
    if (status !== 'upcoming') {
      toast.error('Registration is not available for this event.');
      return;
    }
    if (!user) {
      onClose()
      onLoginRequired(event)
      return
    }

    if (event.joined) {
      // For paid events (where price > 0 for this user), allow completing payment if joined record exists but payment isn't completed
      if (event.is_paid && !userPriceInfo.isFree) {
        setPaymentStep(2)
        handleInitiatePayment()
        return
      }
      // Free events or already paid: already joined
      toast.success('You have already joined this event!')
      onClose()
      return
    }

    // If event is paid and the user's price is greater than 0, initiate payment flow
    if (event.is_paid && !userPriceInfo.isFree) {
      setPaymentStep(2)
      handleInitiatePayment()
      return
    }

    // Free event (or free category for a paid event) - join directly
    setLoading(true)

    try {
      const response = await fetch('/api/event/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.id,
          payment_reference: null
        })
      })

      const data = await response.json()

      if (data.success) {
        // Show confetti and success modal
        setShowConfetti(true)
        setShowSuccess(true)

        // Wait for animation to complete
        setTimeout(() => {
          setShowConfetti(false)
          setShowSuccess(false)
          onClose()
          // Call parent to refresh events
          if (onJoinSuccess) {
            onJoinSuccess()
          }
        }, 5000)
      } else {
        toast.error(data.message || 'Failed to join event')
        setLoading(false)
      }
    } catch (error) {
      console.error('Join error:', error)
      toast.error('Failed to join event. Please try again.')
      setLoading(false)
    }
  }

  const handleInitiatePayment = async () => {
    if (!user || loadingMethods) return

    setLoadingMethods(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/event/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.id,
          user_id: user.id,
          coupon_code: appliedCoupon?.code || null,
        })
      })

      const data = await response.json()

      if (data.success && data.paymentMethods) {
        setPaymentMethods(data.paymentMethods)
        toast.success('Please select a payment method')
      } else {
        setError(data.message || 'Failed to load payment methods')
        toast.error(data.message || 'Failed to load payment methods')
        setPaymentStep(1)
      }
    } catch (err) {
      console.error('Error initiating payment:', err)
      setError('Failed to load payment methods. Please try again.')
      toast.error('Failed to load payment methods. Please try again.')
      setPaymentStep(1)
    } finally {
      setLoadingMethods(false)
    }
  }

  const handleSelectMethod = (method) => {
    setSelectedMethod(method)
  }

  const handleApplyCoupon = async () => {
    const code = couponCode.trim()
    if (!code) {
      toast.error('Enter a coupon code')
      return
    }
    if (!user) {
      toast.error('Login required to apply coupon')
      return
    }

    setApplyingCoupon(true)
    setError(null)
    try {
      const res = await fetch('/api/event/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event.id, code }),
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.message || 'Failed to apply coupon')
      }
      setAppliedCoupon({
        code: data.coupon.code,
        discount_type: data.coupon.discount_type,
        discount_value: data.coupon.discount_value,
        discount_amount: data.discount_amount,
        final_amount: data.final_amount,
      })
      toast.success('Coupon applied')
    } catch (err) {
      console.error('Apply coupon error:', err)
      setAppliedCoupon(null)
      toast.error(err.message)
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleExecutePayment = async () => {
    if (!user || !selectedMethod || processing) return

    setProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/event/execute-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.id,
          user_id: user.id,
          payment_method_id: selectedMethod.id
        })
      })

      const executeData = await response.json()

      if (executeData.success && executeData.paymentUrl) {
        setPaymentStep(3)
        // Redirect to MyFatoorah payment page
        window.location.href = executeData.paymentUrl
      } else {
        setError(executeData.message || 'Failed to process payment')
        toast.error(executeData.message || 'Failed to process payment')
        setProcessing(false)
      }
    } catch (err) {
      console.error('Error executing payment:', err)
      setError('Failed to process payment. Please try again.')
      toast.error('Failed to process payment. Please try again.')
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  // Use the pricing utility to get correct price
  const userPriceInfo = getUserEventPrice(event, user);
  const allPrices = getAllEventPrices(event);
  const userSavings = calculateSavings(event, user);
  const currentTier = getPricingTier(event);
  const isEarlyBird = currentTier === 'earlybird';
  const showPricingTable = event?.is_paid && (hasMultiplePricingTiers(event) || hasCategoryPricing(event));

  // Calculate early bird deadline countdown
  const getEarlyBirdCountdown = () => {
    if (!event?.early_bird_deadline) return null;
    const deadline = new Date(event.early_bird_deadline);
    const now = new Date();
    if (now >= deadline) return null;

    const diff = deadline - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Ending soon!';
  };

  const earlyBirdCountdown = getEarlyBirdCountdown();

  // Calculate the display price - use selected preview category if set, otherwise user's actual price
  const getDisplayPrice = () => {
    if (selectedPreviewCategory && allPrices?.categories) {
      const selectedCat = allPrices.categories.find(c => c.id === selectedPreviewCategory);
      if (selectedCat) {
        return selectedCat[allPrices.currentTier] || selectedCat.earlybird || selectedCat.standard || selectedCat.onsite || 0;
      }
    }
    return userPriceInfo.price || 0;
  };

  const getDisplayCategoryInfo = () => {
    if (selectedPreviewCategory && allPrices?.categories) {
      const selectedCat = allPrices.categories.find(c => c.id === selectedPreviewCategory);
      if (selectedCat) {
        const tierLabels = { earlybird: 'Early Bird', standard: 'Standard', onsite: 'On-site' };
        return {
          categoryDisplay: selectedCat.name,
          tierDisplay: tierLabels[allPrices.currentTier] || 'Current',
          isPreview: selectedPreviewCategory !== userPriceInfo.category
        };
      }
    }
    return {
      categoryDisplay: userPriceInfo.categoryDisplay,
      tierDisplay: userPriceInfo.tierDisplay,
      isPreview: false
    };
  };

  const priceToPay = getDisplayPrice();
  const displayCategoryInfo = getDisplayCategoryInfo();
  const derivedStatus = deriveEventStatus(event)

  // Calculate member savings using the utility
  const memberSavings = userSavings;

  // Success Modal Overlay
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        {/* Custom Confetti */}
        {showConfetti && <Confetti />}

        {/* Success Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-4 border-[#AE9B66]/30"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#AE9B66]/10 via-[#AE9B66]/5 to-transparent"></div>

          {/* Success Content */}
          <div className="relative p-8 text-center">
            {/* Celebration Icons */}
            <div className="relative">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-32 h-32 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] rounded-full flex items-center justify-center shadow-xl"
                >
                  <PartyPopper className="w-16 h-16 text-white" />
                </motion.div>
              </div>

              {/* Floating Stars */}
              <motion.div
                className="absolute -top-5 -left-5"
                animate={{
                  rotate: 360,
                  y: [0, -10, 0]
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  y: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Star className="w-8 h-8 text-[#ECCF0F] fill-[#ECCF0F]" />
              </motion.div>
              <motion.div
                className="absolute -top-5 -right-5"
                animate={{
                  rotate: 360,
                  y: [0, -10, 0]
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  y: { duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
                }}
              >
                <Sparkles className="w-8 h-8 text-[#b8352d]" />
              </motion.div>
              <motion.div
                className="absolute -bottom-5 left-10"
                animate={{
                  rotate: 360,
                  y: [0, -10, 0]
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  y: { duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
                }}
              >
                <Star className="w-8 h-8 text-[#9cc2ed] fill-[#9cc2ed]" />
              </motion.div>
              <motion.div
                className="absolute -bottom-5 right-10"
                animate={{
                  rotate: 360,
                  y: [0, -10, 0]
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  y: { duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.6 }
                }}
              >
                <Sparkles className="w-8 h-8 text-[#03215F]" />
              </motion.div>
            </div>

            {/* Main Message */}
            <div className="mt-32 mb-8">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                🎉 You're In!
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 text-lg mb-2"
              >
                Successfully joined
              </motion.p>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-bold text-[#03215F] mb-6"
              >
                {event.title}
              </motion.p>

              {/* Event Details */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] rounded-xl p-4 mb-6"
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <Calendar className="w-6 h-6 text-[#AE9B66] mx-auto mb-2" />
                    <div className="text-sm text-gray-700">
                      {formatDate(event.start_datetime)}
                    </div>
                  </div>
                  <div className="text-center">
                    <Clock className="w-6 h-6 text-[#AE9B66] mx-auto mb-2" />
                    <div className="text-sm text-gray-700">
                      {formatTime(event.start_datetime)}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Confirmation Message */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-center gap-2 text-[#AE9B66]">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Confirmation email sent to {user?.email}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[#03215F]">
                  <Ticket className="w-5 h-5" />
                  <span className="font-medium">QR code will be available in your account</span>
                </div>
              </motion.div>
            </div>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-6"
            >
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#AE9B66] rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-[#AE9B66] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[#AE9B66] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span>Closing in 5 seconds...</span>
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <button
                onClick={() => {
                  setShowSuccess(false)
                  setShowConfetti(false)
                  onClose()
                  if (onJoinSuccess) onJoinSuccess()
                }}
                className="w-full py-3 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Awesome! Close Window
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-y-auto max-h-[95vh] border border-white/20 relative"
        style={{

          WebkitOverflowScrolling: "touch",

          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Glowing Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#03215F] via-[#03215F] to-[#03215F] z-20"></div>

        {/* Close Button - Fixed Position */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 z-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Container */}
        <div
          className="flex-1"
          style={{

            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Header with Event Banner - RESPONSIVE HEIGHT for small screens */}
          <div className="relative h-24 sm:h-32 md:h-40 lg:h-48 bg-gradient-to-r from-[#03215F] to-[#03215F] overflow-hidden">
            {event.banner_url ? (
              <div className="w-full h-full">
                <img
                  src={event.banner_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#03215F] via-[#03215F] to-[#03215F] flex items-center justify-center">
                <Calendar className="w-12 h-12 md:w-16 md:h-16 text-white/50" />
              </div>
            )}

            {/* Event Title and Badges */}
            <div className="absolute bottom-4 py-4 px-4 md:px-6 left-0 right-0">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 line-clamp-2 capitalize">
                {event.title}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Early Bird Badge */}
                {isEarlyBird && event.is_paid && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-green-400 to-emerald-500 backdrop-blur-sm text-white rounded-full text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-lg"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    EARLY BIRD
                    {earlyBirdCountdown && (
                      <span className="flex items-center gap-1 ml-1 pl-1.5 border-l border-white/30 text-[10px] md:text-xs font-normal">
                        <Clock className="w-3 h-3" />
                        {earlyBirdCountdown}
                      </span>
                    )}
                  </motion.span>
                )}
                <span className="px-2 py-1 md:px-3 md:py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs md:text-sm font-medium border border-white/30">
                  {event.is_paid ? formatBHD(priceToPay) : '🎟️ FREE'}
                </span>
                {memberSavings > 0 && (
                  <span className="px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] backdrop-blur-sm text-white rounded-full text-xs md:text-sm font-medium">
                    Save {formatBHD(memberSavings)}
                  </span>
                )}
                <span className="px-2 py-1 md:px-3 md:py-1.5 bg-[#9cc2ed]/20 backdrop-blur-sm text-white rounded-full text-xs md:text-sm">
                  {formatDate(event.start_datetime)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <div className="flex">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 md:py-4 text-center font-medium transition-all ${activeTab === 'details'
                  ? 'text-[#03215F] border-b-2 border-[#03215F] bg-gradient-to-t from-[#03215F]/5 to-transparent'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <List className="w-4 h-4" />
                  <span className="hidden xs:inline">Details</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('agenda')}
                className={`flex-1 py-3 md:py-4 text-center font-medium transition-all ${activeTab === 'agenda'
                  ? 'text-[#03215F] border-b-2 border-[#03215F] bg-gradient-to-t from-[#03215F]/5 to-transparent'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden xs:inline">Agenda</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('hosts')}
                className={`flex-1 py-3 md:py-4 text-center font-medium transition-all ${activeTab === 'hosts'
                  ? 'text-[#03215F] border-b-2 border-[#03215F] bg-gradient-to-t from-[#03215F]/5 to-transparent'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Mic className="w-4 h-4" />
                  <span className="hidden xs:inline">Hosts</span>
                </div>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div
            ref={contentRef}
            className="p-4 md:p-6"
          >
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* User Status Card */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 md:p-5 border border-gray-200/50">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${user ? 'bg-gradient-to-r from-[#AE9B66] to-[#AE9B66]' : 'bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed]'}`}>
                        {user ? (
                          <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        ) : (
                          <LogIn className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm md:text-base">
                          {user ? 'Welcome back!' : 'Login to Join'}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600">
                          {user ? user.email : 'Join now to secure your spot'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {event.joined ? (
                    <div className="mt-3 p-3 bg-gradient-to-r from-[#AE9B66]/20 to-[#AE9B66]/20 rounded-lg">
                      <div className="flex items-center gap-2 text-[#AE9B66]">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="font-semibold text-sm md:text-base">You're already joined for this event!</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs md:text-sm text-gray-600 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{displayCategoryInfo.isPreview ? 'Preview Price' : 'Your Price'}</span>
                          {user && (
                            <span className={`px-2 py-0.5 text-[10px] md:text-xs rounded-full font-medium ${displayCategoryInfo.isPreview
                              ? 'bg-amber-100 text-amber-700 border border-amber-300'
                              : 'bg-[#03215F]/10 text-[#03215F]'
                              }`}>
                              {displayCategoryInfo.categoryDisplay} • {displayCategoryInfo.tierDisplay}
                            </span>
                          )}
                          {displayCategoryInfo.isPreview && (
                            <span className="text-[10px] text-amber-600">(Preview)</span>
                          )}
                        </div>
                        {!displayCategoryInfo.isPreview && memberSavings > 0 && (
                          <span className="text-[#AE9B66] flex items-center gap-1 text-xs">
                            <Gift className="w-3 h-3" />
                            Save {formatBHD(memberSavings)}
                          </span>
                        )}
                      </div>
                      <div className={`text-2xl md:text-3xl font-bold ${displayCategoryInfo.isPreview
                        ? 'text-amber-600'
                        : 'bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent'
                        }`}>
                        {formatBHD(priceToPay)}
                      </div>
                      {displayCategoryInfo.isPreview && (
                        <p className="text-[10px] text-amber-600 mt-1">
                          Your actual price: {formatBHD(userPriceInfo.price || 0)} ({userPriceInfo.categoryDisplay})
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Pricing Table (for paid events with multiple tiers) */}
                {showPricingTable && allPrices && (
                  <div className="bg-white rounded-xl border border-gray-200/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#03215F]" />
                        All Registration Prices
                      </h4>
                      {isEarlyBird && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Early Bird Active
                        </span>
                      )}
                    </div>

                    {/* Category Selection Info */}
                    {!user && (
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Select a category below to see the price you would pay
                      </p>
                    )}

                    <div className="overflow-x-auto -mx-4 px-4">
                      <table className="w-full text-xs md:text-sm border-collapse min-w-[400px]">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-2 py-2 text-left text-gray-700 font-semibold">
                              Category
                            </th>
                            <th className={`border border-gray-200 px-2 py-2 text-center font-semibold ${allPrices.currentTier === 'earlybird' ? 'bg-green-100 text-green-700' : 'text-gray-700'
                              }`}>
                              Early Bird
                              {allPrices.currentTier === 'earlybird' && <span className="block text-[9px] font-normal">(Current)</span>}
                            </th>
                            <th className={`border border-gray-200 px-2 py-2 text-center font-semibold ${allPrices.currentTier === 'standard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                              }`}>
                              Standard
                              {allPrices.currentTier === 'standard' && <span className="block text-[9px] font-normal">(Current)</span>}
                            </th>
                            <th className={`border border-gray-200 px-2 py-2 text-center font-semibold ${allPrices.currentTier === 'onsite' ? 'bg-orange-100 text-orange-700' : 'text-gray-700'
                              }`}>
                              On-site
                              {allPrices.currentTier === 'onsite' && <span className="block text-[9px] font-normal">(Current)</span>}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {allPrices.categories.map((cat) => {
                            // Highlight user's category, or 'regular' if not logged in
                            const isUserCategory = user
                              ? userPriceInfo.category === cat.id
                              : cat.id === 'regular';
                            // Check if this category is selected for preview
                            const isSelectedPreview = selectedPreviewCategory === cat.id;
                            // Get the current tier price for this category
                            const currentTierPrice = cat[allPrices.currentTier] || cat.earlybird || cat.standard || cat.onsite;
                            // Disable selection if user is logged in
                            const canSelect = !user;
                            return (
                              <tr
                                key={cat.id}
                                className={`transition-colors ${canSelect ? 'cursor-pointer' : 'cursor-default'
                                  } ${isSelectedPreview && canSelect
                                    ? 'bg-[#03215F]/10 ring-2 ring-[#03215F] ring-inset'
                                    : isUserCategory
                                      ? 'bg-blue-50'
                                      : canSelect ? 'hover:bg-gray-100' : ''
                                  }`}
                                onClick={() => canSelect && setSelectedPreviewCategory(cat.id)}
                              >
                                <td className="border border-gray-200 px-2 py-2 text-gray-700 font-medium">
                                  <div className="flex items-center gap-2">
                                    {!user && (
                                      <input
                                        type="radio"
                                        name="categoryPreview"
                                        checked={isSelectedPreview}
                                        onChange={() => setSelectedPreviewCategory(cat.id)}
                                        className="w-4 h-4 text-[#03215F] border-gray-300 focus:ring-[#03215F] cursor-pointer"
                                      />
                                    )}
                                    <span className="truncate">{cat.name}</span>
                                    {isUserCategory && (
                                      <span className="px-1 py-0.5 bg-[#03215F] text-white text-[8px] rounded font-bold shrink-0">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className={`border border-gray-200 px-2 py-2 text-center ${allPrices.currentTier === 'earlybird' && isSelectedPreview
                                  ? 'bg-green-200 font-bold text-green-700'
                                  : allPrices.currentTier === 'earlybird' && isUserCategory
                                    ? 'bg-green-100 font-bold text-green-700'
                                    : 'text-gray-700'
                                  }`}>
                                  {cat.earlybird != null ? formatBHD(cat.earlybird) : '-'}
                                </td>
                                <td className={`border border-gray-200 px-2 py-2 text-center ${allPrices.currentTier === 'standard' && isSelectedPreview
                                  ? 'bg-blue-200 font-bold text-blue-700'
                                  : allPrices.currentTier === 'standard' && isUserCategory
                                    ? 'bg-blue-100 font-bold text-blue-700'
                                    : 'text-gray-700'
                                  }`}>
                                  {cat.standard != null ? formatBHD(cat.standard) : '-'}
                                </td>
                                <td className={`border border-gray-200 px-2 py-2 text-center ${allPrices.currentTier === 'onsite' && isSelectedPreview
                                  ? 'bg-orange-200 font-bold text-orange-700'
                                  : allPrices.currentTier === 'onsite' && isUserCategory
                                    ? 'bg-orange-100 font-bold text-orange-700'
                                    : 'text-gray-700'
                                  }`}>
                                  {cat.onsite != null ? formatBHD(cat.onsite) : '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Selected Category Price Preview - only for non-logged in users */}
                    {!user && selectedPreviewCategory && (() => {
                      const selectedCat = allPrices.categories.find(c => c.id === selectedPreviewCategory);
                      if (!selectedCat) return null;
                      const previewPrice = selectedCat[allPrices.currentTier] || selectedCat.earlybird || selectedCat.standard || selectedCat.onsite || 0;
                      const isActualUserCategory = user ? userPriceInfo.category === selectedPreviewCategory : selectedPreviewCategory === 'regular';
                      const tierLabels = { earlybird: 'Early Bird', standard: 'Standard', onsite: 'On-site' };

                      return (
                        <div className={`mt-4 p-4 rounded-lg border-2 ${isActualUserCategory
                          ? 'bg-gradient-to-r from-[#03215F]/10 to-[#03215F]/5 border-[#03215F]'
                          : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400'
                          }`}>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-700">
                                  {selectedCat.name}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${allPrices.currentTier === 'earlybird' ? 'bg-green-100 text-green-700' :
                                  allPrices.currentTier === 'standard' ? 'bg-blue-100 text-blue-700' :
                                    'bg-orange-100 text-orange-700'
                                  }`}>
                                  {tierLabels[allPrices.currentTier] || 'Current'}
                                </span>
                                {isActualUserCategory && (
                                  <span className="px-2 py-0.5 bg-[#03215F] text-white text-[10px] rounded-full font-bold">
                                    YOUR CATEGORY
                                  </span>
                                )}
                              </div>
                              {!isActualUserCategory && (
                                <p className="text-xs text-amber-700">
                                  <AlertCircle className="w-3 h-3 inline mr-1" />
                                  This is a preview only. Your actual price is based on your profile category.
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#03215F]">
                                {formatBHD(previewPrice)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {tierLabels[allPrices.currentTier]} Price
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-start p-3 md:p-4 bg-white rounded-xl border border-gray-200/50">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 mt-0.5 text-[#03215F] flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm md:text-base">Start Date</div>
                      <div className="text-xs md:text-sm text-gray-600">
                        {formatDate(event.start_datetime)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start p-3 md:p-4 bg-white rounded-xl border border-gray-200/50">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 mt-0.5 text-[#03215F] flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm md:text-base">End Date</div>
                      <div className="text-xs md:text-sm text-gray-600">
                        {formatDate(event.end_datetime)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start p-3 md:p-4 bg-white rounded-xl border border-gray-200/50">
                    <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 mt-0.5 text-[#03215F] flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm md:text-base">Time</div>
                      <div className="text-xs md:text-sm text-gray-600">
                        {formatTime(event.start_datetime)}
                        {event.end_datetime && ` - ${formatTime(event.end_datetime)}`}
                      </div>
                    </div>
                  </div>




                  <div className="flex items-start p-3 md:p-4 bg-white rounded-xl border border-gray-200/50">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 mt-0.5 text-[#03215F] flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm md:text-base">Venue</div>
                      <div className="text-xs md:text-sm text-gray-600">
                        {event.venue_name || 'Online Event'}
                      </div>
                      {event.address && (
                        <div className="text-xs text-gray-500 mt-1">
                          {event.address}
                        </div>
                      )}
                    </div>
                  </div>


                </div>

                {/* Description */}
                {event.description && (
                  <div className="mt-4 md:mt-6">
                    <h4 className="font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                      <span className="text-sm md:text-base">About This Event</span>
                    </h4>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                      {event.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Agenda Tab */}
            {activeTab === 'agenda' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">Event Agenda</h3>
                </div>

                {event.event_agendas && event.event_agendas.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {event.event_agendas.map((agenda, index) => (
                      <div key={index} className="relative">
                        {/* Timeline */}
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#03215F] via-[#03215F] to-transparent"></div>

                        <div className="ml-5 md:ml-6">
                          <div className="flex items-start flex-wrap gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/50">
                            {/* Time Badge */}
                            <div className="flex-shrink-0">
                              <div className="px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-lg text-white font-medium text-xs md:text-sm">
                                {formatAgendaTime(agenda.start_time)}
                                {agenda.end_time && ` - ${formatAgendaTime(agenda.end_time)}`}
                              </div>
                            </div>

                            {/* Agenda Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                                {agenda.title}
                              </h4>
                              {agenda.agenda_date && (
                                <div className="text-xs md:text-sm text-gray-500 mb-2">
                                  {formatDate(agenda.agenda_date)}
                                </div>
                              )}
                              {agenda.description && (
                                <p className="text-gray-600 text-xs md:text-sm">
                                  {agenda.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm md:text-base">
                      Agenda will be announced soon
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Hosts Tab */}
            {activeTab === 'hosts' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mic className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">Event Hosts</h3>
                </div>

                {event.event_hosts && event.event_hosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {event.event_hosts.map((host, index) => (
                      <div key={index} className="p-3 md:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/50">
                        <div className="flex items-center gap-3 md:gap-4">
                          {/* Host Avatar */}
                          <div className="relative">
                            {host.profile_image ? (
                              <img
                                src={host.profile_image}
                                alt={host.name}
                                className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white shadow-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] border-2 border-white flex items-center justify-center shadow-lg">
                                <User className="w-6 h-6 md:w-8 md:h-8 text-[#03215F]" />
                              </div>
                            )}
                            {host.is_primary && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] rounded-full flex items-center justify-center border border-white">
                                <Award className="w-2 h-2 md:w-3 md:h-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Host Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm md:text-base">
                              {host.name}
                            </h4>
                            {host.is_primary && (
                              <div className="inline-flex items-center px-2 py-0.5 md:px-2 md:py-1 bg-gradient-to-r from-[#ECCF0F]/10 to-[#ECCF0F]/10 rounded text-xs font-medium text-[#ECCF0F] mb-1 md:mb-2">
                                <Award className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                                Primary Host
                              </div>
                            )}
                            {host.role && (
                              <p className="text-xs md:text-sm text-gray-600">
                                {host.role}
                              </p>
                            )}
                            {host.bio && (
                              <p className="text-xs text-gray-500 mt-1 md:mt-2 line-clamp-2">
                                {host.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm md:text-base">
                      Host information will be announced soon
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with Action Buttons */}
          <div className="border-t border-gray-200 p-2 sm:p-3 md:p-4 lg:p-6 bg-gradient-to-t from-white to-gray-50">
            {/* Payment Methods Selection - Step 2 */}
            {paymentStep === 2 && paymentMethods.length > 0 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Select Payment Method</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Choose your preferred payment method</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-[#b8352d] border border-[#b8352d] rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                      <p className="text-white text-xs sm:text-sm font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-48 sm:max-h-64 overflow-y-auto">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleSelectMethod(method)}
                      className={`p-3 sm:p-4 border-2 rounded-lg transition-all text-left ${selectedMethod?.id === method.id
                        ? 'border-[#03215F] bg-[#03215F]/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        {method.imageUrl && (
                          <div className="flex-shrink-0">
                            <img
                              src={method.imageUrl}
                              alt={method.name}
                              className="w-10 h-7 sm:w-12 sm:h-8 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{method.name}</div>

                        </div>
                        {selectedMethod?.id === method.id && (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#03215F] flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedMethod && (
                  <button
                    onClick={handleExecutePayment}
                    disabled={processing}
                    className="w-full py-3 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm sm:text-base">Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">Pay with {selectedMethod.name}</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    setPaymentStep(1);
                    setSelectedMethod(null);
                    setPaymentMethods([]);
                    setError(null);
                  }}
                  className="w-full py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Processing - Step 3 */}
            {paymentStep === 3 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#03215F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 text-sm sm:text-base">Redirecting to payment gateway...</p>
              </div>
            )}

            {/* Default Join Button - Step 1 */}
            {paymentStep === 1 && (
              <>
                {/* Pricing Summary */}
                <div className="mb-3 sm:mb-4 md:mb-6">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700">
                      Registration Summary
                      {isEarlyBird && event.is_paid && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center gap-1 ml-2">
                          <Sparkles className="w-3 h-3" /> EARLY BIRD
                          {earlyBirdCountdown && (
                            <span className="flex items-center gap-1 ml-1 pl-1.5 border-l border-white/30">
                              <Clock className="w-3 h-3" />
                              {earlyBirdCountdown}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                      {appliedCoupon ? formatBHD(appliedCoupon.final_amount) : formatBHD(priceToPay)}
                    </div>
                  </div>
                  {event.is_paid && (
                    <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          Base Price ({displayCategoryInfo.categoryDisplay})
                        </span>
                        <span className="text-gray-700">
                          {formatBHD(priceToPay)}
                        </span>
                      </div>
                      {user?.membership_type === 'paid' && event.member_price && (
                        <div className="flex items-center justify-between text-[#AE9B66]">
                          <span className="flex items-center gap-1">
                            <Gift className="w-3 h-3 md:w-4 md:h-4" />
                            Member Discount
                          </span>
                          <span>-{formatBHD(memberSavings)}</span>
                        </div>
                      )}
                      {appliedCoupon && (
                        <div className="flex items-center justify-between text-emerald-600">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3 md:w-4 md:h-4" />
                            Coupon {appliedCoupon.code}
                          </span>
                          <span>-{formatBHD(appliedCoupon.discount_amount)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-1 md:pt-2 mt-1 md:mt-2">
                        <div className="flex items-center justify-between font-semibold">
                          <span>Amount to Pay</span>
                          <span className="flex items-center gap-1">
                            <BahrainFlag />
                            {appliedCoupon ? formatBHD(appliedCoupon.final_amount) : formatBHD(priceToPay)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {event.is_paid && user && (
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Have a coupon code?</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent tracking-widest uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon}
                        className="px-3 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl text-xs md:text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {appliedCoupon && (
                      <p className="text-[11px] text-emerald-700">
                        Coupon {appliedCoupon.code} applied. New amount: {formatBHD(appliedCoupon.final_amount)}
                      </p>
                    )}
                  </div>
                )}

                {/* Join Button */}
                <button
                  onClick={handleJoinEvent}
                  disabled={loading || event.joined || loadingMethods || derivedStatus !== 'upcoming'}
                  className={`w-full py-2.5 sm:py-3 md:py-4 rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all relative overflow-hidden group ${event.joined || derivedStatus !== 'upcoming'
                    ? "bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white cursor-not-allowed"
                    : loading || loadingMethods
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed"
                      : user
                        ? "bg-gradient-to-r from-[#03215F] to-[#03215F] hover:from-[#03215F] hover:to-[#03215F] text-white hover:shadow-lg"
                        : "bg-gradient-to-r from-[#03215F] to-[#03215F] hover:from-[#03215F] hover:to-[#9cc2ed] text-white hover:shadow-lg"
                    }`}
                >
                  {loading || loadingMethods ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs sm:text-sm md:text-base">Processing...</span>
                    </div>
                  ) : event.joined || derivedStatus !== 'upcoming' ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-xs sm:text-sm md:text-base">
                        {event.joined ? 'Already Joined' : 'Registration Closed'}
                      </span>
                    </div>
                  ) : user ? (
                    <>
                      <span className="text-xs sm:text-sm md:text-base">
                        {event.is_paid ? (
                          `Pay ${formatBHD(appliedCoupon ? appliedCoupon.final_amount : priceToPay)} & Join Now`
                        ) : (
                          'Join Event for Free'
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 group-hover:translate-x-full transition-transform duration-1000"></div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <LogIn className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-xs sm:text-sm md:text-base">Login to Join</span>
                    </div>
                  )}
                </button>

                {/* Security Notice */}
                <div className="mt-2 sm:mt-3 md:mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Lock className="w-3 h-3" />
                  <span className="hidden xs:inline">Secure registration • Powered by MyFatoorah • 256-bit SSL</span>
                  <span className="xs:hidden">Secure registration</span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}