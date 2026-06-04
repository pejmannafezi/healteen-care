import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product, Taxonomy } from "@/lib/types";

const PRODUCT_FIELDS =
  "id, slug, name, type, price_cents, currency, size, short_description, history, benefits, symptoms_supported, how_to_use, contraindications, ingredients, trust_badges, images, lab_doc_url, stock_qty, is_active";

const CARD_FIELDS =
  "id, slug, name, type, price_cents, currency, short_description, images, trust_badges, stock_qty";

export async function getProductTypes(): Promise<Taxonomy[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("product_categories")
    .select("id, slug, name, description, sort_order")
    .order("sort_order");
  return (data ?? []) as Taxonomy[];
}

export async function getHealthNeeds(): Promise<Taxonomy[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("health_needs")
    .select("id, slug, name, description, sort_order")
    .order("sort_order");
  return (data ?? []) as Taxonomy[];
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(CARD_FIELDS)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return (data ?? []) as Product[];
}

export async function getProductsByCategorySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data: cat } = await supabase
    .from("product_categories")
    .select("id, name, description")
    .eq("slug", slug)
    .single();
  if (!cat) return null;

  const { data } = await supabase
    .from("product_category_map")
    .select(`products!inner(${CARD_FIELDS})`)
    .eq("category_id", cat.id);

  const products = (data ?? [])
    .map((row: { products: unknown }) => row.products as Product)
    .filter((p) => p?.is_active !== false);

  return { category: cat as Taxonomy, products };
}

export async function getProductsByNeedSlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data: need } = await supabase
    .from("health_needs")
    .select("id, name, description")
    .eq("slug", slug)
    .single();
  if (!need) return null;

  const { data } = await supabase
    .from("product_health_need_map")
    .select(`products!inner(${CARD_FIELDS})`)
    .eq("health_need_id", need.id);

  const products = (data ?? []).map((row: { products: unknown }) => row.products as Product);
  return { need: need as Taxonomy, products };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return (data as Product) ?? null;
}
