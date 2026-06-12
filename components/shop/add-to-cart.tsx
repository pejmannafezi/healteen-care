"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ShoppingCart, Check, PackageX, ArrowRight } from "lucide-react";
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
      <Button disabled size="lg" variant="outline" className="w-full border-dashed text-forest/50 sm:w-auto">
        <PackageX aria-hidden="true" />
        Out of stock
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        size="lg"
        variant="honey"
        aria-live="polite"
        onClick={() => {
          add(item);
          setAdded(true);
          setTimeout(() => setAdded(false), 1800);
        }}
        className="w-full font-bold sm:w-auto sm:min-w-[12rem]"
      >
        {added ? <Check aria-hidden="true" /> : <ShoppingCart aria-hidden="true" />}
        {added ? "Added" : "Add to cart"}
      </Button>
      <Button
        size="lg"
        variant="primary"
        onClick={() => {
          add(item);
          router.push("/cart");
        }}
        className="w-full sm:w-auto"
      >
        Buy now
        <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
      </Button>
    </div>
  );
}
