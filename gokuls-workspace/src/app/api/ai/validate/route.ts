import { NextResponse } from "next/server";
import {
  estimateEffort,
  recommendPriority,
  validateRequest,
  type DraftRequest,
} from "@/lib/ai";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/validate
 * Body: DraftRequest
 * Returns: { validation, priority, effort }
 *
 * Runs the deterministic heuristics. To upgrade to Claude, set
 * ANTHROPIC_API_KEY and forward the same draft to the Anthropic
 * Messages API (claude-opus-4-8) here, then merge the structured
 * response with the heuristic result as a fallback.
 */
export async function POST(req: Request) {
  let draft: DraftRequest;
  try {
    draft = (await req.json()) as DraftRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateRequest(draft);
  const priority = recommendPriority(draft);
  const effort = estimateEffort(draft);

  return NextResponse.json({
    engine: process.env.ANTHROPIC_API_KEY ? "claude-ready" : "heuristic",
    validation,
    priority,
    effort,
  });
}
