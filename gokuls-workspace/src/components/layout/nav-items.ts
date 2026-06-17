import {
  LayoutDashboard,
  KanbanSquare,
  ListOrdered,
  UserCog,
  BarChart3,
  Bell,
  Search,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** only visible to admin (Gokul) */
  adminOnly?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/board", label: "Kanban Board", icon: KanbanSquare },
  { href: "/queue", label: "Smart Queue", icon: ListOrdered },
  { href: "/workload", label: "Gokul's Work", icon: UserCog },
  { href: "/search", label: "Search & Filters", icon: Search },
  { href: "/analytics", label: "Analytics", icon: BarChart3, adminOnly: true },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/tasks/new", label: "New Request", icon: PlusCircle },
  { href: "/notifications", label: "Notifications", icon: Bell },
];
