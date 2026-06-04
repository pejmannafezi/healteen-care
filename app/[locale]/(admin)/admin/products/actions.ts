"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

const BUCKET = "product-images";

const PRODUCT_TYPES = [
  "tablet", "herbal_tea", "oil", "cream", "drops", "supplement",
  "pain_relief_equipment", "medical_device", "fitness", "skin_body",
] as const;

const productSchema = z.object({
  name: z.string().min(2).max(160),
  type: z.enum(PRODUCT_TYPES),
  priceDollars: z.number().min(0).max(100000),
  size: z.string().max(160).optional(),
  short_description: z.string().max(400).optional(),
  history: z.string().max(4000).optional(),
  benefits: z.string().max(4000).optional(),
  symptoms_supported: z.string().max(4000).optional(),
  how_to_use: z.string().max(4000).optional(),
  contraindications: z.string().max(4000).optional(),
  ingredients: z.string().max(4000).optional(),
  stock_qty: z.number().int().min(0).max(1000000),
  low_stock_threshold: z.number().int().min(0).max(100000),
});

async function ensureBucket(db: ReturnType<typeof createSupabaseAdminClient>) {
  const { data } = await db.storage.getBucket(BUCKET);
  if (!data) {
    await db.storage.createBucket(BUCKET, {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/avif"],
      fileSizeLimit: "6MB",
    });
  }
}

function num(v: FormDataEntryValue | null, fallback = 0) {
  const n = parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();

  const id = String(formData.get("id") ?? "").trim();
  const isNew = !id || id === "new";

  const parsed = productSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    type: String(formData.get("type") ?? ""),
    priceDollars: num(formData.get("price")),
    size: String(formData.get("size") ?? "") || undefined,
    short_description: String(formData.get("short_description") ?? "") || undefined,
    history: String(formData.get("history") ?? "") || undefined,
    benefits: String(formData.get("benefits") ?? "") || undefined,
    symptoms_supported: String(formData.get("symptoms_supported") ?? "") || undefined,
    how_to_use: String(formData.get("how_to_use") ?? "") || undefined,
    contraindications: String(formData.get("contraindications") ?? "") || undefined,
    ingredients: String(formData.get("ingredients") ?? "") || undefined,
    stock_qty: Math.round(num(formData.get("stock_qty"))),
    low_stock_threshold: Math.round(num(formData.get("low_stock_threshold"), 5)),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid product data");
  }
  const v = parsed.data;

  const trust_badges = formData.getAll("trust_badges").map(String);
  const is_active = formData.get("is_active") === "on";
  const categoryIds = formData.getAll("categories").map(String).filter(Boolean);
  const needIds = formData.getAll("needs").map(String).filter(Boolean);

  // Slug: keep existing on edit, otherwise derive from name.
  const providedSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(providedSlug || v.name) || `product-${Date.now()}`;

  // Images = kept existing + newly uploaded files.
  const existing = formData.getAll("existing_images").map(String).filter(Boolean);
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  await ensureBucket(db);
  const uploaded: string[] = [];
  for (const file of files) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await db.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (!error) {
      const { data } = db.storage.from(BUCKET).getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }
  }
  const images = [...existing, ...uploaded];

  const row = {
    name: v.name,
    slug,
    type: v.type,
    price_cents: Math.round(v.priceDollars * 100),
    size: v.size ?? null,
    short_description: v.short_description ?? null,
    history: v.history ?? null,
    benefits: v.benefits ?? null,
    symptoms_supported: v.symptoms_supported ?? null,
    how_to_use: v.how_to_use ?? null,
    contraindications: v.contraindications ?? null,
    ingredients: v.ingredients ?? null,
    trust_badges,
    images,
    stock_qty: v.stock_qty,
    low_stock_threshold: v.low_stock_threshold,
    is_active,
  };

  let productId = id;
  if (isNew) {
    const { data, error } = await db.from("products").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    productId = data.id;
  } else {
    const { error } = await db.from("products").update(row).eq("id", id);
    if (error) throw new Error(error.message);
  }

  // Sync category / health-need maps.
  await db.from("product_category_map").delete().eq("product_id", productId);
  await db.from("product_health_need_map").delete().eq("product_id", productId);
  if (categoryIds.length) {
    await db.from("product_category_map").insert(categoryIds.map((category_id) => ({ product_id: productId, category_id })));
  }
  if (needIds.length) {
    await db.from("product_health_need_map").insert(needIds.map((health_need_id) => ({ product_id: productId, health_need_id })));
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await db.from("products").delete().eq("id", id);
    revalidatePath("/admin/products");
    revalidatePath("/shop");
  }
}
