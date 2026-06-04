// Lightweight domain types used across the UI. (Until Supabase-generated
// types are wired, services cast query results to these shapes.)

export type ProductType =
  | "tablet"
  | "herbal_tea"
  | "oil"
  | "cream"
  | "drops"
  | "supplement"
  | "pain_relief_equipment"
  | "medical_device"
  | "fitness"
  | "skin_body";

export type TrustBadge = "gmp" | "lab_tested" | "third_party" | "doctor_approved";

export interface Taxonomy {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  type: ProductType;
  price_cents: number;
  currency: string;
  size: string | null;
  short_description: string | null;
  history: string | null;
  benefits: string | null;
  symptoms_supported: string | null;
  how_to_use: string | null;
  contraindications: string | null;
  ingredients: string | null;
  trust_badges: TrustBadge[];
  images: string[];
  lab_doc_url: string | null;
  stock_qty: number;
  is_active: boolean;
}

export interface Condition {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  symptoms: string | null;
  usage_notes: string | null;
  who_should_not_use: string | null;
  image_url: string | null;
}

export interface ConditionWithProducts extends Condition {
  products: Array<Pick<Product, "id" | "slug" | "name" | "price_cents" | "currency" | "images" | "type"> & {
    usage_instructions: string | null;
  }>;
}
