'use client'

import { 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  Users, 
  Award, 
  BookOpen,
  Star,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MembershipSection() {
  const router = useRouter()

  const membershipPlans = [
    {
      name: "Basic",
      price: "50",
      period: "per year",
      features: [
        "Digital Membership Card",
        "Event Notifications",
        "Basic Networking",
        "Newsletter Access"
      ],
      color: "from-gray-500 to-gray-700",
      popular: false
    },
    {
      name: "Professional",
      price: "150",
      period: "per year",
      features: [
        "All Basic Features",
        "Premium Event Access",
        "CE Credits Tracking",
        "Research Library",
        "Member Directory"
      ],
      color: "from-[#03215F] to-[#9cc2ed]",
      popular: true
    },
    {
      name: "Elite",
      price: "300",
      period: "per year",
      features: [
        "All Professional Features",
        "VIP Event Access",
        "Mentorship Program",
        "Conference Discounts",
        "Leadership Opportunities",
        "Gold Badge Profile"
      ],
      color: "from-[#03215F] to-[#03215F]",
      popular: false
    }
  ]

  const benefits = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Official Recognition",
      description: "Get recognized as a certified BDS member"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Networking Events",
      description: "Exclusive networking with dental professionals"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Education Resources",
      description: "Access to latest research and publications"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Career Growth",
      description: "Professional development opportunities"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#03215F]/10 text-white mb-4">
            <Star className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Membership Plans</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Choose Your <span className="text-[#03215F]">Membership</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Select the perfect membership plan for your professional needs
          </p>
        </div>

        {/* Membership Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {membershipPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative rounded-2xl bg-white shadow-xl border ${
                plan.popular 
                  ? 'border-[#03215F] shadow-2xl transform scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-end justify-center mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">BHD</span>
                  </div>
                  <p className="text-gray-600">{plan.period}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#AE9B66] mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => router.push('/auth/register')}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#03215F] to-[#03215F] text-white hover:opacity-90'
                      : 'border-2 border-[#03215F] text-[#03215F] hover:bg-[#03215F]/10'
                  }`}
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Dentists Choose <span className="text-[#03215F]">BDS</span>
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join the community that&apos;s advancing dental excellence in Bahrain
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#03215F]/20 to-[#03215F]/20 flex items-center justify-center mx-auto mb-6">
                  <div className="text-[#03215F]">
                    {benefit.icon}
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h4>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={() => router.push('/auth/register')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold text-lg"
            >
              Start Your Journey Today
              <ArrowRight className="ml-3 w-5 h-5" />
            </button>
            <p className="text-gray-600 mt-4">
              Join 500+ dental professionals already benefiting from BDS membership
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}