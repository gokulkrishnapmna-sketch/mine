import { DELIVERABLE_EFFORT_DAYS } from "./constants";
import type {
  DeliverableType,
  EffortEstimate,
  Priority,
  Task,
} from "./types";
import { daysUntil } from "./utils";

// ─────────────────────────────────────────────────────────────
// AI assist layer.
//
// These are deterministic heuristics so the product works out of the
// box with no API key. Each function is a drop-in seam: set
// ANTHROPIC_API_KEY and route the same inputs through Claude
// (claude-opus-4-8) from a server action to upgrade quality.
// ─────────────────────────────────────────────────────────────

export interface DraftRequest {
  title: string;
  description: string;
  businessObjective: string;
  deliverableType: DeliverableType | "";
  deadline: string | null;
  priority: Priority | "";
  contactEmail: string;
  contactPhone: string;
  references: number;
  attachments: number;
  pendingInfo: string[];
}

export interface ValidationResult {
  score: number; // 1–100 Design Intake Score
  level: "low" | "fair" | "good" | "excellent";
  missing: string[];
  suggestions: string[];
  ready: boolean;
}

const WORD = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function validateRequest(draft: DraftRequest): ValidationResult {
  const missing: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Title — 12 pts
  if (draft.title.trim().length >= 6) score += 12;
  else missing.push("A clear, specific task title");

  // Description — 24 pts, rewarded for detail
  const descWords = WORD(draft.description);
  if (descWords >= 40) score += 24;
  else if (descWords >= 15) {
    score += 14;
    suggestions.push("Add more detail to the description (aim for 40+ words).");
  } else missing.push("A description of what's needed");

  // Business objective — 18 pts
  if (WORD(draft.businessObjective) >= 8) score += 18;
  else missing.push("The business objective — why this is needed");

  // Deliverable type — 10 pts
  if (draft.deliverableType) score += 10;
  else missing.push("A deliverable type");

  // Deadline — 12 pts
  const d = daysUntil(draft.deadline);
  if (d === null) missing.push("A target deadline");
  else if (d < 0) {
    suggestions.push("The deadline is in the past — double-check the date.");
    score += 4;
  } else if (d < 1) {
    suggestions.push("Same-day deadline — confirm this is realistic with Gokul.");
    score += 10;
  } else score += 12;

  // Contact — 10 pts
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.contactEmail)) score += 8;
  else missing.push("A valid contact email");
  if (draft.contactPhone.trim()) score += 2;
  else suggestions.push("Add a contact phone for time-sensitive questions.");

  // References / attachments — 14 pts
  if (draft.references + draft.attachments >= 2) score += 14;
  else if (draft.references + draft.attachments === 1) {
    score += 7;
    suggestions.push("Add brand assets or examples so Gokul can match the style.");
  } else
    suggestions.push(
      "Attach reference files or links (Figma, Drive, examples) — briefs with references ship ~30% faster."
    );

  if (draft.pendingInfo.length > 0) {
    suggestions.push(
      `You flagged ${draft.pendingInfo.length} pending item(s) — provide them to avoid a "Waiting for Inputs" stall.`
    );
    score -= Math.min(draft.pendingInfo.length * 3, 9);
  }

  score = Math.max(1, Math.min(100, Math.round(score)));
  const level =
    score >= 85 ? "excellent" : score >= 70 ? "good" : score >= 45 ? "fair" : "low";

  return {
    score,
    level,
    missing,
    suggestions,
    ready: missing.length === 0 && score >= 60,
  };
}

export function recommendPriority(draft: DraftRequest): {
  priority: Priority;
  reason: string;
} {
  const d = daysUntil(draft.deadline);
  const objective = draft.businessObjective.toLowerCase();
  const highImpact =
    /launch|campaign|investor|board|ceo|event|deadline|revenue|client|press|crisis/.test(
      objective
    );

  if (d !== null && d <= 2)
    return { priority: "critical", reason: "Deadline is within 48 hours." };
  if (highImpact && d !== null && d <= 7)
    return {
      priority: "high",
      reason: "High business impact with a near-term deadline.",
    };
  if (d !== null && d <= 7)
    return { priority: "high", reason: "Deadline is within a week." };
  if (highImpact)
    return { priority: "medium", reason: "Notable business impact, flexible timing." };
  if (d !== null && d <= 21)
    return { priority: "medium", reason: "Moderate timeline." };
  return { priority: "low", reason: "No urgent deadline or impact signals." };
}

export function estimateEffort(draft: DraftRequest): {
  effort: EffortEstimate;
  reason: string;
} {
  const base = draft.deliverableType
    ? DELIVERABLE_EFFORT_DAYS[draft.deliverableType]
    : 1.5;
  const descWords = WORD(draft.description);
  // longer briefs usually imply bigger scope
  const scopeMultiplier = descWords > 120 ? 1.5 : descWords > 60 ? 1.2 : 1;
  const days = base * scopeMultiplier;

  let effort: EffortEstimate;
  if (days <= 1) effort = "small";
  else if (days <= 2.5) effort = "medium";
  else if (days <= 4.5) effort = "large";
  else effort = "xl";

  const label = { small: "Small", medium: "Medium", large: "Large", xl: "XL" }[
    effort
  ];
  return {
    effort,
    reason: `${label} — ~${days.toFixed(1)} working day(s) based on deliverable type and scope.`,
  };
}

/** Convenience: build a DraftRequest from a saved Task (for recompute). */
export function draftFromTask(task: Task): DraftRequest {
  return {
    title: task.title,
    description: task.description,
    businessObjective: task.businessObjective,
    deliverableType: task.deliverableType,
    deadline: task.deadline,
    priority: task.priority,
    contactEmail: task.contact.email,
    contactPhone: task.contact.phone ?? "",
    references: task.references.length,
    attachments: task.attachments.length,
    pendingInfo: task.pendingInfo,
  };
}
