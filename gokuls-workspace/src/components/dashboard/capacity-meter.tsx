"use client";

import { Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";
import { computeCapacity } from "@/lib/capacity";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const BANDS = [
  { label: "Comfortable", range: "0–40%" },
  { label: "Busy", range: "40–70%" },
  { label: "High Load", range: "70–90%" },
  { label: "At Capacity", range: "90–100%" },
];

export function CapacityMeter({ className }: { className?: string }) {
  const { tasks } = useStore();
  const cap = computeCapacity(tasks);

  return (
    <Card className={cn("overflow-hidden p-5", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Gauge className="size-4" /> Current Capacity
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold text-white",
            cap.color
          )}
        >
          {cap.label}
        </span>
      </div>

      <div className="mt-4 flex items-end gap-3">
        <span className="text-4xl font-bold tabular-nums tracking-tight">{cap.percent}%</span>
        <span className="mb-1 text-xs text-muted-foreground">
          {cap.activePoints} / {cap.baseline} effort points active
        </span>
      </div>

      {/* Segmented meter */}
      <div className="relative mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", cap.color)}
          style={{ width: `${cap.percent}%` }}
        />
        {[40, 70, 90].map((tick) => (
          <span
            key={tick}
            className="absolute top-0 h-full w-px bg-background/70"
            style={{ left: `${tick}%` }}
          />
        ))}
      </div>

      <p className="mt-3 text-sm font-medium">{cap.message}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BANDS.map((b) => (
          <div
            key={b.label}
            className={cn(
              "rounded-lg border px-2 py-1.5 text-center",
              b.label === cap.label ? "border-primary/40 bg-accent" : "border-border"
            )}
          >
            <p className="text-[11px] font-medium">{b.label}</p>
            <p className="text-[10px] text-muted-foreground">{b.range}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
