"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "about"; // no mime restriction → accepts images + PDF

async function ensureBucket(db: ReturnType<typeof createSupabaseAdminClient>) {
  const { data } = await db.storage.getBucket(BUCKET);
  if (!data) await db.storage.createBucket(BUCKET, { public: true, fileSizeLimit: "12MB" });
}

async function upload(db: ReturnType<typeof createSupabaseAdminClient>, file: File, prefix: string) {
  if (!file || file.size === 0) return null;
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

export async function saveAbout(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();

  const headline = String(formData.get("headline") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim() || null;

  const update: Record<string, unknown> = { headline, body };

  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    const url = await upload(db, imageFile, "img");
    if (url) update.image_url = url;
  }
  const resumeFile = formData.get("resume");
  if (resumeFile instanceof File && resumeFile.size > 0) {
    const url = await upload(db, resumeFile, "resume");
    if (url) update.resume_url = url;
  }

  await db.from("about_content").update(update).eq("id", 1);
  revalidatePath("/about");
  revalidatePath("/admin/about");
}
