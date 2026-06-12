import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { adminListProducts } from "@/lib/services/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ConditionForm } from "@/components/admin/condition-form";

export default async function ConditionEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  const db = createSupabaseAdminClient();

  const [products, condition] = await Promise.all([
    adminListProducts(),
    isNew ? Promise.resolve(null) : db.from("conditions").select("*").eq("id", id).single().then((r) => r.data),
  ]);

  let selectedProductIds: string[] = [];
  if (!isNew) {
    const { data } = await db.from("condition_products").select("product_id").eq("condition_id", id);
    selectedProductIds = (data ?? []).map((r) => r.product_id);
  }

  return (
    <div>
      <Link
        href="/admin/conditions"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full text-sm font-medium text-nature transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-3.5 rtl:rotate-180" /> Back to conditions
      </Link>
      <h2 className="mb-1 mt-2 text-2xl font-bold text-forest">{isNew ? "Add condition" : "Edit condition"}</h2>
      <div className="gold-divider mb-6 mt-3 max-w-[10rem]" />
      <ConditionForm
        condition={condition}
        products={products.map((p) => ({ id: p.id, name: p.name }))}
        selectedProductIds={selectedProductIds}
      />
    </div>
  );
}
