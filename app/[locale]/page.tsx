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
      <section className="relative overflow-hidden bg-gradient-to-b from-cream to-[#EFEADD]">
        <div className="container-page grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <p className="eyebrow">{t("hero.eyebrow")}</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-forest md:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-forest/75">{t("hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop">
                <Button size="lg">
                  {t("hero.ctaShop")} <ArrowRight />
                </Button>
              </Link>
              <Link href="/consultation">
                <Button size="lg" variant="outline">
                  {t("hero.ctaConsult")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero visual placeholder (real botanical imagery added later) */}
          <div className="relative aspect-square w-full max-w-md justify-self-center rounded-2xl bg-gradient-to-br from-nature/15 via-mint/10 to-gold/15 shadow-soft lg:max-w-lg">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <Leaf className="size-16 text-nature" strokeWidth={1.2} />
              <p className="font-accent text-xl italic text-forest/70">
                {t("hero.eyebrow")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust signals ── */}
      <section className="border-y border-border bg-cream">
        <div className="container-page py-10">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <TrustItem icon={<ShieldCheck />} label={t("trust.gmp")} />
            <TrustItem icon={<FlaskConical />} label={t("trust.lab")} />
            <TrustItem icon={<BadgeCheck />} label={t("trust.thirdParty")} />
            <TrustItem icon={<Stethoscope />} label={t("trust.doctor")} />
          </div>
        </div>
      </section>

      {/* ── Wellness Line featured band (warm HONEY panel + photo) ── */}
      <section className="bg-honey">
        <div className="container-page grid items-stretch gap-0 md:grid-cols-2">
          <div className="flex flex-col justify-center py-16 md:pr-12">
            <p className="font-accent text-lg italic text-forest/70">Featured collection</p>
            <h2 className="mt-2 text-4xl font-bold text-forest md:text-5xl">The Wellness Line</h2>
            <p className="mt-4 max-w-md text-forest/80">
              Our lab-tested herbal essentials — oils, drops, teas and supplements — crafted to
              help support pain relief, calm, and healthy aging.
            </p>
            <Link href="/shop" className="mt-7 inline-block">
              <Button size="lg" variant="primary">
                Shop the collection <ArrowRight />
              </Button>
            </Link>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-2xl md:my-8 md:min-h-[420px]">
            <Image
              src="/wellness-line.png"
              alt="Healteen Care wellness line"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Two shopping paths (brand guide) ── */}
      <section className="container-page py-20">
        <h2 className="text-center text-3xl font-bold">{t("paths.title")}</h2>
        <div className="gold-divider mx-auto mt-4 max-w-xs" />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
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
      <section className="bg-[#EFEADD]">
        <div className="container-page grid gap-6 py-20 md:grid-cols-2">
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
      <section className="container-page py-20">
        <div className="mb-12 text-center">
          <Sparkles className="mx-auto size-7 text-gold" />
          <h2 className="mt-3 text-3xl font-bold">{t("values.title")}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <ValueCard title={t("values.wisdom")} desc={t("values.wisdomDesc")} />
          <ValueCard title={t("values.aging")} desc={t("values.agingDesc")} />
          <ValueCard title={t("values.natural")} desc={t("values.naturalDesc")} />
          <ValueCard title={t("values.pain")} desc={t("values.painDesc")} />
          <ValueCard title={t("values.quality")} desc={t("values.qualityDesc")} />
        </div>
      </section>

      {/* ── Newsletter CTA (bright lime on dark) ── */}
      <section className="bg-forest-700">
        <div className="container-page py-16">
          <div className="overflow-hidden rounded-3xl bg-lime px-8 py-12 md:px-14 md:py-16">
            <p className="font-accent text-lg italic text-forest/70">Stay well, stay informed</p>
            <h2 className="mt-2 max-w-2xl text-4xl font-bold leading-tight text-forest md:text-5xl">
              Get the latest herbal wellness insights
            </h2>
            <p className="mt-4 max-w-xl text-forest/80">
              Pain-relief tips, safe-use guides, seasonal wellness advice and new product launches —
              straight to you.
            </p>
            <Link href="/register" className="mt-8 inline-block">
              <Button size="lg" className="rounded-md bg-[#101010] px-10 font-bold uppercase tracking-wide text-white hover:bg-black">
                Sign up now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 text-forest">
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
      className="group rounded-2xl border border-border bg-card p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="flex size-14 items-center justify-center rounded-xl bg-nature/10 text-nature">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-forest/70">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-nature group-hover:gap-2 transition-all">
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
    <div className="flex flex-col rounded-2xl bg-card p-8 shadow-card">
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="mt-2 text-2xl font-bold">{title}</h3>
      <p className="mt-3 flex-1 text-forest/70">{desc}</p>
      <Link href={href} className="mt-6">
        <Button variant="gold">
          {cta} <ArrowRight />
        </Button>
      </Link>
    </div>
  );
}

function ValueCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center shadow-card">
      <h3 className="text-base font-bold text-forest">{title}</h3>
      <p className="mt-2 text-sm text-forest/65">{desc}</p>
    </div>
  );
}
