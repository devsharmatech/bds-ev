"use client";

import { useState, useEffect, useRef } from "react";
import SpeakerDeclarationSection from "./SpeakerDeclarationSection";
import { 
  X, Upload, Loader2, CheckCircle, AlertCircle, 
  User, FileText, Globe, Building, Briefcase, 
  Tag, Check, ChevronDown, Phone, Mail, 
  ChevronRight, ChevronLeft, Menu, XCircle,
  ArrowLeft, ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";

// All countries list for Country of Practice dropdown
const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", 
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", 
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", 
  "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", 
  "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", 
  "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", 
  "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", 
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", 
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", 
  "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", 
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", 
  "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", 
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", 
  "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", 
  "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", 
  "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", 
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Sudan", 
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", 
  "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", 
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", 
  "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

// Phone country codes
const PHONE_CODES = [
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+962", country: "Jordan", flag: "🇯🇴" },
  { code: "+961", country: "Lebanon", flag: "🇱🇧" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+964", country: "Iraq", flag: "🇮🇶" },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
];

// Professional Titles
const PROFESSIONAL_TITLES = [
  "Dental Consultant",
  "Dental Specialist",
  "Dental Resident",
  "General Dentist",
  "Dental Student",
  "Academic Professor",
  "Clinical Director",
];

// Participant Categories
const PARTICIPANT_CATEGORIES = [
  "VIP",
  "Delegate",
  "Speaker",
  "Organizer",
  "Participant",
  "Exhibitor",
  "Sponsor",
];

// Presentation Topics (checkboxes)
const PRESENTATION_TOPICS = [
  "Restorative Dentistry",
  "Endodontics",
  "Orthodontics",
  "Prosthodontics",
  "Pediatric Dentistry",
  "Periodontology",
  "Oral Surgery",
  "Digital Dentistry",
  "Implantology",
  "Public Health Dentistry",
  "Oral Medicine",
  "Dental Materials",
  "Aesthetics",
];

// Steps for mobile navigation
const FORM_STEPS = [
  { id: 1, title: "Profile", icon: User },
  { id: 2, title: "Personal Info", icon: User },
  { id: 3, title: "Topics", icon: Tag },
  { id: 4, title: "Files", icon: FileText },
  { id: 5, title: "Declaration", icon: FileText },
];

export default function SpeakerApplicationModal({ event, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [abstractFile, setAbstractFile] = useState(null);
  const [articleFile, setArticleFile] = useState(null);
  const [showDeclaration, setShowDeclaration] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [bio, setBio] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [declarationData, setDeclarationData] = useState({
    declaration_cpd_title: "",
    declaration_speaker_name: "",
    declaration_presentation_title: "",
    declaration_presentation_date: "",
    declaration_contact_number: "",
    declaration_email: "",
    declaration_abstract: "",
    ...Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [`declaration_statement_${i}`, ""]),
    ),
    declaration_final_speaker_name: "",
    declaration_final_date: "",
    declaration_final_signature: "",
  });
  const [declarationError, setDeclarationError] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    phone_code: "+973",
    affiliation_institution: "",
    country_of_practice: "Bahrain",
    professional_title: "",
    category: "",
    presentation_topics: [],
    presentation_topic_other: "",
    consent_for_publication: "",
  });

  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);
  const formRef = useRef(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto scroll to top on step change
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, loading, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen && !loading) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, loading, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAlreadyApplied(false);
      setSubmitSuccess(false);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        phone_code: "+973",
        affiliation_institution: "",
        country_of_practice: "Bahrain",
        professional_title: "",
        category: "",
        presentation_topics: [],
        presentation_topic_other: "",
        consent_for_publication: "",
      });
      setAbstractFile(null);
      setArticleFile(null);
      setErrors({});
      setShowDeclaration(true);
      setProfileImage(null);
      setProfilePreview(null);
      setBio("");
      setCurrentStep(1);
    }
  }, [isOpen]);

  const checkExistingApplication = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setCheckingEmail(true);
    try {
      const response = await fetch(
        `/api/events/speaker-request/check?email=${encodeURIComponent(email)}&event_id=${event.id}`,
      );
      const data = await response.json();

      if (data.exists) {
        setAlreadyApplied(true);
        toast.error("You have already applied for this event");
      } else {
        setAlreadyApplied(false);
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setCheckingEmail(false);
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!profileImage) newErrors.profile_image = "Profile image is required";
      if (!bio.trim() || bio.length < 50) newErrors.bio = "Bio must be at least 50 characters";
    }
    
    if (currentStep === 2) {
      if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.phone.trim()) newErrors.phone = "Phone is required";
      if (!/^[0-9+\-\s]+$/.test(formData.phone)) newErrors.phone = "Invalid phone number";
      if (!formData.affiliation_institution.trim())
        newErrors.affiliation_institution = "Affiliation/Institution is required";
      if (!formData.country_of_practice)
        newErrors.country_of_practice = "Country of practice is required";
      if (!formData.professional_title)
        newErrors.professional_title = "Professional title is required";
      if (!formData.category) newErrors.category = "Category is required";
    }
    
    if (currentStep === 3) {
      if (formData.presentation_topics.length === 0) {
        newErrors.presentation_topics = "Please select at least one topic";
      }
      if (
        formData.presentation_topics.includes("Other") &&
        !formData.presentation_topic_other.trim()
      ) {
        newErrors.presentation_topic_other = "Please specify your topic";
      }
    }
    
    if (currentStep === 4) {
      if (!formData.consent_for_publication)
        newErrors.consent_for_publication = "Please select consent option";
    }
    
    if (currentStep === 5 && showDeclaration) {
      const requiredFields = [
        "declaration_cpd_title",
        "declaration_speaker_name",
        "declaration_presentation_title",
        "declaration_presentation_date",
        "declaration_contact_number",
        "declaration_email",
        "declaration_abstract",
        "declaration_final_speaker_name",
        "declaration_final_date",
        "declaration_final_signature",
      ];
      for (const field of requiredFields) {
        if (!declarationData[field] || !declarationData[field].trim()) {
          newErrors.declaration_form = "All declaration fields are required";
          break;
        }
      }
      for (let i = 0; i < 10; i++) {
        if (!declarationData[`declaration_statement_${i}`]) {
          newErrors.declaration_form =
            "Please answer all declaration statements";
          break;
        }
      }
    }
    
    setErrors(newErrors);
    setDeclarationError(newErrors.declaration_form || "");
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!/^[0-9+\-\s]+$/.test(formData.phone)) newErrors.phone = "Invalid phone number";
    if (!formData.affiliation_institution.trim())
      newErrors.affiliation_institution = "Affiliation/Institution is required";
    if (!formData.country_of_practice)
      newErrors.country_of_practice = "Country of practice is required";
    if (!formData.professional_title)
      newErrors.professional_title = "Professional title is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.presentation_topics.length === 0) {
      newErrors.presentation_topics = "Please select at least one topic";
    }
    if (
      formData.presentation_topics.includes("Other") &&
      !formData.presentation_topic_other.trim()
    ) {
      newErrors.presentation_topic_other = "Please specify your topic";
    }
    if (!bio.trim() || bio.length < 50) newErrors.bio = "Bio must be at least 50 characters";
    if (!profileImage) newErrors.profile_image = "Profile image is required";
    if (!formData.consent_for_publication)
      newErrors.consent_for_publication = "Please select consent option";
    if (!showDeclaration) {
      newErrors.declaration_form = "Speaker Declaration Form is required";
    } else {
      const requiredFields = [
        "declaration_cpd_title",
        "declaration_speaker_name",
        "declaration_presentation_title",
        "declaration_presentation_date",
        "declaration_contact_number",
        "declaration_email",
        "declaration_abstract",
        "declaration_final_speaker_name",
        "declaration_final_date",
        "declaration_final_signature",
      ];
      for (const field of requiredFields) {
        if (!declarationData[field] || !declarationData[field].trim()) {
          newErrors.declaration_form = "All declaration fields are required";
          break;
        }
      }
      for (let i = 0; i < 10; i++) {
        if (!declarationData[`declaration_statement_${i}`]) {
          newErrors.declaration_form =
            "Please answer all declaration statements";
          break;
        }
      }
    }
    setErrors(newErrors);
    setDeclarationError(newErrors.declaration_form || "");
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e, setter, fieldName) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setter(file);
      setErrors({ ...errors, [fieldName]: "" });
      if (fieldName === 'profile_image') {
        setProfileImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setProfilePreview(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleEmailBlur = () => {
    if (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      checkExistingApplication(formData.email);
    }
  };

  const handleTopicChange = (topic) => {
    const newTopics = formData.presentation_topics.includes(topic)
      ? formData.presentation_topics.filter((t) => t !== topic)
      : [...formData.presentation_topics, topic];

    setFormData({
      ...formData,
      presentation_topics: newTopics,
      presentation_topic_other: newTopics.includes("Other")
        ? formData.presentation_topic_other
        : "",
    });

    if (errors.presentation_topics) {
      setErrors({ ...errors, presentation_topics: "" });
    }
  };

  const handleDeclarationChange = (e) => {
    const { name, value } = e.target;
    setDeclarationData((prev) => ({ ...prev, [name]: value }));
    if (declarationError) setDeclarationError("");
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      toast.error("Please fill in all required fields for this step");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (alreadyApplied) {
      toast.error("You have already applied for this event");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("full_name", formData.full_name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", `${formData.phone_code}${formData.phone}`);
      formDataToSend.append(
        "affiliation_institution",
        formData.affiliation_institution,
      );
      formDataToSend.append(
        "country_of_practice",
        formData.country_of_practice,
      );
      formDataToSend.append("professional_title", formData.professional_title);
      formDataToSend.append("category", formData.category);
      formDataToSend.append(
        "presentation_topics",
        JSON.stringify(formData.presentation_topics),
      );
      formDataToSend.append(
        "presentation_topic_other",
        formData.presentation_topic_other,
      );
      formDataToSend.append(
        "consent_for_publication",
        formData.consent_for_publication,
      );
      formDataToSend.append("event_id", event.id);
      if (profileImage) formDataToSend.append('profile_image', profileImage);
      formDataToSend.append('bio', bio);
      if (abstractFile) formDataToSend.append("abstract_file", abstractFile);
      if (articleFile) formDataToSend.append("article_file", articleFile);
      if (showDeclaration) {
        Object.entries(declarationData).forEach(([key, value]) => {
          formDataToSend.append(key, value);
        });
      }
      const response = await fetch("/api/events/speaker-request", {
        method: "POST",
        body: formDataToSend,
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.alreadyApplied) {
          setAlreadyApplied(true);
          return;
        }
        throw new Error(data.message || "Failed to submit application");
      }
      setSubmitSuccess(true);
      toast.success("🎉 Application submitted successfully!");
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Application error:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto animate-fadeIn">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg md:rounded-2xl w-full max-w-full md:max-w-4xl 2xl:max-w-5xl my-2 md:my-8 shadow-2xl animate-slideUp"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#03215F] via-[#1a3a8f] to-[#03215F] px-4 md:px-6 py-4 md:py-5 flex items-center justify-between rounded-t-lg md:rounded-t-2xl z-10 border-b border-white/20">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-white/10 rounded-lg">
              <User className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="max-w-[180px] md:max-w-none">
              <h2 className="text-base md:text-xl lg:text-2xl font-bold text-white truncate">
                Speaker Application
              </h2>
              <p className="text-white/90 text-xs md:text-sm mt-0.5 truncate">{event.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:bg-white/20 p-1.5 md:p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Mobile Step Indicator */}
        {isMobile && !alreadyApplied && !submitSuccess && (
          <div className="sticky top-[72px] md:top-0 bg-white border-b z-10 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`p-1.5 rounded-lg ${currentStep === 1 ? 'text-gray-400' : 'text-[#03215F] hover:bg-gray-100'}`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {FORM_STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`w-8 h-1.5 rounded-full ${currentStep >= step.id ? 'bg-[#03215F]' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
              
              <button
                onClick={currentStep === 5 ? handleSubmit : handleNextStep}
                className="p-1.5 text-[#03215F] hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                {currentStep === 5 ? (
                  <span className="flex items-center gap-1">
                    Submit
                    <CheckCircle className="w-4 h-4" />
                  </span>
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs font-medium text-gray-700">
                Step {currentStep} of 5: {FORM_STEPS.find(s => s.id === currentStep)?.title}
              </span>
            </div>
          </div>
        )}

        {/* Already Applied Message */}
        {alreadyApplied ? (
          <div className="p-6 md:p-8 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 animate-pulse">
              <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Already Applied!</h3>
            <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base px-4">
              Your request has already been sent for this event. We will review
              your application and get back to you soon.
            </p>
            <button
              onClick={onClose}
              className="px-6 md:px-8 py-2.5 md:py-3 bg-gradient-to-r from-[#03215F] to-[#1a3a8f] text-white rounded-lg hover:from-[#021845] hover:to-[#03215F] transition-all duration-300 w-full max-w-xs mx-auto"
            >
              Close
            </button>
          </div>
        ) : submitSuccess ? (
          <div className="p-6 md:p-8 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 animate-bounce">
              <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Application Submitted!</h3>
            <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base px-4">
              🎉 Your application has been submitted successfully. We will review
              your application and get back to you soon.
            </p>
            <div className="animate-pulse text-sm text-gray-500">
              Redirecting in 3 seconds...
            </div>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="p-4 md:p-6 space-y-6 md:space-y-8 max-h-[60vh] md:max-h-[70vh] overflow-y-auto"
          >
            {/* Step 1: Profile Section - Always visible on desktop, conditional on mobile */}
            {(!isMobile || currentStep === 1) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg md:rounded-xl p-4 md:p-6 border border-blue-100">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-[#03215F]">Profile Information</h3>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
                  <div className="flex flex-col items-center gap-3 md:gap-4 w-full md:w-auto">
                    <div className="relative">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                        {profilePreview ? (
                          <img 
                            src={profilePreview} 
                            alt="Profile Preview" 
                            className="object-cover w-full h-full" 
                          />
                        ) : (
                          <User className="w-12 h-12 md:w-16 md:h-16 text-blue-300" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-[#03215F] text-white p-1.5 md:p-2 rounded-full cursor-pointer hover:bg-[#021845] transition-colors shadow-lg">
                        <Upload className="w-3 h-3 md:w-4 md:h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleFileChange(e, setProfileImage, 'profile_image')}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Square image, Max 5MB
                    </p>
                    {errors.profile_image && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.profile_image}</p>
                    )}
                  </div>
                  
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Professional Bio <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all duration-200 resize-none ${errors.bio ? 'border-red-500' : 'border-gray-300 hover:border-blue-300'}`}
                        placeholder="Write a detailed professional bio (minimum 50 characters)..."
                        rows={isMobile ? 4 : 5}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs ${errors.bio ? 'text-red-500' : bio.length < 50 ? 'text-amber-500' : 'text-green-500'}`}>
                          {bio.length}/50 characters
                        </span>
                        {bio.length >= 50 && (
                          <Check className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    {errors.bio && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.bio}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Personal Information - Conditional on mobile */}
            {(!isMobile || currentStep === 2) && (
              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all duration-200 ${errors.full_name ? "border-red-500" : "border-gray-300 hover:border-blue-300"}`}
                      placeholder="Enter your full name"
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.full_name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={handleEmailBlur}
                        className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all duration-200 ${errors.email ? "border-red-500" : "border-gray-300 hover:border-blue-300"}`}
                        placeholder="your.email@example.com"
                      />
                      {checkingEmail && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-blue-500" />
                        </div>
                      )}
                      {alreadyApplied && !checkingEmail && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative w-28 md:w-32">
                        <select
                          name="phone_code"
                          value={formData.phone_code}
                          onChange={handleInputChange}
                          className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent bg-white appearance-none hover:border-blue-300 transition-all duration-200 text-sm"
                        >
                          {PHONE_CODES.map((item) => (
                            <option key={item.code} value={item.code}>
                              {item.flag} {item.code}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400 pointer-events-none" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`flex-1 px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all duration-200 ${errors.phone ? "border-red-500" : "border-gray-300 hover:border-blue-300"}`}
                        placeholder="123 456 789"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>
                    )}
                  </div>

                  {/* Affiliation */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Affiliation / Institution <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="affiliation_institution"
                      value={formData.affiliation_institution}
                      onChange={handleInputChange}
                      className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all duration-200 ${errors.affiliation_institution ? "border-red-500" : "border-gray-300 hover:border-blue-300"}`}
                      placeholder="University, Hospital, or Organization"
                    />
                    {errors.affiliation_institution && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.affiliation_institution}</p>
                    )}
                  </div>

                  {/* Grid for larger screens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Country of Practice */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Country of Practice <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="country_of_practice"
                          value={formData.country_of_practice}
                          onChange={handleInputChange}
                          className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent bg-white appearance-none hover:border-blue-300 transition-all duration-200 ${errors.country_of_practice ? "border-red-500" : "border-gray-300"}`}
                        >
                          <option value="Bahrain">Bahrain</option>
                          {ALL_COUNTRIES.filter(c => c !== "Bahrain").map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.country_of_practice && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.country_of_practice}</p>
                      )}
                    </div>

                    {/* Professional Title */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Professional Title <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="professional_title"
                          value={formData.professional_title}
                          onChange={handleInputChange}
                          className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent bg-white appearance-none hover:border-blue-300 transition-all duration-200 ${errors.professional_title ? "border-red-500" : "border-gray-300"}`}
                        >
                          <option value="">Select your title</option>
                          {PROFESSIONAL_TITLES.map((title) => (
                            <option key={title} value={title}>
                              {title}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.professional_title && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.professional_title}</p>
                      )}
                    </div>

                    {/* Category */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent bg-white appearance-none hover:border-blue-300 transition-all duration-200 ${errors.category ? "border-red-500" : "border-gray-300"}`}
                        >
                          <option value="">Select category</option>
                          {PARTICIPANT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.category && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.category}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Presentation Topics - Conditional on mobile */}
            {(!isMobile || currentStep === 3) && (
              <div className="bg-gray-50 rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3 md:mb-4">
                  Presentation Topics <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs font-normal ml-2">
                    (Select all that apply)
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                  {PRESENTATION_TOPICS.map((topic) => (
                    <label
                      key={topic}
                      className={`flex items-center gap-2 md:gap-3 cursor-pointer p-2 md:p-3 rounded-lg border transition-all duration-200 ${formData.presentation_topics.includes(topic)
                          ? "bg-blue-50 border-blue-300 shadow-sm"
                          : "bg-white border-gray-300 hover:border-blue-200 hover:bg-blue-50"
                        }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.presentation_topics.includes(topic)}
                        onChange={() => handleTopicChange(topic)}
                      />
                      <div className={`w-4 h-4 md:w-5 md:h-5 rounded border flex items-center justify-center transition-all duration-200 flex-shrink-0 ${formData.presentation_topics.includes(topic)
                          ? "bg-[#03215F] border-[#03215F]"
                          : "border-gray-400"
                        }`}
                      >
                        {formData.presentation_topics.includes(topic) && (
                          <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                        )}
                      </div>
                      <span className="text-xs md:text-sm text-gray-700 truncate">{topic}</span>
                    </label>
                  ))}
                  <label className={`flex items-center gap-2 md:gap-3 cursor-pointer p-2 md:p-3 rounded-lg border transition-all duration-200 col-span-2 sm:col-span-1 ${formData.presentation_topics.includes("Other")
                      ? "bg-blue-50 border-blue-300 shadow-sm"
                      : "bg-white border-gray-300 hover:border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.presentation_topics.includes("Other")}
                      onChange={() => handleTopicChange("Other")}
                    />
                    <div className={`w-4 h-4 md:w-5 md:h-5 rounded border flex items-center justify-center transition-all duration-200 flex-shrink-0 ${formData.presentation_topics.includes("Other")
                        ? "bg-[#03215F] border-[#03215F]"
                        : "border-gray-400"
                      }`}
                    >
                      {formData.presentation_topics.includes("Other") && (
                        <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                      )}
                    </div>
                    <span className="text-xs md:text-sm text-gray-700">Other</span>
                  </label>
                </div>
                
                {formData.presentation_topics.includes("Other") && (
                  <div className="mt-3 md:mt-4">
                    <input
                      type="text"
                      name="presentation_topic_other"
                      value={formData.presentation_topic_other}
                      onChange={handleInputChange}
                      className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all duration-200 ${errors.presentation_topic_other ? "border-red-500" : "border-gray-300 hover:border-blue-300"}`}
                      placeholder="Please specify your topic"
                    />
                    {errors.presentation_topic_other && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.presentation_topic_other}</p>
                    )}
                  </div>
                )}
                
                {errors.presentation_topics && (
                  <p className="text-red-500 text-xs mt-2 md:mt-3 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.presentation_topics}</p>
                )}
              </div>
            )}

            {/* Step 4: File Uploads & Consent - Conditional on mobile */}
            {(!isMobile || currentStep === 4) && (
              <>
                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Abstract Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Abstract Submission Form <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className={`border-2 border-dashed rounded-lg md:rounded-xl p-4 md:p-6 text-center transition-all duration-300 ${abstractFile
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, setAbstractFile, "abstract_file")}
                        className="hidden"
                        id="abstract-upload"
                      />
                      <label htmlFor="abstract-upload" className="cursor-pointer">
                        {abstractFile ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                            </div>
                            <span className="text-xs md:text-sm font-medium text-green-700 truncate max-w-full">{abstractFile.name}</span>
                            <span className="text-xs text-gray-500">
                              {(abstractFile.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 md:gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Upload className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs md:text-sm font-medium text-gray-700">
                                Click to upload
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PDF, DOC, DOCX (Max 10MB)
                              </p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Article Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Article / Presentation (Optional)
                    </label>
                    <div className={`border-2 border-dashed rounded-lg md:rounded-xl p-4 md:p-6 text-center transition-all duration-300 ${articleFile
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        onChange={(e) => handleFileChange(e, setArticleFile, "article_file")}
                        className="hidden"
                        id="article-upload"
                      />
                      <label htmlFor="article-upload" className="cursor-pointer">
                        {articleFile ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                            </div>
                            <span className="text-xs md:text-sm font-medium text-green-700 truncate max-w-full">{articleFile.name}</span>
                            <span className="text-xs text-gray-500">
                              {(articleFile.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 md:gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <Upload className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-xs md:text-sm font-medium text-gray-700">
                                Optional Upload
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PDF, DOC, PPT (Max 10MB)
                              </p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Consent for Publication */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg md:rounded-xl p-4 md:p-6 border border-blue-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 md:mb-4">
                    Consent for Publication <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <label className={`flex items-start gap-3 md:gap-4 cursor-pointer p-3 md:p-4 rounded-lg md:rounded-xl border transition-all duration-200 ${formData.consent_for_publication === "agree"
                        ? "bg-white border-green-300 shadow-md"
                        : "bg-white border-gray-300 hover:border-green-200"
                      }`}
                    >
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border flex items-center justify-center mt-0.5 md:mt-1 flex-shrink-0 ${formData.consent_for_publication === "agree"
                          ? "bg-green-500 border-green-500"
                          : "border-gray-400"
                        }`}
                      >
                        {formData.consent_for_publication === "agree" && (
                          <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 block mb-1">
                          I agree
                        </span>
                        <span className="text-xs text-gray-600">
                          I agree that my abstract may be published in the conference materials
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="consent_for_publication"
                        value="agree"
                        checked={formData.consent_for_publication === "agree"}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                    </label>
                    <label className={`flex items-start gap-3 md:gap-4 cursor-pointer p-3 md:p-4 rounded-lg md:rounded-xl border transition-all duration-200 ${formData.consent_for_publication === "disagree"
                        ? "bg-white border-red-300 shadow-md"
                        : "bg-white border-gray-300 hover:border-red-200"
                      }`}
                    >
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border flex items-center justify-center mt-0.5 md:mt-1 flex-shrink-0 ${formData.consent_for_publication === "disagree"
                          ? "bg-red-500 border-red-500"
                          : "border-gray-400"
                        }`}
                      >
                        {formData.consent_for_publication === "disagree" && (
                          <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 block mb-1">
                          I do not agree
                        </span>
                        <span className="text-xs text-gray-600">
                          I do not agree to publication of my abstract
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="consent_for_publication"
                        value="disagree"
                        checked={formData.consent_for_publication === "disagree"}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {errors.consent_for_publication && (
                    <p className="text-red-500 text-xs mt-2 md:mt-3 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.consent_for_publication}</p>
                  )}
                </div>

                {/* Speaker Declaration Checkbox */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg md:rounded-xl p-3 md:p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded border flex items-center justify-center transition-all duration-200 flex-shrink-0 ${showDeclaration
                        ? "bg-[#03215F] border-[#03215F]"
                        : "border-gray-400 bg-white"
                      }`}
                    >
                      {showDeclaration && <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-700">
                        Speaker Declaration Form <span className="text-red-500">*</span>
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        This form is required for all speaker applications
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={showDeclaration}
                      onChange={(e) => setShowDeclaration(e.target.checked)}
                      className="hidden"
                      disabled
                    />
                  </label>
                  {errors.declaration_form && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.declaration_form}</p>
                  )}
                </div>
              </>
            )}

            {/* Step 5: Declaration Form - Conditional on mobile */}
            {(!isMobile || currentStep === 5) && showDeclaration && (
              <SpeakerDeclarationSection
                declarationData={declarationData}
                onChange={handleDeclarationChange}
                error={declarationError}
              />
            )}

            {/* Submit Button - Desktop Only */}
            {!isMobile && (
              <div className="pt-4 md:pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading || alreadyApplied}
                  className="w-full bg-gradient-to-r from-[#03215F] via-[#1a3a8f] to-[#03215F] text-white py-3 md:py-4 px-6 rounded-lg md:rounded-xl font-semibold hover:from-[#021845] hover:to-[#021845] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                      <span>Processing Application...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2 md:mt-3">
                  By submitting, you agree to our terms and conditions
                </p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}