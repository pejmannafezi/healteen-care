import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Condition, ConditionWithProducts } from "@/lib/types";

export async function getConditions(): Promise<Condition[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("conditions")
    .select("id, slug, name, description, symptoms, usage_notes, who_should_not_use, image_url")
    .eq("is_published", true)
    .order("name");
  return (data ?? []) as Condition[];
}

export async function getConditionBySlug(
  slug: string
): Promise<ConditionWithProducts | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("conditions")
    .select(
      `id, slug, name, description, symptoms, usage_notes, who_should_not_use, image_url,
       condition_products(usage_instructions,
         products(id, slug, name, price_cents, currency, images, type))`
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) return null;

  const products = (data.condition_products ?? [])
    .map((cp: { usage_instructions: string | null; products: unknown }) => {
      const p = cp.products as ConditionWithProducts["products"][number] | null;
      return p ? { ...p, usage_instructions: cp.usage_instructions } : null;
    })
    .filter(Boolean) as ConditionWithProducts["products"];

  const { condition_products: _omit, ...condition } = data;
  return { ...(condition as Condition), products };
}
