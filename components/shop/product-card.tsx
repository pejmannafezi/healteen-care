import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Leaf, ArrowRight, PackageX } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "./trust-badges";
import { CardAddToCart } from "./card-add-to-cart";

export function ProductCard({ product }: { product: Product }) {
  const price = formatPrice(product.price_cents / 100, product.currency);
  const image = product.images?.[0];
  const href = `/shop/${product.slug}`;
  const inStock = product.stock_qty > 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white text-forest shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gold/40 hover:shadow-lift">
      {/* Gold accent line that warms on hover */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-0.5 bg-gradient-to-r from-transparent via-gold/30 to-transparent transition-all duration-300 group-hover:via-gold/80"
      />

      <Link
        href={href}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-cream to-mint/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Leaf className="size-12 text-nature/30 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.2} />
          </div>
        )}
        {!inStock && (
          <Badge variant="terracotta" className="absolute start-3 top-3 bg-white/90 shadow-sm backdrop-blur-sm">
            <PackageX aria-hidden="true" />
            Out of stock
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <Link
          href={href}
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <h3 className="text-lg font-bold leading-snug text-forest transition-colors duration-300 group-hover:text-nature">
            {product.name}
          </h3>
        </Link>
        {product.short_description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.short_description}
          </p>
        )}
        <TrustBadges badges={product.trust_badges} dark={false} className="mt-4" />

        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-baseline justify-between gap-3 border-t border-border/70 pt-4">
            <span className="text-xl font-bold tabular-nums text-gold-600">{price}</span>
            <Link
              href={href}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full text-sm font-semibold text-nature transition-colors hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View details
              <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
            </Link>
          </div>
          <CardAddToCart
            inStock={inStock}
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
    </article>
  );
}
