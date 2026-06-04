"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

function num(v: FormDataEntryValue | null, fallback = 0) {
  const n = parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

export async function saveWebinar(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();

  const id = String(formData.get("id") ?? "").trim();
  const isNew = !id || id === "new";
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2) throw new Error("Title is required");

  const slug = slugify(String(formData.get("slug") ?? "") || title) || `class-${Date.now()}`;
  const scheduledRaw = String(formData.get("scheduled_at") ?? "").trim();

  const row = {
    title,
    slug,
    description: String(formData.get("description") ?? "").trim() || null,
    scheduled_at: scheduledRaw ? new Date(scheduledRaw).toISOString() : null,
    duration_min: Math.round(num(formData.get("duration_min"), 60)) || null,
    price_cents: Math.round(num(formData.get("price")) * 100),
    capacity: Math.round(num(formData.get("capacity"))) || null,
    recording_url: String(formData.get("recording_url") ?? "").trim() || null,
    is_published: formData.get("is_published") === "on",
  };

  if (isNew) {
    const { error } = await db.from("webinars").insert(row);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await db.from("webinars").update(row).eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/webinars");
  revalidatePath("/webinars");
  redirect("/admin/webinars");
}

export async function deleteWebinar(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await db.from("webinars").delete().eq("id", id);
    revalidatePath("/admin/webinars");
    revalidatePath("/webinars");
  }
}
