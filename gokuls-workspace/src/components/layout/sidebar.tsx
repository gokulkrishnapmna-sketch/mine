"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { PRIMARY_NAV, SECONDARY_NAV } from "./nav-items";
import { UserSwitcher } from "./user-switcher";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { isAdmin, notifications, currentUser } = useStore();
  const unread = notifications.filter((n) => n.recipientId === currentUser.id && !n.read).length;

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col gap-1">
      <Link
        href="/"
        onClick={onNavigate}
        className="mb-4 flex items-center gap-2 px-2"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold">Gokul&apos;s Workspace</p>
          <p className="text-[10px] text-muted-foreground">Design Request System</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {PRIMARY_NAV.filter((n) => !n.adminOnly || isAdmin).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="my-3 h-px bg-border" />

      <nav className="flex flex-col gap-0.5">
        {SECONDARY_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-3">
              <item.icon className="size-4" />
              {item.label}
            </span>
            {item.href === "/notifications" && unread > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-4">
        <UserSwitcher />
      </div>
    </div>
  );
}
