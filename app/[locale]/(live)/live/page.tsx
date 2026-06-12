import { setRequestLocale } from "next-intl/server";
import { Instagram, Video, CalendarClock, Radio, ShoppingBag } from "lucide-react";
import { getActiveOrNextLive, getLiveFeaturedProducts } from "@/lib/services/content";
import { LivePlayer } from "@/components/live/live-player";
import { NotifyButton } from "@/components/live/notify-button";
import { ProductCard } from "@/components/shop/product-card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";

export const metadata = { title: "Live" };

export default async function LivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const live = await getActiveOrNextLive();
  const isLive = live?.status === "live";
  const featured = isLive && live ? ((await getLiveFeaturedProducts(live.id)) as Product[]) : [];

  return (
    <>
      {/* ── Live hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-cream to-[#EFEADD]/40">
        <div className="container-page py-14 md:py-16">
          <div className="max-w-2xl animate-fade-up">
            {isLive ? (
              <Badge variant="terracotta" className="px-3.5 py-1.5 text-sm uppercase tracking-wide">
                <span className="relative flex size-2.5" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-terracotta" />
                </span>
                Live now
              </Badge>
            ) : (
              <p className="eyebrow inline-flex items-center gap-2">
                <Radio className="size-4 text-terracotta" aria-hidden /> Live Shopping
              </p>
            )}
            <h1 className="mt-3 text-4xl font-bold leading-tight text-forest md:text-5xl">
              {live?.title ?? "Live with Healteen Care"}
            </h1>
            <div className="gold-divider mt-5 max-w-[10rem]" />
            {live?.description && (
              <p className="mt-5 text-lg leading-relaxed text-forest/75">{live.description}</p>
            )}
          </div>
        </div>
      </section>

      <div className="container-page py-12 md:py-14">
        {isLive && live ? (
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
            <div className="animate-fade-up">
              <LivePlayer youtubeUrl={live.youtube_url} />
              <div className="mt-5 flex flex-wrap gap-3">
                {live.instagram_url && (
                  <a
                    href={live.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream shadow-sm transition-all duration-200 hover:bg-forest-700 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                  >
                    <Instagram className="size-4" aria-hidden /> Also live on Instagram
                  </a>
                )}
                {live.meeting_url && (
                  <a
                    href={live.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-forest/30 px-5 py-2.5 text-sm font-semibold text-forest transition-all duration-200 hover:border-forest/50 hover:bg-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                  >
                    <Video className="size-4" aria-hidden /> Join the call
                  </a>
                )}
              </div>
            </div>

            <aside className="animate-fade-in rounded-3xl border border-gold/20 bg-card p-6 shadow-card">
              <h2 className="flex items-center gap-2 text-lg font-bold text-forest">
                <ShoppingBag className="size-5 text-gold-600" aria-hidden />
                Featured in this live
              </h2>
              <div className="gold-divider mt-3" aria-hidden />
              {featured.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-border bg-cream p-6 text-center text-sm text-forest/60">
                  Products will appear here during the live.
                </p>
              ) : (
                <div className="mt-4 grid gap-4">
                  {featured.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </aside>
          </div>
        ) : (
          <div className="grid items-stretch gap-8 lg:grid-cols-2">
            <div className="animate-fade-up relative overflow-hidden rounded-3xl border border-gold/20 bg-card p-8 shadow-card md:p-10">
              <div className="pointer-events-none absolute -end-8 -top-8 opacity-[0.05]" aria-hidden>
                <Radio className="size-48 text-forest" strokeWidth={1} />
              </div>
              <span className="flex size-14 items-center justify-center rounded-2xl bg-nature/10 text-nature">
                <CalendarClock className="size-7" aria-hidden />
              </span>
              {live?.status === "scheduled" && live.scheduled_at ? (
                <>
                  <h2 className="mt-5 text-2xl font-bold text-forest md:text-3xl">
                    Upcoming live session
                  </h2>
                  <p className="mt-3 text-lg font-semibold text-nature">
                    {new Date(live.scheduled_at).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-5 text-2xl font-bold text-forest md:text-3xl">
                    No live session right now
                  </h2>
                  <p className="mt-3 leading-relaxed text-forest/75">
                    Subscribe and we&apos;ll let you know the moment we go live to shop and chat
                    together.
                  </p>
                </>
              )}
            </div>
            <div className="animate-fade-up [animation-delay:120ms]">
              <NotifyButton />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
