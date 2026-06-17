// ─────────────────────────────────────────────────────────────
// Backend mode detection.
//
// The app runs in two modes from the same UI:
//   • DEMO mode  — Supabase env vars are absent → seeded client store
//                  (localStorage). No login. Great for trying it out.
//   • LIVE mode  — Supabase env vars are present → real Postgres,
//                  Google SSO auth, and realtime. A real team workspace.
// ─────────────────────────────────────────────────────────────

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Restrict sign-in to a single company Google domain (e.g. "yourcompany.com").
 * Leave unset to allow any Google account. Enforced in the auth callback.
 */
export const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN?.toLowerCase().trim();

export function emailDomainAllowed(email: string | undefined | null): boolean {
  if (!ALLOWED_EMAIL_DOMAIN) return true;
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}
