"use client";
import { motion } from "framer-motion";

export default function DashboardCard({ title, count, icon, description, trend, color = "blue", delay = 0 }) {
  const colorClasses = {
    blue: {
      bg: "bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed]/50",
      text: "text-[#03215F]",
      border: "border-[#9cc2ed]/50",
      trend: "text-[#03215F]",
      glow: "hover:shadow-[#9cc2ed]/50"
    },
    green: {
      bg: "bg-gradient-to-br from-[#AE9B66] to-[#AE9B66]/50",
      text: "text-[#AE9B66]",
      border: "border-[#AE9B66]/50",
      trend: "text-[#AE9B66]",
      glow: "hover:shadow-[#AE9B66]/50"
    },
    purple: {
      bg: "bg-gradient-to-br from-[#03215F] to-[#03215F]/50",
      text: "text-[#03215F]",
      border: "border-[#03215F]/50",
      trend: "text-[#03215F]",
      glow: "hover:shadow-[#03215F]/50"
    },
    orange: {
      bg: "bg-gradient-to-br from-[#b8352d] to-[#b8352d]/50",
      text: "text-[#b8352d]",
      border: "border-[#b8352d]/50",
      trend: "text-[#b8352d]",
      glow: "hover:shadow-[#b8352d]/50"
    }
  };

  const { bg, text, border, trend: trendColor, glow } = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        delay: delay 
      }}
      whileHover={{ 
        scale: 1.05, 
        y: -8,
        transition: { type: "spring", stiffness: 300 }
      }}
      whileTap={{ scale: 0.95 }}
      className={`${bg} ${border} border-2 rounded-3xl p-8 shadow-lg hover:shadow-2xl backdrop-blur-sm transition-all duration-500 cursor-pointer transform-gpu ${glow}`}
    >
      {/* Icon with background */}
      <div className="flex items-center justify-between mb-6">
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center shadow-inner border border-white/50"
        >
          <span className="text-2xl">{icon}</span>
        </motion.div>
        
        {trend && (
          <motion.span 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.3 }}
            className={`${trendColor} text-sm font-bold bg-white/80 px-3 py-1.5 rounded-full border border-white/50 shadow-sm`}
          >
            {trend}
          </motion.span>
        )}
      </div>
      
      {/* Count with counting animation */}
      <motion.h3 
        className={`text-4xl font-black ${text} mb-3`}
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          delay: delay + 0.2 
        }}
      >
        {count.toLocaleString()}
      </motion.h3>
      
      <p className="text-gray-700 text-lg font-semibold mb-2">
        {title}
      </p>
      
      {description && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
          className="text-gray-500 text-sm font-medium"
        >
          {description}
        </motion.p>
      )}

      {/* Animated progress bar */}
      <motion.div 
        className="w-full bg-white/50 rounded-full h-2 mt-4 overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: delay + 0.5, duration: 1 }}
      >
        <motion.div
          className={`h-full rounded-full ${bg.split(' ')[1]}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((count / 1000) * 100, 100)}%` }}
          transition={{ delay: delay + 0.7, duration: 1.5, ease: "easeOut" }}
        />
      </motion.div>
    </motion.div>
  );
}