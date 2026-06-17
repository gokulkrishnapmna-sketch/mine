"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  CircleDot,
  ListOrdered,
  PauseCircle,
  CheckCircle2,
  Timer,
  CalendarClock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CapacityMeter } from "@/components/dashboard/capacity-meter";
import { StatCard } from "@/components/dashboard/stat-card";
import { TaskCard } from "@/components/tasks/task-card";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DeadlinePill } from "@/components/tasks/deadline-pill";
import { useStore } from "@/lib/store";
import { GOKUL_ID } from "@/lib/seed";
import { buildQueue } from "@/lib/queue";
import { ACTIVE_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

function TaskMiniRow({ taskId, title, reference, deadline }: { taskId: string; title: string; reference: string; deadline: string | null }) {
  return (
    <Link
      href={`/tasks/${taskId}`}
      className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-accent"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{reference}</p>
      </div>
      <DeadlinePill deadline={deadline} />
    </Link>
  );
}

export default function WorkloadPage() {
  const { tasks, comments, getUser } = useStore();
  const gokul = getUser(GOKUL_ID);

  const data = useMemo(() => {
    const inProgress = tasks.filter((t) => t.status === "in_progress");
    const waiting = tasks.filter((t) => t.status === "waiting_inputs");
    const queue = buildQueue(tasks).filter((t) => t.status !== "in_progress").slice(0, 5);
    const completedThisWeek = tasks.filter(
      (t) => t.status === "completed" && Date.now() - +new Date(t.updatedAt) < 7 * 86_400_000
    );
    const completedAll = tasks.filter((t) => ["completed", "approved", "archived"].includes(t.status));
    const turnaround =
      completedAll.length > 0
        ? completedAll.reduce(
            (sum, t) => sum + (+new Date(t.updatedAt) - +new Date(t.createdAt)) / 86_400_000,
            0
          ) / completedAll.length
        : 0;
    const upcoming = tasks
      .filter((t) => ACTIVE_STATUSES.includes(t.status) && t.deadline)
      .sort((a, b) => +new Date(a.deadline!) - +new Date(b.deadline!))
      .slice(0, 6);
    return { inProgress, waiting, queue, completedThisWeek, turnaround, upcoming };
  }, [tasks]);

  const commentCount = (id: string) => comments.filter((c) => c.taskId === id).length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Gokul's Current Work"
        description="A transparent view of what's in flight, what's blocked, and what's next. Visible to everyone."
        action={
          gokul && (
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-soft">
              <Avatar name={gokul.name} color={gokul.avatarColor} size="sm" />
              <span className="text-sm font-medium">{gokul.name}</span>
            </div>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="In Progress" value={data.inProgress.length} icon={CircleDot} accent="text-amber-500" />
        <StatCard label="Waiting for Inputs" value={data.waiting.length} icon={PauseCircle} accent="text-rose-500" />
        <StatCard label="Completed This Week" value={data.completedThisWeek.length} icon={CheckCircle2} accent="text-emerald-500" />
        <StatCard
          label="Avg Turnaround"
          value={`${data.turnaround.toFixed(1)}d`}
          icon={Timer}
          accent="text-primary"
          hint="creation → delivery"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <CircleDot className="size-4 text-amber-500" /> Currently working on
            </h2>
            {data.inProgress.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.inProgress.map((t) => (
                  <TaskCard key={t.id} task={t} commentCount={commentCount(t.id)} />
                ))}
              </div>
            ) : (
              <EmptyState icon={CircleDot} title="Nothing in progress" description="Gokul has no active work right now." />
            )}
          </div>

          <div>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <PauseCircle className="size-4 text-rose-500" /> Waiting for inputs
            </h2>
            {data.waiting.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.waiting.map((t) => (
                  <TaskCard key={t.id} task={t} commentCount={commentCount(t.id)} />
                ))}
              </div>
            ) : (
              <EmptyState icon={PauseCircle} title="No blocked tasks" description="Everything has the inputs it needs." />
            )}
          </div>
        </div>

        <div className="space-y-5">
          <CapacityMeter />

          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ListOrdered className="size-4 text-muted-foreground" /> Next in queue
              </CardTitle>
              <Link href="/queue" className="text-xs font-medium text-primary hover:underline">
                Full queue
              </Link>
            </CardHeader>
            <CardContent className="space-y-1">
              {data.queue.map((t) => (
                <TaskMiniRow key={t.id} taskId={t.id} title={t.title} reference={t.reference} deadline={t.deadline} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="size-4 text-muted-foreground" /> Upcoming deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {data.upcoming.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 px-2 py-1.5">
                  <Link href={`/tasks/${t.id}`} className="truncate text-sm hover:underline">
                    {t.title}
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(t.deadline)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
