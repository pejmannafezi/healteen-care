"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Leaf, KeyRound, MailCheck, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
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
              <KeyRound className="size-5 text-nature" aria-hidden />
            </span>
            <p className="eyebrow mt-4">Account recovery</p>
            <CardTitle className="mt-1 text-2xl md:text-3xl">Forgot password</CardTitle>
            <div className="gold-divider mx-auto mt-5 max-w-[7rem]" />
          </CardHeader>

          <CardContent className="px-6 pb-9 pt-5 sm:px-8">
            {sent ? (
              <div
                role="status"
                className="flex flex-col items-center gap-4 rounded-2xl bg-mint/15 px-5 py-8 text-center"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-white shadow-card">
                  <MailCheck className="size-5 text-nature" aria-hidden />
                </span>
                <p className="text-sm leading-relaxed text-forest">
                  If an account exists for <span className="font-semibold">{email}</span>, we&apos;ve
                  sent a link to reset your password. Check your inbox.
                </p>
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-nature underline-offset-4 hover:underline"
                >
                  <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
                  Back to log in
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </p>
                <div>
                  <Label htmlFor="email">
                    Email <span aria-hidden="true" className="text-terracotta">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl"
                  />
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

                <Button type="submit" size="lg" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="size-5 animate-spin" aria-hidden />}
                  Send reset link
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link
                    href="/login"
                    className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-nature underline-offset-4 hover:underline"
                  >
                    <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
                    Back to log in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
