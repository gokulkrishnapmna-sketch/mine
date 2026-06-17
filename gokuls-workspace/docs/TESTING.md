# Testing strategy

## Layers

| Layer | Tooling | What it covers |
| --- | --- | --- |
| **Domain logic** | Vitest (`tests/domain.test.ts`) | Queue scoring, capacity bands, AI intake validation, priority/effort recommendations. Pure functions, fast, no DOM. |
| **Type safety** | `tsc --noEmit` | The whole app is strict-typed; the domain model mirrors the SQL schema. |
| **Lint** | `next lint` (ESLint, `next/core-web-vitals`) | Accessibility + React/Next best practices. |
| **Build** | `next build` | Compiles all routes; catches server/client boundary mistakes. |
| **Component / E2E** (recommended) | React Testing Library + Playwright | See below. |

## What's implemented now

```bash
npm run typecheck   # ✅ strict, no errors
npm test            # ✅ 10 domain tests
npm run lint        # ✅ clean
npm run build       # ✅ all 12 routes compile
```

The domain tests assert the rules that matter most for correctness and trust:

- Critical work outranks low; overdue work gets a bigger deadline bonus.
- A manually pinned `queueRank` overrides the computed score.
- Archived/completed tasks are excluded from the active queue.
- Capacity always resolves to 0–100 and the right band label.
- A complete brief scores ≥ 70 and is "ready"; an empty one lists missing fields.
- Priority/effort recommendations respond to deadline and deliverable type.

## Recommended additions

### Component tests (React Testing Library)
- `TaskForm` — submitting with missing required fields is blocked; AI panel
  reflects field changes; applying the suggested priority updates the select.
- `CommentThread` — posting a comment renders it; `@mention` highlights; a
  "question" toggles the question badge.
- `NotificationCenter` — unread badge count; "mark all read" clears it.

### End-to-end (Playwright)
1. Requester creates a request → it appears in Backlog and on the queue.
2. Switch to admin → drag the card to *In Progress* → capacity meter increases;
   activity timeline shows the move; requester gets a notification.
3. Admin asks a question → switch to requester → reply → admin notified.
4. Filters on `/search` narrow results correctly.

### Production data layer
When wired to Supabase, add integration tests against a local Supabase
(`supabase start`) that exercise **RLS**: a requester cannot update another
user's task; a non-admin cannot change status; everyone can read the board.
