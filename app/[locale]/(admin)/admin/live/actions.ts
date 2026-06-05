"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyLiveStarted } from "@/lib/live/notify";

function revalidateLive() {
  revalidatePath("/admin/live");
  revalidatePath("/live");
  revalidatePath("/");
}

export async function createLiveSession(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();

  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2) throw new Error("Title is required");
  const scheduledRaw = String(formData.get("scheduled_at") ?? "").trim();

  const { data: session, error } = await db
    .from("live_sessions")
    .insert({
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      scheduled_at: scheduledRaw ? new Date(scheduledRaw).toISOString() : null,
      youtube_url: String(formData.get("youtube_url") ?? "").trim() || null,
      instagram_url: String(formData.get("instagram_url") ?? "").trim() || null,
      meeting_url: String(formData.get("meeting_url") ?? "").trim() || null,
      status: "scheduled",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const productIds = formData.getAll("products").map(String).filter(Boolean);
  if (productIds.length) {
    await db.from("live_featured_products").insert(
      productIds.map((product_id) => ({ live_session_id: session.id, product_id }))
    );
  }
  revalidateLive();
}

export async function goLive(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: cur } = await db
    .from("live_sessions")
    .select("status, title, description")
    .eq("id", id)
    .single();

  const youtube = String(formData.get("youtube_url") ?? "").trim();
  const update: Record<string, unknown> = { status: "live" };
  if (youtube) update.youtube_url = youtube;
  await db.from("live_sessions").update(update).eq("id", id);

  // Notify subscribers only on the transition into live.
  if (cur && cur.status !== "live") {
    await notifyLiveStarted({ title: cur.title, description: cur.description });
  }
  revalidateLive();
}

export async function endLive(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await db.from("live_sessions").update({ status: "ended" }).eq("id", id);
    revalidateLive();
  }
}

export async function deleteLiveSession(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await db.from("live_sessions").delete().eq("id", id);
    revalidateLive();
  }
}
