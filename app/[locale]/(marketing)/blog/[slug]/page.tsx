import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, CalendarDays, Leaf } from "lucide-react";
import { getBlogPost } from "@/lib/services/content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  return { title: post?.title ?? "Article" };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <article className="container-page max-w-3xl py-14 md:py-20">
      <Link
        href="/blog"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-nature transition-colors hover:text-forest focus-visible:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" /> Back to blog
      </Link>

      <header className="mt-6 animate-fade-up">
        <h1 className="text-balance text-4xl font-bold leading-tight text-forest md:text-5xl">
          {post.title}
        </h1>
        {post.published_at && (
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays aria-hidden className="size-4 text-gold-600" />
            {new Date(post.published_at).toLocaleDateString("en-US", { dateStyle: "long" })}
          </p>
        )}
        <div className="gold-divider mt-6" />
      </header>

      {post.cover_image && (
        <div className="surface-glass mt-8 rounded-3xl p-2.5">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              sizes="(max-width:768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      <div className="mt-10 max-w-[70ch] whitespace-pre-line text-lg leading-relaxed text-forest/85">
        {post.content}
      </div>

      <aside className="mt-14 flex gap-4 rounded-2xl border border-border bg-cream p-6">
        <Leaf aria-hidden className="mt-0.5 size-5 shrink-0 text-nature/60" strokeWidth={1.5} />
        <p className="text-xs leading-relaxed text-forest/60">
          This content is educational and not medical advice. Herbal products are intended to support
          general wellness and are not intended to diagnose, treat, cure, or prevent any disease.
        </p>
      </aside>
    </article>
  );
}
