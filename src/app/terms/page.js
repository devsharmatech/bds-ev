import MainLayout from "@/components/MainLayout";
import { Scale, FileCheck, AlertCircle, BookOpen } from 'lucide-react';

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <Scale className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Legal Terms</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Terms of Service
              </h1>
              
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Please read these terms carefully before using Bahrain Dental Society's services.
              </p>
              
              <div className="mt-8 text-sm opacity-80">
                Effective Date: January 15, 2024 • Last Updated: January 15, 2024
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Important Notice */}
            <div className="mb-8 p-6 bg-[#ECCF0F] border border-[#ECCF0F] rounded-2xl">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-[#ECCF0F] mr-3 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-[#ECCF0F] mb-2">
                    Important Notice
                  </h3>
                  <p className="text-[#ECCF0F]">
                    By accessing or using Bahrain Dental Society services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms Sections */}
            <div className="space-y-8">
              {[
                {
                  title: "1. Membership Terms",
                  icon: <FileCheck className="w-6 h-6" />,
                  content: "Membership is granted to qualified dental professionals in Bahrain. You must provide accurate information and maintain professional credentials. Membership fees are non-refundable unless otherwise specified."
                },
                {
                  title: "2. Event Registration",
                  icon: <BookOpen className="w-6 h-6" />,
                  content: "Event registrations are subject to availability. Cancellation policies vary by event. BDS reserves the right to modify event details or cancel events when necessary."
                },
                {
                  title: "3. Code of Conduct",
                  icon: <Scale className="w-6 h-6" />,
                  content: "All members must adhere to professional standards and ethical guidelines. Harassment, discrimination, or unprofessional behavior will result in membership termination."
                },
                {
                  title: "4. Intellectual Property",
                  icon: <FileCheck className="w-6 h-6" />,
                  content: "All content, logos, and materials provided by BDS are protected by copyright and may not be reproduced without permission."
                },
                {
                  title: "5. Liability Limitation",
                  icon: <AlertCircle className="w-6 h-6" />,
                  content: "BDS is not liable for any indirect, incidental, or consequential damages arising from the use of our services. We provide services 'as is' without warranties."
                },
                {
                  title: "6. Termination",
                  icon: <Scale className="w-6 h-6" />,
                  content: "We reserve the right to terminate or suspend access to our services immediately, without prior notice, for any breach of these Terms."
                }
              ].map((term, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-[#03215F]/10 to-[#03215F]/10 mr-4">
                      <div className="text-[#03215F]">
                        {term.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {term.title}
                      </h3>
                      <p className="text-gray-600">
                        {term.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Section */}
            <div className="mt-12 bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Questions About Our Terms?</h3>
                <p className="mb-6 opacity-90">
                  If you have any questions regarding these Terms of Service, please contact us:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="mailto:legal@bds.bh" 
                    className="px-6 py-3 bg-white text-[#03215F] rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                  >
                    Email Legal Team
                  </a>
                  <a 
                    href="/contact" 
                    className="px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}