"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
} from "lucide-react";

export default function AttendanceStats({ stats }) {
  const statCards = [
    {
      title: "Total Scans",
      value: stats.totalScans || 0,
      icon: BarChart3,
      color: "from-[#9cc2ed]/30 to-[#03215F]/30",
      bgColor: "from-white to-white",
      borderColor: "border-[#9cc2ed]/50",
    },
    {
      title: "Unique Attendees",
      value: stats.uniqueAttendees || 0,
      icon: Users,
      color: "from-[#AE9B66]/30 to-[#AE9B66]/30",
      bgColor: "from-white to-white",
      borderColor: "border-[#AE9B66]/50",
    },
    {
      title: "Today's Scans",
      value: stats.todayScans || 0,
      icon: Calendar,
      color: "from-[#03215F]/30 to-[#03215F]/30",
      bgColor: "from-white to-white",
      borderColor: "border-[#03215F]/50",
    },
    {
      title: "Check-in Rate",
      value: stats.checkinRate || "0%",
      icon: TrendingUp,
      color: "from-green-500/90 to-green-500/80",
      bgColor: "from-white to-white",
      borderColor: "border-green-500/50",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
          className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl shadow-lg border ${stat.borderColor} p-6`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* Progress bar for check-in rate */}
          {stat.title === "Check-in Rate" && typeof stat.value === "string" && (
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                  style={{ width: parseFloat(stat.value) || 0 + '%' }}
                ></div>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}