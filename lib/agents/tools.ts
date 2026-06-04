import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: "search_products",
    description:
      "Search active Healteen Care products by keyword (name, benefit, or symptom). Use to recommend products or answer product questions.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keyword(s), e.g. 'joint pain', 'sleep', 'turmeric'." },
      },
      required: ["query"],
    },
  },
  {
    name: "lookup_order",
    description:
      "Look up a customer's order status, shipping status and estimated delivery. Requires BOTH the 8-character order reference AND the email used at checkout for verification.",
    input_schema: {
      type: "object",
      properties: {
        order_ref: { type: "string", description: "8-character order reference, e.g. A1B2C3D4." },
        email: { type: "string", description: "Email used at checkout." },
      },
      required: ["order_ref", "email"],
    },
  },
];

const money = (c: number, cur = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

async function searchProducts(query: string) {
  const db = createSupabaseAdminClient();
  const q = (query || "").slice(0, 80);
  const { data } = await db
    .from("products")
    .select("name, slug, price_cents, currency, short_description, benefits, contraindications, stock_qty")
    .eq("is_active", true)
    .or(`name.ilike.%${q}%,short_description.ilike.%${q}%,benefits.ilike.%${q}%,symptoms_supported.ilike.%${q}%`)
    .limit(5);

  if (!data || data.length === 0) return "No matching products found.";
  return data
    .map(
      (p) =>
        `- ${p.name} (${money(p.price_cents, p.currency)})${p.stock_qty > 0 ? "" : " [out of stock]"}: ${p.short_description ?? ""}` +
        (p.contraindications ? ` Safety: ${p.contraindications}` : "") +
        ` Link: /shop/${p.slug}`
    )
    .join("\n");
}

async function lookupOrder(orderRef: string, email: string) {
  const db = createSupabaseAdminClient();
  const ref = (orderRef || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  const mail = (email || "").trim().toLowerCase();
  if (ref.length < 6 || !mail.includes("@")) {
    return "I need a valid 8-character order reference and the email used at checkout.";
  }

  const { data } = await db
    .from("orders")
    .select("id, email, status, total_cents, currency, tracking_number, tracking_carrier, tracking_status, tracking_url, eta, created_at, order_items(name_snapshot, quantity)")
    .ilike("email", mail)
    .limit(20);

  const order = (data ?? []).find((o) => o.id.toLowerCase().startsWith(ref));
  if (!order) return "No order found matching that reference and email. Please double-check both.";

  const items = (order.order_items ?? []).map((i) => `${i.name_snapshot} ×${i.quantity}`).join(", ");
  const eta = order.eta ? new Date(order.eta).toLocaleDateString("en-US") : "not yet scheduled";
  return [
    `Order #${order.id.slice(0, 8).toUpperCase()}`,
    `Placed: ${new Date(order.created_at).toLocaleDateString("en-US")}`,
    `Status: ${order.status}`,
    `Items: ${items}`,
    `Total: ${money(order.total_cents, order.currency)}`,
    `Shipping: ${order.tracking_status ?? (order.status === "shipped" ? "Shipped" : "Preparing your order")}`,
    order.tracking_carrier || order.tracking_number ? `Carrier/Tracking: ${order.tracking_carrier ?? ""} ${order.tracking_number ?? ""}`.trim() : "",
    `Estimated delivery: ${eta}`,
    order.tracking_url ? `Track: ${order.tracking_url}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    if (name === "search_products") return await searchProducts(String(input.query ?? ""));
    if (name === "lookup_order") return await lookupOrder(String(input.order_ref ?? ""), String(input.email ?? ""));
    return "Unknown tool.";
  } catch (e) {
    console.error("Tool error", name, e);
    return "Sorry, I couldn't complete that lookup right now.";
  }
}
