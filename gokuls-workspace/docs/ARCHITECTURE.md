# Architecture

## Overview

Gokul's Workspace is a Next.js (App Router) application. It is designed to run
in two modes from the **same UI code**:

- **Demo mode** — a client-side store (`src/lib/store.tsx`) backed by React
  Context + `localStorage`, seeded with realistic data. No backend needed.
- **Production mode** — Supabase provides Postgres, Auth (Google SSO), Storage,
  and Realtime. The UI talks to it through the same action surface.

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Next.js)                     │
│                                                              │
│  App Router pages ──► Components ──► useStore() actions      │
│        │                                   │                 │
│        │ ⌘K command menu, theme, realtime  │                 │
│        ▼                                   ▼                 │
│  ┌──────────────┐                 ┌──────────────────────┐   │
│  │ Demo store   │   (swap)        │ Supabase client       │  │
│  │ Context +    │ ◄────────────►  │ (auth + data + RT)    │  │
│  │ localStorage │                 └──────────┬────────────┘  │
│  └──────────────┘                            │               │
└──────────────────────────────────────────────┼──────────────┘
                                                │
                  Next API routes ──────────────┤
                  /api/ai/validate              │
                  /api/reports/weekly  ─► Resend │
                  /api/health                    ▼
                                        ┌──────────────────┐
                                        │ Supabase (Postgres│
                                        │ + Auth + Storage  │
                                        │ + Realtime)       │
                                        └──────────────────┘
```

## Layers

### 1. Domain layer (`src/lib`)
Pure, framework-agnostic logic — unit tested, reusable on client and server.

- `types.ts` — the domain model (mirrors the SQL schema).
- `constants.ts` — priorities, statuses, deliverable types, departments, colors,
  capacity baseline, effort weights, reference-provider detection.
- `queue.ts` — **smart queue scoring** (`priority + deadline + aging + intake`).
- `capacity.ts` — **capacity meter** derived from active-task effort points.
- `ai.ts` — intake validation, priority recommendation, effort estimation.
- `seed.ts` — realistic demo data (users, tasks, comments, activity, notifications).

### 2. State layer (`src/lib/store.tsx`)
A `useReducer` store exposing intent-style actions: `createTask`,
`changeStatus`, `changePriority`, `addComment`, `reorderQueue`,
`markAllRead`, … Each action also writes the **activity log** and fans out
**notifications** (e.g. a question notifies the requester; a new request
notifies Gokul). Persisted to `localStorage`. In production each action maps to
a Supabase mutation + Realtime subscription.

### 3. UI layer (`src/components`)
- `ui/` — ShadCN-style primitives (CVA variants, `cn()` merge helper).
- `layout/` — app shell, responsive sidebar, top bar, command palette,
  notification center, theme toggle, demo user switcher.
- Feature components for tasks, dashboard, board, queue, and analytics.

### 4. Routing (`src/app`)
- `/` — marketing-style hero (standalone).
- `(app)/*` — route group wrapped in the authenticated `AppShell`.
- `api/*` — route handlers for health, AI validation, and the weekly report.

## Key design decisions

- **Transparency by default.** Every authenticated user can read every task,
  the queue, and Gokul's workload. RLS restricts *writes*, not reads.
- **Capacity is derived, not entered.** It is recomputed from the effort points
  of active tasks (weighted up for in-progress work), so it is always live.
- **The queue is explainable.** Each task exposes its score; the formula is
  documented in the UI. Gokul's manual order overrides the score when needed.
- **AI is a seam, not a dependency.** Heuristics keep the product fully
  functional offline; Claude can be slotted in behind the same function
  signatures.

## Real-time strategy (production)

Subscribe to Postgres changes via Supabase Realtime on `tasks`, `comments`,
`activity_events`, and `notifications`, and dispatch the same reducer actions
the demo store uses — so the board, queue, and notification badge update live
across everyone's screens.
