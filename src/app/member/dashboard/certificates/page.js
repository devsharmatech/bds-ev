// app/dashboard/certificates/page.js
'use client'

import { useState, useEffect } from 'react'
import {
  Award,
  Download,
  Calendar,
  Clock,
  MapPin,
  Filter,
  Search,
  FileText,
  CheckCircle,
  Star,
  Crown,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import CertificateModal from '@/components/certificates/CertificateModal'

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-BH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export default function CertificatesPage() {
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState([])
  const [filteredCertificates, setFilteredCertificates] = useState([])
  const [user, setUser] = useState(null)
  const [selectedCertificate, setSelectedCertificate] = useState(null)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [filters, setFilters] = useState({
    year: 'all',
    search: ''
  })
  const [stats, setStats] = useState({
    total: 0,
    thisYear: 0,
    lastYear: 0
  })

  useEffect(() => {
    fetchUser()
    fetchCertificates()
  }, [])

  useEffect(() => {
    filterCertificates()
  }, [certificates, filters])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setUser(data.user)
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      
      const res = await fetch('/api/dashboard/certificates', {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setCertificates(data.certificates || [])
          calculateStats(data.certificates || [])
        }
      }
    } catch (error) {
      console.error('Error fetching certificates:', error)
      toast.error('Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (certs) => {
    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1
    
    const stats = {
      total: certs.length,
      thisYear: certs.filter(c => {
        const certDate = new Date(c.checked_in_at || c.event_date)
        return certDate.getFullYear() === currentYear
      }).length,
      lastYear: certs.filter(c => {
        const certDate = new Date(c.checked_in_at || c.event_date)
        return certDate.getFullYear() === lastYear
      }).length
    }
    
    setStats(stats)
  }

  const filterCertificates = () => {
    let filtered = [...certificates]

    // Filter by year
    if (filters.year !== 'all') {
      const year = parseInt(filters.year)
      filtered = filtered.filter(cert => {
        const certDate = new Date(cert.checked_in_at || cert.event_date)
        return certDate.getFullYear() === year
      })
    }

    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(cert =>
        cert.event_title?.toLowerCase().includes(searchTerm) ||
        cert.venue_name?.toLowerCase().includes(searchTerm)
      )
    }

    setFilteredCertificates(filtered)
  }

  const handleViewCertificate = (cert) => {
    setSelectedCertificate(cert)
    setShowCertificateModal(true)
  }

  // Get available years for filter
  const getAvailableYears = () => {
    const years = new Set()
    certificates.forEach(cert => {
      const certDate = new Date(cert.checked_in_at || cert.event_date)
      years.add(certDate.getFullYear())
    })
    return Array.from(years).sort((a, b) => b - a)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#03215F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading certificates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">My Certificates</h1>
            <p className="text-white/80">Download your event attendance certificates</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Award className="w-8 h-8" />
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-white/80 text-sm">Certificates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#03215F20' }}>
              <Award className="w-6 h-6" style={{ color: '#03215F' }} />
            </div>
            <span className="text-2xl font-bold" style={{ color: '#03215F' }}>{stats.total}</span>
          </div>
          <p className="text-gray-600 text-sm">Total</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#AE9B6620' }}>
              <Star className="w-6 h-6" style={{ color: '#AE9B66' }} />
            </div>
            <span className="text-2xl font-bold" style={{ color: '#AE9B66' }}>{stats.thisYear}</span>
          </div>
          <p className="text-gray-600 text-sm">This Year</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#03215F20' }}>
              <Calendar className="w-6 h-6" style={{ color: '#03215F' }} />
            </div>
            <span className="text-2xl font-bold" style={{ color: '#03215F' }}>{stats.lastYear}</span>
          </div>
          <p className="text-gray-600 text-sm">Last Year</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search certificates..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Years</option>
              {getAvailableYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <button
              onClick={() => setFilters({ year: 'all', search: '' })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              style={{ color: '#03215F' }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      {filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Certificate Header */}
              <div className="bg-gradient-to-r from-[#03215F]/20 to-[#AE9B66]/20 p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="w-6 h-6" style={{ color: '#03215F' }} />
                    <h3 className="font-bold" style={{ color: '#03215F' }}>Certificate</h3>
                  </div>
                  <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded">
                    #{cert.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Certificate Content */}
              <div className="p-4">
                <h4 className="font-bold text-lg mb-3 line-clamp-2" style={{ color: '#03215F' }}>
                  {cert.event_title}
                </h4>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(cert.checked_in_at || cert.event_date)}
                  </div>
                  
                  {cert.venue_name && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{cert.venue_name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Attended
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Certificate ID</span>
                    <span className="font-mono text-sm" style={{ color: '#03215F' }}>CERT-{cert.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Issued Date</span>
                    <span className="text-sm">{formatDate(cert.checked_in_at || cert.event_date)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewCertificate(cert)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    View Certificate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#03215F' }}>
            No certificates found
          </h3>
          <p className="text-gray-600 mb-6">
            {certificates.length === 0 
              ? 'You have not attended any events yet. Attend events to earn certificates.' 
              : 'No certificates match your filters.'}
          </p>
        </div>
      )}

      {/* Certificate Modal */}
      <CertificateModal
        certificate={selectedCertificate}
        user={user}
        isOpen={showCertificateModal}
        onClose={() => {
          setShowCertificateModal(false)
          setSelectedCertificate(null)
        }}
      />
    </div>
  )
}