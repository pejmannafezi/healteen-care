import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getProductsByNeedSlug } from "@/lib/services/catalog";
import { ProductCard } from "@/components/shop/product-card";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, HeartPulse, Sprout } from "lucide-react";

export default async function NeedPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const result = await getProductsByNeedSlug(slug);
  if (!result) notFound();

  const { need, products } = result;

  return (
    <div className="bg-cream">
      {/* ── Collection header band ── */}
      <div className="relative overflow-hidden border-b border-gold/20 bg-forest-700">
        <div className="pointer-events-none absolute -end-8 top-1/2 -translate-y-1/2 opacity-[0.04]">
          <HeartPulse className="size-64 text-cream" strokeWidth={0.8} />
        </div>
        <div className="container-page relative z-10 py-14 md:py-16">
          <Link
            href="/shop"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full text-sm font-semibold text-cream/80 transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            Back to shop
          </Link>
          <p className="mt-4 font-accent text-lg italic text-gold">Shop by Health Need</p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-cream [text-wrap:balance] sm:text-5xl">
            {need.name}
          </h1>
          {need.description && (
            <p className="mt-4 max-w-2xl leading-relaxed text-cream/80">{need.description}</p>
          )}
          <div className="gold-divider mt-6 max-w-[10rem]" />
        </div>
      </div>

      <div className="container-page py-12 md:py-16">
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-white p-12 text-center">
            <Sprout className="size-10 text-nature/40" strokeWidth={1.2} aria-hidden="true" />
            <p className="text-forest/60">No products for this need yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
