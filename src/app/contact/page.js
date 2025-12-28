"use client";

import MainLayout from "@/components/MainLayout";
import ContactSection from "@/components/sections/ContactSection";
import { MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Banner (kept unchanged) */}
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

        {/* Body from ContactSection */}
        <ContactSection />
      </div>
    </MainLayout>
  );
}
