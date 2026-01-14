"use client";

import { ArrowRight, Calendar, Shield, Sparkles, QrCode, LogIn, UserPlus, BadgeCheck, Printer, X, Clock, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Modal from "@/components/Modal";
import LoginModal from "@/components/modals/LoginModal";
import { motion, AnimatePresence } from "framer-motion";

// MembershipCard Component
function MembershipCard({ user, qrRef }) {
  if (!user) return null;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-BH", {
        month: "numeric",
        year: "numeric",
      })
      : "N/A";

  const qrValue = JSON.stringify({
    type: "MEMBERSHIP_VERIFICATION",
    membership_id: user.membership_code,
    member_name: user.full_name,
    member_type: user.membership_type,
    expiry_date: user.membership_expiry_date,
  });

  return (
    <div
      className="
      bg-gradient-to-br from-[#03215F] to-[#03215F]
      relative w-full max-w-md mx-auto
      rounded-2xl shadow-2xl text-white
      overflow-hidden
      p-4 sm:p-5 md:p-6
      min-h-[220px] sm:min-h-[250px]
      flex flex-col justify-between
    "
    >
      {/* Glow Background */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#03215F]/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#03215F]/20 blur-3xl rounded-full" />

      {/* Header */}
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg p-1">
            <img
              src="/logo.png"
              alt="BDS Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              crossOrigin="anonymous"
            />
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase leading-tight">
              Bahrain Dental Society
            </h3>
            <p className="text-[10px] text-[#9cc2ed] tracking-widest uppercase mt-2">
              Official Member  
              {user.is_member_verified && (
                <span className="inline-flex ml-2 items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                  <Shield className="w-2.5 h-2.5" />
                  Verified
                </span>
              )}
            </p>
          </div>
        </div>

        <span
          className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase
          rounded-full ${user.membership_status === "active"
              ? "bg-green-600/20 border border-green-600/30 text-green-600"
              : "bg-[#b8352d]/20 border border-[#b8352d]/30 text-[#b8352d]"
            }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${user.membership_status === "active"
                ? "bg-green-600 animate-pulse"
                : "bg-[#b8352d]"
              }`}
          />
          {user.membership_status || "Active"}
        </span>
      </div>

      {/* Body */}
      <div className="relative flex justify-between items-end mt-4 gap-3">
        <div className="flex-1">
          <p className="text-[10px] text-slate-300 uppercase">Member Name</p>
          <div className="flex items-center gap-2">
            <h2 className="font-bold leading-tight text-[clamp(14px,4vw,18px)] truncate uppercase">
              {user.full_name}
            </h2>

          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <p className="text-[10px] text-slate-300 uppercase">Member ID</p>
              <p className="text-xs sm:text-sm font-mono truncate">
                {user.membership_code || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-300 uppercase">Expires</p>
              <p className="text-xs sm:text-sm font-mono">
                {formatDate(user.membership_expiry_date)}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-[10px] text-slate-300 uppercase">Type</p>
            <p className="text-xs sm:text-sm text-[gold] font-medium uppercase">
              {user.current_subscription_plan_display_name
                ? user.current_subscription_plan_display_name
                : user.current_subscription_plan_name
                  ? user.current_subscription_plan_name
                  : user.membership_type === "paid"
                    ? "Paid Plan"
                    : "Free Plan"}
            </p>
          </div>
        </div>

        {/* QR Code */}
        <div ref={qrRef} className="bg-white rounded-lg p-1 shrink-0">
          <QRCodeCanvas value={qrValue} size={95} level="H" includeMargin />
        </div>
      </div>
    </div>
  );
}
const CARD_HEIGHT =
  "min-h-[240px] sm:min-h-[260px] md:min-h-[280px]";

export default function HeroSection() {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const videoRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const qrRef = useRef(null);
  const qrBackRef = useRef(null);
  const [showJoinChoice, setShowJoinChoice] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [badgeFormData, setBadgeFormData] = useState({ event_id: '', email: '' });
  const [badgeVerifying, setBadgeVerifying] = useState(false);
  const [badgeData, setBadgeData] = useState(null);
  const [badgeStatus, setBadgeStatus] = useState(null);
  const [badgeEvents, setBadgeEvents] = useState([]);
  const [heroSettings, setHeroSettings] = useState({
    video_url: '/file.mp4',
    poster_url: '/bgn.png',
  });

  // Dummy member data for non-logged-in or non-paid members
  const dummyMemberData = {
    full_name: "DR. ABBAS AlFardan",
    membership_code: "BDS-XXXX-XXXX",
    membership_expiry_date: "2029-12-31",
    membership_type: "paid",
    membership_status: "active",
    current_subscription_plan_name: "Active Membership"
  };

  // Prevent hydration mismatch by only rendering client-side content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch hero settings (video URL, poster URL)
  useEffect(() => {
    const fetchHeroSettings = async () => {
      try {
        const res = await fetch('/api/site-settings/hero');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setHeroSettings({
              video_url: data.video_url || '/file.mp4',
              poster_url: data.poster_url || '/bgn.png',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching hero settings:', error);
      }
    };
    fetchHeroSettings();
  }, []);

  // Check if user is logged in and has paid membership
  useEffect(() => {
    if (!mounted) return;

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.membership_type === "paid") {
            // Fetch full membership data
            const membershipRes = await fetch("/api/dashboard/membership-info", {
              credentials: "include",
            });

            if (membershipRes.ok) {
              const membershipData = await membershipRes.json();
              if (membershipData.success) {
                setUser(membershipData.user);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [mounted]);

  // Generate consistent particles on client only
  useEffect(() => {
    if (!mounted) return;

    const generatedParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 10 + Math.random() * 10,
    }));
    setParticles(generatedParticles);
  }, [mounted]);

  // Handle video playback safely
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.play().catch((error) => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  // Fetch events for badge modal
  const fetchBadgeEvents = async () => {
    try {
      const res = await fetch('/api/event/public');
      if (res.ok) {
        const data = await res.json();
        setBadgeEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Handle badge verification
  const handleBadgeVerify = async (e) => {
    e.preventDefault();
    if (!badgeFormData.event_id || !badgeFormData.email) return;

    setBadgeVerifying(true);
    setBadgeData(null);
    setBadgeStatus(null);

    try {
      // First try to get approved speaker badge
      const badgeRes = await fetch(`/api/speaker-badge/verify?event_id=${badgeFormData.event_id}&email=${encodeURIComponent(badgeFormData.email)}`);

      if (badgeRes.ok) {
        const data = await badgeRes.json();
        setBadgeData(data);
        setBadgeStatus('approved');
      } else {
        // Check if there's a pending/rejected request
        const checkRes = await fetch(`/api/events/speaker-request/check?event_id=${badgeFormData.event_id}&email=${encodeURIComponent(badgeFormData.email)}`);

        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData.exists) {
            setBadgeStatus(checkData.status);
          } else {
            setBadgeStatus('not_found');
          }
        } else {
          setBadgeStatus('not_found');
        }
      }
    } catch (error) {
      console.error('Error verifying badge:', error);
      setBadgeStatus('error');
    } finally {
      setBadgeVerifying(false);
    }
  };

  // Handle badge print
  const handleBadgePrint = () => {
    const printContent = document.getElementById('speaker-badge-print');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Speaker Badge - ${badgeData?.speaker?.full_name}</title>
          <style>
            @page { 
              size: 4in 6in; 
              margin: 0; 
            }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body { 
              margin: 0; 
              padding: 0; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
              background: #f5f5f5;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .badge { 
              width: 4in; 
              height: 6in; 
              background: #03215F !important;
              color: white !important; 
              padding: 20px; 
              box-sizing: border-box; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              text-align: center; 
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .badge-header { 
              font-size: 12px; 
              text-transform: uppercase; 
              letter-spacing: 2px; 
              margin-bottom: 10px; 
              color: white !important; 
            }
            .badge-title { 
              font-size: 28px; 
              font-weight: bold; 
              color:white !important; 
              margin-bottom: 20px; 
            }
            .badge-avatar {
              width: 80px;
              height: 80px;
              background: rgba(255,255,255,0.2) !important;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 15px;
              font-size: 32px;
              font-weight: bold;
              color: white !important;
            }
            .badge-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 8px; 
              color: white !important;
            }
            .badge-designation { 
              font-size: 14px; 
              color: white !important; 
              margin-bottom: 20px; 
            }
            .badge-event { 
              font-size: 16px; 
              margin-bottom: 8px; 
              border-top: 1px solid rgba(174, 155, 102, 0.5); 
              border-bottom: 1px solid rgba(174, 155, 102, 0.5); 
              padding: 15px 0; 
              width: 100%; 
              color: white !important;
              text-transform: capitalize;
            }
            .badge-date { 
              font-size: 12px; 
              color: white !important; 
              margin-bottom: 20px; 
            }
            .badge-qr { 
              background: white !important; 
              padding: 10px; 
              border-radius: 8px; 
              margin-bottom: 15px; 
            }
            .badge-footer { 
              font-size: 10px; 
              color: white !important; 
              margin-top: auto; 
            }
          </style>
        </head>
        <body>
          <div class="badge">
            <div class="badge-header">Bahrain Dental Society</div>
            <div class="badge-title">SPEAKER</div>
            <div class="badge-avatar">${badgeData?.speaker?.full_name?.charAt(0) || 'S'}</div>
            <div class="badge-name">${badgeData?.speaker?.full_name}</div>
            <div class="badge-designation">${badgeData?.speaker?.designation || 'Speaker'}</div>
            <div class="badge-event">${badgeData?.event?.title}</div>
            <div class="badge-date">${badgeData?.event?.start_datetime ? new Date(badgeData.event.start_datetime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</div>
            <div class="badge-qr">
              <img src="${document.querySelector('#speaker-badge-print canvas')?.toDataURL()}" width="100" height="100" />
            </div>
            <div class="badge-footer">www.bds.org.bh</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#AE9B66]/10 via-white to-[#AE9B66]/10">
      {/* Video Background Section */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Video Container */}
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
            poster={heroSettings.poster_url}
            key={heroSettings.video_url} // Force re-render when URL changes
          >
            <source src={heroSettings.video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 "></div>

          {/* Animated Particles Effect - Render only on client after mount */}
          {mounted && (
            <div className="absolute inset-0">
              {particles.length > 0
                ? particles.map((particle) => (
                  <div
                    key={particle.id}
                    className="absolute w-1 h-1 bg-[#AE9B66]/20 rounded-full animate-float"
                    style={{
                      left: `${particle.left}%`,
                      top: `${particle.top}%`,
                      animationDelay: `${particle.animationDelay}s`,
                      animationDuration: `${particle.animationDuration}s`,
                    }}
                  />
                ))
                : null}
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-[#AE9B66]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-tr from-[#AE9B66]/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="container relative z-10 mx-auto px-4 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 backdrop-blur-sm bg-white/30 rounded-2xl p-8 md:p-10 shadow-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#03215F]">
              Bahrain{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#AE9B66] to-[#AE9B66]">
                Dental
              </span>{" "}
              Society
            </h1>

            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Join Bahrain &apos; s premier dental community. Access exclusive events,
              continuous education, and professional networking opportunities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowJoinChoice(true)}
                className="group px-8 py-3 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white rounded-lg hover:shadow-xl hover:shadow-[#AE9B66]/30 transition-all duration-300 font-semibold flex items-center justify-center hover:scale-105 transform"
              >
                Become a Member
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/events")}
                className="px-8 py-3 border-2 border-[#AE9B66] text-[#AE9B66] rounded-lg hover:bg-[#AE9B66]/10 transition-all duration-300 font-semibold flex items-center justify-center hover:scale-105 transform"
              >
                <Calendar className="mr-2 w-5 h-5" />
                View Events
              </button>

              <button
                onClick={() => {
                  setIsBadgeModalOpen(true);
                  setBadgeFormData({ event_id: '', email: '' });
                  setBadgeData(null);
                  setBadgeStatus(null);
                  fetchBadgeEvents();
                }}
                className="group px-3 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:shadow-xl hover:shadow-[#03215F]/30 transition-all duration-300 font-semibold flex items-center justify-center hover:scale-105 transform"
              >
                <BadgeCheck className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                Speaker Badge
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20">
                <div className="text-2xl font-bold text-[#AE9B66]">350+</div>
                <div className="text-sm text-gray-600">
                  Members
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20">
                <div className="text-2xl font-bold text-[#AE9B66]">50+</div>
                <div className="text-sm text-gray-600">
                  Events
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20">
                <div className="text-2xl font-bold text-[#AE9B66]">100+</div>
                <div className="text-sm text-gray-600">
                  CME Certificate
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20">
                <div className="text-2xl font-bold text-[#AE9B66]">30+</div>
                <div className="text-sm text-gray-600">
                  Years
                </div>
              </div>
            </div>
          </div>

          {/* Membership Card Section - Show real card for paid members, dummy card for others */}
          {mounted && (
            <div className="relative flex flex-col items-center">
              {/* Flippable Card Container */}
              <div className="relative w-full max-w-md sm:max-w-md perspective-1000">
                <div
                  className={`relative w-full transition-transform duration-700  ${CARD_HEIGHT} ${isFlipped ? "rotate-y-180" : ""
                    }`}
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Card Front */}
                  <div
                    className={`absolute inset-0 ${CARD_HEIGHT}`}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <MembershipCard
                      user={!loading && user && user.membership_type === "paid" ? user : dummyMemberData}
                      qrRef={qrRef}
                    />
                  </div>

                  {/* Card Back */}
                  <div
                    className={`absolute inset-0 ${CARD_HEIGHT}
    bg-[#03215F] rounded-2xl shadow-2xl text-white
    flex items-center justify-center p-6`}
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="rounded-2xl shadow-2xl text-white w-full max-w-md relative overflow-hidden flex flex-col justify-center items-center p-6">
                      {/* Card Back Content */}
                      <div className="z-10 text-center">
                        <div className="mb-0">
                          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm inline-block">
                            <div ref={qrBackRef}>
                              <QRCodeCanvas
                                value={JSON.stringify({
                                  type: "MEMBERSHIP_VERIFICATION",
                                  membership_id: (!loading && user && user.membership_type === "paid")
                                    ? user.membership_code
                                    : dummyMemberData.membership_code,
                                  member_name: (!loading && user && user.membership_type === "paid")
                                    ? user.full_name
                                    : dummyMemberData.full_name,
                                  member_type: (!loading && user && user.membership_type === "paid")
                                    ? user.membership_type
                                    : dummyMemberData.membership_type,
                                  expiry_date: (!loading && user && user.membership_type === "paid")
                                    ? user.membership_expiry_date
                                    : dummyMemberData.membership_expiry_date,
                                })}
                                size={80}
                                level="H"
                                includeMargin
                                bgColor="#ffffff"
                                fgColor="#000000"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-lg font-bold uppercase tracking-wide">
                            Membership Card
                          </h3>
                          <p className="text-sm text-gray-300 max-w-xs   mb-0">
                            Scan QR code for membership verification and event
                            check-ins
                          </p>

                          <div className="pt-1 border-t border-white/10">
                            <p className="text-xs text-gray-400 uppercase mb-1">
                              Contact Information
                            </p>
                            <p className="text-sm">
                              Bahrain.ds94@gmail.com
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Security Strip */}
                      <div className="absolute bottom-3 left-4 right-4 h-6 bg-gradient-to-r from-transparent via-white/2 to-transparent rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Instructions */}
              <div className="text-center mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/20">
                  <Sparkles className="w-4 h-4 text-[#ECCF0F]" />
                  <span className="text-sm text-gray-700">
                    {!loading && user && user.membership_type === "paid"
                      ? "Click card to view back side"
                      : "Click card to view back side"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Controls (Optional - can be hidden) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => {
            if (videoRef.current) {
              if (videoRef.current.paused) {
                videoRef.current
                  .play()
                  .catch((e) => console.log("Play failed:", e));
              } else {
                videoRef.current.pause();
              }
            }
          }}
          className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          aria-label="Toggle video playback"
        >
          <svg
            className="w-4 h-4 text-gray-700"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        <div className="text-xs text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
          Video Background
        </div>
      </div>

      {/* Tailwind CSS for animations and effects */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        .rotate-y-180 {
          transform: rotateY(180deg);
        }

        .transition-transform {
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(10px) translateX(-10px);
          }
          75% {
            transform: translateY(-10px) translateX(-5px);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }
      `}</style>


      {/* Join choice modal */}
      <Modal
        open={showJoinChoice}
        onClose={() => setShowJoinChoice(false)}
        title="Become a Member"
        size="md"
      >
        <div className="space-y-6">
          <p className="text-gray-700">
            Do you already have an account, or would you like to register as a new member?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setShowJoinChoice(false);
                setShowLoginModal(true);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              <LogIn className="w-5 h-5" />
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setShowJoinChoice(false);
                router.push("/auth/register");
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#AE9B66] text-[#AE9B66] rounded-lg font-semibold hover:bg-[#AE9B66]/10 transition"
            >
              <UserPlus className="w-5 h-5" />
              New Member
            </button>
          </div>
        </div>
      </Modal>

      {/* Login modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          // Optionally navigate after login; the modal triggers a reload already.
        }}
        onRegisterClick={() => {
          setShowLoginModal(false);
          router.push("/auth/register");
        }}
      />

      {/* Speaker Badge Modal */}
      <AnimatePresence>
        {isBadgeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsBadgeModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#03215F] to-[#1a3a7f] p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <BadgeCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Speaker Badge</h2>
                      <p className="text-white/70 text-sm">Verify your speaker status</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsBadgeModalOpen(false)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {!badgeStatus ? (
                  <form onSubmit={handleBadgeVerify} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                      <select
                        value={badgeFormData.event_id}
                        onChange={e => setBadgeFormData(prev => ({ ...prev, event_id: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Choose an event...</option>
                        {badgeEvents.map(event => (
                          <option key={event.id} value={event.id}>{event.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={badgeFormData.email}
                        onChange={e => setBadgeFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#03215F] focus:border-transparent transition-all"
                        placeholder="Enter your registered email"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={badgeVerifying}
                      className="w-full py-3 bg-gradient-to-r from-[#03215F] to-[#1a3a7f] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {badgeVerifying ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <BadgeCheck className="w-5 h-5" />
                          Verify Badge
                        </>
                      )}
                    </button>
                  </form>
                ) : badgeStatus === 'approved' && badgeData ? (
                  <div className="space-y-6">
                    {/* Badge Preview */}
                    <div id="speaker-badge-print" className="bg-gradient-to-br from-[#03215F] to-[#1a3a7f] rounded-2xl p-6 text-center text-white">
                      <p className="text-xs uppercase tracking-widest text-white mb-2">Bahrain Dental Society</p>
                      <h3 className="text-2xl font-bold text-white mb-4">SPEAKER</h3>
                      <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-3xl font-bold">{badgeData.speaker?.full_name?.charAt(0) || 'S'}</span>
                      </div>
                      <h4 className="text-xl font-bold mb-1">{badgeData.speaker?.full_name}</h4>
                      <p className="text-white text-sm mb-4">{badgeData.speaker?.designation || 'Speaker'}</p>
                      <div className="border-t border-b border-white/20 py-4 mb-4">
                        <p className="font-semibold capitalize">{badgeData.event?.title}</p>
                        <p className="text-sm text-white">
                          {badgeData.event?.start_datetime && new Date(badgeData.event.start_datetime).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg inline-block">
                        <QRCodeCanvas
                          value={`https://bds.org.bh/speaker/${badgeData.speaker?.id}`}
                          size={80}
                          level="H"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleBadgePrint}
                        className="flex-1 py-3 bg-[#AE9B66] text-white rounded-xl font-semibold hover:bg-[#9a8a5a] transition-all flex items-center justify-center gap-2"
                      >
                        <Printer className="w-5 h-5" />
                        Print Badge
                      </button>
                      <button
                        onClick={() => {
                          setBadgeStatus(null);
                          setBadgeData(null);
                          setBadgeFormData({ event_id: '', email: '' });
                        }}
                        className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {badgeStatus === 'pending' && (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto flex items-center justify-center">
                          <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Application Pending</h3>
                        <p className="text-gray-600">Your speaker application is currently under review. You will receive an email once it&apos;s approved.</p>
                      </div>
                    )}
                    {badgeStatus === 'rejected' && (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Application Rejected</h3>
                        <p className="text-gray-600">Unfortunately, your speaker application was not approved. Please contact us for more information.</p>
                      </div>
                    )}
                    {(badgeStatus === 'not_found' || badgeStatus === 'error') && (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No Application Found</h3>
                        <p className="text-gray-600">We couldn&apos;t find a speaker application with this email for the selected event.</p>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setBadgeStatus(null);
                        setBadgeData(null);
                        setBadgeFormData({ event_id: '', email: '' });
                      }}
                      className="mt-6 px-6 py-3 bg-[#03215F] text-white rounded-xl font-semibold hover:bg-[#03215F]/90 transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
