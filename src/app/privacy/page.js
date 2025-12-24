import MainLayout from "@/components/MainLayout";
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "Information We Collect",
      icon: <FileText className="w-6 h-6" />,
      content: "We collect personal information that you provide when registering for membership, attending events, or using our services. This includes name, contact details, professional credentials, and payment information."
    },
    {
      title: "How We Use Your Information",
      icon: <Eye className="w-6 h-6" />,
      content: "Your information is used to provide BDS services, process memberships, organize events, send important updates, and improve our offerings. We never sell your personal data to third parties."
    },
    {
      title: "Data Security",
      icon: <Lock className="w-6 h-6" />,
      content: "We implement industry-standard security measures to protect your data. This includes encryption, secure servers, access controls, and regular security audits."
    },
    {
      title: "Your Rights",
      icon: <Shield className="w-6 h-6" />,
      content: "You have the right to access, correct, or delete your personal information. You can also opt-out of marketing communications at any time by updating your preferences in your account settings."
    }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-16">
          <div className=" mx-auto px-4">
            <div className="mx-auto text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <Shield className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Privacy & Security</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Privacy Policy
              </h1>
              
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Your privacy is important to us. Learn how Bahrain Dental Society collects, uses, and protects your personal information.
              </p>
              
              <div className="mt-8 flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#AE9B66] rounded-full mr-2"></div>
                  <span>Last updated: January 15, 2024</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#9cc2ed] rounded-full mr-2"></div>
                  <span>Version: 3.1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className=" mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Introduction */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Introduction
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Bahrain Dental Society (BDS) is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, services, or participate in our events.
              </p>
            </div>

            {/* Main Sections */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {sections.map((section, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-[#03215F]/10 to-[#03215F]/10 mr-4">
                      <div className="text-[#03215F]">
                        {section.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Detailed Sections */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Detailed Information Collection
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">1. Personal Information</h4>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>Name, email address, phone number</li>
                      <li>Professional credentials and license numbers</li>
                      <li>Clinic or institution affiliation</li>
                      <li>Payment information for membership and events</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">2. Usage Data</h4>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>IP address, browser type, device information</li>
                      <li>Pages visited, time spent on site</li>
                      <li>Event attendance and participation</li>
                      <li>Communication preferences</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Data Sharing and Disclosure
                </h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    We may share your information with trusted third-party service providers who assist us in operating our website, conducting our business, or serving our members. These parties are contractually obligated to keep your information confidential and use it only for the purposes for which we disclose it to them.
                  </p>
                  <p>
                    We may also disclose your information when required by law or to protect the rights, property, or safety of BDS, our members, or others.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Cookies and Tracking Technologies
                </h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    We use cookies and similar tracking technologies to enhance your experience on our website. Cookies are small files that a site or its service provider transfers to your device's hard drive through your web browser that enables the site's systems to recognize your browser and capture certain information.
                  </p>
                  <p>
                    You can choose to disable cookies through your browser settings. However, if you turn cookies off, some features of the site may not function properly.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
                <p className="mb-6">
                  If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer:
                </p>
                <div className="space-y-3">
                  <p className="font-semibold">Email: privacy@bds.bh</p>
                  <p className="font-semibold">Phone: +973 1234 5679</p>
                  <p className="font-semibold">Address: Building 123, Road 456, Manama, Bahrain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}