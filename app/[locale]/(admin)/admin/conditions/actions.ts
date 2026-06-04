"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

const BUCKET = "condition-images";

const schema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().max(4000).optional(),
  symptoms: z.string().max(4000).optional(),
  usage_notes: z.string().max(4000).optional(),
  who_should_not_use: z.string().max(4000).optional(),
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

export async function saveCondition(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();

  const id = String(formData.get("id") ?? "").trim();
  const isNew = !id || id === "new";

  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || undefined,
    symptoms: String(formData.get("symptoms") ?? "") || undefined,
    usage_notes: String(formData.get("usage_notes") ?? "") || undefined,
    who_should_not_use: String(formData.get("who_should_not_use") ?? "") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid data");
  const v = parsed.data;

  const slug = slugify(String(formData.get("slug") ?? "") || v.name) || `condition-${Date.now()}`;
  const is_published = formData.get("is_published") === "on";
  const productIds = formData.getAll("products").map(String).filter(Boolean);

  // Image: keep existing unless a new one is uploaded.
  let image_url = String(formData.get("existing_image") ?? "") || null;
  const file = formData.getAll("image").find((f): f is File => f instanceof File && f.size > 0);
  if (file) {
    await ensureBucket(db);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${slug}/${Date.now()}.${ext}`;
    const { error } = await db.storage.from(BUCKET).upload(path, file, { contentType: file.type || "image/jpeg" });
    if (!error) image_url = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  const row = {
    name: v.name, slug,
    description: v.description ?? null,
    symptoms: v.symptoms ?? null,
    usage_notes: v.usage_notes ?? null,
    who_should_not_use: v.who_should_not_use ?? null,
    image_url, is_published,
  };

  let conditionId = id;
  if (isNew) {
    const { data, error } = await db.from("conditions").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    conditionId = data.id;
  } else {
    const { error } = await db.from("conditions").update(row).eq("id", id);
    if (error) throw new Error(error.message);
  }

  await db.from("condition_products").delete().eq("condition_id", conditionId);
  if (productIds.length) {
    await db.from("condition_products").insert(productIds.map((product_id) => ({ condition_id: conditionId, product_id })));
  }

  revalidatePath("/admin/conditions");
  revalidatePath("/health");
  redirect("/admin/conditions");
}

export async function deleteCondition(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await db.from("conditions").delete().eq("id", id);
    revalidatePath("/admin/conditions");
    revalidatePath("/health");
  }
}
