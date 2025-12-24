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

export default function SocialPublicHealthCommitteePage() {
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
            <h1 className="text-5xl font-bold mb-6">Social and Public Health Committee</h1>
            <p className="text-xl opacity-90 mb-8">
              Bridging dental professionals with the community through public 
              health initiatives and social engagement. We promote oral health 
              awareness, provide community services, and foster social connections 
              among Bahrain's dental community.
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

      {/* Committee Overview */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Serving Community & Fostering Connections
            </h2>
            <div className="space-y-6">
              <p className="text-gray-600 text-lg">
                The Social and Public Health Committee serves dual purposes: 
                improving oral health in the Bahraini community through public 
                health initiatives, and strengthening social bonds within the 
                dental profession through engaging activities and events.
              </p>
              <p className="text-gray-600 text-lg">
                We believe that dental professionals have a responsibility to 
                serve their communities while also benefiting from a strong, 
                supportive professional network. Our committee bridges these 
                two essential aspects of professional life.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">8,000+</div>
              <div className="text-lg opacity-90">Community Members Served Annually</div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3" />
                <span>4 Major Programs</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3" />
                <span>6 Committee Members</span>
              </div>
              <div className="flex items-center">
                <Target className="w-5 h-5 mr-3" />
                <span>15+ Annual Events</span>
              </div>
              <div className="flex items-center">
                <Heart className="w-5 h-5 mr-3" />
                <span>Established 2015</span>
              </div>
            </div>
          </div>
        </div>

        {/* Community Programs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Community Health Programs
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {communityPrograms.map((program, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mr-4 text-white">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {program.title}
                    </h3>
                    <div className="text-[#03215F] font-semibold">{program.target}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-500">Reach</div>
                  <div className="font-medium text-gray-700">{program.reach}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-2">Activities</div>
                  <div className="space-y-2">
                    {program.activities.map((activity, idx) => (
                      <div key={idx} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#03215F] to-[#03215F] mr-3"></div>
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
                <button className="mt-6 w-full py-2 text-sm bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity">
                  Volunteer for Program
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

        {/* Upcoming Events */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Upcoming Community Events
          </h2>
          <div className="space-y-6">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#03215F]">
                        {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric' })}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <div className="text-gray-600 space-y-2">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {event.date}
                        </div>
                        <div className="flex items-center">
                          <Home className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                        <p>{event.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Details
                    </button>
                    <button className="px-4 py-2 text-sm bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity">
                      Register as Volunteer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Activities */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Social Activities & Member Engagement
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {socialActivities.map((activity, index) => (
              <div key={index} className="bg-white rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center mr-4 text-white">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {activity.title}
                    </h3>
                    <div className="text-[#03215F] font-semibold">{activity.frequency}</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {activity.description}
                </p>
                <div className="text-sm">
                  <span className="text-gray-500">Typical Participation: </span>
                  <span className="font-medium text-gray-700">{activity.participants}</span>
                </div>
                <button className="mt-4 w-full py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Express Interest
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Statistics */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Impact in Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "8,000+", label: "Community Members Served" },
              { number: "50+", label: "Schools & Institutions" },
              { number: "300+", label: "Volunteer Hours Monthly" },
              { number: "15+", label: "Annual Social Events" }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-lg">
                <div className="text-3xl font-bold text-[#03215F] mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Get Involved */}
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Join Our Community Efforts
              </h2>
              <p className="opacity-90">
                Whether you want to volunteer for community health programs, 
                participate in social events, or contribute to public health 
                initiatives, we welcome your involvement. Together, we can make 
                a difference in Bahrain's oral health and professional community.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:community@bahraindentalsociety.org"
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