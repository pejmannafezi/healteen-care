"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Leaf,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setHasSession(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
      setReady(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.message);
    else setDone(true);
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-cream to-[#EFEADD]/40">
      {/* Calm botanical backdrop */}
      <div aria-hidden className="pointer-events-none absolute -top-20 -end-24 opacity-[0.05]">
        <Leaf className="size-[24rem] text-forest" strokeWidth={0.75} />
      </div>
      <div aria-hidden className="pointer-events-none absolute -bottom-28 -start-24 opacity-[0.04]">
        <Leaf className="size-[20rem] rotate-180 text-nature" strokeWidth={0.75} />
      </div>

      <div className="container-page relative flex min-h-[78vh] items-center justify-center py-16">
        <Card className="w-full max-w-md animate-fade-up rounded-3xl border-gold/20 shadow-soft">
          <CardHeader className="px-6 pb-2 pt-9 text-center sm:px-8">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-nature/10 ring-1 ring-gold/30">
              <ShieldCheck className="size-5 text-nature" aria-hidden />
            </span>
            <p className="eyebrow mt-4">Account recovery</p>
            <CardTitle className="mt-1 text-2xl md:text-3xl">Set a new password</CardTitle>
            <div className="gold-divider mx-auto mt-5 max-w-[7rem]" />
          </CardHeader>

          <CardContent className="px-6 pb-9 pt-5 sm:px-8">
            {done ? (
              <div
                role="status"
                className="flex flex-col items-center gap-4 rounded-2xl bg-mint/15 px-5 py-8 text-center"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-white shadow-card">
                  <CheckCircle2 className="size-5 text-nature" aria-hidden />
                </span>
                <p className="text-sm leading-relaxed text-forest">
                  Your password has been updated. You can now log in with it.
                </p>
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-nature underline-offset-4 hover:underline"
                >
                  Go to log in
                  <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
                </Link>
              </div>
            ) : ready && !hasSession ? (
              <div
                role="status"
                className="flex flex-col items-center gap-4 rounded-2xl bg-terracotta/10 px-5 py-8 text-center"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-white shadow-card">
                  <AlertCircle className="size-5 text-terracotta" aria-hidden />
                </span>
                <p className="text-sm leading-relaxed text-forest">
                  This reset link is invalid or has expired. Please request a new one.
                </p>
                <Link
                  href="/forgot-password"
                  className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-nature underline-offset-4 hover:underline"
                >
                  Request a new link
                  <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="password">
                    New password <span aria-hidden="true" className="text-terracotta">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl pe-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute end-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {showPassword ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">At least 8 characters.</p>
                </div>
                <div>
                  <Label htmlFor="confirm">
                    Confirm new password <span aria-hidden="true" className="text-terracotta">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="h-12 rounded-xl pe-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                      className="absolute end-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {showConfirm ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="flex items-start gap-2 rounded-xl bg-terracotta/10 px-3.5 py-3 text-sm font-medium text-terracotta"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={busy || !hasSession}>
                  {busy && <Loader2 className="size-5 animate-spin" aria-hidden />}
                  Update password
                </Button>
                {!hasSession && (
                  <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    Verifying your reset link…
                  </p>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
