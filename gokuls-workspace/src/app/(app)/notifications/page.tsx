"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Mail } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useStore } from "@/lib/store";
import { cn, formatRelative } from "@/lib/utils";

export default function NotificationsPage() {
  const { notifications, currentUser, markNotificationRead, markAllRead } = useStore();
  const mine = useMemo(
    () =>
      notifications
        .filter((n) => n.recipientId === currentUser.id)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [notifications, currentUser.id]
  );
  const unread = mine.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread` : "You're all caught up."}
        action={
          unread > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="size-4" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      {mine.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="Questions, status changes, and completions will show up here." />
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {mine.map((n) => (
            <Link
              key={n.id}
              href={n.taskId ? `/tasks/${n.taskId}` : "#"}
              onClick={() => markNotificationRead(n.id)}
              className={cn("flex gap-3 px-4 py-3.5 transition-colors hover:bg-accent", !n.read && "bg-accent/40")}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  n.read ? "bg-secondary text-muted-foreground" : "bg-primary/15 text-primary"
                )}
              >
                <Mail className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatRelative(n.createdAt)}</p>
              </div>
              {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
