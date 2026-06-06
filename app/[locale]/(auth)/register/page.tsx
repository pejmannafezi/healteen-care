"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("register")}</CardTitle>
        </CardHeader>
        <CardContent>
          {state?.message ? (
            <p className="rounded-md bg-mint/15 p-4 text-sm text-forest">{state.message}</p>
          ) : (
            <form action={formAction} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" name="fullName" autoComplete="name" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>

              {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "…" : t("register")}
              </Button>
            </form>
          )}

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wide text-forest/40">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <GoogleButton label="Sign up with Google" />

          <p className="mt-5 text-center text-sm text-forest/70">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-nature hover:underline">
              {t("login")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
