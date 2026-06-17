import { describe, it, expect } from "vitest";
import { queueScore, buildQueue, deadlineUrgencyBonus } from "@/lib/queue";
import { computeCapacity, bandFor } from "@/lib/capacity";
import { validateRequest, recommendPriority, estimateEffort, type DraftRequest } from "@/lib/ai";
import { SEED_TASKS } from "@/lib/seed";
import type { Task } from "@/lib/types";

const baseTask = (over: Partial<Task>): Task => ({
  id: "x",
  reference: "GW-999",
  title: "Test",
  description: "desc",
  businessObjective: "obj",
  status: "todo",
  priority: "medium",
  deliverableType: "poster",
  department: "Marketing",
  requesterId: "u_aisha",
  contact: { name: "A", email: "a@a.com" },
  deadline: null,
  estimatedCompletion: null,
  effort: "medium",
  tags: [],
  pendingInfo: [],
  attachments: [],
  references: [],
  intakeScore: 50,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...over,
});

describe("queue scoring", () => {
  it("ranks critical above low priority", () => {
    const critical = baseTask({ priority: "critical" });
    const low = baseTask({ priority: "low" });
    expect(queueScore(critical)).toBeGreaterThan(queueScore(low));
  });

  it("gives overdue work a larger deadline bonus than far-out work", () => {
    const overdue = baseTask({ deadline: new Date(Date.now() - 86_400_000).toISOString() });
    const farOut = baseTask({ deadline: new Date(Date.now() + 60 * 86_400_000).toISOString() });
    expect(deadlineUrgencyBonus(overdue)).toBeGreaterThan(deadlineUrgencyBonus(farOut));
  });

  it("honours a manual queueRank over score", () => {
    const pinnedLow = baseTask({ id: "pinned", priority: "low", queueRank: 1 });
    const critical = baseTask({ id: "crit", priority: "critical" });
    const order = buildQueue([critical, pinnedLow]).map((t) => t.id);
    expect(order[0]).toBe("pinned");
  });

  it("excludes archived/completed tasks from the active queue", () => {
    const ids = buildQueue(SEED_TASKS).map((t) => t.id);
    const archived = SEED_TASKS.find((t) => t.status === "archived");
    expect(ids).not.toContain(archived?.id);
  });
});

describe("capacity", () => {
  it("maps percentages to the right band", () => {
    expect(bandFor(20)).toBe("comfortable");
    expect(bandFor(55)).toBe("busy");
    expect(bandFor(80)).toBe("high");
    expect(bandFor(95)).toBe("at_capacity");
  });

  it("returns a percent between 0 and 100", () => {
    const cap = computeCapacity(SEED_TASKS);
    expect(cap.percent).toBeGreaterThanOrEqual(0);
    expect(cap.percent).toBeLessThanOrEqual(100);
  });
});

describe("AI intake", () => {
  const fullDraft: DraftRequest = {
    title: "Launch campaign creatives",
    description:
      "We need a coordinated set of LinkedIn creatives for the v3 launch including a hero card, three feature spotlights, a customer quote and a clear call to action card that follows the new brand system.",
    businessObjective: "Drive demo signups and establish the refreshed identity in market.",
    deliverableType: "linkedin_creative",
    deadline: new Date(Date.now() + 10 * 86_400_000).toISOString(),
    priority: "high",
    contactEmail: "a@company.com",
    contactPhone: "+1 555",
    references: 2,
    attachments: 1,
    pendingInfo: [],
  };

  it("scores a complete brief highly and marks it ready", () => {
    const r = validateRequest(fullDraft);
    expect(r.score).toBeGreaterThanOrEqual(70);
    expect(r.ready).toBe(true);
    expect(r.missing).toHaveLength(0);
  });

  it("flags missing fields on an empty brief", () => {
    const r = validateRequest({
      ...fullDraft,
      title: "",
      description: "",
      businessObjective: "",
      deliverableType: "",
      contactEmail: "",
      deadline: null,
    });
    expect(r.missing.length).toBeGreaterThan(0);
    expect(r.ready).toBe(false);
  });

  it("recommends critical priority for a 48h deadline", () => {
    const rec = recommendPriority({ ...fullDraft, deadline: new Date(Date.now() + 86_400_000).toISOString() });
    expect(rec.priority).toBe("critical");
  });

  it("estimates a larger effort for video than a social post", () => {
    const video = estimateEffort({ ...fullDraft, deliverableType: "video" });
    const social = estimateEffort({ ...fullDraft, deliverableType: "social_media_post" });
    const order = { small: 0, medium: 1, large: 2, xl: 3 };
    expect(order[video.effort]).toBeGreaterThan(order[social.effort]);
  });
});
