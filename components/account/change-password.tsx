"use client";

import { useState } from "react";
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * In-session password change for a logged-in user (no email round-trip).
 * Uses supabase.auth.updateUser, which requires an active session.
 */
export function ChangePassword() {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.message);
    else {
      setDone(true);
      setPassword("");
      setConfirm("");
    }
  }

  return (
    <div className="border-t border-border pt-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-forest">
        <KeyRound className="size-4 text-gold-600" aria-hidden /> Change password
      </p>

      {done ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl bg-mint/15 px-3.5 py-3 text-sm font-medium text-forest"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-nature" aria-hidden />
          Password updated. Use it next time you log in.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="new-password" className="text-xs">
              New password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={show ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl pe-11"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute end-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirm-password" className="text-xs">
              Confirm new password
            </Label>
            <Input
              id="confirm-password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-terracotta/10 px-3.5 py-2.5 text-sm font-medium text-terracotta"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          <Button type="submit" size="sm" disabled={busy} className="w-full">
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Update password
          </Button>
        </form>
      )}
    </div>
  );
}
