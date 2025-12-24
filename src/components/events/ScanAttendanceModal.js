"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  QrCode,
  ScanLine,
  Camera,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Tag,
  Clock,
  Loader2,
  CameraOff,
  AlertCircle,
  Scan,
} from "lucide-react";
import toast from "react-hot-toast";

// QrScanner will be imported dynamically when needed
let QrScanner = null;

export default function ScanAttendanceModal({ event, onClose, onScan, scanning }) {
  const [mode, setMode] = useState("manual"); // manual or camera
  const [tokenInput, setTokenInput] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");
  const [scanningActive, setScanningActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [hasCamera, setHasCamera] = useState(true);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Handle manual token submission
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError("Please enter a token");
      return;
    }

    setError("");
    const result = await onScan(tokenInput.trim());
    if (result.success) {
      setScanResult(result.data);
      setTokenInput("");
      setTimeout(() => {
        setScanResult(null);
      }, 3000);
    } else {
      setError(result.message);
    }
  };

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

  // Preload QrScanner library
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

  // Start QR scanner
  const startScanner = async () => {
    try {
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

      setScanningActive(true);
      setCameraError(null);
      setMode("camera");
    } catch (error) {
      console.error("Error starting scanner:", error);
      setCameraError(error.message || "Failed to start scanner");
      toast.error(error.message || "Camera access failed");
      setScanningActive(false);
    }
  };

  // Initialize scanner when camera mode is active and video element is ready
  useEffect(() => {
    if (scanningActive && mode === "camera" && videoRef.current && !qrScannerRef.current && QrScanner) {
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
              // Handle different result formats
              let qrData = null;
              
              if (typeof result === 'string') {
                qrData = result;
              } else if (result && typeof result === 'object') {
                qrData = result.data || result.rawValue || result.text || result.result || JSON.stringify(result);
              }
              
              if (qrData) {
                console.log("QR Scan result:", qrData);
                handleQRScan(qrData);
              } else {
                console.error("Invalid scan result:", result);
                toast.error("Invalid QR code scan result");
              }
            },
            {
              preferredCamera: "environment",
              highlightScanRegion: true,
              highlightCodeOutline: true,
              returnDetailedScanResult: false,
              maxScansPerSecond: 10,
            }
          );

          // Start the scanner
          await qrScannerRef.current.start();
          toast.success("Scanner started. Point camera at QR code.");
        } catch (error) {
          console.error("Error initializing scanner:", error);
          setCameraError(error.message || "Failed to start scanner");
          toast.error(error.message || "Camera access failed");
          setScanningActive(false);
          setMode("manual");

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
      if (!scanningActive && qrScannerRef.current) {
        try {
          qrScannerRef.current.stop();
          qrScannerRef.current.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
        qrScannerRef.current = null;
      }
    };
  }, [scanningActive, mode]);

  // Handle QR scan result
  const handleQRScan = async (qrData) => {
    stopScanner();

    try {
      // Parse QR data - handle both string and object formats
      let token = null;
      
      if (typeof qrData === 'string') {
        try {
          const parsed = JSON.parse(qrData);
          // If it's a JSON object with token field
          if (parsed.token) {
            token = parsed.token;
          } else if (parsed.type === "EVENT_CHECKIN" && parsed.token) {
            token = parsed.token;
          } else {
            // Treat as plain token
            token = qrData.trim().toUpperCase();
          }
        } catch (parseError) {
          // If it's not JSON, treat it as a plain token
          token = qrData.trim().toUpperCase();
        }
      } else if (qrData && typeof qrData === 'object') {
        token = qrData.token || qrData.data || qrData;
      } else {
        token = String(qrData).trim().toUpperCase();
      }

      if (token) {
        setTokenInput(token);
        // Automatically submit the scan
        const result = await onScan(token);
        if (result.success) {
          setScanResult(result.data);
          setError("");
          setTimeout(() => {
            setScanResult(null);
            // Restart scanner for next scan
            if (mode === "camera") {
              setTimeout(() => startScanner(), 1000);
            }
          }, 3000);
        } else {
          setError(result.message || "Scan failed");
          // Restart scanner for retry
          if (mode === "camera") {
            setTimeout(() => startScanner(), 2000);
          }
        }
      } else {
        toast.error("Invalid QR code format");
        setError("Invalid QR code format. Please scan a valid event token.");
        // Restart scanner
        if (mode === "camera") {
          setTimeout(() => startScanner(), 2000);
        }
      }
    } catch (error) {
      console.error("QR scan error:", error);
      toast.error("Scan failed. Please try again.");
      setError("Scan failed. Please try again or use manual entry.");
      // Restart scanner
      if (mode === "camera") {
        setTimeout(() => startScanner(), 2000);
      }
    }
  };

  // Stop camera and scanner
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

    setScanningActive(false);
    setCameraError(null);
  };

  // Handle modal close
  const handleClose = () => {
    stopScanner();
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Scan Attendance
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {event?.title}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                stopScanner();
                setMode("manual");
              }}
              className={`flex-1 px-4 py-2.5 rounded-xl transition-all ${
                mode === "manual"
                  ? "bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">Manual Entry</span>
              </div>
            </button>
            <button
              onClick={startScanner}
              disabled={!hasCamera}
              className={`flex-1 px-4 py-2.5 rounded-xl transition-all ${
                mode === "camera"
                  ? "bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-center gap-2">
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {hasCamera ? "Camera Scan" : "No Camera"}
                </span>
              </div>
            </button>
          </div>

          {/* Manual Entry */}
          {mode === "manual" && (
            <form onSubmit={handleManualSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Token
                  </label>
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Scan or enter 6-digit token"
                    className="w-full px-4 py-3 text-center text-xl font-mono tracking-widest bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#03215F] focus:border-transparent uppercase"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-[#b8352d] border border-[#b8352d]">
                    <div className="flex items-center gap-2 text-[#b8352d]">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {scanResult && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#AE9B66] to-[#AE9B66] border border-[#AE9B66]/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-[#AE9B66]">
                        <CheckCircle className="w-6 h-6 text-[#AE9B66]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#AE9B66]">
                          Check-in Successful!
                        </p>
                        <p className="text-sm text-[#AE9B66]">
                          {formatTime(new Date())}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{scanResult.event_members?.users?.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Tag className="w-4 h-4" />
                        <span className="font-mono">{scanResult.event_members?.token}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={scanning || !tokenInput.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#AE9B66] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-4 h-4" />
                      Scan Token
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Camera Scan */}
          {mode === "camera" && (
            <div className="space-y-4">
              {!scanningActive ? (
                <div className="text-center py-8">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Click the button below to start scanning
                  </p>
                  <button
                    onClick={startScanner}
                    disabled={!hasCamera}
                    className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#AE9B66] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#AE9B66] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                  >
                    <Camera className="w-4 h-4" />
                    Start Scanner
                  </button>
                  {!hasCamera && (
                    <p className="text-xs text-[#b8352d] mt-2">
                      No camera available. Please use manual entry.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="relative rounded-xl overflow-hidden border-4 border-[#03215F] bg-black">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover"
                      playsInline
                      muted
                      autoPlay
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-white/50 rounded-lg"></div>
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                        <Scan className="w-4 h-4 text-white animate-pulse" />
                        <span className="text-xs text-white">Scanning...</span>
                      </div>
                    </div>
                  </div>

                  {cameraError && (
                    <div className="p-3 rounded-lg bg-[#b8352d] border border-[#b8352d]">
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

                  <p className="text-sm text-center text-gray-600">
                    Position QR code within frame to scan
                  </p>

                  <button
                    onClick={stopScanner}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#b8352d] to-[#b8352d] text-white rounded-xl font-medium hover:from-[#b8352d] hover:to-[#b8352d] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Stop Scanner
                  </button>
                </>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              Tips:
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Ensure good lighting when using camera scan</li>
              <li>• Tokens are case-insensitive</li>
              <li>• Members can check-in multiple times (logs will show)</li>
              <li>• First check-in updates member's status</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function formatTime(date) {
  return date.toLocaleTimeString('en-BH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}