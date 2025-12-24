import {
  Award,
  Users,
  Target,
  Heart,
  ChevronRight,
  Calendar,
  BookOpen,
  Shield,
  Globe,
  GraduationCap,
  Handshake,
  TrendingUp,
  CheckCircle,
  Instagram,
  Linkedin,
} from "lucide-react";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";

const values = [
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: "Professional Development",
    description:
      "Promoting continuous education and career advancement for dentists",
  },
  {
    icon: <Handshake className="w-8 h-8" />,
    title: "Collaboration",
    description:
      "Connecting dental professionals with government and international associations",
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Global Standards",
    description:
      "Advancing dental care standards both locally and internationally",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Community",
    description:
      "Fostering a strong professional network of dentists in Bahrain",
  },
];

const achievements = [
  {
    year: "1994",
    title: "Society Founded",
    description:
      "Bahrain Dental Society established as the premier dental organization",
    icon: <Shield className="w-6 h-6" />,
  },
  {
    year: "2000s",
    title: "National Recognition",
    description:
      "Became the official voice for dental professionals in Bahrain",
    icon: <Award className="w-6 h-6" />,
  },
  {
    year: "2010s",
    title: "International Partnerships",
    description: "Established collaborations with global dental associations",
    icon: <Globe className="w-6 h-6" />,
  },
  {
    year: "Present",
    title: "Continuous Growth",
    description: "Leading dental education and advocacy in the Kingdom",
    icon: <TrendingUp className="w-6 h-6" />,
  },
];

