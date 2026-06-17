"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, AlertCircle, MailCheck } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { ALLOWED_EMAIL_DOMAIN, emailDomainAllowed, isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginInner() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const errorCode = params.get("error");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    const supabase = createBrowserSupabase();
    if (!supabase) return;

    if (!emailDomainAllowed(email)) {
      setLocalError(
        ALLOWED_EMAIL_DOMAIN
          ? `Please use your @${ALLOWED_EMAIL_DOMAIN} email address.`
          : "Please enter a valid email address."
      );
      return;
    }

    setLoading(true);
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } });
    setLoading(false);
    if (error) setLocalError(error.message);
    else setSent(true);
  }

  const errorMessage =
    localError ??
    (errorCode === "domain"
      ? "That email isn't allowed. Please sign in with your company email."
      : errorCode
        ? "Sign-in link was invalid or expired. Please request a new one."
        : null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <Sparkles className="size-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Gokul&apos;s Workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to view and submit design requests.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
          {!isSupabaseConfigured ? (
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-3">
                This deployment is in <span className="font-medium text-foreground">demo mode</span> — no
                sign-in required.
              </p>
              <Button className="w-full" onClick={() => (window.location.href = "/dashboard")}>
                Enter demo
              </Button>
            </div>
          ) : sent ? (
            <div className="flex flex-col items-center text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <MailCheck className="size-5" />
              </span>
              <p className="mt-3 font-medium">Check your inbox</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>. Click
                it to continue.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 text-xs text-primary hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={sendLink} className="space-y-3">
              {errorMessage && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {errorMessage}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium">Work email</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={ALLOWED_EMAIL_DOMAIN ? `you@${ALLOWED_EMAIL_DOMAIN}` : "you@company.com"}
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={loading} size="lg" className="w-full">
                {loading ? "Sending…" : "Email me a sign-in link"}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {ALLOWED_EMAIL_DOMAIN
            ? `Access is restricted to @${ALLOWED_EMAIL_DOMAIN} accounts.`
            : "Access is restricted to your organization."}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
