import { supabase } from "./supabase";

export type Condition = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  symptoms: string | null;
  usage_notes: string | null;
  who_should_not_use: string | null;
  image_url: string | null;
};

export type ConditionProduct = {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  currency: string;
  images: string[];
  type: string;
  usage_instructions: string | null;
};

export async function fetchConditions(): Promise<Condition[]> {
  const { data, error } = await supabase
    .from("conditions")
    .select("id, slug, name, description, symptoms, usage_notes, who_should_not_use, image_url")
    .eq("is_published", true)
    .order("name");
  if (error) throw error;
  return (data ?? []) as Condition[];
}

export async function fetchCondition(
  id: string
): Promise<{ condition: Condition; products: ConditionProduct[] } | null> {
  const { data, error } = await supabase
    .from("conditions")
    .select(
      `id, slug, name, description, symptoms, usage_notes, who_should_not_use, image_url,
       condition_products(usage_instructions,
         products(id, slug, name, price_cents, currency, images, type))`
    )
    .eq("id", id)
    .eq("is_published", true)
    .single();
  if (error) throw error;
  if (!data) return null;

  const products = (data.condition_products ?? [])
    .map((cp: { usage_instructions: string | null; products: unknown }) => {
      const p = cp.products as Omit<ConditionProduct, "usage_instructions"> | null;
      return p ? { ...p, usage_instructions: cp.usage_instructions } : null;
    })
    .filter(Boolean) as ConditionProduct[];

  const { condition_products: _omit, ...condition } = data as Record<string, unknown>;
  return { condition: condition as unknown as Condition, products };
}
