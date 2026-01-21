"use client";

import {
  Users,
  Award,
  Mail,
  Phone,
  Instagram,
  Linkedin,
  Calendar,
  Facebook,
  Twitter,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function TeamPage() {
  const [boardMembers, setBoardMembers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/site-members?group=team");
        const data = await res.json();
        if (data.success) {
          // map site members fields to expected shape
          const mapped = (data.members || []).map((m) => ({
            name: m.name,
            position: m.title || m.role || "",
            email: m.email || "",
            phone: m.phone || "",
            image: m.photo_url || "/placeholder.png",
            instagram: m.instagram || "",
            linkedin: m.linkedin || "",
            facebook: m.facebook || "",
            twitter: m.twitter || "",
            role: m.role || "",
          }));
          setBoardMembers(mapped);
        }
      } catch (_e) {
        // ignore
      }
    };
    load();
  }, []);

  const staticMembers = [
    {
      name: "Dr. Abbas Alfardan",
      position: "President",
      category: "executive",
      email: "info@bds-bh.org",
      phone: "+973 37990963",
      image: "/im1.jpg",
      instagram: "https://www.instagram.com/drabbasalfardan/",
      linkedin: "https://www.linkedin.com/in/dr-abbas-al-fardan-a08b1816a/",
    },
    {
      name: "Dr. Ameera Almosali",
      position: "Vice President and Head of the Professional Affairs Committee",
      category: "executive",
      email: "bds.prof.affairs@gmail.com",
      phone: "+973 37990963",
      image: "/im2.jpg",
      instagram: "https://www.instagram.com/dr.ameera.almosali",
      linkedin: "https://bh.linkedin.com/in/dr-ameera-almosali-1792a71ab",
    },
    {
      name: "Dr. Talal Alalawi",
      position: "General Secretary",
      category: "executive",
      email: "info@bds-bh.org",
      phone: "+973 37990963",
      image: "/im3.jpg",
      instagram: "https://www.instagram.com/alawidental",
      linkedin: "https://bh.linkedin.com/in/talal-al-alawi-a9534764",
    },
    {
      name: "Dr. Taghreed Ajoor",
      position: "Treasurer",
      category: "executive",
      email: "info@bds-bh.org",
      phone: "+973 37990963",
      image: "/im4.jpg",
      instagram: "https://www.instagram.com/ajoordentist",
      linkedin: "https://bh.linkedin.com/in/taghreed-ajoor-a216a332",
    },

    // ---------------- BOARD MEMBERS ----------------

    {
      name: "Dr. Afaf Alqayem",
      position: "Board Member and Head of the Media Committee",
      category: "board",
      email: "bds.mediacommittee@gmail.com",
      phone: "+973 37990963",
      image: "/im5.jpg",
      instagram: "https://www.instagram.com/dr_alqayem",
      linkedin: "https://bh.linkedin.com/in/afaf-alqayem-3540b1158",
    },
    {
      name: "Dr. Taha Al Dairiy",
      position: "Board Member",
      category: "board",
      email: "info@bds-bh.org",
      phone: "+973 37990963",
      image: "/im6.jpg",
      instagram: "https://www.instagram.com/dairy80",
      linkedin: "",
    },
    {
      name: "Dr. Maysoon Al Alawi",
      position: "Board Member and Head of the Scientific Committee",
      category: "board",
      email: "info@bds-bh.org",
      phone: "+973 37990963",
      image: "/im7.jpg",
      instagram: "https://www.instagram.com/dr.maysoonalalawi",
      linkedin: "https://bh.linkedin.com/in/maysoon-alalawi",
    },
  ];

 
  function MemberCard({ member }) {
    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex gap-6 items-center border border-gray-100 hover:border-[#03215F]/20 group">
        <div className="relative flex-shrink-0">
          <img
            src={member.image}
            alt={member.name}
            style={{ width: "120px", height: "120px" }}
            className="rounded-xl object-cover border-2 border-gray-200 group-hover:border-[#03215F] transition-colors duration-300"
            loading="lazy"

          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#03215F]/0 to-[#03215F]/0 group-hover:from-[#03215F]/10 group-hover:to-[#AE9B66]/10 transition-all duration-300"></div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#03215F] mb-2 uppercase tracking-wide">
            {member.position}
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#03215F] transition-colors">
            {member.name}
          </h3>

          <div className="space-y-2 mb-4">
            {member.email && (
              <a 
                href={`mailto:${member.email}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#03215F] transition-colors group/email"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{member.email}</span>
              </a>
            )}

            {member.phone && (
              <a 
                href={`tel:${member.phone}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#03215F] transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{member.phone}</span>
              </a>
            )}

            {member.role && (
              <div className="text-sm text-gray-600">
                {member.role}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            {member.instagram && (
              <a
                href={member.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-200 hover:border-[#03215F] hover:bg-[#03215F] hover:text-white transition-all duration-300 group/social"
              >
                <Instagram className="w-5 h-5 group-hover/social:scale-110 transition-transform" />
              </a>
            )}

            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-200 hover:border-[#03215F] hover:bg-[#03215F] hover:text-white transition-all duration-300 group/social"
              >
                <Linkedin className="w-5 h-5 group-hover/social:scale-110 transition-transform" />
              </a>
            )}

            {member.facebook && (
              <a
                href={member.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-200 hover:border-[#03215F] hover:bg-[#03215F] hover:text-white transition-all duration-300 group/social"
              >
                <Facebook className="w-5 h-5 group-hover/social:scale-110 transition-transform" />
              </a>
            )}

            {member.twitter && (
              <a
                href={member.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-200 hover:border-[#03215F] hover:bg-[#03215F] hover:text-white transition-all duration-300 group/social"
              >
                <Twitter className="w-5 h-5 group-hover/social:scale-110 transition-transform" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Users className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Leadership Members</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">Meet Our Board Members</h1>
            <p className="text-xl opacity-90">
              Dedicated professionals working together to advance dentistry in
              Bahrain. Our Board Members brings together diverse expertise and shared
              commitment to professional excellence.
            </p>
          </div>
        </div>
      </div>

      {/* Executive Board */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Executive Board
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leadership team guiding the Bahrain Dental Society's vision and
            strategy
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {(boardMembers.length ? boardMembers : staticMembers).map((member, index) => (
            <MemberCard key={index} member={member} />
          ))}
        </div>

      </div>

      {/* Team Values */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Our Board Values
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Collaboration
                </h3>
                <p className="text-gray-600 text-sm">
                  Working together across specialties to achieve common goals
                </p>
              </div>

              <div className="bg-white rounded-xl p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Excellence
                </h3>
                <p className="text-gray-600 text-sm">
                  Maintaining highest professional standards in all activities
                </p>
              </div>

              <div className="bg-white rounded-xl p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Commitment
                </h3>
                <p className="text-gray-600 text-sm">
                  Dedicated service to members and the dental community
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Team CTA */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Want to Work With Our Board Members?
              </h2>
              <p className="opacity-90">
                Contact our executive board or committee chairs for
                collaboration, questions, or to get involved in society
                activities.
              </p>
            </div>
            <a
              href="mailto:info@bds-bh.org"
              className="px-8 py-3 bg-white text-[#03215F] rounded-lg hover:bg-gray-100 transition-colors font-semibold whitespace-nowrap"
            >
              Contact Our Board
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
