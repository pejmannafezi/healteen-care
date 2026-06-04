import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { friendlyTrackingStatus } from "@/lib/shippo/client";

// Shippo push updates for registered tracking numbers (event: track_updated).
// Optional shared-secret check via ?token= matching SHIPPO_WEBHOOK_SECRET.
export async function POST(request: NextRequest) {
  const secret = process.env.SHIPPO_WEBHOOK_SECRET;
  if (secret && request.nextUrl.searchParams.get("token") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Shippo may send the track object directly or wrapped in `data`.
  const data = (body.data ?? body) as {
    tracking_number?: string;
    eta?: string | null;
    tracking_status?: { status?: string };
  };
  const trackingNumber = data.tracking_number;
  const status = data.tracking_status?.status;

  if (trackingNumber && status) {
    try {
      const db = createSupabaseAdminClient();
      const update: Record<string, unknown> = {
        tracking_status: friendlyTrackingStatus(status),
        eta: data.eta ?? null,
      };
      if (status === "DELIVERED") update.status = "delivered";
      await db.from("orders").update(update).eq("tracking_number", trackingNumber);
    } catch (e) {
      console.error("Shippo webhook update failed:", e);
    }
  }

  return NextResponse.json({ received: true });
}
