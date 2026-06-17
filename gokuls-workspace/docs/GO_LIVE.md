# Go live — turn the demo into a real team workspace

This guide takes you from the demo to a **real, multi-user app** with Google
sign-in, a shared database, and live updates. Budget ~15–20 minutes.

You'll create two free accounts (**Supabase** and **Google Cloud** for OAuth).
Everything else — the auth flow, data layer, realtime — is already built; you
just provide the keys.

> **How the app decides the mode:** if the Supabase environment variables are
> present, the app automatically switches to **LIVE mode** (login required,
> shared Postgres, realtime). If they're absent, it stays in **demo mode**.

---

## 1. Create the Supabase project (~3 min)

1. Go to [supabase.com](https://supabase.com) → **New project**. Pick a name and
   a strong database password. Choose the region closest to your team.
2. When it's ready, open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)

## 2. Create the database schema (~2 min)

1. In Supabase, open the **SQL Editor** → **New query**.
2. Paste the entire contents of [`supabase/schema.sql`](../supabase/schema.sql)
   and **Run**. This creates all tables, enums, triggers, Row Level Security
   policies, and enables realtime.
3. (Optional) paste [`supabase/seed.sql`](../supabase/seed.sql) and run it for a
   few sample tasks. You can delete them later.

## 3. Enable Google sign-in (~6 min)

**In Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)):
1. Create (or pick) a project → **APIs & Services → OAuth consent screen**.
   - User type: **Internal** if you use Google Workspace (best — only your org
     can sign in), otherwise **External**.
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized redirect URI**: copy this from Supabase →
     **Authentication → Providers → Google** (it looks like
     `https://<project-ref>.supabase.co/auth/v1/callback`).
   - Save and copy the **Client ID** and **Client secret**.

**In Supabase** → **Authentication → Providers → Google**:
3. Enable it, paste the Client ID + secret, and **Save**.
4. **Authentication → URL Configuration**:
   - **Site URL**: your app URL (e.g. `https://your-app.vercel.app`).
   - **Redirect URLs**: add `https://your-app.vercel.app/auth/callback`
     (and `http://localhost:3000/auth/callback` for local dev).

## 4. Restrict access to your company (~1 min)

Set `ALLOWED_EMAIL_DOMAIN` to your company domain (e.g. `yourcompany.com`). The
app rejects any Google account that isn't on that domain at sign-in. (If you set
the OAuth consent screen to **Internal** in Workspace, that's a second layer.)

## 5. Configure environment variables

Locally, copy `.env.example` → `.env.local` and fill in. On **Vercel** add the
same under **Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
ALLOWED_EMAIL_DOMAIN=yourcompany.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

> Reminder from the earlier deploy error: set the Vercel project's **Root
> Directory** to `gokuls-workspace` so it builds the app (not the repo root).

Redeploy. The app is now live — visiting it redirects to **Sign in with Google**.

## 6. Invite your team

There's no separate invite step — **anyone with a company Google account just
visits the URL and signs in.** On first sign-in a `profiles` row is created
automatically. Share the link in Slack/email and you're done.

## 7. Make Gokul an admin (~30 sec, one time)

Everyone starts as a **requester**. Promote Gokul once so he gets the admin
controls (change status/priority, reorder the queue, set completion dates,
analytics). In the Supabase **SQL Editor**:

```sql
update profiles set role = 'admin' where email = 'gokul@yourcompany.com';
```

Set each person's department too (shows on cards and analytics), e.g.:

```sql
update profiles set department = 'Marketing' where email = 'aisha@yourcompany.com';
```

---

## What's live now

- **Google SSO** — company-domain-restricted sign-in; per-user sessions.
- **Shared database** — every task, comment, file reference, and activity event
  is stored in Postgres and visible to the whole team (reads open, writes guarded
  by RLS).
- **Real task assignment & tracking** — status, priority, deadlines, and the
  smart-queue order persist and sync.
- **Realtime** — when Gokul moves a card or answers a question, everyone's board,
  queue, and notification badge update live without a refresh.
- **In-app notifications** — questions, status/priority changes, and completions.

## Not included in v1 (easy to add later)

- **Email notifications** — schema + the weekly-report cron are ready; add a
  Resend key and wire `/api/reports/weekly` + a Postgres trigger or Edge
  Function. See [`docs/API.md`](API.md).
- **File uploads to Storage** — create a private `task-files` bucket and switch
  the form's file handler to `supabase.storage.from('task-files').upload(...)`.
  The `attachments` table already stores the metadata.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Stuck on login / "redirect_uri_mismatch" | The redirect URI in Google must exactly match the Supabase callback URL; the app URL must be in Supabase **Redirect URLs**. |
| "That account isn't allowed" | The email domain ≠ `ALLOWED_EMAIL_DOMAIN`. Sign in with a company account or update the variable. |
| Signed in but no admin controls | Run the `update profiles set role='admin'` query for that email, then refresh. |
| Build fails on Vercel (Python error) | Set **Root Directory** = `gokuls-workspace`. |
| Data doesn't sync live | Confirm `schema.sql` ran fully (it adds tables to the `supabase_realtime` publication). |
