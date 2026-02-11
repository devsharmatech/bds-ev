"use client";

import { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Download,
  QrCode,
  Printer,
  Share2,
  Copy,
  CheckCircle,
  Calendar,
  Shield,
  ShieldCheck,
  Crown,
  BadgeCheck,
  User,
  Building,
  Award,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  Star,
  Users,
  BookOpen,
  Target,
  TrendingUp,
  Gem,
  Check,
  Lock,
  AlertCircle,
  ArrowRight,
  Gem as Diamond,
  Award as Trophy,
  Star as StarIcon,
  RefreshCw,
  Loader2,
  X,
  Upload,
  Camera,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import { useRouter } from "next/navigation";
import PaymentMethodModal from "@/components/modals/PaymentMethodModal";
import PlanSelectionModal from "@/components/modals/PlanSelectionModal";
import { uploadFile } from "@/lib/uploadClient";

// Membership Card Component
function MembershipCard({
  user,
  qrRef,
  isFreeMember = false,
  onUpgradeClick,
  planName,
  isExpired = false,
}) {
  if (!user) return null;

  const containerRef = useRef(null);
  const [qrSize, setQrSize] = useState(100);
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const w = el.offsetWidth || 420;
      const size = Math.max(80, Math.min(90, Math.round(w * 0.26)));
      setQrSize(size);
      setIsNarrow(w < 420);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const qrValue = JSON.stringify({
    type: "MEMBERSHIP_VERIFICATION",
    membership_id: user.membership_code,
    member_name: user.full_name,
    member_type: user.membership_type,
    expiry_date: user.membership_expiry_date,
  });

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-BH", {
          month: "numeric",
          year: "numeric",
          timeZone: "Asia/Bahrain",
        })
      : "N/A";

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 460,
        margin: "0 auto",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 18px 48px rgba(3,33,95,0.25)",
        color: "#ffffff",
        padding: 20,
        minHeight: 260,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, #05245A 0%, #0B2F75 100%)",
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      {/* Glow Backgrounds */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 220,
          height: 220,
          backgroundColor: "rgba(3,33,95,0.22)",
          filter: "blur(56px)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 220,
          height: 220,
          backgroundColor: "rgba(3,33,95,0.22)",
          filter: "blur(56px)",
          borderRadius: "50%",
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 6 }}
          >
            <img
              src="/logo.png"
              alt="BDS Logo"
              style={{
                width: 48,
                height: 48,
                objectFit: "contain",
                display: "block",
              }}
              crossOrigin="anonymous"
            />
          </div>
          <div>
            <h3
              style={{
                fontWeight: 800,
                textTransform: "uppercase",
                lineHeight: 1.1,
                margin: 0,
                fontSize: "clamp(14px, 3.4vw, 17px)",
                letterSpacing: "0.02em",
                marginRight: "10px",
              }}
            >
              Bahrain Dental Society
            </h3>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "clamp(9px, 2.8vw, 12px)",
                color: "#9cc2ed",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Official Member
              {user.is_member_verified && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 6px",
                    borderRadius: 9999,
                    fontSize: 9,
                    fontWeight: 700,
                    backgroundColor: "rgba(16,185,129,0.2)",
                    color: "#10B981",
                    border: "1px solid rgba(16,185,129,0.3)",
                    flexShrink: 0,
                    marginTop: "4px",
                    marginLeft: "10px",
                  }}
                >
                  <ShieldCheck style={{ width: 10, height: 10 }} />
                  Verified
                </span>
              )}
            </p>
          </div>
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "2px 10px",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            borderRadius: 9999,
            backgroundColor:
              !isExpired && user.membership_status === "active"
                ? "rgba(22,163,74,0.18)"
                : "rgba(184,53,45,0.18)",
            border: `1px solid ${!isExpired && user.membership_status === "active" ? "rgba(22,163,74,0.3)" : "rgba(184,53,45,0.3)"}`,
            color:
              !isExpired && user.membership_status === "active"
                ? "#16a34a"
                : "#b8352d",
            marginTop: "7px",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor:
                !isExpired && user.membership_status === "active"
                  ? "#16a34a"
                  : "#b8352d",
            }}
          />
          {isExpired ? "Inactive" : user.membership_status || "Active"}
        </span>
      </div>

      {/* Body */}
      <div
        style={{
          position: "relative",
          display: isNarrow ? "block" : "flex",
          justifyContent: "space-between",
          alignItems: isNarrow ? "stretch" : "flex-end",
          marginTop: 18,
          gap: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "clamp(9px, 2.6vw, 11px)",
              color: "#C7D7F2",
              textTransform: "uppercase",
              margin: 0,
              letterSpacing: "0.1em",
            }}
          >
            Member Name
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 4,
            }}
          >
            <h2
              style={{
                fontWeight: 700,
                lineHeight: 1.15,
                margin: 0,
                fontSize: "clamp(18px, 5vw, 20px)",
                whiteSpace: "normal", // allow wrapping
                overflow: "visible", // show full text
                textOverflow: "unset", // remove ellipsis
                wordBreak: "break-word", // break long names nicely
                textTransform: "uppercase",
                letterSpacing: "0.02em",
              }}
            >
              {user.full_name || ""}
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 14,
              flexWrap: isNarrow ? "wrap" : "nowrap",
            }}
          >
                {/* Only show Membership ID for active paid members */}
                {!isFreeMember && user?.membership_status === "active" && user?.membership_code && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "clamp(9px, 2.6vw, 11px)",
                    color: "#C7D7F2",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Member ID
                </p>
                <p
                  style={{
                    fontSize: "clamp(12px, 3.5vw, 14px)",
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    margin: "3px 0 0 0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.membership_code || "N/A"}
                </p>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "clamp(9px, 2.6vw, 11px)",
                  color: "#C7D7F2",
                  textTransform: "uppercase",
                  margin: 0,
                  letterSpacing: "0.1em",
                }}
              >
                Expires
              </p>
              <p
                style={{
                  fontSize: "clamp(12px, 3.5vw, 14px)",
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  margin: "3px 0 0 0",
                }}
              >
                {formatDate(user.membership_expiry_date)}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <p
              style={{
                fontSize: "clamp(9px, 2.6vw, 11px)",
                color: "#C7D7F2",
                textTransform: "uppercase",
                margin: 0,
                letterSpacing: "0.1em",
              }}
            >
              Type
            </p>
            <p
              style={{
                fontSize: "clamp(13px, 3.8vw, 14px)",
                color: "gold",
                fontWeight: 700,
                margin: "4px 0 0 0",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
              }}
            >
              {(
                (planName ||
                  (user.membership_type == "paid"
                    ? planName
                    : "Free Membership")) + ""
              ).toUpperCase()}
            </p>
          </div>
        </div>

        {/* QR Code */}
        <div
          ref={qrRef}
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 14,
            padding: 6,
            flexShrink: 0,
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            border: "1px solid rgba(0,0,0,0.06)",
            alignSelf: isNarrow ? "flex-start" : "auto",
            marginTop: isNarrow ? 10 : 0,
          }}
        >
          {isFreeMember || isExpired ? (
            <div
              style={{
                width: 80,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#E5E7EB",
                borderRadius: 12,
              }}
            >
              <Lock style={{ width: 28, height: 28, color: "#6B7280" }} />
            </div>
          ) : (
            <QRCodeCanvas value={qrValue} size={100} level="H" includeMargin />
          )}
        </div>
      </div>
    </div>
  );
}

