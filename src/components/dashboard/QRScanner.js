'use client'

import { useState, useRef } from 'react'
import { QrCode, Camera, CameraOff, CheckCircle, XCircle, Scan } from 'lucide-react'

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState(null)
  const videoRef = useRef(null)

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
        setScanResult(null)
        setScanError(null)
      }
    } catch (err) {
      setScanError('Camera access denied. Please enable camera permissions.')
    }
  }

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const handleScan = () => {
    // Simulate QR code scan
    const result = {
      success: true,
      memberId: 'BDS-2024-0583',
      memberName: 'Dr. Ahmed Ali',
      eventId: 'EVT-2024-001',
      eventTitle: 'Annual Dental Conference',
      scanTime: new Date().toLocaleString(),
      status: 'Valid'
    }
    
    setScanResult(result)
    stopScanner()
  }

  const validateScan = () => {
    // Add validation logic here
    return true
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">QR Code Scanner</h2>
          <p className="text-gray-600">Scan event tickets and member cards</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 rounded-full bg-[#03215F]/10 text-white text-sm font-medium">
            Admin Mode
          </div>
        </div>
      </div>

      {/* Scanner Container */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {!isScanning ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <QrCode className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Ready to Scan
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Position the QR code within the frame to scan event tickets or membership cards
            </p>
            <button
              onClick={startScanner}
              className="px-8 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold flex items-center justify-center mx-auto"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Scanning
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Camera Preview */}
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-96 object-cover"
              />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Scanning Frame */}
                  <div className="absolute inset-0 border-2 border-[#03215F] rounded-lg"></div>
                  
                  {/* Corner Borders */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#03215F] rounded-tl"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#03215F] rounded-tr"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#03215F] rounded-bl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#03215F] rounded-br"></div>
                  
                  {/* Scanning Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#03215F] animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleScan}
                className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold flex items-center"
              >
                <Scan className="w-5 h-5 mr-2" />
                Simulate Scan
              </button>
              <button
                onClick={stopScanner}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center"
              >
                <CameraOff className="w-5 h-5 mr-2" />
                Stop Scanner
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {scanError && (
          <div className="mt-6 p-4 bg-[#b8352d] border border-[#b8352d] rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-[#b8352d] mr-2" />
              <span className="font-semibold text-[#b8352d]">{scanError}</span>
            </div>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <div className="mt-6 p-6 bg-[#AE9B66] border border-[#AE9B66] rounded-xl">
            <div className="flex items-start mb-4">
              <CheckCircle className="w-6 h-6 text-[#AE9B66] mr-3" />
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">
                  Scan Successful!
                </h4>
                <p className="text-gray-600">
                  Member verified successfully
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Member ID</p>
                  <p className="text-lg font-semibold text-gray-900">{scanResult.memberId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Member Name</p>
                  <p className="text-lg font-semibold text-gray-900">{scanResult.memberName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Scan Time</p>
                  <p className="text-lg font-semibold text-gray-900">{scanResult.scanTime}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Event ID</p>
                  <p className="text-lg font-semibold text-gray-900">{scanResult.eventId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Event Title</p>
                  <p className="text-lg font-semibold text-gray-900">{scanResult.eventTitle}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Validation Status</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#AE9B66] text-white">
                    {scanResult.status}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#AE9B66] flex justify-end">
              <button
                onClick={() => setScanResult(null)}
                className="px-6 py-2 border-2 border-[#03215F] text-[#03215F] rounded-lg hover:bg-[#03215F]/10 transition-colors font-semibold"
              >
                Scan Another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Scans */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Scans</h3>
        <div className="space-y-3">
          {[
            { id: 1, name: 'Dr. Fatima Ahmed', time: '10:30 AM', event: 'Workshop', status: 'Valid' },
            { id: 2, name: 'Dr. Khalid Hassan', time: '9:45 AM', event: 'Conference', status: 'Valid' },
            { id: 3, name: 'Dr. Mariam Al Said', time: 'Yesterday', event: 'Seminar', status: 'Expired' },
          ].map((scan) => (
            <div key={scan.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#03215F]/20 to-[#03215F]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#03215F]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{scan.name}</p>
                  <p className="text-sm text-gray-600">{scan.event} • {scan.time}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                scan.status === 'Valid' 
                  ? 'bg-[#AE9B66] text-white'
                  : 'bg-[#b8352d] text-white'
              }`}>
                {scan.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}