'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BriefcaseMedical,
  Building,
  GraduationCap,
  Award,
  Shield,
  Save,
  Camera,
  Lock,
  Bell,
  Globe,
  FileText,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Crown,
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  Heart,
  Target,
  Briefcase,
  Home,
  Flag,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Globe as GlobeIcon,
  Shield as ShieldIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    email: '',
    phone: '',
    mobile: '',
    
    // Professional Information
    specialty: '',
    position: '',
    employer: '',
    work_sector: '',
    
    // Additional Information
    address: '',
    city: '',
    state: '',
    pin_code: '',
    nationality: '',
    gender: '',
    dob: '',
    
    // Membership Information
    membership_code: '',
    membership_type: '',
    membership_status: '',
    membership_date: '',
    membership_expiry_date: ''
  })

  // Specialty options
  const specialties = [
    { value: '', label: 'Select Specialty' },
    { value: 'general', label: 'General Dentistry' },
    { value: 'orthodontics', label: 'Orthodontics' },
    { value: 'pediatric', label: 'Pediatric Dentistry' },
    { value: 'periodontics', label: 'Periodontics' },
    { value: 'endodontics', label: 'Endodontics' },
    { value: 'oral_surgery', label: 'Oral Surgery' },
    { value: 'prosthodontics', label: 'Prosthodontics' },
    { value: 'cosmetic', label: 'Cosmetic Dentistry' },
    { value: 'implantology', label: 'Implantology' },
    { value: 'forensic', label: 'Forensic Dentistry' },
    { value: 'public_health', label: 'Public Health Dentistry' }
  ]

  // Work sector options
  const workSectors = [
    { value: '', label: 'Select Work Sector' },
    { value: 'private', label: 'Private Practice' },
    { value: 'government', label: 'Government Hospital' },
    { value: 'military', label: 'Military Hospital' },
    { value: 'academic', label: 'Academic Institution' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'research', label: 'Research Institution' },
    { value: 'public_sector', label: 'Public Sector' }
  ]

  // Gender options
  const genders = [
    { value: '', label: 'Select Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ]

  // Nationality options (GCC countries)
  const nationalities = [
    { value: '', label: 'Select Nationality' },
    { value: 'bahraini', label: 'Bahraini' },
    { value: 'saudi', label: 'Saudi Arabian' },
    { value: 'emirati', label: 'Emirati' },
    { value: 'kuwaiti', label: 'Kuwaiti' },
    { value: 'omani', label: 'Omani' },
    { value: 'qatari', label: 'Qatari' },
    { value: 'other_gcc', label: 'Other GCC' },
    { value: 'other_arab', label: 'Other Arab' },
    { value: 'other', label: 'Other' }
  ]

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      
      const res = await fetch('/api/dashboard/profile', {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setUser(data.user)
          setFormData({
            full_name: data.user.full_name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            mobile: data.user.mobile || '',
            specialty: data.user.specialty || '',
            position: data.user.position || '',
            employer: data.user.employer || '',
            work_sector: data.user.work_sector || '',
            address: data.user.address || '',
            city: data.user.city || '',
            state: data.user.state || '',
            pin_code: data.user.pin_code || '',
            nationality: data.user.nationality || '',
            gender: data.user.gender || '',
            dob: data.user.dob || '',
            membership_code: data.user.membership_code || '',
            membership_type: data.user.membership_type || '',
            membership_status: data.user.membership_status || '',
            membership_date: data.user.membership_date || '',
            membership_expiry_date: data.user.membership_expiry_date || ''
          })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      const res = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success('Profile updated successfully!', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#03215F',
            color: 'white',
          }
        })
        fetchProfile() // Refresh data
      } else {
        toast.error(data.message || 'Failed to update profile', {
          duration: 4000,
          position: 'top-right'
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile', {
        duration: 4000,
        position: 'top-right'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Calculate membership days
  const getMembershipDays = () => {
    if (!formData.membership_date) return 0
    const joinDate = new Date(formData.membership_date)
    const today = new Date()
    const diffTime = Math.abs(today - joinDate)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-BH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/30 text-green-500 border-green-500'
      case 'inactive': return 'bg-[#b8352d] text-white border-[#b8352d]'
      case 'expired': return 'bg-[#ECCF0F] text-[#03215F] border-[#ECCF0F]'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'paid': return 'bg-[#03215F] text-white border-[#03215F]'
      case 'free': return 'bg-[#9cc2ed] text-[#03215F] border-[#9cc2ed]'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#03215F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-white/80 text-sm md:text-base">Manage your personal and professional information</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-white/20">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/40 flex items-center justify-center">
              <User className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div>
              <h3 className="font-bold text-lg md:text-xl">{user?.full_name || 'Member'}</h3>
              <p className="text-white/80 text-sm">{user?.membership_code || 'No Membership ID'}</p>
              <div className="flex items-center gap-2 mt-1">
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user?.membership_status)}`}>
                  {user?.membership_status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-r from-[#9cc2ed] to-[#9cc2ed] rounded-lg mr-3">
                <User className="w-5 h-5 md:w-6 md:h-6 text-[#03215F]" />
              </div>
              Personal Information
            </h2>
            <div className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
              Required fields marked with *
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-transparent focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed focus:outline-none"
                  placeholder="Email address"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                Email cannot be changed
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-transparent focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 transition-colors"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <PhoneIcon className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-transparent focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 transition-colors"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-transparent focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-transparent focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 transition-colors appearance-none"
                  style={{
                    color: formData.gender ? 'inherit' : '#9CA3AF'
                  }}
                >
                  {genders.map((option) => (
                    <option 
                      key={option.value} 
                      value={option.value}
                      className="bg-white text-gray-900"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] rounded-lg mr-3">
                <BriefcaseMedical className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              Professional Information
            </h2>
            <div className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
              Build your professional profile
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Specialty
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-transparent focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 transition-colors appearance-none"
                  style={{
                    color: formData.specialty ? 'inherit' : '#9CA3AF'
                  }}
                >
                  {specialties.map((option) => (
                    <option 
                      key={option.value} 
                      value={option.value}
                      className="bg-white text-gray-900"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Position / Title
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-transparent focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 transition-colors"
                  placeholder="e.g., Senior Dentist, Specialist"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Employer / Clinic Name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="employer"
                  value={formData.employer}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-transparent focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 transition-colors"
                  placeholder="Enter employer or clinic name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Work Sector
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <BriefcaseMedical className="w-4 h-4" />
                </div>
                <select
                  name="work_sector"
                  value={formData.work_sector}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-transparent focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 transition-colors appearance-none"
                  style={{
                    color: formData.work_sector ? 'inherit' : '#9CA3AF'
                  }}
                >
                  {workSectors.map((option) => (
                    <option 
                      key={option.value} 
                      value={option.value}
                      className="bg-white text-gray-900"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
              <div className="p-2 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] rounded-lg mr-3">
                <MapPin className="w-5 h-5 md:w-6 md:h-6 text-[#03215F]" />
              </div>
              Address Information
            </h2>
            <div className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
              Your contact location
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Complete Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <Home className="w-4 h-4" />
                </div>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-transparent focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 transition-colors resize-none"
                  placeholder="Enter your full address"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-transparent focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 transition-colors"
                  placeholder="Enter city"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                State / Governorate
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <GlobeIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-transparent focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 transition-colors"
                  placeholder="Enter state"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Pin Code
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="pin_code"
                  value={formData.pin_code}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-transparent focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 transition-colors"
                  placeholder="Enter pin code"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nationality
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Flag className="w-4 h-4" />
                </div>
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-transparent focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 transition-colors appearance-none"
                  style={{
                    color: formData.nationality ? 'inherit' : '#9CA3AF'
                  }}
                >
                  {nationalities.map((option) => (
                    <option 
                      key={option.value} 
                      value={option.value}
                      className="bg-white text-gray-900"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

      

        {/* Submit Button */}
        <div className="sticky bottom-0 md:static bg-white md:bg-transparent p-4 md:p-0 border-t md:border-0 border-gray-200 md:flex md:justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}