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
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-border text-forest shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-soft">
      <Link href={href} className="relative block aspect-[4/3] w-full overflow-hidden bg-[#F8F5EE]">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Leaf className="size-12 text-nature/30" strokeWidth={1.2} />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={href}>
          <h3 className="text-lg font-bold text-forest transition-colors duration-300 hover:text-nature">{product.name}</h3>
        </Link>
        {product.short_description && (
          <p className="mt-2 line-clamp-2 text-sm text-forest/70 leading-relaxed">{product.short_description}</p>
        )}
        <TrustBadges badges={product.trust_badges} dark={false} className="mt-4" />

        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xl font-bold text-gold-600">{price}</span>
            <Link href={href} className="text-sm font-semibold text-nature hover:text-forest transition-colors">
              View details →
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
