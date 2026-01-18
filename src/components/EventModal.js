"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  X,
  Upload,
  Image as ImageIcon,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Globe,
  Building,
  Tag,
  Loader2,
  AlertCircle,
  User,
  Mic,
  ListChecks,
  Trash2,
  Plus,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

// Bahrain flag SVG
const BahrainFlag = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 640 480"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="640" height="480" fill="#b8352d" />
    <path
      d="
      M0 0
      L200 0
      L160 48
      L200 96
      L160 144
      L200 192
      L160 240
      L200 288
      L160 336
      L200 384
      L160 432
      L200 480
      L0 480
      Z
    "
      fill="#ffffff"
    />
  </svg>
);

const EVENT_STATUSES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const TIMEZONES = [
  { value: "Asia/Bahrain", label: "Bahrain Time (AST)" },
  { value: "Asia/Qatar", label: "Qatar Time" },
  { value: "Asia/Dubai", label: "UAE Time" },
  { value: "Asia/Riyadh", label: "Saudi Arabia Time" },
  { value: "UTC", label: "UTC" },
];

// Helper function to format datetime for input preserving Bahrain timezone
const formatDateTimeForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const options = {
    timeZone: 'Asia/Bahrain',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  const hour = parts.find(p => p.type === 'hour')?.value || '';
  const minute = parts.find(p => p.type === 'minute')?.value || '';
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

// Helper function to generate agenda slots
const generateAgendaSlots = (startDate, endDate) => {
  if (!startDate || !endDate) return [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  // If same day, generate 1 slot for that day
  if (start.toDateString() === end.toDateString()) {
    return [
      {
        agenda_date: start.toISOString().split("T")[0],
        title: "Main Event",
        description: "",
        start_time: start.toTimeString().slice(0, 5),
        end_time: end.toTimeString().slice(0, 5),
      },
    ];
  }

  // If multiple days, generate slots for each day
  const slots = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayName = currentDate.toLocaleDateString("en-US", {
      weekday: "short",
    });
    const dayNum = currentDate.getDate();
    const monthName = currentDate.toLocaleDateString("en-US", {
      month: "short",
    });

    slots.push({
      agenda_date: dateStr,
      title: `Day ${slots.length + 1}: ${dayName}, ${monthName} ${dayNum}`,
      description: "",
      start_time:
        slots.length === 0 ? start.toTimeString().slice(0, 5) : "09:00",
      end_time:
        currentDate.toDateString() === end.toDateString()
          ? end.toTimeString().slice(0, 5)
          : "17:00",
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
};

// Get date range display
const getDateRangeDisplay = (startDate, endDate) => {
  if (!startDate || !endDate) return "";

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const startFormatted = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const endFormatted = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFormatted} - ${endFormatted}`;
};

// Memoized Input Component
const MemoizedInput = ({
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  className = "",
  ...props
}) => {
  return (
    <div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 bg-gray-50 border ${
          error ? "border-[#b8352d]" : "border-gray-200"
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all ${className}`}
        placeholder={placeholder}
        {...props}
        aria-invalid={!!error}
      />
      {error && (
        <p className="mt-2">
          <span className="inline-flex items-center gap-1.5 text-[#b8352d] text-sm bg-[#b8352d]/10 rounded-md px-2 py-1">
            <AlertCircle className="w-4 h-4 text-[#b8352d]" />
            {error}
          </span>
        </p>
      )}
    </div>
  );
};

// Memoized Textarea Component
const MemoizedTextarea = ({
  name,
  value,
  onChange,
  error,
  placeholder,
  rows = 4,
  className = "",
  ...props
}) => {
  return (
    <div>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`w-full px-4 py-3 bg-gray-50 border ${
          error ? "border-[#b8352d]" : "border-gray-200"
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all resize-none ${className}`}
        placeholder={placeholder}
        {...props}
        aria-invalid={!!error}
      />
      {error && (
        <p className="mt-2">
          <span className="inline-flex items-center gap-1.5 text-[#b8352d] text-sm bg-[#b8352d]/10 rounded-md px-2 py-1">
            <AlertCircle className="w-4 h-4 text-[#b8352d]" />
            {error}
          </span>
        </p>
      )}
    </div>
  );
};

