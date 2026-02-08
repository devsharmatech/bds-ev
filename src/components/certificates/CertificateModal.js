'use client'

import { useRef, useState, useEffect } from 'react'
import { X, Download, Printer } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import CertificateTemplate from './CertificateTemplate'
import toast from 'react-hot-toast'

export default function CertificateModal({ certificate, user, isOpen, onClose }) {
  const certificateRef = useRef(null)
  const [generating, setGenerating] = useState(false)
  const [resolvedUser, setResolvedUser] = useState(user || null)
  const [eventMeta, setEventMeta] = useState(null)

  // Ensure we always have a user name for the certificate, even if the page didn't fetch it yet
  useEffect(() => {
    setResolvedUser(user || null)
  }, [user])

  useEffect(() => {
    if (!isOpen) return
    // If no user or missing full_name, fetch it
    if (!resolvedUser || !resolvedUser.full_name) {
      ;(async () => {
        try {
          const res = await fetch('/api/auth/me', { credentials: 'include' })
          if (res.ok) {
            const data = await res.json()
            if (data?.user) setResolvedUser(data.user)
          }
        } catch (_e) {
          // ignore; template will fallback gracefully
        }
      })()
    }
    // Fetch event meta (nera fields) if missing on certificate
    if (certificate?.event_id && (!certificate?.nera_cme_hours || !certificate?.nera_code)) {
      ;(async () => {
        try {
          const res = await fetch(`/api/event/${certificate.event_id}`)
          if (res.ok) {
            const data = await res.json()
            const ev = data?.event || data?.data || data
            if (ev) {
              setEventMeta({
                nera_cme_hours: ev.nera_cme_hours,
                nera_code: ev.nera_code,
              })
            }
          }
        } catch (_e) {
          // ignore
        }
      })()
    }
  }, [isOpen, resolvedUser])

  

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return

    try {
      setGenerating(true)
      toast.loading('Generating PDF...')

      // Capture the certificate as canvas with options to handle modern CSS
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: certificateRef.current.offsetWidth,
        height: certificateRef.current.offsetHeight,
        ignoreElements: (element) => {
          // Ignore elements that might cause issues
          return false
        },
        onclone: (clonedDoc) => {
          // Convert modern color functions to hex/rgb before capturing
          const style = clonedDoc.createElement('style')
          style.textContent = `
            * {
              color: inherit !important;
            }
          `
          clonedDoc.head.appendChild(style)
          
          // Remove any elements with lab() or other modern color functions
          const allElements = clonedDoc.querySelectorAll('*')
          allElements.forEach(el => {
            const computedStyle = window.getComputedStyle(el)
            // Force standard colors
            if (el.style.color && el.style.color.includes('lab')) {
              el.style.color = '#03215F'
            }
            if (el.style.backgroundColor && el.style.backgroundColor.includes('lab')) {
              el.style.backgroundColor = '#ffffff'
            }
          })
        }
      })

      // Calculate PDF dimensions (US Letter: 8.5 x 11 inches)
      const imgWidth = 8.5
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'in',
        format: [imgWidth, imgHeight]
      })

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

      // Generate filename
      const eventTitle = certificate?.event_title?.replace(/[^a-z0-9]/gi, '_').substring(0, 30) || 'Certificate'
      const date = new Date(certificate?.checked_in_at || certificate?.event_date || new Date())
        .toISOString()
        .split('T')[0]
      const filename = `BDS_Certificate_${eventTitle}_${date}.pdf`

      // Save PDF
      pdf.save(filename)
      
      toast.dismiss()
      toast.success('Certificate downloaded successfully!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.dismiss()
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#03215F] to-[#AE9B66]">
              <h2 className="text-xl font-bold text-white">Certificate of Attendance</h2>
              <div className="flex items-center gap-2">
                
                <button
                  onClick={handleDownloadPDF}
                  disabled={generating}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors disabled:opacity-50"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Content */}
            <div className="overflow-auto max-h-[calc(95vh-80px)] bg-gray-100 p-4">
              <div className="bg-white shadow-lg mx-auto" style={{ width: '816px', minWidth: '816px' }}>
                <div ref={certificateRef}>
                  <CertificateTemplate 
                    certificate={{ 
                      ...certificate, 
                      ...(eventMeta || {}) 
                    }} 
                    user={resolvedUser || user}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}

