"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

export default function ExpiryModal() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Only run in browser
    const check = async () => {
      try {
        const shown = sessionStorage.getItem("expiryModalShown");
        const showOnLoad = sessionStorage.getItem("bds:show-expiry-on-load");
        if (shown && !showOnLoad) return;
        if (showOnLoad) {
          try {
            sessionStorage.removeItem("bds:show-expiry-on-load");
          } catch (e) {}
        }

        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        const u = data.user;
        if (!u) return;

        setUser(u);

        // Only consider paid membership users
        if (u.membership_type !== "paid") return;

        const now = new Date();
        const expiry = u.membership_expiry_date ? new Date(u.membership_expiry_date) : null;

        const isExpired =
          u.membership_status !== "active" || (expiry && expiry <= now);

        if (isExpired) {
          setOpen(true);
        }
      } catch (err) {
        // silent
        console.error("ExpiryModal error:", err);
      }
    };

    // Run initial check on mount
    check();

    // Re-check when user logs in (so modal appears right after login)
    const handler = () => {
      // Clear flag so modal can show for this session if expired
      try {
        sessionStorage.removeItem("expiryModalShown");
        sessionStorage.removeItem("bds:show-expiry-on-load");
      } catch (e) {}
      check();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("bds:user-logged-in", handler);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("bds:user-logged-in", handler);
      }
    };
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("expiryModalShown", "1");
    setOpen(false);
  };

  const handleRenew = () => {
    sessionStorage.setItem("expiryModalShown", "1");
    setOpen(false);
    // Prefer member renewal route
    router.push("/member/dashboard/membership");
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose} title="Membership Expired" size="md">
      <div className="space-y-4">
        <p className="text-gray-700">
          Your membership appears to be expired or inactive. As a result, member
          discounts and benefits (including discounted event pricing and badge
          printing) may not apply.
        </p>
        <p className="text-gray-600 text-sm">
          Renewing your membership will restore access to discounts and other
          member-only features.
        </p>

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Dismiss
          </button>
          <button
            onClick={handleRenew}
            className="px-4 py-2 rounded-lg bg-[#b8352d] text-white font-semibold hover:bg-[#a12b24]"
          >
            Renew Membership
          </button>
        </div>
      </div>
    </Modal>
  );
}
