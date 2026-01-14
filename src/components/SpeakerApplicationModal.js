'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// All countries list for Country of Practice dropdown
const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", 
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", 
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", 
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", 
  "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", 
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", 
  "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", 
  "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", 
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", 
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", 
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", 
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", 
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", 
  "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", 
  "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", 
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", 
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", 
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", 
  "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", 
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", 
  "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", 
  "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", 
  "Zambia", "Zimbabwe"
];

// Phone country codes
const PHONE_CODES = [
  { code: '+973', country: 'Bahrain' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+971', country: 'UAE' },
  { code: '+965', country: 'Kuwait' },
  { code: '+974', country: 'Qatar' },
  { code: '+968', country: 'Oman' },
  { code: '+962', country: 'Jordan' },
  { code: '+961', country: 'Lebanon' },
  { code: '+20', country: 'Egypt' },
  { code: '+964', country: 'Iraq' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+92', country: 'Pakistan' },
  { code: '+63', country: 'Philippines' },
  { code: '+60', country: 'Malaysia' },
  { code: '+65', country: 'Singapore' },
  { code: '+61', country: 'Australia' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
];

// Professional Titles
const PROFESSIONAL_TITLES = [
  'Dental Consultant',
  'Dental Specialist',
  'Dental Resident',
  'General Dentist',
  'Dental Student'
];

// Participant Categories
const PARTICIPANT_CATEGORIES = [
  'VIP',
  'Delegate',
  'Speaker',
  'Organizer',
  'Participant',
  'Exhibitor'
];

// Presentation Topics (checkboxes)
const PRESENTATION_TOPICS = [
  'Restorative Dentistry',
  'Endodontics',
  'Orthodontics',
  'Prosthodontics',
  'Pediatric Dentistry',
  'Periodontology',
  'Oral Surgery',
  'Digital Dentistry',
  'Implantology',
  'Public Health Dentistry',
  'Oral Medicine'
];

export default function SpeakerApplicationModal({ event, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [abstractFile, setAbstractFile] = useState(null);
  const [articleFile, setArticleFile] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    phone_code: '+973',
    affiliation_institution: '',
    country_of_practice: 'Bahrain',
    professional_title: '',
    category: '',
    presentation_topics: [],
    presentation_topic_other: '',
    consent_for_publication: '',
  });

  const [errors, setErrors] = useState({});

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAlreadyApplied(false);
      setSubmitSuccess(false);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        phone_code: '+973',
        affiliation_institution: '',
        country_of_practice: 'Bahrain',
        professional_title: '',
        category: '',
        presentation_topics: [],
        presentation_topic_other: '',
        consent_for_publication: '',
      });
      setAbstractFile(null);
      setArticleFile(null);
      setErrors({});
    }
  }, [isOpen]);

  // Check if email already applied when email changes
  const checkExistingApplication = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    
    setCheckingEmail(true);
    try {
      const response = await fetch(`/api/events/speaker-request/check?email=${encodeURIComponent(email)}&event_id=${event.id}`);
      const data = await response.json();
      
      if (data.exists) {
        setAlreadyApplied(true);
      } else {
        setAlreadyApplied(false);
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setCheckingEmail(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.affiliation_institution.trim()) newErrors.affiliation_institution = 'Affiliation/Institution is required';
    if (!formData.country_of_practice) newErrors.country_of_practice = 'Country of practice is required';
    if (!formData.professional_title) newErrors.professional_title = 'Professional title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.presentation_topics.length === 0) {
      newErrors.presentation_topics = 'Please select at least one topic';
    }
    if (formData.presentation_topics.includes('Other') && !formData.presentation_topic_other.trim()) {
      newErrors.presentation_topic_other = 'Please specify your topic';
    }
    if (!abstractFile) newErrors.abstract_file = 'Abstract submission form is required';
    if (!formData.consent_for_publication) newErrors.consent_for_publication = 'Please select consent option';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e, setter, fieldName) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setter(file);
      setErrors({ ...errors, [fieldName]: '' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleEmailBlur = () => {
    if (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      checkExistingApplication(formData.email);
    }
  };

  const handleTopicChange = (topic) => {
    const newTopics = formData.presentation_topics.includes(topic)
      ? formData.presentation_topics.filter(t => t !== topic)
      : [...formData.presentation_topics, topic];
    
    setFormData({
      ...formData,
      presentation_topics: newTopics,
      presentation_topic_other: newTopics.includes('Other') ? formData.presentation_topic_other : '',
    });

    if (errors.presentation_topics) {
      setErrors({ ...errors, presentation_topics: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (alreadyApplied) {
      toast.error('You have already applied for this event');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('full_name', formData.full_name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', `${formData.phone_code}${formData.phone}`);
      formDataToSend.append('affiliation_institution', formData.affiliation_institution);
      formDataToSend.append('country_of_practice', formData.country_of_practice);
      formDataToSend.append('professional_title', formData.professional_title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('presentation_topics', JSON.stringify(formData.presentation_topics));
      formDataToSend.append('presentation_topic_other', formData.presentation_topic_other);
      formDataToSend.append('consent_for_publication', formData.consent_for_publication);
      formDataToSend.append('event_id', event.id);

      if (abstractFile) formDataToSend.append('abstract_file', abstractFile);
      if (articleFile) formDataToSend.append('article_file', articleFile);

      const response = await fetch('/api/events/speaker-request', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.alreadyApplied) {
          setAlreadyApplied(true);
          return;
        }
        throw new Error(data.message || 'Failed to submit application');
      }

      setSubmitSuccess(true);
      toast.success('Application submitted successfully!');

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Application error:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#03215F] to-[#03215F] px-6 py-5 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Join as Speaker</h2>
            <p className="text-white/80 text-sm mt-1">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Already Applied Message */}
        {alreadyApplied ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Already Applied!</h3>
            <p className="text-gray-600">Your request has already been sent for this event. We will review your application and get back to you soon.</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-[#03215F] text-white rounded-lg hover:bg-[#021845] transition-colors"
            >
              Close
            </button>
          </div>
        ) : submitSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted!</h3>
            <p className="text-gray-600">Your application has been submitted successfully. We will review your application and get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your full name"
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleEmailBlur}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your email"
                />
                {checkingEmail && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone with Country Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  name="phone_code"
                  value={formData.phone_code}
                  onChange={handleInputChange}
                  className="w-20 px-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent bg-white text-center"
                  title="Country Code"
                >
                  {PHONE_CODES.map((item) => (
                    <option key={item.code} value={item.code} title={item.country}>
                      {item.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Affiliation / Institution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Affiliation / Institution <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="affiliation_institution"
                value={formData.affiliation_institution}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent ${errors.affiliation_institution ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your affiliation or institution"
              />
              {errors.affiliation_institution && <p className="text-red-500 text-xs mt-1">{errors.affiliation_institution}</p>}
            </div>

            {/* Country of Practice */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country of Practice <span className="text-red-500">*</span>
              </label>
              <select
                name="country_of_practice"
                value={formData.country_of_practice}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent bg-white ${errors.country_of_practice ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select country</option>
                {ALL_COUNTRIES.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {errors.country_of_practice && <p className="text-red-500 text-xs mt-1">{errors.country_of_practice}</p>}
            </div>

            {/* Professional Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professional Title / Position <span className="text-red-500">*</span>
              </label>
              <select
                name="professional_title"
                value={formData.professional_title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent bg-white ${errors.professional_title ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select professional title</option>
                {PROFESSIONAL_TITLES.map((title) => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
              {errors.professional_title && <p className="text-red-500 text-xs mt-1">{errors.professional_title}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent bg-white ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select category</option>
                {PARTICIPANT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* Presentation Topics (Checkboxes) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presentation Topic <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESENTATION_TOPICS.map((topic) => (
                  <label key={topic} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.presentation_topics.includes(topic)}
                      onChange={() => handleTopicChange(topic)}
                      className="w-4 h-4 text-[#03215F] border-gray-300 rounded focus:ring-[#03215F]"
                    />
                    <span className="text-sm text-gray-700">{topic}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.presentation_topics.includes('Other')}
                    onChange={() => handleTopicChange('Other')}
                    className="w-4 h-4 text-[#03215F] border-gray-300 rounded focus:ring-[#03215F]"
                  />
                  <span className="text-sm text-gray-700">Other</span>
                </label>
              </div>
              {formData.presentation_topics.includes('Other') && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="presentation_topic_other"
                    value={formData.presentation_topic_other}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent ${errors.presentation_topic_other ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Please specify your topic"
                  />
                  {errors.presentation_topic_other && <p className="text-red-500 text-xs mt-1">{errors.presentation_topic_other}</p>}
                </div>
              )}
              {errors.presentation_topics && <p className="text-red-500 text-xs mt-1">{errors.presentation_topics}</p>}
            </div>

            {/* Abstract Upload (Required) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload the completed Abstract Submission Form <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-lg p-4 text-center ${errors.abstract_file ? 'border-red-500' : 'border-gray-300'} hover:border-[#03215F] transition-colors`}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, setAbstractFile, 'abstract_file')}
                  className="hidden"
                  id="abstract-upload"
                />
                <label htmlFor="abstract-upload" className="cursor-pointer">
                  {abstractFile ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle size={20} />
                      <span className="text-sm">{abstractFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Upload size={24} />
                      <span className="text-sm">Click to upload (PDF, DOC, DOCX - Max 10MB)</span>
                    </div>
                  )}
                </label>
              </div>
              {errors.abstract_file && <p className="text-red-500 text-xs mt-1">{errors.abstract_file}</p>}
            </div>

            {/* Article/Presentation Upload (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Please upload your full article or presentation
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#03215F] transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => handleFileChange(e, setArticleFile, 'article_file')}
                  className="hidden"
                  id="article-upload"
                />
                <label htmlFor="article-upload" className="cursor-pointer">
                  {articleFile ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle size={20} />
                      <span className="text-sm">{articleFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Upload size={24} />
                      <span className="text-sm">Click to upload (PDF, DOC, DOCX, PPT, PPTX - Max 10MB)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Consent for Publication */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consent for Publication <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="consent_for_publication"
                    value="agree"
                    checked={formData.consent_for_publication === 'agree'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#03215F] border-gray-300 focus:ring-[#03215F] mt-0.5"
                  />
                  <span className="text-sm text-gray-700">I agree that my abstract may be published in the conference materials</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="consent_for_publication"
                    value="disagree"
                    checked={formData.consent_for_publication === 'disagree'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#03215F] border-gray-300 focus:ring-[#03215F] mt-0.5"
                  />
                  <span className="text-sm text-gray-700">I do not agree to publication</span>
                </label>
              </div>
              {errors.consent_for_publication && <p className="text-red-500 text-xs mt-1">{errors.consent_for_publication}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || alreadyApplied}
                className="w-full bg-[#03215F] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#021845] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
