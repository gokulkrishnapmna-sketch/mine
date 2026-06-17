"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, AlertCircle } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";

function LoginInner() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const errorCode = params.get("error");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, queryParams: { prompt: "select_account" } },
    });
  }

  const errorMessage =
    errorCode === "domain"
      ? "That Google account isn't allowed. Please sign in with your company account."
      : errorCode
        ? "Sign-in failed. Please try again."
        : null;

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
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          {isSupabaseConfigured ? (
            <Button onClick={signIn} disabled={loading} size="lg" variant="outline" className="w-full">
              <GoogleIcon />
              {loading ? "Redirecting…" : "Continue with Google"}
            </Button>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-3">
                This deployment is in <span className="font-medium text-foreground">demo mode</span> — no
                sign-in required.
              </p>
              <Button className="w-full" onClick={() => (window.location.href = "/dashboard")}>
                Enter demo
              </Button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Access is restricted to your organization.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
