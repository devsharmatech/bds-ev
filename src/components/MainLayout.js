"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MainLayout({ children }) {
  // Force light mode - remove dark class if exists
  if (typeof window !== "undefined") {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "light");
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
