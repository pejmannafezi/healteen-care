import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { StoriesBar } from "@/components/site/stories-bar";
import { getStories, getActiveOrNextLive } from "@/lib/services/content";
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
} from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [stories, live] = await Promise.all([getStories(), getActiveOrNextLive()]);
  return (
    <>
      {live?.status === "live" && <LiveBanner title={live.title} />}
      <StoriesBar stories={stories} />
      <HomeContent />
    </>
  );
}

function HomeContent() {
  const t = useTranslations("home");

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream to-[#EFEADD]/40 border-b border-border">
        <div className="container-page grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <p className="eyebrow">{t("hero.eyebrow")}</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-forest md:text-5xl lg:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-forest/75 leading-relaxed">{t("hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" className="rounded-full shadow-sm hover:scale-[1.02] transition-transform">
                  {t("hero.ctaShop")} <ArrowRight className="size-5" />
                </Button>
              </Link>
              <Link href="/consultation">
                <Button size="lg" variant="outline" className="rounded-full hover:scale-[1.02] transition-transform">
                  {t("hero.ctaConsult")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Premium botanical hero image */}
          <div className="relative aspect-square w-full max-w-md justify-self-center rounded-3xl border border-gold/20 p-3 bg-white/40 shadow-soft backdrop-blur-sm lg:max-w-lg transition-transform duration-700 hover:scale-[1.02]">
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
              <Image
                src="/botanical-hero.png"
                alt="Healteen Care natural ingredients"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust signals ── */}
      <section className="bg-white border-b border-border">
        <div className="container-page py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <TrustItem icon={<ShieldCheck />} label={t("trust.gmp")} />
            <TrustItem icon={<FlaskConical />} label={t("trust.lab")} />
            <TrustItem icon={<BadgeCheck />} label={t("trust.thirdParty")} />
            <TrustItem icon={<Stethoscope />} label={t("trust.doctor")} />
          </div>
        </div>
      </section>

      {/* ── Wellness Line featured band (premium honey/cream panel) ── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-cream via-honey/5 to-[#EFEADD]/30 py-20 border-b border-border">
        <div className="container-page grid items-center gap-12 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p className="font-accent text-lg italic text-gold-600">Featured collection</p>
            <h2 className="mt-2 text-4xl font-bold text-forest md:text-5xl">The Wellness Line</h2>
            <p className="mt-5 max-w-md text-lg text-forest/80 leading-relaxed">
              Our lab-tested herbal essentials — oils, drops, teas and supplements — crafted to
              help support pain relief, calm, and healthy aging.
            </p>
            <div className="mt-8">
              <Link href="/shop" className="inline-block">
                <Button size="lg" variant="primary" className="rounded-full shadow-sm hover:scale-[1.02] transition-transform">
                  Shop the collection <ArrowRight />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative min-h-[320px] md:min-h-[460px] overflow-hidden rounded-3xl border border-gold/20 p-2.5 bg-white/40 shadow-soft">
            <div className="relative h-full w-full overflow-hidden rounded-2xl min-h-[300px] md:min-h-[440px]">
              <Image
                src="/wellness-line.png"
                alt="Healteen Care wellness line"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Two shopping paths (brand guide) ── */}
      <section className="container-page py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-forest sm:text-4xl">{t("paths.title")}</h2>
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
      <section className="bg-gradient-to-b from-cream to-white border-t border-border">
        <div className="container-page grid gap-8 py-24 md:grid-cols-2">
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
      <section className="container-page py-24">
        <div className="mb-14 text-center">
          <Sparkles className="mx-auto size-8 text-gold animate-pulse" />
          <h2 className="mt-3 text-3xl font-bold text-forest sm:text-4xl">{t("values.title")}</h2>
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

      {/* ── Newsletter CTA (premium forest on cream layout) ── */}
      <section className="bg-cream border-t border-border">
        <div className="container-page py-20">
          <div className="relative overflow-hidden rounded-3xl bg-forest-700 px-8 py-12 md:px-16 md:py-20 shadow-soft border border-gold/20">
            {/* Background decorative botanical shadow details */}
            <div className="absolute -right-20 -bottom-20 pointer-events-none opacity-[0.03]">
              <Leaf className="size-72 text-cream" strokeWidth={1} />
            </div>

            <div className="relative z-10 max-w-2xl">
              <p className="font-accent text-lg italic text-gold/85">Stay well, stay informed</p>
              <h2 className="mt-2 text-3xl font-bold leading-tight text-cream md:text-5xl">
                Get the latest herbal wellness insights
              </h2>
              <p className="mt-4 text-cream/80 max-w-xl leading-relaxed">
                Pain-relief tips, safe-use guides, seasonal wellness advice and new product launches —
                straight to you.
              </p>
              <div className="mt-8">
                <Link href="/register">
                  <Button size="lg" variant="gold" className="rounded-full px-10 font-bold uppercase tracking-wider hover:scale-[1.02] transition-transform">
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
      <span className="text-gold [&_svg]:size-6">{icon}</span>
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
      className="group relative overflow-hidden rounded-2xl border border-border bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-soft"
    >
      <div className="flex size-14 items-center justify-center rounded-xl bg-nature/10 text-nature transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-bold text-forest transition-colors duration-300 group-hover:text-nature">{title}</h3>
      <p className="mt-2 text-forest/70 leading-relaxed text-sm">{desc}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold transition-all duration-300 group-hover:gap-2.5">
        Explore <ArrowRight className="size-4" />
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
    <div className="flex flex-col rounded-2xl border border-border bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-soft">
      <p className="eyebrow uppercase tracking-wider text-xs font-semibold">{eyebrow}</p>
      <h3 className="mt-2 text-2xl font-bold text-forest">{title}</h3>
      <p className="mt-3 flex-1 text-sm text-forest/70 leading-relaxed">{desc}</p>
      <div className="mt-6">
        <Link href={href}>
          <Button variant="gold" className="w-full sm:w-auto shadow-sm">
            {cta} <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function ValueCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-white p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-soft">
      {/* Top gold bar accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent transition-all duration-300 group-hover:via-gold" />
      <h3 className="text-base font-bold text-forest transition-colors duration-300 group-hover:text-gold">{title}</h3>
      <p className="mt-2 text-xs text-forest/65 leading-relaxed">{desc}</p>
    </div>
  );
}
