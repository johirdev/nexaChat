"use client";

import { useState, useRef, useEffect, useContext } from "react";
import Icons from "../../utils/icons";
import { AuthContext } from "@/src/app/AuthProvider";

interface NavbarProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

export default function Navbar({
  onMenuToggle,
  pageTitle = "Dashboard",
}: NavbarProps) {
  const { user, logOut } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between gap-2 px-3 sm:px-6 h-16"
      style={{
        background:
          "linear-gradient(180deg, #0f1729 0%, #111827 60%, #131921 100%)",
        borderBottom: "1px solid rgba(99,102,241,0.15)",
      }}
    >
      {/* Left — hamburger + title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          aria-label="Toggle menu"
          onClick={onMenuToggle}
          className="lg:hidden shrink-0 flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          {/* <Icons.Menu className="w-5 h-5" /> */} Menu
        </button>

        <div className="min-w-0">
          <h1
            className="text-white font-semibold text-base sm:text-lg leading-none truncate"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            <span className="text-[#06B6D4]">Nexa</span>Chat
          </h1>
          <p className="hidden sm:block text-gray-500 text-xs mt-1 truncate">
            {pageTitle}
          </p>
        </div>
      </div>

      {/* Right — search toggle (mobile) + notifications + profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Search toggle — mobile only */}
        <button
          aria-label="Search"
          onClick={() => setMobileSearchOpen((p) => !p)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-white transition-all"
          style={{
            background: mobileSearchOpen
              ? "rgba(99,102,241,0.15)"
              : "rgba(255,255,255,0.05)",
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          {/* <Icons.Search className="w-4 h-4" /> */} Search
        </button>

        {/* Divider */}
        <div
          className="w-px h-6 hidden sm:block"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setProfileOpen((p) => !p);
            }}
            className="flex items-center gap-2 px-1.5 sm:px-3 py-1.5 rounded-xl transition-all"
            style={{
              background: profileOpen ? "rgba(99,102,241,0.15)" : "transparent",
              border: "1px solid transparent",
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 0 12px rgba(99,102,241,0.4)",
              }}
            >
              {user?.name?.slice(0, 1)?.toUpperCase() || "?"}
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <p
                className="text-white text-sm font-medium leading-none truncate max-w-36"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {user?.name || "NexaChat user"}
              </p>
              <p className="text-gray-500 text-xs mt-0.5 truncate max-w-36">
                {user?.phone}
              </p>
            </div>
            <span className="text-gray-500 hidden sm:block">
              <Icons.ChevronDown className="w-4 h-4" />
            </span>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div
              className="absolute right-0 top-12 w-52 max-w-[calc(100vw-1rem)] rounded-2xl overflow-hidden z-50"
              style={{
                background: "#111827",
                border: "1px solid rgba(99,102,241,0.2)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid rgba(99,102,241,0.15)" }}
              >
                <p
                  className="text-white text-sm font-medium truncate"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {user?.name || "NexaChat user"}
                </p>
                <p className="text-gray-500 text-xs mt-0.5 truncate">
                  {user?.phone}
                </p>
              </div>
              <div className="p-2 space-y-0.5">
                <button
                  onClick={() => logOut()}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <Icons.LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search bar — slides below header */}
      {mobileSearchOpen && (
        <div
          className="md:hidden absolute left-0 right-0 top-16 px-3 py-3"
          style={{
            background: "#111827",
            borderBottom: "1px solid rgba(99,102,241,0.15)",
            boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
          }}
        >
          <div
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(99,102,241,0.15)",
            }}
          >
            {/* <Icons.Search className="w-4 h-4 text-gray-500 flex-shrink-0" /> */}{" "}
            Search
            <input
              autoFocus
              type="text"
              placeholder="Search orders, items, customers..."
              className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
