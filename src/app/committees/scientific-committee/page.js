"use client";

import { 
  BookOpen, 
  Microscope, 
  Award, 
  Calendar,
  Users,
  FileText,
  Target,
  Mail,
  TrendingUp,
  Lightbulb,
  Globe,
  Presentation
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ScientificCommitteePage() {
  const [committee, setCommittee] = useState(null);
  const [pages, setPages] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/committees/scientific-committee");
        const data = await res.json();
        if (data.success) {
          setCommittee(data.committee);
          setPages(data.pages || []);
          setMembers(data.members || []);
        }
      } catch {}
    };
    load();
  }, []);
  const committeeMembers = [
    {
      name: "Dr. Omar Rashid",
      position: "Chairperson",
      specialty: "Oral Surgery",
      qualifications: "PhD, FRCS(Ed)",
      researchFocus: "Oral cancer research, reconstructive surgery"
    },
    {
      name: "Dr. Sarah Johnson",
      position: "Vice Chair",
      specialty: "Biomaterials",
      qualifications: "PhD, MSc",
      researchFocus: "Dental materials, tissue engineering"
    },
    {
      name: "Dr. Ahmed Al Khalifa",
      position: "Secretary",
      specialty: "Orthodontics",
      qualifications: "MSc, BDS",
      researchFocus: "Digital orthodontics, growth studies"
    },
    {
      name: "Dr. Maria Rodriguez",
      position: "Member",
      specialty: "Periodontics",
      qualifications: "PhD, Cert Perio",
      researchFocus: "Periodontal regeneration, microbiome"
    },
    {
      name: "Dr. Robert Kim",
      position: "Member",
      specialty: "Endodontics",
      qualifications: "MSc Endo, BDS",
      researchFocus: "Root canal disinfection, 3D imaging"
    },
    {
      name: "Dr. Fatima Al Jishi",
      position: "Member",
      specialty: "Public Health",
      qualifications: "MPH, PhD",
      researchFocus: "Oral epidemiology, health policy"
    }
  ];

  const keyResponsibilities = [
    "Plan and organize the annual BDS Scientific Conference",
    "Review and approve scientific content for all BDS events",
    "Promote dental research and innovation in Bahrain",
    "Collaborate with international dental research organizations",
    "Develop and maintain clinical practice guidelines",
    "Support research grant applications and funding opportunities",
    "Organize journal club meetings and research seminars",
    "Mentor young researchers and dental students"
  ];

  const upcomingConferences = [
    {
      title: "BDS Annual Scientific Conference 2024",
      date: "November 15-16, 2024",
      theme: "Innovation in Dental Practice: Bridging Research and Clinical Application",
      location: "Bahrain International Exhibition Centre",
      status: "Open for Abstracts"
    },
    {
      title: "Digital Dentistry Symposium",
      date: "September 20, 2024",
      theme: "Digital Workflows in Modern Dental Practice",
      location: "Royal Dental Clinic Training Center",
      status: "Registration Open"
    },
    {
      title: "Research Methodology Workshop",
      date: "July 25, 2024",
      theme: "Fundamentals of Dental Research Design",
      location: "University of Bahrain",
      status: "Limited Seats Available"
    }
  ];

  const researchInitiatives = [
    {
      title: "Bahrain Oral Health Survey",
      description: "National epidemiological study of oral health status",
      timeline: "2023-2025",
      collaborators: ["Ministry of Health", "University of Bahrain"],
      funding: "BD 50,000"
    },
    {
      title: "Dental Materials Testing Lab",
      description: "Establishing standardized testing for dental materials",
      timeline: "2024-2026",
      collaborators: ["Bahrain Standards & Metrology", "Industrial Partners"],
      funding: "BD 75,000"
    },
    {
      title: "AI in Dental Diagnostics",
      description: "Developing AI algorithms for radiographic analysis",
      timeline: "2024-2025",
      collaborators: ["AI Research Center", "Dental Colleges"],
      funding: "BD 30,000"
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Microscope className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Research & Innovation</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              {committee?.hero_title || "Scientific Committee"}
            </h1>
            <p className="text-xl opacity-90 mb-8">
              {committee?.hero_subtitle || `Driving dental research, innovation, and scientific excellence in 
              Bahrain. We foster evidence-based practice, promote cutting-edge 
              research, and facilitate knowledge exchange within the dental community.`}
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                <span>Research Promotion</span>
              </div>
              <div className="flex items-center">
                <Presentation className="w-5 h-5 mr-2" />
                <span>Scientific Conferences</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                <span>Evidence-Based Guidelines</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-12">
        {pages.length > 0 && (
          <div className="space-y-6">
            {pages.map((p) => (
              <div key={p.id} className="bg-white rounded-xl p-6 shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{p.title}</h3>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: p.content || "" }} />
              </div>
            ))}
          </div>
        )}

        {members.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Committee Chairman</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((m) => (
                <div key={m.id} className="bg-white rounded-xl p-6 shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center text-white text-xl font-bold mr-4 overflow-hidden">
                      {m.photo_url ? <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" /> : (m.name || "U").split(" ").map((n) => n[0]).join("")}
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
          <div className="bg-white rounded-xl p-6 shadow flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-gray-900">Contact</div>
              <div className="text-sm text-gray-600">Reach out to the committee</div>
            </div>
            <a href={`mailto:${committee.contact_email}`} className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#03215F] text-white">
              <Mail className="w-4 h-4" />
              {committee.contact_email}
            </a>
          </div>
        )}

        {!pages.length && !members.length && !committee?.contact_email && (
          <div className="text-center text-gray-600">Content coming soon.</div>
        )}
      </div>
    </MainLayout>
  );
}