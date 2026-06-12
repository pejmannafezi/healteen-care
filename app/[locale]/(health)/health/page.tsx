import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Activity, ArrowRight, BookOpenText, Leaf } from "lucide-react";
import { getConditions } from "@/lib/services/conditions";

export const metadata = { title: "Health Library" };

export default async function HealthLibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const conditions = await getConditions();

  return (
    <>
      {/* ── Library hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-cream to-[#EFEADD]/40">
        {/* Decorative botanical watermark */}
        <div className="pointer-events-none absolute -top-10 -end-10 opacity-[0.04]" aria-hidden>
          <Leaf className="size-64 text-forest" strokeWidth={1} />
        </div>
        <div className="container-page py-16 md:py-20">
          <div className="max-w-2xl animate-fade-up">
            <p className="eyebrow inline-flex items-center gap-2">
              <BookOpenText className="size-4" aria-hidden /> Health Library
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-forest md:text-5xl">
              Learn about common conditions
            </h1>
            <div className="gold-divider mt-5 max-w-[10rem]" />
            <p className="mt-5 text-lg leading-relaxed text-forest/75">
              For each condition, see which herbal options may help support it, how to use them
              safely, and who should avoid them. Educational only — always consult your provider.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page section">
        {conditions.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border bg-cream p-10 text-center">
            <Leaf className="mx-auto size-10 text-nature/50" strokeWidth={1.2} aria-hidden />
            <p className="mt-4 font-semibold text-forest">Conditions are being added soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {conditions.map((c, i) => (
              <Link
                key={c.id}
                href={`/health/${c.slug}`}
                className="group card-hover animate-fade-up flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-nature/10 via-mint/10 to-cream">
                  {c.image_url ? (
                    <Image
                      src={c.image_url}
                      alt={c.name}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Activity className="size-10 text-nature/40" strokeWidth={1.2} aria-hidden />
                    </div>
                  )}
                  {/* Soft botanical scrim for depth */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-forest/15 to-transparent"
                    aria-hidden
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-lg font-bold text-forest transition-colors duration-300 group-hover:text-nature">
                    {c.name}
                  </h2>
                  {c.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-forest/65">
                      {c.description}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 transition-all duration-300 group-hover:gap-2.5">
                    Learn more
                    <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
