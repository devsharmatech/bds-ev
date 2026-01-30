"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Mail,
  Lock,
  Shield,
  LogIn,
  Moon,
  Sun,
  Loader2,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState("light");

  // Check system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setTheme(e.matches ? "dark" : "light");

    setTheme(mediaQuery.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const login = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("/api/auth/login2", { email, password });
      const data = res.data;

      if (!data.success) throw new Error(data.message || data.error || "Login failed");
      if (data.user?.role !== "admin" && data.role !== "admin")
        throw new Error("Not authorized for admin login");

      // Cookie is set server-side (HttpOnly). Keep role for UI hints.
      localStorage.setItem("role", data.user?.role || data.role || "admin");

      toast.success("Admin login successful");
      setTimeout(() => (window.location.href = "/admin/dashboard"), 800);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Login failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      login();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#9cc2ed] via-white to-[#03215F] transition-colors duration-500 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-[#03215F]/10 to-[#03215F]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-[#ECCF0F]/10 to-[#03215F]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#03215F]/5 to-[#03215F]/5 rounded-full blur-3xl"></div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          className: "backdrop-blur-sm",
          style: {
            border: "1px solid rgba(34, 166, 172, 0.2)",
            background: "rgba(255, 255, 255, 0.95)",
          },
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 py-3 transition-all duration-300 border border-gray-200/30 hover:shadow-2xl hover:shadow-[#03215F]/10">
          {/* Decorative top accent */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#03215F] via-[#ECCF0F] to-[#03215F] rounded-b-lg"></div>

          {/* Logo/Brand */}
          <div className="text-center mb-8 mt-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#03215F] to-[#03215F] rounded-2xl flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl relative group">
              <Building2 className="w-8 h-8 text-white" />
              <div className="absolute inset-0 rounded-2xl border border-[#ECCF0F]/30 animate-pulse"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
              BDS Admin
            </h1>
            <p className="text-sm text-gray-600 mt-2 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-[#03215F]" />
              Secure Administrative Access
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-[#03215F]">
                  <Mail className="h-5 w-5 z-10 text-gray-700 group-focus-within:text-[#03215F]" />
                </div>
                <input
                  type="email"
                  placeholder="admin@bds.com"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#03215F] focus:ring-4 focus:ring-[#03215F]/20 transition-all duration-300 text-base backdrop-blur-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-[#03215F]">
                  <Lock className="h-5 w-5 z-10 text-gray-700 group-focus-within:text-[#03215F]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl bg-white/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#03215F] focus:ring-4 focus:ring-[#03215F]/20 transition-all duration-300 text-base backdrop-blur-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#03215F] transition-colors duration-200"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={login}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#03215F] via-[#03215F] to-[#03215F] hover:from-[#03215F] hover:via-[#03215F] hover:to-[#03215F] disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 focus:outline-none focus:ring-4 focus:ring-[#03215F]/30 focus:ring-offset-2 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:shadow-[#03215F]/20 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="animate-pulse">Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-2 pt-2 border-t border-gray-200/50 text-center">
            <p className="text-sm text-gray-600 font-medium">
              © 2026 BDS System
            </p>
            <p className="text-xs text-gray-500 mt-2">
               • Secure Enterprise Portal
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#AE9B66] rounded-full animate-pulse"></div>
                System Secure
              </span>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
