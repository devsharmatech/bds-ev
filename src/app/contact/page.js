"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Building,
  Users,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      details: "Building 123, Road 456, Manama, Bahrain",
      description: "Our headquarters in Manama",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      details: "+973 1234 5678",
      description: "Sunday - Thursday, 8 AM - 4 PM",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      details: "info@bds.bh",
      description: "We respond within 24 hours",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Office Hours",
      details: "8:00 AM - 4:00 PM",
      description: "Sunday - Thursday",
    },
  ];

  const departments = [
    { name: "Membership", email: "membership@bds.bh", phone: "+973 1234 5679" },
    { name: "Events", email: "events@bds.bh", phone: "+973 1234 5680" },
    { name: "Education", email: "education@bds.bh", phone: "+973 1234 5681" },
    {
      name: "Sponsorship",
      email: "sponsorship@bds.bh",
      phone: "+973 1234 5682",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Get in Touch</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Contact Bahrain Dental Society
              </h1>

              <p className="text-xl opacity-90 mb-8">
                Have questions? We're here to help. Reach out to us for
                membership inquiries, event information, or any other assistance
                you may need.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#03215F]/20 to-[#03215F]/20 flex items-center justify-center mx-auto mb-4">
                  <div className="text-[#03215F]">{info.icon}</div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {info.title}
                </h3>

                <p className="text-lg text-gray-900 font-semibold mb-2">
                  {info.details}
                </p>

                <p className="text-gray-600 text-sm">
                  {info.description}
                </p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Send us a Message
                  </h2>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you as soon as
                    possible
                  </p>
                </div>

                {submitStatus === "success" && (
                  <div className="mb-6 p-4 bg-[#AE9B66] border border-[#AE9B66] rounded-lg">
                    <p className="text-[#AE9B66]">
                      Thank you for your message! We'll get back to you soon.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
                        placeholder="Dr. Ahmed Ali"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
                        placeholder="dr.ahmed@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
                    >
                      <option value="">Select a subject</option>
                      <option value="membership">Membership Inquiry</option>
                      <option value="events">Event Information</option>
                      <option value="education">Education Programs</option>
                      <option value="sponsorship">Sponsorship</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows="6"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
                      placeholder="Type your message here..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold flex items-center justify-center disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-3" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Departments & Map */}
            <div className="space-y-8">
              {/* Departments */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Building className="w-5 h-5 mr-3" />
                  Departments
                </h3>

                <div className="space-y-4">
                  {departments.map((dept, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {dept.name}
                      </h4>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {dept.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {dept.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Location */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <MapPin className="w-5 h-5 mr-3" />
                  Our Location
                </h3>

                <div className="h-64 bg-gradient-to-br from-[#03215F]/20 to-[#03215F]/20 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-[#03215F] mx-auto mb-3" />
                    <p className="text-gray-600">
                      View on Google Maps
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">
                    Bahrain Dental Society
                  </p>
                  <p className="text-gray-600">
                    Building 123, Road 456
                  </p>
                  <p className="text-gray-600">
                    Manama, Bahrain
                  </p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-3" />
                  Need Immediate Assistance?
                </h3>

                <p className="opacity-90 mb-4">
                  For urgent membership or event-related issues during office
                  hours
                </p>

                <div className="space-y-2">
                  <p className="font-semibold">+973 1234 5678</p>
                  <p className="text-sm opacity-90">
                    Available Sunday - Thursday, 8 AM - 4 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
