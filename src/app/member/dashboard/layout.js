import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import NotificationPermission from "@/components/notifications/NotificationPermission";
import NotificationHandler from "@/components/notifications/NotificationHandler";
import { redirect } from "next/navigation";
import MobileNavigation from "@/components/dashboard/MobileNavigation";

export default async function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row h-screen">
        <div className="hidden md:block h-screen sticky top-0">
          <DashboardSidebar />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-50">
          <DashboardHeader mobile={true} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {" "}
          <div className="hidden md:block">
            <DashboardHeader />
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
            <div className="p-4 md:p-6 max-w-full">
              {" "}
              {children}
            </div>
          </div>
          {/* Footer */}
          <DashboardFooter />
        </div>
      </div>

      <div className="md:hidden">
        <MobileNavigation />
      </div>

      {/* Notification Permission Banner */}
      <NotificationPermission />
      
      {/* Notification Handler for foreground messages */}
      <NotificationHandler />
    </div>
  );
}
