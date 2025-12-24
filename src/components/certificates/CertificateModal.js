'use client'

import { useRef, useState } from 'react'
import { X, Download, Printer } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import CertificateTemplate from './CertificateTemplate'
import toast from 'react-hot-toast'

export default function CertificateModal({ certificate, user, isOpen, onClose }) {
  const certificateRef = useRef(null)
  const [generating, setGenerating] = useState(false)

  const handlePrint = () => {
    if (!certificateRef.current) return

    try {
      // Clone the certificate element
      const printContent = certificateRef.current.cloneNode(true)
      
      // Remove any modern color functions from inline styles
      const allElements = printContent.querySelectorAll('*')
      allElements.forEach(el => {
        if (el.style) {
          // Replace any lab() color functions with standard colors
          if (el.style.color && el.style.color.includes('lab')) {
            el.style.color = '#03215F'
          }
          if (el.style.backgroundColor && el.style.backgroundColor.includes('lab')) {
            el.style.backgroundColor = '#ffffff'
          }
          if (el.style.borderColor && el.style.borderColor.includes('lab')) {
            el.style.borderColor = '#03215F'
          }
        }
      })

      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      
      // Get all stylesheets and clean them
      let stylesheets = ''
      try {
        stylesheets = Array.from(document.styleSheets)
          .map(sheet => {
            try {
              return Array.from(sheet.cssRules)
                .map(rule => rule.cssText)
                .join('\n')
            } catch (e) {
              return ''
            }
          })
          .join('\n')
          .replace(/lab\([^)]+\)/g, '#03215F') // Replace lab() functions
      } catch (e) {
        console.warn('Could not extract stylesheets:', e)
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Certificate - ${certificate?.event_title || 'Certificate'}</title>
            <meta charset="utf-8">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: serif;
                margin: 0;
                padding: 0;
                background: white;
                width: 8.5in;
                height: 11in;
                overflow: hidden;
              }
              
              .certificate-container {
                width: 8.5in !important;
                height: 11in !important;
                margin: 0 auto;
                padding: 0;
                background: white;
                position: relative;
                page-break-after: avoid;
                page-break-inside: avoid;
              }
              
              @media print {
                @page {
                  size: letter portrait;
                  margin: 0;
                }
                
                body {
                  width: 8.5in;
                  height: 11in;
                  margin: 0;
                  padding: 0;
                  background: white;
                }
                
                .certificate-container {
                  width: 8.5in !important;
                  height: 11in !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  page-break-after: avoid;
                  page-break-inside: avoid;
                  overflow: hidden;
                }
                
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
              }
              
              ${stylesheets}
            </style>
          </head>
          <body>
            ${printContent.outerHTML}
          </body>
        </html>
      `)

      printWindow.document.close()
      
      // Wait for content and images to load, then print
      setTimeout(() => {
        // Ensure all images are loaded
        const images = printWindow.document.querySelectorAll('img')
        let imagesLoaded = 0
        const totalImages = images.length
        
        if (totalImages === 0) {
          printWindow.focus()
          printWindow.print()
          toast.success('Print dialog opened')
          return
        }
        
        images.forEach(img => {
          if (img.complete) {
            imagesLoaded++
          } else {
            img.onload = () => {
              imagesLoaded++
              if (imagesLoaded === totalImages) {
                printWindow.focus()
                printWindow.print()
                toast.success('Print dialog opened')
              }
            }
            img.onerror = () => {
              imagesLoaded++
              if (imagesLoaded === totalImages) {
                printWindow.focus()
                printWindow.print()
                toast.success('Print dialog opened')
              }
            }
          }
        })
        
        if (imagesLoaded === totalImages) {
          printWindow.focus()
          printWindow.print()
          toast.success('Print dialog opened')
        }
      }, 500)
    } catch (error) {
      console.error('Print error:', error)
      toast.error('Failed to open print dialog')
    }
  }

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
                  onClick={handlePrint}
                  disabled={generating}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors disabled:opacity-50"
                  title="Print Certificate"
                >
                  <Printer className="w-5 h-5" />
                </button>
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
            <div className="overflow-y-auto max-h-[calc(95vh-80px)] bg-gray-100 p-4">
              <div className="bg-white shadow-lg">
                <div ref={certificateRef}>
                  <CertificateTemplate 
                    certificate={certificate} 
                    user={user}
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

