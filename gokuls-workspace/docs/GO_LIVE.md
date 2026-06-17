# Launch the real app (the easy way)

This turns the demo into a **real, multi-user app** — people sign in with their
email, tasks are saved, and everyone sees the same board live.

You need **one free account: Supabase** (it stores the data and sends the
sign-in emails). Hosting is a one-click button. Total time: ~10 minutes.
**No Google setup, no Vercel settings to fiddle with.**

---

## Want to see it hosted *right now* (no account)?

Deploy the **demo** (no login, sample data) in one click:

[![Deploy demo](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgokulkrishnapmna-sketch%2Fmine%2Ftree%2Fmain%2Fgokuls-workspace&project-name=gokuls-workspace-demo)

Click it → "Continue with GitHub" → Deploy. You'll get a public URL in ~1 min.
Good for sharing the look & feel. When you're ready for the real thing, do the 3
steps below.

---

## The real app — 3 steps

### Step 1 — Create the database (Supabase) · ~5 min
1. Go to **[supabase.com](https://supabase.com)** → sign up (free) → **New project**.
   Give it a name + database password, pick the nearest region, **Create**.
2. Wait ~2 min for it to finish. Then open **SQL Editor** (left sidebar) →
   **New query**.
3. Open [`supabase/schema.sql`](../supabase/schema.sql) in this repo, copy
   **everything**, paste it in, and click **Run**. (Creates all the tables,
   security rules, and live-sync. You'll see "Success".)
4. Open **Project Settings → API** and keep this tab open — you'll copy 3 values
   in Step 3:
   - **Project URL**
   - **anon public** key
   - **service_role** key

> Email sign-in works out of the box — Supabase sends the links. (For higher
> volume later, add your own SMTP under Authentication → Emails.)

### Step 2 — Deploy the app · ~2 min
Click the button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgokulkrishnapmna-sketch%2Fmine%2Ftree%2Fmain%2Fgokuls-workspace&project-name=gokuls-workspace&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN&envDescription=Paste%20your%203%20Supabase%20keys%20and%20your%20company%20email%20domain)

It will ask you to connect GitHub, then show **4 boxes to fill in** (that's Step 3).

### Step 3 — Paste your keys · ~1 min
In the Vercel deploy screen, fill the 4 boxes from your Supabase tab:

| Box | Paste this |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN` | your domain, e.g. `yourcompany.com` (or leave blank to allow any email) |

Click **Deploy**. In ~1 minute you get your live URL, e.g.
`https://gokuls-workspace.vercel.app`.

### One small thing after the first deploy
Tell Supabase to trust your new URL so sign-in links work:
- Supabase → **Authentication → URL Configuration**
- **Site URL**: your Vercel URL
- **Redirect URLs**: add `https://your-url.vercel.app/auth/callback`
- Save. (Redeploy isn't needed.)

---

## Invite your team
Just share the URL. Each person enters their email, gets a sign-in link, clicks
it — done. Their account is created automatically on first sign-in.

## Make Gokul the admin (one time)
Everyone starts as a requester. Give Gokul the admin powers (change status &
priority, reorder the queue, set due dates, analytics). In Supabase → **SQL
Editor**, run (use Gokul's real email):

```sql
update profiles set role = 'admin' where email = 'gokul@yourcompany.com';
```

Optionally set people's departments (shows on cards + analytics):

```sql
update profiles set department = 'Marketing' where email = 'aisha@yourcompany.com';
```

That's it — you have a real, shared, live design-request workspace. 🎉

---

## If something's off

| Problem | Fix |
| --- | --- |
| Sign-in link doesn't log me in | Add your Vercel URL to Supabase **Authentication → URL Configuration** (Site URL + Redirect URLs `…/auth/callback`). |
| "That email isn't allowed" | The email domain ≠ `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN`. Use a company email or clear that variable in Vercel → Settings → Environment Variables. |
| Didn't get the email | Check spam; Supabase's built-in email is rate-limited — wait a minute and retry, or add SMTP in Supabase. |
| No admin controls for Gokul | Run the `update profiles set role='admin'` query above, then refresh. |
| App shows demo data / no login | The Supabase env vars are missing or misspelled in Vercel → Settings → Environment Variables. Re-check and redeploy. |

Want me to walk you through any step live? Just ask.
