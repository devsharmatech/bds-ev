"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Youtube,
  PhoneCall,
} from "lucide-react";

export default function Footer() {
  // Use state to set year only on client to avoid hydration mismatch
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);
  const footerLinks = {
    "Quick Links": [
      { name: "Home", href: "/" },
      { name: "About Us", href: "/about" },
      { name: "Events", href: "/events" },
      { name: "Our Team", href: "/team" },
      { name: "Committees", href: "/committees" },
    ],
    Resources: [
      { name: "Membership", href: "/membership" },
      { name: "Gallery", href: "/gallery" },
      { name: "Contact Us", href: "/contact" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="relative bg-gradient-to-br from-[#03215F] via-[#03215F] to-[#1a3a7a] text-white overflow-hidden rounded-t-3xl">
      

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#AE9B66] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ECCF0F] rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Gray Line Textures Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="linePattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="40"
                y2="0"
                stroke="white"
                strokeWidth="0.5"
                opacity="0.3"
              />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="40"
                stroke="white"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
            <pattern
              id="diagonalPattern"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="60"
                y2="60"
                stroke="white"
                strokeWidth="0.3"
                opacity="0.2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#linePattern)" />
          <rect width="100%" height="100%" fill="url(#diagonalPattern)" />
        </svg>
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src="https://bds-web-iota.vercel.app/long-logo.png" 
                  alt="BDS Logo" 
                  className="h-14 md:h-16 rounded-sm transition-transform duration-300 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-white/10 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>

            <p className="text-gray-100 text-sm md:text-base leading-relaxed">
              Advancing dental excellence through education, collaboration, and
              professional development.
            </p>

            <div className="flex space-x-3">
              <a
                href="https://youtube.com/@bahraindentalsociety?si=L6wo3DSGNgSLMHHt"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/10 hover:bg-[#AE9B66] rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://www.instagram.com/bahrain.dental.society?igsh=MXV2Y245cmtpMW94cg=="
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/10 hover:bg-[#AE9B66] rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://wa.link/k6rtdf"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/10 hover:bg-[#AE9B66] rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                aria-label="WhatsApp"
              >
                <PhoneCall className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-lg md:text-xl font-bold mb-4 text-[#AE9B66] relative inline-block">
                {category}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#AE9B66] to-transparent"></span>
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-200 hover:text-white transition-all duration-300 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-[#AE9B66] mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Contact */}
        <div className="mt-10 lg:mt-12 pt-8 border-t border-white/20">
          <h4 className="text-lg md:text-xl font-bold mb-6 text-[#AE9B66]">Contact Us</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-4 group">
              <div className="p-2 bg-white/10 rounded-lg group-hover:bg-[#AE9B66] transition-colors duration-300">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-100 text-sm md:text-base leading-relaxed flex-1">
                Building 1487, Road 2425, Block 324, Juffair, Kingdom of Bahrain.🇧🇭
              </span>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4 group">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-[#AE9B66] transition-colors duration-300">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <a href="tel:+97337990963" className="text-gray-100 hover:text-white transition-colors">
                  +973 3799 0963
                </a>
              </div>
              <div className="flex items-center space-x-4 group">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-[#AE9B66] transition-colors duration-300">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <a href="mailto:Bahrain.ds94@gmail.com" className="text-gray-100 hover:text-white transition-colors break-all">
                  Bahrain.ds94@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/20 text-center">
          <p className="text-gray-200 text-sm md:text-base">
            © {currentYear} Bahrain Dental Society. All rights reserved.
          </p>
          <p className="mt-3 text-xs md:text-sm text-gray-300">
            Developed by{" "}
            <a
              href="https://365neo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#AE9B66] hover:text-[#ECCF0F] transition-colors duration-300 font-semibold"
            >
              365Neo
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
