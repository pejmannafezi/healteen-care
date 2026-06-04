"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateSocialContent } from "@/lib/agents/social";

const PLATFORMS = ["instagram", "tiktok", "email", "blog"];

export async function generateDraft(formData: FormData) {
  await requireAdmin();
  const platform = String(formData.get("platform") ?? "instagram");
  const topic = String(formData.get("topic") ?? "").trim().slice(0, 300);
  if (!PLATFORMS.includes(platform) || topic.length < 3) return;

  const content = await generateSocialContent(platform, topic);

  const db = createSupabaseAdminClient();
  await db.from("social_posts").insert({ platform, title: topic, content, status: "draft" });
  revalidatePath("/admin/social");
}

export async function approveDraft(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const db = createSupabaseAdminClient();
    await db.from("social_posts").update({ status: "approved" }).eq("id", id);
    revalidatePath("/admin/social");
  }
}

export async function deleteDraft(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const db = createSupabaseAdminClient();
    await db.from("social_posts").delete().eq("id", id);
    revalidatePath("/admin/social");
  }
}
