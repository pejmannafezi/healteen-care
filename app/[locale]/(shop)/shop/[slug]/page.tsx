import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  Leaf,
  AlertTriangle,
  FileText,
  ArrowLeft,
  CheckCircle2,
  PackageX,
  Sparkles,
} from "lucide-react";
import { getProductBySlug } from "@/lib/services/catalog";
import { TrustBadges } from "@/components/shop/trust-badges";
import { AddToCart } from "@/components/shop/add-to-cart";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="bg-cream">
      <div className="container-page py-10 md:py-14">
        <Link
          href="/shop"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full text-sm font-semibold text-nature transition-colors hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
          Back to shop
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* ── Image gallery ── */}
          <div className="animate-fade-up">
            <div className="surface-glass rounded-3xl p-3">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-nature/10 to-mint/10">
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
                    <Leaf className="size-20 text-nature/40" strokeWidth={1} aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>
            {product.images?.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.slice(1, 5).map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-xl border border-border bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-soft"
                  >
                    <Image src={img} alt="" fill sizes="120px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Summary + buy ── */}
          <div className="animate-fade-up">
            <h1 className="text-3xl font-bold leading-tight text-forest [text-wrap:balance] md:text-4xl">
              {product.name}
            </h1>
            {product.size && (
              <p className="mt-2 text-sm font-medium text-muted-foreground">{product.size}</p>
            )}
            {product.short_description && (
              <p className="mt-4 max-w-prose leading-relaxed text-forest/75">
                {product.short_description}
              </p>
            )}

            <TrustBadges badges={product.trust_badges} size="md" className="mt-6" />

            {/* Price + stock block */}
            <div className="mt-7 rounded-2xl border border-border bg-white p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-3xl font-bold tabular-nums text-forest">{price}</p>
                {inStock ? (
                  <Badge variant="nature" className="px-3 py-1">
                    <CheckCircle2 aria-hidden="true" />
                    In stock
                  </Badge>
                ) : (
                  <Badge variant="terracotta" className="px-3 py-1">
                    <PackageX aria-hidden="true" />
                    Out of stock
                  </Badge>
                )}
              </div>

              <div className="mt-5">
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
            </div>

            {/* Quick benefits */}
            {product.benefits && (
              <div className="mt-7 rounded-2xl border border-nature/15 bg-nature/5 p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-nature">
                  <Sparkles aria-hidden="true" className="size-4 text-gold-600" />
                  What it supports
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-forest/80">
                  {product.benefits}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Full detail (brand-guide product structure) ── */}
        <div className="mt-16 grid gap-10 lg:mt-20 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <Section title="Product History" body={product.history} />
            <Section title="Symptoms & Needs It May Support" body={product.symptoms_supported} />
            <Section title="How to Use" body={product.how_to_use} />
            <Section title="Ingredients" body={product.ingredients} />

            {/* WHO SHOULD NOT USE — safety highlight */}
            {product.contraindications && (
              <section className="rounded-2xl border border-terracotta/30 bg-terracotta/5 p-6 sm:p-7">
                <h2 className="flex items-center gap-2.5 text-lg font-bold text-terracotta">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-terracotta/10">
                    <AlertTriangle className="size-5" aria-hidden="true" />
                  </span>
                  Who Should Not Use This
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-forest/80">
                  {product.contraindications}
                </p>
              </section>
            )}
          </div>

          {/* Side: trust + lab doc */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-sm font-bold uppercase tracking-wide text-forest">
                  Quality & Trust
                </h2>
                <div className="gold-divider my-4" />
                <TrustBadges badges={product.trust_badges} />
                {product.lab_doc_url && (
                  <a
                    href={product.lab_doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full text-sm font-semibold text-nature transition-colors hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <FileText className="size-4" aria-hidden="true" /> View lab test report
                  </a>
                )}
              </CardContent>
            </Card>

            <div className="rounded-2xl border border-border/70 bg-white/60 p-6 text-xs leading-relaxed text-muted-foreground">
              These statements have not been evaluated by the FDA. This product is intended to
              support general wellness and is not intended to diagnose, treat, cure, or prevent
              any disease. Consult your healthcare provider before use.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string | null }) {
  if (!body) return null;
  return (
    <section>
      <h2 className="text-xl font-bold text-forest">{title}</h2>
      <div className="gold-divider my-3 max-w-[8rem]" />
      <p className="max-w-prose whitespace-pre-line leading-relaxed text-forest/80">{body}</p>
    </section>
  );
}
