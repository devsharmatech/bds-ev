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
} from "lucide-react";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import { useRouter } from "next/navigation";

// Membership Card Component
function MembershipCard({ user, qrRef, isFreeMember = false, onUpgradeClick }) {
  if (!user) return null;

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
        })
      : "N/A";

  return (
    <div className="relative w-full max-w-[420px] mx-auto rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-[#03215F] to-[#03215F] text-white isolate">
      {/* 🔒 Locked Badge for Free Members - Non-blocking */}
      {isFreeMember && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs font-semibold">
          <Lock className="w-3 h-3" />
          <span>Locked</span>
        </div>
      )}

      <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#9cc2ed]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#9cc2ed]/25 rounded-full blur-3xl pointer-events-none" />

      {/* 📇 Card Content */}
      <div className="relative z-10 p-3 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center">
              <img
                src="/logo.png"
                alt="BDS Logo"
                className="w-10 h-10 object-contain"
                crossOrigin="anonymous"
              />
            </div>

            <div>
              <p className="text-sm font-bold tracking-wide uppercase">BDS</p>
              <p className="text-[11px] text-[#9cc2ed] uppercase tracking-widest">
                Official Member
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
              ${
                user.membership_status === "active"
                  ? "bg-[#AE9B66]/20 text-white"
                  : "bg-[#b8352d]/20 text-white"
              }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                user.membership_status === "active"
                  ? "bg-[#AE9B66] animate-pulse"
                  : "bg-[#b8352d]"
              }`}
            />
            {user.membership_status}
          </div>
        </div>

        {/* Body */}
        <div className="flex justify-between gap-4 items-end min-w-0">
          <div className="flex-1 space-y-1 min-w-0">
            <div>
              <p className="text-[11px] text-gray-100 uppercase">Member Name</p>
              <h2 className="text-lg font-bold uppercase truncate max-w-full">
                {user.full_name}
              </h2>
            </div>

            <p className="font-mono text-sm tracking-widest">
              {user.membership_code}
            </p>

            <div className="text-sm">
              <p className="text-gray-100 uppercase text-[11px]">Expires</p>
              <p className="font-mono">
                {formatDate(user.membership_expiry_date)}
              </p>
            </div>

            <p className="text-sm font-semibold text-[#ECCF0F] uppercase">
              {user.membership_type === "paid"
                ? "Premium Member"
                : "Standard Member"}
            </p>
          </div>

          {/* QR */}
          <div
            ref={qrRef}
            className="bg-white p-2 rounded-lg shadow-md"
          >
            {isFreeMember ? (
              <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded border-2 border-dashed border-gray-400">
                <Lock className="w-8 h-8 text-gray-500" />
              </div>
            ) : (
              <QRCodeCanvas value={qrValue} size={72} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MembershipCardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);
  const cardRef = useRef(null);
  const router = useRouter();

  const isFreeMember = user?.membership_type === "free";

  useEffect(() => {
    fetchMembershipData();
  }, []);

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
        }
      }
    } catch (error) {
      console.error("Error fetching membership data:", error);
      toast.error("Failed to load membership information");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    // Redirect to membership upgrade page or show upgrade modal
    toast.loading("Redirecting to membership upgrade...");
    setTimeout(() => {
      router.push("/membership");
    }, 1000);
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
        
        if (value && (value.includes('lab(') || value.includes('lab '))) {
          // Determine replacement based on property
          if (prop.includes('color') && !prop.includes('background') && !prop.includes('border')) {
            style.setProperty(prop, '#ffffff', 'important');
          } else if (prop.includes('background')) {
            style.setProperty(prop, '#03215F', 'important');
          } else if (prop.includes('border')) {
            style.setProperty(prop, '#03215F', 'important');
          } else {
            style.setProperty(prop, '#03215F', 'important');
          }
        }
      }
      
      // Also check direct style properties and replace lab() in values
      const styleProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'fill', 'stroke'];
      styleProps.forEach(prop => {
        try {
          const value = style[prop] || style.getPropertyValue(prop);
          if (value && (value.includes('lab(') || value.includes('lab '))) {
            if (prop === 'color' || prop === 'fill') {
              style.setProperty(prop, '#ffffff', 'important');
            } else {
              style.setProperty(prop, '#03215F', 'important');
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
      ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'fill', 'stroke'].forEach(prop => {
        try {
          const value = computedStyle.getPropertyValue(prop);
          if (value && (value.includes('lab(') || value.includes('lab '))) {
            element.style.setProperty(prop, prop === 'color' || prop === 'fill' ? '#ffffff' : '#03215F', 'important');
          }
        } catch (e) {
          // Ignore errors for individual properties
        }
      });
    } catch (e) {
      // Ignore if getComputedStyle is not available
    }
    
    // Recursively process children
    Array.from(element.children || []).forEach(child => {
      replaceLabColors(child, clonedWindow);
    });
  };

  // Process all stylesheets to replace lab() colors
  const processStylesheets = () => {
    try {
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach(sheet => {
        try {
          const rules = sheet.cssRules || sheet.rules || [];
          Array.from(rules).forEach(rule => {
            if (rule.style) {
              for (let i = 0; i < rule.style.length; i++) {
                const prop = rule.style[i];
                const value = rule.style.getPropertyValue(prop);
                if (value && (value.includes('lab(') || value.includes('lab ') || /lab\([^)]+\)/.test(value))) {
                  if (prop.includes('color') && !prop.includes('background') && !prop.includes('border')) {
                    rule.style.setProperty(prop, '#ffffff', 'important');
                  } else {
                    rule.style.setProperty(prop, '#03215F', 'important');
                  }
                }
              }
            }
            // Also process cssText
            if (rule.cssText && (rule.cssText.includes('lab(') || rule.cssText.includes('lab '))) {
              rule.cssText = rule.cssText.replace(/lab\([^)]+\)/g, (match) => {
                if (rule.cssText.includes('color:') && !rule.cssText.includes('background') && !rule.cssText.includes('border')) {
                  return '#ffffff';
                }
                return '#03215F';
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
    const allElements = [element, ...Array.from(element.querySelectorAll('*'))];
    
    allElements.forEach(el => {
      // Get computed style and force replace lab() colors
      try {
        const computedStyle = window.getComputedStyle(el);
        const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'fill', 'stroke', 'outlineColor', 'boxShadow', 'textShadow'];
        
        colorProps.forEach(prop => {
          try {
            const value = computedStyle.getPropertyValue(prop);
            // Check for lab() in any form
            if (value && (value.includes('lab(') || value.includes('lab ') || /lab\([^)]+\)/.test(value))) {
              // Force set a standard color based on property type
              if (prop === 'color' || prop === 'fill') {
                el.style.setProperty(prop, '#ffffff', 'important');
              } else if (prop.includes('background')) {
                el.style.setProperty(prop, '#03215F', 'important');
              } else if (prop.includes('border')) {
                el.style.setProperty(prop, '#03215F', 'important');
              } else if (prop.includes('shadow')) {
                // For shadows, replace lab() with a standard color
                const newValue = value.replace(/lab\([^)]+\)/g, '#03215F');
                el.style.setProperty(prop, newValue, 'important');
              } else {
                el.style.setProperty(prop, '#03215F', 'important');
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
          if (value && (value.includes('lab(') || value.includes('lab ') || /lab\([^)]+\)/.test(value))) {
            if (prop.includes('color') && !prop.includes('background') && !prop.includes('border')) {
              el.style.setProperty(prop, '#ffffff', 'important');
            } else {
              el.style.setProperty(prop, '#03215F', 'important');
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

    try {
      toast.loading("Generating membership card image...");
      
      // Process all stylesheets first to replace lab() colors
      processStylesheets();
      
      // Inject a global style to override all lab() colors
      const globalStyle = document.createElement('style');
      globalStyle.id = 'lab-color-override';
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
      const images = cardRef.current.querySelectorAll('img');
      const canvases = cardRef.current.querySelectorAll('canvas');
      
      // Wait for images
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if image fails
            setTimeout(resolve, 2000); // Timeout after 2 seconds
          });
        })
      );
      
      // Small delay to ensure QR code canvas is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use html2canvas to capture the card
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        imageTimeout: 15000,
        removeContainer: true,
        onclone: (clonedDoc) => {
          // Replace lab() color functions in the cloned document
          const clonedWindow = clonedDoc.defaultView || clonedDoc.parentWindow || window;
          
          // Inject a comprehensive style to override any lab() colors
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              /* Force all colors to standard hex values */
            }
            /* Replace any lab() in computed styles */
          `;
          clonedDoc.head.appendChild(style);
          
          // Process all elements and force replace lab() colors
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            // Get computed style and force replace
            try {
              const computedStyle = clonedWindow.getComputedStyle(el);
              const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'fill', 'stroke', 'outlineColor'];
              
              colorProps.forEach(prop => {
                try {
                  const value = computedStyle.getPropertyValue(prop);
                  if (value && (value.includes('lab(') || value.includes('lab ') || value.includes('rgb(') && value.includes('lab'))) {
                    // Force set a standard color
                    if (prop === 'color' || prop === 'fill') {
                      el.style.setProperty(prop, '#ffffff', 'important');
                    } else if (prop.includes('background')) {
                      el.style.setProperty(prop, '#03215F', 'important');
                    } else {
                      el.style.setProperty(prop, '#03215F', 'important');
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
            Array.from(styleSheets).forEach(sheet => {
              try {
                const rules = sheet.cssRules || sheet.rules || [];
                Array.from(rules).forEach(rule => {
                  if (rule.style) {
                    for (let i = 0; i < rule.style.length; i++) {
                      const prop = rule.style[i];
                      const value = rule.style.getPropertyValue(prop);
                      if (value && (value.includes('lab(') || value.includes('lab '))) {
                        if (prop.includes('color') && !prop.includes('background') && !prop.includes('border')) {
                          rule.style.setProperty(prop, '#ffffff', 'important');
                        } else {
                          rule.style.setProperty(prop, '#03215F', 'important');
                        }
                      }
                    }
                  }
                  // Also check cssText for lab() functions and replace them
                  if (rule.cssText && (rule.cssText.includes('lab(') || rule.cssText.includes('lab '))) {
                    rule.cssText = rule.cssText.replace(/lab\([^)]+\)/g, (match) => {
                      if (rule.cssText.includes('color:') && !rule.cssText.includes('background') && !rule.cssText.includes('border')) {
                        return '#ffffff';
                      }
                      return '#03215F';
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
        }
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
      const styleOverride = document.getElementById('lab-color-override');
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
      const styleOverride = document.getElementById('lab-color-override');
      if (styleOverride) {
        styleOverride.remove();
      }
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;

    try {
      toast.loading("Generating membership card PDF...");
      
      // Process all stylesheets first to replace lab() colors
      processStylesheets();
      
      // Inject a global style to override all lab() colors
      const globalStyle = document.createElement('style');
      globalStyle.id = 'lab-color-override';
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
      const images = cardRef.current.querySelectorAll('img');
      const canvases = cardRef.current.querySelectorAll('canvas');
      
      // Wait for images
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if image fails
            setTimeout(resolve, 2000); // Timeout after 2 seconds
          });
        })
      );
      
      // Small delay to ensure QR code canvas is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use html2canvas and jspdf to create PDF
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        imageTimeout: 15000,
        removeContainer: true,
        onclone: (clonedDoc) => {
          // Replace lab() color functions in the cloned document
          const clonedWindow = clonedDoc.defaultView || clonedDoc.parentWindow || window;
          
          // Inject a comprehensive style to override any lab() colors
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              /* Force all colors to standard hex values */
            }
            /* Replace any lab() in computed styles */
          `;
          clonedDoc.head.appendChild(style);
          
          // Process all elements and force replace lab() colors
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            // Get computed style and force replace
            try {
              const computedStyle = clonedWindow.getComputedStyle(el);
              const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'fill', 'stroke', 'outlineColor'];
              
              colorProps.forEach(prop => {
                try {
                  const value = computedStyle.getPropertyValue(prop);
                  if (value && (value.includes('lab(') || value.includes('lab ') || value.includes('rgb(') && value.includes('lab'))) {
                    // Force set a standard color
                    if (prop === 'color' || prop === 'fill') {
                      el.style.setProperty(prop, '#ffffff', 'important');
                    } else if (prop.includes('background')) {
                      el.style.setProperty(prop, '#03215F', 'important');
                    } else {
                      el.style.setProperty(prop, '#03215F', 'important');
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
            Array.from(styleSheets).forEach(sheet => {
              try {
                const rules = sheet.cssRules || sheet.rules || [];
                Array.from(rules).forEach(rule => {
                  if (rule.style) {
                    for (let i = 0; i < rule.style.length; i++) {
                      const prop = rule.style[i];
                      const value = rule.style.getPropertyValue(prop);
                      if (value && (value.includes('lab(') || value.includes('lab '))) {
                        if (prop.includes('color') && !prop.includes('background') && !prop.includes('border')) {
                          rule.style.setProperty(prop, '#ffffff', 'important');
                        } else {
                          rule.style.setProperty(prop, '#03215F', 'important');
                        }
                      }
                    }
                  }
                  // Also check cssText for lab() functions and replace them
                  if (rule.cssText && (rule.cssText.includes('lab(') || rule.cssText.includes('lab '))) {
                    rule.cssText = rule.cssText.replace(/lab\([^)]+\)/g, (match) => {
                      if (rule.cssText.includes('color:') && !rule.cssText.includes('background') && !rule.cssText.includes('border')) {
                        return '#ffffff';
                      }
                      return '#03215F';
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
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [canvas.width * 0.264583, canvas.height * 0.264583]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * 0.264583, canvas.height * 0.264583);
      pdf.save(`BDS-Membership-Card-${user?.membership_code || "card"}.pdf`);

      // Remove the global style override
      const styleOverride = document.getElementById('lab-color-override');
      if (styleOverride) {
        styleOverride.remove();
      }

      toast.dismiss();
      toast.success("Membership card PDF downloaded!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.dismiss();
      
      // Remove the global style override on error too
      const styleOverride = document.getElementById('lab-color-override');
      if (styleOverride) {
        styleOverride.remove();
      }
      
      // Fallback to image download
      downloadMembershipCard();
    }
  };

  const handleShareCard = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My BDS Membership Card",
          text: `I'm a member of Bahrain Dental Society. My membership ID: ${user?.membership_code}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCopyId = () => {
    if (user?.membership_code) {
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
    
    // Remove any modern color functions from inline styles
    const allElements = printContent.querySelectorAll('*');
    allElements.forEach(el => {
      replaceLabColors(el);
    });

    // Get all stylesheets and clean them
    let stylesheets = '';
    try {
      stylesheets = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            return '';
          }
        })
        .join('\n')
        .replace(/lab\([^)]+\)/g, (match, offset, string) => {
          // Try to determine appropriate replacement based on context
          // Check the property name before the lab() function
          const beforeMatch = string.substring(Math.max(0, offset - 50), offset);
          if (beforeMatch.match(/color\s*:/) && !beforeMatch.match(/background|border/)) {
            return '#ffffff';
          }
          if (beforeMatch.match(/background/)) {
            return '#03215F';
          }
          if (beforeMatch.match(/border/)) {
            return '#03215F';
          }
          // Default to white for text colors, dark for backgrounds
          return '#ffffff';
        });
    } catch (e) {
      console.warn('Could not extract stylesheets:', e);
    }

    // Print the membership card
    const printWindow = window.open('', '_blank');
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
                size: landscape;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
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
          <p className="text-gray-600">
            Loading membership card...
          </p>
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
                  ? "Upgrade to premium for your official membership card"
                  : "Your digital membership card and benefits"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center hover:scale-105 active:scale-95"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF
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
                    Unlock Premium Benefits
                  </h3>
                  <p className="text-gray-600">
                    Upgrade to premium for exclusive features including
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
                  />
                </div>

                {/* Free Member Info */}
                {isFreeMember && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ECCF0F]/20 border border-[#ECCF0F]/30 rounded-lg">
                      <Lock className="w-4 h-4 text-[#ECCF0F]" />
                      <span className="text-sm text-gray-700 font-medium">
                        Upgrade to premium to unlock QR code verification
                      </span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-8 mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {isFreeMember
                      ? "Standard Membership"
                      : "Digital Membership Card"}
                  </h3>
                  <p className="text-gray-600">
                    {isFreeMember
                      ? "Upgrade to premium to get your official membership card with QR code verification"
                      : "This is your official BDS membership card. Show the QR code at events for verification."}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-lg justify-content-center">
                  <button
                    onClick={handleDownloadPDF}
                    className="p-4 rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex flex-col items-center bg-gradient-to-r from-[#03215F] to-[#03215F] text-white"
                  >
                    <Download className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">
                      Download PDF
                    </span>
                  </button>

                  <button
                    onClick={handleCopyId}
                    className="p-4 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex flex-col items-center"
                  >
                    {copied ? (
                      <CheckCircle className="w-6 h-6 mb-2 text-[#AE9B66]" />
                    ) : (
                      <Copy className="w-6 h-6 mb-2" />
                    )}
                    <span className="text-sm font-medium">
                      {copied ? "Copied!" : "Copy ID"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Membership Comparison */}
            {isFreeMember && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="w-6 h-6 text-[#03215F] mr-3" />
                Membership Comparison
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Free Plan */}
                <div
                  className={`p-6 rounded-xl border-2 ${
                    isFreeMember
                      ? "border-[#9cc2ed] bg-[#9cc2ed]"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900">
                      Standard
                    </h4>
                    <div className="px-3 py-1 bg-[#9cc2ed] text-[#03215F] rounded-full text-sm font-medium">
                      Free
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#AE9B66] mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        Event Registration
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#AE9B66] mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        Basic Certificates
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#AE9B66] mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        Panel Access
                      </span>
                    </div>
                    <div className="flex items-center">
                      <XCircle className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-500">
                        Membership Card
                      </span>
                    </div>
                    <div className="flex items-center">
                      <XCircle className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-500">
                        Event Discounts
                      </span>
                    </div>
                  </div>

                  {isFreeMember && (
                    <div className="text-center px-3 py-2 bg-[#9cc2ed] rounded-lg">
                      <span className="text-[#03215F] font-medium">
                        Current Plan
                      </span>
                    </div>
                  )}
                </div>

                {/* Premium Plan */}
                <div
                  className={`p-6 rounded-xl border-2 ${
                    !isFreeMember
                      ? "border-[#ECCF0F] bg-[#ECCF0F]"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <h4 className="text-lg font-bold text-gray-900">
                        Premium
                      </h4>
                      <div className="ml-2 px-2 py-1 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] rounded text-xs font-bold text-[#03215F]">
                        POPULAR
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] text-[#03215F] rounded-full text-sm font-medium">
                      BHD 40/year
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#AE9B66] mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        All Free Features
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#AE9B66] mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        Digital Membership Card
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#AE9B66] mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        QR Code Verification
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#AE9B66] mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        Up to 50% Event Discounts
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#AE9B66] mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        Priority Event Registration
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleUpgradeClick}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#ECCF0F] to-[#ECCF0F] text-[#03215F] rounded-lg font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {!isFreeMember ? (
                      <>
                        <Crown className="w-5 h-5 text-[#03215F]" />
                        Current Plan
                      </>
                    ) : (
                      <>
                        Upgrade Now
                        <ArrowRight className="w-5 h-5 text-[#03215F]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            )}
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
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg">
                  <div className="flex items-center">
                    <BadgeCheck className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">ID</span>
                  </div>
                  <span className="font-mono font-semibold text-gray-900">
                    {user?.membership_code || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg">
                  <div className="flex items-center">
                    <Crown className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">
                      Type
                    </span>
                  </div>
                  <span
                    className={`font-semibold ${
                      !isFreeMember
                        ? "text-[#03215F]"
                        : "text-[#03215F]"
                    }`}
                  >
                    {!isFreeMember ? "Premium" : "Standard"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">
                      Status
                    </span>
                  </div>
                  <span
                    className={`font-semibold ${
                      user?.membership_status === "active"
                        ? "text-[#AE9B66]"
                        : "text-[#b8352d]"
                    }`}
                  >
                    {user?.membership_status === "active"
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">
                      Since
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {user?.membership_date
                      ? new Date(user.membership_date).toLocaleDateString(
                          "en-BH",
                          {
                            year: "numeric",
                            month: "short",
                          }
                        )
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {isFreeMember && (
              <div className="bg-gradient-to-br from-[#ECCF0F]/10 to-[#ECCF0F]/10 rounded-xl p-6 border border-[#ECCF0F]/20">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Diamond className="w-5 h-5 text-[#ECCF0F] mr-2" />
                  Premium Features
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
                    Upgrade to Premium
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
                Upgrade to Premium
                <ArrowRight className="w-5 h-5 text-[#03215F]" />
              </button>
            </div>
          </div>
        )}
      </div>
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
