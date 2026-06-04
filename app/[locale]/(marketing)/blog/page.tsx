import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Newspaper } from "lucide-react";
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
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Blog</p>
        <h1 className="mt-2 text-4xl font-bold">Herbal wellness insights</h1>
        <p className="mt-3 text-forest/70">
          Pain-relief tips, herbal medicine history, safe-use guides and seasonal wellness advice.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="mt-12 rounded-xl border border-dashed border-border bg-cream p-8 text-center text-forest/60">
          Articles are coming soon.
        </p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-nature/10 to-mint/10">
                {p.cover_image ? (
                  <Image src={p.cover_image} alt={p.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Newspaper className="size-10 text-nature/40" strokeWidth={1.2} />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold text-forest">{p.title}</h2>
                {p.excerpt && <p className="mt-1 line-clamp-2 text-sm text-forest/65">{p.excerpt}</p>}
                {p.published_at && (
                  <p className="mt-3 text-xs text-forest/50">
                    {new Date(p.published_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