export default function MembershipCardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [planName, setPlanName] = useState("");
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentData, setPaymentData] = useState(null);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [idCardFile, setIdCardFile] = useState(null);
  const [personalPhotoFile, setPersonalPhotoFile] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [personalPhotoPreview, setPersonalPhotoPreview] = useState(null);
  const qrRef = useRef(null);
  const cardRef = useRef(null);
  const router = useRouter();

  const isFreeMember = user?.membership_type === "free";
  const isExpired = !!(
    (currentSubscription?.expires_at &&
      new Date(currentSubscription.expires_at).getTime() < Date.now()) ||
    (user?.membership_status && user.membership_status !== "active")
  );

  useEffect(() => {
    fetchMembershipData();
    fetchSubscriptions();
    fetchVerificationData();

    // Check for payment success/error messages from URL
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const error = urlParams.get("error");
    const message = urlParams.get("message");

    if (success === "payment_completed") {
      toast.success(
        message
          ? decodeURIComponent(message)
          : "Payment completed successfully! Your subscription has been updated.",
        {
          duration: 5000,
        },
      );
      // Clean URL
      router.replace("/member/dashboard/membership");
      // Refresh data
      setTimeout(() => {
        fetchMembershipData();
        fetchSubscriptions();
      }, 1000);
    } else if (error) {
      const errorMessages = {
        payment_failed: "Payment failed. Please try again.",
        payment_not_found: "Payment record not found. Please contact support.",
        invalid_callback: "Invalid payment callback. Please contact support.",
        payment_error:
          "An error occurred during payment processing. Please try again.",
      };
      toast.error(
        message
          ? decodeURIComponent(message)
          : errorMessages[error] || "Payment failed. Please try again.",
        {
          duration: 5000,
        },
      );
      router.replace("/member/dashboard/membership");
    }
  }, [router]);

  const fetchMembershipData = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/dashboard/membership-info", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUser(data.user);

          const derived =
            data?.user?.current_subscription_plan_display_name ||
            data?.user?.current_subscription_plan_name ||
            (data?.user?.membership_type === "paid" ? "Paid Membership" : "Free Membership");

          setPlanName(derived || "");
        }
      }
    } catch (error) {
      console.error("Error fetching membership data:", error);
      toast.error("Failed to load membership information");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/api/dashboard/subscriptions", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCurrentSubscription(data.currentSubscription);
          setPlans(data.plans || []);
          const display =
            data?.currentSubscription?.subscription_plan?.display_name ||
            data?.currentSubscription?.subscription_plan_name ||
            user?.current_subscription_plan_display_name ||
            user?.current_subscription_plan_name ||
            (user?.membership_type === "paid" ? "Paid Membership" : "Free Membership");
          console.log("Derived plan name:", display);
          if (display) setPlanName(display);
        }
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const fetchVerificationData = async () => {
    try {
      const res = await fetch("/api/dashboard/verification", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setVerificationData(data);
          if (data.id_card_url) setIdCardPreview(data.id_card_url);
          if (data.personal_photo_url)
            setPersonalPhotoPreview(data.personal_photo_url);
        }
      }
    } catch (error) {
      console.error("Error fetching verification data:", error);
    }
  };

  const handleIdCardChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdCardFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdCardPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePersonalPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPersonalPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonalPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadDocuments = async () => {
    if (!idCardFile && !personalPhotoFile) {
      toast.error("Please select at least one document to upload");
      return;
    }

    setUploadingDocs(true);
    try {
      // Upload files directly to Supabase Storage first
      let id_card_url = null;
      let personal_photo_url = null;

      if (idCardFile) {
        toast.loading("Uploading ID Card...", { id: "doc-upload" });
        const result = await uploadFile(idCardFile, "profile_pictures", "verification");
        id_card_url = result.publicUrl;
      }
      if (personalPhotoFile) {
        toast.loading("Uploading Personal Photo...", { id: "doc-upload" });
        const result = await uploadFile(personalPhotoFile, "profile_pictures", "verification");
        personal_photo_url = result.publicUrl;
      }
      toast.dismiss("doc-upload");

      // Send JSON with pre-uploaded URLs
      const res = await fetch("/api/dashboard/verification", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_card_url, personal_photo_url }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Documents uploaded successfully!");
        setIdCardFile(null);
        setPersonalPhotoFile(null);
        fetchVerificationData();
        fetchMembershipData();
      } else {
        toast.error(data.message || "Failed to upload documents");
      }
    } catch (error) {
      toast.dismiss("doc-upload");
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents");
    } finally {
      setUploadingDocs(false);
    }
  };

  const handleUpgradeClick = () => {
    // Redirect to membership upgrade page or show upgrade modal
    toast.loading("Redirecting to membership upgrade...");
    setTimeout(() => {
      router.push("/membership");
    }, 1000);
  };

  const handleRenew = async () => {
    if (processing) return;

    // If we have an active/current subscription locally, ensure it's expired before attempting renew.
    if (currentSubscription) {
      const expired =
        currentSubscription?.expires_at &&
        new Date(currentSubscription.expires_at) < new Date();
      if (!expired) {
        toast.error("Your membership is not expired yet.");
        return;
      }
    }

    setProcessing(true);
    setLoadingPaymentMethods(true);
    try {
      const response = await fetch("/api/dashboard/subscriptions/renew", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        if (data.payment && data.payment.amount > 0) {
          // Payment required - create invoice to get payment methods
          const invoiceResponse = await fetch(
            "/api/payments/subscription/create-invoice",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                subscription_id: data.subscription.id,
                payment_id: data.payment.payment_id,
                amount: data.payment.amount,
                payment_type: "subscription_renewal",
              }),
            },
          );

          const invoiceData = await invoiceResponse.json();

          if (invoiceData.success && invoiceData.paymentMethods) {
            // Show payment method selection modal
            setPaymentMethods(invoiceData.paymentMethods);
            setPaymentData({
              subscription_id: data.subscription.id,
              payment_id: data.payment.payment_id,
              amount: data.payment.amount,
              payment_type: "subscription_renewal",
            });
            setShowPaymentModal(true);
          } else {
            toast.error(
              invoiceData.message || "Failed to load payment methods",
            );
          }
        } else {
          toast.success("Subscription renewed successfully!");
          fetchMembershipData();
          fetchSubscriptions();
        }
      } else {
        toast.error(data.message || "Failed to renew subscription");
      }
    } catch (error) {
      console.error("Error renewing subscription:", error);
      toast.error("Failed to renew subscription");
    } finally {
      setProcessing(false);
      setLoadingPaymentMethods(false);
    }
  };

  const handleUpgrade = async (plan) => {
    if (processing || !plan) return;

    setProcessing(true);
    setLoadingPaymentMethods(true);
    setShowPlanModal(false); // Close plan selection modal

    try {
      const response = await fetch("/api/dashboard/subscriptions/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          plan_id: plan.id,
          plan_name: plan.name,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.payment && data.payment.total_amount > 0) {
          // Payment required - create invoice to get payment methods
          const paymentId =
            data.payment.registration_fee > 0
              ? data.payment.registration_payment_id || data.subscription.id
              : data.payment.annual_payment_id || data.subscription.id;
          const paymentType =
            data.payment.registration_fee > 0
              ? "subscription_registration"
              : "subscription_annual";

          const invoiceResponse = await fetch(
            "/api/payments/subscription/create-invoice",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                subscription_id: data.subscription.id,
                payment_id: paymentId,
                amount: data.payment.total_amount,
                payment_type: paymentType,
              }),
            },
          );

          const invoiceData = await invoiceResponse.json();

          if (invoiceData.success && invoiceData.paymentMethods) {
            // Show payment method selection modal
            setPaymentMethods(invoiceData.paymentMethods);
            setPaymentData({
              subscription_id: data.subscription.id,
              payment_id: paymentId,
              amount: data.payment.total_amount,
              payment_type: paymentType,
            });
            setShowPaymentModal(true);
          } else {
            toast.error(
              invoiceData.message || "Failed to load payment methods",
            );
            setProcessing(false);
            setLoadingPaymentMethods(false);
          }
        } else {
          toast.success("Subscription updated successfully!");
          fetchMembershipData();
          fetchSubscriptions();
          setProcessing(false);
          setLoadingPaymentMethods(false);
        }
      } else {
        toast.error(data.message || "Failed to update subscription");
        setProcessing(false);
        setLoadingPaymentMethods(false);
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription");
      setProcessing(false);
      setLoadingPaymentMethods(false);
    }
  };

  const handleDowngrade = async (plan) => {
    // Downgrade is similar to upgrade
    await handleUpgrade(plan);
  };

  const handlePlanSelect = (plan) => {
    // Determine if it's upgrade or downgrade and call appropriate handler
    handleUpgrade(plan);
  };

  const handleUpgradeDowngradeClick = () => {
    // Show plan selection modal
    setShowPlanModal(true);
  };

  const handlePaymentExecute = (paymentUrl) => {
    // Redirect to payment gateway
    window.location.href = paymentUrl;
  };

  // Helper function to replace lab() color functions
  const replaceLabColors = (element, clonedWindow = null) => {
    if (!element) return;

    const win = clonedWindow || window;

    // Replace in inline styles
    if (element.style) {
      const style = element.style;

      // Check all style properties
      for (let i = 0; i < style.length; i++) {
        const prop = style[i];
        const value = style.getPropertyValue(prop);

        if (value && (value.includes("lab(") || value.includes("lab "))) {
          // Determine replacement based on property
          if (
            prop.includes("color") &&
            !prop.includes("background") &&
            !prop.includes("border")
          ) {
            style.setProperty(prop, "#ffffff", "important");
          } else if (prop.includes("background")) {
            style.setProperty(prop, "#03215F", "important");
          } else if (prop.includes("border")) {
            style.setProperty(prop, "#03215F", "important");
          } else {
            style.setProperty(prop, "#03215F", "important");
          }
        }
      }

      // Also check direct style properties and replace lab() in values
      const styleProps = [
        "color",
        "backgroundColor",
        "borderColor",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
        "fill",
        "stroke",
      ];
      styleProps.forEach((prop) => {
        try {
          const value = style[prop] || style.getPropertyValue(prop);
          if (value && (value.includes("lab(") || value.includes("lab "))) {
            if (prop === "color" || prop === "fill") {
              style.setProperty(prop, "#ffffff", "important");
            } else {
              style.setProperty(prop, "#03215F", "important");
            }
          }
        } catch (e) {
          // Ignore errors
        }
      });
    }

    // Replace in computed styles if window is available
    try {
      const computedStyle = win.getComputedStyle(element);
      [
        "color",
        "backgroundColor",
        "borderColor",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
        "fill",
        "stroke",
      ].forEach((prop) => {
        try {
          const value = computedStyle.getPropertyValue(prop);
          if (value && (value.includes("lab(") || value.includes("lab "))) {
            element.style.setProperty(
              prop,
              prop === "color" || prop === "fill" ? "#ffffff" : "#03215F",
              "important",
            );
          }
        } catch (e) {
          // Ignore errors for individual properties
        }
      });
    } catch (e) {
      // Ignore if getComputedStyle is not available
    }

    // Recursively process children
    Array.from(element.children || []).forEach((child) => {
      replaceLabColors(child, clonedWindow);
    });
  };

  // Process all stylesheets to replace lab() colors
  const processStylesheets = () => {
    try {
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach((sheet) => {
        try {
          const rules = sheet.cssRules || sheet.rules || [];
          Array.from(rules).forEach((rule) => {
            if (rule.style) {
              for (let i = 0; i < rule.style.length; i++) {
                const prop = rule.style[i];
                const value = rule.style.getPropertyValue(prop);
                if (
                  value &&
                  (value.includes("lab(") ||
                    value.includes("lab ") ||
                    /lab\([^)]+\)/.test(value))
                ) {
                  if (
                    prop.includes("color") &&
                    !prop.includes("background") &&
                    !prop.includes("border")
                  ) {
                    rule.style.setProperty(prop, "#ffffff", "important");
                  } else {
                    rule.style.setProperty(prop, "#03215F", "important");
                  }
                }
              }
            }
            // Also process cssText
            if (
              rule.cssText &&
              (rule.cssText.includes("lab(") || rule.cssText.includes("lab "))
            ) {
              rule.cssText = rule.cssText.replace(/lab\([^)]+\)/g, (match) => {
                if (
                  rule.cssText.includes("color:") &&
                  !rule.cssText.includes("background") &&
                  !rule.cssText.includes("border")
                ) {
                  return "#ffffff";
                }
                return "#03215F";
              });
            }
          });
        } catch (e) {
          // Ignore cross-origin stylesheet errors
        }
      });
    } catch (e) {
      // Ignore stylesheet access errors
    }
  };

  // Pre-process element to remove lab() colors before html2canvas
  const preprocessElementForCapture = (element) => {
    if (!element) return;

    // Process all elements recursively - including the element itself
    const allElements = [element, ...Array.from(element.querySelectorAll("*"))];

    allElements.forEach((el) => {
      // Get computed style and force replace lab() colors
      try {
        const computedStyle = window.getComputedStyle(el);
        const colorProps = [
          "color",
          "backgroundColor",
          "borderColor",
          "borderTopColor",
          "borderRightColor",
          "borderBottomColor",
          "borderLeftColor",
          "fill",
          "stroke",
          "outlineColor",
          "boxShadow",
          "textShadow",
        ];

        colorProps.forEach((prop) => {
          try {
            const value = computedStyle.getPropertyValue(prop);
            // Check for lab() in any form
            if (
              value &&
              (value.includes("lab(") ||
                value.includes("lab ") ||
                /lab\([^)]+\)/.test(value))
            ) {
              // Force set a standard color based on property type
              if (prop === "color" || prop === "fill") {
                el.style.setProperty(prop, "#ffffff", "important");
              } else if (prop.includes("background")) {
                el.style.setProperty(prop, "#03215F", "important");
              } else if (prop.includes("border")) {
                el.style.setProperty(prop, "#03215F", "important");
              } else if (prop.includes("shadow")) {
                // For shadows, replace lab() with a standard color
                const newValue = value.replace(/lab\([^)]+\)/g, "#03215F");
                el.style.setProperty(prop, newValue, "important");
              } else {
                el.style.setProperty(prop, "#03215F", "important");
              }
            }
          } catch (e) {
            // Ignore individual property errors
          }
        });
      } catch (e) {
        // Ignore getComputedStyle errors
      }

      // Also check inline styles
      if (el.style) {
        for (let i = 0; i < el.style.length; i++) {
          const prop = el.style[i];
          const value = el.style.getPropertyValue(prop);
          if (
            value &&
            (value.includes("lab(") ||
              value.includes("lab ") ||
              /lab\([^)]+\)/.test(value))
          ) {
            if (
              prop.includes("color") &&
              !prop.includes("background") &&
              !prop.includes("border")
            ) {
              el.style.setProperty(prop, "#ffffff", "important");
            } else {
              el.style.setProperty(prop, "#03215F", "important");
            }
          }
        }
      }
    });

    // Also use the replaceLabColors function as a fallback
    replaceLabColors(element);
  };

  // Download Membership Card Image
  const downloadMembershipCard = async () => {
    if (!cardRef.current) return;

    // Only allow active paid members to download the card
    if (!user || user.membership_type === "free" || user.membership_status !== "active") {
      toast.error("Membership card is available for active paid members only.");
      return;
    }

    try {
      toast.loading("Generating membership card image...");

      // Process all stylesheets first to replace lab() colors
      processStylesheets();

      // Inject a global style to override all lab() colors
      const globalStyle = document.createElement("style");
      globalStyle.id = "lab-color-override";
      globalStyle.textContent = `
        * {
          /* Force override any lab() colors with standard hex */
        }
        [class*="max-w-[420px]"] * {
          color: inherit !important;
          background-color: inherit !important;
          border-color: inherit !important;
        }
      `;
      document.head.appendChild(globalStyle);

      // Pre-process the element to remove lab() colors BEFORE html2canvas
      preprocessElementForCapture(cardRef.current);

      // Wait for images and canvas to load
      const images = cardRef.current.querySelectorAll("img");
      const canvases = cardRef.current.querySelectorAll("canvas");

      // Wait for images
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if image fails
            setTimeout(resolve, 2000); // Timeout after 2 seconds
          });
        }),
      );

      // Small delay to ensure QR code canvas is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use html2canvas to capture the card
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 3,
        letterRendering: true,
        logging: false,
        useCORS: true,
        allowTaint: false,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        imageTimeout: 15000,
        removeContainer: true,
        onclone: (clonedDoc) => {
          // Replace lab() color functions in the cloned document
          const clonedWindow =
            clonedDoc.defaultView || clonedDoc.parentWindow || window;

          // Inject a comprehensive style to override any lab() colors
          const style = clonedDoc.createElement("style");
          style.textContent = `
            * {
              /* Force all colors to standard hex values */
            }
            /* Replace any lab() in computed styles */
          `;
          clonedDoc.head.appendChild(style);

          // Process all elements and force replace lab() colors
          const allElements = clonedDoc.querySelectorAll("*");
          allElements.forEach((el) => {
            // Get computed style and force replace
            try {
              const computedStyle = clonedWindow.getComputedStyle(el);
              const colorProps = [
                "color",
                "backgroundColor",
                "borderColor",
                "borderTopColor",
                "borderRightColor",
                "borderBottomColor",
                "borderLeftColor",
                "fill",
                "stroke",
                "outlineColor",
              ];

              colorProps.forEach((prop) => {
                try {
                  const value = computedStyle.getPropertyValue(prop);
                  if (
                    value &&
                    (value.includes("lab(") ||
                      value.includes("lab ") ||
                      (value.includes("rgb(") && value.includes("lab")))
                  ) {
                    // Force set a standard color
                    if (prop === "color" || prop === "fill") {
                      el.style.setProperty(prop, "#ffffff", "important");
                    } else if (prop.includes("background")) {
                      el.style.setProperty(prop, "#03215F", "important");
                    } else {
                      el.style.setProperty(prop, "#03215F", "important");
                    }
                  }
                } catch (e) {
                  // Ignore
                }
              });
            } catch (e) {
              // Ignore
            }

            // Also use the replaceLabColors function
            replaceLabColors(el, clonedWindow);
          });

          // Also replace in stylesheets - more aggressive approach
          try {
            const styleSheets = clonedDoc.styleSheets || [];
            Array.from(styleSheets).forEach((sheet) => {
              try {
                const rules = sheet.cssRules || sheet.rules || [];
                Array.from(rules).forEach((rule) => {
                  if (rule.style) {
                    for (let i = 0; i < rule.style.length; i++) {
                      const prop = rule.style[i];
                      const value = rule.style.getPropertyValue(prop);
                      if (
                        value &&
                        (value.includes("lab(") || value.includes("lab "))
                      ) {
                        if (
                          prop.includes("color") &&
                          !prop.includes("background") &&
                          !prop.includes("border")
                        ) {
                          rule.style.setProperty(prop, "#ffffff", "important");
                        } else {
                          rule.style.setProperty(prop, "#03215F", "important");
                        }
                      }
                    }
                  }
                  // Also check cssText for lab() functions and replace them
                  if (
                    rule.cssText &&
                    (rule.cssText.includes("lab(") ||
                      rule.cssText.includes("lab "))
                  ) {
                    rule.cssText = rule.cssText.replace(
                      /lab\([^)]+\)/g,
                      (match) => {
                        if (
                          rule.cssText.includes("color:") &&
                          !rule.cssText.includes("background") &&
                          !rule.cssText.includes("border")
                        ) {
                          return "#ffffff";
                        }
                        return "#03215F";
                      },
                    );
                  }
                });
              } catch (e) {
                // Ignore cross-origin stylesheet errors
              }
            });
          } catch (e) {
            // Ignore stylesheet access errors
          }
        },
      });

      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `BDS-Membership-Card-${
        user?.membership_code || "card"
      }.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Remove the global style override
      const styleOverride = document.getElementById("lab-color-override");
      if (styleOverride) {
        styleOverride.remove();
      }

      toast.dismiss();
      toast.success("Membership card downloaded!");
    } catch (error) {
      console.error("Error downloading card:", error);
      toast.dismiss();
      toast.error("Failed to download membership card");

      // Remove the global style override on error too
      const styleOverride = document.getElementById("lab-color-override");
      if (styleOverride) {
        styleOverride.remove();
      }
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;

    // Only allow active paid members to download the card as PDF
    if (!user || user.membership_type === "free" || user.membership_status !== "active") {
      toast.error("Membership card is available for active paid members only.");
      return;
    }

    try {
      toast.loading("Generating membership card PDF...");

      // Process all stylesheets first to replace lab() colors
      processStylesheets();

      // Inject a global style to override all lab() colors
      const globalStyle = document.createElement("style");
      globalStyle.id = "lab-color-override";
      globalStyle.textContent = `
        * {
          /* Force override any lab() colors with standard hex */
        }
        [class*="max-w-[420px]"] * {
          color: inherit !important;
          background-color: inherit !important;
          border-color: inherit !important;
        }
      `;
      document.head.appendChild(globalStyle);

      // Pre-process the element to remove lab() colors BEFORE html2canvas
      preprocessElementForCapture(cardRef.current);

      // Wait for images and canvas to load
      const images = cardRef.current.querySelectorAll("img");
      const canvases = cardRef.current.querySelectorAll("canvas");

      // Wait for images
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if image fails
            setTimeout(resolve, 2000); // Timeout after 2 seconds
          });
        }),
      );

      // Small delay to ensure QR code canvas is fully rendered
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use html2canvas and jspdf to create PDF
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 3,
        letterRendering: true,
        logging: false,
        useCORS: true,
        allowTaint: false,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        imageTimeout: 15000,
        removeContainer: true,
        onclone: (clonedDoc) => {
          // Replace lab() color functions in the cloned document
          const clonedWindow =
            clonedDoc.defaultView || clonedDoc.parentWindow || window;

          // Inject a comprehensive style to override any lab() colors
          const style = clonedDoc.createElement("style");
          style.textContent = `
            * {
              /* Force all colors to standard hex values */
            }
            /* Replace any lab() in computed styles */
          `;
          clonedDoc.head.appendChild(style);

          // Process all elements and force replace lab() colors
          const allElements = clonedDoc.querySelectorAll("*");
          allElements.forEach((el) => {
            // Get computed style and force replace
            try {
              const computedStyle = clonedWindow.getComputedStyle(el);
              const colorProps = [
                "color",
                "backgroundColor",
                "borderColor",
                "borderTopColor",
                "borderRightColor",
                "borderBottomColor",
                "borderLeftColor",
                "fill",
                "stroke",
                "outlineColor",
              ];

              colorProps.forEach((prop) => {
                try {
                  const value = computedStyle.getPropertyValue(prop);
                  if (
                    value &&
                    (value.includes("lab(") ||
                      value.includes("lab ") ||
                      (value.includes("rgb(") && value.includes("lab")))
                  ) {
                    // Force set a standard color
                    if (prop === "color" || prop === "fill") {
                      el.style.setProperty(prop, "#ffffff", "important");
                    } else if (prop.includes("background")) {
                      el.style.setProperty(prop, "#03215F", "important");
                    } else {
                      el.style.setProperty(prop, "#03215F", "important");
                    }
                  }
                } catch (e) {
                  // Ignore
                }
              });
            } catch (e) {
              // Ignore
            }

            // Also use the replaceLabColors function
            replaceLabColors(el, clonedWindow);
          });

          // Also replace in stylesheets - more aggressive approach
          try {
            const styleSheets = clonedDoc.styleSheets || [];
            Array.from(styleSheets).forEach((sheet) => {
              try {
                const rules = sheet.cssRules || sheet.rules || [];
                Array.from(rules).forEach((rule) => {
                  if (rule.style) {
                    for (let i = 0; i < rule.style.length; i++) {
                      const prop = rule.style[i];
                      const value = rule.style.getPropertyValue(prop);
                      if (
                        value &&
                        (value.includes("lab(") || value.includes("lab "))
                      ) {
                        if (
                          prop.includes("color") &&
                          !prop.includes("background") &&
                          !prop.includes("border")
                        ) {
                          rule.style.setProperty(prop, "#ffffff", "important");
                        } else {
                          rule.style.setProperty(prop, "#03215F", "important");
                        }
                      }
                    }
                  }
                  // Also check cssText for lab() functions and replace them
                  if (
                    rule.cssText &&
                    (rule.cssText.includes("lab(") ||
                      rule.cssText.includes("lab "))
                  ) {
                    rule.cssText = rule.cssText.replace(
                      /lab\([^)]+\)/g,
                      (match) => {
                        if (
                          rule.cssText.includes("color:") &&
                          !rule.cssText.includes("background") &&
                          !rule.cssText.includes("border")
                        ) {
                          return "#ffffff";
                        }
                        return "#03215F";
                      },
                    );
                  }
                });
              } catch (e) {
                // Ignore cross-origin stylesheet errors
              }
            });
          } catch (e) {
            // Ignore stylesheet access errors
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      // Create A4 portrait PDF and center the card within margins
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15; // mm
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      // Convert canvas px to mm
      const pxToMm = (px) => px * 0.264583;
      const imgWidthMm = pxToMm(canvas.width);
      const imgHeightMm = pxToMm(canvas.height);

      const scale = Math.min(
        usableWidth / imgWidthMm,
        usableHeight / imgHeightMm,
      );
      const renderWidth = imgWidthMm * scale;
      const renderHeight = imgHeightMm * scale;
      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);
      pdf.save(`BDS-Membership-Card-${user?.membership_code || "card"}.pdf`);

      // Remove the global style override
      const styleOverride = document.getElementById("lab-color-override");
      if (styleOverride) {
        styleOverride.remove();
      }

      toast.dismiss();
      toast.success("Membership card PDF downloaded!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.dismiss();

      // Remove the global style override on error too
      const styleOverride = document.getElementById("lab-color-override");
      if (styleOverride) {
        styleOverride.remove();
      }

      // Fallback to image download
      downloadMembershipCard();
    }
  };

  const handleCopyId = () => {
    if (!user || user.membership_type === "free" || user.membership_status !== "active") {
      toast.error("Membership ID is available only for active paid members.");
      return;
    }

    if (user.membership_code) {
      navigator.clipboard.writeText(user.membership_code);
      setCopied(true);
      toast.success("Membership ID copied!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePrint = () => {
    if (!cardRef.current) return;

    // Clone the card element
    const printContent = cardRef.current.cloneNode(true);

    // Replace canvases (e.g., QRCodeCanvas) with images so they render in the print document
    try {
      const sourceCanvases = cardRef.current.querySelectorAll("canvas");
      const targetCanvases = printContent.querySelectorAll("canvas");
      const count = Math.min(sourceCanvases.length, targetCanvases.length);
      for (let i = 0; i < count; i++) {
        const srcCanvas = sourceCanvases[i];
        const tgtCanvas = targetCanvases[i];
        const dataUrl = srcCanvas.toDataURL("image/png");
        const img = document.createElement("img");
        img.src = dataUrl;
        // Preserve size
        const rect = srcCanvas.getBoundingClientRect();
        img.style.width = rect.width
          ? rect.width + "px"
          : srcCanvas.width
            ? srcCanvas.width + "px"
            : "100px";
        img.style.height = rect.height
          ? rect.height + "px"
          : srcCanvas.height
            ? srcCanvas.height + "px"
            : "100px";
        img.style.display = "block";
        img.style.imageRendering = "auto";
        tgtCanvas.parentNode?.replaceChild(img, tgtCanvas);
      }
    } catch (e) {
      // Ignore canvas replacement errors; continue with regular print content
    }
    // Keep natural sizing; will be centered on A4 during print

    // Remove any modern color functions from inline styles
    const allElements = printContent.querySelectorAll("*");
    allElements.forEach((el) => {
      replaceLabColors(el);
    });

    // Get all stylesheets and clean them
    let stylesheets = "";
    try {
      stylesheets = Array.from(document.styleSheets)
        .map((sheet) => {
          try {
            return Array.from(sheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch (e) {
            return "";
          }
        })
        .join("\n")
        .replace(/lab\([^)]+\)/g, (match, offset, string) => {
          // Try to determine appropriate replacement based on context
          // Check the property name before the lab() function
          const beforeMatch = string.substring(
            Math.max(0, offset - 50),
            offset,
          );
          if (
            beforeMatch.match(/color\s*:/) &&
            !beforeMatch.match(/background|border/)
          ) {
            return "#ffffff";
          }
          if (beforeMatch.match(/background/)) {
            return "#03215F";
          }
          if (beforeMatch.match(/border/)) {
            return "#03215F";
          }
          // Default to white for text colors, dark for backgrounds
          return "#ffffff";
        });
    } catch (e) {
      console.warn("Could not extract stylesheets:", e);
    }

    // Print the membership card
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>BDS Membership Card</title>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                margin: 0 !important;
                padding: 0 !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                min-height: 100vh !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
            body {
              margin: 0 !important;
              padding: 20px !important;
              display: flex !important;
              justify-content: center !important;
              align-items: center !important;
              min-height: 100vh !important;
              font-family: Arial, sans-serif;
              background: white;
            }
            
            ${stylesheets}
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 100);
    }, 250);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#03215F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading membership card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      <div className="space-y-6 pb-20 md:pb-6 ">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Membership Card
              </h1>
              <p className="text-white/80">
                {isFreeMember
                  ? "Upgrade your membership to get your official membership card"
                  : "Your digital membership card and benefits"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {!isFreeMember && (
                <button
                  onClick={handleCopyId}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center hover:scale-105 active:scale-95"
                >
                  {/* Only show Member ID for active paid members with a code */}
                  {!isFreeMember && user?.membership_status === "active" && user?.membership_code ? (
                    <CheckCircle className="w-5 h-5 mr-2 text-[#AE9B66]" />
                  ) : (
                    <Copy className="w-5 h-5 mr-2" />
                  )}
                  <span className="text-sm font-medium">
                    {copied ? "Copied!" : "Copy ID"}
                  </span>
                </button>
              )}
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center hover:scale-105 active:scale-95"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print
              </button>

              {isFreeMember && (
                <button
                  onClick={handleUpgradeClick}
                  className="px-4 py-2 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] text-[#03215F] rounded-lg font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Crown className="w-5 h-5 text-[#03215F]" />
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade Banner for Free Members */}
        {isFreeMember && (
          <div className="bg-gradient-to-r from-[#ECCF0F]/10 to-[#ECCF0F]/10 rounded-xl p-6 border border-[#ECCF0F]/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] rounded-xl">
                  <Crown className="w-8 h-8 text-[#03215F]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Unlock Full Membership Benefits
                  </h3>
                  <p className="text-gray-600">
                    Upgrade your membership for exclusive features including
                    membership card, event discounts, and more
                  </p>
                </div>
              </div>

              <button
                onClick={handleUpgradeClick}
                className="px-6 py-3 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] text-[#03215F] rounded-lg font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <ArrowRight className="w-5 h-5" />
                View Plans
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Card and Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Membership Card Display */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col items-center">
                <div ref={cardRef}>
                  <MembershipCard
                    user={user}
                    qrRef={qrRef}
                    isFreeMember={isFreeMember}
                    onUpgradeClick={handleUpgradeClick}
                    planName={planName}
                    isExpired={isExpired}
                  />
                </div>

                {/* Free Member Info */}
                {isFreeMember && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ECCF0F]/20 border border-[#ECCF0F]/30 rounded-lg">
                      <Lock className="w-4 h-4 text-[#ECCF0F]" />
                      <span className="text-sm text-gray-700 font-medium">
                        Upgrade your membership to unlock QR code verification
                      </span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-0 mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {isFreeMember
                      ? "Standard Membership"
                      : "Digital Membership Card"}
                  </h3>
                  <p className="text-gray-600">
                    {isFreeMember
                      ? "Upgrade your membership to get your official membership card with QR code verification"
                      : "This is your official BDS membership card. Show the QR code at events for verification."}
                  </p>
                </div>

                {/* Verification Documents Upload Section - Only for Paid Members */}
                {!isFreeMember && (
                  <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-[#03215F] to-[#03215F] rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Member Verification
                        </h3>
                        <p className="text-sm text-gray-600">
                          Upload your documents for verification. Admin will
                          review and verify your account.
                        </p>
                      </div>
                    </div>

                    {verificationData?.is_member_verified && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Your account has been verified
                          </span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                          Your documents are locked and cannot be edited or
                          deleted after verification.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 hidden">
                      {/* ID Card Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ID Card (CPR) Copy
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleIdCardChange}
                            className="hidden"
                            id="id-card-upload"
                            disabled={
                              uploadingDocs ||
                              verificationData?.is_member_verified
                            }
                          />
                          <label
                            htmlFor="id-card-upload"
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg transition-colors ${
                              verificationData?.is_member_verified
                                ? "cursor-not-allowed opacity-50 bg-gray-100"
                                : "cursor-pointer hover:bg-gray-50"
                            }`}
                          >
                            {idCardPreview ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={idCardPreview}
                                  alt="ID Card preview"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                {!verificationData?.is_member_verified && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIdCardFile(null);
                                      setIdCardPreview(
                                        verificationData?.id_card_url || null,
                                      );
                                    }}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">
                                  {verificationData?.id_card_url
                                    ? "View Uploaded"
                                    : "Click to upload"}
                                </p>
                              </>
                            )}
                          </label>
                        </div>
                        {verificationData?.id_card_url && !idCardFile && (
                          <a
                            href={verificationData.id_card_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-sm text-[#03215F] hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-4 h-4" />
                            View uploaded document
                          </a>
                        )}
                      </div>

                      {/* Personal Photo Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Personal Picture
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePersonalPhotoChange}
                            className="hidden"
                            id="personal-photo-upload"
                            disabled={
                              uploadingDocs ||
                              verificationData?.is_member_verified
                            }
                          />
                          <label
                            htmlFor="personal-photo-upload"
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg transition-colors ${
                              verificationData?.is_member_verified
                                ? "cursor-not-allowed opacity-50 bg-gray-100"
                                : "cursor-pointer hover:bg-gray-50"
                            }`}
                          >
                            {personalPhotoPreview ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={personalPhotoPreview}
                                  alt="Personal photo preview"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                {!verificationData?.is_member_verified && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPersonalPhotoFile(null);
                                      setPersonalPhotoPreview(
                                        verificationData?.personal_photo_url ||
                                          null,
                                      );
                                    }}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <>
                                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">
                                  {verificationData?.personal_photo_url
                                    ? "View Uploaded"
                                    : "Click to upload"}
                                </p>
                              </>
                            )}
                          </label>
                        </div>
                        {verificationData?.personal_photo_url &&
                          !personalPhotoFile && (
                            <a
                              href={verificationData.personal_photo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 text-sm text-[#03215F] hover:underline flex items-center gap-1"
                            >
                              <FileText className="w-4 h-4" />
                              View uploaded document
                            </a>
                          )}
                      </div>
                    </div>

                    {(idCardFile || personalPhotoFile) &&
                      !verificationData?.is_member_verified && (
                        <button
                          onClick={handleUploadDocuments}
                          disabled={
                            uploadingDocs ||
                            verificationData?.is_member_verified
                          }
                          className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {uploadingDocs ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5" />
                              Upload Documents
                            </>
                          )}
                        </button>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Details and Benefits */}
          <div className="space-y-6">
            {/* Membership Details */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 text-[#03215F] mr-2" />
                Membership Details
              </h3>

              <div className="space-y-4">
                {/* Only show Membership ID for paid members */}
                {!isFreeMember && (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg">
                    <div className="flex items-center">
                      <BadgeCheck className="w-4 h-4 text-gray-500 mr-3" />
                      <span className="text-gray-600">ID</span>
                    </div>
                    <span className="font-mono font-semibold text-gray-900">
                      {user.membership_code}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg">
                  <div className="flex items-center">
                    <Crown className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">Type</span>
                  </div>
                  <span
                    className={`font-semibold ${
                      !isFreeMember ? "text-[#03215F]" : "text-[#03215F]"
                    }`}
                  >
                    {planName || (!isFreeMember ? planName : "Free Membership")}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">Status</span>
                  </div>
                  {(() => {
                    const displayIsActive =
                      !isExpired && user?.membership_status === "active";
                    return (
                      <span
                        className={`font-semibold ${displayIsActive ? "text-[#AE9B66]" : "text-[#b8352d]"}`}
                      >
                        {displayIsActive ? "Active" : "Inactive"}
                      </span>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">Since</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {currentSubscription?.started_at
                      ? new Date(
                          currentSubscription.started_at,
                        ).toLocaleDateString("en-BH", {
                          year: "numeric",
                          month: "short",
                        })
                      : user?.membership_date
                        ? new Date(user.membership_date).toLocaleDateString(
                            "en-BH",
                            {
                              year: "numeric",
                              month: "short",
                            },
                          )
                        : "N/A"}
                  </span>
                </div>

                {currentSubscription?.expires_at && (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-500 mr-3" />
                      <span className="text-gray-600">Expires</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {new Date(
                        currentSubscription.expires_at,
                      ).toLocaleDateString("en-BH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Renew/Upgrade/Downgrade Buttons - only when expired */}
              {currentSubscription && !isFreeMember && isExpired && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <button
                    onClick={handleRenew}
                    disabled={processing}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5" />
                        Renew Subscription
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleUpgradeDowngradeClick}
                    disabled={processing}
                    className="w-full hidden px-4 py-3 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Upgrade/Downgrade Plan
                  </button>
                </div>
              )}
            </div>

            {isFreeMember && (
              <div className="bg-gradient-to-br from-[#ECCF0F]/10 to-[#ECCF0F]/10 rounded-xl p-6 border border-[#ECCF0F]/20">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Diamond className="w-5 h-5 text-[#ECCF0F] mr-2" />
                  Member Benefits
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                    <div className="p-2 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] rounded-lg">
                      <CreditCard className="w-4 h-4 text-[#03215F]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Membership Card
                      </h4>
                      <p className="text-xs text-gray-600">
                        Digital card with QR code
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                    <div className="p-2 bg-gradient-to-r from-[#03215F] to-[#b8352d] rounded-lg">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Event Discounts
                      </h4>
                      <p className="text-xs text-gray-600">
                        Up to 50% off on events
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                    <div className="p-2 bg-gradient-to-r from-[#AE9B66] to-[#AE9B66] rounded-lg">
                      <StarIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Priority Access
                      </h4>
                      <p className="text-xs text-gray-600">
                        Early event registration
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleUpgradeClick}
                    className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] text-[#03215F] rounded-lg font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Crown className="w-5 h-5 text-[#03215F]" />
                    Upgrade Membership
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Upgrade Button for Mobile */}
        {isFreeMember && (
          <div className="fixed bottom-0 left-0 right-0 md:hidden bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] shadow-lg z-50">
            <div className="p-4">
              <button
                onClick={handleUpgradeClick}
                className="w-full px-4 py-3 bg-white text-[#03215F] rounded-lg font-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5 text-[#03215F]" />
                Upgrade Membership
                <ArrowRight className="w-5 h-5 text-[#03215F]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Plan Selection Modal */}
      <PlanSelectionModal
        isOpen={showPlanModal}
        onClose={() => {
          setShowPlanModal(false);
        }}
        plans={plans}
        currentPlanId={
          currentSubscription?.subscription_plan?.id ||
          currentSubscription?.subscription_plan_id ||
          (currentSubscription?.subscription_plan_name &&
            plans.find(
              (p) =>
                p.display_name === currentSubscription.subscription_plan_name ||
                p.name ===
                  currentSubscription.subscription_plan_name
                    .toLowerCase()
                    .replace(/\s+/g, "_"),
            )?.id) ||
          null
        }
        loading={processing}
        onPlanSelect={handlePlanSelect}
      />

      {/* Payment Method Selection Modal */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentMethods([]);
          setPaymentData(null);
          setProcessing(false);
          setLoadingPaymentMethods(false);
        }}
        paymentMethods={paymentMethods}
        amount={paymentData?.amount || 0}
        currency="BHD"
        subscription_id={paymentData?.subscription_id}
        payment_id={paymentData?.payment_id}
        payment_type={paymentData?.payment_type}
        loading={loadingPaymentMethods}
        onPaymentExecute={handlePaymentExecute}
      />
    </div>
  );
}

// Helper component for XCircle
const XCircle = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
