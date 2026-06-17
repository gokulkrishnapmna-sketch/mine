"use client";

import Link from "next/link";
import { MessageSquare, Paperclip, Link2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge } from "./priority-badge";
import { DeadlinePill } from "./deadline-pill";
import { DELIVERABLE_LABEL, PRIORITY_META } from "@/lib/constants";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  commentCount?: number;
  compact?: boolean;
  className?: string;
  dragging?: boolean;
}

export function TaskCard({ task, commentCount = 0, compact, className, dragging }: TaskCardProps) {
  const { getUser } = useStore();
  const requester = getUser(task.requesterId);

  return (
    <Link
      href={`/tasks/${task.id}`}
      className={cn(
        "group block rounded-xl border border-border bg-card p-3.5 shadow-soft transition-all hover:border-primary/40 hover:shadow-soft-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "border-l-[3px]",
        PRIORITY_META[task.priority].dot.replace("bg-", "border-l-"),
        dragging && "rotate-1 shadow-soft-lg ring-2 ring-primary/40",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] text-muted-foreground">{task.reference}</span>
        <PriorityBadge priority={task.priority} />
      </div>

      <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
        {task.title}
      </h3>

      {!compact && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="truncate rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
          {DELIVERABLE_LABEL[task.deliverableType]}
        </span>
        <DeadlinePill deadline={task.deadline} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
        <div className="flex items-center gap-2">
          {requester && <Avatar name={requester.name} color={requester.avatarColor} size="sm" />}
          <span className="truncate text-[11px] text-muted-foreground">{requester?.name}</span>
        </div>
        <div className="flex items-center gap-2.5 text-muted-foreground">
          {task.references.length > 0 && (
            <span className="flex items-center gap-0.5 text-[11px]">
              <Link2 className="size-3.5" />
              {task.references.length}
            </span>
          )}
          {task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[11px]">
              <Paperclip className="size-3.5" />
              {task.attachments.length}
            </span>
          )}
          {commentCount > 0 && (
            <span className="flex items-center gap-0.5 text-[11px]">
              <MessageSquare className="size-3.5" />
              {commentCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
