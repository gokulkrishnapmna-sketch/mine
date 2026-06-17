# Database schema

Full DDL lives in [`supabase/schema.sql`](../supabase/schema.sql); seed data in
[`supabase/seed.sql`](../supabase/seed.sql). This document summarizes it.

## Entity-relationship diagram

```
profiles (1) ───< tasks (N)
   │                 │
   │                 ├──< attachments
   │                 ├──< reference_links
   │                 ├──< comments ───< comments (self, threaded)
   │                 └──< activity_events
   │
   └──────────────< notifications >── tasks
```

## Tables

| Table | Purpose | Key columns |
| --- | --- | --- |
| `profiles` | Org members (1:1 with `auth.users`, auto-created on Google SSO). | `role` (`requester`/`admin`), `department`, `avatar_color` |
| `tasks` | The design requests. | `reference` (auto `GW-###`), `status`, `priority`, `deliverable_type`, `deadline`, `estimated_completion`, `effort`, `tags[]`, `pending_info[]`, `intake_score`, `queue_rank` |
| `attachments` | File metadata; bytes in Storage bucket `task-files`. | `kind`, `storage_path`, `size_bytes` |
| `reference_links` | External references. | `provider` (figma/drive/youtube/dropbox/onedrive/link), `url` |
| `comments` | Task discussion, threaded + mentions. | `parent_id`, `mentions uuid[]`, `is_question` |
| `activity_events` | Immutable audit log per task. | `type`, `actor_id`, `message` |
| `notifications` | Per-recipient inbox. | `type`, `recipient_id`, `read` |

## Enums

`user_role`, `task_status` (8 values matching the Kanban columns),
`task_priority`, `deliverable_type` (12 values), `effort_estimate`,
`reference_provider`, `activity_type`, `notification_type`.

## Automation (triggers & functions)

- `set_updated_at()` — keeps `tasks.updated_at` fresh.
- `handle_new_user()` — inserts a `profiles` row when a Google SSO user is
  created in `auth.users`.
- `task_ref_seq` — generates human-friendly references (`GW-100`, `GW-101`, …).

## Row Level Security

RLS is enabled on every table. Highlights:

- **Reads are open** to all authenticated users — this is a transparency tool.
- **Tasks**: a requester may insert/update their own; `is_admin()` may touch any.
- **Comments**: insert only as yourself (`author_id = auth.uid()`).
- **Notifications**: you can only read/update rows where you are the recipient.

`is_admin()` is a `security definer` helper that checks
`profiles.role = 'admin'`.

## Indexes

`tasks` is indexed on `status`, `priority`, `requester_id`, `deadline`, and
`department` to keep the board, queue, filters, and analytics fast. Child tables
are indexed by `task_id`; notifications by `(recipient_id, read)`.
