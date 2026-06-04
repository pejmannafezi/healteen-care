import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GraduationCap, CalendarDays, Clock } from "lucide-react";
import { getPublishedWebinars } from "@/lib/services/content";
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
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Learn with us</p>
        <h1 className="mt-2 text-4xl font-bold">Classes & Webinars</h1>
        <p className="mt-3 text-forest/70">
          Live online classes and recorded sessions on herbal wellness, safe use, and healthy aging.
        </p>
      </header>

      {webinars.length === 0 ? (
        <p className="mt-12 rounded-xl border border-dashed border-border bg-cream p-8 text-center text-forest/60">
          New classes are being scheduled. Check back soon.
        </p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {webinars.map((w) => (
            <Link
              key={w.id}
              href={`/webinars/${w.slug}`}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-nature/10 text-nature">
                <GraduationCap className="size-6" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-forest">{w.title}</h2>
              {w.description && <p className="mt-2 line-clamp-2 text-sm text-forest/65">{w.description}</p>}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-forest/70">
                {w.scheduled_at && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4" />
                    {new Date(w.scheduled_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </span>
                )}
                {w.duration_min && (
                  <span className="inline-flex items-center gap-1.5"><Clock className="size-4" /> {w.duration_min} min</span>
                )}
                <span className="font-semibold text-forest">
                  {w.price_cents > 0 ? formatPrice(w.price_cents / 100) : "Free"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
