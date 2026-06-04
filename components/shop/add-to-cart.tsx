"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/lib/store/cart";

export function AddToCart({
  item,
  inStock,
}: {
  item: Omit<CartItem, "quantity">;
  inStock: boolean;
}) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  if (!inStock) {
    return (
      <Button disabled size="lg" className="w-full sm:w-auto">
        Out of stock
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        size="lg"
        onClick={() => {
          add(item);
          setAdded(true);
          setTimeout(() => setAdded(false), 1800);
        }}
        className="w-full sm:w-auto"
      >
        {added ? <Check /> : <ShoppingCart />}
        {added ? "Added" : "Add to cart"}
      </Button>
      <Button
        size="lg"
        variant="gold"
        onClick={() => {
          add(item);
          router.push("/cart");
        }}
        className="w-full sm:w-auto"
      >
        Buy now
      </Button>
    </div>
  );
}
