import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProductTypes, getHealthNeeds, getAllProducts } from "@/lib/services/catalog";
import { ProductCard } from "@/components/shop/product-card";
import { Leaf, HeartPulse } from "lucide-react";

export const metadata = { title: "Shop" };

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [types, needs, products] = await Promise.all([
    getProductTypes(),
    getHealthNeeds(),
    getAllProducts(),
  ]);

  return (
    <div className="bg-cream">
      {/* High-end Deep Forest Shop Hero Banner */}
      <div className="relative overflow-hidden bg-forest-700 border-b border-gold/20 py-20">
        {/* Decorative leaf watermark in the background */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]">
          <Leaf className="size-80 text-cream" strokeWidth={0.8} />
        </div>
        <div className="container-page relative z-10">
          <header className="max-w-2xl">
            <p className="font-accent text-lg italic text-gold">Shop</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-cream sm:text-5xl">
              Lab-tested herbal products
            </h1>
            <p className="mt-4 text-base text-cream/80 leading-relaxed">
              Find what's right for you — browse by product type or by the health need you want
              to support.
            </p>
          </header>
        </div>
      </div>

      <div className="container-page py-10">
        {/* Shop by Product Type */}
        <section className="mt-8">
          <div className="mb-6 flex items-center gap-2">
            <Leaf className="size-5 text-nature" />
            <h2 className="text-2xl font-bold text-forest">Shop by Product Type</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {types.map((t) => (
              <TaxonomyChip key={t.id} href={`/shop/type/${t.slug}`} label={t.name} />
            ))}
          </div>
        </section>

        {/* Shop by Health Need */}
        <section className="mt-14">
          <div className="mb-6 flex items-center gap-2">
            <HeartPulse className="size-5 text-nature" />
            <h2 className="text-2xl font-bold text-forest">Shop by Health Need</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {needs.map((n) => (
              <TaxonomyChip key={n.id} href={`/shop/need/${n.slug}`} label={n.name} />
            ))}
          </div>
        </section>

        {/* All products */}
        <section className="mt-20">
          <div className="mb-8 border-b border-border pb-4">
            <h2 className="text-2xl font-bold text-forest">All Products</h2>
          </div>
          {products.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-white p-8 text-center text-forest/60">
              Products are being added soon.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function TaxonomyChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center rounded-xl border border-border bg-white px-4 py-3.5 text-center text-sm font-semibold text-forest shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-soft"
    >
      {label}
    </Link>
  );
}
