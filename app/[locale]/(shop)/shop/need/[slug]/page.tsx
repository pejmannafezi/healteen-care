import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getProductsByNeedSlug } from "@/lib/services/catalog";
import { ProductCard } from "@/components/shop/product-card";
import { Link } from "@/i18n/navigation";

export default async function NeedPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const result = await getProductsByNeedSlug(slug);
  if (!result) notFound();

  const { need, products } = result;

  return (
    <div className="bg-honey">
    <div className="container-page py-14">
      <Link href="/shop" className="text-sm text-nature hover:underline">
        ← Back to shop
      </Link>
      <p className="eyebrow mt-3 text-forest/70">Shop by Health Need</p>
      <h1 className="mt-1 text-4xl font-bold">{need.name}</h1>
      {need.description && <p className="mt-2 text-forest/70">{need.description}</p>}

      {products.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border bg-cream p-8 text-center text-forest/60">
          No products for this need yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
