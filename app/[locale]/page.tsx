import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { StoriesBar } from "@/components/site/stories-bar";
import { getStories, getActiveOrNextLive } from "@/lib/services/content";
import { getSiteContent, type SiteContent } from "@/lib/services/site-content";
import { Editable } from "@/components/site/editable";
import { LiveBanner } from "@/components/live/live-banner";
import {
  ShieldCheck,
  FlaskConical,
  BadgeCheck,
  Stethoscope,
  Leaf,
  HeartPulse,
  Sparkles,
  ArrowRight,
  Quote,
  Star,
} from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [stories, live, content] = await Promise.all([
    getStories(),
    getActiveOrNextLive(),
    getSiteContent(locale),
  ]);
  return (
    <>
      {live?.status === "live" && <LiveBanner title={live.title} />}
      <StoriesBar stories={stories} />
      <HomeContent content={content} locale={locale} />
    </>
  );
}

function HomeContent({ content, locale }: { content: SiteContent; locale: string }) {
  const t = useTranslations("home");

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-cream to-[#EFEADD]/40">
        {/* Soft botanical backdrop */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -end-24 opacity-[0.04]">
          <Leaf className="size-[28rem] text-forest" strokeWidth={0.75} />
        </div>

        <div className="container-page relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <Editable as="p" id="hero.eyebrow" locale={locale} className="eyebrow"
              value={content.text("hero.eyebrow", t("hero.eyebrow"))} />
            <Editable as="h1" id="hero.title" locale={locale}
              className="mt-4 text-balance text-4xl font-bold leading-[1.1] text-forest md:text-5xl lg:text-6xl"
              value={content.text("hero.title", t("hero.title"))} />
            <div className="gold-divider mt-6 max-w-[10rem]" />
            <Editable as="p" type="rich" id="hero.subtitle" locale={locale}
              className="mt-6 max-w-xl text-lg leading-relaxed text-forest/75"
              value={content.text("hero.subtitle", t("hero.subtitle"))} />
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" className="shadow-sm transition-transform hover:scale-[1.02]">
                  {content.text("hero.ctaShop", t("hero.ctaShop"))} <ArrowRight className="size-5 rtl:rotate-180" />
                </Button>
              </Link>
              <Link href="/consultation">
                <Button size="lg" variant="outline" className="transition-transform hover:scale-[1.02]">
                  {content.text("hero.ctaConsult", t("hero.ctaConsult"))}
                </Button>
              </Link>
            </div>
          </div>

          {/* Premium botanical hero image */}
          <div className="relative w-full max-w-md justify-self-center lg:max-w-lg">
            <div className="surface-glass relative aspect-square w-full rounded-3xl p-3 transition-transform duration-700 hover:scale-[1.02]">
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
                <Editable
                  type="image" id="hero.image" locale={locale}
                  value={content.image("hero.image", "/botanical-hero.png")}
                  alt="Healteen Care natural ingredients"
                  fill sizes="(max-width: 768px) 100vw, 50vw" priority
                  className="object-cover"
                />
              </div>
            </div>
            {/* Floating quality chip */}
            <div className="surface-glass absolute -bottom-4 start-6 flex items-center gap-2 rounded-full px-4 py-2 animate-fade-in">
              <BadgeCheck className="size-4 text-gold-600" />
              <Editable as="span" id="hero.chip" locale={locale} className="text-xs font-semibold text-forest"
                value={content.text("hero.chip", "Lab-tested quality")} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust signals ── */}
      <section className="border-b border-border bg-white">
        <div className="container-page py-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
            <TrustItem icon={<ShieldCheck />} label={t("trust.gmp")} />
            <TrustItem icon={<FlaskConical />} label={t("trust.lab")} />
            <TrustItem icon={<BadgeCheck />} label={t("trust.thirdParty")} />
            <TrustItem icon={<Stethoscope />} label={t("trust.doctor")} />
          </div>
        </div>
      </section>

      {/* ── Wellness Line featured band (premium honey/cream panel) ── */}
      <section className="section relative overflow-hidden border-b border-border bg-gradient-to-r from-cream via-honey/5 to-[#EFEADD]/30">
        <div className="container-page grid items-center gap-12 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <Editable as="p" id="wellness.eyebrow" locale={locale} className="font-accent text-lg italic text-gold-600"
              value={content.text("wellness.eyebrow", "Featured collection")} />
            <Editable as="h2" id="wellness.title" locale={locale}
              className="mt-2 text-balance text-4xl font-bold text-forest md:text-5xl"
              value={content.text("wellness.title", "The Wellness Line")} />
            <div className="gold-divider mt-5 max-w-[10rem]" />
            <Editable as="p" type="rich" id="wellness.body" locale={locale}
              className="mt-5 max-w-md text-lg leading-relaxed text-forest/80"
              value={content.text(
                "wellness.body",
                "Our lab-tested herbal essentials — oils, drops, teas and supplements — crafted to help support pain relief, calm, and healthy aging."
              )} />
            <div className="mt-8">
              <Link href="/shop" className="inline-block">
                <Button size="lg" variant="primary" className="shadow-sm transition-transform hover:scale-[1.02]">
                  Shop the collection <ArrowRight className="rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="surface-glass relative min-h-[320px] overflow-hidden rounded-3xl p-2.5 md:min-h-[460px]">
            <div className="relative h-full min-h-[300px] w-full overflow-hidden rounded-2xl md:min-h-[440px]">
              <Editable
                type="image" id="wellness.image" locale={locale}
                value={content.image("wellness.image", "/wellness-line.png")}
                alt="Healteen Care wellness line"
                fill sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Two shopping paths (brand guide) ── */}
      <section className="section container-page">
        <div className="text-center">
          <p className="eyebrow">Find your remedy</p>
          <h2 className="mt-2 text-balance text-3xl font-bold text-forest sm:text-4xl">{t("paths.title")}</h2>
          <div className="gold-divider mx-auto mt-4 max-w-xs" />
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <PathCard
            href="/shop"
            title={t("paths.byType")}
            desc={t("paths.byTypeDesc")}
            icon={<Leaf className="size-7" />}
          />
          <PathCard
            href="/health"
            title={t("paths.byNeed")}
            desc={t("paths.byNeedDesc")}
            icon={<HeartPulse className="size-7" />}
          />
        </div>
      </section>

      {/* ── Services + Library split ── */}
      <section className="border-t border-border bg-gradient-to-b from-cream to-white">
        <div className="container-page section grid gap-8 md:grid-cols-2">
          <FeatureBlock
            eyebrow="Service"
            title={t("services.title")}
            desc={t("services.desc")}
            cta={t("services.cta")}
            href="/consultation"
          />
          <FeatureBlock
            eyebrow="Learn"
            title={t("library.title")}
            desc={t("library.desc")}
            cta={t("library.cta")}
            href="/health"
          />
        </div>
      </section>

      {/* ── Core values ── */}
      <section className="section container-page">
        <div className="mb-14 text-center">
          <Sparkles aria-hidden className="mx-auto size-8 animate-pulse text-gold" />
          <h2 className="mt-3 text-balance text-3xl font-bold text-forest sm:text-4xl">{t("values.title")}</h2>
          <div className="gold-divider mx-auto mt-4 max-w-xs" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <ValueCard title={t("values.wisdom")} desc={t("values.wisdomDesc")} />
          <ValueCard title={t("values.aging")} desc={t("values.agingDesc")} />
          <ValueCard title={t("values.natural")} desc={t("values.naturalDesc")} />
          <ValueCard title={t("values.pain")} desc={t("values.painDesc")} />
          <ValueCard title={t("values.quality")} desc={t("values.qualityDesc")} />
        </div>
      </section>

      {/* ── Social proof / testimonials (landing pattern: before the final CTA) ── */}
      <section className="section relative overflow-hidden border-t border-border bg-gradient-to-b from-white to-cream">
        <div aria-hidden className="pointer-events-none absolute -start-24 top-10 opacity-[0.035]">
          <Leaf className="size-80 text-forest" strokeWidth={0.75} />
        </div>
        <div className="container-page relative">
          <div className="text-center">
            <p className="eyebrow">Kind words</p>
            <h2 className="mt-2 text-balance text-3xl font-bold text-forest sm:text-4xl">
              Loved by our community
            </h2>
            <div className="gold-divider mx-auto mt-4 max-w-xs" />
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <TestimonialCard
              quote="The herbal oils eased my joint pain within weeks. Gentle, natural, and beautifully made."
              name="Maryam K."
              detail="Wellness Line customer"
            />
            <TestimonialCard
              quote="The consultation was thoughtful and unhurried — I finally understand which herbs suit me."
              name="David R."
              detail="Consultation client"
            />
            <TestimonialCard
              quote="Calming teas that actually taste wonderful. The lab-tested quality shows in every cup."
              name="Sara T."
              detail="Tea collection customer"
            />
          </div>
        </div>
      </section>

      {/* ── Newsletter CTA (premium forest on cream layout) ── */}
      <section className="border-t border-border bg-cream">
        <div className="container-page py-20">
          <div className="relative overflow-hidden rounded-3xl border border-gold/20 bg-forest-700 px-8 py-12 shadow-soft md:px-16 md:py-20">
            {/* Background decorative botanical shadow details */}
            <div aria-hidden className="pointer-events-none absolute -bottom-20 -end-20 opacity-[0.03]">
              <Leaf className="size-72 text-cream" strokeWidth={1} />
            </div>

            <div className="relative z-10 max-w-2xl">
              <p className="font-accent text-lg italic text-gold/85">Stay well, stay informed</p>
              <h2 className="mt-2 text-balance text-3xl font-bold leading-tight text-cream md:text-5xl">
                Get the latest herbal wellness insights
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-cream/80">
                Pain-relief tips, safe-use guides, seasonal wellness advice and new product launches —
                straight to you.
              </p>
              <div className="mt-8">
                <Link href="/register">
                  <Button size="lg" variant="gold" className="px-10 font-bold uppercase tracking-wider transition-transform hover:scale-[1.02]">
                    Sign up now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 text-forest transition-transform duration-300 hover:scale-105">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold [&_svg]:size-5">
        {icon}
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

function PathCard({
  href,
  title,
  desc,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group card-hover relative overflow-hidden rounded-2xl border border-border bg-white p-8 shadow-card hover:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div aria-hidden className="pointer-events-none absolute -end-10 -top-10 size-32 rounded-full bg-nature/[0.04] transition-transform duration-500 group-hover:scale-150" />
      <div className="flex size-14 items-center justify-center rounded-xl bg-nature/10 text-nature transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-bold text-forest transition-colors duration-300 group-hover:text-nature">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-forest/70">{desc}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 transition-all duration-300 group-hover:gap-2.5">
        Explore <ArrowRight className="size-4 rtl:rotate-180" />
      </span>
    </Link>
  );
}

function FeatureBlock({
  eyebrow,
  title,
  desc,
  cta,
  href,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="card-hover flex flex-col rounded-2xl border border-border bg-white p-8 shadow-card hover:border-gold/30">
      <p className="eyebrow text-xs font-semibold uppercase tracking-wider">{eyebrow}</p>
      <h3 className="mt-2 text-2xl font-bold text-forest">{title}</h3>
      <div className="gold-divider mt-4 max-w-[6rem]" />
      <p className="mt-4 flex-1 text-sm leading-relaxed text-forest/70">{desc}</p>
      <div className="mt-6">
        <Link href={href}>
          <Button variant="gold" className="w-full shadow-sm sm:w-auto">
            {cta} <ArrowRight className="size-4 rtl:rotate-180" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function ValueCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="group card-hover relative overflow-hidden rounded-xl border border-border bg-white p-6 text-center shadow-card hover:border-gold/40">
      {/* Top gold bar accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent transition-all duration-300 group-hover:via-gold" />
      <h3 className="text-base font-bold text-forest transition-colors duration-300 group-hover:text-gold-600">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-forest/65">{desc}</p>
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  detail,
}: {
  quote: string;
  name: string;
  detail: string;
}) {
  return (
    <figure className="card-hover relative flex flex-col rounded-2xl border border-border bg-white p-8 shadow-card hover:border-gold/40">
      <Quote aria-hidden className="size-7 text-gold/50" strokeWidth={1.5} />
      <div className="mt-3 flex gap-0.5" role="img" aria-label="Rated 5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} aria-hidden className="size-4 fill-gold text-gold" />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 font-accent text-base italic leading-relaxed text-forest/80">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 border-t border-border pt-4">
        <p className="text-sm font-bold text-forest">{name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
      </figcaption>
    </figure>
  );
}
