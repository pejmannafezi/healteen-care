"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Leaf, Eye, EyeOff, AlertCircle, Loader2, MailCheck } from "lucide-react";
import { registerAction, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleButton } from "@/components/auth/google-button";

export default function RegisterPage() {
  const t = useTranslations("nav");
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    registerAction,
    undefined
  );
  const [showPassword, setShowPassword] = useState(false);

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
              <Leaf className="size-5 text-nature" aria-hidden />
            </span>
            <p className="eyebrow mt-4">Begin your wellness journey</p>
            <CardTitle className="mt-1 text-2xl md:text-3xl">{t("register")}</CardTitle>
            <div className="gold-divider mx-auto mt-5 max-w-[7rem]" />
          </CardHeader>

          <CardContent className="px-6 pb-9 pt-5 sm:px-8">
            {state?.message ? (
              <div
                role="status"
                className="flex flex-col items-center gap-3 rounded-2xl bg-mint/15 px-5 py-7 text-center"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-white shadow-card">
                  <MailCheck className="size-5 text-nature" aria-hidden />
                </span>
                <p className="text-sm leading-relaxed text-forest">{state.message}</p>
              </div>
            ) : (
              <form action={formAction} className="space-y-5">
                <div>
                  <Label htmlFor="fullName">
                    Full name <span aria-hidden="true" className="text-terracotta">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="email">
                    Email <span aria-hidden="true" className="text-terracotta">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="password">
                    Password <span aria-hidden="true" className="text-terracotta">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
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

                {state?.error && (
                  <p
                    role="alert"
                    className="flex items-start gap-2 rounded-xl bg-terracotta/10 px-3.5 py-3 text-sm font-medium text-terracotta"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {state.error}
                  </p>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={pending}>
                  {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
                  {t("register")}
                </Button>
              </form>
            )}

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" aria-hidden />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                or
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </div>
            <GoogleButton label="Sign up with Google" />

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-nature underline-offset-4 hover:underline"
              >
                {t("login")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
