'use client';
import { useState, useEffect } from "react";
import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import { motion } from "framer-motion";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Force light mode - remove dark class if exists and prevent dark mode
    if (typeof window !== "undefined") {
      // Remove dark class
      document.documentElement.classList.remove("dark");
      // Set light theme
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.setAttribute("class", "light");
      // Override any dark mode preference
      localStorage.setItem('theme', 'light');
      
      // Continuously monitor and prevent dark mode
      const observer = new MutationObserver(() => {
        if (document.documentElement.classList.contains("dark")) {
          document.documentElement.classList.remove("dark");
        }
      });
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
      
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        role="admin" 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          role="admin" 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}