"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/lib/store/cart";

/** Compact add-to-cart button for use inside product cards. */
export function CardAddToCart({
  item,
  inStock,
}: {
  item: Omit<CartItem, "quantity">;
  inStock: boolean;
}) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  if (!inStock) {
    return (
      <Button size="sm" disabled className="w-full border border-border bg-transparent text-forest/40">
        Out of stock
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      className="w-full bg-nature text-cream hover:bg-forest font-semibold shadow-sm transition-all"
      onClick={() => {
        add(item);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? <Check /> : <ShoppingCart />}
      {added ? "Added to cart" : "Add to cart"}
    </Button>
  );
}
