"use client";

import { ArrowRight, Calendar, Shield, Sparkles, QrCode, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Modal from "@/components/Modal";
import LoginModal from "@/components/modals/LoginModal";

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
            <p className="text-[10px] text-[#9cc2ed] tracking-widest uppercase">
              Official Member
            </p>
          </div>
        </div>

        <span
          className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase
          rounded-full ${
            user.membership_status === "active"
              ? "bg-green-600/20 border border-green-600/30 text-green-600"
              : "bg-[#b8352d]/20 border border-[#b8352d]/30 text-[#b8352d]"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              user.membership_status === "active"
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
          <h2 className="font-bold leading-tight text-[clamp(14px,4vw,18px)] truncate">
            {user.full_name}
          </h2>

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
            <p className="text-xs sm:text-sm text-[#9cc2ed] font-medium">
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

  // Dummy member data for non-logged-in or non-paid members
  const dummyMemberData = {
    full_name: "DR. ABBAS AlFardan",
    membership_code: "BDS-2000-0000",
    membership_expiry_date: "2029-12-31",
    membership_type: "paid",
    membership_status: "active",
  };

  // Prevent hydration mismatch by only rendering client-side content after mount
  useEffect(() => {
    setMounted(true);
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
            poster="/bgn.png"
          >
            <source src="/file.mp4" type="video/mp4" />
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
                  className={`relative w-full transition-transform duration-700  ${CARD_HEIGHT} ${
                    isFlipped ? "rotate-y-180" : ""
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
                      : "Join as a premium member to unlock your digital membership card"}
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
    </section>
  );
}
