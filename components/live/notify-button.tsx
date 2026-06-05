"use client";

import { useState } from "react";
import { Bell, BellRing, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <p className="inline-flex items-center gap-2 rounded-lg bg-mint/15 px-4 py-3 font-semibold text-forest" aria-live="polite">
        <Check className="size-5 text-nature" /> You're subscribed — we'll alert you when we go live!
      </p>
    );
  }

  return (
    <div className="rounded-2xl bg-lime p-5 sm:p-6">
      <p className="flex items-center gap-2 font-bold text-forest">
        <BellRing className="size-5" /> Get notified when we go live
      </p>
      <p className="mt-1 text-sm text-forest/75">
        We'll send a browser alert (and email) the moment the live starts.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com (optional)"
          className="bg-white"
        />
        <Button onClick={subscribe} disabled={state === "loading"} className="bg-forest text-lime hover:bg-forest-700">
          {state === "loading" ? <Loader2 className="animate-spin" /> : <Bell />}
          Notify me
        </Button>
      </div>
      {state === "error" && <p className="mt-2 text-sm text-terracotta">Something went wrong. Please try again.</p>}
    </div>
  );
}
