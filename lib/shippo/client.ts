import "server-only";

const BASE = "https://api.goshippo.com";

function token(): string {
  const t = process.env.HEALTEEN_SHIPPO_TOKEN || process.env.SHIPPO_API_TOKEN;
  if (!t) throw new Error("HEALTEEN_SHIPPO_TOKEN / SHIPPO_API_TOKEN is not set");
  return t;
}

export function hasShippo() {
  return Boolean(process.env.HEALTEEN_SHIPPO_TOKEN || process.env.SHIPPO_API_TOKEN);
}

/** Map a free-text carrier name to a Shippo carrier token. */
export function normalizeCarrier(input: string): string {
  const c = (input || "").trim().toLowerCase();
  if (c.includes("usps")) return "usps";
  if (c.includes("ups")) return "ups";
  if (c.includes("fedex")) return "fedex";
  if (c.includes("dhl")) return "dhl_express";
  if (c.includes("shippo") || c === "test" || c === "") return "shippo";
  return c;
}

const STATUS_TEXT: Record<string, string> = {
  PRE_TRANSIT: "Label created — awaiting carrier pickup",
  TRANSIT: "In transit",
  DELIVERED: "Delivered",
  RETURNED: "Returned to sender",
  FAILURE: "Delivery issue — please contact support",
  UNKNOWN: "Tracking pending",
};

export function friendlyTrackingStatus(status: string): string {
  return STATUS_TEXT[status] ?? status;
}

function carrierTrackingUrl(carrier: string, num: string): string | null {
  switch (carrier) {
    case "usps":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(num)}`;
    case "ups":
      return `https://www.ups.com/track?tracknum=${encodeURIComponent(num)}`;
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(num)}`;
    default:
      return null;
  }
}

export interface TrackingInfo {
  status: string; // raw Shippo status, e.g. TRANSIT
  statusText: string; // human-friendly
  eta: string | null; // ISO date
  location: string | null;
  url: string | null;
}

function parseTrack(data: Record<string, unknown>, carrier: string, num: string): TrackingInfo {
  const ts = (data?.tracking_status ?? {}) as {
    status?: string;
    location?: { city?: string; state?: string; country?: string };
  };
  const status = ts.status ?? "UNKNOWN";
  const loc = ts.location;
  const location = loc ? [loc.city, loc.state, loc.country].filter(Boolean).join(", ") : null;
  return {
    status,
    statusText: friendlyTrackingStatus(status),
    eta: (data?.eta as string) ?? null,
    location,
    url: carrierTrackingUrl(carrier, num),
  };
}

/** Fetch the latest tracking status for a shipment. Returns null on failure. */
export async function getTracking(carrierInput: string, trackingNumber: string): Promise<TrackingInfo | null> {
  const carrier = normalizeCarrier(carrierInput);
  const num = (trackingNumber || "").trim();
  if (!num) return null;
  try {
    const res = await fetch(`${BASE}/tracks/${carrier}/${encodeURIComponent(num)}`, {
      headers: { Authorization: `ShippoToken ${token()}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return parseTrack(await res.json(), carrier, num);
  } catch {
    return null;
  }
}

/** Register a tracking number so Shippo pushes future updates via webhook. */
export async function registerTracking(carrierInput: string, trackingNumber: string): Promise<void> {
  const carrier = normalizeCarrier(carrierInput);
  const num = (trackingNumber || "").trim();
  if (!num) return;
  try {
    await fetch(`${BASE}/tracks/`, {
      method: "POST",
      headers: { Authorization: `ShippoToken ${token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ carrier, tracking_number: num }),
    });
  } catch {
    /* best-effort */
  }
}
