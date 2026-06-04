"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { uploadToBucket } from "@/lib/storage";

export async function addStory(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();

  const file = formData.get("media");
  if (!(file instanceof File) || file.size === 0) throw new Error("Please choose an image or video.");

  const url = await uploadToBucket(db, "stories", file, "", true);
  if (!url) throw new Error("Upload failed.");

  const media_type = (file.type || "").startsWith("video") ? "video" : "image";
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const link_url = String(formData.get("link_url") ?? "").trim() || null;

  // Keep ordering stable by appending.
  const { count } = await db.from("stories").select("id", { count: "exact", head: true });

  await db.from("stories").insert({
    media_url: url,
    media_type,
    caption,
    link_url,
    sort_order: count ?? 0,
    is_active: true,
  });

  revalidatePath("/admin/stories");
  revalidatePath("/");
}

export async function deleteStory(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await db.from("stories").delete().eq("id", id);
    revalidatePath("/admin/stories");
    revalidatePath("/");
  }
}
