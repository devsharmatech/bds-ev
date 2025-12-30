'use client'

import { Heart, Shield, Copyright } from 'lucide-react'

export default function DashboardFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 py-3">
      <div className="px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Copyright */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Copyright className="w-4 h-4" />
            <span>{currentYear} Bahrain Dental Society. All rights reserved.</span>
          </div>

          
          {/* Right: Version */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>v1.0.0</span>
            <span className="text-gray-400">•</span>
            <Heart className="w-4 h-4 text-[#b8352d]" />
            <span>Made for BDS</span>
            <span className="text-gray-400">•</span>
            <a
              href="https://365neo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#03215F] hover:underline underline-offset-2"
            >
              Developed by 365Neo Digital Services
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}