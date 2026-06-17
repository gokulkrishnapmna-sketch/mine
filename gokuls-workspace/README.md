# Gokul's Workspace

> A transparent design request and workload management platform that helps everyone
> understand priorities, timelines, and ongoing work.

Gokul's Workspace is an internal **Design Request Management System** for an
organization with a single communication designer (Gokul) and many requesters.
It replaces scattered requests across chat, email, calls, and hallway
conversations with **one source of truth**: structured briefs, a transparent
queue, a live capacity meter, and in-task communication.

Built to feel like **Notion + Linear + Trello** — minimal, fast, and intuitive.

---

## ✨ Features

| Area | What you get |
| --- | --- |
| **Dashboard** | Active task counts by priority + a live **capacity meter** (`Comfortable → At Capacity`) computed automatically from active work. |
| **New Request** | A structured intake form with **live AI assistance**: Design Intake Score (1–100), missing-info detection, priority recommendation, and effort estimate. |
| **Kanban Board** | Drag-and-drop across 8 columns (Backlog → Archived). Every move is logged. |
| **Smart Queue** | Auto-ranked by priority weight + deadline urgency + age + intake quality. Gokul can drag to pin a manual order. Visible to everyone. |
| **Gokul's Work** | Currently working on, waiting for inputs, next in queue, completed this week, average turnaround, upcoming deadlines. |
| **Task Details** | Description, business objective, pending info, attachments, references, threaded comments with `@mentions`, and a full activity timeline. |
| **Communication** | Task-scoped comments, mentions, questions → in-app + email notifications. |
| **Notifications** | Notification center with unread badge; dedicated inbox page. |
| **Search & Filters** | Global search + filters by requester, department, priority, status, deadline range, and tags. |
| **Analytics** (admin) | Workload trend, throughput, tasks by department/priority, busiest weeks, top requesting teams. |
| **UX** | Dark/light mode, mobile-first responsive, `⌘K` command palette, soft shadows, rounded cards. |

### Bonus AI features (implemented)
1. **AI Request Validator** — flags incomplete briefs before submission.
2. **AI Priority Recommendation** — suggests a priority from deadline + impact signals.
3. **AI Effort Estimation** — Small / Medium / Large / XL.
4. **Auto-generated Weekly Report** — `/api/reports/weekly` (wired to a Vercel Cron).
5. **Design Intake Score** — 1–100 quality score that nudges for more detail.

> The AI helpers run as **local heuristics** so the app works with zero API keys.
> Set `ANTHROPIC_API_KEY` to upgrade them to Claude (`claude-opus-4-8`) — see
> [`src/lib/ai.ts`](src/lib/ai.ts) and [`src/app/api/ai/validate/route.ts`](src/app/api/ai/validate/route.ts).

---

## 🧱 Tech Stack

- **Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · ShadCN-style UI
- **Drag & drop:** `@dnd-kit` · **Charts:** `recharts` · **Icons:** `lucide-react`
- **Backend (production):** Supabase — PostgreSQL, Auth (**Google SSO**), Storage, Realtime
- **Email:** Resend · **Deployment:** Vercel

### Demo mode vs. live mode
The app auto-detects its mode from the environment:

- **Demo mode** (no env vars) — a fully interactive client-side store
  (`src/lib/store.tsx`) seeded with realistic data, persisted to `localStorage`.
  No backend, no login. Everything works out of the box.
- **Live mode** (Supabase env vars present) — a real team workspace:
  **Google SSO** login (restricted to your company domain), a **shared
  PostgreSQL** database, Row Level Security, and **realtime** sync across
  everyone's screens. The same UI, backed by Supabase.

👉 **To stand up the real, team-invitable version, follow
[`docs/GO_LIVE.md`](docs/GO_LIVE.md)** (~15 min: create a Supabase project, run
the schema, enable Google sign-in, set env vars). No code changes needed — the
auth flow (`src/middleware.ts`, `src/app/login`, `src/app/auth/*`) and data
layer (`src/lib/supabase/*`) are already built.

---

## 🚀 Getting started

```bash
cd gokuls-workspace
npm install
npm run dev            # http://localhost:3000
```

Other scripts:

```bash
npm run build          # production build
npm run typecheck      # tsc --noEmit
npm test               # vitest (domain logic: queue, capacity, AI)
npm run lint           # next lint
```

> **Try it:** open the app, use the **user switcher** (bottom-left of the
> sidebar) to toggle between a requester (Aisha) and **Gokul (admin)** to see
> role-specific controls. Press `⌘K` anywhere to search.

---

## 🗂️ Project structure

```
gokuls-workspace/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx              # Homepage hero
│  │  ├─ (app)/               # Authenticated app shell (sidebar + topbar)
│  │  │  ├─ dashboard/        # Workload + capacity
│  │  │  ├─ board/            # Kanban (drag & drop)
│  │  │  ├─ queue/            # Smart Queue (sortable)
│  │  │  ├─ workload/         # "Gokul's Current Work"
│  │  │  ├─ tasks/new/        # Structured intake form
│  │  │  ├─ tasks/[id]/       # Task details + admin controls
│  │  │  ├─ analytics/        # Charts (admin)
│  │  │  ├─ notifications/    # Inbox
│  │  │  └─ search/           # Search & filters
│  │  └─ api/                 # health · ai/validate · reports/weekly
│  ├─ components/
│  │  ├─ ui/                  # Button, Card, Badge, Input, Select, …
│  │  ├─ layout/              # Sidebar, topbar, command menu, notifications
│  │  ├─ tasks/               # Task card, form, comments, timeline, AI panel
│  │  ├─ dashboard/           # Capacity meter, stat cards
│  │  ├─ board/               # Kanban board
│  │  └─ analytics/           # Recharts wrappers
│  └─ lib/                    # types, constants, store, seed, queue, capacity, ai, supabase
├─ supabase/                  # schema.sql + seed.sql
├─ tests/                     # vitest domain tests
└─ docs/                      # architecture, database, API, flows, wireframes, deployment, testing
```

---

## 📚 Documentation

- **[Go live (make it a real team app)](docs/GO_LIVE.md)** ⭐
- [Architecture](docs/ARCHITECTURE.md)
- [Database schema](docs/DATABASE.md)
- [API structure](docs/API.md)
- [User flows](docs/USER_FLOWS.md)
- [Wireframes](docs/WIREFRAMES.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Testing strategy](docs/TESTING.md)

---

## 🔐 Roles

- **Requester** — create requests, upload files/links, comment, track progress, get notified.
- **Gokul (Admin)** — everything above, plus change status/priority, reorder the queue,
  set estimated completion, manage workload, and view analytics.

In demo mode the role is chosen via the user switcher. In production it comes
from the `profiles.role` column, enforced by Postgres **Row Level Security**.
