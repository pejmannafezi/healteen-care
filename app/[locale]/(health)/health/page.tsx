import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Activity } from "lucide-react";
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
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Health Library</p>
        <h1 className="mt-2 text-4xl font-bold">Learn about common conditions</h1>
        <p className="mt-3 text-forest/70">
          For each condition, see which herbal options may help support it, how to use them
          safely, and who should avoid them. Educational only — always consult your provider.
        </p>
      </header>

      {conditions.length === 0 ? (
        <p className="mt-12 rounded-xl border border-dashed border-border bg-cream p-8 text-center text-forest/60">
          Conditions are being added soon.
        </p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {conditions.map((c) => (
            <Link
              key={c.id}
              href={`/health/${c.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-nature/10 to-mint/10">
                {c.image_url ? (
                  <Image src={c.image_url} alt={c.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Activity className="size-10 text-nature/40" strokeWidth={1.2} />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold text-forest">{c.name}</h2>
                {c.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-forest/65">{c.description}</p>
                )}
                <span className="mt-3 inline-block text-sm font-semibold text-nature group-hover:underline">
                  Learn more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
