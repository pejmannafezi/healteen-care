import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AlertTriangle, ArrowLeft, ArrowRight, Leaf, Info, Sprout } from "lucide-react";
import { getConditionBySlug } from "@/lib/services/conditions";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const condition = await getConditionBySlug(slug);
  return { title: condition?.name ?? "Condition" };
}

export default async function ConditionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const condition = await getConditionBySlug(slug);
  if (!condition) notFound();

  return (
    <div className="container-page py-12 md:py-16">
      <Link
        href="/health"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full text-sm font-semibold text-nature transition-colors hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden />
        Back to Health Library
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-3 lg:gap-14">
        <div className="animate-fade-up lg:col-span-2">
          <p className="eyebrow">Health Library</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-forest md:text-4xl">
            {condition.name}
          </h1>
          <div className="gold-divider mt-4 max-w-[10rem]" />
          {condition.description && (
            <p className="mt-5 max-w-prose whitespace-pre-line leading-relaxed text-forest/80">
              {condition.description}
            </p>
          )}

          {condition.symptoms && (
            <section className="mt-10">
              <h2 className="flex items-center gap-2 text-xl font-bold text-forest">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest"
                  aria-hidden
                >
                  <Sprout className="size-4" />
                </span>
                Common Symptoms
              </h2>
              <p className="mt-3 max-w-prose whitespace-pre-line leading-relaxed text-forest/80">
                {condition.symptoms}
              </p>
            </section>
          )}

          {condition.usage_notes && (
            <section className="mt-8 rounded-2xl border border-nature/15 bg-nature/5 p-6 md:p-7">
              <h2 className="flex items-center gap-2 text-lg font-bold text-nature">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-nature/15 text-nature"
                  aria-hidden
                >
                  <Info className="size-4" />
                </span>
                How Herbal Options May Help
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-forest/80">
                {condition.usage_notes}
              </p>
            </section>
          )}

          {/* WHO SHOULD NOT USE — safety highlight */}
          {condition.who_should_not_use && (
            <section className="mt-6 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-6 md:p-7">
              <h2 className="flex items-center gap-2 text-lg font-bold text-terracotta">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-terracotta/15 text-terracotta"
                  aria-hidden
                >
                  <AlertTriangle className="size-4" />
                </span>
                Who Should Avoid These
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-forest/80">
                {condition.who_should_not_use}
              </p>
            </section>
          )}
        </div>

        {/* Image */}
        <aside className="animate-fade-in lg:sticky lg:top-24 lg:self-start">
          <div className="surface-glass rounded-3xl p-2.5">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-nature/10 via-mint/10 to-cream">
              {condition.image_url ? (
                <Image
                  src={condition.image_url}
                  alt={condition.name}
                  fill
                  sizes="(max-width:1024px) 100vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Leaf className="size-16 text-nature/40" strokeWidth={1} aria-hidden />
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Recommended herbal products */}
      {condition.products.length > 0 && (
        <section className="mt-16 border-t border-border pt-12 md:mt-20">
          <p className="eyebrow">From the shop</p>
          <h2 className="mt-2 text-2xl font-bold text-forest md:text-3xl">
            Suggested Herbal Products
          </h2>
          <p className="mt-2 text-forest/65">Products that may help support this condition.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {condition.products.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                className="group card-hover flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-nature/10 via-mint/10 to-cream">
                  {p.images?.[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Leaf className="size-10 text-nature/40" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-bold text-forest transition-colors duration-300 group-hover:text-nature">
                    {p.name}
                  </h3>
                  {p.usage_instructions && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-forest/65">
                      {p.usage_instructions}
                    </p>
                  )}
                  <div className="mt-4 flex flex-1 items-end justify-between gap-3">
                    <span className="text-lg font-bold text-forest">
                      {formatPrice(p.price_cents / 100, p.currency)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 transition-all duration-300 group-hover:gap-2.5">
                      View
                      <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-14 flex items-start gap-3 rounded-2xl border border-border bg-cream p-6 text-xs leading-relaxed text-forest/60">
        <Info className="mt-0.5 size-4 shrink-0 text-forest/40" aria-hidden />
        <p>
          This information is educational and is not medical advice. Herbal products are intended
          to support general wellness and are not intended to diagnose, treat, cure, or prevent any
          disease. Always consult your healthcare provider, especially if pregnant, nursing, or
          taking medication.
        </p>
      </div>
    </div>
  );
}
