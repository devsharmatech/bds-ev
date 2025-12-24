'use client'

import { Play, Calendar, Users, Target, Heart, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function FocusAreasSection() {
  const router = useRouter()
  const videoRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const focusAreas = [
    {
      icon: <Calendar className="w-6 h-6 text-[#03215F]" />,
      title: "Conferences",
      description: "International & local conferences with expert speakers",
      count: "15+",
      unit: "Annual Events",
      color: "from-[#9cc2ed] to-[#9cc2ed]"
    },
    {
      icon: <Target className="w-6 h-6 text-white" />,
      title: "Workshops",
      description: "Hands-on training & skill development sessions",
      count: "40+",
      unit: "Workshops",
      color: "from-[#03215F] to-[#b8352d]"
    },
    {
      icon: <Heart className="w-6 h-6 text-white" />,
      title: "Community Services",
      description: "Oral health awareness & public dental care programs",
      count: "25+",
      unit: "Initiatives",
      color: "from-[#AE9B66] to-[#AE9B66]"
    },
    {
      icon: <Users className="w-6 h-6 text-white" />,
      title: "Networking",
      description: "Professional networking & collaboration opportunities",
      count: "350+",
      unit: "Members",
      color: "from-[#b8352d] to-[#ECCF0F]"
    }
  ]

  const stats = [
    { value: "50+", label: "Annual Events" },
    { value: "350+", label: "Members" },
    { value: "150+", label: "CME Certificates" },
    { value: "30+", label: "Years" }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#03215F]/10 text-[#03215F] mb-6">
            <Target className="w-4 h-4 mr-2 text-[#03215F]" />
            <span className="text-sm font-medium">Our Expertise</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#03215F] mb-4">
            Our Focus Areas
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] mb-8">
            Conferences, Workshops, Community Services
          </h2>
          
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            The Bahrain Dental Society organizes a wide range of activities including conferences, workshops, and events designed to provide cutting-edge insights and practical training for dentists.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Column - Video */}
          <div className="relative group">
            <div 
              className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#03215F] aspect-video"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Video Placeholder/Player */}
              <div className="absolute inset-0">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/bgn.png"
                >
                  <source src="/file.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#03215F]/10 to-transparent"></div>
              </div>
              
              {/* Play Button Overlay (Decorative) */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                    <Play className="w-8 h-8 text-[#03215F] ml-1" />
                  </div>
                </div>
              </div>
              
              {/* Video Label */}
              <div className="absolute bottom-6 left-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full">
                  <Play className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-medium">BDS Activities Preview</span>
                </div>
              </div>
            </div>
            
            {/* Stats Overlay */}
            <div className="absolute -bottom-6 -right-6 z-10">
              <div className="bg-white rounded-xl shadow-xl p-6 w-64">
                <h4 className="text-lg font-bold text-[#03215F] mb-4">Impact Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-[#AE9B66]">{stat.value}</div>
                      <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="space-y-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                Our commitment extends beyond professional development; we also actively participate in community services to foster better oral health practices and provide valuable resources to the public.
              </p>
            </div>

            {/* Focus Areas Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {focusAreas.map((area, index) => (
                <div 
                  key={index} 
                  className="group bg-white rounded-xl p-6 border border-gray-100 hover:border-[#03215F]/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${area.color} relative`}>
                      {area.icon}
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <span className="text-xs font-bold text-[#03215F]">{area.count}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#03215F] mb-2 group-hover:text-[#03215F] transition-colors">
                        {area.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {area.description}
                      </p>
                      <div className="text-xs font-medium text-gray-500">
                        {area.unit}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial/Quote */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border-gray-300">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-4xl text-gray-300 mb-6">&rdquo;</div>
            <p className="text-xl md:text-2xl text-[#03215F] font-medium italic mb-8">
              Through our diverse focus areas, we aim to create a comprehensive ecosystem that supports dentists at every stage of their career while making a positive impact on community health.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center text-white font-bold">
                <img src="/profile1.png" alt="Dr. Abbas M Ebrahim" className="w-12 h-12 rounded-full object-cover" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-[#03215F]">Dr. Abbas M Ebrahim</h4>
                <p className="text-gray-600 text-sm">BDS President</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}