const boardMembers = [
  {
    name: "Dr. Abbas Alfardan",
    position: "President",
    email: "bahrain.ds94@gmail.com",
    phone: "+973 37990963",
    image: "/im1.jpg",
    instagram: "https://www.instagram.com/drabbasalfardan/",
    linkedin: "https://www.linkedin.com/in/dr-abbas-al-fardan-%F0%9F%87%A7%F0%9F%87%AD-a08b1816a/",
  },
  {
    name: "Dr. Ameera Almosali",
    position: "Vice President and Head of the Professional Affairs Committee",
    email: "bds.prof.affairs@gmail.com",
    phone: "+973 37990963",
    image: "/im2.jpg",
    instagram: "https://www.instagram.com/dr.ameera.almosali?igsh=MTczcnBiNmo5ZHFtMQ==",
    linkedin: "https://bh.linkedin.com/in/dr-ameera-almosali-1792a71ab",
  },
  {
    name: "Dr. Talal Alalawi",
    position: "General Secretary",
    email: "bahrain.ds94@gmail.com",
    phone: "+973 37990963",
    image: "/im3.jpg",
    instagram: "https://instagram.com/https://www.instagram.com/alawidental?igsh=OWZzamNtamFiOGQz",
    linkedin: "https://bh.linkedin.com/in/talal-al-alawi-a9534764",
  },
  {
    name: "Dr. Taghreed Ajoor",
    position: "Treasurer",
    email: "bahrain.ds94@gmail.com",
    phone: "+973 37990963",
    image: "/im4.jpg",
    instagram: "https://www.instagram.com/ajoordentist?igsh=dGR4YzYzcGNoeHh4",
    linkedin: "https://bh.linkedin.com/in/taghreed-ajoor-a216a332",
  },
  {
    name: "Dr. Afaf Alqayem",
    position: "Board Member and Head of the Media Committee",
    email: "bds.mediacommittee@gmail.com",
    phone: "+973 37990963",
    image: "/im5.jpg",
    instagram: "https://www.instagram.com/dr_alqayem?igsh=MTMwMGs5YmttcXUz",
    linkedin: "https://bh.linkedin.com/in/afaf-alqayem-3540b1158",
  },
  {
    name: "Dr. Taha Al Dairiy",
    position: "Board Member",
    email: "bahrain.ds94@gmail.com",
    phone: "+973 37990963",
    image: "/im6.jpg",
    instagram: "https://www.instagram.com/dairy80?igsh=MXIyeTY2eW1sZ3c1MA==",
    linkedin: "",
  },
  {
    name: "Dr. Maysoon Al Alawi",
    position: "Board Member and Head of the Scientific Committee",
    email: "bahrain.ds94@gmail.com",
    phone: "+973 37990963",
    image: "/im7.jpg",
    instagram: "https://www.instagram.com/dr.maysoonalalawi?igsh=b2lnbXY3b3Rham0y",
    linkedin: "https://bh.linkedin.com/in/maysoon-alalawi",
  },
];

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-48 -translate-x-48"></div>
          </div>

          <div className="container relative mx-auto px-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <Shield className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Established 1994</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Bahrain Dental Society:{" "}
                <span className="text-[#AE9B66]">
                  Three Decades of Excellence
                </span>
              </h1>

              <p className="text-xl opacity-90 mb-8">
                Since 1994, we have been the cornerstone of dental profession
                development in Bahrain, supporting dentists with resources,
                education, and a platform to thrive.
              </p>

              <div className="flex flex-wrap gap-6">
                <Link href="/membership">
                  <button className="px-8 py-3 bg-white text-[#03215F] rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center">
                    Join Our Community
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </button>
                </Link>

                <Link href="/events">
                  <button className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold flex items-center">
                    <Calendar className="mr-2 w-5 h-5" />
                    Upcoming Events
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Aim */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our <span className="text-[#03215F]">Purpose</span>
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="w-6 h-6 mr-3 text-[#03215F]" />
                      The Journey So Far
                    </h3>
                    <p className="text-gray-600">
                      The Bahrain Dental Society, established in 1994, has been
                      a cornerstone in the development of the dental profession
                      in Bahrain. Since its inception, the society has played a
                      pivotal role in supporting and guiding dentists across the
                      Kingdom, providing them with the resources, education, and
                      platform to thrive in their careers. ​ Over the years, it
                      has helped countless dental professionals stay abreast of
                      the latest advancements in the field, facilitated valuable
                      networking opportunities, and acted as a strong advocate
                      for the dental community. ​ Through its ongoing commitment
                      to professional growth and collaboration, the Bahrain
                      Dental Society continues to empower dentists and elevate
                      the standards of oral healthcare in Bahrain.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <Target className="w-6 h-6 mr-3 text-[#03215F]" />
                      Our Aim
                    </h3>
                    <p className="text-gray-600">
                      The Bahrain Dental Society is an organization established
                      by dentists for dentists, with the aim of fostering a
                      strong professional community in Bahrain. It serves as a
                      vital link between dental professionals and government
                      bodies, as well as other international dental
                      associations, facilitating collaboration, knowledge
                      exchange, and advocacy. The society is dedicated to
                      supporting its members by promoting continuous education,
                      professional development, and advancing the standards of
                      dental care, both locally and globally.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div className="bg-gradient-to-br from-[#03215F]/10 to-[#AE9B66]/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Our Core Values
              </h3>

              <div className="space-y-6">
                {values.map((value, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#03215F] to-[#AE9B66] flex items-center justify-center">
                      <div className="text-white">{value.icon}</div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {value.title}
                      </h4>
                      <p className="text-gray-600">
                        {value.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* History & Achievements Timeline */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our <span className="text-[#03215F]">Journey Since 1994</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Three decades of supporting and guiding dentists across the
                Kingdom of Bahrain
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#03215F] to-[#AE9B66] hidden md:block"></div>

              <div className="grid md:grid-cols-2 gap-8">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`relative ${
                      index % 2 === 0
                        ? "md:text-right md:pr-12"
                        : "md:pl-12 md:mt-16"
                    }`}
                  >
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <div className="flex items-center mb-4 md:mb-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#03215F] to-[#AE9B66] flex items-center justify-center text-white mr-4 md:mr-0">
                          {achievement.icon}
                        </div>
                        <div
                          className={`md:w-full ${
                            index % 2 === 0 ? "md:order-last md:text-right" : ""
                          }`}
                        >
                          <div className="text-2xl font-bold text-[#03215F]">
                            {achievement.year}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {achievement.title}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        {achievement.description}
                      </p>
                    </div>

                    {/* Timeline dot for desktop */}
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#03215F] rounded-full border-4 border-white hidden md:block"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white rounded-xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
                <div className="text-5xl font-bold text-[#03215F] mb-3">
                  30+
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-3">
                  Years of Service
                </div>
                <p className="text-gray-600">
                  Serving the dental community since 1994
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
                <div className="text-5xl font-bold text-[#03215F] mb-3">
                  100+
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-3">
                  Annual Events
                </div>
                <p className="text-gray-600">
                  Workshops, conferences, and seminars
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
                <div className="text-5xl font-bold text-[#03215F] mb-3">∞</div>
                <div className="text-lg font-semibold text-gray-900 mb-3">
                  Professional Impact
                </div>
                <p className="text-gray-600">
                  Countless dentists supported and guided
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Leadership Board */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Leadership <span className="text-[#03215F]">Board</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dedicated professionals guiding the Bahrain Dental Society
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boardMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 flex gap-5 items-center"
              >
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-lg object-cover border"
                  />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <p className="text-sm text-[#03215F] font-semibold mb-1">
                    {member.position}
                  </p>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>

                  <p className="text-sm text-gray-600">
                    {member.email}
                  </p>

                  <p className="text-sm text-gray-600 mb-3">
                    {member.phone}
                  </p>

                  {/* Social Icons */}
                  <div className="flex gap-3">
                    {member.instagram && (
                      <a
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-[#03215F] hover:text-white transition"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}

                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-[#03215F] hover:text-white transition"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Join Bahrain's Premier Dental Community
              </h2>

              <p className="text-xl opacity-90 mb-8">
                Established by dentists for dentists, we provide the platform,
                resources, and network you need to excel in your dental career
                in Bahrain.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/membership">
                  <button className="px-8 py-3 bg-white text-[#03215F] rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                    Become a Member Today
                  </button>
                </Link>

                <Link href="/contact">
                  <button className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold">
                    Contact Our Team
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
