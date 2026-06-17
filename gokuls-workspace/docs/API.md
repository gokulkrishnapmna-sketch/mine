# API structure

Two surfaces back the app:

1. **Supabase auto-generated REST + Realtime** for CRUD on the tables (guarded
   by RLS). The client uses `@supabase/supabase-js` (see `src/lib/supabase.ts`).
2. **Next.js route handlers** (`src/app/api/*`) for things that need server
   secrets or computation: AI validation, the weekly report/email, and health.

## Next.js route handlers (implemented)

### `GET /api/health`
Liveness probe. Reports whether the app is running in `demo` or `supabase` mode.
```json
{ "status": "ok", "service": "gokuls-workspace", "mode": "demo", "time": "…" }
```

### `POST /api/ai/validate`
Validates a draft brief and returns the intake score, missing fields,
suggestions, recommended priority, and effort estimate. Runs heuristics by
default; upgradeable to Claude via `ANTHROPIC_API_KEY`.

Request body (`DraftRequest`):
```json
{
  "title": "Launch creatives",
  "description": "…",
  "businessObjective": "Drive signups",
  "deliverableType": "linkedin_creative",
  "deadline": "2026-07-01",
  "priority": "high",
  "contactEmail": "a@company.com",
  "contactPhone": "+1…",
  "references": 2,
  "attachments": 1,
  "pendingInfo": []
}
```
Response:
```json
{
  "engine": "heuristic",
  "validation": { "score": 88, "level": "excellent", "missing": [], "suggestions": [], "ready": true },
  "priority":   { "priority": "high", "reason": "Deadline is within a week." },
  "effort":     { "effort": "large", "reason": "Large — ~3.0 working day(s)…" }
}
```

### `GET /api/reports/weekly`
Generates the weekly digest (completed, pending, capacity). Triggered by a
Vercel Cron (`vercel.json`, Mondays 09:00) and, in production, emailed via
Resend.

## Supabase data API (production)

The same operations the demo store performs map to Supabase calls. Examples:

| Action | Supabase call |
| --- | --- |
| List board | `supabase.from('tasks').select('*, comments(count)')` |
| Create task | `supabase.from('tasks').insert({...}).select().single()` |
| Move card | `supabase.from('tasks').update({ status }).eq('id', id)` |
| Reorder queue | `supabase.from('tasks').upsert(rankedRows)` |
| Add comment | `supabase.from('comments').insert({...})` |
| My notifications | `supabase.from('notifications').select('*').eq('recipient_id', uid)` |
| Live updates | `supabase.channel('tasks').on('postgres_changes', …).subscribe()` |

Writes are authorized by RLS (see [DATABASE.md](DATABASE.md)); activity-log and
notification fan-out are best implemented as Postgres triggers or an Edge
Function so they fire regardless of client.

## Notifications & email

In-app notifications are rows in `notifications`. Email is sent via **Resend**
(`RESEND_API_KEY`) for: question asked/answered, status/priority changes,
completion, and the weekly report. An optional `SLACK_WEBHOOK_URL` mirrors
high-signal events to Slack.
