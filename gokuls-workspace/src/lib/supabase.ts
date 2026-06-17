import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// Supabase client factory.
//
// The demo runs entirely on the local client store (see store.tsx),
// so these are optional. When the env vars are present the app can be
// pointed at a real Supabase project: Postgres (schema in
// supabase/schema.sql), Google SSO auth, Storage, and Realtime.
// ─────────────────────────────────────────────────────────────

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

/** Browser client (anon key, respects Row Level Security). */
export function createBrowserSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

/** Server client using the service role key — bypasses RLS, server only. */
export function createServiceSupabase(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
