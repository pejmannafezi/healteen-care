"use client";

import { useState } from "react";
import { Bell, BellRing, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function getPushSubscription(): Promise<PushSubscriptionJSON | null> {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) return null;

    const perm = await Notification.requestPermission();
    if (perm !== "granted") return null;

    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    const sub =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      }));
    return sub.toJSON();
  } catch {
    return null;
  }
}

export function NotifyButton() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function subscribe() {
    setState("loading");
    try {
      const subscription = await getPushSubscription();
      const res = await fetch("/api/live/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() || undefined, subscription: subscription ?? undefined }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div
        className="animate-scale-in flex h-full items-center gap-3 rounded-3xl border border-mint/30 bg-mint/15 p-6"
        aria-live="polite"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-nature/15">
          <Check className="size-5 text-nature" aria-hidden />
        </span>
        <p className="font-semibold text-forest">
          You&apos;re subscribed — we&apos;ll alert you when we go live!
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-forest/10 bg-lime p-6 shadow-card sm:p-8">
      {/* Decorative bell watermark */}
      <div className="pointer-events-none absolute -end-6 -bottom-6 opacity-[0.07]" aria-hidden>
        <Bell className="size-40 text-forest" strokeWidth={1} />
      </div>
      <p className="flex items-center gap-2.5 text-lg font-bold text-forest">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forest/10" aria-hidden>
          <BellRing className="size-5" />
        </span>
        Get notified when we go live
      </p>
      <p className="mt-2 text-sm leading-relaxed text-forest/75">
        We&apos;ll send a browser alert (and email) the moment the live starts.
      </p>
      <div className="relative mt-5">
        <Label htmlFor="notify-email">Email (optional)</Label>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Input
            id="notify-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="bg-white"
          />
          <Button
            onClick={subscribe}
            disabled={state === "loading"}
            className="shrink-0 bg-forest text-lime hover:bg-forest-700"
          >
            {state === "loading" ? <Loader2 className="animate-spin" /> : <Bell />}
            Notify me
          </Button>
        </div>
      </div>
      {state === "error" && (
        <p role="alert" className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium text-terracotta">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
