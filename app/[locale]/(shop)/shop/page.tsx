import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProductTypes, getHealthNeeds, getAllProducts } from "@/lib/services/catalog";
import { ProductCard } from "@/components/shop/product-card";
import { Leaf, HeartPulse, FlaskConical, ShieldCheck, Sprout, ArrowRight } from "lucide-react";

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
      {/* ── Deep-forest shop hero ── */}
      <div className="relative overflow-hidden border-b border-gold/20 bg-forest-700">
        {/* Decorative botanical watermarks */}
        <div className="pointer-events-none absolute -end-10 top-1/2 -translate-y-1/2 opacity-[0.04]">
          <Leaf className="size-80 text-cream" strokeWidth={0.8} />
        </div>
        <div className="pointer-events-none absolute -bottom-12 start-1/3 opacity-[0.03]">
          <Sprout className="size-56 text-cream" strokeWidth={0.8} />
        </div>

        <div className="container-page relative z-10 py-20 lg:py-24">
          <header className="max-w-2xl animate-fade-up">
            <p className="font-accent text-lg italic text-gold">Shop</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-cream [text-wrap:balance] sm:text-5xl">
              Lab-tested herbal products
            </h1>
            <div className="gold-divider mt-5 max-w-[10rem]" />
            <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/80">
              Find what's right for you — browse by product type or by the health need you want
              to support.
            </p>

            {/* Trust strip */}
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-cream/90">
              <li className="inline-flex items-center gap-2">
                <FlaskConical aria-hidden="true" className="size-4 text-gold" /> Lab-tested
              </li>
              <li className="inline-flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="size-4 text-gold" /> GMP supported
              </li>
              <li className="inline-flex items-center gap-2">
                <Leaf aria-hidden="true" className="size-4 text-gold" /> Naturally sourced
              </li>
            </ul>
          </header>
        </div>
      </div>

      <div className="container-page pb-20 pt-12 md:pb-24">
        {/* ── Shop by Product Type ── */}
        <section aria-labelledby="shop-by-type">
          <SectionHeading
            id="shop-by-type"
            icon={<Leaf className="size-5" aria-hidden="true" />}
            title="Shop by Product Type"
          />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {types.map((t) => (
              <TaxonomyChip key={t.id} href={`/shop/type/${t.slug}`} label={t.name} />
            ))}
          </div>
        </section>

        {/* ── Shop by Health Need ── */}
        <section aria-labelledby="shop-by-need" className="mt-16">
          <SectionHeading
            id="shop-by-need"
            icon={<HeartPulse className="size-5" aria-hidden="true" />}
            title="Shop by Health Need"
          />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {needs.map((n) => (
              <TaxonomyChip key={n.id} href={`/shop/need/${n.slug}`} label={n.name} />
            ))}
          </div>
        </section>

        {/* ── All products ── */}
        <section aria-labelledby="all-products" className="mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-5">
            <h2 id="all-products" className="text-2xl font-bold text-forest sm:text-3xl">
              All Products
            </h2>
            {products.length > 0 && (
              <span className="text-sm font-medium tabular-nums text-muted-foreground">
                {products.length} {products.length === 1 ? "product" : "products"}
              </span>
            )}
          </div>
          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-white p-12 text-center">
              <Sprout className="size-10 text-nature/40" strokeWidth={1.2} aria-hidden="true" />
              <p className="text-forest/60">Products are being added soon.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
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

function SectionHeading({
  id,
  icon,
  title,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-nature/10 text-nature">
        {icon}
      </span>
      <h2 id={id} className="text-2xl font-bold text-forest sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function TaxonomyChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-4 py-3.5 text-center text-sm font-semibold text-forest shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
    >
      {label}
      <ArrowRight
        aria-hidden="true"
        className="size-3.5 shrink-0 text-gold-600 opacity-0 transition-all duration-300 group-hover:opacity-100 rtl:-scale-x-100"
      />
    </Link>
  );
}
