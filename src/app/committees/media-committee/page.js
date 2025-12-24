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

export default function MediaCommitteePage() {
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
            <h1 className="text-5xl font-bold mb-6">Media Committee</h1>
            <p className="text-xl opacity-90 mb-8">
              Amplifying the voice of Bahrain's dental community through strategic 
              communications, digital media, and public relations. We connect 
              members, share knowledge, and promote the achievements of Bahraini 
              dentistry to the world.
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

      {/* Committee Overview */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              The Voice of Bahrain Dental Society
            </h2>
            <div className="space-y-6">
              <p className="text-gray-600 text-lg">
                The Media Committee serves as the communication hub for the 
                Bahrain Dental Society, responsible for internal communications 
                among members and external promotion to the public and media. 
                We ensure that the Society's activities, achievements, and 
                professional insights reach the right audiences effectively.
              </p>
              <p className="text-gray-600 text-lg">
                From managing our digital presence to producing publications 
                and handling media relations, we work to build and maintain 
                the positive image of Bahrain's dental profession while keeping 
                members informed and connected.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-lg opacity-90">Social Media Followers</div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3" />
                <span>Monthly Newsletter</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3" />
                <span>6 Committee Members</span>
              </div>
              <div className="flex items-center">
                <Target className="w-5 h-5 mr-3" />
                <span>4 Communication Channels</span>
              </div>
              <div className="flex items-center">
                <Megaphone className="w-5 h-5 mr-3" />
                <span>Established 2016</span>
              </div>
            </div>
          </div>
        </div>

        {/* Communication Channels */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Communication Channels
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communicationChannels.map((channel, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mb-4 text-white">
                  {channel.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {channel.platform}
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Audience: </span>
                    <span className="font-medium text-gray-700">{channel.audience}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Reach: </span>
                    <span className="text-gray-600">{channel.reach}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Frequency: </span>
                    <span className="text-gray-600">{channel.frequency}</span>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  View Channel
                </button>
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
                          : project.status === "Planning"
                          ? "bg-[#ECCF0F] text-[#03215F]"
                          : "bg-[#03215F] text-white"
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

        {/* Media Assets & Resources */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Media Assets & Resources
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {mediaAssets.map((asset, index) => (
              <div key={index} className="bg-white rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {asset.type}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {asset.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {asset.downloads} downloads
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-500">Format: </span>
                    <span className="font-medium text-gray-700">{asset.format}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Size: </span>
                    <span className="text-gray-600">{asset.size}</span>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 text-sm bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity">
                  Download Resource
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Content Submission Guidelines */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Content Submission Guidelines
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Submit Your Content
                </h3>
                <ul className="space-y-3">
                  {[
                    "Newsletter articles (500-1000 words)",
                    "Event photos and videos",
                    "Research summaries for public consumption",
                    "Professional achievements and awards",
                    "Educational content for social media",
                    "Opinion pieces on dental topics"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <PenTool className="w-5 h-5 text-[#03215F] mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Submission Process
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mr-4 mt-1 flex-shrink-0 text-white font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Prepare Content</p>
                      <p className="text-sm text-gray-600">
                        Ensure content aligns with BDS guidelines
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mr-4 mt-1 flex-shrink-0 text-white font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Submit via Email</p>
                      <p className="text-sm text-gray-600">
                        Send to media@bahraindentalsociety.org
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mr-4 mt-1 flex-shrink-0 text-white font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Review Process</p>
                      <p className="text-sm text-gray-600">
                        Committee reviews within 7-10 business days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mr-4 mt-1 flex-shrink-0 text-white font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Publication</p>
                      <p className="text-sm text-gray-600">
                        Approved content scheduled for publication
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Get Involved */}
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Join Our Communications Team
              </h2>
              <p className="opacity-90">
                Have skills in writing, photography, video, or social media? 
                Join the Media Committee to help share the story of Bahrain's 
                dental community. We're always looking for creative members 
                to contribute to our communication efforts.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:media@bahraindentalsociety.org"
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