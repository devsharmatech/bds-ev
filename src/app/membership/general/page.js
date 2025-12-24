"use client";

import { 
  Shield, 
  CheckCircle, 
  FileText, 
  Award, 
  Users, 
  Calendar,
  BookOpen,
  Globe,
  Mail,
  ArrowRight
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import Link from "next/link";

export default function GeneralMembershipPage() {
  const eligibilityCriteria = [
    "Registered dentist with Bahrain's National Health Regulatory Authority (NHRA)",
    "Valid professional license to practice in Bahrain",
    "Good standing with professional ethics and conduct",
    "Minimum 2 years of dental practice experience (for voting rights)",
    "Commitment to BDS code of ethics and professional standards"
  ];

  const applicationDocuments = [
    "Completed membership application form",
    "Copy of NHRA registration certificate",
    "Copy of professional license",
    "Recent passport-sized photograph",
    "Curriculum Vitae (CV)",
    "Two professional references",
    "Proof of payment for membership fee"
  ];

  const membershipPrivileges = [
    {
      title: "Voting Rights",
      description: "Participate in society elections and important decisions",
      icon: <Shield className="w-6 h-6" />
    },
    {
      title: "Leadership Roles",
      description: "Eligibility for executive board and committee positions",
      icon: <Award className="w-6 h-6" />
    },
    {
      title: "Full Event Access",
      description: "Access to all BDS conferences, workshops, and seminars",
      icon: <Calendar className="w-6 h-6" />
    },
    {
      title: "Professional Directory",
      description: "Featured listing in BDS member directory",
      icon: <Users className="w-6 h-6" />
    },
    {
      title: "Resource Library",
      description: "Full access to research journals and clinical guidelines",
      icon: <BookOpen className="w-6 h-6" />
    },
    {
      title: "International Recognition",
      description: "Representation in regional and international dental forums",
      icon: <Globe className="w-6 h-6" />
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Shield className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Premium Membership</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">General Membership</h1>
            <p className="text-xl opacity-90 mb-8">
              The highest level of membership for licensed dentists in Bahrain. 
              Gain full voting rights, leadership opportunities, and comprehensive 
              access to all BDS resources and events.
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-2 text-[#ECCF0F]" />
                <span>Full Voting Rights</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>Leadership Eligibility</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>All Events Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Overview */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Premium Benefits for Licensed Dentists
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              General Membership is designed for licensed dental practitioners 
              who wish to actively participate in shaping the future of dentistry 
              in Bahrain. This membership category offers the most comprehensive 
              benefits package and full participatory rights in society affairs.
            </p>
            <p className="text-gray-600 text-lg">
              As a General Member, you become an integral part of Bahrain's dental 
              leadership community, with opportunities to influence policy, 
              contribute to professional standards, and access exclusive 
              development programs.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#9cc2ed] to-[#03215F] rounded-2xl p-8 text-white">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">BD 100</div>
              <div className="text-lg opacity-90">Annual Membership Fee</div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span>Full voting privileges</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span>Committee participation</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span>All events at member rates</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span>Priority registration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Eligibility Criteria
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {eligibilityCriteria.map((criterion, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#03215F] flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700">{criterion}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-[#9cc2ed] rounded-lg border border-[#9cc2ed]">
              <p className="text-[#03215F]">
                <strong>Note:</strong> International dentists practicing in Bahrain 
                with temporary licenses may apply for Associate Membership initially, 
                with option to upgrade to General Membership upon obtaining full NHRA registration.
              </p>
            </div>
          </div>
        </div>

        {/* Membership Privileges */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Exclusive Privileges
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {membershipPrivileges.map((privilege, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#03215F] flex items-center justify-center mb-4 text-white">
                  {privilege.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {privilege.title}
                </h3>
                <p className="text-gray-600">
                  {privilege.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Application Process */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Application Process
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {[
              {
                step: 1,
                title: "Prepare Documents",
                description: "Gather required documents as listed below"
              },
              {
                step: 2,
                title: "Online Application",
                description: "Complete the online application form"
              },
              {
                step: 3,
                title: "Review & Approval",
                description: "Membership committee reviews application"
              },
              {
                step: 4,
                title: "Welcome & Onboarding",
                description: "Receive welcome package and access"
              }
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#03215F] flex items-center justify-center mx-auto mb-4 text-white font-bold">
                  {step.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Required Documents */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-[#03215F]" />
              Required Documents
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {applicationDocuments.map((doc, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-gray-600">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-gray-700">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Renewal Process */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Membership Renewal
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Annual Renewal Process
                </h3>
                <p className="text-gray-600 mb-4">
                  General Membership is valid for one calendar year and must be 
                  renewed annually. Renewal notices are sent 60 days before expiration.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <ArrowRight className="w-5 h-5 mr-2 text-[#03215F] flex-shrink-0 mt-1" />
                    <span>Automatic renewal reminders via email</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="w-5 h-5 mr-2 text-[#03215F] flex-shrink-0 mt-1" />
                    <span>Online renewal portal available 24/7</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="w-5 h-5 mr-2 text-[#03215F] flex-shrink-0 mt-1" />
                    <span>Continuous membership benefits during grace period</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-[#9cc2ed] to-[#03215F] rounded-xl p-6 text-white">
                <h4 className="text-xl font-bold mb-4">Renewal Benefits</h4>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>Maintained voting rights</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>Accumulated seniority recognition</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>Priority for limited-seat events</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span>Loyalty discounts on special programs</span>
                  </li>
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
                Ready to Apply for General Membership?
              </h2>
              <p className="opacity-90">
                Join the leading dental professionals in Bahrain and gain 
                full participatory rights in shaping the future of dentistry.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/auth/register?type=general"
                className="px-8 py-3 bg-white text-[#03215F] rounded-lg hover:bg-gray-100 transition-colors font-semibold text-center flex items-center justify-center"
              >
                Apply Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a 
                href="mailto:membership@bahraindentalsociety.org"
                className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold text-center flex items-center justify-center"
              >
                <Mail className="mr-2 w-5 h-5" />
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {[
              {
                q: "How long does the approval process take?",
                a: "Typically 7-14 business days after receiving all required documents. You'll receive email updates throughout the process."
              },
              {
                q: "Can I upgrade from Associate to General Membership?",
                a: "Yes, Associate Members can upgrade by submitting additional documents and paying the difference in membership fees."
              },
              {
                q: "Is the membership fee tax-deductible?",
                a: "Yes, BDS membership fees are considered professional development expenses and are generally tax-deductible."
              },
              {
                q: "What happens if my application is not approved?",
                a: "You'll receive a detailed explanation and guidance on how to address any issues. Application fees are refunded if not approved."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-600">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}