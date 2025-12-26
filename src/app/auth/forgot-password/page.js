"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Shield,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/MainLayout";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && step === 2) {
      setCanResend(true);
    }
  }, [countdown, step]);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send OTP");
        toast.error("Error", {
          description: data.message || "Failed to send OTP",
        });
        setIsLoading(false);
        return;
      }

      toast.success("OTP Sent!", {
        description: "Please check your email for the OTP code.",
      });

      setStep(2);
      setCountdown(60); // 60 seconds countdown
      setCanResend(false);
      setIsLoading(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      });
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid OTP");
        toast.error("Verification Failed", {
          description: data.message || "Invalid OTP",
        });
        setIsLoading(false);
        return;
      }

      toast.success("OTP Verified!", {
        description: "Please set your new password.",
      });

      setResetToken(data.resetToken);
      setStep(3);
      setIsLoading(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      });
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password");
        toast.error("Reset Failed", {
          description: data.message || "Failed to reset password",
        });
        setIsLoading(false);
        return;
      }

      toast.success("Password Reset Successful!", {
        description: "You can now login with your new password.",
        duration: 5000,
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      });
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to resend OTP");
        toast.error("Error", {
          description: data.message || "Failed to resend OTP",
        });
        setIsLoading(false);
        return;
      }

      toast.success("OTP Resent!", {
        description: "Please check your email for the new OTP code.",
      });

      setOtp("");
      setCountdown(60);
      setCanResend(false);
      setIsLoading(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] mb-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reset Password
              </h1>
              <p className="text-gray-600 mt-2">
                {step === 1 && "Enter your email to receive an OTP"}
                {step === 2 && "Enter the OTP sent to your email"}
                {step === 3 && "Set your new password"}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0">
                  <div
                    className="h-full bg-gradient-to-r from-[#03215F] to-[#AE9B66] transition-all duration-500 ease-in-out"
                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                  />
                </div>
                
                {/* Steps */}
                <div className="relative flex items-center justify-between z-10">
                  {[1, 2, 3].map((stepNum) => (
                    <div key={stepNum} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-lg ${
                          step >= stepNum
                            ? step > stepNum
                              ? "bg-gradient-to-br from-[#AE9B66] to-[#AE9B66] border-[#AE9B66] text-white scale-110"
                              : "bg-gradient-to-br from-[#03215F] to-[#03215F] border-[#03215F] text-white scale-110 shadow-[#03215F]/50"
                            : "bg-white border-gray-300 text-gray-400"
                        }`}
                      >
                        {step > stepNum ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="font-bold text-sm">{stepNum}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium mt-2 transition-colors ${
                          step >= stepNum
                            ? step === stepNum
                              ? "text-[#03215F] font-semibold"
                              : "text-gray-700"
                            : "text-gray-400"
                        }`}
                      >
                        {stepNum === 1
                          ? "Enter Email"
                          : stepNum === 2
                          ? "Verify OTP"
                          : "New Password"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-[#b8352d] border border-[#b8352d] rounded-lg">
                <p className="text-white text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
                    placeholder="your.email@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-3" />
                      Send OTP
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="inline w-4 h-4 mr-2" />
                    Enter OTP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtp(value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F] text-center text-2xl font-mono tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the 6-digit code sent to {email}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-[#03215F] hover:underline flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={!canResend || isLoading}
                    className="text-sm text-[#03215F] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countdown > 0
                      ? `Resend in ${countdown}s`
                      : "Resend OTP"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-3" />
                      Verify OTP
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="inline w-4 h-4 mr-2" />
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="inline w-4 h-4 mr-2" />
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F] pr-12"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || password.length < 8 || password !== confirmPassword}
                  className="w-full py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-3" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-8 text-center pt-6 border-t border-gray-200">
              <Link
                href="/auth/login"
                className="text-[#03215F] font-semibold hover:underline flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

