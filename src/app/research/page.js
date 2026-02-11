"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Download,
  ExternalLink,
  User,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  X,
  Eye,
  Clock,
  BookOpen,
  File,
  Upload,
  Plus,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Building,
  Image as ImageIcon,
  Globe,
  Briefcase,
  Tag,
  Shield,
  ChevronDown,
  ChevronUp,
  Printer,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import toast, { Toaster } from "react-hot-toast";
import { uploadFile } from "@/lib/uploadClient";

export default function ResearchPage() {
  const [loading, setLoading] = useState(true);
  const [research, setResearch] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at.desc");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitErrors, setSubmitErrors] = useState({});
  const [expandedStatement, setExpandedStatement] = useState(null);
  const modalBodyRef = useRef(null);
  const [submitForm, setSubmitForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    country_code: '+973',
    affiliation_institution: '',
    country_of_practice: 'Bahrain',
    professional_title: '',
    bio: '',
    research_title: '',
    research_category: '',
    customCategory: '',
    description: '',
    presentation_topics: [],
    presentation_topic_other: '',
    external_link: '',
    consent_for_publication: '',
    profile_image: null,
    profile_preview: '',
    abstract: null,
    abstract_name: '',
    research_document: null,
    research_document_name: '',
    featured_image: null,
    featured_preview: '',
    // Declaration fields
    declaration_cpd_title: '',
    declaration_speaker_name: '',
    declaration_presentation_title: '',
    declaration_presentation_date: '',
    declaration_contact_number: '',
    declaration_email: '',
    declaration_abstract: '',
    declaration_final_speaker_name: '',
    declaration_final_date: '',
    declaration_final_signature: '',
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`declaration_statement_${i}`, ''])),
  });
  const searchTimeoutRef = useRef(null);
  const CURRENT_YEAR = new Date().getFullYear();
  const PUBLICATION_YEARS = Array.from({ length: 11 }, (_, i) => (CURRENT_YEAR - i).toString());

  // Load research
  const loadResearch = useCallback(async (page = 1, append = false, search = null, category = null, customCat = null) => {
    if (!append) setLoading(true);
    try {
      const searchTerm = search !== null ? search : searchQuery;
      const categoryFilter = category !== null ? category : selectedCategory;
      const customCatFilter = customCat !== null ? customCat : customCategory;
      
      // Use custom category if "Other" is selected, otherwise use selected category
      const finalCategory = categoryFilter === "Other" && customCatFilter.trim() 
        ? customCatFilter.trim() 
        : (categoryFilter || "");
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString(),
        sort: sortBy,
        ...(searchTerm && { q: searchTerm }),
        ...(finalCategory && { category: finalCategory }),
        ...(publicationYear && { year: publicationYear }),
      });

      const res = await fetch(`/api/research?${params}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to load research");
      }

      if (append) {
        setResearch((prev) => [...prev, ...(data.research || [])]);
      } else {
        setResearch(data.research || []);
      }

      setPagination((prev) => ({
        ...prev,
        page: data.pagination?.page || 1,
        total: data.pagination?.total || 0,
        total_pages: data.pagination?.total_pages || 0,
      }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.per_page, sortBy, searchQuery, selectedCategory, customCategory, publicationYear]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      loadResearch(1, false, searchQuery, selectedCategory, customCategory);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, loadResearch]);

  // Debounced custom category filter effect
  useEffect(() => {
    if (selectedCategory !== "Other") return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (customCategory.trim()) {
        setPagination((prev) => ({ ...prev, page: 1 }));
        loadResearch(1, false, searchQuery, selectedCategory, customCategory.trim());
      } else if (customCategory === "") {
        // If custom category is cleared, reload without category filter
        setPagination((prev) => ({ ...prev, page: 1 }));
        loadResearch(1, false, searchQuery, "", "");
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [customCategory, selectedCategory, searchQuery, loadResearch]);

  useEffect(() => {
    loadResearch(1, false);
  }, [sortBy, selectedCategory, customCategory, publicationYear, loadResearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    loadResearch(1, false);
  };

  const handleViewDetails = (item) => {
    setSelectedResearch(item);
    setIsModalOpen(true);
  };

  const resetSubmitForm = () => {
    setSubmitForm({
      full_name: '',
      email: '',
      phone: '',
      country_code: '+973',
      affiliation_institution: '',
      country_of_practice: 'Bahrain',
      professional_title: '',
      bio: '',
      research_title: '',
      research_category: '',
      customCategory: '',
      description: '',
      presentation_topics: [],
      presentation_topic_other: '',
      external_link: '',
      consent_for_publication: '',
      profile_image: null,
      profile_preview: '',
      abstract: null,
      abstract_name: '',
      research_document: null,
      research_document_name: '',
      featured_image: null,
      featured_preview: '',
      declaration_cpd_title: '',
      declaration_speaker_name: '',
      declaration_presentation_title: '',
      declaration_presentation_date: '',
      declaration_contact_number: '',
      declaration_email: '',
      declaration_abstract: '',
      declaration_final_speaker_name: '',
      declaration_final_date: '',
      declaration_final_signature: '',
      ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`declaration_statement_${i}`, ''])),
    });
    setSubmitSuccess(false);
    setSubmitErrors({});
    setExpandedStatement(null);
  };

  const DECLARATION_STATEMENTS = [
    "The content of my research/presentation will promote quality improvement in practice, remain evidence-based, balanced, and unbiased, and will not promote the business interests of any commercial entity.",
    "I confirm that no material used in my research infringes copyright. Where copyrighted material is included, I have obtained the necessary permissions. NHRA will not be held responsible for any misrepresentation in this regard.",
    "I understand that the NHRA approval process may require review of my credentials, research, and content in advance, and I will provide all requested materials accordingly.",
    "For live events, I acknowledge that NHRA CPD Committee members may attend to ensure the presentation is educational and not promotional.",
    "When referring to products or services, I will use generic names whenever possible. If trade names are used, they will represent more than one company where available.",
    "If I have been trained or engaged by a commercial entity, I confirm that no promotional aspects will be included in my research.",
    "If my research is funded by a commercial entity, I confirm it will be presented in line with accepted scientific principles and without promoting the funding company.",
    "My research content will remain purely scientific or clinical, and any reference to drugs, products, treatments, or services will be for teaching purposes only and in generic form.",
    "In line with NHRA regulations, I will not endorse any commercial products, materials, or services in my research.",
    "An Ethical Confederation declaration will be included as part of my research."
  ];

  const PHONE_CODES = [
    { code: '+973', country: 'BH', flag: '🇧🇭' },
    { code: '+966', country: 'SA', flag: '🇸🇦' },
    { code: '+971', country: 'AE', flag: '🇦🇪' },
    { code: '+968', country: 'OM', flag: '🇴🇲' },
    { code: '+965', country: 'KW', flag: '🇰🇼' },
    { code: '+974', country: 'QA', flag: '🇶🇦' },
    { code: '+962', country: 'JO', flag: '🇯🇴' },
    { code: '+961', country: 'LB', flag: '🇱🇧' },
    { code: '+20', country: 'EG', flag: '🇪🇬' },
    { code: '+964', country: 'IQ', flag: '🇮🇶' },
    { code: '+91', country: 'IN', flag: '🇮🇳' },
    { code: '+92', country: 'PK', flag: '🇵🇰' },
    { code: '+44', country: 'GB', flag: '🇬🇧' },
    { code: '+1', country: 'US', flag: '🇺🇸' },
    { code: '+90', country: 'TR', flag: '🇹🇷' },
    { code: '+249', country: 'SD', flag: '🇸🇩' },
    { code: '+218', country: 'LY', flag: '🇱🇾' },
    { code: '+212', country: 'MA', flag: '🇲🇦' },
    { code: '+216', country: 'TN', flag: '🇹🇳' },
    { code: '+213', country: 'DZ', flag: '🇩🇿' },
  ];

  const PROFESSIONAL_TITLES = [
    'Dental Consultant',
    'Dental Specialist',
    'Dental Resident',
    'General Dentist',
    'Dental Student',
    'Academic Professor',
    'Clinical Director',
  ];

  const PRESENTATION_TOPICS = [
    'Prosthodontics',
    'Orthodontics',
    'Endodontics',
    'Periodontics',
    'Oral Surgery',
    'Pediatric Dentistry',
    'Oral Medicine & Pathology',
    'Dental Public Health',
    'Restorative Dentistry',
    'Implantology',
    'Digital Dentistry',
    'Dental Education',
    'Cosmetic Dentistry',
  ];

  const ALL_COUNTRIES = [
    "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
    "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
    "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
    "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
    "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt",
    "El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon",
    "Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
    "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Italy",
    "Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia",
    "Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia",
    "Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco",
    "Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand",
    "Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine",
    "Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia",
    "Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia",
    "Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan",
    "Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania",
    "Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
    "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam",
    "Yemen","Zambia","Zimbabwe"
  ];

  const RESEARCH_CATEGORIES = [
    'Prosthodontics',
    'Orthodontics',
    'Endodontics',
    'Periodontics',
    'Oral Surgery',
    'Pediatric Dentistry',
    'Oral Medicine & Pathology',
    'Dental Public Health',
    'Restorative Dentistry',
    'Implantology',
    'Digital Dentistry',
    'Dental Education',
    'Cosmetic Dentistry',
    'Other',
  ];

  const handleProfileImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload JPEG, PNG, or WebP image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setSubmitForm(prev => ({ ...prev, profile_image: file, profile_preview: URL.createObjectURL(file) }));
  };

  const handleFeaturedImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload JPEG, PNG, or WebP image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setSubmitForm(prev => ({ ...prev, featured_image: file, featured_preview: URL.createObjectURL(file) }));
  };

  const handleAbstractFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast.error('Please upload PDF or DOC/DOCX file');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File must be less than 50MB');
      return;
    }
    setSubmitForm(prev => ({ ...prev, abstract: file, abstract_name: file.name }));
  };

  const handleResearchDocument = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast.error('Please upload PDF or DOC/DOCX file');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File must be less than 50MB');
      return;
    }
    setSubmitForm(prev => ({ ...prev, research_document: file, research_document_name: file.name }));
  };

  const handleTopicToggle = (topic) => {
    setSubmitForm(prev => {
      const topics = prev.presentation_topics.includes(topic)
        ? prev.presentation_topics.filter(t => t !== topic)
        : [...prev.presentation_topics, topic];
      return { ...prev, presentation_topics: topics };
    });
  };

  const validateForm = () => {
    const errors = {};
    // Personal info
    if (!submitForm.full_name.trim()) errors.full_name = 'Full name is required';
    if (!submitForm.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(submitForm.email)) errors.email = 'Invalid email format';
    if (!submitForm.phone.trim()) errors.phone = 'Phone number is required';
    if (!submitForm.affiliation_institution.trim()) errors.affiliation_institution = 'Institution is required';
    if (!submitForm.professional_title) errors.professional_title = 'Professional title is required';
    // Research details
    if (!submitForm.research_title.trim()) errors.research_title = 'Research title is required';
    if (!submitForm.research_category) errors.research_category = 'Category is required';
    if (submitForm.research_category === 'Other' && !submitForm.customCategory.trim()) errors.customCategory = 'Please specify category';
    if (!submitForm.description.trim()) errors.description = 'Description is required';
    if (submitForm.presentation_topics.length === 0) errors.presentation_topics = 'Select at least one topic';
    // Files
    if (!submitForm.research_document) errors.research_document = 'Research document is required';
    // Consent
    if (!submitForm.consent_for_publication) errors.consent_for_publication = 'Please select consent option';
    // Declaration
    if (!submitForm.declaration_cpd_title.trim()) errors.declaration_cpd_title = 'CPD title is required';
    if (!submitForm.declaration_speaker_name.trim()) errors.declaration_speaker_name = 'Speaker name is required';
    if (!submitForm.declaration_presentation_title.trim()) errors.declaration_presentation_title = 'Presentation title is required';
    if (!submitForm.declaration_presentation_date) errors.declaration_presentation_date = 'Presentation date is required';
    if (!submitForm.declaration_contact_number.trim()) errors.declaration_contact_number = 'Contact number is required';
    if (!submitForm.declaration_email.trim()) errors.declaration_email = 'Declaration email is required';
    if (!submitForm.declaration_abstract.trim()) errors.declaration_abstract = 'Abstract is required';
    // Check all 10 statements answered
    const unanswered = Array.from({ length: 10 }, (_, i) => i).filter(i => !submitForm[`declaration_statement_${i}`]);
    if (unanswered.length > 0) errors.declaration_statements = `Please answer all ${unanswered.length} remaining declaration statement(s)`;
    // Final signature
    if (!submitForm.declaration_final_speaker_name.trim()) errors.declaration_final_speaker_name = 'Speaker name is required';
    if (!submitForm.declaration_final_date) errors.declaration_final_date = 'Date is required';
    if (!submitForm.declaration_final_signature.trim()) errors.declaration_final_signature = 'Digital signature is required';

    setSubmitErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitResearch = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitLoading(true);
    try {
      // Upload files directly to Supabase Storage first (avoids server timeout)
      const uploadFolder = `research-submissions/${submitForm.email.trim()}`;
      let profileImageUrl = null;
      let abstractUrl = null;
      let researchDocumentUrl = null;
      let featuredImageUrl = null;

      if (submitForm.profile_image) {
        const result = await uploadFile(submitForm.profile_image, 'research', uploadFolder);
        profileImageUrl = result.publicUrl;
      }
      if (submitForm.abstract) {
        const result = await uploadFile(submitForm.abstract, 'research', uploadFolder);
        abstractUrl = result.publicUrl;
      }
      if (submitForm.research_document) {
        const result = await uploadFile(submitForm.research_document, 'research', uploadFolder);
        researchDocumentUrl = result.publicUrl;
      }
      if (submitForm.featured_image) {
        const result = await uploadFile(submitForm.featured_image, 'research', uploadFolder);
        featuredImageUrl = result.publicUrl;
      }

      // Build JSON body with file URLs
      const finalCat = submitForm.research_category === 'Other' && submitForm.customCategory.trim()
        ? submitForm.customCategory.trim()
        : submitForm.research_category;

      const declarationData = {
        declaration_cpd_title: submitForm.declaration_cpd_title.trim(),
        declaration_speaker_name: submitForm.declaration_speaker_name.trim(),
        declaration_presentation_title: submitForm.declaration_presentation_title.trim(),
        declaration_presentation_date: submitForm.declaration_presentation_date,
        declaration_contact_number: submitForm.declaration_contact_number.trim(),
        declaration_email: submitForm.declaration_email.trim(),
        declaration_abstract: submitForm.declaration_abstract.trim(),
        declaration_final_speaker_name: submitForm.declaration_final_speaker_name.trim(),
        declaration_final_date: submitForm.declaration_final_date,
        declaration_final_signature: submitForm.declaration_final_signature.trim(),
        ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`declaration_statement_${i}`, submitForm[`declaration_statement_${i}`]])),
      };

      const jsonBody = {
        full_name: submitForm.full_name.trim(),
        email: submitForm.email.trim(),
        phone: submitForm.phone.trim(),
        country_code: submitForm.country_code,
        affiliation_institution: submitForm.affiliation_institution.trim(),
        country_of_practice: submitForm.country_of_practice,
        professional_title: submitForm.professional_title,
        bio: submitForm.bio.trim(),
        research_title: submitForm.research_title.trim(),
        research_category: finalCat,
        description: submitForm.description.trim(),
        presentation_topics: submitForm.presentation_topics,
        presentation_topic_other: submitForm.presentation_topic_other.trim(),
        external_link: submitForm.external_link.trim(),
        consent_for_publication: submitForm.consent_for_publication,
        declaration_data: declarationData,
        // Pre-uploaded file URLs
        profile_image_url: profileImageUrl,
        abstract_url: abstractUrl,
        research_document_url: researchDocumentUrl,
        featured_image_url: featuredImageUrl,
      };

      const res = await fetch('/api/research/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonBody),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message || 'Submission failed');

      setSubmitSuccess(true);
      toast.success('Research submitted successfully! It will be reviewed before publishing.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePrintDeclaration = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print the form");
      return;
    }

    const topics = [...submitForm.presentation_topics];
    if (submitForm.presentation_topic_other && topics.includes("Other")) {
      const idx = topics.indexOf("Other");
      topics[idx] = `Other: ${submitForm.presentation_topic_other}`;
    }

    const consentText = submitForm.consent_for_publication || "N/A";
    const currentDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const finalCat = submitForm.research_category === 'Other' && submitForm.customCategory.trim()
      ? submitForm.customCategory.trim()
      : submitForm.research_category;

    const declarationStatements = [];
    for (let i = 0; i < DECLARATION_STATEMENTS.length; i++) {
      const response = submitForm[`declaration_statement_${i}`];
      if (response) {
        declarationStatements.push({
          number: i + 1,
          statement: DECLARATION_STATEMENTS[i],
          response: response === "agree" ? "✓ Agree" : "✗ Disagree",
          responseColor: response === "agree" ? "#065F46" : "#991B1B",
          responseBg: response === "agree" ? "#D1FAE5" : "#FEE2E2"
        });
      }
    }

    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Research Application - ${submitForm.full_name}</title>
      <style>
        @media print {
          @page { margin: 8mm 6mm; size: A4; }
          @page :first { margin-top: 8mm; }
          body { font-family: 'Arial', sans-serif; line-height: 1.3; color: #000; font-size: 10pt; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          .page-break { page-break-before: always; }
          .no-break { page-break-inside: avoid; }
          .keep-with-next { page-break-after: avoid; }
        }
        body { font-family: 'Arial', sans-serif; line-height: 1.3; color: #000; font-size: 10pt; margin: 0; padding: 0; }
        .container { max-width: 190mm; margin: 0 auto; }
        .print-header { text-align: center; padding-bottom: 4mm; margin-bottom: 4mm; border-bottom: 2px solid #03215F; }
        .title-section h1 { color: #03215F; margin: 0 0 1mm 0; font-size: 16pt; font-weight: bold; }
        .title-section h2 { color: #444; margin: 0; font-size: 11pt; font-weight: normal; }
        .application-info { display: flex; justify-content: space-between; margin-top: 3mm; padding: 2mm; background: #F8F9FA; border-radius: 3px; font-size: 9pt; }
        .compact-section { margin-bottom: 5mm; }
        .section-title { background: #03215F; color: white; padding: 2mm 3mm; margin: 0 0 2mm 0; font-size: 11pt; font-weight: bold; border-radius: 2px; }
        .compact-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
        .compact-table th { background: #E9ECEF; border: 1px solid #DEE2E6; padding: 2mm; text-align: left; font-weight: 600; width: 30%; }
        .compact-table td { border: 1px solid #DEE2E6; padding: 2mm; width: 70%; }
        .compact-table tr:nth-child(even) { background: #F8F9FA; }
        .two-column-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
        .two-column-table td { border: 1px solid #DEE2E6; padding: 2mm; vertical-align: top; width: 50%; }
        .two-column-table .field-label { font-weight: 600; color: #03215F; margin-bottom: 0.5mm; display: block; }
        .two-column-table .field-value { color: #000; min-height: 6mm; }
        .statements-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5mm; margin-bottom: 4mm; }
        .statement-item { border: 1px solid #E2E8F0; padding: 2mm; font-size: 8.5pt; line-height: 1.4; background: #FAFBFC; }
        .statement-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1mm; padding-bottom: 1mm; border-bottom: 1px solid #E2E8F0; }
        .statement-number { background: #03215F; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 8pt; }
        .statement-response { font-weight: 600; font-size: 8.5pt; padding: 0.5mm 1mm; border-radius: 2px; }
        .text-content { background: #F8F9FA; border: 1px solid #DEE2E6; border-radius: 3px; padding: 2mm; font-size: 9.5pt; line-height: 1.4; margin-bottom: 3mm; max-height: 40mm; overflow: hidden; }
        .signature-table { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
        .signature-table td { border: 1px solid #DEE2E6; padding: 2mm; vertical-align: top; }
        .footer { margin-top: 5mm; padding-top: 2mm; border-top: 1px solid #E2E8F0; text-align: center; font-size: 8pt; color: #666; }
        @media print { .no-print { display: none !important; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="print-header no-break">
          <div class="title-section">
            <h1>RESEARCH SUBMISSION FORM</h1>
            <h2>Bahrain Dental Society</h2>
          </div>
          <div class="application-info">
            <div><strong>Submission Date:</strong> ${currentDate}</div>
            <div style="color: #03215F; font-weight: bold;">CONFIDENTIAL</div>
          </div>
        </div>

        <div class="compact-section no-break keep-with-next">
          <div class="section-title">1. PERSONAL INFORMATION</div>
          <table class="two-column-table">
            <tbody>
              <tr>
                <td><span class="field-label">Full Name</span><div class="field-value">${submitForm.full_name || ""}</div></td>
                <td><span class="field-label">Email Address</span><div class="field-value">${submitForm.email || ""}</div></td>
              </tr>
              <tr>
                <td><span class="field-label">Phone Number</span><div class="field-value">${submitForm.country_code || ''} ${submitForm.phone || ""}</div></td>
                <td><span class="field-label">Country of Practice</span><div class="field-value">${submitForm.country_of_practice || ""}</div></td>
              </tr>
              <tr>
                <td><span class="field-label">Affiliation / Institution</span><div class="field-value">${submitForm.affiliation_institution || ""}</div></td>
                <td><span class="field-label">Professional Title</span><div class="field-value">${submitForm.professional_title || ""}</div></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="compact-section no-break">
          <div class="section-title">2. RESEARCH DETAILS</div>
          <table class="compact-table">
            <tbody>
              <tr><th>Research Title</th><td>${submitForm.research_title || ""}</td></tr>
              <tr><th>Category</th><td>${finalCat || ""}</td></tr>
              <tr><th>Research Topics</th><td>${topics.length > 0 ? topics.join(", ") : "N/A"}</td></tr>
              <tr><th>Consent for Publication</th><td>${consentText}</td></tr>
            </tbody>
          </table>
          ${submitForm.description ? `
          <div style="margin-top: 2mm;">
            <div style="font-weight: 600; margin-bottom: 1mm; color: #03215F;">Description / Abstract</div>
            <div class="text-content">${submitForm.description}</div>
          </div>` : ''}
          ${submitForm.bio ? `
          <div style="margin-top: 2mm;">
            <div style="font-weight: 600; margin-bottom: 1mm; color: #03215F;">Professional Bio</div>
            <div class="text-content">${submitForm.bio}</div>
          </div>` : ''}
        </div>

        <div class="page-break">
          <div style="text-align: center; margin-bottom: 3mm; padding-bottom: 2mm; border-bottom: 1px solid #03215F;">
            <div style="display: inline-block; padding: 1mm 3mm; background: #03215F; color: white; font-weight: bold; font-size: 10pt; border-radius: 2px;">NHRA RESEARCHER DECLARATION</div>
            <div style="font-size: 9pt; color: #666; margin-top: 1mm;">Page 2 of 2</div>
          </div>

          <div class="compact-section no-break">
            <div class="section-title">3. NHRA DECLARATION DETAILS</div>
            <table class="compact-table">
              <tbody>
                <tr><th>CPD Activity Title</th><td>${submitForm.declaration_cpd_title || ""}</td></tr>
                <tr><th>Speaker / Researcher Name</th><td>${submitForm.declaration_speaker_name || ""}</td></tr>
                <tr><th>Presentation / Research Title</th><td>${submitForm.declaration_presentation_title || ""}</td></tr>
                <tr><th>Presentation / Submission Date</th><td>${submitForm.declaration_presentation_date || ""}</td></tr>
                <tr><th>Contact Number</th><td>${submitForm.declaration_contact_number || ""}</td></tr>
                <tr><th>Email Address</th><td>${submitForm.declaration_email || ""}</td></tr>
              </tbody>
            </table>
            ${submitForm.declaration_abstract ? `
            <div style="margin-top: 3mm;">
              <div style="font-weight: 600; margin-bottom: 1mm; color: #03215F;">Scientific Content / Abstract</div>
              <div class="text-content">${submitForm.declaration_abstract}</div>
            </div>` : ''}
          </div>

          ${declarationStatements.length > 0 ? `
          <div class="compact-section no-break">
            <div class="section-title">4. DECLARATION STATEMENTS</div>
            <div class="statements-grid">
              ${declarationStatements.map(item => `
                <div class="statement-item">
                  <div class="statement-header">
                    <div class="statement-number">${item.number}</div>
                    <div class="statement-response" style="color: ${item.responseColor}; background: ${item.responseBg};">${item.response}</div>
                  </div>
                  <div>${item.statement.length > 120 ? item.statement.substring(0, 120) + '...' : item.statement}</div>
                </div>
              `).join('')}
            </div>
          </div>` : ''}

          <div class="compact-section">
            <div class="section-title">5. FINAL DECLARATION & SIGNATURE</div>
            <table class="signature-table">
              <tbody>
                <tr>
                  <td width="40%"><div style="font-weight: 600; margin-bottom: 1mm;">Researcher Name</div><div style="font-size: 10.5pt; min-height: 6mm;">${submitForm.declaration_final_speaker_name || ""}</div></td>
                  <td width="30%"><div style="font-weight: 600; margin-bottom: 1mm;">Date</div><div style="font-size: 10.5pt;">${submitForm.declaration_final_date || ""}</div></td>
                  <td width="30%"><div style="font-weight: 600; margin-bottom: 1mm;">Digital Signature</div><div style="font-size: 10.5pt; font-style: italic; color: #03215F;">${submitForm.declaration_final_signature || ""}</div></td>
                </tr>
              </tbody>
            </table>
            <div style="margin-top: 4mm; font-size: 9.5pt; line-height: 1.4;">
              <p><strong>Declaration:</strong> I have carefully read and declare that I am the above-mentioned researcher, and I have filled this form to the best of my ability.</p>
            </div>
            <div style="text-align: center; margin-top: 8mm;">
              <div style="font-size: 10pt; margin-top: 1mm;">${submitForm.full_name || ""}</div>
              <div style="font-size: 9pt; color: #666; margin-top: 0.5mm;">${currentDate}</div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Bahrain Dental Society - Research Submission</strong></p>
            <p>Printed: ${currentDate}</p>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(() => { window.print(); setTimeout(() => { window.close(); }, 500); }, 300);
        };
      </script>
    </body>
    </html>`;

    printWindow.document.write(printContent);
    printWindow.document.close();
    toast.success("📄 Declaration form generated for printing");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-BH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Bahrain",
    });
  };

  const getFileTypeIcon = (url) => {
    if (!url) return <FileText className="w-5 h-5" />;
    const ext = url.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return <FileText className="w-5 h-5" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <Eye className="w-5 h-5" />;
    if (['doc', 'docx'].includes(ext)) return <BookOpen className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: {
            background: '#03215F',
            color: '#fff',
          },
        }} />

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#03215F] to-[#03215F] text-white py-10 md:py-14">
          {/* Decorative Elements */}
          <div className="absolute top-6 right-6 w-48 h-48 bg-white rounded-full opacity-5"></div>
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#AE9B66] rounded-full opacity-10"></div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/20">
                <BookOpen className="w-4 h-4 text-[#AE9B66]" />
                <span className="text-sm font-medium">Research & Publications</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                Dental Research <span className="text-[#AE9B66]">Library</span>
              </h1>
              <p className="text-base md:text-lg text-white/85 leading-relaxed max-w-2xl">
                Browse published papers and clinical studies from Bahrain Dental Society contributors.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Search, Results, and Publish Panel */}
        <div className="container mx-auto px-4 py-8 -mt-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100/80"
              >
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search research papers, studies, authors..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                    }}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#03215F]/20 focus:border-[#03215F] bg-gray-50/50 transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        loadResearch(1, false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-4 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
                
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#03215F]/20 focus:border-[#03215F] bg-gray-50/50"
                >
                  <option value="created_at.desc">Newest First</option>
                  <option value="created_at.asc">Oldest First</option>
                  <option value="title.asc">Title A-Z</option>
                  <option value="title.desc">Title Z-A</option>
                  <option value="views.desc">Most Viewed</option>
                </select>
                
                <button
                  type="submit"
                  onClick={handleSearch}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 font-medium"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-gray-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publication Year
                      </label>
                      <select
                        value={publicationYear}
                        onChange={(e) => {
                          setPublicationYear(e.target.value);
                          setPagination({ ...pagination, page: 1 });
                          loadResearch(1, false);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      >
                        <option value="">All Years</option>
                        {PUBLICATION_YEARS.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select 
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          if (e.target.value !== "Other") {
                            setCustomCategory("");
                          }
                          setPagination({ ...pagination, page: 1 });
                          const finalCat = e.target.value === "Other" && customCategory.trim() 
                            ? customCategory.trim() 
                            : e.target.value;
                          loadResearch(1, false, searchQuery, e.target.value, e.target.value === "Other" ? customCategory : "");
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      >
                        <option value="">All Categories</option>
                        <option value="Clinical Studies">Clinical Studies</option>
                        <option value="Case Reports">Case Reports</option>
                        <option value="Review Articles">Review Articles</option>
                        <option value="Research Papers">Research Papers</option>
                        <option value="Systematic Reviews">Systematic Reviews</option>
                        <option value="Meta-Analysis">Meta-Analysis</option>
                        <option value="Other">Other</option>
                      </select>
                      {selectedCategory === "Other" && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Category <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={customCategory}
                            onChange={(e) => {
                              setCustomCategory(e.target.value);
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#03215F]/20 focus:border-[#03215F]"
                            placeholder="Enter custom category name"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter the category name to filter by
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Access Type
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                        <option>All Access</option>
                        <option>Open Access</option>
                        <option>Subscription</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

              {/* Results Count */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-[#03215F] to-[#AE9B66] rounded-full"></div>
                  <div>
                    {loading ? (
                      <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
                    ) : (
                      <h2 className="text-xl font-bold text-gray-900">
                        {pagination.total} Research {pagination.total === 1 ? 'Paper' : 'Papers'}
                      </h2>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                  Page <span className="font-semibold text-gray-900">{pagination.page}</span> of <span className="font-semibold text-gray-900">{pagination.total_pages}</span>
                </div>
              </div>

          {/* Research Grid */}
          {loading ? (
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse border border-gray-200 flex flex-col md:flex-row">
                  <div className="w-full md:w-56 lg:w-64 h-48 md:h-auto bg-gradient-to-br from-gray-100 to-gray-200"></div>
                  <div className="flex-1 p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded-lg w-4/5"></div>
                    <div className="h-4 bg-gray-100 rounded-lg w-full"></div>
                    <div className="h-4 bg-gray-100 rounded-lg w-2/3"></div>
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-4">
                      <div className="w-9 h-9 rounded-full bg-gray-200"></div>
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 bg-gray-200 rounded w-28"></div>
                        <div className="h-2.5 bg-gray-100 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="h-10 bg-gray-100 rounded-lg w-32"></div>
                      <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : research.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-16 text-center max-w-2xl mx-auto border border-gray-100"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-[#03215F]/10 to-[#AE9B66]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-6">
                <FileText className="w-12 h-12 text-[#03215F]/30 -rotate-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Research Papers Found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? "We couldn't find any papers matching your search. Try adjusting your terms or filters."
                  : "New research publications and clinical studies will be added soon. Check back later!"}
              </p>
              <div className="flex items-center justify-center gap-3">
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      loadResearch(1, false);
                    }}
                    className="px-6 py-3 text-[#03215F] border-2 border-[#03215F] rounded-xl hover:bg-[#03215F] hover:text-white transition-all font-medium"
                  >
                    Clear Search
                  </button>
                )}
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Submit Research
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 mb-10"
              >
                {research.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="group relative"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#03215F] to-[#AE9B66] rounded-2xl blur opacity-0 group-hover:opacity-20 transition-all duration-500"></div>

                    <div className="relative bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 group-hover:border-[#03215F]/30 group-hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row">
                      <div className="relative w-full md:w-56 lg:w-64 h-48 md:h-auto overflow-hidden bg-gradient-to-br from-[#03215F]/5 to-[#AE9B66]/5">
                        {item.featured_image_url ? (
                          <>
                            <img
                              src={item.featured_image_url}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#03215F]/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                              <FileText className="w-7 h-7 text-[#03215F]/40" />
                            </div>
                            <span className="text-xs text-gray-400 font-medium">Research Paper</span>
                          </div>
                        )}

                        {item.category && (
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-xs font-semibold text-[#03215F] rounded-full shadow-sm">
                              {item.category}
                            </span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 bg-black/40 backdrop-blur-sm text-xs text-white rounded-full">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 p-5">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[#03215F] transition-colors leading-snug">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#03215F] to-[#AE9B66] flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {(item.researcher_name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{item.researcher_name || "Anonymous"}</p>
                            {item.institution && <p className="text-xs text-gray-500 truncate">{item.institution}</p>}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="px-4 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                          {item.research_content_url && (
                            <a
                              href={item.research_content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                            >
                              <Download className="w-4 h-4" />
                              <span>PDF</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                >
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {((pagination.page - 1) * pagination.per_page) + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-gray-900">
                      {Math.min(pagination.page * pagination.per_page, pagination.total)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">{pagination.total}</span>{" "}
                    results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newPage = pagination.page - 1;
                        setPagination({ ...pagination, page: newPage });
                        loadResearch(newPage, false);
                      }}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                        let pageNum;
                        if (pagination.total_pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.total_pages - 2) {
                          pageNum = pagination.total_pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              setPagination({ ...pagination, page: pageNum });
                              loadResearch(pageNum, false);
                            }}
                            className={`w-10 h-10 rounded-lg transition-colors ${
                              pagination.page === pageNum
                                ? "bg-[#03215F] text-white"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => {
                        const newPage = pagination.page + 1;
                        setPagination({ ...pagination, page: newPage });
                        loadResearch(newPage, false);
                      }}
                      disabled={pagination.page >= pagination.total_pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </>
              )}
            </div>

            {/* Right Publish Panel */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#03215F]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#03215F]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Publish Your Research</h3>
                    <p className="text-xs text-gray-500">Fast review. Professional visibility.</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-5">
                  Submit your research to the Bahrain Dental Society for review and publication.
                </p>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full px-5 py-3 bg-[#AE9B66] hover:bg-[#9a8a5a] text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Publish Research
                </button>

                <div className="mt-6">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Process Steps</h4>
                  <div className="space-y-3">
                    {[
                      { title: 'Submit Form', desc: 'Complete the research submission form with required files.' },
                      { title: 'Admin Review', desc: 'Our committee reviews the submission for quality and compliance.' },
                      { title: 'Publish', desc: 'Approved research is published in the public library.' },
                    ].map((step, idx) => (
                      <div key={step.title} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#03215F] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                          <p className="text-xs text-gray-500">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-[#03215F]/5 rounded-xl border border-[#03215F]/10">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Shield className="w-4 h-4 text-[#03215F]" />
                    <span>NHRA declaration required for all submissions.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Research Detail Modal */}
        <AnimatePresence>
          {isModalOpen && selectedResearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="relative bg-gradient-to-r from-[#03215F] to-[#03215F] p-6 md:p-8 text-white shrink-0 overflow-hidden">
                  {selectedResearch.featured_image_url && (
                    <img
                      src={selectedResearch.featured_image_url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-15"
                    />
                  )}
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full opacity-5 -translate-y-1/2 translate-x-1/3"></div>
                  <div className="absolute bottom-0 left-10 w-24 h-24 bg-[#AE9B66] rounded-full opacity-10 translate-y-1/2"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-10">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-white/15 backdrop-blur-sm text-xs font-medium rounded-full border border-white/20">
                            Research Paper
                          </span>
                          {selectedResearch.category && (
                            <span className="px-3 py-1 bg-[#AE9B66]/30 backdrop-blur-sm text-xs font-medium rounded-full border border-[#AE9B66]/30">
                              {selectedResearch.category}
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
                          {selectedResearch.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/80 text-sm">
                          <div className="flex items-center gap-1.5">
                            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                              {(selectedResearch.researcher_name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{selectedResearch.researcher_name || 'Anonymous'}</span>
                          </div>
                          <div className="w-px h-4 bg-white/30 hidden sm:block"></div>
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4" />
                            <span>{formatDate(selectedResearch.created_at)}</span>
                          </div>
                          {selectedResearch.institution && (
                            <>
                              <div className="w-px h-4 bg-white/30 hidden sm:block"></div>
                              <div className="flex items-center gap-1.5">
                                <Building className="w-4 h-4" />
                                <span>{selectedResearch.institution}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Modal Body */}
                <div className="overflow-y-auto flex-1 p-6 md:p-8">
                  {/* Abstract/Description */}
                  {selectedResearch.description && (
                    <div className="mb-8">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-[#03215F] rounded-full"></div>
                        Abstract
                      </h3>
                      <p className="text-gray-700 text-base leading-relaxed">{selectedResearch.description}</p>
                    </div>
                  )}
                  
                  {/* Topics */}
                  {selectedResearch.topics && (() => {
                    const topicsArr = Array.isArray(selectedResearch.topics) 
                      ? selectedResearch.topics 
                      : (typeof selectedResearch.topics === 'string' ? (() => { try { return JSON.parse(selectedResearch.topics); } catch { return []; } })() : []);
                    return topicsArr.length > 0 ? (
                      <div className="mb-8">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <div className="w-1 h-4 bg-[#AE9B66] rounded-full"></div>
                          Research Topics
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {topicsArr.map((topic, i) => (
                            <span key={i} className="px-3 py-1.5 bg-[#03215F]/8 text-[#03215F] text-sm font-medium rounded-lg border border-[#03215F]/10">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
                    {selectedResearch.research_content_url && (
                      <a
                        href={selectedResearch.research_content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 font-medium"
                      >
                        <Download className="w-5 h-5" />
                        Download Full Paper
                      </a>
                    )}
                    {selectedResearch.external_link && (
                      <a
                        href={selectedResearch.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 font-medium"
                      >
                        <ExternalLink className="w-5 h-5" />
                        External Source
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Research Modal - Single Scrollable Form */}
        <AnimatePresence>
          {showSubmitModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowSubmitModal(false); resetSubmitForm(); }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-[#03215F] to-[#AE9B66] p-6 text-white shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Submit Your Research</h2>
                      <p className="text-white/80 text-sm mt-1">
                        {submitSuccess ? 'Submission Successful' : 'Fill in all required fields and submit for review'}
                      </p>
                    </div>
                    <button
                      onClick={() => { setShowSubmitModal(false); resetSubmitForm(); }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Body - Single Scrollable */}
                <div ref={modalBodyRef} className="overflow-y-auto flex-1 p-6">
                  {submitSuccess ? (
                    <div className="text-center py-10">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Submitted Successfully!</h3>
                      <p className="text-gray-600 mb-2 max-w-md mx-auto">
                        Your research has been submitted for review. A confirmation email has been sent to your email address.
                      </p>
                      <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                        You will be notified via email once your submission is approved or if any changes are needed.
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={handlePrintDeclaration}
                          className="px-6 py-3 bg-white border-2 border-[#03215F] text-[#03215F] rounded-xl hover:bg-[#03215F]/5 transition-all font-medium flex items-center gap-2"
                        >
                          <Printer className="w-5 h-5" />
                          Print Declaration Form
                        </button>
                        <button
                          onClick={() => { setShowSubmitModal(false); resetSubmitForm(); }}
                          className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Section 1: Profile */}
                      <div className="border border-gray-200 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-[#03215F]" />
                          Profile Information
                        </h3>
                        <div className="flex flex-col items-center gap-4 mb-4">
                          <div className="relative">
                            {submitForm.profile_preview ? (
                              <div className="relative">
                                <img src={submitForm.profile_preview} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-[#03215F]/20" />
                                <button type="button" onClick={() => setSubmitForm(prev => ({ ...prev, profile_image: null, profile_preview: '' }))} className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow"><X className="w-3 h-3" /></button>
                              </div>
                            ) : (
                              <div className="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleProfileImage} className="hidden" id="submit-profile-image" />
                            <label htmlFor="submit-profile-image" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors text-sm">
                              <Upload className="w-4 h-4" /> Upload Profile Photo
                            </label>
                            <p className="text-xs text-gray-500 mt-1">Optional • JPEG, PNG, WebP • Max 5MB</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About You</label>
                          <textarea value={submitForm.bio} onChange={(e) => setSubmitForm(prev => ({ ...prev, bio: e.target.value }))} rows={3} maxLength={500} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all resize-none" placeholder="Tell us about your professional background..." />
                          <p className="text-xs text-gray-500 mt-1 text-right">{submitForm.bio.length}/500</p>
                        </div>
                      </div>

                      {/* Section 2: Personal Information */}
                      <div className="border border-gray-200 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-[#03215F]" />
                          Personal Information
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                              <input type="text" value={submitForm.full_name} onChange={(e) => setSubmitForm(prev => ({ ...prev, full_name: e.target.value }))} className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all ${submitErrors.full_name ? 'border-red-500' : 'border-gray-300'}`} placeholder="Dr. John Doe" />
                              {submitErrors.full_name && <p className="text-xs text-red-500 mt-1">{submitErrors.full_name}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="email" value={submitForm.email} onChange={(e) => setSubmitForm(prev => ({ ...prev, email: e.target.value }))} className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all ${submitErrors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="researcher@example.com" />
                              </div>
                              {submitErrors.email && <p className="text-xs text-red-500 mt-1">{submitErrors.email}</p>}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                              <select value={submitForm.country_code} onChange={(e) => setSubmitForm(prev => ({ ...prev, country_code: e.target.value }))} className="w-32 px-2 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all text-sm">
                                {PHONE_CODES.map(pc => (<option key={pc.code} value={pc.code}>{pc.flag} {pc.code}</option>))}
                              </select>
                              <div className="relative flex-1">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="tel" value={submitForm.phone} onChange={(e) => setSubmitForm(prev => ({ ...prev, phone: e.target.value }))} className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all ${submitErrors.phone ? 'border-red-500' : 'border-gray-300'}`} placeholder="XXXX XXXX" />
                              </div>
                            </div>
                            {submitErrors.phone && <p className="text-xs text-red-500 mt-1">{submitErrors.phone}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Institution / Affiliation <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input type="text" value={submitForm.affiliation_institution} onChange={(e) => setSubmitForm(prev => ({ ...prev, affiliation_institution: e.target.value }))} className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all ${submitErrors.affiliation_institution ? 'border-red-500' : 'border-gray-300'}`} placeholder="University / Hospital" />
                            </div>
                            {submitErrors.affiliation_institution && <p className="text-xs text-red-500 mt-1">{submitErrors.affiliation_institution}</p>}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Country of Practice</label>
                              <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select value={submitForm.country_of_practice} onChange={(e) => setSubmitForm(prev => ({ ...prev, country_of_practice: e.target.value }))} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all appearance-none">
                                  {ALL_COUNTRIES.map(c => (<option key={c} value={c}>{c}</option>))}
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title <span className="text-red-500">*</span></label>
                              <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select value={submitForm.professional_title} onChange={(e) => setSubmitForm(prev => ({ ...prev, professional_title: e.target.value }))} className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all appearance-none ${submitErrors.professional_title ? 'border-red-500' : 'border-gray-300'}`}>
                                  <option value="">Select Title</option>
                                  {PROFESSIONAL_TITLES.map(t => (<option key={t} value={t}>{t}</option>))}
                                </select>
                              </div>
                              {submitErrors.professional_title && <p className="text-xs text-red-500 mt-1">{submitErrors.professional_title}</p>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Research Details */}
                      <div className="border border-gray-200 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-[#03215F]" />
                          Research Details
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Research Title <span className="text-red-500">*</span></label>
                            <input type="text" value={submitForm.research_title} onChange={(e) => setSubmitForm(prev => ({ ...prev, research_title: e.target.value }))} className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all ${submitErrors.research_title ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter your research title" />
                            {submitErrors.research_title && <p className="text-xs text-red-500 mt-1">{submitErrors.research_title}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <select value={submitForm.research_category} onChange={(e) => setSubmitForm(prev => ({ ...prev, research_category: e.target.value, customCategory: e.target.value !== 'Other' ? '' : prev.customCategory }))} className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all appearance-none ${submitErrors.research_category ? 'border-red-500' : 'border-gray-300'}`}>
                                <option value="">Select Category</option>
                                {RESEARCH_CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                              </select>
                            </div>
                            {submitErrors.research_category && <p className="text-xs text-red-500 mt-1">{submitErrors.research_category}</p>}
                            {submitForm.research_category === 'Other' && (
                              <input type="text" value={submitForm.customCategory} onChange={(e) => setSubmitForm(prev => ({ ...prev, customCategory: e.target.value }))} className={`w-full mt-3 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all ${submitErrors.customCategory ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter custom category" />
                            )}
                            {submitErrors.customCategory && <p className="text-xs text-red-500 mt-1">{submitErrors.customCategory}</p>}
                          </div>
                          {/* Research Topics */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Research Topics <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {PRESENTATION_TOPICS.map(topic => (
                                <label key={topic} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${submitForm.presentation_topics.includes(topic) ? 'bg-[#03215F]/10 border-[#03215F] text-[#03215F]' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'}`}>
                                  <input type="checkbox" checked={submitForm.presentation_topics.includes(topic)} onChange={() => handleTopicToggle(topic)} className="sr-only" />
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${submitForm.presentation_topics.includes(topic) ? 'bg-[#03215F] border-[#03215F]' : 'border-gray-300'}`}>
                                    {submitForm.presentation_topics.includes(topic) && <CheckCircle className="w-3 h-3 text-white" />}
                                  </div>
                                  <span className="truncate">{topic}</span>
                                </label>
                              ))}
                              <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${submitForm.presentation_topics.includes('Other') ? 'bg-[#03215F]/10 border-[#03215F] text-[#03215F]' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'}`}>
                                <input type="checkbox" checked={submitForm.presentation_topics.includes('Other')} onChange={() => handleTopicToggle('Other')} className="sr-only" />
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${submitForm.presentation_topics.includes('Other') ? 'bg-[#03215F] border-[#03215F]' : 'border-gray-300'}`}>
                                  {submitForm.presentation_topics.includes('Other') && <CheckCircle className="w-3 h-3 text-white" />}
                                </div>
                                <span>Other</span>
                              </label>
                            </div>
                            {submitErrors.presentation_topics && <p className="text-xs text-red-500 mt-1">{submitErrors.presentation_topics}</p>}
                            {submitForm.presentation_topics.includes('Other') && (
                              <input type="text" value={submitForm.presentation_topic_other} onChange={(e) => setSubmitForm(prev => ({ ...prev, presentation_topic_other: e.target.value }))} className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all" placeholder="Specify other topic" />
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Abstract <span className="text-red-500">*</span></label>
                            <textarea value={submitForm.description} onChange={(e) => setSubmitForm(prev => ({ ...prev, description: e.target.value }))} rows={4} className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all resize-none ${submitErrors.description ? 'border-red-500' : 'border-gray-300'}`} placeholder="Provide a brief description or abstract of your research..." />
                            {submitErrors.description && <p className="text-xs text-red-500 mt-1">{submitErrors.description}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">External Link (Optional)</label>
                            <input type="url" value={submitForm.external_link} onChange={(e) => setSubmitForm(prev => ({ ...prev, external_link: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all" placeholder="https://doi.org/..." />
                          </div>
                        </div>
                      </div>

                      {/* Section 4: File Uploads */}
                      <div className="border border-gray-200 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Upload className="w-5 h-5 text-[#03215F]" />
                          File Uploads
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Research Document */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Research Document <span className="text-red-500">*</span></label>
                            <div className={`border-2 border-dashed rounded-xl p-4 text-center hover:border-[#03215F] transition-colors ${submitErrors.research_document ? 'border-red-500' : 'border-gray-300'}`}>
                              {submitForm.research_document_name ? (
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                  <div className="flex items-center gap-2 min-w-0"><File className="w-5 h-5 text-[#03215F] shrink-0" /><span className="text-sm font-medium truncate">{submitForm.research_document_name}</span></div>
                                  <button type="button" onClick={() => setSubmitForm(prev => ({ ...prev, research_document: null, research_document_name: '' }))} className="p-1 text-red-500 hover:bg-red-50 rounded shrink-0"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <div className="py-2"><File className="w-8 h-8 text-gray-400 mx-auto mb-1" /><p className="text-sm text-gray-600">PDF, DOC, DOCX</p><p className="text-xs text-gray-500">Max 50MB</p></div>
                              )}
                              <input type="file" accept=".pdf,.doc,.docx" onChange={handleResearchDocument} className="hidden" id="submit-research-doc" />
                              <label htmlFor="submit-research-doc" className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#03215F] text-white rounded-lg hover:bg-[#03215F]/90 cursor-pointer transition-colors text-sm"><Upload className="w-4 h-4" /> Choose File</label>
                            </div>
                            {submitErrors.research_document && <p className="text-xs text-red-500 mt-1">{submitErrors.research_document}</p>}
                          </div>
                          {/* Abstract File */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Abstract Document (Optional)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-[#03215F] transition-colors">
                              {submitForm.abstract_name ? (
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                  <div className="flex items-center gap-2 min-w-0"><File className="w-5 h-5 text-[#03215F] shrink-0" /><span className="text-sm font-medium truncate">{submitForm.abstract_name}</span></div>
                                  <button type="button" onClick={() => setSubmitForm(prev => ({ ...prev, abstract: null, abstract_name: '' }))} className="p-1 text-red-500 hover:bg-red-50 rounded shrink-0"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <div className="py-2"><File className="w-8 h-8 text-gray-400 mx-auto mb-1" /><p className="text-sm text-gray-600">PDF, DOC, DOCX</p><p className="text-xs text-gray-500">Max 50MB</p></div>
                              )}
                              <input type="file" accept=".pdf,.doc,.docx" onChange={handleAbstractFile} className="hidden" id="submit-abstract" />
                              <label htmlFor="submit-abstract" className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors text-sm"><Upload className="w-4 h-4" /> Choose File</label>
                            </div>
                          </div>
                        </div>
                        {/* Featured Image */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image (Optional)</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-[#03215F] transition-colors">
                            {submitForm.featured_preview ? (
                              <div className="relative">
                                <img src={submitForm.featured_preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                                <button type="button" onClick={() => setSubmitForm(prev => ({ ...prev, featured_image: null, featured_preview: '' }))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button>
                              </div>
                            ) : (
                              <div className="py-2"><ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" /><p className="text-sm text-gray-600">JPEG, PNG, WebP • Max 5MB</p></div>
                            )}
                            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFeaturedImage} className="hidden" id="submit-featured-image" />
                            <label htmlFor="submit-featured-image" className="mt-2 inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors text-sm">Choose Image</label>
                          </div>
                        </div>
                      </div>

                      {/* Section 5: Consent */}
                      <div className="border border-gray-200 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-[#03215F]" />
                          Consent for Publication <span className="text-red-500">*</span>
                        </h3>
                        <div className="space-y-2">
                          {['Yes, I consent to publication', 'No, do not publish', 'Under review - decide later'].map(option => (
                            <label key={option} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${submitForm.consent_for_publication === option ? 'bg-[#03215F]/10 border-[#03215F]' : 'bg-white border-gray-200 hover:border-gray-400'}`}>
                              <input type="radio" name="consent_for_publication" value={option} checked={submitForm.consent_for_publication === option} onChange={(e) => setSubmitForm(prev => ({ ...prev, consent_for_publication: e.target.value }))} className="sr-only" />
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${submitForm.consent_for_publication === option ? 'border-[#03215F]' : 'border-gray-300'}`}>
                                {submitForm.consent_for_publication === option && <div className="w-2 h-2 rounded-full bg-[#03215F]" />}
                              </div>
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                        {submitErrors.consent_for_publication && <p className="text-xs text-red-500 mt-1">{submitErrors.consent_for_publication}</p>}
                      </div>

                      {/* Section 6: NHRA Declaration Form */}
                      <div className="border-2 border-[#03215F]/20 rounded-xl overflow-hidden">
                        <div className="bg-[#03215F] p-4 text-white">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            NHRA Speaker / Researcher Declaration Form
                          </h3>
                          <p className="text-white/70 text-sm mt-1">All fields in this section are required</p>
                        </div>
                        <div className="p-5 space-y-5 bg-gray-50/50">
                          {/* Declaration Info Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">CPD Activity Title <span className="text-red-500">*</span></label>
                              <input type="text" value={submitForm.declaration_cpd_title} onChange={(e) => setSubmitForm(prev => ({ ...prev, declaration_cpd_title: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all text-sm ${submitErrors.declaration_cpd_title ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter CPD activity title" />
                              {submitErrors.declaration_cpd_title && <p className="text-xs text-red-500 mt-1">{submitErrors.declaration_cpd_title}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Speaker / Researcher Name <span className="text-red-500">*</span></label>
                              <input type="text" value={submitForm.declaration_speaker_name} onChange={(e) => setSubmitForm(prev => ({ ...prev, declaration_speaker_name: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all text-sm ${submitErrors.declaration_speaker_name ? 'border-red-500' : 'border-gray-300'}`} placeholder="Your full name" />
                              {submitErrors.declaration_speaker_name && <p className="text-xs text-red-500 mt-1">{submitErrors.declaration_speaker_name}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Presentation / Research Title <span className="text-red-500">*</span></label>
                              <input type="text" value={submitForm.declaration_presentation_title} onChange={(e) => setSubmitForm(prev => ({ ...prev, declaration_presentation_title: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all text-sm ${submitErrors.declaration_presentation_title ? 'border-red-500' : 'border-gray-300'}`} placeholder="Title of your presentation" />
                              {submitErrors.declaration_presentation_title && <p className="text-xs text-red-500 mt-1">{submitErrors.declaration_presentation_title}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Presentation / Submission Date <span className="text-red-500">*</span></label>
                              <input type="date" value={submitForm.declaration_presentation_date} onChange={(e) => setSubmitForm(prev => ({ ...prev, declaration_presentation_date: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all text-sm ${submitErrors.declaration_presentation_date ? 'border-red-500' : 'border-gray-300'}`} />
                              {submitErrors.declaration_presentation_date && <p className="text-xs text-red-500 mt-1">{submitErrors.declaration_presentation_date}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
                              <input type="tel" value={submitForm.declaration_contact_number} onChange={(e) => setSubmitForm(prev => ({ ...prev, declaration_contact_number: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all text-sm ${submitErrors.declaration_contact_number ? 'border-red-500' : 'border-gray-300'}`} placeholder="Contact number" />
                              {submitErrors.declaration_contact_number && <p className="text-xs text-red-500 mt-1">{submitErrors.declaration_contact_number}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                              <input type="email" value={submitForm.declaration_email} onChange={(e) => setSubmitForm(prev => ({ ...prev, declaration_email: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all text-sm ${submitErrors.declaration_email ? 'border-red-500' : 'border-gray-300'}`} placeholder="your@email.com" />
                              {submitErrors.declaration_email && <p className="text-xs text-red-500 mt-1">{submitErrors.declaration_email}</p>}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Abstract / Summary <span className="text-red-500">*</span></label>
                            <textarea value={submitForm.declaration_abstract} onChange={(e) => setSubmitForm(prev => ({ ...prev, declaration_abstract: e.target.value }))} rows={3} className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all text-sm resize-none ${submitErrors.declaration_abstract ? 'border-red-500' : 'border-gray-300'}`} placeholder="Brief abstract or summary of your research..." />
                            {submitErrors.declaration_abstract && <p className="text-xs text-red-500 mt-1">{submitErrors.declaration_abstract}</p>}
                          </div>

                          {/* Declaration Statements */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Declaration Statements</h4>
                            <p className="text-xs text-gray-500 mb-4">Please confirm your agreement with each statement by selecting "I Agree" or "I Disagree".</p>
                            {submitErrors.declaration_statements && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {submitErrors.declaration_statements}</p>
                              </div>
                            )}
                            <div className="space-y-3">
                              {DECLARATION_STATEMENTS.map((statement, index) => (
                                <div key={index} className={`border rounded-xl overflow-hidden transition-all ${submitForm[`declaration_statement_${index}`] === 'agree' ? 'border-green-300 bg-green-50/50' : submitForm[`declaration_statement_${index}`] === 'disagree' ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}`}>
                                  <button type="button" onClick={() => setExpandedStatement(expandedStatement === index ? null : index)} className="w-full flex items-start gap-3 p-3 text-left hover:bg-gray-50/50 transition-colors">
                                    <span className="w-6 h-6 rounded-full bg-[#03215F] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{index + 1}</span>
                                    <span className={`text-sm flex-1 ${expandedStatement === index ? '' : 'line-clamp-2'}`}>{statement}</span>
                                    {expandedStatement === index ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                                  </button>
                                  <div className="flex items-center gap-3 px-3 pb-3 pl-12">
                                    <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-medium transition-all ${submitForm[`declaration_statement_${index}`] === 'agree' ? 'bg-green-100 border-green-400 text-green-800' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                                      <input type="radio" name={`declaration_${index}`} value="agree" checked={submitForm[`declaration_statement_${index}`] === 'agree'} onChange={() => setSubmitForm(prev => ({ ...prev, [`declaration_statement_${index}`]: 'agree' }))} className="sr-only" />
                                      <CheckCircle className="w-3.5 h-3.5" /> I Agree
                                    </label>
                                    <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-medium transition-all ${submitForm[`declaration_statement_${index}`] === 'disagree' ? 'bg-red-100 border-red-400 text-red-800' : 'border-gray-200 text-gray-600 hover:border-red-300'}`}>
                                      <input type="radio" name={`declaration_${index}`} value="disagree" checked={submitForm[`declaration_statement_${index}`] === 'disagree'} onChange={() => setSubmitForm(prev => ({ ...prev, [`declaration_statement_${index}`]: 'disagree' }))} className="sr-only" />
                                      <X className="w-3.5 h-3.5" /> I Disagree
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Final Signature */}
                          <div className="border-t pt-5 mt-5">
                            <h4 className="text-sm font-bold text-gray-900 mb-3">Digital Signature</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                <input type="text" value={submitForm.declaration_final_speaker_name} onChange={(e) => setSubmitForm(prev => ({ ...prev, declaration_final_speaker_name: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all text-sm ${submitErrors.declaration_final_speaker_name ? 'border-red-500' : 'border-gray-300'}`} placeholder="Your full name" />
                                {submitErrors.declaration_final_speaker_name && <p className="text-xs text-red-500 mt-1">{submitErrors.declaration_final_speaker_name}</p>}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                                <input type="date" value={submitForm.declaration_final_date} onChange={(e) => setSubmitForm(prev => ({ ...prev, declaration_final_date: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all text-sm ${submitErrors.declaration_final_date ? 'border-red-500' : 'border-gray-300'}`} />
                                {submitErrors.declaration_final_date && <p className="text-xs text-red-500 mt-1">{submitErrors.declaration_final_date}</p>}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Digital Signature <span className="text-red-500">*</span></label>
                                <input type="text" value={submitForm.declaration_final_signature} onChange={(e) => setSubmitForm(prev => ({ ...prev, declaration_final_signature: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#03215F]/30 focus:border-[#03215F] transition-all text-sm italic ${submitErrors.declaration_final_signature ? 'border-red-500' : 'border-gray-300'}`} placeholder="Type your full name as signature" />
                                {submitErrors.declaration_final_signature && <p className="text-xs text-red-500 mt-1">{submitErrors.declaration_final_signature}</p>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Info Notice */}
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-blue-700">
                          Your research will be reviewed by our admin team before being published. You will receive a confirmation email after submission, and will be notified via email when your submission is approved or rejected.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                {!submitSuccess && (
                  <div className="border-t p-4 flex justify-between items-center shrink-0 bg-white">
                    <button
                      type="button"
                      onClick={() => { setShowSubmitModal(false); resetSubmitForm(); }}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitResearch}
                      disabled={submitLoading}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                    >
                      {submitLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                      ) : (
                        <><CheckCircle className="w-5 h-5" /> Submit Research</>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}