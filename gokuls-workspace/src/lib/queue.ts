import { ACTIVE_STATUSES, EFFORT_POINTS, PRIORITY_META } from "./constants";
import type { Task } from "./types";
import { daysUntil } from "./utils";

// ─────────────────────────────────────────────────────────────
// Smart Queue scoring
//
//   score = priorityWeight              (Critical 100 … Low 25)
//         + deadlineUrgencyBonus        (closer deadline → higher)
//         + agingBonus                  (older requests bubble up slowly)
//         + intakeQualityNudge          (well-formed briefs rank higher)
//
// A manual `queueRank` (set by Gokul when he reorders) always wins so
// the admin keeps final control over ordering.
// ─────────────────────────────────────────────────────────────

export function deadlineUrgencyBonus(task: Task): number {
  const d = daysUntil(task.deadline);
  if (d === null) return 0;
  if (d <= 0) return 60; // overdue or due today
  if (d <= 2) return 45;
  if (d <= 5) return 30;
  if (d <= 10) return 18;
  if (d <= 20) return 8;
  return 2;
}

export function agingBonus(task: Task): number {
  const ageDays =
    (Date.now() - new Date(task.createdAt).getTime()) / (24 * 60 * 60 * 1000);
  // +1 per day, capped so old low-priority work can't starve urgent items.
  return Math.min(Math.round(ageDays), 15);
}

export function queueScore(task: Task): number {
  const priority = PRIORITY_META[task.priority].weight;
  const intakeNudge = Math.round((task.intakeScore - 50) / 10); // -5 … +5
  return priority + deadlineUrgencyBonus(task) + agingBonus(task) + intakeNudge;
}

/**
 * Returns active tasks ordered for the smart queue.
 * Manual `queueRank` takes precedence; ties + unranked items fall back to score.
 */
export function buildQueue(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => ACTIVE_STATUSES.includes(t.status))
    .map((t) => ({ task: t, score: queueScore(t) }))
    .sort((a, b) => {
      const ra = a.task.queueRank;
      const rb = b.task.queueRank;
      if (ra != null && rb != null && ra !== rb) return ra - rb;
      if (ra != null && rb == null) return -1;
      if (ra == null && rb != null) return 1;
      return b.score - a.score;
    })
    .map((x) => x.task);
}

export function effortPoints(task: Task): number {
  if (!task.effort) return EFFORT_POINTS.medium;
  return EFFORT_POINTS[task.effort];
}
