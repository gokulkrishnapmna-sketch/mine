"use client";

import { AlertCircle, CheckCircle2, Lightbulb, Sparkles, Wand2 } from "lucide-react";
import { IntakeScoreRing } from "./intake-score";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "./priority-badge";
import {
  estimateEffort,
  recommendPriority,
  validateRequest,
  type DraftRequest,
} from "@/lib/ai";
import type { EffortEstimate, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEVEL_META: Record<string, { label: string; tone: string }> = {
  excellent: { label: "Excellent brief", tone: "text-emerald-600 dark:text-emerald-400" },
  good: { label: "Good brief", tone: "text-sky-600 dark:text-sky-400" },
  fair: { label: "Needs more detail", tone: "text-amber-600 dark:text-amber-400" },
  low: { label: "Incomplete brief", tone: "text-red-600 dark:text-red-400" },
};

const EFFORT_LABEL: Record<EffortEstimate, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
  xl: "XL",
};

export function AiAssistPanel({
  draft,
  onApplyPriority,
}: {
  draft: DraftRequest;
  onApplyPriority: (p: Priority) => void;
}) {
  const result = validateRequest(draft);
  const priority = recommendPriority(draft);
  const effort = estimateEffort(draft);
  const level = LEVEL_META[result.level];

  return (
    <Card className="sticky top-20 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-accent/40 px-4 py-3">
        <Sparkles className="size-4 text-primary" />
        <span className="text-sm font-semibold">AI Request Assistant</span>
      </div>

      <div className="space-y-4 p-4">
        {/* Intake score */}
        <div className="flex items-center gap-3">
          <IntakeScoreRing score={result.score} size={54} label={false} />
          <div>
            <p className="text-xs text-muted-foreground">Design Intake Score</p>
            <p className={cn("text-sm font-semibold", level.tone)}>{level.label}</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Suggested priority</p>
            <div className="mt-1.5 flex items-center justify-between gap-1">
              <PriorityBadge priority={priority.priority} />
              <button
                onClick={() => onApplyPriority(priority.priority)}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Apply
              </button>
            </div>
            <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{priority.reason}</p>
          </div>
          <div className="rounded-lg border border-border p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Effort estimate</p>
            <p className="mt-1.5 inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold">
              {EFFORT_LABEL[effort.effort]}
            </p>
            <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{effort.reason}</p>
          </div>
        </div>

        {/* Missing info */}
        {result.missing.length > 0 ? (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
              <AlertCircle className="size-3.5" /> Missing required info
            </p>
            <ul className="space-y-1">
              {result.missing.map((m) => (
                <li key={m} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <span className="mt-1 size-1 shrink-0 rounded-full bg-red-500" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" /> All required fields look good.
          </p>
        )}

        {/* Suggestions */}
        {result.suggestions.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Lightbulb className="size-3.5" /> Suggestions
            </p>
            <ul className="space-y-1">
              {result.suggestions.map((s) => (
                <li key={s} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <span className="mt-1 size-1 shrink-0 rounded-full bg-amber-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2.5 py-2 text-[11px] text-muted-foreground">
          <Wand2 className="size-3.5 shrink-0" />
          Heuristic checks run locally. Set <code className="font-mono">ANTHROPIC_API_KEY</code> to upgrade to Claude.
        </div>
      </div>
    </Card>
  );
}
