"use client";

import { ImageIcon, Clock } from "lucide-react";
import MainLayout from "@/components/MainLayout";

export default function GalleryPage() {
  return (
    <MainLayout>
      {/* Coming Soon Section */}
      <div className="min-h-[80vh] flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#03215F] to-[#AE9B66] rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative p-6 bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-full">
                  <ImageIcon className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[#03215F] to-[#AE9B66] bg-clip-text text-transparent">
              Gallery Coming Soon
            </h1>

            {/* Message */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              We're working hard to bring you an amazing gallery experience. 
              Check back soon to explore photos and highlights from our events, 
              conferences, and community activities.
            </p>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ECCF0F]/20 to-[#ECCF0F]/10 border border-[#ECCF0F]/30 rounded-full">
              <Clock className="w-5 h-5 text-[#ECCF0F]" />
              <span className="text-[#03215F] font-semibold">Stay Tuned</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
