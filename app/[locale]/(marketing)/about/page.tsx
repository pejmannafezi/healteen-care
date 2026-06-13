import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { FileText, Leaf, BadgeCheck, Sprout } from "lucide-react";
import { getAbout } from "@/lib/services/content";
import { getSiteContent } from "@/lib/services/site-content";
import { Editable } from "@/components/site/editable";
import { Button } from "@/components/ui/button";

export const metadata = { title: "About" };

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [about, content] = await Promise.all([getAbout(), getSiteContent(locale)]);

  return (
    <div className="relative overflow-hidden">
      {/* Soft botanical backdrop */}
      <div aria-hidden className="pointer-events-none absolute -top-20 -end-24 opacity-[0.04]">
        <Leaf className="size-96 text-forest" strokeWidth={0.75} />
      </div>

      <div className="container-page section relative">
        <div className="grid items-start gap-12 lg:grid-cols-[360px_1fr] lg:gap-16">
          {/* Portrait panel */}
          <div className="lg:sticky lg:top-28">
            <div className="surface-glass animate-fade-up rounded-3xl p-3">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-nature/10 to-mint/10">
                {about.image_url ? (
                  <Image
                    src={about.image_url}
                    alt={about.headline ?? "About"}
                    fill
                    sizes="360px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Leaf className="size-16 text-nature/40" strokeWidth={1} />
                  </div>
                )}
              </div>
            </div>

            {/* Quiet credibility chips under the portrait */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-nature/10 px-3 py-1.5 text-xs font-semibold text-nature">
                <Sprout className="size-3.5" /> Herbal wellness
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold-600">
                <BadgeCheck className="size-3.5" /> Trusted guidance
              </span>
            </div>
          </div>

          {/* Story */}
          <div className="animate-fade-up">
            <Editable as="p" id="about.eyebrow" locale={locale} className="eyebrow"
              value={content.text("about.eyebrow", "About")} />
            <Editable as="h1" id="about.heading" locale={locale}
              className="mt-2 text-balance text-4xl font-bold text-forest md:text-5xl"
              value={content.text("about.heading", about.headline ?? "About Pejman Nafezi")} />
            <div className="gold-divider my-6 max-w-xs" />
            <Editable as="div" type="rich" id="about.body" locale={locale}
              className="prose-healteen max-w-[70ch] whitespace-pre-line text-lg leading-relaxed text-forest/80"
              value={content.text("about.body", about.body ?? "A personal introduction is coming here soon.")} />

            {about.resume_url && (
              <div className="mt-10">
                <Button asChild variant="outline" size="lg">
                  <a href={about.resume_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="size-4" /> View résumé
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
