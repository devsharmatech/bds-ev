"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, IdCard, CheckCircle, AlertCircle, Globe } from "lucide-react";
import { toast } from "sonner";

export default function RegistrationLiteModal({
  isOpen,
  onClose,
  onSuccess,
  onLoginClick,
}) {
  // Select options
  const COUNTRY_OPTIONS = [
    { label: "Bahrain", code: "BH", dial: "+973" },
    { label: "Saudi Arabia", code: "SA", dial: "+966" },
    { label: "United Arab Emirates", code: "AE", dial: "+971" },
    { label: "Qatar", code: "QA", dial: "+974" },
    { label: "Kuwait", code: "KW", dial: "+965" },
    { label: "Oman", code: "OM", dial: "+968" },
    { label: "India", code: "IN", dial: "+91" },
    { label: "Other", code: "OT", dial: "+" },
  ];
  const SPECIALIZATION_OPTIONS = [
    "General Dentistry",
    "Orthodontics",
    "Endodontics",
    "Periodontics",
    "Prosthodontics",
    "Oral & Maxillofacial Surgery",
    "Pediatric Dentistry",
    "Oral Medicine / Radiology",
    "Dental Hygiene",
    "Student",
    "Other",
  ];
  const CATEGORY_OPTIONS = [
    "Dentist",
    "Dental Hygienist",
    "Dental Technologist",
    "Dental Assistant",
    "Student - Undergraduate",
    "Student - Postgraduate",
    "Others (Non Dental)",
  ];
  const POSITION_OPTIONS = [
    "General Dentist", 
    "Specialist",
    "Consultant",
    "General Practitioner",
    "Resident",
    "Intern",
    "HOD / Lead",
    "Faculty / Lecturer",
    "Dental Hygienist",
    "Dental Assistant",
    "Dental Technologist",
    "Student",
    "Administrator",
    "Other",];

  const WORK_SECTOR_OPTIONS = [
    "Public",
    "Private",
    "Academic",
    "Student",
    "Other",
  ];

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryDial, setCountryDial] = useState("+973");
  const [nationalityCode, setNationalityCode] = useState("BH");
  const [cpr, setCpr] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("Bahrain");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [workSector, setWorkSector] = useState("");
  const [employer, setEmployer] = useState("");
  const [position, setPosition] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Build full country list with phone codes (client-side)
  const [countryOptions, setCountryOptions] = useState(COUNTRY_OPTIONS);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd");
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const mapped = data
          .map((c) => {
            const code = c.cca2;
            const label = c.name?.common || code;
            const root = c.idd?.root || "";
            const suffixes = c.idd?.suffixes || [];
            const dial = root ? root + (suffixes[0] || "") : "";
            return { label, code, dial };
          })
          .filter((c) => c.label)
          .sort((a, b) => a.label.localeCompare(b.label));
        if (!cancelled) setCountryOptions(mapped);
      } catch {
        // ignore; fallback list already present
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const reset = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setCpr("");
    setGender("");
    setDob("");
    setNationality("");
    setNationalityCode("");
    setAddress("");
    setCity("");
    setState("");
    setWorkSector("");
    setEmployer("");
    setPosition("");
    setSpecialty("");
    setCategory("");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Frontend validation to match API requirements
      if (!fullName.trim() || !email.trim() || !phone.trim()) {
        setError("Full name, email, and phone are required");
        toast.error("Full name, email, and phone are required");
        setLoading(false);
        return;
      }
      if (nationalityCode === "BH" && !cpr.trim()) {
        setError("CPR number is required for Bahrain nationals");
        toast.error("CPR number is required for Bahrain nationals");
        setLoading(false);
        return;
      }

      const combinedPhone =
        phone.trim().startsWith("+") || countryDial === "+"
          ? phone.trim()
          : `${countryDial} ${phone.trim()}`;

      const res = await fetch("/api/auth/register-lite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: combinedPhone,
          // Ensure cpr_id always present; use 9 zeros for non-Bahrain to satisfy numeric schemas
          cpr_id: nationalityCode === "BH" ? cpr.trim() : "000000000",
          gender: gender || null,
          dob: dob || null,
          nationality: nationality || null,
          address: address || null,
          city: city || null,
          state: state || null,
          work_sector: workSector || null,
          employer: employer || null,
          position: position || null,
          specialty: specialty || null,
          category: category || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg = data.message || "Registration failed";
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success("Account created. You are now logged in.");
      reset();
      onSuccess?.(data.user);
      onClose?.();
    } catch (err) {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Quick Signup</h2>
                <p className="text-sm text-gray-600">Create a free account to continue</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form id="quickSignupForm" onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="flex items-center gap-2 text-[#b8352d] bg-[#b8352d]/10 border border-[#b8352d]/30 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                  placeholder="Your full name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <div className="flex gap-2">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={countryDial}
                    onChange={(e) => setCountryDial(e.target.value)}
                    className="pl-9 pr-8 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none w-32 sm:w-40 md:w-44 shrink-0"
                  >
                    {countryOptions.map((c) => (
                      <option key={c.code} value={c.dial || ""}>
                        {c.label} {c.dial ? `(${c.dial})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                    placeholder="3xxxxxxx"
                  />
                </div>
              </div>
            </div>
            {nationalityCode === "BH" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPR Number
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={cpr}
                    onChange={(e) => setCpr(e.target.value)}
                    required={nationalityCode === "BH"}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                    placeholder="CPR ID"
                  />
                </div>
              </div>
            )}

            {/* Additional profile details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality
                </label>
                <select
                  value={nationalityCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setNationalityCode(code);
                    const found = countryOptions.find((c) => c.code === code);
                    setNationality(found?.label || "");
                    // If the user selects a country with a dial code, prefill phone code too
                    if (found?.dial) setCountryDial(found.dial);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                >
                  {countryOptions.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Sector
                </label>
                <select
                  value={workSector}
                  onChange={(e) => setWorkSector(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                >
                  <option value="">Select</option>
                  {WORK_SECTOR_OPTIONS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                placeholder="Full address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State / Governorate
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employer
                </label>
                <input
                  type="text"
                  value={employer}
                  onChange={(e) => setEmployer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                  placeholder="Employer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                >
                  <option value="">Select</option>
                  {POSITION_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialty
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                >
                  <option value="">Select</option>
                  {SPECIALIZATION_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
              >
                <option value="">Select</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

          </form>
          {/* Footer - Fixed inside modal */}
          <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onLoginClick}
                className="text-[#03215F] hover:underline font-medium"
              >
                Login
              </button>
            </div>
            <button
              type="submit"
              form="quickSignupForm"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Continue
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


