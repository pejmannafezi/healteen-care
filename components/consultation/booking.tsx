"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Video, Phone, Lock, Loader2, Check, CalendarDays, CalendarX2 } from "lucide-react";
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
      <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border bg-cream p-10 text-center">
        <CalendarX2 className="mx-auto size-10 text-nature/50" strokeWidth={1.2} aria-hidden />
        <p className="mt-4 font-semibold text-forest">
          No times are open right now. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px] lg:gap-12">
      {/* Slots */}
      <section className="animate-fade-up" aria-labelledby="booking-step-time">
        <h2 id="booking-step-time" className="flex items-center gap-3 text-xl font-bold text-forest">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold/15 font-accent text-base italic text-gold-600"
            aria-hidden
          >
            1
          </span>
          Choose a time
        </h2>
        <div className="mt-6 space-y-7">
          {Object.entries(byDate).map(([date, daySlots]) => (
            <div key={date}>
              <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-forest/70">
                <CalendarDays className="size-4 text-nature" aria-hidden />
                {date}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {daySlots.map((s) => {
                  const time = new Date(s.starts_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                  const active = slotId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSlotId(s.id)}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-5 py-2 text-sm font-medium transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                        active
                          ? "border-forest bg-forest text-cream shadow-sm"
                          : "border-border bg-card text-forest shadow-card hover:-translate-y-0.5 hover:border-nature/50 hover:shadow-soft"
                      )}
                    >
                      {active && <Check className="size-4" aria-hidden />}
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Type + pay */}
      <aside
        className="animate-fade-in h-fit rounded-3xl border border-gold/20 bg-card p-6 shadow-soft md:p-7 lg:sticky lg:top-24"
        aria-labelledby="booking-step-type"
      >
        <h2 id="booking-step-type" className="flex items-center gap-3 text-lg font-bold text-forest">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold/15 font-accent text-base italic text-gold-600"
            aria-hidden
          >
            2
          </span>
          How would you like to meet?
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {(["video", "phone"] as const).map((t) => {
            const active = type === t;
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                aria-pressed={active}
                className={cn(
                  "relative flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-3 text-sm font-semibold capitalize transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                  active
                    ? "border-forest bg-forest/5 text-forest shadow-card"
                    : "border-border text-forest/70 hover:border-nature/40 hover:text-forest"
                )}
              >
                {active && (
                  <span
                    className="absolute end-2 top-2 flex size-4 items-center justify-center rounded-full bg-forest text-cream"
                    aria-hidden
                  >
                    <Check className="size-3" />
                  </span>
                )}
                {t === "video" ? (
                  <Video className="size-5" aria-hidden />
                ) : (
                  <Phone className="size-5" aria-hidden />
                )}
                {t}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="gold-divider" aria-hidden />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-forest/70">Total</span>
            <span className="text-2xl font-bold text-forest">{formatPrice(priceCents / 100)}</span>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-terracotta/10 px-3 py-2 text-sm font-medium text-terracotta">
            {error}
          </p>
        )}

        <Button onClick={book} disabled={!slotId || loading} size="lg" className="mt-5 w-full">
          {loading ? <Loader2 className="animate-spin" /> : <Lock />}
          {!isLoggedIn ? "Log in to book" : loading ? "Redirecting…" : "Book & Pay"}
        </Button>
        {!slotId && (
          <p className="mt-3 text-center text-xs text-forest/60">Select a time to continue.</p>
        )}
      </aside>
    </div>
  );
}
