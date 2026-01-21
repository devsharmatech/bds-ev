"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Search,
  User,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Smartphone,
  Users,
  Ticket,
  ShieldCheck,
  Camera,
  Upload,
  X,
  Scan,
  Hash,
  ChevronDown,
  ChevronUp,
  CameraOff,
  Smartphone as Mobile,
  Tablet,
  Monitor,
  Shield,
  Key,
  Info,
  HelpCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// QrScanner will be imported dynamically when needed
let QrScanner = null;

// Bahrain timezone helper
const formatDateBH = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-BH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Bahrain",
  });
};

const formatTimeBH = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-BH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bahrain",
  });
};

export default function CheckInPage() {
  const [mode, setMode] = useState("qr");
  const [scanning, setScanning] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState({
    type: "event_token",
    value: "",
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [expandedAgenda, setExpandedAgenda] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [deviceType, setDeviceType] = useState("desktop");
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Check if mobile device

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setDeviceType("mobile");
        setIsMobile(true);
      } else if (width < 1024) {
        setDeviceType("tablet");
        setIsMobile(false);
      } else {
        setDeviceType("desktop");
        setIsMobile(false);
      }
    };

    detectDevice();
    window.addEventListener("resize", detectDevice);

    return () => window.removeEventListener("resize", detectDevice);
  }, []);

  // Check camera availability
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCameraDevice = devices.some(
          (device) => device.kind === "videoinput"
        );
        setHasCamera(hasCameraDevice);
      } catch (error) {
        console.error("Error checking camera:", error);
        setHasCamera(false);
      }
    };

    if (typeof window !== "undefined") {
      checkCamera();
    }
  }, []);

  // Start QR scanner - sets state, actual initialization happens in useEffect
  const startScanner = async () => {
    // Check if camera is available first
    if (!hasCamera) {
      setCameraError("No camera detected on this device");
      toast.error("No camera detected. Please use manual entry.");
      return;
    }

    // Load QrScanner library if not already loaded
    if (!QrScanner) {
      try {
        const qrScannerModule = await import("qr-scanner");
        QrScanner = qrScannerModule.default || qrScannerModule.QrScanner || qrScannerModule;
        
        if (!QrScanner) {
          throw new Error("Failed to load QR Scanner library");
        }
      } catch (importError) {
        console.error("Error importing QR Scanner:", importError);
        setCameraError("Failed to load QR Scanner library. Please refresh the page.");
        toast.error("Failed to load QR Scanner library. Please refresh the page.");
        return;
      }
    }

    // Set scanning state to render video element
    // The useEffect will handle actual scanner initialization
    setScanning(true);
    setCameraError(null);
  };

  // Stop scanner
  const stopScanner = () => {
    try {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    } catch (error) {
      console.error("Error stopping scanner:", error);
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setScanning(false);
    setCameraError(null);
  };

  // Handle QR scan result
  const handleQRScan = async (qrData) => {
    stopScanner();

    try {
      setLoading(true);
      
      // Parse QR data - handle both string and object formats
      let qrValue;
      if (typeof qrData === 'string') {
        try {
          qrValue = JSON.parse(qrData);
        } catch (parseError) {
          // If it's not JSON, treat it as a plain token
          qrValue = {
            type: "EVENT_CHECKIN",
            token: qrData.trim().toUpperCase(),
          };
        }
      } else if (typeof qrData === 'object' && qrData !== null) {
        qrValue = qrData;
      } else {
        throw new Error("Invalid QR code data format");
      }

      // Ensure qrValue has a type
      if (!qrValue.type) {
        // Try to infer type from the data
        if (qrValue.token) {
          qrValue.type = "EVENT_CHECKIN";
        } else if (qrValue.membership_id || qrValue.membership_code) {
          qrValue.type = "MEMBERSHIP_VERIFICATION";
          qrValue.membership_id = qrValue.membership_id || qrValue.membership_code;
        } else {
          throw new Error("Unable to determine QR code type");
        }
      }

      // Validate based on QR type
      const response = await fetch("/api/check-in/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrValue }),
      });

      const data = await response.json();

      if (data.success) {
        setValidationResult({
          ...data.data,
          qrType: qrValue.type,
          valid: true,
        });

        if (qrValue.type === "EVENT_CHECKIN") {
          setSelectedEvent(data.data.event);
        }

        toast.success(data.message || "Validation successful");
      } else {
        setValidationResult({
          qrType: qrValue.type,
          valid: false,
          error: data.message || "Validation failed",
        });
        toast.error(data.message || "Validation failed");
      }
    } catch (error) {
      console.error("QR scan error:", error);

      if (error instanceof SyntaxError) {
        toast.error("Invalid QR code format");
        setValidationResult({
          valid: false,
          error:
            "Invalid QR code format. Please scan a valid event or membership QR code.",
        });
      } else {
        toast.error("Scan failed. Please try again.");
        setValidationResult({
          valid: false,
          error: error.message || "Scan failed. Please try again or use manual entry.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle manual validation
  const handleManualValidate = async () => {
    if (!manualInput.value.trim()) {
      toast.error("Please enter a value");
      return;
    }

    setLoading(true);
    setValidationResult(null);

    try {
      let qrValue;

      if (manualInput.type === "event_token") {
       
        qrValue = {
          type: "EVENT_CHECKIN",
          token: manualInput.value.trim().toUpperCase(),
        };
      } else {
        qrValue = {
          type: "MEMBERSHIP_VERIFICATION",
          membership_id: manualInput.value.trim(),
        };
      }

      const response = await fetch("/api/check-in/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrValue }),
      });

      const data = await response.json();

      if (data.success) {
        setValidationResult({
          ...data.data,
          qrType: qrValue.type,
          valid: true,
        });

        if (qrValue.type === "EVENT_CHECKIN") {
          setSelectedEvent(data.data.event);
        }

        toast.success(data.message || "Validation successful");
      } else {
        setValidationResult({
          qrType: qrValue.type,
          valid: false,
          error: data.message || "Validation failed",
        });
        toast.error(data.message || "Validation failed");
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error(error.message || "Validation failed");
      setValidationResult({
        valid: false,
        error: error.message || "Validation failed",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle check-in
  const handleCheckIn = async (agendaId) => {
    if (!validationResult) {
      toast.error("No validation result found");
      return;
    }

    if (!validationResult.valid) {
      toast.error("Cannot check in with invalid validation");
      return;
    }

    setLoading(true);

    try {
      // Prepare request body based on check-in type
      const requestBody = {
        type: validationResult.qrType,
        agenda_id: agendaId || null,
      };

      // Add type-specific fields
      if (validationResult.qrType === "EVENT_CHECKIN") {
        if (!validationResult.token) {
          toast.error("Event token is missing");
          setLoading(false);
          return;
        }
        requestBody.token = validationResult.token;
        requestBody.event_id = validationResult.event_id || validationResult.event?.id;
      } else if (validationResult.qrType === "MEMBERSHIP_VERIFICATION") {
        if (!validationResult.membership_id && !validationResult.membership_code) {
          toast.error("Membership ID is missing");
          setLoading(false);
          return;
        }
        requestBody.membership_id = validationResult.membership_id || validationResult.membership_code;
        requestBody.event_id = validationResult.event_id || validationResult.event?.id;
      } else {
        toast.error("Invalid check-in type");
        setLoading(false);
        return;
      }

      console.log("Check-in request:", requestBody);
      console.log("Validation result:", validationResult);

      const response = await fetch("/api/check-in/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      console.log("Check-in response:", data);
      console.log("Response status:", response.status);

      // Robust response handling: derive message even if body is empty or non-JSON
      let message = data?.message;
      if (!message) {
        try {
          const text = await response.clone().text();
          message = text || `HTTP ${response.status} ${response.statusText}`;
        } catch {
          message = `HTTP ${response.status} ${response.statusText}`;
        }
      }

      if (!response.ok) {
        toast.error(message || "Check-in failed");
        console.warn("Check-in API error:", {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        setLoading(false);
        return;
      }

      if (data?.success) {
        toast.success(data.message || "Check-in successful");

        // Update validation result
        setValidationResult((prev) => ({
          ...prev,
          checkedIn: true,
          checkinTime: new Date().toISOString(),
          agendaCheckedIn: agendaId
            ? (prev.agendaCheckedIn || prev.agenda_checked_in || []).concat(agendaId)
            : prev.agendaCheckedIn || prev.agenda_checked_in || [],
        }));

        // Refresh event data if it's an event check-in
        if (validationResult.qrType === "EVENT_CHECKIN" && validationResult.token) {
          try {
            const eventResponse = await fetch(`/api/check-in/validate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                qrValue: {
                  type: "EVENT_CHECKIN",
                  token: validationResult.token,
                },
              }),
            });

            const eventData = await eventResponse.json();
            if (eventData.success && eventData.data) {
              setSelectedEvent(eventData.data.event);
              // Update validation result with fresh data
              setValidationResult((prev) => ({
                ...prev,
                ...eventData.data,
                checkedIn: true,
                checkinTime: new Date().toISOString(),
              }));
            }
          } catch (refreshError) {
            console.error("Error refreshing event data:", refreshError);
            // Don't show error to user, check-in was successful
          }
        }
      } else {
        toast.error(data?.message || message || "Check-in failed");
        console.warn("Check-in failed:", { data, status: response.status });
      }
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error(error.message || "Check-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle agenda expansion
  const toggleAgenda = (agendaId) => {
    setExpandedAgenda(expandedAgenda === agendaId ? null : agendaId);
  };

  // Clear validation result
  const clearResult = () => {
    setValidationResult(null);
    setSelectedEvent(null);
    setManualInput({ type: "event_token", value: "" });
    setExpandedAgenda(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // Preload QrScanner library when component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && !QrScanner) {
      import("qr-scanner")
        .then((module) => {
          QrScanner = module.default || module.QrScanner || module;
          console.log("QR Scanner library loaded successfully");
        })
        .catch((error) => {
          console.error("Failed to preload QR Scanner:", error);
        });
    }
  }, []);

  // Initialize scanner when video element becomes available
  useEffect(() => {
    if (scanning && videoRef.current && !qrScannerRef.current && QrScanner) {
      const initializeScanner = async () => {
        try {
          // Stop any existing scanner
          if (qrScannerRef.current) {
            try {
              qrScannerRef.current.stop();
              qrScannerRef.current.destroy();
            } catch (e) {
              // Ignore cleanup errors
            }
            qrScannerRef.current = null;
          }

          // Small delay to ensure video element is fully ready
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Double-check video element is still available
          if (!videoRef.current) {
            throw new Error("Video element not available");
          }

          // Initialize QR Scanner
          qrScannerRef.current = new QrScanner(
            videoRef.current,
            (result) => {
              console.log("QR Scan result received:", result);
              
              // qr-scanner library returns the result directly as a string
              // or as an object with data property depending on configuration
              let qrData = null;
              
              if (typeof result === 'string') {
                qrData = result;
              } else if (result && typeof result === 'object') {
                // Handle different possible result formats
                qrData = result.data || result.rawValue || result.text || result.result || JSON.stringify(result);
              } else {
                console.error("Unexpected scan result format:", result);
                toast.error("Invalid QR code scan result format");
                return;
              }
              
              if (qrData) {
                console.log("Processing QR data:", qrData);
                handleQRScan(qrData);
              } else {
                console.error("No QR data found in result:", result);
                toast.error("Invalid QR code scan result");
              }
            },
            {
              preferredCamera: "environment",
              highlightScanRegion: true,
              highlightCodeOutline: true,
              returnDetailedScanResult: false, // Set to false to get direct string result
              maxScansPerSecond: 10,
            }
          );

          // Start the scanner
          await qrScannerRef.current.start();
          toast.success("Scanner started. Point camera at QR code.");
        } catch (error) {
          console.error("Error initializing scanner in useEffect:", error);
          setCameraError(error.message || "Failed to start scanner");
          toast.error(error.message || "Camera access failed");
          setScanning(false);

          // Clean up on error
          if (qrScannerRef.current) {
            try {
              qrScannerRef.current.stop();
              qrScannerRef.current.destroy();
            } catch (e) {
              console.error("Error cleaning up scanner:", e);
            }
            qrScannerRef.current = null;
          }

          // Stop any existing streams
          if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
          }
        }
      };

      initializeScanner();
    }

    return () => {
      // Cleanup when scanning becomes false
      if (!scanning && qrScannerRef.current) {
        try {
          qrScannerRef.current.stop();
          qrScannerRef.current.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
        qrScannerRef.current = null;
      }
    };
  }, [scanning]);

  // Device type indicator
  const DeviceIcon = () => {
    if (deviceType === "mobile") return <Mobile className="w-4 h-4" />;
    if (deviceType === "tablet") return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-4 lg:p-6">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      

      <div className="mx-auto space-y-4 md:space-y-6">
        {/* HEADER - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#03215F] to-[#03215F] shadow-lg">
                <QrCode className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                  Event Check-in
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm md:text-base text-gray-600">
                    Scan QR codes or enter tokens
                  </p>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
                    <DeviceIcon />
                    {deviceType === "mobile"
                      ? "Mobile"
                      : deviceType === "tablet"
                      ? "Tablet"
                      : "Desktop"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto mt-4 lg:mt-0">
            <div className="flex bg-gray-100 rounded-lg md:rounded-xl p-0.5 md:p-1">
              <button
                onClick={() => {
                  setMode("qr");
                  clearResult();
                  stopScanner();
                }}
                className={`flex-1 lg:flex-none px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center justify-center gap-1 md:gap-2 transition-all text-sm md:text-base ${
                  mode === "qr"
                    ? "bg-white shadow-sm"
                    : "hover:bg-gray-200"
                }`}
              >
                <QrCode className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">QR Scanner</span>
                <span className="sm:hidden">QR</span>
              </button>
              <button
                onClick={() => {
                  setMode("manual");
                  clearResult();
                  stopScanner();
                }}
                className={`flex-1 lg:flex-none px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center justify-center gap-1 md:gap-2 transition-all text-sm md:text-base ${
                  mode === "manual"
                    ? "bg-white shadow-sm"
                    : "hover:bg-gray-200"
                }`}
              >
                <Hash className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Manual Entry</span>
                <span className="sm:hidden">Manual</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* MAIN CONTENT - Mobile Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* LEFT PANEL - Scanner/Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl md:rounded-2xl shadow-lg border border-gray-200/50 p-4 md:p-6">
              {/* Mode Toggle */}
              <div className="mb-4 md:mb-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    {mode === "qr" ? "QR Code Scanner" : "Manual Check-in"}
                  </h2>
                  {mode === "qr" && (
                    <button
                      onClick={() => {
                        setMode("manual");
                        clearResult();
                      }}
                      className="text-sm text-[#03215F] hover:text-[#03215F] flex items-center gap-1"
                    >
                      <Key className="w-3 h-3" />
                      Switch to Manual
                    </button>
                  )}
                </div>

                {mode === "qr" ? (
                  <div className="space-y-4">
                    {!scanning ? (
                      <div className="space-y-3">
                        <button
                          onClick={startScanner}
                          disabled={!hasCamera}
                          className="w-full py-3 md:py-4 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 md:gap-3"
                        >
                          <Camera className="w-4 h-4 md:w-5 md:h-5" />
                          {hasCamera
                            ? "Start QR Scanner"
                            : "No Camera Available"}
                        </button>

                        {!hasCamera && (
                          <div className="p-3 bg-[#b8352d] border border-[#b8352d] rounded-lg">
                            <div className="flex items-start gap-2">
                              <CameraOff className="w-4 h-4 text-[#b8352d] mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-[#b8352d]">
                                  Camera Not Available
                                </p>
                                <p className="text-xs text-[#b8352d] mt-1">
                                  This device doesn't have a camera. Please use
                                  manual entry mode instead.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="p-3 bg-[#9cc2ed] border border-[#9cc2ed] rounded-lg">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-[#9cc2ed] mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-[#03215F]">
                                Camera Tips
                              </p>
                              <ul className="text-xs text-[#03215F] mt-1 space-y-1">
                                <li>• Ensure good lighting</li>
                                <li>• Hold device steady</li>
                                <li>• Position QR code within frame</li>
                                <li>• Allow camera permissions if prompted</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-sm text-gray-600">
                            Point camera at QR code
                          </p>
                          <button
                            onClick={stopScanner}
                            className="px-3 py-1.5 bg-[#b8352d] text-white rounded-lg hover:bg-[#b8352d] transition-colors text-sm flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Stop
                          </button>
                        </div>

                        <div className="relative rounded-xl overflow-hidden border-4 border-[#03215F] bg-black">
                          <video
                            ref={videoRef}
                            className="w-full h-[300px] md:h-[400px] object-cover"
                            playsInline
                            muted
                            autoPlay
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-48 h-48 md:w-64 md:h-64 border-2 border-white/50 rounded-lg"></div>
                          </div>
                          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                              <Scan className="w-4 h-4 text-white animate-pulse" />
                              <span className="text-xs text-white">
                                Scanning...
                              </span>
                            </div>
                          </div>
                        </div>

                        {cameraError && (
                          <div className="mt-3 p-3 bg-[#b8352d] border border-[#b8352d] rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-[#b8352d] mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-[#b8352d]">
                                  Camera Error
                                </p>
                                <p className="text-xs text-[#b8352d] mt-1">
                                  {cameraError}
                                </p>
                                <button
                                  onClick={() => {
                                    setCameraError(null);
                                    setMode("manual");
                                  }}
                                  className="mt-2 text-xs text-[#03215F] hover:text-[#03215F]"
                                >
                                  Switch to manual entry →
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 md:space-y-6">
                    {/* Input Type Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          setManualInput({
                            ...manualInput,
                            type: "event_token",
                          })
                        }
                        className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
                          manualInput.type === "event_token"
                            ? "border-[#03215F] bg-[#9cc2ed]"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              manualInput.type === "event_token"
                                ? "bg-[#03215F] text-white"
                                : "bg-gray-200"
                            }`}
                          >
                            <Ticket className="w-3 h-3 md:w-4 md:h-4" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-sm md:text-base">
                              Event Token
                            </p>
                            <p className="text-xs text-gray-600">
                              Alphanumeric Code
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() =>
                          setManualInput({
                            ...manualInput,
                            type: "membership_code",
                          })
                        }
                        className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
                          manualInput.type === "membership_code"
                            ? "border-[#03215F] bg-[#9cc2ed]"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              manualInput.type === "membership_code"
                                ? "bg-[#03215F] text-white"
                                : "bg-gray-200"
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3 md:w-4 md:h-4" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-sm md:text-base">
                              Membership Code
                            </p>
                            <p className="text-xs text-gray-600">
                              Verify membership
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Input Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {manualInput.type === "event_token"
                          ? "Event Token"
                          : "Membership Code"}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={manualInput.value}
                          onChange={(e) =>
                            setManualInput({
                              ...manualInput,
                              value: e.target.value,
                            })
                          }
                          placeholder={
                            manualInput.type === "event_token"
                              ? "Enter Alphanumeric Code..."
                              : "Enter membership code..."
                          }
                          className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent text-sm md:text-base"
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleManualValidate()
                          }
                        />
                        <button
                          onClick={handleManualValidate}
                          disabled={loading || !manualInput.value.trim()}
                          className="px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">Validate</span>
                          <span className="sm:hidden">Go</span>
                        </button>
                      </div>
                      {manualInput.type === "event_token" &&
                        manualInput.value && (
                          <p className="mt-1 text-xs text-gray-500">
                            Format: 6 characters (e.g., ABC123)
                          </p>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* Validation Result */}
                  {validationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 md:mt-6 p-3 md:p-4 rounded-xl border ${
                    validationResult.valid
                      ? "border-[#AE9B66] bg-[#AE9B66]/30"
                      : "border-[#b8352d] bg-[#b8352d]/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-1.5 md:p-2 rounded-full ${
                          validationResult.valid
                            ? "bg-[#AE9B66]/30"
                            : "bg-[#b8352d]/30"
                        }`}
                      >
                        {validationResult.valid ? (
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-[#AE9B66]" />
                        ) : (
                          <XCircle className="w-4 h-4 md:w-5 md:h-5 text-[#b8352d]" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                          {validationResult.qrType === "EVENT_CHECKIN"
                            ? "Event Check-in"
                            : "Membership Verification"}
                        </h3>
                        <p
                          className={`text-xs md:text-sm ${
                            validationResult.valid
                              ? "text-[#AE9B66]"
                              : "text-[#b8352d]"
                          }`}
                        >
                          {validationResult.valid ? "Valid" : "Invalid"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={clearResult}
                      className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                      aria-label="Clear result"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {validationResult.valid &&
                    validationResult.qrType === "EVENT_CHECKIN" && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                          <span className="text-xs md:text-sm text-gray-700">
                            {validationResult.user_name} (
                            {validationResult.user_email})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ticket className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                          <span className="text-xs md:text-sm text-gray-700">
                            Token:{" "}
                            <span className="font-mono font-semibold">
                              {validationResult.token}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                          <span className="text-xs md:text-sm text-gray-700">
                            Payment: {" "}
                            <span
                              className={
                                validationResult.payment_status === "paid"
                                  ? "text-[#AE9B66] font-medium"
                                  : validationResult.payment_status === "pending"
                                  ? "text-orange-600 font-medium"
                                  : "text-gray-700"
                              }
                            >
                              {validationResult.payment_status === "paid"
                                ? "Paid"
                                : validationResult.payment_status === "pending"
                                ? "Payment Pending"
                                : "Free"}
                            </span>
                          </span>
                        </div>
                        {validationResult.checkedIn && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-[#AE9B66]" />
                            <span className="text-xs md:text-sm text-[#AE9B66]">
                              {validationResult.checkinTime || validationResult.checked_in_at ? (
                                <>
                                  Checked in at{" "}
                                  {new Date(
                                    validationResult.checkinTime || validationResult.checked_in_at
                                  ).toLocaleTimeString("en-BH", { timeZone: 'Asia/Bahrain' })}
                                </>
                              ) : (
                                "Checked in"
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                  {validationResult.valid &&
                    validationResult.qrType === "MEMBERSHIP_VERIFICATION" && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                          <span className="text-xs md:text-sm text-gray-700">
                            {validationResult.member_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                          <span className="text-xs md:text-sm text-gray-700">
                            Type:{" "}
                            <span className="font-medium">
                              {validationResult.member_type}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                          <span
                            className={`text-xs md:text-sm ${
                              new Date(validationResult.expiry_date) >
                              new Date()
                                ? "text-[#AE9B66]"
                                : "text-[#b8352d]"
                            }`}
                          >
                            Expires:{" "}
                            {formatDateBH(validationResult.expiry_date)}
                            {new Date(validationResult.expiry_date) <
                              new Date() && " (Expired)"}
                          </span>
                        </div>
                      </div>
                    )}

                  {!validationResult.valid && (
                    <div className="mt-3">
                      <p className="text-xs md:text-sm text-[#b8352d]">
                        {validationResult.error || "Validation failed"}
                      </p>
                      <button
                        onClick={() => {
                          setMode("manual");
                          setManualInput({
                            type:
                              validationResult.qrType === "EVENT_CHECKIN"
                                ? "event_token"
                                : "membership_code",
                            value: "",
                          });
                        }}
                        className="mt-2 text-xs text-[#03215F] hover:text-[#03215F]"
                      >
                        Try manual entry →
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="mt-4 md:mt-6 flex items-center justify-center py-4 md:py-8">
                  <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-[#03215F] animate-spin" />
                  <span className="ml-3 text-sm md:text-base text-gray-600">
                    Processing...
                  </span>
                </div>
              )}
            </div>

            {/* Event Details */}
            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 md:mt-6 bg-gradient-to-br from-white to-gray-50 rounded-xl md:rounded-2xl shadow-lg border border-gray-200/50 p-4 md:p-6"
              >
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                  Event Details
                </h2>

                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start gap-3 md:gap-4">
                    {selectedEvent.banner_url && (
                      <img
                        src={selectedEvent.banner_url}
                        alt={selectedEvent.title}
                        className="w-16 h-16 md:w-24 md:h-24 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 capitalize line-clamp-2">
                        {selectedEvent.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">
                        {selectedEvent.description ||
                          "No description available"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1 md:space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                        <span className="text-xs md:text-sm text-gray-700">
                          {formatDateBH(selectedEvent.start_datetime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                        <span className="text-xs md:text-sm text-gray-700">
                          {formatTimeBH(selectedEvent.start_datetime)}
                          {selectedEvent.end_datetime &&
                            ` - ${formatTimeBH(selectedEvent.end_datetime)}`}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 md:space-y-2">
                      {selectedEvent.venue_name && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                          <span className="text-xs md:text-sm text-gray-700 line-clamp-1">
                            {selectedEvent.venue_name}
                            {selectedEvent.city && `, ${selectedEvent.city}`}
                          </span>
                        </div>
                      )}
                      {selectedEvent.capacity && (
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                          <span className="text-xs md:text-sm text-gray-700">
                            Capacity: {selectedEvent.capacity}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* RIGHT PANEL - Check-in Actions (Hidden on mobile when not needed) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            {/* Check-in Actions */}
            {validationResult && validationResult.valid && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl md:rounded-2xl shadow-lg border border-gray-200/50 p-4 md:p-6 mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                  Check-in Actions
                </h2>

                {validationResult.qrType === "EVENT_CHECKIN" && (
                  <div className="space-y-3 md:space-y-4">
                    {/* Main Event Check-in */}
                    {!validationResult.checkedIn ? (
                      <button
                        onClick={() => handleCheckIn()}
                        disabled={
                          loading ||
                          (validationResult.is_paid_event &&
                            (!validationResult.price_paid ||
                              validationResult.price_paid <= 0))
                        }
                        className="w-full py-2.5 md:py-3 bg-gradient-to-r  from-[#AE9B66] to-[#AE9B66] text-white rounded-xl font-medium hover:from-[#AE9B66] hover:to-[#AE9B66] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base"
                      >
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                        Check-in to Event
                      </button>
                    ) : (
                      <div className="p-3 md:p-4 bg-green-500/30 border border-green-500 rounded-xl">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                          <span className="text-green-500 font-medium text-sm md:text-base">
                            Already Checked In
                          </span>
                        </div>
                        {(validationResult.checkinTime || validationResult.checked_in_at) && (
                          <p className="text-xs md:text-sm text-gray-800 mt-1">
                            {formatDateBH(validationResult.checkinTime || validationResult.checked_in_at)} at{" "}
                            {formatTimeBH(validationResult.checkinTime || validationResult.checked_in_at)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Event Agendas */}
                    {selectedEvent?.event_agendas &&
                      selectedEvent.event_agendas.length > 0 && (
                        <div className="mt-4 md:mt-6">
                          <div className="flex items-center justify-between mb-2 md:mb-3">
                            <h3 className="font-medium text-gray-700 text-sm md:text-base">
                              Event Agendas
                            </h3>
                            <span className="text-xs text-gray-500">
                              {
                                selectedEvent.event_agendas.filter(
                                  (a) =>
                                    new Date(a.agenda_date).toDateString() ===
                                    new Date().toDateString()
                                ).length
                              }{" "}
                              today
                            </span>
                          </div>
                          <div className="space-y-2 md:space-y-3 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1">
                            {selectedEvent.event_agendas.map((agenda) => {
                              const checkedIds = validationResult.agendaCheckedIn || validationResult.agenda_checked_in || [];
                              const isCheckedIn = checkedIds.includes(agenda.id);
                              const isToday =
                                new Date(agenda.agenda_date).toDateString() ===
                                new Date().toDateString();
                              const isPast =
                                new Date(agenda.agenda_date) < new Date();

                              return (
                                <div
                                  key={agenda.id}
                                  className={`p-2 md:p-3 rounded-xl border ${
                                    isCheckedIn
                                      ? "border-[#AE9B66] bg-[#AE9B66]/30"
                                      : isToday
                                      ? "border-[#9cc2ed] bg-[#9cc2ed]/30"
                                      : "border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1 mb-1">
                                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                                          {agenda.title}
                                        </h4>
                                        {isToday && !isCheckedIn && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[#9cc2ed] text-[#03215F]">
                                            Today
                                          </span>
                                        )}
                                        {isCheckedIn && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[#AE9B66] text-white">
                                            Checked In
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs text-gray-600">
                                          {formatDateBH(agenda.agenda_date)}
                                          {agenda.start_time &&
                                            ` • ${agenda.start_time.substring(
                                              0,
                                              5
                                            )}`}
                                          {agenda.end_time &&
                                            ` - ${agenda.end_time.substring(
                                              0,
                                              5
                                            )}`}
                                        </span>
                                      </div>
                                    </div>

                                    {agenda.description && (
                                      <button
                                        onClick={() => toggleAgenda(agenda.id)}
                                        className="p-1 hover:bg-gray-200 rounded-lg ml-1"
                                      >
                                        {expandedAgenda === agenda.id ? (
                                          <ChevronUp className="w-3 h-3 md:w-4 md:h-4" />
                                        ) : (
                                          <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                                        )}
                                      </button>
                                    )}
                                  </div>

                                  {expandedAgenda === agenda.id &&
                                    agenda.description && (
                                      <p className="mt-2 text-xs text-gray-600">
                                        {agenda.description}
                                      </p>
                                    )}

                                  {!isCheckedIn && isToday && !isPast && (
                                    <button
                                      onClick={() => handleCheckIn(agenda.id)}
                                      disabled={
                                        loading ||
                                        (validationResult.is_paid_event &&
                                          (!validationResult.price_paid ||
                                            validationResult.price_paid <= 0))
                                      }
                                      className="mt-2 w-full py-1.5 bg-gradient-to-r from-[#9cc2ed] to-[#03215F] text-white rounded-lg text-xs font-medium hover:from-[#03215F] hover:to-[#03215F] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-1"
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                      Check-in to Agenda
                                    </button>
                                  )}

                                  {isCheckedIn && (
                                    <div className="mt-2 flex items-center gap-1 text-[#AE9B66] text-xs">
                                      <CheckCircle className="w-3 h-3" />
                                      <span>Checked in</span>
                                    </div>
                                  )}

                                  {isPast && !isCheckedIn && (
                                    <div className="mt-2 flex items-center gap-1 text-gray-500 text-xs">
                                      <Clock className="w-3 h-3" />
                                      <span>Agenda passed</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {validationResult.qrType === "MEMBERSHIP_VERIFICATION" && (
                  <div className="space-y-3 md:space-y-4">
                    <div className="p-3 md:p-4 bg-[#9cc2ed]/30 border border-[#9cc2ed] rounded-xl">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                        <span className="font-medium text-[#03215F] text-sm md:text-base">
                          Membership Verified
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 mt-2">
                        This member can join any event by scanning the event's
                        QR code.
                      </p>
                    </div>

                    {new Date(validationResult.expiry_date) < new Date() && (
                      <div className="p-3 md:p-4 bg-[#b8352d] border border-[#b8352d] rounded-xl">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-[#b8352d]" />
                          <span className="font-medium text-[#b8352d] text-sm md:text-base">
                            Membership Expired
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 mt-2">
                          Membership expired on{" "}
                          {formatDateBH(validationResult.expiry_date)}. Member
                          may need to renew to join paid events.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl md:rounded-2xl shadow-lg border border-gray-200/50 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-[#03215F]" />
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                  How to Use
                </h2>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 rounded-lg bg-[#9cc2ed] flex-shrink-0">
                      <QrCode className="w-3 h-3 md:w-4 md:h-4 text-[#03215F]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">
                        QR Scanner
                      </h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                        Scan event QR codes or membership cards for quick
                        validation and check-in.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 rounded-lg bg-[#AE9B66] flex-shrink-0">
                      <Hash className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">
                        Manual Entry
                      </h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                        Enter event tokens or membership codes manually when QR
                        codes are unavailable.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 rounded-lg bg-[#03215F] flex-shrink-0">
                      <Users className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">
                        Multi-day Events
                      </h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                        Check-in separately for each day's agenda. Today's
                        agendas are highlighted.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 rounded-lg bg-[#b8352d] flex-shrink-0">
                      <Shield className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">
                        Membership Check
                      </h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                        Verify membership status and expiry date before event
                        check-in.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
