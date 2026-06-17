"use client";

import { useMemo, useState } from "react";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/tasks/task-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useStore } from "@/lib/store";
import {
  DEPARTMENTS,
  PRIORITIES,
  PRIORITY_META,
  STATUSES,
  STATUS_META,
} from "@/lib/constants";

export default function SearchPage() {
  const { tasks, comments, users } = useStore();
  const [q, setQ] = useState("");
  const [requester, setRequester] = useState("");
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const results = useMemo(() => {
    const query = q.toLowerCase().trim();
    return tasks.filter((t) => {
      if (query) {
        const hay = `${t.title} ${t.description} ${t.reference} ${t.tags.join(" ")} ${t.contact.name}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (requester && t.requesterId !== requester) return false;
      if (department && t.department !== department) return false;
      if (priority && t.priority !== priority) return false;
      if (status && t.status !== status) return false;
      if (from && t.deadline && new Date(t.deadline) < new Date(from)) return false;
      if (to && t.deadline && new Date(t.deadline) > new Date(to)) return false;
      if ((from || to) && !t.deadline) return false;
      return true;
    });
  }, [tasks, q, requester, department, priority, status, from, to]);

  const commentCount = (id: string) => comments.filter((c) => c.taskId === id).length;
  const activeFilters = [requester, department, priority, status, from, to].filter(Boolean).length;

  function clearAll() {
    setRequester("");
    setDepartment("");
    setPriority("");
    setStatus("");
    setFrom("");
    setTo("");
    setQ("");
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Search & Filters" description="Find any request across every team and status." />

      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, description, reference, tag, or contact…"
          className="h-11 pl-9"
        />
      </div>

      <div className="mb-5 rounded-xl border border-border bg-card p-3 shadow-soft">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <SlidersHorizontal className="size-4 text-muted-foreground" /> Filters
            {activeFilters > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 text-xs text-primary">{activeFilters}</span>
            )}
          </span>
          {(activeFilters > 0 || q) && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X className="size-3.5" /> Clear
            </Button>
          )}
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <Select value={requester} onChange={(e) => setRequester(e.target.value)}>
            <option value="">Any requester</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
          <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">Any department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
          <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Any priority</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Any status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </Select>
          <div className="flex items-center gap-1.5">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Deadline from" />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Deadline to" />
          </div>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? "result" : "results"}
      </p>

      {results.length === 0 ? (
        <EmptyState icon={SearchIcon} title="No matching tasks" description="Try removing a filter or broadening your search." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((t) => (
            <TaskCard key={t.id} task={t} commentCount={commentCount(t.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
