import { NextResponse } from "next/server";
import { SEED_TASKS } from "@/lib/seed";
import { computeCapacity } from "@/lib/capacity";
import { ACTIVE_STATUSES } from "@/lib/constants";
import type { Task } from "@/lib/types";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────
// GET /api/reports/weekly
//
// Auto-generated weekly summary. In production this is triggered by a
// Vercel Cron (see vercel.json) which queries Supabase for the real
// tasks and emails the digest via Resend. Here we compute it from the
// seed data to demonstrate the shape of the payload.
// ─────────────────────────────────────────────────────────────

function buildReport(tasks: Task[]) {
  const weekAgo = Date.now() - 7 * 86_400_000;
  const completed = tasks.filter(
    (t) => t.status === "completed" && +new Date(t.updatedAt) >= weekAgo
  );
  const pending = tasks.filter((t) => ACTIVE_STATUSES.includes(t.status));
  const cap = computeCapacity(tasks);

  return {
    generatedAt: new Date().toISOString(),
    period: "last_7_days",
    capacity: { percent: cap.percent, band: cap.band, message: cap.message },
    completed: {
      count: completed.length,
      items: completed.map((t) => ({ ref: t.reference, title: t.title })),
    },
    pending: {
      count: pending.length,
      critical: pending.filter((t) => t.priority === "critical").length,
      high: pending.filter((t) => t.priority === "high").length,
      items: pending.map((t) => ({ ref: t.reference, title: t.title, priority: t.priority })),
    },
  };
}

export function GET() {
  const report = buildReport(SEED_TASKS);

  // Production: send via Resend
  // await fetch("https://api.resend.com/emails", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
  //   body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [...], subject: "Weekly design report", html: renderReport(report) }),
  // });

  return NextResponse.json(report);
}
