'use client'

import { 
  Shield, 
  Calendar, 
  Users, 
  Award, 
  BookOpen, 
  CreditCard,
  Zap,
  CheckCircle
} from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-[#03215F]" />,
      title: "Professional Recognition",
      description: "Get officially recognized as a BDS member with digital credentials",
      color: "from-[#9cc2ed] to-[#9cc2ed]"
    },
    {
      icon: <Calendar className="w-8 h-8 text-white" />,
      title: "Event Access",
      description: "Access exclusive dental conferences, workshops, and seminars",
      color: "from-[#03215F] to-[#b8352d]"
    },
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: "Networking",
      description: "Connect with dental professionals across Bahrain",
      color: "from-[#AE9B66] to-[#AE9B66]"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-white" />,
      title: "Continuing Education",
      description: "Earn CME Certificates",
      color: "from-[#b8352d] to-[#b8352d]"
    },
    {
      icon: <Award className="w-8 h-8 text-[#03215F]" />,
      title: "Certifications",
      description: "Get certified in specialized dental disciplines",
      color: "from-[#ECCF0F] to-[#ECCF0F]"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-white" />,
      title: "Digital Membership",
      description: "Access your digital membership card anytime, anywhere",
      color: "from-[#03215F] to-[#9cc2ed]"
    }
  ]

  return (
    <section className="py-20 pt-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#AE9B66]/70 text-white mb-4">
            <Zap className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Why Join BDS?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#AE9B66] mb-6">
            Exclusive <span className="text-[#AE9B66]">Member Benefits</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Join Bahrain&apos;s leading dental community and unlock professional advantages
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 p-8 transform hover:-translate-y-1"
            >
              <div className="mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-[#03215F] mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <ul className="space-y-3">
                  {["24/7 Access", "Mobile Friendly", "Instant Updates"].map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-[#AE9B66] mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-[#03215F] via-[#03215F] to-[#03215F] text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">350+</div>
              <div className="text-sm opacity-90">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-sm opacity-90">Annual Events</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-sm opacity-90">CME Certificate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">30+</div>
              <div className="text-sm opacity-90">Years</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}