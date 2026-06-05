"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTracking, registerTracking, hasShippo } from "@/lib/shippo/client";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

export async function updateOrder(formData: FormData) {
  await requireAdmin();
  const db = createSupabaseAdminClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const status = String(formData.get("status") ?? "");
  const tracking_number = String(formData.get("tracking_number") ?? "").trim() || null;
  const tracking_carrier = String(formData.get("tracking_carrier") ?? "").trim() || null;
  const tracking_status = String(formData.get("tracking_status") ?? "").trim() || null;
  const etaRaw = String(formData.get("eta") ?? "").trim();

  const update: Record<string, unknown> = { tracking_number, tracking_carrier, tracking_status };
  if (STATUSES.includes(status)) update.status = status;
  update.eta = etaRaw ? new Date(etaRaw).toISOString() : null;

  // Enrich with live Shippo tracking when configured and we have number+carrier.
  if (hasShippo() && tracking_number && tracking_carrier) {
    const info = await getTracking(tracking_carrier, tracking_number);
    if (info) {
      update.tracking_status = info.statusText;
      if (info.url) update.tracking_url = info.url;
      if (info.eta) update.eta = info.eta;
      // Auto-advance order status from the carrier signal.
      if (info.status === "DELIVERED") update.status = "delivered";
      else if (info.status === "TRANSIT" && (update.status === "paid" || update.status === "processing")) {
        update.status = "shipped";
      }
    }
    // Subscribe to future push updates (non-blocking).
    void registerTracking(tracking_carrier, tracking_number);
  }

  // updated_at is bumped automatically by the trigger, so the moment an order
  // is marked "delivered" becomes its delivery date in the Deliveries report.
  await db.from("orders").update(update).eq("id", id);
  revalidatePath("/admin/orders");
  revalidatePath("/account");
}
