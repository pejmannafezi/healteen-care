import "server-only";
import type { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof createSupabaseAdminClient>;

const IMG_MIME = ["image/png", "image/jpeg", "image/webp", "image/avif"];
const MEDIA_MIME = [...IMG_MIME, "video/mp4", "video/webm", "video/quicktime"];

/** Create a public bucket if missing. */
export async function ensurePublicBucket(db: Admin, name: string, allowVideo = false) {
  const { data } = await db.storage.getBucket(name);
  if (!data) {
    await db.storage.createBucket(name, {
      public: true,
      allowedMimeTypes: allowVideo ? MEDIA_MIME : IMG_MIME,
      fileSizeLimit: allowVideo ? "50MB" : "6MB",
    });
  }
}

/** Upload a File to a public bucket and return its public URL (or null). */
export async function uploadToBucket(
  db: Admin,
  bucket: string,
  file: File,
  prefix = "",
  allowVideo = false
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  await ensurePublicBucket(db, bucket, allowVideo);
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${prefix ? prefix + "/" : ""}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await db.storage.from(bucket).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) return null;
  return db.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
