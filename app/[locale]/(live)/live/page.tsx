import { setRequestLocale } from "next-intl/server";
import { Instagram, Video, CalendarClock, Radio } from "lucide-react";
import { getActiveOrNextLive, getLiveFeaturedProducts } from "@/lib/services/content";
import { LivePlayer } from "@/components/live/live-player";
import { NotifyButton } from "@/components/live/notify-button";
import { ProductCard } from "@/components/shop/product-card";
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
    <div className="container-page py-12">
      <header className="max-w-2xl">
        <p className="eyebrow inline-flex items-center gap-2">
          <Radio className="size-4 text-terracotta" /> Live Shopping
        </p>
        <h1 className="mt-2 text-4xl font-bold">{live?.title ?? "Live with Healteen Care"}</h1>
        {live?.description && <p className="mt-3 text-forest/70">{live.description}</p>}
      </header>

      {isLive && live ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <LivePlayer youtubeUrl={live.youtube_url} />
            <div className="mt-4 flex flex-wrap gap-3">
              {live.instagram_url && (
                <a href={live.instagram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream">
                  <Instagram className="size-4" /> Also live on Instagram
                </a>
              )}
              {live.meeting_url && (
                <a href={live.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-forest/30 px-4 py-2 text-sm font-semibold text-forest">
                  <Video className="size-4" /> Join the call
                </a>
              )}
            </div>
          </div>

          <aside>
            <h2 className="mb-3 text-lg font-bold">Featured in this live</h2>
            {featured.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-cream p-6 text-center text-sm text-forest/60">
                Products will appear here during the live.
              </p>
            ) : (
              <div className="grid gap-4">
                {featured.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8">
            <CalendarClock className="size-10 text-nature" />
            {live?.status === "scheduled" && live.scheduled_at ? (
              <>
                <h2 className="mt-4 text-2xl font-bold">Upcoming live session</h2>
                <p className="mt-2 text-forest/75">
                  {new Date(live.scheduled_at).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-4 text-2xl font-bold">No live session right now</h2>
                <p className="mt-2 text-forest/75">
                  Subscribe and we'll let you know the moment we go live to shop and chat together.
                </p>
              </>
            )}
          </div>
          <NotifyButton />
        </div>
      )}
    </div>
  );
}
