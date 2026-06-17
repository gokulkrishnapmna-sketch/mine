"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  History,
  Paperclip,
  Link2,
  Target,
  Building2,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { StatusBadge } from "@/components/tasks/status-badge";
import { DeadlinePill } from "@/components/tasks/deadline-pill";
import { IntakeScoreRing } from "@/components/tasks/intake-score";
import { AttachmentList } from "@/components/tasks/attachment-list";
import { ReferenceList } from "@/components/tasks/reference-list";
import { ActivityTimeline } from "@/components/tasks/activity-timeline";
import { CommentThread } from "@/components/tasks/comment-thread";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import {
  DELIVERABLE_LABEL,
  PRIORITIES,
  PRIORITY_META,
  STATUSES,
  STATUS_META,
} from "@/lib/constants";
import type { EffortEstimate, Priority, Status } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const EFFORTS: EffortEstimate[] = ["small", "medium", "large", "xl"];

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const { tasks, comments, activity, getUser, isAdmin, changeStatus, changePriority, updateTask } =
    useStore();
  const [tab, setTab] = useState<"comments" | "activity">("comments");

  const task = tasks.find((t) => t.id === params.id);
  const taskActivity = useMemo(
    () => activity.filter((a) => a.taskId === params.id),
    [activity, params.id]
  );
  const commentCount = comments.filter((c) => c.taskId === params.id).length;

  if (!task) return notFound();
  const requester = getUser(task.requesterId);

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/board"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to board
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{task.reference}</span>
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {DELIVERABLE_LABEL[task.deliverableType]}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">{task.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Building2 className="size-4" /> {task.department}
              </span>
              <DeadlinePill deadline={task.deadline} />
              <span>Created {formatDate(task.createdAt)}</span>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {task.description}
              </p>
              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Target className="size-3.5" /> Business objective
                </p>
                <p className="mt-1 text-sm">{task.businessObjective}</p>
              </div>
              {task.additionalNotes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Additional notes</p>
                  <p className="mt-1 text-sm">{task.additionalNotes}</p>
                </div>
              )}
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((t) => (
                    <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {task.pendingInfo.length > 0 && (
            <Card className="border-amber-300/50 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="size-4" /> Pending information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {task.pendingInfo.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm">
                      <span className="size-1.5 rounded-full bg-amber-500" /> {p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Paperclip className="size-4 text-muted-foreground" /> Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AttachmentList attachments={task.attachments} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Link2 className="size-4 text-muted-foreground" /> References
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReferenceList references={task.references} />
              </CardContent>
            </Card>
          </div>

          {/* Discussion / Activity */}
          <Card>
            <CardHeader className="pb-0">
              <div className="flex gap-1 rounded-lg bg-secondary p-1">
                <button
                  onClick={() => setTab("comments")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    tab === "comments" ? "bg-card shadow-soft" : "text-muted-foreground"
                  )}
                >
                  <MessageSquare className="size-4" /> Discussion ({commentCount})
                </button>
                <button
                  onClick={() => setTab("activity")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    tab === "activity" ? "bg-card shadow-soft" : "text-muted-foreground"
                  )}
                >
                  <History className="size-4" /> Activity ({taskActivity.length})
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {tab === "comments" ? (
                <CommentThread taskId={task.id} />
              ) : (
                <ActivityTimeline events={taskActivity} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Requested by</span>
              </div>
              <div className="flex items-center gap-2.5">
                {requester && <Avatar name={requester.name} color={requester.avatarColor} />}
                <div>
                  <p className="text-sm font-medium">{requester?.name}</p>
                  <p className="text-xs text-muted-foreground">{requester?.email}</p>
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-2 text-sm">
                <Row label="Contact" value={task.contact.name} />
                <Row label="Email" value={task.contact.email} />
                {task.contact.phone && <Row label="Phone" value={task.contact.phone} />}
                <Row label="Deadline" value={formatDate(task.deadline)} />
                <Row label="Est. completion" value={formatDate(task.estimatedCompletion)} />
                <Row label="Effort" value={task.effort ? task.effort.toUpperCase() : "—"} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
                <span className="text-xs text-muted-foreground">Design intake</span>
                <IntakeScoreRing score={task.intakeScore} size={40} label={false} />
              </div>
            </CardContent>
          </Card>

          {/* Admin controls */}
          {isAdmin ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="size-4 text-primary" /> Manage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="mb-1.5 block text-xs">Status</Label>
                  <Select value={task.status} onChange={(e) => changeStatus(task.id, e.target.value as Status)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_META[s].label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Priority</Label>
                  <Select value={task.priority} onChange={(e) => changePriority(task.id, e.target.value as Priority)}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_META[p].label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Effort estimate</Label>
                  <Select
                    value={task.effort ?? ""}
                    onChange={(e) =>
                      updateTask(task.id, { effort: (e.target.value || null) as EffortEstimate | null })
                    }
                  >
                    <option value="">Unset</option>
                    {EFFORTS.map((ef) => (
                      <option key={ef} value={ef}>
                        {ef.toUpperCase()}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Estimated completion</Label>
                  <Input
                    type="date"
                    value={task.estimatedCompletion?.slice(0, 10) ?? ""}
                    onChange={(e) =>
                      updateTask(
                        task.id,
                        { estimatedCompletion: e.target.value ? new Date(e.target.value).toISOString() : null },
                        { activityType: "deadline_changed", message: "Estimated completion updated" }
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-secondary/30">
              <CardContent className="p-4 text-xs text-muted-foreground">
                Status, priority, and timeline are managed by Gokul. Use the discussion to add context or
                answer questions.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium">{value}</span>
    </div>
  );
}
