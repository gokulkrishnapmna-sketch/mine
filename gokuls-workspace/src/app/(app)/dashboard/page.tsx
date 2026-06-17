"use client";

import Link from "next/link";
import {
  Layers,
  Flame,
  CircleDot,
  CheckCircle2,
  ArrowRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { CapacityMeter } from "@/components/dashboard/capacity-meter";
import { TaskCard } from "@/components/tasks/task-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { useStore } from "@/lib/store";
import { ACTIVE_STATUSES, PRIORITIES, PRIORITY_META } from "@/lib/constants";
import { buildQueue } from "@/lib/queue";
import { daysUntil } from "@/lib/utils";
import { useMemo } from "react";

export default function DashboardPage() {
  const { tasks, comments } = useStore();

  const stats = useMemo(() => {
    const active = tasks.filter((t) => ACTIVE_STATUSES.includes(t.status));
    const byPriority = Object.fromEntries(
      PRIORITIES.map((p) => [p, active.filter((t) => t.priority === p).length])
    ) as Record<string, number>;
    const completedThisWeek = tasks.filter(
      (t) =>
        t.status === "completed" &&
        Date.now() - new Date(t.updatedAt).getTime() < 7 * 86_400_000
    ).length;
    return { active, byPriority, completedThisWeek };
  }, [tasks]);

  const queue = useMemo(() => buildQueue(tasks).slice(0, 4), [tasks]);
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const upcoming = useMemo(
    () =>
      tasks
        .filter((t) => ACTIVE_STATUSES.includes(t.status) && t.deadline)
        .sort((a, b) => +new Date(a.deadline!) - +new Date(b.deadline!))
        .slice(0, 5),
    [tasks]
  );

  const commentCount = (taskId: string) => comments.filter((c) => c.taskId === taskId).length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Dashboard"
        description="Current workload at a glance — updates automatically from active tasks."
      />

      {/* Workload stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Active Tasks" value={stats.active.length} icon={Layers} accent="text-primary" />
        <StatCard label="High / Critical" value={stats.byPriority.critical + stats.byPriority.high} icon={Flame} accent="text-orange-500" hint={`${stats.byPriority.critical} critical · ${stats.byPriority.high} high`} />
        <StatCard label="In Progress" value={inProgress.length} icon={CircleDot} accent="text-amber-500" />
        <StatCard label="Completed (7d)" value={stats.completedThisWeek} icon={CheckCircle2} accent="text-emerald-500" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CapacityMeter />

          {/* Priority breakdown */}
          <Card className="mt-5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Priority breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {PRIORITIES.map((p) => {
                const count = stats.byPriority[p];
                const pct = stats.active.length ? (count / stats.active.length) * 100 : 0;
                return (
                  <div key={p} className="flex items-center gap-3">
                    <div className="w-20">
                      <PriorityBadge priority={p} />
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${PRIORITY_META[p].dot}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-sm font-semibold tabular-nums">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Up next + deadlines */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Up next in queue</CardTitle>
              <Link href="/queue" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {queue.map((t, i) => (
                <Link
                  key={t.id}
                  href={`/tasks/${t.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-2.5 transition-colors hover:bg-accent"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-[11px] text-muted-foreground">{t.reference}</p>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-muted-foreground" /> Upcoming deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcoming.map((t) => {
                const d = daysUntil(t.deadline);
                const overdue = d !== null && d < 0;
                return (
                  <Link
                    key={t.id}
                    href={`/tasks/${t.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-accent"
                  >
                    <span className="truncate text-sm">{t.title}</span>
                    <span
                      className={`flex shrink-0 items-center gap-1 text-xs font-medium ${
                        overdue ? "text-red-500" : d !== null && d <= 2 ? "text-orange-500" : "text-muted-foreground"
                      }`}
                    >
                      {overdue && <AlertTriangle className="size-3" />}
                      {d === 0 ? "Today" : overdue ? `${Math.abs(d!)}d late` : `${d}d`}
                    </span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Currently working on */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CircleDot className="size-4 text-amber-500" /> Currently working on
          </h2>
          <Link href="/workload" className="flex items-center gap-1 text-sm text-primary hover:underline">
            Gokul&apos;s work <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {inProgress.map((t) => (
            <TaskCard key={t.id} task={t} commentCount={commentCount(t.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
