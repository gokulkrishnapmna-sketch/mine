"use client";

import { useMemo } from "react";
import { FilePlus2, CheckCircle2, Timer, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DepartmentBar, PriorityDonut, TrendArea } from "@/components/analytics/charts";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { useStore } from "@/lib/store";
import { PRIORITIES, PRIORITY_META } from "@/lib/constants";

function weekKey(d: Date) {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86_400_000 + onejan.getDay() + 1) / 7);
  return `W${week}`;
}

export default function AnalyticsPage() {
  const { tasks, isAdmin } = useStore();

  const data = useMemo(() => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    const createdThisMonth = tasks.filter((t) => +new Date(t.createdAt) >= monthStart).length;
    const completed = tasks.filter((t) => t.status === "completed");
    const completedAll = tasks.filter((t) => ["completed", "approved", "archived"].includes(t.status));
    const avgCompletion =
      completedAll.length > 0
        ? completedAll.reduce((s, t) => s + (+new Date(t.updatedAt) - +new Date(t.createdAt)) / 86_400_000, 0) /
          completedAll.length
        : 0;

    const deptMap = new Map<string, number>();
    for (const t of tasks) deptMap.set(t.department, (deptMap.get(t.department) ?? 0) + 1);
    const byDept = [...deptMap.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const byPriority = PRIORITIES.map((p) => ({
      name: PRIORITY_META[p].label,
      value: tasks.filter((t) => t.priority === p).length,
      color:
        p === "critical" ? "#ef4444" : p === "high" ? "#f97316" : p === "medium" ? "#3b82f6" : "#94a3b8",
    })).filter((d) => d.value > 0);

    // Trend over last 8 weeks
    const weeks: { week: string; created: number; completed: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const ref = new Date(Date.now() - i * 7 * 86_400_000);
      const key = weekKey(ref);
      const lo = +ref - 3.5 * 86_400_000;
      const hi = +ref + 3.5 * 86_400_000;
      weeks.push({
        week: key,
        created: tasks.filter((t) => +new Date(t.createdAt) >= lo && +new Date(t.createdAt) < hi).length,
        completed: tasks.filter(
          (t) =>
            ["completed", "approved"].includes(t.status) &&
            +new Date(t.updatedAt) >= lo &&
            +new Date(t.updatedAt) < hi
        ).length,
      });
    }
    const busiest = [...weeks].sort((a, b) => b.created - a.created)[0];

    return { createdThisMonth, completed: completed.length, avgCompletion, byDept, byPriority, weeks, busiest };
  }, [tasks]);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Analytics" />
        <EmptyState
          icon={TrendingUp}
          title="Admin only"
          description="The analytics dashboard is available to Gokul. Switch to the admin user (bottom-left) to view it in this demo."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Analytics" description="Workload trends, throughput, and demand by team." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Created This Month" value={data.createdThisMonth} icon={FilePlus2} accent="text-primary" />
        <StatCard label="Tasks Completed" value={data.completed} icon={CheckCircle2} accent="text-emerald-500" />
        <StatCard label="Avg Completion" value={`${data.avgCompletion.toFixed(1)}d`} icon={Timer} accent="text-sky-500" />
        <StatCard label="Busiest Week" value={data.busiest?.week ?? "—"} icon={TrendingUp} accent="text-orange-500" hint={`${data.busiest?.created ?? 0} requests`} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Workload trend</CardTitle>
            <p className="text-xs text-muted-foreground">Created vs. completed over the last 8 weeks</p>
          </CardHeader>
          <CardContent>
            <TrendArea data={data.weeks} />
            <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Created</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> Completed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tasks by priority</CardTitle>
          </CardHeader>
          <CardContent>
            <PriorityDonut data={data.byPriority} />
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {PRIORITIES.map((p) => (
                <PriorityBadge key={p} priority={p} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tasks by department</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentBar data={data.byDept} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top requesting departments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.byDept.slice(0, 6).map((d, i) => {
              const max = data.byDept[0]?.value || 1;
              return (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-semibold text-muted-foreground">{i + 1}</span>
                  <span className="w-28 truncate text-sm">{d.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(d.value / max) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right text-sm font-semibold tabular-nums">{d.value}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
