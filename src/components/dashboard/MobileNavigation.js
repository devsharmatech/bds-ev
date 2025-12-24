// components/dashboard/MobileNavigation.js
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Calendar, 
  Award, 
  User, 
  CreditCard,
  FileText,
  Bell,
  Settings
} from 'lucide-react'

export default function MobileNavigation() {
  const pathname = usePathname()
  
  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Events', href: '/dashboard/events', icon: Calendar },
    { name: 'Certificates', href: '/dashboard/certificates', icon: Award },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ]
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      <div className="grid grid-cols-4 gap-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.name}
              href={item.href} 
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[#9cc2ed] text-[#03215F]' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}