import { ACTIVE_STATUSES, CAPACITY_BASELINE } from "./constants";
import { effortPoints } from "./queue";
import type { Task } from "./types";
import { clamp } from "./utils";

export type CapacityBand = "comfortable" | "busy" | "high" | "at_capacity";

export interface CapacitySnapshot {
  percent: number;
  band: CapacityBand;
  label: string;
  activePoints: number;
  baseline: number;
  message: string;
  color: string; // tailwind bg- token for the meter fill
}

export function bandFor(percent: number): CapacityBand {
  if (percent < 40) return "comfortable";
  if (percent < 70) return "busy";
  if (percent < 90) return "high";
  return "at_capacity";
}

const BAND_META: Record<CapacityBand, { label: string; color: string }> = {
  comfortable: { label: "Comfortable", color: "bg-emerald-500" },
  busy: { label: "Busy", color: "bg-amber-500" },
  high: { label: "High Load", color: "bg-orange-500" },
  at_capacity: { label: "At Capacity", color: "bg-red-500" },
};

/**
 * Capacity is derived from the effort points of all *active* tasks,
 * weighted up for in-progress work (it consumes more focus than backlog).
 */
export function computeCapacity(tasks: Task[]): CapacitySnapshot {
  const active = tasks.filter((t) => ACTIVE_STATUSES.includes(t.status));
  const activePoints = active.reduce((sum, t) => {
    const focus =
      t.status === "in_progress" ? 1.25 : t.status === "review" ? 0.6 : 1;
    return sum + effortPoints(t) * focus;
  }, 0);

  const percent = clamp(Math.round((activePoints / CAPACITY_BASELINE) * 100), 0, 100);
  const band = bandFor(percent);

  return {
    percent,
    band,
    label: BAND_META[band].label,
    color: BAND_META[band].color,
    activePoints: Math.round(activePoints),
    baseline: CAPACITY_BASELINE,
    message: `Gokul is currently operating at ${percent}% capacity.`,
  };
}
