"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Lock, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, totalCents } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currency = items[0]?.currency ?? "USD";

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }
      window.location.href = data.url; // redirect to Stripe hosted checkout
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-forest md:text-3xl">Your cart is empty</h1>
        <Link href="/shop" className="mt-8">
          <Button size="lg" variant="honey" className="font-bold">
            Browse products
            <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream">
      <div className="container-page max-w-2xl py-12 md:py-16">
        <p className="eyebrow">Almost there</p>
        <h1 className="mt-1 text-3xl font-bold text-forest md:text-4xl">Checkout</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Review your order. You'll enter shipping and payment details securely on the next step.
        </p>

        <ul className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {items.map((i) => (
            <li key={i.productId} className="flex items-center justify-between gap-4 p-4 sm:p-5">
              <div>
                <p className="font-semibold leading-snug text-forest">{i.name}</p>
                <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">Qty {i.quantity}</p>
              </div>
              <span className="font-semibold tabular-nums text-forest">
                {formatPrice((i.priceCents * i.quantity) / 100, i.currency)}
              </span>
            </li>
          ))}
          <li className="flex items-baseline justify-between gap-4 bg-cream/60 p-4 sm:p-5">
            <span className="text-sm font-semibold text-forest">Subtotal</span>
            <span className="text-lg font-bold tabular-nums text-forest">
              {formatPrice(totalCents() / 100, currency)}
            </span>
          </li>
        </ul>

        <p className="mt-3 text-xs text-muted-foreground">
          Shipping calculated at the secure checkout step.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-terracotta/30 bg-terracotta/5 p-3.5 text-sm font-medium text-terracotta">
            {error}
          </p>
        )}

        <Button
          onClick={handleCheckout}
          disabled={loading}
          size="lg"
          variant="honey"
          className="mt-7 w-full font-bold"
        >
          {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Lock aria-hidden="true" />}
          {loading ? "Redirecting…" : "Pay securely with Stripe"}
        </Button>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 shrink-0 text-nature" aria-hidden="true" />
          Payments are processed securely by Stripe. We never see your card details.
        </p>
      </div>
    </div>
  );
}
