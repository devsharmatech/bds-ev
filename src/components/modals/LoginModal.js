"use client";

import { useState } from "react";
import { X, LogIn, UserPlus, Mail, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {toast} from "sonner";
import { useRouter } from "next/navigation";

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onRegisterClick,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch("/api/auth/login2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      toast.success("Login successful 🎉");

      onLoginSuccess();
      try {
        if (typeof window !== "undefined") {
          // ensure the expiry modal can run after reload (avoid race with Set-Cookie)
          sessionStorage.setItem("bds:show-expiry-on-load", "1");
        }
      } catch (e) {}
      // Notify other components that a user has just logged in
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("bds:user-logged-in"));
        }
      } catch (e) {
        // ignore
      }
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } else {
      toast.error(data.message || "Login failed");
    }
  } catch (error) {
    toast.error("An error occurred during login");
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-lg">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Login to Continue
                  </h2>
                  <p className="text-sm text-gray-600">
                    Join events and access member benefits
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#03215F] focus:border-transparent outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onRegisterClick}
                className="inline-flex items-center text-sm text-[#03215F] hover:text-[#03215F]"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Create new account
              </button>
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Forgot password?
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              By signing in, you agree to our{" "}
              <button className="text-[#03215F] hover:text-[#03215F]">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-[#03215F] hover:text-[#03215F]">
                Privacy Policy
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
