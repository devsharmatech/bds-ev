"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Phone,
  Building,
  MapPin,
  Calendar,
  Award,
  Eye,
  EyeOff,
  CheckCircle,
  Shield,
  FileText,
  Briefcase,
  Globe,
  UserCheck,
  Check,
  PartyPopper,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/MainLayout";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import PhoneInput from "@/components/PhoneInput";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const countdownRef = useRef(null);
  const redirectingRef = useRef(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlanFromUrl, setSelectedPlanFromUrl] = useState(null);

  const [formData, setFormData] = useState({
    // Step 1: Personal & Account Information
    fullNameEng: "",
    fullNameArb: "",
    cpr: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    gender: "",
    nationality: "",

    // Step 2: Professional Information
    category: "",
    workSector: "",
    employer: "",
    position: "",
    specialty: "",
    licenseNumber: "",
    yearsOfExperience: "",
    address: "",

    // Step 3: Membership & Payment
    membershipType: "",
    subscriptionPlanId: "", // Store selected plan ID
    typeOfApplication: "",
    membershipDate: "",
    agreeTerms: false,
    receiveUpdates: true,
  });

  // Categories from Excel column J
  const categories = [
    "Dentist",
    "Dental Hygienist",
    "Dental Technologist",
    "Dental Assistant",
    "Student - Undergraduate",
    "Student - Postgraduate",
    "Others (Non Dental)",
  ];

  // Fetch subscription plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  // Set selected plan from URL parameter when plans are loaded
  useEffect(() => {
    if (plans.length > 0) {
      const planParam = searchParams?.get('plan');
      if (planParam) {
        const plan = plans.find(p => p.name === planParam);
        if (plan) {
          setSelectedPlanFromUrl(planParam);
          setFormData(prev => ({
            ...prev,
            membershipType: plan.name === 'free' ? 'free' : 'paid',
            subscriptionPlanId: plan.id
          }));
        }
      }
    }
  }, [plans, searchParams]);

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const response = await fetch("/api/dashboard/subscriptions", {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setPlansLoading(false);
    }
  };

  const formatBHD = (amount) => {
    if (!amount) return "FREE";
    return new Intl.NumberFormat("en-BH", {
      style: "currency",
      currency: "BHD",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  // Work sectors from Excel column Q
  const workSectors = [
    "Public",
    "Private",
    "Public & Private",
    "Others (Student, Resigned)",
  ];

  // Positions from Excel column S
  const positions = ["General Dentist", "Specialist", "Consultant"];

  // Nationalities - All Countries
  const nationalities = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
    "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
    "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
    "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
    "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
    "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
    "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
    "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
    "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
    "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
    "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
    "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  // Application types from Excel column O
  const applicationTypes = ["New Membership", "Renew Old Membership"];

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Handle final submit
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.membershipType || !formData.typeOfApplication) {
      setError("Please select membership type and application type");
      return;
    }

    if (!formData.agreeTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullNameEng: formData.fullNameEng,
          fullNameArb: formData.fullNameArb,
          email: formData.email,
          password: formData.password,
          mobile: formData.mobile,
          cpr: formData.cpr,
          gender: formData.gender,
          nationality: formData.nationality,

          category: formData.category,
          workSector: formData.workSector,
          employer: formData.employer,
          position: formData.position,
          specialty: formData.specialty,
          address: formData.address,

          membershipType: formData.membershipType, // "free" | "paid"
          typeOfApplication: formData.typeOfApplication,
          membershipDate:
            formData.membershipDate || new Date().toISOString().split("T")[0],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        
        // Show error toast
        toast.error("Registration Failed", {
          description: data.message || "Something went wrong. Please try again.",
          duration: 4000,
          position: "top-center",
        });
        
        setIsLoading(false);
        return;
      }

      // Store registration data for toast
      const registrationInfo = {
        fullName: formData.fullNameEng,
        email: formData.email,
        membershipType: formData.membershipType,
        memberId: data.memberId || `BDS-${Date.now().toString().slice(-6)}`,
      };

      // Show success toast with custom styling
      toast.success("Registration Successful!", {
        description: `Welcome to BDS, ${registrationInfo.fullName}!`,
        duration: 5000,
        position: "top-center",
        icon: (
          <div className="w-6 h-6 rounded-full bg-[#AE9B66] flex items-center justify-center">
            <Check className="w-4 h-4 text-[#AE9B66]" />
          </div>
        ),
        action: {
          label: "View Details",
          onClick: () => {
            // Show additional details in another toast
            toast.info("Registration Details", {
              description: `Member ID: ${registrationInfo.memberId}\nEmail: ${registrationInfo.email}\nMembership: ${registrationInfo.membershipType}`,
              duration: 6000,
            });
          },
        },
      });

      // Show additional info toast
      toast.info("What's Next?", {
        description: formData.membershipType === "paid" 
          ? "Complete payment to activate membership & discounts"
          : "Free membership activated. You can now log in.",
        duration: 5000,
        position: "top-center",
      });

      // Redirect after a delay to allow user to see the toast
      setTimeout(() => {
        if (formData.membershipType === "paid") {
          router.push("/auth/register/payment");
        } else {
          router.push("/auth/login");
        }
      }, 3000);

      // Reset loading state
      setIsLoading(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      
      // Show error toast
      toast.error("Registration Error", {
        description: "Something went wrong. Please try again.",
        duration: 4000,
        position: "top-center",
      });
      
      setIsLoading(false);
    }
  };

  // Remove the old handleFinalSubmit and use this one instead
  const handleFinalSubmitWithToast = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.membershipType || !formData.typeOfApplication) {
      setError("Please select membership type and application type");
      return;
    }

    if (!formData.agreeTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      // Show loading toast
      const loadingToastId = toast.loading("Processing your registration...", {
        duration: Infinity,
      });

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullNameEng: formData.fullNameEng,
          fullNameArb: formData.fullNameArb,
          email: formData.email,
          password: formData.password,
          mobile: formData.mobile,
          cpr: formData.cpr,
          gender: formData.gender,
          nationality: formData.nationality,

          category: formData.category,
          workSector: formData.workSector,
          employer: formData.employer,
          position: formData.position,
          specialty: formData.specialty,
          address: formData.address,

          membershipType: formData.membershipType,
          subscriptionPlanId: formData.subscriptionPlanId,
          typeOfApplication: formData.typeOfApplication,
          membershipDate:
            formData.membershipDate || new Date().toISOString().split("T")[0],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Dismiss loading toast and show error
        toast.dismiss(loadingToastId);
        
        toast.error("Registration Failed", {
          description: data.message || "Something went wrong. Please try again.",
          duration: 5000,
          position: "top-center",
          icon: "❌",
        });
        
        setError(data.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      
      // Success toast with celebration emoji
      toast.success("🎉 Registration Successful!", {
        description: `Welcome ${formData.fullNameEng} to BDS Family!`,
        duration: 5000,
        position: "top-center",
        className: "bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] border border-[#AE9B66]",
      });

      // Additional info toast
      toast.info("📋 Your Registration Details", {
        description: `Member ID: ${data.memberId || 'BDS-' + Date.now().toString().slice(-6)}\nEmail: ${formData.email}\nMembership: ${formData.membershipType}`,
        duration: 6000,
        position: "top-center",
      });

      // Check if selected plan requires payment
      const selectedPlan = plans.find(p => p.id === formData.subscriptionPlanId);
      const requiresPayment = selectedPlan && 
        ((selectedPlan.registration_fee > 0 && !selectedPlan.registration_waived) ||
         (selectedPlan.annual_fee > 0 && !selectedPlan.annual_waived));

      // Show redirect toast
      const redirectToastId = toast.loading(
        `Redirecting to ${requiresPayment ? "payment" : "login"}...`,
        { duration: 3000 }
      );

      // Wait for 3 seconds then redirect
      setTimeout(() => {
        toast.dismiss(redirectToastId);
        if (requiresPayment && data.data?.paymentRequired) {
          // Redirect to payment page with email
          router.push(`/auth/register/payment?email=${encodeURIComponent(formData.email)}`);
        } else {
          router.push("/auth/login");
        }
      }, 3000);

      setIsLoading(false);
    } catch (err) {
      toast.error("Registration Error", {
        description: "Network error. Please check your connection and try again.",
        duration: 5000,
        position: "top-center",
      });
      
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (
      !formData.fullNameEng ||
      !formData.email ||
      !formData.mobile ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields marked with *");
      return;
    }

    // CPR validation (optional, but if provided, should be valid format)
    if (formData.cpr && formData.cpr.length > 0) {
      if (formData.cpr.length !== 9 || !/^\d+$/.test(formData.cpr)) {
        setError("CPR must be 9 digits if provided");
        return;
      }
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Mobile validation (should have country code and number)
    const mobileClean = formData.mobile.replace(/\s/g, "");
    if (!mobileClean || mobileClean.length < 10) {
      setError("Please enter a valid mobile number with country code");
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (
      !formData.category ||
      !formData.workSector ||
      !formData.employer ||
      !formData.position
    ) {
      setError("Please fill in all required fields marked with *");
      return;
    }

    // If category is Dentist, require license number
    if (formData.category === "Dentist" && !formData.licenseNumber) {
      setError("Dentists must provide a license number");
      return;
    }

    setStep(3);
  };

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className="space-y-6">
      {error && (
        <div className="p-4 bg-[#b8352d] border border-[#b8352d] rounded-lg">
          <p className="text-white text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Full Name (English) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Full Name (English) *
          </label>
          <input
            type="text"
            required
            value={formData.fullNameEng}
            onChange={(e) =>
              setFormData({ ...formData, fullNameEng: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
            placeholder="Husain Abduljalil Alhawaj"
          />
        </div>

        {/* Full Name (Arabic) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Full Name (Arabic)
          </label>
          <input
            type="text"
            value={formData.fullNameArb}
            onChange={(e) =>
              setFormData({ ...formData, fullNameArb: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F] text-right"
            placeholder="حسين عبدالجليل الحواج"
            dir="rtl"
          />
        </div>

        {/* CPR */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline w-4 h-4 mr-2" />
            CPR Number
          </label>
          <input
            type="text"
            value={formData.cpr}
            onChange={(e) => setFormData({ ...formData, cpr: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
            placeholder="930910630 (Optional)"
            maxLength={9}
          />
          <p className="text-xs text-gray-500 mt-1">
            9-digit Bahraini CPR (Optional)
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline w-4 h-4 mr-2" />
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
            placeholder="dr.hussainalhawaj@gmail.com"
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            Mobile Number *
          </label>
          <PhoneInput
            value={formData.mobile}
            onChange={(value) => setFormData({ ...formData, mobile: value })}
            placeholder="36381138"
            required
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserCheck className="inline w-4 h-4 mr-2" />
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
          >
            <option value="">Select gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>

        {/* Nationality */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="inline w-4 h-4 mr-2" />
            Nationality
          </label>
          <select
            value={formData.nationality}
            onChange={(e) =>
              setFormData({ ...formData, nationality: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
          >
            <option value="">Select nationality</option>
            {nationalities.map((nationality) => (
              <option key={nationality} value={nationality}>
                {nationality}
              </option>
            ))}
          </select>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="inline w-4 h-4 mr-2" />
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F] pr-12"
              placeholder="Minimum 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="inline w-4 h-4 mr-2" />
            Confirm Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F] pr-12"
              placeholder="Confirm your password"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
        >
          Continue to Professional Information
        </button>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleStep2Submit} className="space-y-6">
      {error && (
        <div className="p-4 bg-[#b8352d] border border-[#b8352d] rounded-lg">
          <p className="text-white text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Professional Category *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
          >
            <option value="">Select your category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* License Number (for Dentists) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield className="inline w-4 h-4 mr-2" />
            License Number {formData.category === "Dentist" && "*"}
          </label>
          <input
            type="text"
            required={formData.category === "Dentist"}
            value={formData.licenseNumber}
            onChange={(e) =>
              setFormData({ ...formData, licenseNumber: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
            placeholder="BH-DENT-XXXX"
            disabled={formData.category !== "Dentist"}
          />
        </div>

        {/* Work Sector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="inline w-4 h-4 mr-2" />
            Work Sector *
          </label>
          <select
            required
            value={formData.workSector}
            onChange={(e) =>
              setFormData({ ...formData, workSector: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
          >
            <option value="">Select work sector</option>
            {workSectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>

        {/* Employer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="inline w-4 h-4 mr-2" />
            Employer / Institution *
          </label>
          <input
            type="text"
            required
            value={formData.employer}
            onChange={(e) =>
              setFormData({ ...formData, employer: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
            placeholder="HSDC, Kings dental center, etc."
          />
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Award className="inline w-4 h-4 mr-2" />
            Position *
          </label>
          <select
            required
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
          >
            <option value="">Select position</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        {/* Specialty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Award className="inline w-4 h-4 mr-2" />
            Specialty
          </label>
          <input
            type="text"
            value={formData.specialty}
            onChange={(e) =>
              setFormData({ ...formData, specialty: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
            placeholder="Orthodontics, Endodontics, etc."
          />
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            Years of Experience
          </label>
          <select
            value={formData.yearsOfExperience}
            onChange={(e) =>
              setFormData({ ...formData, yearsOfExperience: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
          >
            <option value="">Select experience</option>
            <option value="0-1">0-1 years</option>
            <option value="1-3">1-3 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-2" />
            Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
            placeholder="Your address in Bahrain"
          />
        </div>
      </div>

      <div className="flex space-x-4 pt-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
        >
          Continue to Membership Selection
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleFinalSubmitWithToast} className="space-y-6">
      {error && (
        <div className="p-4 bg-[#b8352d] border border-[#b8352d] rounded-lg">
          <p className="text-white text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Type of Application */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline w-4 h-4 mr-2" />
            Type of Application *
          </label>
          <select
            required
            value={formData.typeOfApplication}
            onChange={(e) =>
              setFormData({ ...formData, typeOfApplication: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
          >
            <option value="">Select application type</option>
            {applicationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Membership Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            Membership Date
          </label>
          <input
            type="date"
            value={formData.membershipDate}
            onChange={(e) =>
              setFormData({ ...formData, membershipDate: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty for today's date
          </p>
        </div>
      </div>

      {/* Membership Type Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Membership Type *
        </h3>

        {plansLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-[#03215F] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading subscription plans...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isSelected = formData.subscriptionPlanId === plan.id;
              const isHighlighted = selectedPlanFromUrl === plan.name;
              const totalPrice = (plan.registration_fee || 0) + (plan.annual_fee || 0);
              const isFree = plan.registration_waived && plan.annual_waived;
              
              return (
                <div key={plan.id} className="relative">
                  {isHighlighted && (
                    <div className="absolute -top-2 -right-2 px-2 py-1 bg-[#ECCF0F] text-[#03215F] rounded-full text-xs font-bold z-10">
                      Selected
                    </div>
                  )}
                  <input
                    type="radio"
                    id={plan.id}
                    name="membershipType"
                    required
                    checked={isSelected}
                    onChange={() =>
                      setFormData({ 
                        ...formData, 
                        membershipType: isFree ? 'free' : 'paid',
                        subscriptionPlanId: plan.id 
                      })
                    }
                    value={plan.id}
                    className="hidden peer"
                  />
                  <label
                    htmlFor={plan.id}
                    className={`block p-6 border-2 rounded-xl cursor-pointer transition-all h-full ${
                      isSelected || isHighlighted
                        ? "border-[#03215F] bg-[#03215F]/5 shadow-lg"
                        : "border-gray-300 hover:border-[#03215F]"
                    }`}
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {plan.display_name}
                    </h4>
                    {plan.subtitle && (
                      <div className="text-sm text-gray-600 mb-2">
                        {plan.subtitle}
                      </div>
                    )}
                    <div className="text-2xl font-bold text-[#03215F] mb-2">
                      {isFree ? "FREE" : formatBHD(totalPrice)}
                    </div>
                    {!isFree && (
                      <div className="text-xs text-gray-500 mb-3 space-y-1">
                        {!plan.registration_waived && plan.registration_fee > 0 && (
                          <div>Registration: {formatBHD(plan.registration_fee)}</div>
                        )}
                        {!plan.annual_waived && plan.annual_fee > 0 && (
                          <div>Annual: {formatBHD(plan.annual_fee)}</div>
                        )}
                      </div>
                    )}
                    {plan.description && (
                      <div className="text-sm text-gray-500 mb-3">
                        {plan.description}
                      </div>
                    )}
                    {plan.core_benefits && plan.core_benefits.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Key Benefits
                        </div>
                        <div className="space-y-1">
                          {plan.core_benefits.slice(0, 3).map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-xs text-gray-600">
                              <Check className="w-3 h-3 text-[#03215F]" />
                              <span className="line-clamp-1">{benefit}</span>
                            </div>
                          ))}
                          {plan.core_benefits.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{plan.core_benefits.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="space-y-4 pt-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="agreeTerms"
            required
            checked={formData.agreeTerms}
            onChange={(e) =>
              setFormData({ ...formData, agreeTerms: e.target.checked })
            }
            className="w-4 h-4 text-[#03215F] border-gray-300 rounded focus:ring-[#03215F] mt-1"
          />
          <label
            htmlFor="agreeTerms"
            className="ml-2 text-sm text-gray-600"
          >
            I agree to the{" "}
            <a
              href="/terms"
              className="text-[#03215F] hover:underline"
              target="_blank"
            >
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-[#03215F] hover:underline"
              target="_blank"
            >
              Privacy Policy
            </a>{" "}
            of Bahrain Dental Society *
          </label>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="receiveUpdates"
            checked={formData.receiveUpdates}
            onChange={(e) =>
              setFormData({ ...formData, receiveUpdates: e.target.checked })
            }
            className="w-4 h-4 text-[#03215F] border-gray-300 rounded focus:ring-[#03215F] mt-1"
          />
          <label
            htmlFor="receiveUpdates"
            className="ml-2 text-sm text-gray-600"
          >
            I want to receive updates about BDS events, workshops, conferences,
            and dental news
          </label>
        </div>
      </div>

      {formData.subscriptionPlanId && (() => {
        const selectedPlan = plans.find(p => p.id === formData.subscriptionPlanId);
        const requiresPayment = selectedPlan && 
          ((selectedPlan.registration_fee > 0 && !selectedPlan.registration_waived) ||
           (selectedPlan.annual_fee > 0 && !selectedPlan.annual_waived));
        
        if (requiresPayment) {
          return (
            <div className="bg-[#9cc2ed] border border-[#9cc2ed] rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-[#03215F] mb-2">
                Payment Information
              </h4>
              <p className="text-sm text-[#03215F]">
                {selectedPlan.display_name} requires payment. 
                {selectedPlan.registration_fee > 0 && !selectedPlan.registration_waived && (
                  <span> Registration fee: {formatBHD(selectedPlan.registration_fee)}. </span>
                )}
                {selectedPlan.annual_fee > 0 && !selectedPlan.annual_waived && (
                  <span> Annual fee: {formatBHD(selectedPlan.annual_fee)}. </span>
                )}
                Event discounts will be available only after payment approval.
              </p>
            </div>
          );
        }
        return null;
      })()}

      <div className="flex space-x-4 pt-4">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-3"></div>
              Processing Registration...
            </>
          ) : (
            "Complete Registration"
          )}
        </button>
      </div>
    </form>
  );

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-4xl w-full">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="relative flex items-center justify-between">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex flex-col items-center z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 border-4 border-white transition-all duration-300 ${
                      step >= stepNum
                        ? "bg-gradient-to-r from-[#03215F] to-[#03215F] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > stepNum ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span className="font-semibold">{stepNum}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors ${
                      step >= stepNum
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {stepNum === 1
                      ? "Personal Info"
                      : stepNum === 2
                      ? "Professional Info"
                      : "Membership"}
                  </span>
                </div>
              ))}
            </div>
          </div>

         
          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Image
                  src="/logo2.png"
                  alt="Bahrain Dental Society Logo"
                  width={120}
                  height={50}
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bahrain Dental Society - Member Registration
              </h1>
              <p className="text-gray-600 mt-2">
                {step === 1
                  ? "Step 1: Personal and Account Information"
                  : step === 2
                  ? "Step 2: Professional Information"
                  : "Step 3: Membership Selection and Agreement"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Fields marked with * are required
              </p>
            </div>

            {step === 1
              ? renderStep1()
              : step === 2
              ? renderStep2()
              : renderStep3()}

            {/* Login Link */}
            <div className="mt-8 text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-[#03215F] font-semibold hover:underline"
                >
                  Sign in to your account
                </Link>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Need help? Contact BDS Secretariat at
                info@bahraindentalsociety.org
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Wrap the component in Suspense to handle useSearchParams()
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-[#03215F] animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading registration form...</p>
            </div>
          </div>
        </MainLayout>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}