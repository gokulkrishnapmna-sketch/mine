import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { emailDomainAllowed } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

/**
 * Auth callback for the email magic link.
 * Handles both the PKCE `code` flow and the `token_hash` magic-link flow,
 * then enforces the company email-domain restriction.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = createServerSupabase();
  if (!supabase) return NextResponse.redirect(`${origin}/login?error=auth`);

  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  }

  if (!ok) return NextResponse.redirect(`${origin}/login?error=auth`);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!emailDomainAllowed(user?.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=domain`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
