"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Lock, Loader2 } from "lucide-react";
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
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link href="/shop" className="mt-6">
          <Button>Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl py-14">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="mt-2 text-forest/65">
        Review your order. You'll enter shipping and payment details securely on the next step.
      </p>

      <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
        {items.map((i) => (
          <li key={i.productId} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-semibold text-forest">{i.name}</p>
              <p className="text-sm text-forest/60">Qty {i.quantity}</p>
            </div>
            <span className="font-semibold text-forest">
              {formatPrice((i.priceCents * i.quantity) / 100, i.currency)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between text-sm text-forest/70">
        <span>Subtotal</span>
        <span>{formatPrice(totalCents() / 100, currency)}</span>
      </div>
      <p className="mt-1 text-xs text-forest/50">Shipping calculated at the secure checkout step.</p>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <Button onClick={handleCheckout} disabled={loading} size="lg" className="mt-6 w-full">
        {loading ? <Loader2 className="animate-spin" /> : <Lock />}
        {loading ? "Redirecting…" : "Pay securely with Stripe"}
      </Button>

      <p className="mt-3 text-center text-xs text-forest/50">
        Payments are processed securely by Stripe. We never see your card details.
      </p>
    </div>
  );
}
