"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Browser Supabase client (cookie-based session, respects RLS).
 * Returns `null` in demo mode so callers can fall back to the local store.
 */
export function createBrowserSupabase() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}
