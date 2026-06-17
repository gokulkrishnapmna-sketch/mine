"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn, formatRelative } from "@/lib/utils";

export function NotificationCenter() {
  const { notifications, currentUser, markNotificationRead, markAllRead } = useStore();
  const [open, setOpen] = useState(false);

  const mine = useMemo(
    () =>
      notifications
        .filter((n) => n.recipientId === currentUser.id)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [notifications, currentUser.id]
  );
  const unread = mine.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="relative"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 animate-fade-in overflow-hidden rounded-xl border border-border bg-popover shadow-soft-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 && (
              <button
                onMouseDown={markAllRead}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <CheckCheck className="size-3.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {mine.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                You&apos;re all caught up.
              </div>
            )}
            {mine.map((n) => (
              <Link
                key={n.id}
                href={n.taskId ? `/tasks/${n.taskId}` : "/notifications"}
                onMouseDown={() => markNotificationRead(n.id)}
                className={cn(
                  "flex gap-3 border-b border-border/60 px-4 py-3 transition-colors last:border-0 hover:bg-accent",
                  !n.read && "bg-accent/50"
                )}
              >
                <div className="mt-0.5">
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full",
                      n.read ? "bg-secondary text-muted-foreground" : "bg-primary/15 text-primary"
                    )}
                  >
                    <Mail className="size-3.5" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {formatRelative(n.createdAt)}
                  </p>
                </div>
                {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
              </Link>
            ))}
          </div>
          <Link
            href="/notifications"
            className="block border-t border-border px-4 py-2.5 text-center text-xs font-medium text-primary hover:bg-accent"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
