"use client";

import { 
  Megaphone, 
  Camera, 
  FileText, 
  Share2,
  Users,
  Calendar,
  Mail,
  Target,
  TrendingUp,
  Globe,
  Video,
  PenTool
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MediaCommitteePage() {
  const [committee, setCommittee] = useState(null);
  const [pages, setPages] = useState([]);
  const [membersCms, setMembersCms] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/committees/media-committee");
        const data = await res.json();
        if (data.success) {
          setCommittee(data.committee);
          setPages(data.pages || []);
          setMembersCms(data.members || []);
        }
      } catch {}
    };
    load();
  }, []);
  const committeeMembers = [
    {
      name: "Dr. Layla Al Mansoori",
      position: "Chairperson",
      specialty: "General Dentistry",
      role: "Overall media strategy and communications oversight"
    },
    {
      name: "Dr. Khalid Hassan",
      position: "Vice Chair",
      specialty: "Endodontics",
      role: "Digital content and social media management"
    },
    {
      name: "Dr. Mariam Al Said",
      position: "Secretary",
      specialty: "General Dentistry",
      role: "Content coordination and publication scheduling"
    },
    {
      name: "Dr. Sara Mohammed",
      position: "Content Editor",
      specialty: "Pediatric Dentistry",
      role: "Newsletter editing and article review"
    },
    {
      name: "Dr. Ahmed Al Khalifa",
      position: "Social Media Manager",
      specialty: "Orthodontics",
      role: "Platform management and engagement"
    },
    {
      name: "Dr. Fatima Al Jishi",
      position: "Media Relations",
      specialty: "Periodontics",
      role: "Press releases and external communications"
    }
  ];

  const communicationChannels = [
    {
      platform: "Monthly Newsletter",
      audience: "All BDS Members",
      reach: "500+ subscribers",
      frequency: "Monthly",
      icon: <FileText className="w-6 h-6" />
    },
    {
      platform: "Social Media",
      audience: "Public & Professionals",
      reach: "10,000+ followers",
      frequency: "Daily",
      icon: <Share2 className="w-6 h-6" />
    },
    {
      platform: "BDS Website",
      audience: "Global Audience",
      reach: "5,000+ monthly visitors",
      frequency: "Updated Weekly",
      icon: <Globe className="w-6 h-6" />
    },
    {
      platform: "Press Releases",
      audience: "Media Outlets",
      reach: "20+ media contacts",
      frequency: "As Needed",
      icon: <Megaphone className="w-6 h-6" />
    }
  ];

  const currentProjects = [
    {
      title: "Website Redesign & Content Refresh",
      status: "In Progress",
      timeline: "Q2 2024",
      description: "Modernizing BDS website with improved navigation and content"
    },
    {
      title: "Social Media Campaign: Oral Health Awareness",
      status: "Planning",
      timeline: "Q3 2024",
      description: "Quarter-long campaign promoting oral health best practices"
    },
    {
      title: "Video Content Series: \"Dentists of Bahrain\"",
      status: "Development",
      timeline: "Q2-Q4 2024",
      description: "Feature videos showcasing Bahrain's dental professionals"
    },
    {
      title: "Annual Report 2023 Publication",
      status: "Completed",
      timeline: "Q1 2024",
      description: "Design and distribution of BDS annual report"
    }
  ];

  const mediaAssets = [
    {
      type: "Brand Guidelines",
      description: "Complete brand identity manual for BDS",
      format: "PDF",
      size: "5.2 MB",
      downloads: 142
    },
    {
      type: "Logo Package",
      description: "All logo variations in multiple formats",
      format: "ZIP (PNG, SVG, AI)",
      size: "8.7 MB",
      downloads: 89
    },
    {
      type: "Photography Library",
      description: "Professional photos for BDS use",
      format: "Online Gallery",
      size: "2GB+",
      downloads: 56
    },
    {
      type: "Templates Package",
      description: "Presentation and document templates",
      format: "ZIP (PPT, DOC)",
      size: "12.3 MB",
      downloads: 203
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Megaphone className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Communications & Media</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              {committee?.hero_title || "Media Committee"}
            </h1>
            <p className="text-xl opacity-90 mb-8">
              {committee?.hero_subtitle || `Amplifying the voice of Bahrain's dental community through strategic 
              communications, digital media, and public relations. We connect 
              members, share knowledge, and promote the achievements of Bahraini 
              dentistry to the world.`}
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                <span>Content Creation</span>
              </div>
              <div className="flex items-center">
                <Share2 className="w-5 h-5 mr-2" />
                <span>Social Media Management</span>
              </div>
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                <span>Publications & Newsletters</span>
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

        {membersCms.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Committee Chairman</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {membersCms.map((m) => (
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
                  {m.role && <div className="space-y-3 text-sm text-gray-600">{m.role}</div>}
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

        {!pages.length && !membersCms.length && !committee?.contact_email && (
          <div className="text-center text-gray-600">Content coming soon.</div>
        )}
      </div>
    </MainLayout>
  );
}