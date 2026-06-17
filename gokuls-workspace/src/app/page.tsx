"use client";

import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ListOrdered,
  Gauge,
  KanbanSquare,
  MessageSquare,
  Bell,
  ShieldCheck,
  Search,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CapacityMeter } from "@/components/dashboard/capacity-meter";
import { useStore } from "@/lib/store";
import { ACTIVE_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: Gauge, title: "Live capacity", body: "See exactly how occupied Gokul is — updated automatically from active work." },
  { icon: ListOrdered, title: "Smart queue", body: "Tasks auto-rank by priority, deadline urgency, and age. Everyone sees the order." },
  { icon: KanbanSquare, title: "Kanban board", body: "Drag tasks across Backlog → In Progress → Review → Completed." },
  { icon: MessageSquare, title: "In-task chat", body: "Mentions, threads, and questions — no more requests lost in DMs." },
  { icon: Bell, title: "Notifications", body: "In-app + email when questions are asked, answered, or work ships." },
  { icon: ShieldCheck, title: "AI intake checks", body: "Briefs get a quality score and missing-info nudges before they're submitted." },
];

export default function HomePage() {
  const { tasks } = useStore();
  const active = tasks.filter((t) => ACTIVE_STATUSES.includes(t.status)).length;

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-bold">Gokul&apos;s Workspace</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Open app
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-accent/60 to-transparent" />
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-12 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {active} active design requests · live
            </span>
            <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Gokul&apos;s Workspace
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              A transparent design request and workload management platform that helps everyone
              understand priorities, timelines, and ongoing work.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/tasks/new"
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
              >
                Create New Request <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/queue"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
              >
                View Current Queue
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-2xl">
            <CapacityMeter />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-center text-2xl font-bold tracking-tight">One source of truth</h2>
        <p className="mt-2 text-center text-muted-foreground">
          No more requests scattered across chats, emails, calls, and hallway conversations.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Search className="size-4" />
          Tip: press <kbd className="rounded border border-border px-1.5 py-0.5 text-xs">⌘K</kbd> anywhere to search.
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-xs text-muted-foreground">
          Gokul&apos;s Workspace — internal design request management. Built with Next.js, Tailwind, and Supabase.
        </div>
      </footer>
    </div>
  );
}
