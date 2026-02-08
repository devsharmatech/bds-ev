"use client";

import { 
  Users, 
  BookOpen, 
  Heart, 
  Calendar,
  Mail,
  ArrowRight,
  Target,
  Globe,
  CheckCircle,
  Briefcase
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CommitteesPage() {
  const [activeCommittee, setActiveCommittee] = useState(0);
  const [committees, setCommittees] = useState([]);
  const [committeesLoading, setCommitteesLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setCommitteesLoading(true);
        const res = await fetch("/api/committees");
        const data = await res.json();
        if (data.success && Array.isArray(data.committees) && data.committees.length > 0) {
          const mapped = data.committees.map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            icon: /scientific/i.test(c.name) ? <BookOpen className="w-6 h-6" /> :
                  /professional/i.test(c.name) ? <Briefcase className="w-6 h-6" /> :
                  /media/i.test(c.name) ? <Globe className="w-6 h-6" /> :
                  /social|public/i.test(c.name) ? <Heart className="w-6 h-6" /> :
                  <Users className="w-6 h-6" />,
            color: /scientific/i.test(c.name) ? "from-[#9cc2ed] to-[#9cc2ed]" :
                   /professional/i.test(c.name) ? "from-[#03215F] to-[#03215F]" :
                   /media/i.test(c.name) ? "from-[#03215F] to-[#9cc2ed]" :
                   "from-[#AE9B66] to-[#AE9B66]",
            chairperson: "",
            viceChair: "",
            focus: c.focus || "",
            objectives: [],
            activities: [],
            meetingSchedule: "As announced",
            contact: c.contact_email || "info@bahraindentalsociety.org",
          }));
          setCommittees(mapped);
          setActiveCommittee(0);
        } else {
          setCommittees([]);
        }
      } catch (e) {
        console.error("Failed to fetch committees", e);
        setCommittees([]);
      } finally {
        setCommitteesLoading(false);
      }
    };
    load();
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Users className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Working Committees</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">BDS Committees</h1>
            <p className="text-xl opacity-90 mb-8">
              The Bahrain Dental Society is structured with specialized committees dedicated 
              to education, research, advocacy, community outreach, and professional development. 
              By leveraging members’ expertise, the Society advances dentistry across Bahrain and 
              supports the needs of dental professionals.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                <span>{committees.length} Active Committees</span>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Committees Grid */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#03215F]">All Committees</h2>
            <p className="text-gray-600">Select a committee to view its page and details.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-[#03215F]" />
            {committees.length} Committees
          </div>
        </div>

        {committeesLoading ? (
          <div className="text-center py-12 text-gray-500">Loading committees...</div>
        ) : committees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No committees found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {committees.map((committee, index) => (
              <div key={committee.id} className="bg-white rounded-2xl shadow border border-gray-100 p-6 flex flex-col">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${committee.color} text-white flex items-center justify-center mb-4`}>
                  {committee.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{committee.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{committee.focus}</p>
                <div className="mt-auto flex items-center gap-2">
                  <button
                    onClick={() => setActiveCommittee(index)}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    Overview
                  </button>
                  {committee.slug ? (
                    <Link
                      href={`/committees/${committee.slug}`}
                      className="px-4 py-2 text-sm bg-[#03215F] text-white rounded-lg hover:bg-[#021642] transition"
                    >
                      View Page
                    </Link>
                  ) : (
                    <button
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                      disabled
                    >
                      View Page
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Committee Navigation */}
      {committees.length > 0 && (
        <div className="container mx-auto px-4 py-4">
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4 min-w-max">
              {committees.map((committee, index) => (
                <button
                  key={committee.id}
                  onClick={() => setActiveCommittee(index)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                    activeCommittee === index
                      ? 'bg-gradient-to-r from-[#03215F] to-[#03215F] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    {committee.icon}
                    <span className="ml-2">{committee.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Committee Details */}
      {committees.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Committee Header */}
            <div className={`bg-gradient-to-r ${committees[activeCommittee].color} text-white p-8`}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4">
                  {committees[activeCommittee].icon}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">
                    {committees[activeCommittee].name}
                  </h2>
                  <p className="opacity-90">{committees[activeCommittee].focus}</p>
                </div>
              </div>
            </div>

            {/* Committee Details */}
            <div className="p-8">
              <div className="grid lg:grid-cols-3 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-[#03215F]" />
                      Leadership
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Chairperson</p>
                        <p className="font-semibold text-gray-900">
                          {committees[activeCommittee].chairperson}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Vice Chair</p>
                        <p className="font-semibold text-gray-900">
                          {committees[activeCommittee].viceChair}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-[#03215F]" />
                      Meeting Schedule
                    </h3>
                    <p className="text-gray-700">
                      {committees[activeCommittee].meetingSchedule}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-[#03215F]" />
                      Contact
                    </h3>
                    <a 
                      href={`mailto:${committees[activeCommittee].contact}`}
                      className="text-[#03215F] hover:text-[#03215F] font-semibold"
                    >
                      {committees[activeCommittee].contact}
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Committee Objectives
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {committees[activeCommittee].objectives.map((objective, index) => (
                        <div key={index} className="flex items-start bg-gray-50 rounded-lg p-4">
                          <Target className="w-5 h-5 text-[#03215F] mr-3 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{objective}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Key Activities
                    </h3>
                    <div className="space-y-3">
                      {committees[activeCommittee].activities.map((activity, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#03215F] to-[#03215F] mr-3"></div>
                          <span className="text-gray-700">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Committees Grid */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          All BDS Committees
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {committees.map((committee) => (
            <div key={committee.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${committee.color} flex items-center justify-center mb-4 text-white`}>
                {committee.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {committee.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {committee.focus}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Chairperson</p>
                  <p className="font-semibold text-gray-900">
                    {committee.chairperson}
                  </p>
                </div>
                <a 
                  href={committee.slug ? `/committees/${committee.slug}` : "#"}
                  className="text-[#03215F] hover:text-[#03215F] font-semibold flex items-center"
                >
                  Visit Page
                  <ArrowRight className="ml-1 w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Committee Membership */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Join a Committee
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Committee Membership Benefits
                </h3>
                <ul className="space-y-3">
                  {[
                    "Professional leadership experience",
                    "Networking with committee chairman",
                    "Skill development in specialized areas",
                    "Direct impact on BDS activities",
                    "Recognition within dental community",
                    "Career advancement opportunities"
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-[#AE9B66] mr-3" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  How to Join
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mr-4 mt-1 flex-shrink-0 text-white font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Express Interest</p>
                      <p className="text-sm text-gray-600">
                        Submit interest form or contact committee chair
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mr-4 mt-1 flex-shrink-0 text-white font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Committee Review</p>
                      <p className="text-sm text-gray-600">
                        Committee reviews applications and interviews candidates
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mr-4 mt-1 flex-shrink-0 text-white font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Approval & Onboarding</p>
                      <p className="text-sm text-gray-600">
                        Successful candidates receive committee appointment
                      </p>
                    </div>
                  </div>
                </div>
                
                <a 
                  href="mailto:committees@bahraindentalsociety.org"
                  className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
                >
                  <Mail className="mr-2 w-5 h-5" />
                  Express Interest
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </MainLayout>
  );
}