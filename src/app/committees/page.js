"use client";

import { 
  Users, 
  BookOpen, 
  Award, 
  Heart, 
  Shield, 
  Calendar,
  Mail,
  ArrowRight,
  Target,
  FileText,
  Globe,
  CheckCircle,
  Briefcase
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { useEffect, useState } from "react";

export default function CommitteesPage() {
  const [activeCommittee, setActiveCommittee] = useState(0);
  const [committees, setCommittees] = useState([
    {
      id: 1,
      name: "Professional Affairs Committee",
      icon: <Briefcase className="w-6 h-6" />,
      color: "from-[#03215F] to-[#03215F]",
      chairperson: "To be announced",
      viceChair: "To be announced",
      focus: "Promoting high standards of practice, ethical guidelines, and professional development; fostering international collaboration.",
      objectives: [
        "Promote high standards of dental practice in Bahrain",
        "Advocate for and maintain ethical guidelines",
        "Support professional development initiatives",
        "Build links with international dental associations"
      ],
      activities: [
        "Guideline reviews and updates",
        "Professional development initiatives",
        "Ethics and practice consultations",
        "International collaboration efforts"
      ],
      meetingSchedule: "As announced",
      contact: "info@bahraindentalsociety.org"
    },
    {
      id: 2,
      name: "Scientific Committee",
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-[#9cc2ed] to-[#9cc2ed]",
      chairperson: "To be announced",
      viceChair: "To be announced",
      focus: "Leading scientific programs, education, and research activities for the Society.",
      objectives: [
        "Organize scientific conferences and seminars",
        "Promote and support dental research",
        "Curate scientific content for events",
        "Collaborate with global scientific bodies"
      ],
      activities: [
        "Conferences and seminars",
        "Research support initiatives",
        "Speaker and content curation",
        "Scientific publications"
      ],
      meetingSchedule: "As announced",
      contact: "info@bahraindentalsociety.org"
    },
    {
      id: 3,
      name: "Social and Public Health Committee",
      icon: <Heart className="w-6 h-6" />,
      color: "from-[#b8352d] to-rose-500",
      chairperson: "To be announced",
      viceChair: "To be announced",
      focus: "Driving oral health awareness, community outreach, and public health initiatives.",
      objectives: [
        "Plan and deliver public health programs",
        "Conduct community outreach and screenings",
        "Promote oral health education",
        "Engage schools and community partners"
      ],
      activities: [
        "Community oral health campaigns",
        "School-based programs",
        "Public screenings and outreach days",
        "Awareness content and events"
      ],
      meetingSchedule: "As announced",
      contact: "info@bahraindentalsociety.org"
    },
    {
      id: 4,
      name: "Media Committee",
      icon: <Globe className="w-6 h-6" />,
      color: "from-[#03215F] to-[#9cc2ed]",
      chairperson: "To be announced",
      viceChair: "To be announced",
      focus: "Overseeing communications, media relations, and public engagement for the Society.",
      objectives: [
        "Manage communications and media presence",
        "Produce content and publications",
        "Promote Society events and initiatives",
        "Strengthen public engagement"
      ],
      activities: [
        "Media relations and releases",
        "Content and social media",
        "Event promotion",
        "Newsletters and updates"
      ],
      meetingSchedule: "As announced",
      contact: "info@bahraindentalsociety.org"
    }
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/committees");
        const data = await res.json();
        if (data.success && Array.isArray(data.committees) && data.committees.length > 0) {
          const mapped = data.committees.map((c) => ({
            id: c.id,
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
        }
      } catch (e) {
        console.error("Failed to fetch committees", e);
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
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>60+ Committee Members</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>Regular Monthly Meetings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Committee Navigation */}
      <div className="container mx-auto px-4 py-8">
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

      {/* Active Committee Details */}
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
                <button 
                  onClick={() => {
                    const index = committees.findIndex(c => c.id === committee.id);
                    setActiveCommittee(index);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="text-[#03215F] hover:text-[#03215F] font-semibold flex items-center"
                >
                  Details
                  <ArrowRight className="ml-1 w-4 h-4" />
                </button>
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
                    "Networking with committee members",
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

      {/* Annual Reports */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Committee Annual Reports
              </h2>
              <p className="opacity-90">
                Access detailed reports on committee activities, achievements, 
                and future plans. Stay informed about the work being done across 
                all BDS committees.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#"
                className="px-8 py-3 bg-white text-[#03215F] rounded-lg hover:bg-gray-100 transition-colors font-semibold text-center flex items-center justify-center"
              >
                <FileText className="mr-2 w-5 h-5" />
                2023 Annual Report
              </a>
              <a 
                href="#"
                className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold text-center"
              >
                All Reports
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}