import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AlertTriangle, Leaf, Info } from "lucide-react";
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
    <div className="container-page py-12">
      <Link href="/health" className="text-sm text-nature hover:underline">
        ← Back to Health Library
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold md:text-4xl">{condition.name}</h1>
          {condition.description && (
            <p className="mt-4 whitespace-pre-line text-forest/80">{condition.description}</p>
          )}

          {condition.symptoms && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-forest">Common Symptoms</h2>
              <div className="gold-divider my-3 max-w-[8rem]" />
              <p className="whitespace-pre-line text-forest/80">{condition.symptoms}</p>
            </section>
          )}

          {condition.usage_notes && (
            <section className="mt-8 rounded-xl bg-nature/5 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-nature">
                <Info className="size-5" /> How Herbal Options May Help
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm text-forest/80">
                {condition.usage_notes}
              </p>
            </section>
          )}

          {/* WHO SHOULD NOT USE — safety highlight */}
          {condition.who_should_not_use && (
            <section className="mt-8 rounded-xl border border-terracotta/30 bg-terracotta/5 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-terracotta">
                <AlertTriangle className="size-5" /> Who Should Avoid These
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm text-forest/80">
                {condition.who_should_not_use}
              </p>
            </section>
          )}
        </div>

        {/* Image */}
        <aside>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-nature/10 to-mint/10">
            {condition.image_url ? (
              <Image src={condition.image_url} alt={condition.name} fill sizes="33vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Leaf className="size-16 text-nature/40" strokeWidth={1} />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Recommended herbal products */}
      {condition.products.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Suggested Herbal Products</h2>
          <p className="mt-1 text-forest/65">
            Products that may help support this condition.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {condition.products.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-nature/10 to-mint/10">
                  {p.images?.[0] ? (
                    <Image src={p.images[0]} alt={p.name} fill sizes="33vw" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Leaf className="size-10 text-nature/40" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-bold text-forest">{p.name}</h3>
                  {p.usage_instructions && (
                    <p className="mt-1 line-clamp-2 text-sm text-forest/65">
                      {p.usage_instructions}
                    </p>
                  )}
                  <span className="mt-3 font-bold text-forest">
                    {formatPrice(p.price_cents / 100, p.currency)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 rounded-xl bg-cream p-6 text-xs leading-relaxed text-forest/60">
        This information is educational and is not medical advice. Herbal products are intended
        to support general wellness and are not intended to diagnose, treat, cure, or prevent any
        disease. Always consult your healthcare provider, especially if pregnant, nursing, or
        taking medication.
      </div>
    </div>
  );
}
