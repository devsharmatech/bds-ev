'use client'

import { useState } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Award, Save, Edit, Camera } from 'lucide-react'

export default function ProfileManagement() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: "Dr. Ahmed Ali Al Khalifa",
    email: "dr.ahmed@dentalclinic.bh",
    phone: "+973 1234 5678",
    specialty: "Orthodontics",
    experience: "8 years",
    clinic: "Royal Dental Clinic",
    address: "Building 45, Road 3802, Manama",
    licenseNumber: "BH-DENT-2020-0456",
    joinDate: "January 15, 2020",
    membershipId: "BDS-2024-0583"
  })

  const handleSave = () => {
    // Save logic here
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Management</h2>
          <p className="text-gray-600">Manage your professional information</p>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold flex items-center"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] flex items-center justify-center text-white text-4xl font-bold mx-auto">
                  AA
                </div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{profileData.fullName}</h3>
              <p className="text-[#03215F] font-semibold">{profileData.specialty}</p>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-[#AE9B66] text-white text-sm">
                <div className="w-2 h-2 bg-[#AE9B66] rounded-full mr-2"></div>
                Active Member
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold">{profileData.joinDate}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Membership ID</span>
                <span className="font-semibold">{profileData.membershipId}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">License Number</span>
                <span className="font-semibold">{profileData.licenseNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Professional Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialty
                  </label>
                  <select
                    value={profileData.specialty}
                    onChange={(e) => setProfileData({...profileData, specialty: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 disabled:bg-gray-100"
                  >
                    <option>General Dentistry</option>
                    <option>Orthodontics</option>
                    <option>Endodontics</option>
                    <option>Periodontics</option>
                    <option>Prosthodontics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    value={profileData.experience}
                    onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-2" />
                    Clinic/Institution
                  </label>
                  <input
                    type="text"
                    value={profileData.clinic}
                    onChange={(e) => setProfileData({...profileData, clinic: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Address
                </h4>
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  disabled={!isEditing}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 disabled:bg-gray-100"
                />
              </div>

              {/* Qualifications */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Qualifications & Certifications
                </h4>
                <div className="space-y-3">
                  {[
                    { id: 1, name: 'Board Certified Orthodontist', year: '2018' },
                    { id: 2, name: 'Digital Dentistry Certification', year: '2020' },
                    { id: 3, name: 'Advanced Implantology', year: '2022' },
                  ].map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{cert.name}</span>
                      <span className="text-sm text-gray-600">{cert.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}