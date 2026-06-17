# Deployment

## Demo deploy (zero backend)

The app runs as-is with no environment variables. Deploy to Vercel:

```bash
cd gokuls-workspace
vercel            # or: connect the repo in the Vercel dashboard
```

Set the **Root Directory** to `gokuls-workspace` in the Vercel project
settings. That's it — the seeded client store powers everything.

## Production deploy (Supabase + Resend)

### 1. Create the Supabase project
1. New project → copy the **Project URL** and **anon** + **service_role** keys.
2. SQL editor → run [`supabase/schema.sql`](../supabase/schema.sql).
3. (Optional) run [`supabase/seed.sql`](../supabase/seed.sql) for sample data.

### 2. Configure Google SSO
1. Supabase → Authentication → Providers → **Google** → enable.
2. Add Google OAuth client ID/secret (from Google Cloud Console).
3. Add your domain to the allowed redirect URLs:
   `https://<your-app>.vercel.app/auth/callback`.
4. The `on_auth_user_created` trigger creates a `profiles` row on first sign-in.
   Promote Gokul to admin once: `update profiles set role='admin' where email='gokul@company.com';`

### 3. Storage
Create a bucket named `task-files` (private). Attachments are uploaded client-side
with signed URLs; metadata is stored in the `attachments` table.

### 4. Email (Resend)
1. Create a Resend API key and verify your sending domain.
2. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.

### 5. Environment variables (Vercel → Settings → Environment Variables)
```
NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_ANON_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…
RESEND_API_KEY=…
RESEND_FROM_EMAIL="Gokul's Workspace <workspace@yourdomain.com>"
ANTHROPIC_API_KEY=…           # optional — upgrades AI helpers to Claude
ANTHROPIC_MODEL=claude-opus-4-8
SLACK_WEBHOOK_URL=…           # optional
NEXT_PUBLIC_APP_URL=https://<your-app>.vercel.app
```
See [`.env.example`](../.env.example).

### 6. Weekly report cron
`vercel.json` schedules `GET /api/reports/weekly` every Monday 09:00 UTC.
Vercel Cron is enabled automatically on deploy.

## CI suggestions
Run on every PR:
```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```
