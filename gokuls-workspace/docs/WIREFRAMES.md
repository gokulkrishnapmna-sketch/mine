# Wireframes

Low-fidelity layouts for the primary screens. The shipped UI implements these
with cards, soft shadows, rounded corners, and dark/light themes.

## App shell (desktop ≥ 1024px)

```
┌────────────┬─────────────────────────────────────────────────────────┐
│ ◆ Gokul's  │  [ Search ⌘K ]                    [+ New] [🔔3] [☀/🌙]   │
│   Workspace├─────────────────────────────────────────────────────────┤
│            │                                                          │
│ Dashboard  │                  « page content »                        │
│ Board      │                                                          │
│ Queue      │                                                          │
│ Gokul's…   │                                                          │
│ Search     │                                                          │
│ Analytics  │                                                          │
│ ───────    │                                                          │
│ New Request│                                                          │
│ Notifs   3 │                                                          │
│ ───────    │                                                          │
│ [👤 Aisha ⌄]│                                                         │
└────────────┴─────────────────────────────────────────────────────────┘
```
Mobile: sidebar collapses into a hamburger drawer; top bar persists.

## Dashboard

```
┌ Active 18 ┐┌ High/Crit 4 ┐┌ In Prog 3 ┐┌ Done 7d 5 ┐
└───────────┘└─────────────┘└───────────┘└───────────┘
┌ Capacity ──────────────────────┐ ┌ Up next in queue ──┐
│ 82%  [█████████████░░] High Load│ │ 1 ▌Launch creatives│
│ "operating at 82% capacity"     │ │ 2 ▌Investor deck    │
│ Comfort | Busy | High | At Cap  │ │ 3 ▌Sales one-pager  │
└─────────────────────────────────┘ └────────────────────┘
┌ Priority breakdown ─────────────┐ ┌ Upcoming deadlines ┐
│ Critical ███░░░ 4               │ │ Banner asset   2d  │
│ High     ████░░ …               │ │ Launch         4d  │
└─────────────────────────────────┘ └────────────────────┘
Currently working on:  [card] [card] [card]
```

## Kanban board

```
Backlog   To Do    In Progress  Waiting   Review   Approved  Completed  Archived
┌──────┐ ┌──────┐  ┌──────────┐ ┌──────┐  ┌──────┐ ┌──────┐  ┌───────┐ ┌───────┐
│GW-115│ │GW-116│  │ GW-118 ◀─┼─┼ drag │  │GW-114│ │GW-113│  │GW-112 │ │GW-110 │
│motion│ │1-pager│ │ launch   │ │ here │  │banner│ │booth │  │carousel│ │poster │
└──────┘ └──────┘  └──────────┘ └──────┘  └──────┘ └──────┘  └───────┘ └───────┘
```
Each card: reference · priority badge · title · deliverable · deadline · requester ·
counts (links / files / comments). Colored left border = priority.

## New request (intake)

```
┌ The request ───────────────────┐ ┌ AI Request Assistant ─────┐
│ Title*        [____________]   │ │   (88)  Excellent brief   │
│ Description*  [___________  ]   │ │ Suggested priority: High  │
│ Objective*    [____________]   │ │   [Apply]  reason…        │
├ Classification ────────────────┤ │ Effort: Large  reason…    │
│ Deliverable*  [▼] Priority [▼] │ │ ⚠ Missing required info   │
│ Department[▼] Deadline [date]  │ │  • Business objective     │
│ Tags        [+ chips]          │ │ 💡 Suggestions            │
├ Contact ───────────────────────┤ │  • Add references…        │
│ Name [..] Email [..] Phone[..] │ └───────────────────────────┘
├ References & files ────────────┤
│ [https://…] [+]   [⬆ drop files]│
├ Dependencies & notes ──────────┤
│ Pending: [chips]  Notes [____] │
│                 [Cancel] [Submit]
└────────────────────────────────┘
```

## Task details

```
GW-118 · ●Critical · In Progress · LinkedIn Creative
Launch creatives                              ┌ Requested by ───┐
Marketing · 4d left · Created May 5           │ 👤 Aisha Verma  │
┌ Description ──────────────────┐              │ Contact, email… │
│ … business objective box …    │              │ Deadline / ETA  │
└───────────────────────────────┘              │ Intake (92)     │
⚠ Pending information                          ├ Manage (admin) ─┤
┌ Attachments ──┐ ┌ References ─┐              │ Status   [▼]    │
│ pdf, docx     │ │ figma, drive│              │ Priority [▼]    │
└───────────────┘ └─────────────┘              │ Effort   [▼]    │
┌ [Discussion] [Activity] ──────┐              │ Est. date [..]  │
│ threaded comments + @mentions │              └─────────────────┘
│ activity timeline             │
└───────────────────────────────┘
```

## Smart queue

```
How ranking works: priority + deadline urgency + aging + intake quality
┌ 1 ⋮⋮ GW-118 ●Critical In Progress  Launch creatives   4d  👤  score 175 ┐
┌ 2 ⋮⋮ GW-114 ●Medium  Review        Banner asset       2d  👤  score 128 ┐
┌ 3 ⋮⋮ GW-117 ●High    Waiting       Investor deck      6d  👤  score 121 ┐
( admin drags the ⋮⋮ handle to pin an order )
```
