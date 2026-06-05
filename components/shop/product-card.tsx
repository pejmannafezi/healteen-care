import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Leaf } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { TrustBadges } from "./trust-badges";
import { CardAddToCart } from "./card-add-to-cart";

export function ProductCard({ product }: { product: Product }) {
  const price = formatPrice(product.price_cents / 100, product.currency);
  const image = product.images?.[0];
  const href = `/shop/${product.slug}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-forest-700 text-cream shadow-card ring-1 ring-forest/40 transition-all hover:-translate-y-1 hover:shadow-soft">
      <Link href={href} className="relative block aspect-[4/3] w-full overflow-hidden bg-forest">
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
            <Leaf className="size-12 text-mint/50" strokeWidth={1.2} />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={href}>
          <h3 className="text-lg font-bold text-cream hover:underline">{product.name}</h3>
        </Link>
        {product.short_description && (
          <p className="mt-1 line-clamp-2 text-sm text-cream/70">{product.short_description}</p>
        )}
        <TrustBadges badges={product.trust_badges} dark className="mt-3" />

        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xl font-bold text-lime">{price}</span>
            <Link href={href} className="text-sm font-semibold text-mint hover:underline">
              View →
            </Link>
          </div>
          <CardAddToCart
            inStock={product.stock_qty > 0}
            item={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.price_cents,
              currency: product.currency,
              image,
            }}
          />
        </div>
      </div>
    </div>
  );
}
