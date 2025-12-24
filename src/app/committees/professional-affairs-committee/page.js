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

export default function ProfessionalAffairsCommitteePage() {
  const committeeMembers = [
    {
      name: "Dr. Ahmed Al Khalifa",
      position: "Chairperson",
      specialty: "Orthodontics",
      role: "Lead strategic initiatives and committee oversight"
    },
    {
      name: "Dr. Mariam Al Said",
      position: "Vice Chair",
      specialty: "General Dentistry",
      role: "Support chairperson and coordinate subcommittees"
    },
    {
      name: "Dr. Khalid Hassan",
      position: "Secretary",
      specialty: "Endodontics",
      role: "Documentation and meeting coordination"
    },
    {
      name: "Dr. Layla Al Mansoori",
      position: "Member",
      specialty: "General Dentistry",
      role: "Practice standards development"
    },
    {
      name: "Dr. Omar Rashid",
      position: "Member",
      specialty: "Oral Surgery",
      role: "Professional ethics and conduct"
    },
    {
      name: "Dr. Sara Mohammed",
      position: "Member",
      specialty: "Pediatric Dentistry",
      role: "Continuing education coordination"
    }
  ];

  const strategicObjectives = [
    "Develop and maintain professional practice standards for dentists in Bahrain",
    "Oversee continuing professional development (CPD) accreditation",
    "Address professional ethics and conduct matters",
    "Facilitate career development and mentorship programs",
    "Liaise with regulatory authorities on professional matters",
    "Promote excellence in dental practice through recognition programs"
  ];

  const currentProjects = [
    {
      title: "National Dental Practice Standards Revision",
      status: "In Progress",
      timeline: "Q4 2024",
      description: "Updating comprehensive practice standards to align with international best practices"
    },
    {
      title: "CPD Accreditation Framework",
      status: "Completed",
      timeline: "Q2 2024",
      description: "Development of standardized accreditation system for continuing education"
    },
    {
      title: "Professional Mentorship Program",
      status: "Planning",
      timeline: "Q1 2025",
      description: "Establishing structured mentorship between experienced and new dentists"
    },
    {
      title: "Ethical Guidelines Update",
      status: "In Progress",
      timeline: "Q3 2024",
      description: "Revision of ethical code incorporating contemporary practice challenges"
    }
  ];

  const upcomingMeetings = [
    {
      date: "April 15, 2024",
      time: "6:00 PM",
      location: "BDS Headquarters, Conference Room A",
      agenda: "Practice standards review and public consultation planning"
    },
    {
      date: "May 20, 2024",
      time: "6:30 PM",
      location: "Virtual Meeting",
      agenda: "CPD program evaluation and 2025 planning"
    },
    {
      date: "June 17, 2024",
      time: "6:00 PM",
      location: "BDS Headquarters, Conference Room B",
      agenda: "Mentorship program launch and committee reports"
    }
  ];

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
            <h1 className="text-5xl font-bold mb-6">Professional Affairs Committee</h1>
            <p className="text-xl opacity-90 mb-8">
              Dedicated to advancing professional standards, ethics, and continuous 
              development for dental practitioners in Bahrain. We ensure excellence 
              in dental practice through standards development, CPD accreditation, 
              and professional support.
            </p>
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

      {/* Committee Overview */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Mission & Scope
            </h2>
            <div className="space-y-6">
              <p className="text-gray-600 text-lg">
                The Professional Affairs Committee serves as the cornerstone for 
                maintaining and elevating professional standards within Bahrain's 
                dental community. Our work ensures that dental practitioners have 
                the frameworks, guidance, and support needed to deliver exceptional 
                patient care while upholding the highest ethical standards.
              </p>
              <p className="text-gray-600 text-lg">
                We bridge the gap between regulatory requirements and practical 
                implementation, providing dentists with clear guidelines, educational 
                opportunities, and professional development pathways that align with 
                both local needs and international best practices.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">6</div>
              <div className="text-lg opacity-90">Committee Members</div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3" />
                <span>Monthly Meetings</span>
              </div>
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-3" />
                <span>3 Active Projects</span>
              </div>
              <div className="flex items-center">
                <Target className="w-5 h-5 mr-3" />
                <span>6 Strategic Objectives</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3" />
                <span>Established 2018</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Objectives */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Strategic Objectives
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategicObjectives.map((objective, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mb-4 text-white">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Objective {index + 1}
                </h3>
                <p className="text-gray-600">
                  {objective}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Committee Members */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Committee Members
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {committeeMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center text-white text-xl font-bold mr-4">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {member.name}
                    </h3>
                    <div className="text-[#03215F] font-semibold">{member.position}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-gray-500">Specialty: </span>
                    <span className="font-medium text-gray-700">{member.specialty}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Role: </span>
                    <span className="text-gray-600">{member.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Projects */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Current Projects & Initiatives
          </h2>
          <div className="space-y-6">
            {currentProjects.map((project, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium mr-4 ${
                        project.status === "Completed" 
                          ? "bg-[#AE9B66] text-white"
                          : project.status === "In Progress"
                          ? "bg-[#9cc2ed] text-[#03215F]"
                          : "bg-[#ECCF0F] text-[#03215F]"
                      }`}>
                        {project.status}
                      </div>
                      <div className="text-gray-600">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        {project.timeline}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-600">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Details
                    </button>
                    <button className="px-4 py-2 text-sm bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity">
                      Get Involved
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Upcoming Meetings & Events
          </h2>
          
          <div className="space-y-6">
            {upcomingMeetings.map((meeting, index) => (
              <div key={index} className="bg-white rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#03215F]">
                        {new Date(meeting.date).toLocaleDateString('en-US', { day: 'numeric' })}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        Committee Meeting
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {meeting.date} at {meeting.time}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {meeting.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:text-right">
                    <div className="text-sm text-gray-500 mb-2">Agenda</div>
                    <p className="text-gray-700">{meeting.agenda}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources & Publications */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Resources & Publications
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Practice Standards Guide",
                type: "PDF Guide",
                size: "2.4 MB",
                icon: <FileText className="w-6 h-6" />
              },
              {
                title: "CPD Requirements",
                type: "Policy Document",
                size: "1.8 MB",
                icon: <BookOpen className="w-6 h-6" />
              },
              {
                title: "Ethical Guidelines",
                type: "Handbook",
                size: "3.1 MB",
                icon: <Shield className="w-6 h-6" />
              },
              {
                title: "Annual Report 2023",
                type: "Report",
                size: "4.2 MB",
                icon: <TrendingUp className="w-6 h-6" />
              }
            ].map((resource, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mb-4 text-white">
                  {resource.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {resource.title}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{resource.type}</div>
                  <div>{resource.size}</div>
                </div>
                <button className="mt-4 w-full py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Get Involved */}
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Get Involved with Professional Affairs
              </h2>
              <p className="opacity-90">
                Contribute to shaping professional standards and supporting 
                Bahrain's dental community. Join our working groups, provide 
                feedback on draft documents, or participate in consultation sessions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:professional.affairs@bahraindentalsociety.org"
                className="px-8 py-3 bg-white text-[#03215F] rounded-lg hover:bg-gray-100 transition-colors font-semibold text-center flex items-center justify-center"
              >
                <Mail className="mr-2 w-5 h-5" />
                Contact Committee
              </a>
              <Link 
                href="/committees"
                className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold text-center"
              >
                View All Committees
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}