"use client";

import { useEffect, useState } from "react";
import { Bell, X, CheckCircle } from "lucide-react";
import { getFCMToken } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function NotificationPermission() {
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("default");

  useEffect(() => {
    // Check if notification permission is already granted or denied
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = Notification.permission;
      setPermissionStatus(permission);

      // Show banner if permission is default (not asked yet)
      if (permission === "default") {
        // Check if user has dismissed the banner before
        const dismissed = localStorage.getItem("notification_banner_dismissed");
        if (!dismissed) {
          setShowBanner(true);
        }
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    try {
      setIsLoading(true);

      // Get FCM token
      const token = await getFCMToken();

      if (!token) {
        toast.error("Failed to get notification token. Please check your browser settings.");
        setShowBanner(false);
        localStorage.setItem("notification_banner_dismissed", "true");
        return;
      }

      // Save token to backend
      const response = await fetch("/api/notifications/device-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          device_token: token,
          platform: "web",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Notifications enabled successfully!");
        setPermissionStatus("granted");
        setShowBanner(false);
        localStorage.setItem("notification_banner_dismissed", "true");
      } else {
        toast.error(data.message || "Failed to enable notifications");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error("Failed to enable notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("notification_banner_dismissed", "true");
  };

  if (!showBanner || permissionStatus === "granted") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-br from-[#03215F] to-[#AE9B66] rounded-lg flex-shrink-0">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1">
              Enable Notifications
            </h3>
            <p className="text-xs md:text-sm text-gray-600 mb-3">
              Stay updated with event reminders, announcements, and important updates.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEnableNotifications}
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 text-xs md:text-sm flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enabling...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Enable
                  </>
                )}
              </button>
              <button
                onClick={handleDismiss}
                disabled={isLoading}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

