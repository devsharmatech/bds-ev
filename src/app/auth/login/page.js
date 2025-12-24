"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, User, Shield } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/MainLayout";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
            {error && (
              <div className="mb-6 p-4 bg-[#b8352d] border border-[#b8352d] rounded-lg">
                <p className="text-[#b8352d] text-sm">
                  {error}
                </p>
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