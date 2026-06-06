import { supabase } from "./supabase";

// Mirrors the website's lib/services/catalog.ts field sets.
const CARD_FIELDS =
  "id, slug, name, type, price_cents, currency, short_description, images, trust_badges, stock_qty";
const PRODUCT_FIELDS =
  "id, slug, name, type, price_cents, currency, size, short_description, history, benefits, symptoms_supported, how_to_use, contraindications, ingredients, trust_badges, images, stock_qty";

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  type: string;
  price_cents: number;
  currency: string;
  short_description: string | null;
  images: string[];
  trust_badges: string[];
  stock_qty: number;
};

export type Product = ProductCard & {
  size: string | null;
  history: string | null;
  benefits: string | null;
  symptoms_supported: string | null;
  how_to_use: string | null;
  contraindications: string | null;
  ingredients: string | null;
};

export async function fetchProducts(): Promise<ProductCard[]> {
  const { data, error } = await supabase
    .from("products")
    .select(CARD_FIELDS)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProductCard[];
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("id", id)
    .single();
  if (error) throw error;
  return (data as Product) ?? null;
}
