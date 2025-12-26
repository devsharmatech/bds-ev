'use client'

import { Mail, Phone, MapPin, Clock, MessageSquare, FileText, User, Calendar } from 'lucide-react'
import { useState } from 'react'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    phone: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    alert('Message sent successfully!')
    setFormData({ name: '', title: '', phone: '', email: '', message: '' })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactInfo = [
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Phone Numbers",
      details: [
        { label: "Primary", value: "+973 3799 0963" },
        { label: "Secondary", value: "+973 3799 0963" }
      ]
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email Address",
      details: [
        { label: "General Inquiry", value: "Bahrain.ds94@gmail.com" },
        { label: "Membership", value: "Bahrain.ds94@gmail.com" }
      ]
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Office Location",
      details: [
        { label: "Address", value: "Building 1487, Road 2425, Block 324, Juffair, Kingdom of Bahrain.🇧🇭" },
        { label: "P.O. Box", value: "Juffair, Kingdom of Bahrain.🇧🇭" }
      ]
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Working Hours",
      details: [
        { label: "Sunday - Thursday", value: "8:00 AM - 4:00 PM" },
        { label: "Friday - Saturday", value: "Closed" }
      ]
    }
  ]

  return (
    <section className="py-20 pt-10 bg-gradient-to-b from-white to-gray-50 ">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#AE9B66]/70 text-white mb-6">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Contact Us</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#AE9B66] mb-4">
            Get in touch
          </h1>
          
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Have questions or need assistance? Reach out to the Bahrain Dental Society team.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Contact Form */}
          <div className="bg-white  rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#03215F] mb-2">
                Your certificate is waiting for you?
              </h2>
              <p className="text-gray-600">
                Fill the form below with your name and title.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Divider */}
              <div className="border-t border-gray-200 /70 pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#03215F]/10 to-[#03215F]/10">
                    <User className="w-5 h-5 text-[#03215F]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#03215F]">
                    Personal Information
                  </h3>
                </div>
              </div>

              {/* Name and Title Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#03215F] /70">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Name
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 /70 text-[#03215F] focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 focus:outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#03215F]/70">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Title / Position
                    </span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Dental Surgeon, DDS"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 /70 text-[#03215F] focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 /70 pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#03215F]/10 to-[#03215F]/10">
                    <Calendar className="w-5 h-5 text-[#AE9B66]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#03215F]">
                    Date & Period
                  </h3>
                </div>
              </div>

              {/* Phone and Email Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#03215F]/70">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone 1
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+973 1234 5678"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 /70 text-[#03215F] focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 focus:outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#03215F] /70">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 /70 text-[#03215F] focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#03215F] /70">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Your Message
                  </span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 /70 text-[#03215F] focus:border-[#03215F] focus:ring-2 focus:ring-[#03215F]/20 focus:outline-none transition-all resize-none"
                  required
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white rounded-lg hover:shadow-xl hover:shadow-[#03215F]/30 transition-all duration-300 font-semibold text-lg"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Right Column - Contact Information */}
          <div className="space-y-8">
            {/* Contact Cards Grid */}
            <div className="grid md:grid-cols-1 gap-6">
              {contactInfo.map((info, index) => (
                <div 
                  key={index} 
                  className="bg-white  rounded-xl p-6 border border-gray-100 /70 hover:border-[#03215F]/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#AE9B66]/20 to-[#AE9B66]/20">
                      <div className="text-[#AE9B66]">
                        {info.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#03215F] mb-4">
                        {info.title}
                      </h3>
                      <div className="space-y-3">
                        {info.details.map((detail, idx) => (
                          <div key={idx}>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              {detail.label}
                            </div>
                            <div className="text-[#03215F]/70 font-medium" style={{wordBreak:"break-word"}}>
                              {detail.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          
          </div>
        </div>
      </div>
    </section>
  )
}