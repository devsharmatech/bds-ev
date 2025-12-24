'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Shield, User, Calendar, CreditCard, Download, Share2, Smartphone } from 'lucide-react'

export default function MembershipCard() {
  const [isFlipped, setIsFlipped] = useState(false)

  const memberData = {
    name: "Dr. Ahmed Ali Al Khalifa",
    memberId: "BDS-2024-0583",
    specialty: "Orthodontics",
    status: "Active",
    expiry: "December 31, 2024",
    joinDate: "January 15, 2020",
    category: "Gold Member",
    qrData: "BDS:MEMBER:2024-0583:AHMED:ALI:ORTHODONTICS"
  }

  return (
    <div className="space-y-6">
      {/* Card Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Digital Membership Card</h2>
          <p className="text-gray-600">Your official BDS digital identity</p>
        </div>
        <div className="flex space-x-3">
          <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
            <Smartphone className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Card Container */}
      <div className="relative">
        {/* Flip Button */}
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="absolute top-4 right-4 z-10 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white"
        >
          {isFlipped ? 'Show Front' : 'Show Back'}
        </button>

        {/* Card Front */}
        <div className={`
          relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-500
          ${isFlipped ? 'opacity-0 absolute inset-0' : 'opacity-100'}
        `}>
          <div className="bg-gradient-to-br from-[#03215F] via-[#9cc2ed] to-[#03215F] text-white p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8" />
                <div>
                  <h3 className="text-2xl font-bold">BDS Membership</h3>
                  <p className="text-sm opacity-90">Bahrain Dental Society</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-80">Status</div>
                <div className="px-3 py-1 bg-[#AE9B66]/20 rounded-full text-xs font-semibold">
                  {memberData.status.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Member Info */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <div className="flex items-center space-x-2 text-sm opacity-80 mb-2">
                  <User className="w-4 h-4" />
                  <span>Member</span>
                </div>
                <p className="text-xl font-bold">{memberData.name}</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 text-sm opacity-80 mb-2">
                  <CreditCard className="w-4 h-4" />
                  <span>ID Number</span>
                </div>
                <p className="text-lg font-mono font-bold">{memberData.memberId}</p>
              </div>
              
              <div>
                <div className="text-sm opacity-80 mb-2">Specialty</div>
                <p className="font-semibold">{memberData.specialty}</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 text-sm opacity-80 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Member Since</span>
                </div>
                <p className="font-semibold">{memberData.joinDate}</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex items-center justify-between p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <div>
                <h4 className="font-bold mb-2">Digital Membership Card</h4>
                <p className="text-sm opacity-90">
                  Present this QR code at BDS events and facilities
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <QRCodeSVG 
                  value={memberData.qrData}
                  size={100}
                  bgColor="#ffffff"
                  fgColor="#03215F"
                  level="H"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex justify-between text-xs opacity-75">
                <span>Valid until {memberData.expiry}</span>
                <span>Bahrain Dental Society ©</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Back */}
        <div className={`
          relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-500
          ${isFlipped ? 'opacity-100' : 'opacity-0 absolute inset-0'}
        `}>
          <div className="bg-gradient-to-br from-[#03215F] via-[#03215F] to-[#03215F] text-white p-8">
            {/* Back Header */}
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">Member Information</h3>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
            </div>

            {/* Detailed Info */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm opacity-80 mb-1">Membership Category</p>
                  <p className="font-bold text-lg">{memberData.category}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80 mb-1">Expiration Date</p>
                  <p className="font-bold text-lg">{memberData.expiry}</p>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-xl">
                <p className="text-sm opacity-80 mb-2">Membership Benefits</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#AE9B66] rounded-full mr-3"></div>
                    Access to all BDS events
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#AE9B66] rounded-full mr-3"></div>
                    Continuing education credits
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#AE9B66] rounded-full mr-3"></div>
                    Professional networking
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#AE9B66] rounded-full mr-3"></div>
                    Research publications access
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-white/20">
                <p className="text-xs text-center opacity-75">
                  For verification issues, contact: membership@bds.bh
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-center space-x-3">
            <Download className="w-5 h-5" />
            <span className="font-semibold">Download PDF</span>
          </div>
        </button>
        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-center space-x-3">
            <Smartphone className="w-5 h-5" />
            <span className="font-semibold">Add to Wallet</span>
          </div>
        </button>
        <button className="p-4 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl hover:opacity-90 transition-opacity">
          <div className="flex items-center justify-center space-x-3">
            <Share2 className="w-5 h-5" />
            <span className="font-semibold">Share Card</span>
          </div>
        </button>
      </div>
    </div>
  )
}