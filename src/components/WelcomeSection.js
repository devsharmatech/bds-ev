'use client'

import { Heart, Award, Users, BookOpen, Star, Zap, Shield, ArrowRight   } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function WelcomeSection() {
  const router = useRouter()

  return (
    <section className="py-10 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
     
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#AE9B66]/60 text-white mb-6">
            <Heart className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Professional Community</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#03215F] mb-4">
            WELCOME TO THE
          </h2>
          
          <div className="relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold  text-[#AE9B66] mb-2">
              Bahrain Dental Society
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Official Website
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-20">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-[#03215F] leading-relaxed text-lg">
                The <span className="font-semibold text-[#AE9B66]">Bahrain Dental Society (BDS)</span> is the professional body representing dentists in the Kingdom of Bahrain. Since its establishment in 1994, the Society has been dedicated to advancing the science and art of dentistry, promoting professional excellence, and serving as the collective voice of the dental community in Bahrain.
              </p>
              
              <p className="text-[#03215F] leading-relaxed text-lg">
                As the home of Bahraini dentists, this website reflects our commitment to uniting all members through continuous scientific, social, and professional engagement. It serves as a dynamic platform for our activities — from national conferences, seminars and workshops to community outreach and collaborative projects — showcasing the true image of a hardworking, ambitious, and achieving society.
              </p>
              
              <p className="text-[#03215F] leading-relaxed text-lg">
                Through this digital gateway, we aim to strengthen communication among our members, foster lifelong learning, and uphold the highest standards of dental care and ethics in Bahrain.
              </p>
              
              <div className="relative pl-6 mt-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#AE9B66] before:to-[#AE9B66] before:rounded-full">
                <p className="text-[#03215F] italic text-lg font-medium">
                  Together, we continue to shape the future of dentistry — with dedication, innovation, and pride.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Stats and President */}
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#AE9B66]/10 to-[#AE9B66]/10">
                    <Award className="w-6 h-6 text-[#AE9B66]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#03215F]">30+</div>
                    <div className="text-sm text-gray-600">Years Serving</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Since 1994</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#AE9B66]/10 to-[#AE9B66]/10">
                    <Users className="w-6 h-6 text-[#AE9B66]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#03215F]">350+</div>
                    <div className="text-sm text-gray-600">Active Members</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Dental Professionals</p>
              </div>
            </div>

            {/* President Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar Placeholder */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#AE9B66] to-[#AE9B66] flex items-center justify-center text-white text-2xl font-bold">
                    <img src="/profile1.png" alt="President Dr. Abbas M Ebrahim" className="w-20 h-20 rounded-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-[#ECCF0F] to-[#b8352d] flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#03215F] mb-2">
                    Dr. Abbas M Ebrahim
                  </h3>
                  <p className="text-gray-600 mb-3">
                    President of the Bahrain Dental Society
                  </p>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#AE9B66]/5 text-white">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-medium">Leading Since 2020</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-[#03215F] italic">
                  &ldquo; Our commitment is to advance dental excellence and serve as the unified voice for Bahrain &apos; s dental professionals.&rdquo;
                </p>
              </div>
            </div>

            
          </div>
        </div>

      </div>
    </section>
  )
}