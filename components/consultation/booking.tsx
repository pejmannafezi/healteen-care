"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Video, Phone, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";

interface Slot {
  id: string;
  starts_at: string;
  ends_at: string;
}

export function ConsultationBooking({
  slots,
  priceCents,
  isLoggedIn,
}: {
  slots: Slot[];
  priceCents: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [type, setType] = useState<"video" | "phone">("video");
  const [slotId, setSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group slots by date for readability.
  const byDate = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    const d = new Date(s.starts_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    (acc[d] ??= []).push(s);
    return acc;
  }, {});

  async function book() {
    if (!slotId || loading) return;
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/consultation/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, type }),
      });
      const data = await res.json();
      if (res.status === 401 && data.requireLogin) {
        router.push("/login");
        return;
      }
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start booking.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (slots.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-cream p-8 text-center text-forest/60">
        No times are open right now. Please check back soon.
      </p>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Slots */}
      <div>
        <h2 className="mb-4 text-lg font-bold">1. Choose a time</h2>
        <div className="space-y-5">
          {Object.entries(byDate).map(([date, daySlots]) => (
            <div key={date}>
              <p className="mb-2 text-sm font-semibold text-forest/70">{date}</p>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((s) => {
                  const time = new Date(s.starts_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                  const active = slotId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSlotId(s.id)}
                      className={cn(
                        "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                        active
                          ? "border-forest bg-forest text-cream"
                          : "border-border bg-card text-forest hover:border-nature/50"
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Type + pay */}
      <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
        <h2 className="mb-3 text-lg font-bold">2. How would you like to meet?</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["video", "phone"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-3 py-3 text-sm font-medium capitalize transition-colors",
                type === t ? "border-forest bg-forest/5 text-forest" : "border-border text-forest/70 hover:border-nature/40"
              )}
            >
              {t === "video" ? <Video className="size-5" /> : <Phone className="size-5" />}
              {t}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-forest/70">Total</span>
          <span className="text-xl font-bold text-forest">{formatPrice(priceCents / 100)}</span>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <Button onClick={book} disabled={!slotId || loading} size="lg" className="mt-4 w-full">
          {loading ? <Loader2 className="animate-spin" /> : <Lock />}
          {!isLoggedIn ? "Log in to book" : loading ? "Redirecting…" : "Book & Pay"}
        </Button>
        {!slotId && <p className="mt-2 text-center text-xs text-forest/50">Select a time to continue.</p>}
      </aside>
    </div>
  );
}
