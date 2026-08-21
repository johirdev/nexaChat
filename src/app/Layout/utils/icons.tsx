"use client";

/**
 * icons.tsx
 * -------------------------------------------------------------
 * Centralized icon map for the Restaurant Admin Dashboard.
 * Only includes icons that are actually used in the app (currently
 * just the Sidebar). Add more here as new screens need them —
 * keep it trimmed to what's in use so it stays easy to scan.
 *
 * Usage:
 *   import Icons from "../../utils/icons";
 *   <Icons.Dashboard className="w-5 h-5" />
 */

import { FiChevronDown, FiX, FiShoppingBag } from "react-icons/fi";
import {
  MdOutlineRestaurantMenu,
  MdOutlineCategory,
  MdOutlineStorefront,
} from "react-icons/md";
import { LayoutDashboard, ClipboardList, LogOut } from "lucide-react";

export type IconProps = {
  className?: string;
};

export const Icons = {
  // ---- Core / Layout ----
  Dashboard: (p: IconProps) => <LayoutDashboard className={p.className} />,
  Close: (p: IconProps) => <FiX className={p.className} />,
  ChevronDown: (p: IconProps) => <FiChevronDown className={p.className} />,
  LogOut: (p: IconProps) => <LogOut className={p.className} />,
  Store: (p: IconProps) => <MdOutlineStorefront className={p.className} />,

  // ---- User Management ----
  MenuManagement: (p: IconProps) => (
    <MdOutlineRestaurantMenu className={p.className} />
  ),
  Category: (p: IconProps) => <MdOutlineCategory className={p.className} />,

  // ---- Chat Management ----
  Orders: (p: IconProps) => <ClipboardList className={p.className} />,
  OnlineOrders: (p: IconProps) => <FiShoppingBag className={p.className} />,
};

export default Icons;
