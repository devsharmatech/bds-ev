"use client";

import {
  Users,
  Award,
  Mail,
  Phone,
  Instagram,
  Linkedin,
  Calendar,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import Image from "next/image";

export default function TeamPage() {
  const boardMembers = [
    {
      name: "Dr. Abbas Alfardan",
      position: "President",
      category: "executive",
      email: "bahrain.ds94@gmail.com",
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
      email: "bahrain.ds94@gmail.com",
      phone: "+973 37990963",
      image: "/im3.jpg",
      instagram: "https://www.instagram.com/alawidental",
      linkedin: "https://bh.linkedin.com/in/talal-al-alawi-a9534764",
    },
    {
      name: "Dr. Taghreed Ajoor",
      position: "Treasurer",
      category: "executive",
      email: "bahrain.ds94@gmail.com",
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
      email: "bahrain.ds94@gmail.com",
      phone: "+973 37990963",
      image: "/im6.jpg",
      instagram: "https://www.instagram.com/dairy80",
      linkedin: "",
    },
    {
      name: "Dr. Maysoon Al Alawi",
      position: "Board Member and Head of the Scientific Committee",
      category: "board",
      email: "bahrain.ds94@gmail.com",
      phone: "+973 37990963",
      image: "/im7.jpg",
      instagram: "https://www.instagram.com/dr.maysoonalalawi",
      linkedin: "https://bh.linkedin.com/in/maysoon-alalawi",
    },
  ];

 
  function MemberCard({ member }) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex gap-5 items-center">
        <Image
          src={member.image}
          alt={member.name}
          width={96}
          height={96}
          className="rounded-lg object-cover border"
        />

        <div className="flex-1">
          <p className="text-sm font-semibold text-[#03215F] mb-1">
            {member.position}
          </p>

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {member.name}
          </h3>

          <p className="text-sm text-gray-600">
            {member.email}
          </p>

          <p className="text-sm text-gray-600 mb-3">
            {member.phone}
          </p>

          <div className="flex gap-3">
            {member.instagram && (
              <a
                href={member.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-[#03215F] hover:text-white transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}

            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-[#03215F] hover:text-white transition"
              >
                <Linkedin className="w-4 h-4" />
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
              <span className="text-sm font-medium">Leadership Team</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">Meet Our Team</h1>
            <p className="text-xl opacity-90">
              Dedicated professionals working together to advance dentistry in
              Bahrain. Our team brings together diverse expertise and shared
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {boardMembers.map((member, index) => (
            <MemberCard key={index} member={member} />
          ))}
        </div>

      </div>

      {/* Team Values */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Our Team Values
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
                Want to Work With Our Team?
              </h2>
              <p className="opacity-90">
                Contact our executive board or committee chairs for
                collaboration, questions, or to get involved in society
                activities.
              </p>
            </div>
            <a
              href="mailto:Bahrain.ds94@gmail.com"
              className="px-8 py-3 bg-white text-[#03215F] rounded-lg hover:bg-gray-100 transition-colors font-semibold whitespace-nowrap"
            >
              Contact Our Team
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
