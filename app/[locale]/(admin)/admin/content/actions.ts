"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "site-content";

/** Text keys the admin can edit, per locale. Keep in sync with the form + the pages. */
const TEXT_KEYS = [
  "hero.eyebrow",
  "hero.title",
  "hero.subtitle",
  "hero.ctaShop",
  "hero.ctaConsult",
  "hero.chip",
  "wellness.eyebrow",
  "wellness.title",
  "wellness.body",
  "about.eyebrow",
  "about.heading",
  "about.body",
  "shop.eyebrow",
  "shop.title",
  "shop.subtitle",
] as const;

const LOCALES = ["en", "fa"] as const;

async function ensureBucket(db: ReturnType<typeof createSupabaseAdminClient>) {
  const { data } = await db.storage.getBucket(BUCKET);
  if (!data) await db.storage.createBucket(BUCKET, { public: true, fileSizeLimit: "12MB" });
}

async function upload(db: ReturnType<typeof createSupabaseAdminClient>, file: File, prefix: string) {
  await ensureBucket(db);
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${prefix}/${Date.now()}.${ext}`;
  const { error } = await db.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (error) return null;
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function saveSiteContent(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();
  const now = new Date().toISOString();

  // Upsert all text values (one row per key + locale).
  const rows = LOCALES.flatMap((locale) =>
    TEXT_KEYS.map((key) => ({
      key,
      locale,
      text_value: String(formData.get(`${locale}__${key}`) ?? "").trim() || null,
      updated_at: now,
    }))
  );
  await db.from("site_content").upsert(rows, { onConflict: "key,locale" });

  // Hero image is shared across locales (stored under locale "_").
  const img = formData.get("heroImage");
  if (img instanceof File && img.size > 0) {
    const url = await upload(db, img, "hero");
    if (url) {
      await db
        .from("site_content")
        .upsert({ key: "hero.image", locale: "_", image_url: url, updated_at: now }, { onConflict: "key,locale" });
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
}
