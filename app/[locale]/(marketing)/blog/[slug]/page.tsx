import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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
    <article className="container-page max-w-3xl py-14">
      <Link href="/blog" className="text-sm text-nature hover:underline">← Back to blog</Link>
      <h1 className="mt-4 text-4xl font-bold leading-tight">{post.title}</h1>
      {post.published_at && (
        <p className="mt-2 text-sm text-forest/50">
          {new Date(post.published_at).toLocaleDateString("en-US", { dateStyle: "long" })}
        </p>
      )}
      {post.cover_image && (
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border">
          <Image src={post.cover_image} alt={post.title} fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" priority />
        </div>
      )}
      <div className="mt-8 whitespace-pre-line text-lg leading-relaxed text-forest/85">
        {post.content}
      </div>

      <div className="mt-12 rounded-xl bg-cream p-6 text-xs leading-relaxed text-forest/60">
        This content is educational and not medical advice. Herbal products are intended to support
        general wellness and are not intended to diagnose, treat, cure, or prevent any disease.
      </div>
    </article>
  );
}
