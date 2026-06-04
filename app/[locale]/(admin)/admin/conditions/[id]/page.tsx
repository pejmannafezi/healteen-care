import { Link } from "@/i18n/navigation";
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
      <Link href="/admin/conditions" className="text-sm text-nature hover:underline">← Back to conditions</Link>
      <h2 className="mb-6 mt-2 text-2xl font-bold">{isNew ? "Add condition" : "Edit condition"}</h2>
      <ConditionForm
        condition={condition}
        products={products.map((p) => ({ id: p.id, name: p.name }))}
        selectedProductIds={selectedProductIds}
      />
    </div>
  );
}
