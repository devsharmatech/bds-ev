"use client";

import { 
  Users, 
  Briefcase, 
  FileText, 
  Shield, 
  Award,
  Calendar,
  Mail,
  Target,
  CheckCircle,
  TrendingUp,
  BookOpen,
  Heart
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfessionalAffairsCommitteePage() {
  const [committee, setCommittee] = useState(null);
  const [pages, setPages] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/committees/professional-affairs-committee");
        const data = await res.json();
        if (data.success) {
          setCommittee(data.committee);
          setPages(data.pages || []);
          setMembers(data.members || []);
        }
      } catch (e) {
        console.error("Failed to load committee", e);
      }
    };
    load();
  }, []);
  const showStatic = false;

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Briefcase className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Professional Standards</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">{committee?.hero_title || "Professional Affairs Committee"}</h1>
            <p className="text-xl opacity-90 mb-8">
              {committee?.hero_subtitle || `The Professional Affairs Committee of the Bahrain Dental Society plays a key role 
              in addressing the needs and concerns of dental professionals. It focuses on promoting 
              high standards of practice, advocating for ethical guidelines, and supporting professional 
              development. Additionally, the committee builds connections with dental associations 
              in other countries, fostering international collaboration and ensuring that Bahraini 
              dentists remain engaged with global advancements in the field.`}
            </p>
            <div className="my-2">
             
              <span className=" text-white/90">
                Want to become part of the committee? Please fill out the registration form below to join.
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                <span>Standards Development</span>
              </div>
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                <span>CPD Accreditation</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>Professional Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-12">
        {pages.length > 0 && (
          <div className="space-y-8">
            {pages.map((p) => (
              <div key={p.id} className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{p.title}</h3>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: p.content || "" }} />
              </div>
            ))}
          </div>
        )}

        {members.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Committee Members</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((m) => (
                <div key={m.id} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center text-white text-xl font-bold mr-4 overflow-hidden">
                      {m.photo_url ? <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" /> : (m.name || "U").split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{m.name}</h3>
                      <div className="text-[#03215F] font-semibold">{[m.position, m.specialty].filter(Boolean).join(" • ")}</div>
                    </div>
                  </div>
                  {m.role && <div className="text-sm text-gray-600">{m.role}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {committee?.contact_email && (
          <div className="bg-white rounded-2xl p-8 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Contact</h3>
                <p className="text-sm text-gray-600">Reach out to the committee</p>
              </div>
              <a href={`mailto:${committee.contact_email}`} className="px-4 py-2 bg-[#03215F] text-white rounded-lg">
                {committee.contact_email}
              </a>
            </div>
          </div>
        )}

        {!pages.length && !members.length && !committee?.contact_email && (
          <div className="text-center text-gray-600">Content coming soon.</div>
        )}
      </div>
    </MainLayout>
  );
}