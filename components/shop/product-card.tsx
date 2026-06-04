import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Leaf } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { TrustBadges } from "./trust-badges";

export function ProductCard({ product }: { product: Product }) {
  const price = formatPrice(product.price_cents / 100, product.currency);
  const image = product.images?.[0];

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-nature/10 to-mint/10">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Leaf className="size-12 text-nature/40" strokeWidth={1.2} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-forest">{product.name}</h3>
        {product.short_description && (
          <p className="mt-1 line-clamp-2 text-sm text-forest/65">
            {product.short_description}
          </p>
        )}
        <TrustBadges badges={product.trust_badges} className="mt-3" />
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-forest">{price}</span>
          <span className="text-sm font-semibold text-nature group-hover:underline">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
