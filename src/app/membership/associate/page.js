"use client";

import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  Globe, 
  BookOpen,
  Calendar,
  Mail,
  FileText,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import Link from "next/link";

export default function AssociateMembershipPage() {
  const eligibleProfessions = [
    {
      category: "Dental Academics",
      professions: ["Dental Faculty Members", "Dental Researchers", "Academic Administrators"]
    },
    {
      category: "Allied Professionals",
      professions: ["Dental Hygienists", "Dental Assistants", "Dental Technicians", "Dental Therapists"]
    },
    {
      category: "Industry Professionals",
      professions: ["Dental Product Specialists", "Laboratory Managers", "Dental Equipment Suppliers"]
    },
    {
      category: "International Dentists",
      professions: ["Visiting Dental Professionals", "Regional Dentists", "International Collaborators"]
    }
  ];

  const membershipBenefits = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Educational Resources",
      description: "Access to BDS publications, research journals, and educational materials"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Event Participation",
      description: "Attend BDS conferences, workshops, and seminars at member rates"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Networking",
      description: "Connect with Bahrain's dental community and build professional relationships"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Professional Development",
      description: "Continuing education opportunities and skill development programs"
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Career Support",
      description: "Access to job board and career advancement resources"
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Learning Opportunities",
      description: "Special sessions and workshops designed for allied professionals"
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Users className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Allied Professionals</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">Associate Membership</h1>
            <p className="text-xl opacity-90 mb-8">
              Designed for dental academics, allied professionals, and industry 
              specialists who support the dental community in Bahrain. Join our 
              network to access resources, education, and professional connections.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Open to Allied Professionals</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Networking Opportunities</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Educational Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Connect with Bahrain's Dental Community
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Associate Membership is ideal for dental academics, researchers, 
              hygienists, technicians, and industry professionals who work alongside 
              dental practitioners. This category provides access to Bahrain's dental 
              network while supporting the broader dental ecosystem.
            </p>
            <p className="text-gray-600 text-lg">
              While Associate Members don't have voting rights in society elections, 
              they enjoy significant benefits including event participation, 
              professional development opportunities, and access to BDS resources.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#9cc2ed] to-[#03215F] rounded-2xl p-8 text-white">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">BD 60</div>
              <div className="text-lg opacity-90">Annual Membership Fee</div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span>Event participation rights</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span>Resource library access</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span>Networking directory</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span>Professional development</span>
              </div>
            </div>
          </div>
        </div>

        {/* Eligible Professions */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Who Can Apply?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {eligibleProfessions.map((category, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {category.category}
                </h3>
                <ul className="space-y-2">
                  {category.professions.map((profession, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <ArrowRight className="w-4 h-4 mr-2 text-[#03215F]" />
                      {profession}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Membership Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Membership Benefits
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {membershipBenefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#03215F] flex items-center justify-center mb-4 text-white">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Application Requirements */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Application Requirements
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-[#03215F]" />
                  Required Documents
                </h3>
                <ul className="space-y-3">
                  {[
                    "Completed application form",
                    "Professional certification/license",
                    "Curriculum Vitae (CV)",
                    "Letter of recommendation",
                    "Recent photograph",
                    "Proof of current employment"
                  ].map((doc, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#AE9B66] mr-3" />
                      <span className="text-gray-700">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Application Process
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#03215F] flex items-center justify-center mr-4 mt-1 flex-shrink-0 text-white font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Submit Application</p>
                      <p className="text-sm text-gray-600">Complete online form with documents</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#03215F] flex items-center justify-center mr-4 mt-1 flex-shrink-0 text-white font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Review Process</p>
                      <p className="text-sm text-gray-600">Committee review within 10 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#03215F] flex items-center justify-center mr-4 mt-1 flex-shrink-0 text-white font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Approval & Payment</p>
                      <p className="text-sm text-gray-600">Receive approval and complete payment</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#03215F] flex items-center justify-center mr-4 mt-1 flex-shrink-0 text-white font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Welcome Package</p>
                      <p className="text-sm text-gray-600">Receive membership materials and access</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Limitations */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Membership Limitations
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  What Associate Members CAN Do:
                </h4>
                <ul className="space-y-2">
                  {[
                    "Attend all BDS events and conferences",
                    "Access educational resources and publications",
                    "Participate in networking activities",
                    "Join special interest groups",
                    "Receive BDS communications and updates"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-[#AE9B66]">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  What Associate Members CANNOT Do:
                </h4>
                <ul className="space-y-2">
                  {[
                    "Vote in society elections",
                    "Hold executive board positions",
                    "Serve as committee chairs",
                    "Represent BDS officially without approval",
                    "Access certain member-only forums"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-gray-500">
                      <div className="w-5 h-5 mr-2 flex items-center justify-center">
                        <span className="text-xl">×</span>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Join Bahrain's Dental Support Community
              </h2>
              <p className="opacity-90">
                Connect with dental professionals, access valuable resources, 
                and contribute to advancing oral health in Bahrain.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/auth/register?type=associate"
                className="px-8 py-3 bg-white text-[#03215F] rounded-lg hover:bg-gray-100 transition-colors font-semibold text-center flex items-center justify-center"
              >
                Apply Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a 
                href="mailto:associate@bahraindentalsociety.org"
                className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold text-center flex items-center justify-center"
              >
                <Mail className="mr-2 w-5 h-5" />
                Ask Questions
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}