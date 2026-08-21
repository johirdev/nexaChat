"use client";

import { useEffect } from "react";
import UserListPanel from "@/src/app/components/Users/UserListPanel";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The dashboard rail. On desktop it is a static column; below `lg` it becomes an
 * off-canvas drawer over a scrim. The contents are the people directory.
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  // Escape closes the drawer, and the body must not scroll behind it.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[288px] transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:h-full lg:w-[300px] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="People"
      >
        <UserListPanel onClose={onClose} />
      </aside>
    </>
  );
}
