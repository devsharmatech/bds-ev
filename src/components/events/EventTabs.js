"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { Users, CheckCircle, MessageSquare, Calendar } from "lucide-react";

export default function EventTabs({ eventId }) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    {
      name: "Members",
      href: `/admin/events/${eventId}/members`,
      icon: Users,
      color: "from-[#9cc2ed] to-[#9cc2ed]",
      textColor: "text-[#03215F]",
    },
    {
      name: "Attendance",
      href: `/admin/events/${eventId}/attendance`,
      icon: CheckCircle,
      color: "from-[#AE9B66] to-[#AE9B66]",
      textColor: "text-white",
    },
    {
      name: "Feedback",
      href: `/admin/events/${eventId}/feedback`,
      icon: MessageSquare,
      color: "from-[#ECCF0F] to-[#ECCF0F]",
      textColor: "text-[#03215F]",
    },
  ];

  const isActive = (href) => {
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        const Icon = tab.icon;
        return (
          <button
            key={tab.name}
            onClick={() => router.push(tab.href)}
            className={`px-4 py-3 font-medium text-sm transition-all duration-200 border-b-2 flex items-center gap-2 ${
              active
                ? `border-[#03215F] ${tab.textColor}`
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <Icon className={`w-4 h-4 ${active ? tab.textColor : "text-gray-500"}`} />
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}

