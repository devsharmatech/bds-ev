"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  User,
  Award,
  MapPin,
  Mail,
  Phone,
  Building,
  Calendar,
  ChevronRight,
  Shield,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
const members = [
  {
    id: 1,
    name: "Dr. Ahmed Al Khalifa",
    specialty: "Orthodontics",
    experience: "15 years",
    clinic: "Royal Dental Clinic",
    location: "Manama",
    email: "ahmed@royalclinic.bh",
    phone: "+973 1234 5678",
    joinDate: "2015",
    status: "Active",
    category: "Gold Member",
  },
  {
    id: 2,
    name: "Dr. Fatima Al Jishi",
    specialty: "Periodontics",
    experience: "12 years",
    clinic: "Al Salam Hospital",
    location: "Muharraq",
    email: "fatima@alsalam.bh",
    phone: "+973 2345 6789",
    joinDate: "2017",
    status: "Active",
    category: "Professional Member",
  },
  {
    id: 3,
    name: "Dr. Khalid Hassan",
    specialty: "Endodontics",
    experience: "10 years",
    clinic: "Dental Specialists Center",
    location: "Riffa",
    email: "khalid@dsc.bh",
    phone: "+973 3456 7890",
    joinDate: "2018",
    status: "Active",
    category: "Professional Member",
  },
  {
    id: 4,
    name: "Dr. Mariam Al Said",
    specialty: "Prosthodontics",
    experience: "8 years",
    clinic: "Modern Dentistry",
    location: "Manama",
    email: "mariam@modern.bh",
    phone: "+973 4567 8901",
    joinDate: "2019",
    status: "Active",
    category: "Professional Member",
  },
  {
    id: 5,
    name: "Dr. Omar Rashid",
    specialty: "Oral Surgery",
    experience: "14 years",
    clinic: "Gulf Dental Center",
    location: "Hamad Town",
    email: "omar@gulfdental.bh",
    phone: "+973 5678 9012",
    joinDate: "2016",
    status: "Active",
    category: "Gold Member",
  },
  {
    id: 6,
    name: "Dr. Sara Mohammed",
    specialty: "Pediatric Dentistry",
    experience: "7 years",
    clinic: "Kids Dental Care",
    location: "Isa Town",
    email: "sara@kidsdental.bh",
    phone: "+973 6789 0123",
    joinDate: "2020",
    status: "Active",
    category: "Basic Member",
  },
];

const specialties = [
  "All",
  "Orthodontics",
  "Periodontics",
  "Endodontics",
  "Prosthodontics",
  "Oral Surgery",
  "Pediatric Dentistry",
];
const locations = [
  "All",
  "Manama",
  "Muharraq",
  "Riffa",
  "Hamad Town",
  "Isa Town",
];
const categories = [
  "All",
  "Gold Member",
  "Professional Member",
  "Basic Member",
];

export default function MembersPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = members.filter((member) => {
    const matchesSpecialty =
      selectedSpecialty === "All" || member.specialty === selectedSpecialty;
    const matchesLocation =
      selectedLocation === "All" || member.location === selectedLocation;
    const matchesCategory =
      selectedCategory === "All" || member.category === selectedCategory;
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.clinic.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesSpecialty && matchesLocation && matchesCategory && matchesSearch
    );
  });

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <Users className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Our Community</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Meet Our Members
              </h1>

              <p className="text-xl opacity-90 mb-8">
                Connect with Bahrain's leading dental professionals. Find
                colleagues, mentors, and collaborators in our growing community.
              </p>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{members.length} Members</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  <span>6 Specialties</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members by name, specialty, or clinic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Filter by:</span>
                </div>

                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-200"
              >
                {/* Member Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center text-white text-xl font-bold">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {member.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Award className="w-4 h-4 text-[#03215F]" />
                          <span className="text-sm text-gray-600">
                            {member.specialty}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          member.category === "Gold Member"
                            ? "bg-[#ECCF0F] text-[#03215F]"
                            : member.category === "Professional Member"
                            ? "bg-[#9cc2ed] text-[#03215F]"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.category}
                      </div>
                    </div>
                  </div>

                  {/* Member Info */}
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span>{member.clinic}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span>{member.location}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span>Member since {member.joinDate}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span>{member.experience} experience</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600 truncate">
                          {member.email}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {member.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button className="w-full py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold flex items-center justify-center">
                    Connect
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredMembers.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Members Found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Try adjusting your filters or search term to find what you're
                looking for.
              </p>
            </div>
          )}

          {/* Stats Section */}
          <div className="mt-16 bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-2xl p-8 text-white">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-sm opacity-90">Total Members</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">15+</div>
                <div className="text-sm opacity-90">Specialties</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-sm opacity-90">Clinics</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-sm opacity-90">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Want to Join Our Community?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Connect with fellow dental professionals, share knowledge, and
                grow together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/auth/register"
                  className="px-8 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
                >
                  Become a Member
                </a>
                <a
                  href="/contact"
                  className="px-8 py-3 border-2 border-[#03215F] text-[#03215F] rounded-lg hover:bg-[#03215F]/10 transition-colors font-semibold"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
