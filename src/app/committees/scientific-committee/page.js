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

export default function ScientificCommitteePage() {
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
            <h1 className="text-5xl font-bold mb-6">Scientific Committee</h1>
            <p className="text-xl opacity-90 mb-8">
              Driving dental research, innovation, and scientific excellence in 
              Bahrain. We foster evidence-based practice, promote cutting-edge 
              research, and facilitate knowledge exchange within the dental community.
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

      {/* Committee Overview */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Advancing Dental Science in Bahrain
            </h2>
            <div className="space-y-6">
              <p className="text-gray-600 text-lg">
                The Scientific Committee serves as the intellectual engine of the 
                Bahrain Dental Society, dedicated to promoting research excellence, 
                fostering innovation, and ensuring that dental practice in Bahrain 
                is grounded in the latest scientific evidence.
              </p>
              <p className="text-gray-600 text-lg">
                Through our conferences, research initiatives, and educational 
                programs, we create platforms for knowledge exchange, support 
                emerging researchers, and contribute to the global dental science 
                community while addressing Bahrain-specific oral health challenges.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">15+</div>
              <div className="text-lg opacity-90">Research Projects</div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3" />
                <span>Annual Conference</span>
              </div>
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-3" />
                <span>3 Clinical Guidelines</span>
              </div>
              <div className="flex items-center">
                <Target className="w-5 h-5 mr-3" />
                <span>8 Key Responsibilities</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3" />
                <span>6 Expert Members</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Responsibilities */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Key Responsibilities
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyResponsibilities.map((responsibility, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mb-4 text-white">
                  <Target className="w-6 h-6" />
                </div>
                <p className="text-gray-600">
                  {responsibility}
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
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Specialty: </span>
                    <span className="font-medium text-gray-700">{member.specialty}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Qualifications: </span>
                    <span className="text-gray-600">{member.qualifications}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Research Focus: </span>
                    <span className="text-gray-600">{member.researchFocus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Conferences */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Upcoming Scientific Events
          </h2>
          <div className="space-y-6">
            {upcomingConferences.map((conference, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium mr-4 ${
                        conference.status === "Open for Abstracts" 
                          ? "bg-[#AE9B66] text-white"
                          : conference.status === "Registration Open"
                          ? "bg-[#9cc2ed] text-[#03215F]"
                          : "bg-[#ECCF0F] text-[#03215F]"
                      }`}>
                        {conference.status}
                      </div>
                      <div className="text-gray-600">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        {conference.date}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {conference.title}
                    </h3>
                    <div className="text-gray-600 space-y-2">
                      <p className="font-medium">Theme: {conference.theme}</p>
                      <p>Location: {conference.location}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Details
                    </button>
                    <button className="px-4 py-2 text-sm bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity">
                      {conference.status.includes("Abstract") ? "Submit Abstract" : "Register Now"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Research Initiatives */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Active Research Initiatives
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {researchInitiatives.map((initiative, index) => (
              <div key={index} className="bg-white rounded-xl p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mb-4 text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {initiative.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {initiative.description}
                </p>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Timeline: </span>
                    <span className="font-medium text-gray-700">{initiative.timeline}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Collaborators: </span>
                    <span className="text-gray-600">{initiative.collaborators.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Funding: </span>
                    <span className="font-medium text-[#03215F]">{initiative.funding}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publications & Resources */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Publications & Resources
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Conference Proceedings 2023",
                type: "Research Papers",
                count: "42 papers",
                icon: <FileText className="w-6 h-6" />
              },
              {
                title: "Clinical Guidelines",
                type: "Practice Documents",
                count: "3 guidelines",
                icon: <BookOpen className="w-6 h-6" />
              },
              {
                title: "Research Grant Handbook",
                type: "Funding Guide",
                count: "Updated 2024",
                icon: <Award className="w-6 h-6" />
              },
              {
                title: "Journal Club Archive",
                type: "Educational",
                count: "24 sessions",
                icon: <Users className="w-6 h-6" />
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
                  <div>{resource.count}</div>
                </div>
                <button className="mt-4 w-full py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Access
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Call for Collaboration */}
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Collaborate on Research
              </h2>
              <p className="opacity-90">
                Interested in dental research? Submit your abstract for our 
                upcoming conference, apply for research grants, or join our 
                journal club. Let's advance dental science together!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:scientific@bahraindentalsociety.org"
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