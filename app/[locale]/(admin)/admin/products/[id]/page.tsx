import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { adminGetProduct, adminTaxonomies } from "@/lib/services/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/product-form";

export default async function ProductEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  const [{ categories, needs }, product] = await Promise.all([
    adminTaxonomies(),
    isNew ? Promise.resolve(null) : adminGetProduct(id),
  ]);

  let selectedCategoryIds: string[] = [];
  let selectedNeedIds: string[] = [];
  if (!isNew && product) {
    const db = createSupabaseAdminClient();
    const [{ data: cm }, { data: nm }] = await Promise.all([
      db.from("product_category_map").select("category_id").eq("product_id", id),
      db.from("product_health_need_map").select("health_need_id").eq("product_id", id),
    ]);
    selectedCategoryIds = (cm ?? []).map((r) => r.category_id);
    selectedNeedIds = (nm ?? []).map((r) => r.health_need_id);
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full text-sm font-medium text-nature transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-3.5 rtl:rotate-180" /> Back to products
      </Link>
      <h2 className="mb-1 mt-2 text-2xl font-bold text-forest">{isNew ? "Add product" : "Edit product"}</h2>
      <div className="gold-divider mb-6 mt-3 max-w-[10rem]" />
      <ProductForm
        product={product}
        categories={categories}
        needs={needs}
        selectedCategoryIds={selectedCategoryIds}
        selectedNeedIds={selectedNeedIds}
      />
    </div>
  );
}
