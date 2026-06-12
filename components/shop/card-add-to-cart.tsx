"use client";

import { useState } from "react";
import { ShoppingCart, Check, PackageX } from "lucide-react";
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
      <Button
        disabled
        variant="outline"
        className="w-full border-dashed text-forest/50"
      >
        <PackageX aria-hidden="true" />
        Out of stock
      </Button>
    );
  }

  return (
    <Button
      variant="honey"
      className="w-full font-bold"
      aria-live="polite"
      onClick={() => {
        add(item);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? <Check aria-hidden="true" /> : <ShoppingCart aria-hidden="true" />}
      {added ? "Added to cart" : "Add to cart"}
    </Button>
  );
}
