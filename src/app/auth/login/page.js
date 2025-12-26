"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, User, Shield, CheckCircle, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/MainLayout";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlMessage, setUrlMessage] = useState(null);
  const [urlMessageType, setUrlMessageType] = useState(null);

  // Check for URL parameters (success/error messages from payment callback)
  useEffect(() => {
    const success = searchParams.get('success');
    const errorParam = searchParams.get('error');
    const message = searchParams.get('message');

    if (success || errorParam) {
      const messageType = success ? 'success' : 'error';
      let displayMessage = message;
      
      if (!displayMessage) {
        if (success === 'payment_completed') {
          displayMessage = 'Registration payment completed successfully! Please login to access your account.';
        } else if (errorParam === 'payment_failed') {
          displayMessage = 'Payment was not completed. Please try again.';
        } else if (errorParam === 'payment_error') {
          displayMessage = 'An error occurred during payment processing. Please contact support if payment was deducted.';
        } else if (errorParam === 'invalid_callback') {
          displayMessage = 'Invalid payment callback. Please contact support.';
        } else if (errorParam === 'payment_not_found') {
          displayMessage = 'Payment record not found. Please contact support.';
        } else {
          displayMessage = errorParam || success || 'An error occurred.';
        }
      }

      setUrlMessageType(messageType);
      setUrlMessage(displayMessage);

      // Show toast notification
      if (messageType === 'success') {
        toast.success(success === 'payment_completed' ? 'Payment Completed!' : 'Success', {
          description: displayMessage,
          duration: 5000,
        });
      } else {
        toast.error('Error', {
          description: displayMessage,
          duration: 5000,
        });
      }

      // Clear URL parameters after displaying message
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      // Show success toast
      toast.success("Login Successful!", {
        description: "Welcome back! Redirecting to dashboard...",
        duration: 3000,
        position: "top-center",
        icon: (
          <div className="w-6 h-6 rounded-full bg-[#AE9B66] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#AE9B66]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        ),
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });

      // Optional: Add a small delay before redirecting to show the toast
      setTimeout(() => {
        router.push("/");
      }, 1500);

    } catch (err) {
      // Show error toast
      toast.error("Login Failed", {
        description: "Something went wrong. Please try again.",
        duration: 4000,
        position: "top-center",
        icon: (
          <div className="w-6 h-6 rounded-full bg-[#b8352d] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#b8352d]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        ),
      });
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center bg-gray-50 py-12 px-4 pt-0">
        <div className="max-w-md w-full py-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#03215F] to-[#03215F] mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome Back
            </h1>
            <p className="text-gray-600 mt-2">
              Sign in to your BDS member account
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* URL Success/Error Message */}
            {urlMessage && (
              <div className={`mb-6 p-4 rounded-lg border ${
                urlMessageType === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-[#b8352d] border-[#b8352d]'
              }`}>
                <div className="flex items-start gap-3">
                  {urlMessageType === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm font-medium flex-1 ${
                    urlMessageType === 'success' ? 'text-green-800' : 'text-white'
                  }`}>
                    {urlMessage}
                  </p>
                  <button
                    onClick={() => {
                      setUrlMessage(null);
                      setUrlMessageType(null);
                    }}
                    className={`flex-shrink-0 ${
                      urlMessageType === 'success' ? 'text-green-600 hover:text-green-700' : 'text-white hover:text-gray-200'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Form Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-[#b8352d] border border-[#b8352d] rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <p className="text-white text-sm font-medium flex-1">
                    {error}
                  </p>
                  <button
                    onClick={() => setError("")}
                    className="text-white hover:text-gray-200 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F]"
                  placeholder="member@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline w-4 h-4 mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#03215F] pr-12"
                    placeholder="Enter your password"
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

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 text-[#03215F] border-gray-300 rounded focus:ring-[#03215F]"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 text-sm text-gray-600"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-[#03215F] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-3" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Not a member yet?{" "}
                <Link
                  href="/auth/register"
                  className="text-[#03215F] font-semibold hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Wrap the component in Suspense to handle useSearchParams()
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#03215F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading login page...</p>
            </div>
          </div>
        </MainLayout>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}