"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { uploadToBucket } from "@/lib/storage";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().max(50000).optional(),
});

export async function saveBlogPost(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();

  const id = String(formData.get("id") ?? "").trim();
  const isNew = !id || id === "new";

  const parsed = schema.safeParse({
    title: String(formData.get("title") ?? ""),
    excerpt: String(formData.get("excerpt") ?? "") || undefined,
    content: String(formData.get("content") ?? "") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid data");

  const slug = slugify(String(formData.get("slug") ?? "") || parsed.data.title) || `post-${Date.now()}`;
  const is_published = formData.get("is_published") === "on";

  const row: Record<string, unknown> = {
    title: parsed.data.title,
    slug,
    excerpt: parsed.data.excerpt ?? null,
    content: parsed.data.content ?? null,
    is_published,
  };

  const cover = formData.get("cover");
  if (cover instanceof File && cover.size > 0) {
    const url = await uploadToBucket(db, "blog", cover, slug);
    if (url) row.cover_image = url;
  }

  if (isNew) {
    if (is_published) row.published_at = new Date().toISOString();
    const { error } = await db.from("blog_posts").insert(row);
    if (error) throw new Error(error.message);
  } else {
    // Set published_at the first time it's published.
    const { data: existing } = await db.from("blog_posts").select("published_at").eq("id", id).single();
    if (is_published && !existing?.published_at) row.published_at = new Date().toISOString();
    const { error } = await db.from("blog_posts").update(row).eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function deleteBlogPost(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await db.from("blog_posts").delete().eq("id", id);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
  }
}
