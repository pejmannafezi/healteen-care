import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Leaf, AlertTriangle, FileText } from "lucide-react";
import { getProductBySlug } from "@/lib/services/catalog";
import { TrustBadges } from "@/components/shop/trust-badges";
import { AddToCart } from "@/components/shop/add-to-cart";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = formatPrice(product.price_cents / 100, product.currency);
  const inStock = product.stock_qty > 0;

  return (
    <div className="container-page py-12">
      <Link href="/shop" className="text-sm text-nature hover:underline">
        ← Back to shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* ── Image ── */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-nature/10 to-mint/10">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Leaf className="size-20 text-nature/40" strokeWidth={1} />
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-lg border border-border"
                >
                  <Image src={img} alt="" fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Summary + buy ── */}
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">{product.name}</h1>
          {product.size && (
            <p className="mt-1 text-sm text-forest/60">{product.size}</p>
          )}
          {product.short_description && (
            <p className="mt-4 text-forest/75">{product.short_description}</p>
          )}

          <TrustBadges badges={product.trust_badges} size="md" className="mt-5" />

          <p className="mt-6 text-3xl font-bold text-forest">{price}</p>
          <p className="mt-1 text-sm font-medium">
            {inStock ? (
              <span className="text-nature">In stock</span>
            ) : (
              <span className="text-terracotta">Out of stock</span>
            )}
          </p>

          <div className="mt-6">
            <AddToCart
              inStock={inStock}
              item={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.price_cents,
                currency: product.currency,
                image: product.images?.[0],
              }}
            />
          </div>

          {/* Quick benefits */}
          {product.benefits && (
            <div className="mt-8 rounded-xl bg-nature/5 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-nature">
                What it supports
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm text-forest/80">
                {product.benefits}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Full detail (brand-guide product structure) ── */}
      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Section title="Product History" body={product.history} />
          <Section title="Symptoms & Needs It May Support" body={product.symptoms_supported} />
          <Section title="How to Use" body={product.how_to_use} />
          <Section title="Ingredients" body={product.ingredients} />

          {/* WHO SHOULD NOT USE — safety highlight */}
          {product.contraindications && (
            <section className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-terracotta">
                <AlertTriangle className="size-5" /> Who Should Not Use This
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm text-forest/80">
                {product.contraindications}
              </p>
            </section>
          )}
        </div>

        {/* Side: trust + lab doc */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-forest">
              Quality & Trust
            </h2>
            <TrustBadges badges={product.trust_badges} className="mt-3" />
            {product.lab_doc_url && (
              <a
                href={product.lab_doc_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-nature hover:underline"
              >
                <FileText className="size-4" /> View lab test report
              </a>
            )}
          </div>

          <div className="rounded-xl bg-cream p-6 text-xs leading-relaxed text-forest/60">
            These statements have not been evaluated by the FDA. This product is intended to
            support general wellness and is not intended to diagnose, treat, cure, or prevent
            any disease. Consult your healthcare provider before use.
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string | null }) {
  if (!body) return null;
  return (
    <section>
      <h2 className="text-lg font-bold text-forest">{title}</h2>
      <div className="gold-divider my-3 max-w-[8rem]" />
      <p className="whitespace-pre-line text-forest/80">{body}</p>
    </section>
  );
}
