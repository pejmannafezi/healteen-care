import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GraduationCap, CalendarDays, Clock, ArrowRight, Leaf } from "lucide-react";
import { getPublishedWebinars } from "@/lib/services/content";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Classes & Webinars" };

export default async function WebinarsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const webinars = await getPublishedWebinars();

  return (
    <>
      {/* Page header band */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-cream to-[#EFEADD]/40">
        <div aria-hidden className="pointer-events-none absolute -top-16 -end-20 opacity-[0.04]">
          <Leaf className="size-80 text-forest" strokeWidth={0.75} />
        </div>
        <div className="container-page relative py-14 md:py-20">
          <div className="max-w-2xl animate-fade-up">
            <p className="eyebrow">Learn with us</p>
            <h1 className="mt-2 text-balance text-4xl font-bold text-forest md:text-5xl">
              Classes &amp; Webinars
            </h1>
            <div className="gold-divider mt-5 max-w-[12rem]" />
            <p className="mt-5 text-lg leading-relaxed text-forest/70">
              Live online classes and recorded sessions on herbal wellness, safe use, and healthy aging.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page py-14">
        {webinars.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border bg-cream p-12 text-center">
            <GraduationCap aria-hidden className="mx-auto size-10 text-nature/40" strokeWidth={1.2} />
            <p className="mt-4 font-semibold text-forest">New classes are being scheduled.</p>
            <p className="mt-1 text-sm text-forest/60">Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {webinars.map((w) => (
              <Link
                key={w.id}
                href={`/webinars/${w.slug}`}
                className="group card-hover relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div aria-hidden className="pointer-events-none absolute -end-10 -top-10 size-32 rounded-full bg-nature/[0.04] transition-transform duration-500 group-hover:scale-150" />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-nature/10 text-nature transition-transform duration-300 group-hover:scale-110">
                    <GraduationCap className="size-6" />
                  </div>
                  <Badge variant={w.price_cents > 0 ? "gold" : "mint"}>
                    {w.price_cents > 0 ? formatPrice(w.price_cents / 100) : "Free"}
                  </Badge>
                </div>
                <h2 className="mt-5 text-xl font-bold leading-snug text-forest transition-colors duration-300 group-hover:text-nature">
                  {w.title}
                </h2>
                {w.description && (
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-forest/65">
                    {w.description}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-sm text-forest/70">
                  {w.scheduled_at && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays aria-hidden className="size-4 text-gold-600" />
                      {new Date(w.scheduled_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </span>
                  )}
                  {w.duration_min && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock aria-hidden className="size-4 text-gold-600" /> {w.duration_min} min
                    </span>
                  )}
                  <span className="ms-auto inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 transition-all duration-300 group-hover:gap-2.5">
                    View class <ArrowRight className="size-4 rtl:rotate-180" />
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
