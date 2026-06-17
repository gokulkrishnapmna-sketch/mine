"use client";

import {
  Plus,
  ArrowRightLeft,
  Flag,
  CalendarClock,
  MessageSquare,
  HelpCircle,
  Reply,
  Upload,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import type { ActivityEvent, ActivityType } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, formatRelative } from "@/lib/utils";

const ICON: Record<ActivityType, typeof Plus> = {
  created: Plus,
  status_changed: ArrowRightLeft,
  priority_changed: Flag,
  deadline_changed: CalendarClock,
  comment_added: MessageSquare,
  question_asked: HelpCircle,
  question_answered: Reply,
  file_uploaded: Upload,
  assigned: UserPlus,
  completed: CheckCircle2,
};

const TONE: Partial<Record<ActivityType, string>> = {
  created: "bg-primary/15 text-primary",
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  question_asked: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  priority_changed: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
};

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  const { getUser } = useStore();
  const sorted = [...events].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <ol className="relative space-y-4 pl-1">
      {sorted.map((e, i) => {
        const Icon = ICON[e.type];
        const actor = getUser(e.actorId);
        return (
          <li key={e.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  TONE[e.type] ?? "bg-secondary text-muted-foreground"
                )}
              >
                <Icon className="size-3.5" />
              </span>
              {i < sorted.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className="pb-1">
              <p className="text-sm">
                <span className="font-medium">{actor?.name ?? "Someone"}</span>{" "}
                <span className="text-muted-foreground">{e.message.toLowerCase()}</span>
              </p>
              <p className="text-xs text-muted-foreground">{formatRelative(e.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
