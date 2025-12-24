import MainLayout from "@/components/MainLayout";
import { ChevronDown, HelpCircle, Users, Calendar, CreditCard, Shield,Phone } from 'lucide-react';

export default function FAQPage() {
  const faqCategories = [
    {
      title: "Membership",
      icon: <Users className="w-6 h-6" />,
      questions: [
        {
          q: "How do I become a BDS member?",
          a: "You can apply for membership through our website registration form. The process requires verification of your dental credentials and professional standing in Bahrain."
        },
        {
          q: "What are the membership fees?",
          a: "We offer Basic (50 BHD), Professional (150 BHD), and Elite (300 BHD) annual memberships. Each tier offers different benefits and access levels."
        },
        {
          q: "How long does membership approval take?",
          a: "Typically 3-5 business days after submitting all required documentation. You'll receive email notifications throughout the process."
        }
      ]
    },
    {
      title: "Events",
      icon: <Calendar className="w-6 h-6" />,
      questions: [
        {
          q: "How do I register for events?",
          a: "Browse our events page, select an event, and click 'Register Now'. Members receive priority registration and discounted rates."
        },
        {
          q: "Can I get CE credits from BDS events?",
          a: "Yes, most BDS events offer Continuing Education credits. Certificates are provided after event completion."
        },
        {
          q: "What's your cancellation policy?",
          a: "Cancellations made 7+ days before an event receive full refunds. 2-7 days before receives 50%. Less than 48 hours is non-refundable."
        }
      ]
    },
    {
      title: "Payments",
      icon: <CreditCard className="w-6 h-6" />,
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept credit/debit cards, bank transfers, and BenefitPay for Bahrain-based transactions."
        },
        {
          q: "Are payments secure?",
          a: "Yes, we use industry-standard encryption and secure payment gateways. We never store your full payment details."
        },
        {
          q: "Can I get an invoice for my payment?",
          a: "Yes, invoices are automatically generated and available in your dashboard under 'Payments' section."
        }
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <HelpCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Help Center</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Frequently Asked Questions
              </h1>
              
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Find answers to common questions about Bahrain Dental Society membership, events, and services.
              </p>
              
              {/* Search Bar */}
              <div className="mt-8 max-w-2xl mx-auto">
                <div className="relative">
                  <HelpCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for answers..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {faqCategories.map((category, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center mb-6">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-[#03215F]/10 to-[#03215F]/10 mr-4">
                      <div className="text-[#03215F]">
                        {category.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {category.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {category.questions.map((item, qIndex) => (
                      <div key={qIndex} className="border-b border-gray-200 pb-4 last:border-0">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {item.q}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Help Section */}
            <div className="mt-12 bg-gradient-to-r from-[#03215F]/10 to-[#03215F]/10 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Still Need Help?
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Our support team is here to assist you with any questions or concerns.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white rounded-xl">
                  <Shield className="w-8 h-8 text-[#03215F] mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">Email Support</h4>
                  <p className="text-sm text-gray-600">support@bds.bh</p>
                  <p className="text-xs text-gray-500 mt-2">Response within 24 hours</p>
                </div>
                
                <div className="text-center p-6 bg-white rounded-xl">
                  <Phone className="w-8 h-8 text-[#03215F] mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">Phone Support</h4>
                  <p className="text-sm text-gray-600">+973 1234 5678</p>
                  <p className="text-xs text-gray-500 mt-2">Sun-Thu, 8AM-4PM</p>
                </div>
                
                <div className="text-center p-6 bg-white rounded-xl">
                  <HelpCircle className="w-8 h-8 text-[#03215F] mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">Live Chat</h4>
                  <p className="text-sm text-gray-600">Available on website</p>
                  <p className="text-xs text-gray-500 mt-2">Click the chat icon below</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}