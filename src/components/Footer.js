"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Youtube,
  PhoneCall,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isHovered, setIsHovered] = useState(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const footerLinks = {
    "Quick Links": [
      { name: "Home", href: "/" },
      { name: "About Us", href: "/about" },
      { name: "Events", href: "/events" },
      { name: "Our Board Members", href: "/our-board-members" },
      { name: "Committees", href: "/committees" },
    ],
    Resources: [
      { name: "Membership", href: "/membership" },
      { name: "Gallery", href: "/gallery" },
      { name: "Contact Us", href: "/contact" }
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/bahrain.dental.society", color: "hover:bg-gradient-to-br from-purple-500 to-pink-500" },
    { icon: PhoneCall, href: "https://wa.link/k6rtdf", color: "hover:bg-[#25D366]" },
    { icon: Linkedin, href: "#", color: "hover:bg-[#0A66C2]" },
  ];

  return (
    <footer className="relative mt-0 bg-gradient-to-b from-[#0A1A3F] via-[#03215F] to-[#0A1A3F] text-white overflow-hidden rounded-t-3xl">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#AE9B66]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[#ECCF0F]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="mb-2">
              <img
                src="https://bds-web-iota.vercel.app/long-logo.png"
                alt="BDS Logo"
                className="h-16 md:h-20 object-contain mb-2 rounded-sm"
              />
            </Link>

            <p className="text-gray-200 max-w-md">
              Advancing dental excellence through education, collaboration, and
              professional development in the Kingdom of Bahrain.
            </p>

            <div className="flex flex-wrap gap-3">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  className={`p-3 bg-white/10 rounded-xl transition hover:scale-110 ${s.color}`}
                >
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[#AE9B66] font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.name}>
                    <Link
                      href={l.href}
                      className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                    >
                      <ChevronRight className="w-3 h-3" />
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ContactCard icon={MapPin} title="Location">
            Building 1487, Road 2425, Block 324<br />Juffair, Bahrain 🇧🇭
          </ContactCard>

          <ContactCard icon={Phone} title="Call Us">
            <a href="tel:+97337990963">+973 3799 0963</a>
          </ContactCard>

          <ContactCard icon={Mail} title="Email">
            <a href="mailto:info@bds-bh.org">info@bds-bh.org</a>
          </ContactCard>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-300">
          <div className="text-center md:text-left">
            © {currentYear} Bahrain Dental Society. All rights reserved.
          </div>

          <a
            href="https://365neo.com"
            target="_blank"
            className="flex items-center gap-1 text-[#AE9B66] hover:text-[#ECCF0F]"
          >
            Developed by 365Neo Digital Services <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="h-2 bg-gradient-to-r from-[#AE9B66] via-[#ECCF0F] to-[#AE9B66]" />
    </footer>
  );
}

function ContactCard({ icon: Icon, title, children }) {
  return (
    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-[#AE9B66] to-[#ECCF0F] rounded-xl">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h5 className="font-semibold mb-1">{title}</h5>
          <p className="text-gray-300 text-sm">{children}</p>
        </div>
      </div>
    </div>
  );
}
