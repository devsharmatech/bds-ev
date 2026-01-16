"use client";

import { X, DollarSign, Tag, CheckCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUserEventPrice,
  getAllEventPrices,
  formatBHD,
  calculateSavings,
} from "@/lib/eventPricing";

// Bahrain flag component
const BahrainFlag = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 640 480"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="640" height="480" fill="#b8352d" />
    <path
      d="
      M0 0
      L200 0
      L160 48
      L200 96
      L160 144
      L200 192
      L160 240
      L200 288
      L160 336
      L200 384
      L160 432
      L200 480
      L0 480
      Z
    "
      fill="#ffffff"
    />
  </svg>
);

export default function PricingModal({ event, user, isOpen, onClose }) {
  if (!isOpen || !event) return null;

  const allPrices = getAllEventPrices(event);
  const userPriceInfo = getUserEventPrice(event, user);
  const savings = calculateSavings(event, user);

  // If event is free
  if (!event.is_paid) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <DollarSign className="w-5 h-5" />
                <h3 className="font-bold text-lg">Event Pricing</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">FREE</h4>
              <p className="text-gray-600">This event is free for everyone!</p>
            </div>
            <div className="p-4 bg-gray-50 border-t">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#03215F] text-white rounded-lg font-medium hover:bg-[#03215F]/90 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#03215F] to-[#03215F] p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-white">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-bold text-lg">Registration Prices</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Event Title */}
          <div className="px-4 py-3 bg-gray-50 border-b flex-shrink-0">
            <h4 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h4>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 p-4">
            {/* Your Price Card (if logged in) */}
            {user && (
              <div className="mb-4 p-4 bg-gradient-to-r from-[#9cc2ed]/20 to-[#03215F]/10 rounded-xl border border-[#03215F]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Your Price</p>
                    <div className="flex items-center gap-2">
                      <BahrainFlag />
                      <span className="text-2xl font-bold text-[#03215F]">
                        {formatBHD(userPriceInfo.price)}
                      </span>
                    </div>
                    <p className="text-sm text-[#AE9B66] mt-1">
                      {userPriceInfo.categoryDisplay} • {userPriceInfo.tierDisplay}
                    </p>
                  </div>
                  {savings > 0 && (
                    <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-center">
                      <p className="text-xs font-medium">You Save</p>
                      <p className="text-lg font-bold">{formatBHD(savings)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Current Tier Indicator */}
            {allPrices && (
              <div className="mb-4 flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-[#03215F]" />
                <span className="text-gray-600">
                  Current pricing tier:{" "}
                  <span className="font-semibold text-green-600">
                    {allPrices.currentTierDisplay}
                  </span>
                </span>
              </div>
            )}

            {/* Pricing Table */}
            {allPrices && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-3 py-2.5 text-left text-gray-700 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-4 h-4" />
                          Category
                        </div>
                      </th>
                      <th
                        className={`border border-gray-200 px-3 py-2.5 text-center font-semibold ${
                          allPrices.currentTier === "earlybird"
                            ? "bg-green-100 text-green-700"
                            : "text-gray-700"
                        }`}
                      >
                        Early Bird
                        {allPrices.currentTier === "earlybird" && (
                          <span className="block text-[10px] font-normal">(Current)</span>
                        )}
                      </th>
                      <th
                        className={`border border-gray-200 px-3 py-2.5 text-center font-semibold ${
                          allPrices.currentTier === "standard"
                            ? "bg-green-100 text-green-700"
                            : "text-gray-700"
                        }`}
                      >
                        Standard
                        {allPrices.currentTier === "standard" && (
                          <span className="block text-[10px] font-normal">(Current)</span>
                        )}
                      </th>
                      <th
                        className={`border border-gray-200 px-3 py-2.5 text-center font-semibold ${
                          allPrices.currentTier === "onsite"
                            ? "bg-green-100 text-green-700"
                            : "text-gray-700"
                        }`}
                      >
                        On-site
                        {allPrices.currentTier === "onsite" && (
                          <span className="block text-[10px] font-normal">(Current)</span>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPrices.categories.map((cat) => {
                      const isUserCategory = user && userPriceInfo.category === cat.id;
                      return (
                        <tr
                          key={cat.id}
                          className={isUserCategory ? "bg-blue-50" : "hover:bg-gray-50"}
                        >
                          <td className="border border-gray-200 px-3 py-2.5 text-gray-700 font-medium">
                            <div className="flex items-center gap-2">
                              {cat.name}
                              {isUserCategory && (
                                <span className="px-1.5 py-0.5 bg-[#03215F] text-white text-[10px] rounded font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            className={`border border-gray-200 px-3 py-2.5 text-center ${
                              allPrices.currentTier === "earlybird" && isUserCategory
                                ? "bg-green-100 font-bold text-green-700"
                                : "text-gray-700"
                            }`}
                          >
                            {cat.earlybird ? (
                              <div className="flex items-center justify-center gap-1">
                                <BahrainFlag />
                                {formatBHD(cat.earlybird)}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td
                            className={`border border-gray-200 px-3 py-2.5 text-center ${
                              allPrices.currentTier === "standard" && isUserCategory
                                ? "bg-green-100 font-bold text-green-700"
                                : "text-gray-700"
                            }`}
                          >
                            {cat.standard ? (
                              <div className="flex items-center justify-center gap-1">
                                <BahrainFlag />
                                {formatBHD(cat.standard)}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td
                            className={`border border-gray-200 px-3 py-2.5 text-center ${
                              allPrices.currentTier === "onsite" && isUserCategory
                                ? "bg-green-100 font-bold text-green-700"
                                : "text-gray-700"
                            }`}
                          >
                            {cat.onsite ? (
                              <div className="flex items-center justify-center gap-1">
                                <BahrainFlag />
                                {formatBHD(cat.onsite)}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Category Descriptions */}
            <div className="mt-4 space-y-2 text-xs text-gray-600">
              <p>
                <strong>BDS & Partner Dentists:</strong> Active BDS members with paid
                membership
              </p>
              <p>
                <strong>Non-Member Dentist:</strong> Dentists without active BDS membership
              </p>
              <p>
                <strong>Undergraduate Student:</strong> Currently enrolled dental students
              </p>
              <p>
                <strong>Hygienist / Assistant / Technician:</strong> Dental support
                professionals
              </p>
            </div>

            {/* Not Logged In Message */}
            {!user && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Log in to see your personalized price based on your
                  membership status and category.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#03215F] text-white rounded-lg font-medium hover:bg-[#03215F]/90 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
