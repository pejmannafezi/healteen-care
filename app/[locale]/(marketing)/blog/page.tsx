import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Newspaper, CalendarDays, ArrowRight, Leaf } from "lucide-react";
import { getPublishedBlogPosts } from "@/lib/services/content";

export const metadata = { title: "Blog" };

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const posts = await getPublishedBlogPosts();

  return (
    <>
      {/* Page header band */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-cream to-[#EFEADD]/40">
        <div aria-hidden className="pointer-events-none absolute -top-16 -end-20 opacity-[0.04]">
          <Leaf className="size-80 text-forest" strokeWidth={0.75} />
        </div>
        <div className="container-page relative py-14 md:py-20">
          <div className="max-w-2xl animate-fade-up">
            <p className="eyebrow">Blog</p>
            <h1 className="mt-2 text-balance text-4xl font-bold text-forest md:text-5xl">
              Herbal wellness insights
            </h1>
            <div className="gold-divider mt-5 max-w-[12rem]" />
            <p className="mt-5 text-lg leading-relaxed text-forest/70">
              Pain-relief tips, herbal medicine history, safe-use guides and seasonal wellness advice.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page py-14">
        {posts.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border bg-cream p-12 text-center">
            <Newspaper aria-hidden className="mx-auto size-10 text-nature/40" strokeWidth={1.2} />
            <p className="mt-4 font-semibold text-forest">Articles are coming soon.</p>
            <p className="mt-1 text-sm text-forest/60">
              We&rsquo;re writing our first wellness guides — check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group card-hover flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-nature/10 to-mint/10">
                  {p.cover_image ? (
                    <Image
                      src={p.cover_image}
                      alt={p.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Newspaper className="size-10 text-nature/40" strokeWidth={1.2} />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  {p.published_at && (
                    <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <CalendarDays aria-hidden className="size-3.5 text-gold-600" />
                      {new Date(p.published_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </p>
                  )}
                  <h2 className="mt-2 text-lg font-bold leading-snug text-forest transition-colors duration-300 group-hover:text-nature">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-forest/65">
                      {p.excerpt}
                    </p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 transition-all duration-300 group-hover:gap-2.5">
                    Read article <ArrowRight className="size-4 rtl:rotate-180" />
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
