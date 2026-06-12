"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Leaf, Trash2, Minus, Plus, ShoppingBag, Lock, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, setQty, remove, totalCents } = useCart();
  const currency = items[0]?.currency ?? "USD";

  if (items.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-nature/10">
          <ShoppingBag className="size-9 text-nature" strokeWidth={1.4} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-forest md:text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Explore our lab-tested herbal products.</p>
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
      <div className="container-page py-12 md:py-16">
        <h1 className="text-3xl font-bold text-forest md:text-4xl">Your Cart</h1>
        <div className="gold-divider mt-4 max-w-[10rem]" />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <ul className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition-shadow duration-300 hover:shadow-soft sm:gap-5 sm:p-5"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-cream to-mint/10 sm:size-24">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Leaf className="size-7 text-nature/40" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/shop/${item.slug}`}
                    className="font-semibold leading-snug text-forest transition-colors hover:text-nature focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {item.name}
                  </Link>
                  <span className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                    {formatPrice(item.priceCents / 100, item.currency)}
                  </span>

                  <div className="mt-auto flex items-center gap-2 pt-3">
                    <div className="flex items-center overflow-hidden rounded-full border border-border bg-white shadow-sm">
                      <button
                        className="flex size-11 items-center justify-center text-forest transition-colors hover:bg-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                        onClick={() => setQty(item.productId, item.quantity - 1)}
                        aria-label="Decrease"
                      >
                        <Minus className="size-4" aria-hidden="true" />
                      </button>
                      <span className="w-9 text-center text-sm font-semibold tabular-nums text-forest" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        className="flex size-11 items-center justify-center text-forest transition-colors hover:bg-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                        onClick={() => setQty(item.productId, item.quantity + 1)}
                        aria-label="Increase"
                      >
                        <Plus className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      className="flex size-11 items-center justify-center rounded-full text-terracotta transition-colors hover:bg-terracotta/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => remove(item.productId)}
                      aria-label="Remove"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="font-bold tabular-nums text-forest">
                  {formatPrice((item.priceCents * item.quantity) / 100, item.currency)}
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card lg:sticky lg:top-24 sm:p-7">
            <h2 className="text-lg font-bold text-forest">Order Summary</h2>
            <div className="gold-divider my-4" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-xl font-bold tabular-nums text-forest">
                {formatPrice(totalCents() / 100, currency)}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Shipping & taxes calculated at checkout.
            </p>
            <Link href="/checkout" className="mt-6 block">
              <Button className="w-full font-bold" size="lg" variant="honey">
                Proceed to checkout
                <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
              </Button>
            </Link>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5 text-nature" aria-hidden="true" />
              Secure checkout powered by Stripe
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
