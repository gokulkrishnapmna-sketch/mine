// ─────────────────────────────────────────────────────────────
// Backend mode detection.
//
// The app runs in two modes from the same UI:
//   • DEMO mode  — Supabase env vars are absent → seeded client store
//                  (localStorage). No login. Great for trying it out.
//   • LIVE mode  — Supabase env vars are present → real Postgres,
//                  email magic-link auth, and realtime. A real team workspace.
// ─────────────────────────────────────────────────────────────

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Restrict sign-in to a single company domain (e.g. "yourcompany.com").
 * Leave unset to allow any email. Enforced both at send-time (login page) and
 * after verification (auth callback). NEXT_PUBLIC so the login UI can pre-check.
 */
export const ALLOWED_EMAIL_DOMAIN =
  process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN?.toLowerCase().trim();

export function emailDomainAllowed(email: string | undefined | null): boolean {
  if (!ALLOWED_EMAIL_DOMAIN) return true;
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}