export default function EventModal({
  mode,
  event,
  onClose,
  onSuccess,
  bahrainCities,
  bahrainGovernorates,
}) {
  const [userInfo, setUserInfo] = useState(null);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_datetime: "",
    end_datetime: "",
    timezone: "Asia/Bahrain",
    venue_name: "",
    address: "",
    city: "",
    province: "",
    pin_code: "",
    google_map_url: "",
    capacity: "",
    is_paid: false,
    regular_price: "",
    member_price: "",
    student_price: "",
    hygienist_price: "",
    regular_standard_price: "",
    member_standard_price: "",
    student_standard_price: "",
    hygienist_standard_price: "",
    regular_onsite_price: "",
    member_onsite_price: "",
    student_onsite_price: "",
    hygienist_onsite_price: "",
    early_bird_deadline: "",
    status: "upcoming",
    created_by: "",
    nera_cme_hours: "",
    nera_code: "",
  });

  // Hosts and Agendas state
  const [hosts, setHosts] = useState([]);
  const [agendas, setAgendas] = useState([]);
  const [hostImages, setHostImages] = useState({});
  const [showGenerateAgendaPrompt, setShowGenerateAgendaPrompt] =
    useState(false);

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [removeBanner, setRemoveBanner] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const fetchedRef = useRef(false);
  const [userLoaded, setUserLoaded] = useState(false);
  // Get user info from JWT token
  
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUserData(data.user);
        } else {
          // mark loaded; don't toast yet to avoid early flash
        }

      } catch {
        // silent; we'll show a visible banner below
      } finally {
        setUserLoaded(true);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (userData) {
      try {
        setUserInfo({
          id: userData.id || userData.uid || userData.user_id || "",
          name: userData.full_name || "Admin User",
          email: userData.email || "admin@bds.com",
          role: userData.role || "Administrator",
        });

        if (mode === "create") {
          const userId = userData.id || userData.uid || userData.user_id || "";
          if (userId) {
            setFormData((prev) => ({
              ...prev,
              created_by: userId,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to set user info:", error);
        toast.error("Failed to get user information. Please login again.");
      }
    }
  }, [mode, userData]);

  // Initialize form with event data for edit mode
  useEffect(() => {
    if (mode === "edit" && event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        start_datetime: formatDateTimeForInput(event.start_datetime),
        end_datetime: formatDateTimeForInput(event.end_datetime),
        timezone: event.timezone || "Asia/Bahrain",
        venue_name: event.venue_name || "",
        address: event.address || "",
        city: event.city || "",
        province: event.state || "",
        pin_code: event.pin_code || "",
        google_map_url: event.google_map_url || "",
        capacity: event.capacity || "",
        is_paid: event.is_paid || false,
        regular_price: event.regular_price || "",
        member_price: event.member_price || "",
        student_price: event.student_price || "",
        hygienist_price: event.hygienist_price || "",
        regular_standard_price: event.regular_standard_price || "",
        member_standard_price: event.member_standard_price || "",
        student_standard_price: event.student_standard_price || "",
        hygienist_standard_price: event.hygienist_standard_price || "",
        regular_onsite_price: event.regular_onsite_price || "",
        member_onsite_price: event.member_onsite_price || "",
        student_onsite_price: event.student_onsite_price || "",
        hygienist_onsite_price: event.hygienist_onsite_price || "",
        early_bird_deadline: formatDateTimeForInput(event.early_bird_deadline),
        status: event.status || "upcoming",
        created_by: event.created_by || "",
        nera_cme_hours: event.nera_cme_hours ?? "",
        nera_code: event.nera_code ?? "",
      });

      if (event.event_hosts) {
        setHosts(
          event.event_hosts.map((host) => ({
            id: host.id,
            name: host.name || "",
            email: host.email || "",
            phone: host.phone || "",
            bio: host.bio || "",
            profile_image: host.profile_image || null,
            is_primary: host.is_primary || false,
            display_order: host.display_order || 1,
          }))
        );
      }

      if (event.event_agendas) {
        setAgendas(
          event.event_agendas.map((agenda) => ({
            id: agenda.id,
            agenda_date: agenda.agenda_date || "",
            title: agenda.title || "",
            description: agenda.description || "",
            start_time: agenda.start_time || "",
            end_time: agenda.end_time || "",
          }))
        );
      }

      if (event.banner_url) {
        setBannerPreview(event.banner_url);
      }
    }
  }, [mode, event]);

  // Handle form input changes - useCallback to prevent unnecessary re-renders
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }

      // Show agenda generation prompt when both dates are set
      if (
        (name === "start_datetime" || name === "end_datetime") &&
        e.target.value &&
        formData[
          name === "start_datetime" ? "end_datetime" : "start_datetime"
        ] &&
        agendas.length === 0 &&
        activeTab !== "agendas"
      ) {
        setShowGenerateAgendaPrompt(true);
      }
    },
    [
      errors,
      agendas.length,
      activeTab,
      formData.start_datetime,
      formData.end_datetime,
    ]
  );

  // Generate agenda slots automatically
  const handleGenerateAgenda = useCallback(() => {
    if (!formData.start_datetime || !formData.end_datetime) {
      toast.error("Please set both start and end dates first");
      return;
    }

    const generatedSlots = generateAgendaSlots(
      formData.start_datetime,
      formData.end_datetime
    );

    if (generatedSlots.length > 0) {
      setAgendas(generatedSlots);
      setShowGenerateAgendaPrompt(false);
      setActiveTab("agendas");
      toast.success(
        `Generated ${generatedSlots.length} agenda slot${
          generatedSlots.length > 1 ? "s" : ""
        } automatically`
      );
    }
  }, [formData.start_datetime, formData.end_datetime]);

  // Handle city/province input
  const handleCityProvinceChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    },
    [errors]
  );

  // Handle banner image upload
  const handleBannerUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, JPG, PNG, and WebP images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setBannerFile(file);
    setRemoveBanner(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  // Remove banner image
  const handleRemoveBanner = useCallback(() => {
    setBannerFile(null);
    setBannerPreview(null);
    if (mode === "edit" && event?.banner_url) {
      setRemoveBanner(true);
    }
  }, [mode, event]);

  // Handle host profile image upload
  const handleHostImageUpload = useCallback((index, file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, JPG, PNG, and WebP images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setHostImages((prev) => ({
        ...prev,
        [index]: {
          file: file,
          preview: reader.result,
        },
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  // Remove host profile image
  const handleRemoveHostImage = useCallback(
    (index) => {
      setHostImages((prev) => {
        const newHostImages = { ...prev };
        delete newHostImages[index];
        return newHostImages;
      });

      const updatedHosts = [...hosts];
      updatedHosts[index] = {
        ...updatedHosts[index],
        profile_image: null,
        remove_profile_image: true,
      };
      setHosts(updatedHosts);
    },
    [hosts]
  );

  // Host management functions
  const addHost = useCallback(() => {
    setHosts([
      ...hosts,
      {
        name: "",
        email: "",
        phone: "",
        bio: "",
        profile_image: null,
        is_primary: false,
        display_order: hosts.length + 1,
      },
    ]);
  }, [hosts]);

  const removeHost = useCallback(
    (index) => {
      const updatedHosts = hosts.filter((_, i) => i !== index);

      const reorderedHosts = updatedHosts.map((host, i) => ({
        ...host,
        display_order: i + 1,
      }));

      setHosts(reorderedHosts);

      setHostImages((prev) => {
        const newHostImages = { ...prev };
        delete newHostImages[index];
        return newHostImages;
      });
    },
    [hosts]
  );

  const updateHost = useCallback((index, field, value) => {
    setHosts((prevHosts) => {
      const updatedHosts = [...prevHosts];
      updatedHosts[index] = {
        ...updatedHosts[index],
        [field]: value,
      };

      if (field === "is_primary" && value === true) {
        updatedHosts.forEach((host, i) => {
          if (i !== index) {
            host.is_primary = false;
          }
        });
      }

      return updatedHosts;
    });
  }, []);

  // Agenda management functions
  const addAgenda = useCallback(() => {
    setAgendas([
      ...agendas,
      {
        agenda_date: formData.start_datetime
          ? new Date(formData.start_datetime).toISOString().split("T")[0]
          : "",
        title: "",
        description: "",
        start_time: "09:00",
        end_time: "17:00",
      },
    ]);
  }, [agendas, formData.start_datetime]);

  const removeAgenda = useCallback(
    (index) => {
      const updatedAgendas = agendas.filter((_, i) => i !== index);
      setAgendas(updatedAgendas);
    },
    [agendas]
  );

  const updateAgenda = useCallback((index, field, value) => {
    setAgendas((prevAgendas) => {
      const updatedAgendas = [...prevAgendas];
      updatedAgendas[index] = {
        ...updatedAgendas[index],
        [field]: value,
      };
      return updatedAgendas;
    });
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.start_datetime) {
      newErrors.start_datetime = "Start date and time are required";
    }

    if (formData.is_paid) {
      if (!formData.regular_price || parseFloat(formData.regular_price) <= 0) {
        newErrors.regular_price =
          "Valid regular price is required for paid events";
      } else if (parseFloat(formData.regular_price) > 10000) {
        newErrors.regular_price = "Price cannot exceed 10,000 BHD";
      }
    }

    if (formData.capacity && parseInt(formData.capacity) < 1) {
      newErrors.capacity = "Capacity must be at least 1";
    }

    hosts.forEach((host, index) => {
      if (!host.name.trim()) {
        newErrors[`host_${index}_name`] = "Host name is required";
      }
    });

    agendas.forEach((agenda, index) => {
      if (!agenda.agenda_date) {
        newErrors[`agenda_${index}_date`] = "Agenda date is required";
      }
      if (!agenda.title.trim()) {
        newErrors[`agenda_${index}_title`] = "Agenda title is required";
      }
    });

    if (!formData.created_by && mode === "create") {
      newErrors.created_by = "User ID is required";
      if (!userInfo) {
        toast.error("Please login to create events");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, hosts, agendas, mode, userInfo]);

  // Format form data for submission
  const formatFormData = useCallback(() => {
    const data = new FormData();

    const priceFields = [
      'regular_price', 'member_price', 'student_price', 'hygienist_price',
      'regular_standard_price', 'member_standard_price', 'student_standard_price', 'hygienist_standard_price',
      'regular_onsite_price', 'member_onsite_price', 'student_onsite_price', 'hygienist_onsite_price'
    ];

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        if (priceFields.includes(key) && !formData.is_paid) {
          data.append(key, "");
        } else if (key === "province") {
          data.append("province", formData[key]);
        } else if (key === "nera_cme_hours") {
          data.append("nera_cme_hours", String(formData[key] || "").trim());
        } else if (key === "nera_code") {
          data.append("nera_code", String(formData[key] || "").trim());
        } else {
          if (key === "created_by") {
            const userId =
              mode === "edit"
                ? formData.created_by
                : userInfo?.id || formData.created_by;
            data.append(key, userId);
          } else {
            data.append(key, formData[key]);
          }
        }
      }
    });

    if (bannerFile) {
      data.append("banner_image", bannerFile);
    }

    if (removeBanner) {
      data.append("remove_banner", "true");
    }

    if (hosts.length > 0) {
      data.append("hosts", JSON.stringify(hosts));
      data.append("update_hosts", "true");

      Object.keys(hostImages).forEach((index) => {
        const hostImage = hostImages[index];
        if (hostImage?.file) {
          data.append(`host_profile_image_${index}`, hostImage.file);
        }
      });
    }

    if (agendas.length > 0) {
      data.append("agendas", JSON.stringify(agendas));
      data.append("update_agendas", "true");
    }

    return data;
  }, [
    formData,
    mode,
    userInfo,
    bannerFile,
    removeBanner,
    hosts,
    hostImages,
    agendas,
  ]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "create" && !userInfo?.id) {
      toast.error("Please login to create events");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formDataToSend = formatFormData();

      const url =
        mode === "create"
          ? "/api/admin/events"
          : `/api/admin/events/${event.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          mode === "create"
            ? "Event created successfully!"
            : "Event updated successfully!"
        );
        onSuccess();
      } else {
        toast.error(data.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  // User info display component
  const UserInfo = useMemo(() => {
    if (!userInfo) {
      return (
        <div className="flex items-center gap-2 text-sm bg-[#b8352d]/10 text-[#b8352d] border border-[#b8352d]/30 p-3 rounded-xl mb-4">
          <AlertCircle className="w-4 h-4" />
          <span>
            {userLoaded
              ? "Not logged in. Please login to manage events."
              : "Checking your session..."}
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm bg-[#03215F] text-white p-3 rounded-xl mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <User className="w-4 h-4 text-white" />
          <span className="text-white">Logged in as:</span>
          <span className="font-semibold text-white">
            {userInfo.name || userInfo.email || "Unknown User"}
          </span>
          <span className="text-xs px-2 py-1 bg-[#03215F]/10 text-white rounded">
            {userInfo.role}
          </span>
        </div>
       
      </div>
    );
  }, [userInfo]);

  // Generate Agenda Prompt
  const GenerateAgendaPrompt = useMemo(() => {
    if (!showGenerateAgendaPrompt) return null;

    const dateRange = getDateRangeDisplay(
      formData.start_datetime,
      formData.end_datetime
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
      >
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold mb-1">
                Generate Agenda Automatically?
              </h4>
              <p className="text-sm text-white/90 mb-3">
                We can generate agenda slots for your event ({dateRange}). This
                will override any existing agenda items.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleGenerateAgenda}
                  className="flex-1 px-4 py-2 bg-white text-[#03215F] rounded-lg font-medium hover:bg-white/90 transition-colors whitespace-nowrap"
                >
                  Generate Agenda
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenerateAgendaPrompt(false)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                  Skip
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGenerateAgendaPrompt(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }, [
    showGenerateAgendaPrompt,
    formData.start_datetime,
    formData.end_datetime,
    handleGenerateAgenda,
  ]);

  // Navigation tabs
  const NavigationTabs = useMemo(
    () => (
      <div className="border-b border-gray-200 mb-6">
        <div className="flex overflow-x-auto no-scrollbar">
          <nav className="flex space-x-2 sm:space-x-6 min-w-max">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`py-3 px-1 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "basic"
                  ? "border-[#03215F] text-[#03215F]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>Basic Info</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("hosts")}
              className={`py-3 px-1 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "hosts"
                  ? "border-[#03215F] text-[#03215F]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span>Hosts</span>
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded-full">
                  {hosts.length}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("agendas")}
              className={`py-3 px-1 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "agendas"
                  ? "border-[#03215F] text-[#03215F]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4" />
                <span>Agenda</span>
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded-full">
                  {agendas.length}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("finance")}
              className={`py-3 px-1 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "finance"
                  ? "border-[#03215F] text-[#03215F]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Finance</span>
              </div>
            </button>
          </nav>
        </div>
      </div>
    ),
    [activeTab, hosts.length, agendas.length]
  );

  // Hosts Tab Content
  const HostsTab = useMemo(
    () => (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Event Hosts
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Add hosts, speakers, or organizers for your event
            </p>
          </div>
          <button
            type="button"
            onClick={addHost}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:from-[#03215F] hover:to-[#03215F] transition-all whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Host
          </button>
        </div>

        {hosts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#9cc2ed] to-[#03215F] flex items-center justify-center">
              <User className="w-8 h-8 text-[#03215F]" />
            </div>
            <p className="text-gray-600 font-medium">
              No hosts added yet
            </p>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Add hosts to showcase the speakers or organizers of your event
            </p>
            <button
              type="button"
              onClick={addHost}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
            >
              Add Your First Host
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {hosts.map((host, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#9cc2ed] to-[#03215F] flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {host.name || `Host ${index + 1}`}
                      </h4>
                      {host.is_primary && (
                        <span className="inline-block mt-1 text-xs px-2 py-1 bg-[#9cc2ed] text-[#03215F] rounded-full">
                          Primary Host
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500">
                      Order: {host.display_order}
                    </div>
                    {hosts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHost(index)}
                        className="p-2 text-[#b8352d] hover:bg-[#b8352d] rounded-lg transition-colors"
                        title="Remove host"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Profile Image Section */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Profile Image
                      <span className="text-xs text-gray-500 ml-2">
                        Optional • Max 5MB
                      </span>
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200">
                          {hostImages[index]?.preview || host.profile_image ? (
                            <img
                              src={
                                hostImages[index]?.preview || host.profile_image
                              }
                              alt={`Host ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <User className="w-10 h-10 text-gray-400" />
                            </div>
                          )}
                        </div>
                        {(hostImages[index]?.preview || host.profile_image) && (
                          <button
                            type="button"
                            onClick={() => handleRemoveHostImage(index)}
                            className="absolute -top-2 -right-2 p-1.5 bg-[#b8352d] text-white rounded-full hover:bg-[#b8352d] transition-colors"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <label className="block">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) =>
                              handleHostImageUpload(index, e.target.files[0])
                            }
                            className="hidden"
                          />
                          <div className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer text-center font-medium transition-colors border border-dashed border-gray-300">
                            <div className="flex items-center justify-center gap-2">
                              <Upload className="w-4 h-4" />
                              <span>Upload Profile Image</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Click or drag & drop
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Host Details */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <MemoizedInput
                      value={host.name}
                      onChange={(e) =>
                        updateHost(index, "name", e.target.value)
                      }
                      error={errors[`host_${index}_name`]}
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={host.email}
                        onChange={(e) =>
                          updateHost(index, "email", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={host.phone}
                        onChange={(e) =>
                          updateHost(index, "phone", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                        placeholder="+973 1234 5678"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={host.display_order}
                        onChange={(e) =>
                          updateHost(
                            index,
                            "display_order",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                      />
                    </div>
                    <div className="pt-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={host.is_primary}
                          onChange={(e) =>
                            updateHost(index, "is_primary", e.target.checked)
                          }
                          className="w-5 h-5 text-[#03215F] rounded focus:ring-2 focus:ring-[#03215F] border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Primary
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={host.bio}
                      onChange={(e) => updateHost(index, "bio", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent resize-none"
                      placeholder="Brief description about the host..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    [
      hosts,
      hostImages,
      errors,
      addHost,
      removeHost,
      updateHost,
      handleHostImageUpload,
      handleRemoveHostImage,
    ]
  );

  // Agendas Tab Content
  const AgendasTab = useMemo(
    () => (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Event Agenda
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {formData.start_datetime && formData.end_datetime
                ? `Event Dates: ${getDateRangeDisplay(
                    formData.start_datetime,
                    formData.end_datetime
                  )}`
                : "Set event dates first to generate agenda automatically"}
            </p>
          </div>
          <div className="flex gap-3">
            {formData.start_datetime && formData.end_datetime && (
              <button
                type="button"
                onClick={handleGenerateAgenda}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white rounded-lg hover:from-[#AE9B66] hover:to-[#AE9B66] transition-all whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                Auto Generate
              </button>
            )}
            <button
              type="button"
              onClick={addAgenda}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:from-[#03215F] hover:to-[#03215F] transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>

        {agendas.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] flex items-center justify-center">
              <ListChecks className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 font-medium">
              No agenda items added yet
            </p>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              {formData.start_datetime && formData.end_datetime
                ? 'Click "Auto Generate" to create agenda based on your event dates'
                : "Set event dates first to generate agenda automatically"}
            </p>
            {formData.start_datetime && formData.end_datetime && (
              <button
                type="button"
                onClick={handleGenerateAgenda}
                className="mt-4 px-4 py-2 bg-[#AE9B66] text-white hover:bg-[#AE9B66] rounded-lg font-medium transition-colors"
              >
                Generate Agenda Automatically
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {agendas.map((agenda, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {agenda.title || `Agenda Item ${index + 1}`}
                      </h4>
                      {agenda.agenda_date && (
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(agenda.agenda_date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAgenda(index)}
                    className="p-2 text-[#b8352d] hover:bg-[#b8352d] rounded-lg transition-colors flex-shrink-0"
                    title="Remove agenda item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={agenda.agenda_date}
                        onChange={(e) =>
                          updateAgenda(index, "agenda_date", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${
                          errors[`agenda_${index}_date`]
                            ? "border-[#b8352d]"
                            : "border-gray-200"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent`}
                      />
                    </div>
                    {errors[`agenda_${index}_date`] && (
                      <p className="text-[#b8352d] text-sm mt-1">
                        {errors[`agenda_${index}_date`]}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <MemoizedInput
                      value={agenda.title}
                      onChange={(e) =>
                        updateAgenda(index, "title", e.target.value)
                      }
                      error={errors[`agenda_${index}_title`]}
                      placeholder="Enter agenda title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="time"
                        value={agenda.start_time}
                        onChange={(e) =>
                          updateAgenda(index, "start_time", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="time"
                        value={agenda.end_time}
                        onChange={(e) =>
                          updateAgenda(index, "end_time", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={agenda.description}
                      onChange={(e) =>
                        updateAgenda(index, "description", e.target.value)
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent resize-none"
                      placeholder="Detailed description of this agenda item..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    [
      agendas,
      formData.start_datetime,
      formData.end_datetime,
      errors,
      handleGenerateAgenda,
      addAgenda,
      removeAgenda,
      updateAgenda,
    ]
  );

  // Basic Info Tab Content
  const BasicInfoTab = useMemo(
    () => (
      <>
        {/* Banner Image */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Event Banner {mode === "create" && "(Optional)"}
            <span className="text-xs text-gray-500 ml-2">
              Max 5MB • JPG, PNG, WebP
            </span>
          </label>
          <div className="space-y-3">
            {bannerPreview ? (
              <div className="relative group">
                <div className="w-full aspect-video rounded-xl overflow-hidden border-2 border-gray-300">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  className="absolute top-3 right-3 p-2 bg-[#b8352d] text-white rounded-full hover:bg-[#b8352d] transition-colors shadow-lg hover:scale-110"
                  aria-label="Remove banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-[#03215F] transition-all duration-300 cursor-pointer group">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="p-3 rounded-full bg-gradient-to-r from-[#03215F]/10 to-[#03215F]/10 group-hover:from-[#03215F]/20 group-hover:to-[#03215F]/20 transition-all">
                    <ImageIcon className="w-8 h-8 text-[#03215F]" />
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">
                      Click to upload banner
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Drag & drop or click to browse
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Main Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-lg bg-gradient-to-r from-[#9cc2ed] to-[#03215F]">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h3>
                  <p className="text-sm text-gray-600">
                    Core details about your event
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <MemoizedInput
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    error={errors.title}
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <MemoizedTextarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your event..."
                  />
                </div>

                {/* NHRA Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NHRA-CME Hrs
                    </label>
                    <MemoizedInput
                      name="nera_cme_hours"
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.nera_cme_hours}
                      onChange={handleChange}
                      placeholder="e.g., 2.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    NHRA Code
                    </label>
                    <MemoizedInput
                      name="nera_code"
                      value={formData.nera_code}
                      onChange={handleChange}
                      placeholder="Enter NHRA code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                    >
                      {EVENT_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Timezone is always Bahrain - hidden field */}
                  <input type="hidden" name="timezone" value="Asia/Bahrain" />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-lg bg-gradient-to-r from-[#03215F] to-[#b8352d]">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Date & Time
                  </h3>
                  <p className="text-sm text-gray-600">
                    When your event takes place
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <MemoizedInput
                      type="datetime-local"
                      name="start_datetime"
                      value={formData.start_datetime}
                      onChange={handleChange}
                      error={errors.start_datetime}
                      className="pl-12 pr-4"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time (Optional)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <MemoizedInput
                      type="datetime-local"
                      name="end_datetime"
                      value={formData.end_datetime}
                      onChange={handleChange}
                      className="pl-12 pr-4"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Venue Information */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-lg bg-gradient-to-r from-[#AE9B66] to-[#AE9B66]">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Venue Information
                  </h3>
                  <p className="text-sm text-gray-600">
                    Where your event will be held
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.venue_name}
                      onChange={(e) =>
                        handleCityProvinceChange("venue_name", e.target.value)
                      }
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="Enter venue name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <MemoizedInput
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter full address"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        handleCityProvinceChange("city", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="e.g., Manama"
                      list="bahrain-cities"
                    />
                    <datalist id="bahrain-cities">
                      {bahrainCities.map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province
                    </label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) =>
                        handleCityProvinceChange("province", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                      placeholder="e.g., Capital Governorate"
                      list="bahrain-provinces"
                    />
                    <datalist id="bahrain-provinces">
                      {bahrainGovernorates.map((province) => (
                        <option key={province} value={province} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code
                    </label>
                    <MemoizedInput
                      name="pin_code"
                      value={formData.pin_code}
                      onChange={handleChange}
                      placeholder="Enter postal code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Maps URL
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <MemoizedInput
                        type="url"
                        name="google_map_url"
                        value={formData.google_map_url}
                        onChange={handleChange}
                        className="pl-12 pr-4"
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-lg bg-gradient-to-r from-[#b8352d] to-[#b8352d]">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Event Details
                  </h3>
                  <p className="text-sm text-gray-600">
                    Additional information about your event
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (Optional)
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <MemoizedInput
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      error={errors.capacity}
                      min="1"
                      className="pl-12 pr-4"
                      placeholder="Enter maximum capacity"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    ),
    [
      formData,
      errors,
      mode,
      bannerPreview,
      bahrainCities,
      bahrainGovernorates,
      handleChange,
      handleCityProvinceChange,
      handleBannerUpload,
      handleRemoveBanner,
    ]
  );

  // Finance Tab Content
  const FinanceTab = useMemo(
    () => (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Finance & Pricing
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Configure pricing tiers and early bird deadlines
            </p>
          </div>
        </div>

        {/* Paid Event Toggle */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="is_paid_finance"
              name="is_paid"
              checked={formData.is_paid}
              onChange={handleChange}
              className="w-5 h-5 text-[#03215F] rounded focus:ring-2 focus:ring-[#03215F] border-gray-300"
            />
            <label
              htmlFor="is_paid_finance"
              className="text-sm font-medium text-gray-700 flex-1"
            >
              This is a paid event
            </label>
          </div>
        </div>

        {formData.is_paid && (
          <>
            {/* Early Bird Deadline */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-lg bg-gradient-to-r from-[#AE9B66] to-[#AE9B66]">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pricing Deadlines
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configure when pricing tiers change
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Early Bird End Date *
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Early Bird prices apply until this date. After this, Standard prices apply until the event starts.
                  </p>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <MemoizedInput
                      type="datetime-local"
                      name="early_bird_deadline"
                      value={formData.early_bird_deadline}
                      onChange={handleChange}
                      error={errors.early_bird_deadline}
                      className="pl-12 pr-4"
                    />
                  </div>
                  {errors.early_bird_deadline && (
                    <p className="text-[#b8352d] text-sm flex items-center gap-1 mt-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.early_bird_deadline}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <strong>Pricing Logic:</strong>
                    <br />
                    • <span className="text-green-600 font-medium">Early Bird:</span> Before Early Bird End Date
                    <br />
                    • <span className="text-blue-600 font-medium">Standard:</span> After Early Bird End Date, until Event Start Date
                    <br />
                    • <span className="text-orange-600 font-medium">On-site:</span> On or after Event Start Date (at-venue registration)
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Table */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-lg bg-gradient-to-r from-[#03215F] to-[#03215F]">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pricing Tiers
                  </h3>
                  <p className="text-sm text-gray-600">
                    All prices in Bahrain Dinar (BHD) with 3 decimal places
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">Category</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-green-700 bg-green-50">Early Bird</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-blue-700 bg-blue-50">Standard</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-orange-700 bg-orange-50">On-site</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* BDS Member Row */}
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700 bg-blue-50">
                        BDS Member & Partner Dentists
                      </td>
                      <td className="border border-gray-300 px-2 py-1 bg-green-50/50">
                        <input
                          type="number"
                          name="member_price"
                          value={formData.member_price}
                          onChange={handleChange}
                          min="0"
                          step="0.001"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-center focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                          placeholder="0.000"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 bg-blue-50/50">
                        <input
                          type="number"
                          name="member_standard_price"
                          value={formData.member_standard_price}
                          onChange={handleChange}
                          min="0"
                          step="0.001"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-center focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                          placeholder="0.000"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 bg-orange-50/50">
                        <input
                          type="number"
                          name="member_onsite_price"
                          value={formData.member_onsite_price}
                          onChange={handleChange}
                          min="0"
                          step="0.001"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-center focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                          placeholder="0.000"
                        />
                      </td>
                    </tr>
                    {/* Non-Member Row */}
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700 bg-gray-50">
                        Non-Member Dentist *
                      </td>
                      <td className="border border-gray-300 px-2 py-1 bg-green-50/50">
                        <input
                          type="number"
                          name="regular_price"
                          value={formData.regular_price}
                          onChange={handleChange}
                          min="0"
                          step="0.001"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-center focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                          placeholder="0.000"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 bg-blue-50/50">
                        <input
                          type="number"
                          name="regular_standard_price"
                          value={formData.regular_standard_price}
                          onChange={handleChange}
                          min="0"
                          step="0.001"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-center focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                          placeholder="0.000"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 bg-orange-50/50">
                        <input
                          type="number"
                          name="regular_onsite_price"
                          value={formData.regular_onsite_price}
                          onChange={handleChange}
                          min="0"
                          step="0.001"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-center focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                          placeholder="0.000"
                        />
                      </td>
                    </tr>
                    {/* Student Row */}
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700 bg-green-50">
                        Undergraduate Student
                      </td>
                      <td className="border border-gray-300 px-2 py-1 bg-green-50/50">
                        <input
                          type="number"
                          name="student_price"
                          value={formData.student_price}
                          onChange={handleChange}
                          min="0"
                          step="0.001"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-center focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                          placeholder="0.000"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 bg-blue-50/50">
                        <input
                          type="number"
                          name="student_standard_price"
                          value={formData.student_standard_price}
                          onChange={handleChange}
                          min="0"
                          step="0.001"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-center focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                          placeholder="0.000"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 bg-orange-50/50">
                        <input
                          type="number"
                          name="student_onsite_price"
                          value={formData.student_onsite_price}
                          onChange={handleChange}
                          min="0"
                          step="0.001"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-center focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                          placeholder="0.000"
                        />
                      </td>
                    </tr>
                    {/* Hygienist Row */}
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700 bg-purple-50">
                        Hygienist / Assistant / Technician
                      </td>
                      <td className="border border-gray-300 px-2 py-1 bg-green-50/50">
                        <input
                          type="number"
                          name="hygienist_price"
                          value={formData.hygienist_price}
                          onChange={handleChange}
                          min="0"
                          step="0.001"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-center focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                          placeholder="0.000"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 bg-blue-50/50">
                        <input
                          type="number"
                          name="hygienist_standard_price"
                          value={formData.hygienist_standard_price}
                          onChange={handleChange}
                          min="0"
                          step="0.001"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-center focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                          placeholder="0.000"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 bg-orange-50/50">
                        <input
                          type="number"
                          name="hygienist_onsite_price"
                          value={formData.hygienist_onsite_price}
                          onChange={handleChange}
                          min="0"
                          step="0.001"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-center focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                          placeholder="0.000"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {errors.regular_price && (
                <p className="text-[#b8352d] text-sm flex items-center gap-1 mt-3">
                  <AlertCircle className="w-4 h-4" />
                  {errors.regular_price}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-3">
                * Non-Member Early Bird price is required for paid events. Other prices are optional.
              </p>
            </div>
          </>
        )}

        {!formData.is_paid && (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">Free Event</h4>
            <p className="text-sm text-gray-500">
              This event is free for all attendees. Toggle "This is a paid event" above to configure pricing.
            </p>
          </div>
        )}
      </div>
    ),
    [formData, errors, handleChange]
  );

  return (
    <>
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] overflow-y-auto"
        onClick={onClose}
      />

      {/* Modal Container - FIXED STRUCTURE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="
    fixed top-1/2 left-1/2
    -translate-x-1/2 -translate-y-1/2
    z-[101]
    w-[95vw] max-w-6xl
    max-h-[95vh]
    rounded-2xl shadow-2xl
    overflow-y-scroll
  "
        style={{
          display: "flex",
          WebkitOverflowScrolling: "touch",
          flexDirection: "column",
        }}
      >
        <div className="bg-gradient-to-br from-white to-gray-50 w-full h-full flex flex-col">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between p-4 sm:p-6">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {mode === "create" ? "Create New Event" : "Edit Event"}
                </h2>
                <p className="text-gray-600 text-sm mt-1 truncate">
                  {mode === "create"
                    ? "Fill in the details to create a new event"
                    : "Update the event information"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:text-gray-900 transition-colors hover:scale-110 active:scale-95 ml-2"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 sm:px-6 pb-4">{UserInfo}</div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex-shrink-0 px-4 sm:px-6">{NavigationTabs}</div>

          {/* Form Content - Scrollable Area */}
          <div 
            className="flex-1 px-4 sm:px-6 py-0"
            style={{
              flex: "1 1 auto",
              minHeight: 0,
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tab Content */}
              {activeTab === "basic" && BasicInfoTab}
              {activeTab === "hosts" && HostsTab}
              {activeTab === "agendas" && AgendasTab}
              {activeTab === "finance" && FinanceTab}

              {/* Form Actions */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-4 sm:p-6 mt-6 z-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{hosts.length}</span>
                      <span>host{hosts.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-4 h-4" />
                      <span className="font-medium">{agendas.length}</span>
                      <span>agenda item{agendas.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 active:scale-95"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || (mode === "create" && !userInfo)}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {mode === "create" ? "Creating..." : "Updating..."}
                        </>
                      ) : (
                        <>
                          {mode === "create" ? "Create Event" : "Update Event"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Generate Agenda Prompt */}
      {GenerateAgendaPrompt}
    </>
  );
}
