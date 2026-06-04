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
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Shop</p>
        <h1 className="mt-2 text-4xl font-bold">Lab-tested herbal products</h1>
        <p className="mt-3 text-forest/70">
          Find what's right for you — browse by product type or by the health need you want
          to support.
        </p>
      </header>

      {/* Shop by Product Type */}
      <section className="mt-12">
        <div className="mb-5 flex items-center gap-2">
          <Leaf className="size-5 text-nature" />
          <h2 className="text-2xl font-bold">Shop by Product Type</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {types.map((t) => (
            <TaxonomyChip key={t.id} href={`/shop/type/${t.slug}`} label={t.name} />
          ))}
        </div>
      </section>

      {/* Shop by Health Need */}
      <section className="mt-12">
        <div className="mb-5 flex items-center gap-2">
          <HeartPulse className="size-5 text-nature" />
          <h2 className="text-2xl font-bold">Shop by Health Need</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {needs.map((n) => (
            <TaxonomyChip key={n.id} href={`/shop/need/${n.slug}`} label={n.name} />
          ))}
        </div>
      </section>

      {/* All products */}
      <section className="mt-16">
        <h2 className="mb-6 text-2xl font-bold">All Products</h2>
        {products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-cream p-8 text-center text-forest/60">
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
  );
}

function TaxonomyChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-medium text-forest shadow-card transition-all hover:border-nature/40 hover:bg-nature/5"
    >
      {label}
    </Link>
  );
}
