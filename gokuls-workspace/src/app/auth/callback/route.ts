import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { emailDomainAllowed } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

/**
 * Google OAuth callback. Exchanges the code for a session, then enforces the
 * company email-domain restriction (ALLOWED_EMAIL_DOMAIN). Non-allowed
 * accounts are signed out and bounced back to /login.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = createServerSupabase();
  if (!supabase || !code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!emailDomainAllowed(user?.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=domain`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
