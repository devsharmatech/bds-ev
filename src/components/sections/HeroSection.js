"use client";

import { ArrowRight, Calendar, Shield, Sparkles, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

// MembershipCard Component
function MembershipCard({ member }) {
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
              src="https://bds-web-iota.vercel.app/logo.png"
              alt="BDS Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
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
          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase
          rounded-full bg-green-600/20 border border-green-600/30 text-green-600"
        >
          <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
          Active
        </span>
      </div>

      {/* Body */}
      <div className="relative flex justify-between items-end mt-4 gap-3">
        <div className="flex-1">
          <p className="text-[10px] text-slate-300 uppercase">Member Name</p>
          <h2 className="font-bold leading-tight text-[clamp(14px,4vw,18px)]">
            {member.name}
          </h2>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <p className="text-[10px] text-slate-300 uppercase">Member ID</p>
              <p className="text-xs sm:text-sm font-mono truncate">
                {member.id}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-300 uppercase">Expires</p>
              <p className="text-xs sm:text-sm font-mono">{member.expiry}</p>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-[10px] text-slate-300 uppercase">Type</p>
            <p className="text-xs sm:text-sm text-[#9cc2ed] font-medium">
              {member.type}
            </p>
          </div>
        </div>

        {/* QR */}
        <div className="bg-white rounded-lg p-2 shrink-0">
          <QrCode className="w-14 h-14 sm:w-16 sm:h-16 text-[#03215F]" />
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

  // Sample member data
  const memberData = {
    name: "DR. ABBAS AlFardan",
    id: "BDS-2000-0000",
    expiry: "12/2029",
    type: "Premium Member",
  };

  // Generate consistent particles on client only
  useEffect(() => {
    const generatedParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 10 + Math.random() * 10,
    }));
    setParticles(generatedParticles);
  }, []);

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

          {/* Animated Particles Effect - Render only on client */}
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
                onClick={() => router.push("/auth/register")}
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

          {/* Membership Card Section */}
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
                  <MembershipCard member={memberData} />
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
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm inline-block">
                          <QrCode className="h-14 w-14 text-white" />
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
                  Click card to view back side
                </span>
              </div>
            </div>
          </div>
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
    </section>
  );
}
