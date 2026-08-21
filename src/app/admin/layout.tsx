/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useContext, useState } from "react";
import "./admin.css";
import AuthProvider, { AuthContext } from "./AuthProvider";

import Sidebar from "../Layout/Admin/Sidebar/Sidebar";
import Navbar from "../Layout/Admin/Navbar/Navbar";

export default function AdminClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuToggle = () => setIsOpen((p) => !p);
  const handleClose = () => setIsOpen(false);

  return (
    <AuthProvider>
      <AdminInner
        isOpen={isOpen}
        handleMenuToggle={handleMenuToggle}
        handleClose={handleClose}
      >
        {children}
      </AdminInner>
    </AuthProvider>
  );
}

function AdminInner({ children, isOpen, handleMenuToggle, handleClose }: any) {
  // const { token } = useContext(AuthContext);

  // if (!token) return <LoginAdmin />;

  return (
    <div
      className="h-screen flex flex-col bg-[#101828] text-primary overflow-hidden"
      style={{ backgroundColor: "#101828" }}
    >
      {/* Top Navbar */}
      <Navbar onMenuToggle={handleMenuToggle} />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (FULL HEIGHT FIXED) */}
        <div className="h-full">
          <Sidebar isOpen={isOpen} onClose={handleClose} />
        </div>

        {/* Main Content (ONLY SCROLL AREA) */}
        <main className="flex-1 h-full p-4 pt-3 overflow-y-auto">
          {children}
        </main>
      </div>
     
    </div>
  );
}
