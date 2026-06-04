"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Leaf, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, setQty, remove, totalCents } = useCart();
  const currency = items[0]?.currency ?? "USD";

  if (items.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <ShoppingBag className="size-14 text-nature/40" strokeWidth={1.2} />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-forest/65">Explore our lab-tested herbal products.</p>
        <Link href="/shop" className="mt-6">
          <Button>Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold">Your Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-nature/10">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Leaf className="size-7 text-nature/40" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <Link href={`/shop/${item.slug}`} className="font-semibold text-forest hover:underline">
                  {item.name}
                </Link>
                <span className="text-sm text-forest/60">
                  {formatPrice(item.priceCents / 100, item.currency)}
                </span>

                <div className="mt-auto flex items-center gap-3">
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      className="px-2 py-1 text-forest hover:bg-forest/5"
                      onClick={() => setQty(item.productId, item.quantity - 1)}
                      aria-label="Decrease"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      className="px-2 py-1 text-forest hover:bg-forest/5"
                      onClick={() => setQty(item.productId, item.quantity + 1)}
                      aria-label="Increase"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <button
                    className="text-terracotta hover:opacity-70"
                    onClick={() => remove(item.productId)}
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="font-bold text-forest">
                {formatPrice((item.priceCents * item.quantity) / 100, item.currency)}
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm text-forest/70">
            <span>Subtotal</span>
            <span>{formatPrice(totalCents() / 100, currency)}</span>
          </div>
          <p className="mt-1 text-xs text-forest/50">
            Shipping & taxes calculated at checkout.
          </p>
          <Link href="/checkout" className="mt-6 block">
            <Button className="w-full" size="lg">
              Proceed to checkout
            </Button>
          </Link>
        </aside>
      </div>
    </div>
  );
}
