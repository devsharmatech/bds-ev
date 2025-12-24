"use client";

import { useEffect } from "react";
import { onMessageListener } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function NotificationHandler() {
  useEffect(() => {
    // Register service worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    // Listen for foreground messages
    onMessageListener()
      .then((payload) => {
        if (payload) {
          const { title, body, icon } = payload.notification || {};
          
          // Show toast notification
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {icon ? (
                      <img src={icon} alt="" className="h-10 w-10 rounded-full" />
                    ) : (
                      <div className="h-10 w-10 bg-gradient-to-br from-[#03215F] to-[#AE9B66] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">BDS</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    <p className="mt-1 text-sm text-gray-500">{body}</p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          ));

          // Handle click action if provided
          if (payload.data?.click_action) {
            const clickAction = payload.data.click_action;
            const url = clickAction.startsWith("http")
              ? clickAction
              : window.location.origin + clickAction;
            
            // You can add navigation logic here if needed
            // router.push(url);
          }
        }
      })
      .catch((err) => {
        console.error("Error listening for messages:", err);
      });
  }, []);

  return null;
}

