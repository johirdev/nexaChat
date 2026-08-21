"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icons from "../../utils/icons";

interface NavChild {
  label: string;
  href: string;
  icon: (p: { className?: string }) => React.ReactNode;
  badge?: number;
  badgeTone?: "indigo" | "green" | "red" | "blue" | "amber";
}

interface NavItem {
  label: string;
  href?: string;
  icon: (p: { className?: string }) => React.ReactNode;
  badge?: number;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Icons.Dashboard,
  },

  // ---------------- Menu / Product Management ----------------
  {
    label: "User Management",
    icon: Icons.Category,
    children: [
      {
        label: "User List ",
        href: "/admin/users/list",
        icon: Icons.Category,
      },
    ],
  },

  // ---------------- Orders + POS ----------------
  {
    label: "Chat Management",
    icon: Icons.Orders,
    children: [
      {
        label: "Online Chats",
        href: "/dashboard/orders/online",
        icon: Icons.Orders,
        badge: 12,
        badgeTone: "indigo",
      },
    ],
  },
];

const badgeToneStyles: Record<
  NonNullable<NavChild["badgeTone"]>,
  { bg: string; color: string }
> = {
  indigo: { bg: "rgba(99,102,241,0.25)", color: "#a5b4fc" },
  green: { bg: "rgba(34,197,94,0.2)", color: "#4ade80" },
  red: { bg: "rgba(239,68,68,0.2)", color: "#f87171" },
  blue: { bg: "rgba(59,130,246,0.2)", color: "#60a5fa" },
  amber: { bg: "rgba(245,158,11,0.2)", color: "#fbbf24" },
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(["Order Management"]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label],
    );
  };

  const isActive = (href?: string) => href && pathname === href;
  const isGroupActive = (item: NavItem) =>
    item.children?.some((c) => pathname === c.href);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 flex flex-col
          w-64 transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background:
            "linear-gradient(180deg, #0f1729 0%, #111827 60%, #131921 100%)",
          borderRight: "1px solid rgba(99,102,241,0.15)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-5 py-5 md:py-0"
          style={{ borderBottom: "1px solid rgba(99,102,241,0.15)" }}
        >
          <div className="flex md:hidden items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              <Icons.Store className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-white font-semibold text-base"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Restaurant Admin
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <Icons.Close className="w-6 h-6" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const groupOpen = openGroups.includes(item.label);
            const groupActive = isGroupActive(item);
            const ItemIcon = item.icon;

            if (hasChildren) {
              return (
                <div key={item.label}>
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={`
                      w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl
                      text-sm font-medium transition-all duration-200 group
                      ${
                        groupActive
                          ? "text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }
                    `}
                    style={
                      groupActive
                        ? {
                            background: "rgba(99,102,241,0.12)",
                            color: "white",
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`transition-colors ${
                          groupActive
                            ? "text-indigo-400"
                            : "text-gray-500 group-hover:text-indigo-400"
                        }`}
                      >
                        <ItemIcon className="w-5 h-5" />
                      </span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                          style={{
                            background: "rgba(99,102,241,0.25)",
                            color: "#a5b4fc",
                            fontSize: "10px",
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span
                      className={`transition-transform duration-200 ${
                        groupOpen ? "rotate-180" : ""
                      }`}
                    >
                      <Icons.ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {/* Children */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      groupOpen
                        ? "max-h-[32rem] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div
                      className="mt-1 ml-4 pl-3 space-y-0.5"
                      style={{ borderLeft: "1px solid rgba(99,102,241,0.2)" }}
                    >
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        const tone = child.badgeTone
                          ? badgeToneStyles[child.badgeTone]
                          : badgeToneStyles.indigo;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`
                              flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm
                              transition-all duration-150 group
                              ${
                                isActive(child.href)
                                  ? "text-white"
                                  : "text-gray-500 hover:text-white hover:bg-white/5"
                              }
                            `}
                            style={
                              isActive(child.href)
                                ? {
                                    background:
                                      "linear-gradient(90deg, rgba(99,102,241,0.25), rgba(99,102,241,0.05))",
                                    color: "white",
                                  }
                                : {}
                            }
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`transition-colors ${
                                  isActive(child.href)
                                    ? "text-indigo-400"
                                    : "text-gray-600 group-hover:text-indigo-400"
                                }`}
                              >
                                <ChildIcon className="w-4 h-4" />
                              </span>
                              <span
                                style={{
                                  fontFamily: "'DM Sans', sans-serif",
                                  fontSize: "13px",
                                }}
                              >
                                {child.label}
                              </span>
                            </div>
                            {child.badge && (
                              <span
                                className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                                style={{
                                  background: tone.bg,
                                  color: tone.color,
                                  fontSize: "10px",
                                }}
                              >
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            // Flat link
            return (
              <Link
                key={item.href}
                href={item.href!}
                className={`
                  flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 group
                  ${
                    isActive(item.href)
                      ? "text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }
                `}
                style={
                  isActive(item.href)
                    ? {
                        background:
                          "linear-gradient(90deg, rgba(99,102,241,0.3), rgba(99,102,241,0.08))",
                        boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.2)",
                      }
                    : {}
                }
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive(item.href)
                        ? "text-indigo-400"
                        : "text-gray-500 group-hover:text-indigo-400"
                    }`}
                  >
                    <ItemIcon className="w-5 h-5" />
                  </span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {item.label}
                  </span>
                </div>
                {item.badge && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                    style={{
                      background: "rgba(99,102,241,0.25)",
                      color: "#a5b4fc",
                      fontSize: "10px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user card */}
        <div
          className="px-4 py-4"
          style={{ borderTop: "1px solid rgba(99,102,241,0.15)" }}
        >
          <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              A
            </div>
            <div className="min-w-0">
              <p
                className="text-white text-sm font-medium truncate"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Super Admin
              </p>
              <p className="text-gray-500 text-xs truncate">
                admin@restaurant.com
              </p>
            </div>
            <Icons.LogOut className="w-4 h-4 text-gray-500 ml-auto" />
          </div>
        </div>
      </aside>
    </>
  );
}
