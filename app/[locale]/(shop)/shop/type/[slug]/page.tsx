import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getProductsByCategorySlug } from "@/lib/services/catalog";
import { ProductCard } from "@/components/shop/product-card";
import { Link } from "@/i18n/navigation";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const result = await getProductsByCategorySlug(slug);
  if (!result) notFound();

  const { category, products } = result;

  return (
    <div className="container-page py-14">
      <Link href="/shop" className="text-sm text-nature hover:underline">
        ← Back to shop
      </Link>
      <h1 className="mt-3 text-4xl font-bold">{category.name}</h1>
      {category.description && <p className="mt-2 text-forest/70">{category.description}</p>}

      {products.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border bg-cream p-8 text-center text-forest/60">
          No products in this category yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
