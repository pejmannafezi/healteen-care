"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function num(v: FormDataEntryValue | null, fallback = 0) {
  const n = parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

export async function updateConsultationSettings(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();
  await db
    .from("consultation_settings")
    .update({
      price_cents: Math.round(num(formData.get("price")) * 100),
      duration_min: Math.round(num(formData.get("duration_min"), 30)),
      video_link: String(formData.get("video_link") ?? "").trim() || null,
      phone_note: String(formData.get("phone_note") ?? "").trim() || null,
      is_enabled: formData.get("is_enabled") === "on",
    })
    .eq("id", 1);
  revalidatePath("/admin/consultations");
  revalidatePath("/consultation");
}

export async function addSlot(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();

  const startRaw = String(formData.get("starts_at") ?? "").trim();
  if (!startRaw) return;
  const start = new Date(startRaw);
  if (isNaN(start.getTime())) return;

  const { data: settings } = await db.from("consultation_settings").select("duration_min").eq("id", 1).single();
  const duration = settings?.duration_min ?? 30;
  const end = new Date(start.getTime() + duration * 60_000);

  await db.from("availability_slots").insert({
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
  });
  revalidatePath("/admin/consultations");
  revalidatePath("/consultation");
}

export async function deleteSlot(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await db.from("availability_slots").delete().eq("id", id).eq("is_booked", false);
    revalidatePath("/admin/consultations");
    revalidatePath("/consultation");
  }
}
