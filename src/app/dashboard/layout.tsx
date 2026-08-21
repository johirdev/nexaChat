"use client";

import { useCallback, useState } from "react";
import "./dashboard.css";
import AuthProvider from "../AuthProvider";
import QueryProvider from "@/src/lib/providers/QueryProvider";
import Sidebar from "../Layout/Admin/Sidebar/Sidebar";
import Navbar from "../Layout/Admin/Navbar/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setIsSidebarOpen((open) => !open), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  return (
    <QueryProvider>
      <AuthProvider>
        <div className="flex h-screen flex-col overflow-hidden bg-[#0b1526] text-white">
          <Navbar onMenuToggle={toggleSidebar} />

          <div className="flex flex-1 overflow-hidden">
            <div className="h-full">
              <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            </div>

            {/* The only scroll area besides the sidebar rail. */}
            <main className="h-full flex-1 overflow-y-auto p-4 pt-3">
              {children}
            </main>
          </div>
        </div>
      </AuthProvider>
    </QueryProvider>
  );
}
