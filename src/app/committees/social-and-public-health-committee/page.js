"use client";

import { 
  Heart, 
  Users, 
  Globe, 
  Home,
  Award,
  Calendar,
  Mail,
  Target,
  TrendingUp,
  BookOpen,
  Shield,
  Coffee
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SocialPublicHealthCommitteePage() {
  const [committee, setCommittee] = useState(null);
  const [pages, setPages] = useState([]);
  const [membersCms, setMembersCms] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/committees/social-and-public-health-committee");
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
      name: "Dr. Noor Al Hashimi",
      position: "Chairperson",
      specialty: "Public Health Dentistry",
      role: "Lead community health initiatives and strategic planning"
    },
    {
      name: "Dr. Fatima Al Jishi",
      position: "Vice Chair",
      specialty: "Periodontics",
      role: "Coordinate school and community programs"
    },
    {
      name: "Dr. Sara Mohammed",
      position: "Secretary",
      specialty: "Pediatric Dentistry",
      role: "Documentation and program coordination"
    },
    {
      name: "Dr. James Wilson",
      position: "Member",
      specialty: "Community Dentistry",
      role: "Public health campaigns and outreach"
    },
    {
      name: "Dr. Layla Al Mansoori",
      position: "Member",
      specialty: "General Dentistry",
      role: "Social events and member engagement"
    },
    {
      name: "Dr. Mohammed Al Ansari",
      position: "Member",
      specialty: "Forensic Dentistry",
      role: "Special projects and inter-agency coordination"
    }
  ];

  const communityPrograms = [
    {
      title: "School Oral Health Program",
      target: "Elementary Schools",
      reach: "5,000+ students annually",
      activities: ["Dental screenings", "Oral health education", "Preventive treatments"]
    },
    {
      title: "Senior Citizen Dental Care",
      target: "Elderly Care Homes",
      reach: "500+ seniors quarterly",
      activities: ["Mobile dental clinics", "Denture services", "Oral cancer screenings"]
    },
    {
      title: "World Oral Health Day Campaign",
      target: "General Public",
      reach: "10,000+ participants",
      activities: ["Public awareness events", "Free checkups", "Educational materials"]
    },
    {
      title: "Special Needs Dental Care",
      target: "Special Needs Centers",
      reach: "300+ individuals annually",
      activities: ["Specialized care", "Caregiver training", "Preventive programs"]
    }
  ];

  const upcomingEvents = [
    {
      title: "Community Dental Screening Camp",
      date: "April 20, 2024",
      location: "Muharraq Public Park",
      description: "Free dental checkups and oral health education for the community"
    },
    {
      title: "Oral Health Workshop for Teachers",
      date: "May 5, 2024",
      location: "Ministry of Education",
      description: "Training teachers to promote oral health in classrooms"
    },
    {
      title: "Ramadan Charity Dental Clinic",
      date: "April 1-30, 2024",
      location: "Various Locations",
      description: "Special dental services for underprivileged families during Ramadan"
    },
    {
      title: "Beach Cleanup & Awareness Day",
      date: "June 8, 2024",
      location: "Al Jazair Beach",
      description: "Combining environmental awareness with oral health education"
    }
  ];

  const socialActivities = [
    {
      title: "Annual BDS Gala Dinner",
      description: "Celebratory event for members and their families",
      frequency: "Annual",
      participants: "300+ members"
    },
    {
      title: "New Member Welcome Reception",
      description: "Social gathering to welcome new BDS members",
      frequency: "Quarterly",
      participants: "50-100 members"
    },
    {
      title: "Family Day Picnic",
      description: "Outdoor event for members and their families",
      frequency: "Bi-annual",
      participants: "200+ people"
    },
    {
      title: "Sports Tournament",
      description: "Friendly competitions among dental professionals",
      frequency: "Annual",
      participants: "150+ participants"
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Heart className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Community & Social Engagement</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              {committee?.hero_title || "Social and Public Health Committee"}
            </h1>
            <p className="text-xl opacity-90 mb-8">
              {committee?.hero_subtitle || `Bridging dental professionals with the community through public 
              health initiatives and social engagement. We promote oral health 
              awareness, provide community services, and foster social connections 
              among Bahrain's dental community.`}
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                <span>Community Outreach</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>Social Engagement</span>
              </div>
              <div className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                <span>Public Health Programs</span>
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