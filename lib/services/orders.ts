import "server-only";
import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateInvoice } from "@/lib/services/invoices";
import { sendEmail, emailLayout, hasEmail } from "@/lib/email/resend";

const money = (c: number, cur = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

/** Extract the shipping address from a Checkout Session across API versions. */
function extractShipping(session: Stripe.Checkout.Session) {
  const s = session as unknown as {
    shipping_details?: { name?: string; address?: Record<string, unknown> };
    collected_information?: { shipping_details?: { name?: string; address?: Record<string, unknown> } };
    customer_details?: { name?: string; address?: Record<string, unknown> };
  };
  const sd = s.shipping_details ?? s.collected_information?.shipping_details;
  const addr = sd?.address ?? s.customer_details?.address;
  if (!addr) return null;
  return {
    name: sd?.name ?? s.customer_details?.name ?? null,
    line1: addr.line1 ?? null,
    line2: addr.line2 ?? null,
    city: addr.city ?? null,
    state: addr.state ?? null,
    postal_code: addr.postal_code ?? null,
    country: addr.country ?? null,
  };
}

/**
 * Creates an order from a paid Checkout Session. Idempotent: if an order for
 * this session already exists, returns it without re-applying side effects
 * (stock decrement, invoice). Safe to call from both the webhook and the
 * success-page confirmation.
 */
export async function createOrderFromSession(session: Stripe.Checkout.Session) {
  const admin = createSupabaseAdminClient();

  // Parse the compact items map we stored in metadata: [[productId, qty], ...]
  let pairs: [string, number][] = [];
  try {
    pairs = JSON.parse(session.metadata?.items ?? "[]");
  } catch {
    pairs = [];
  }
  if (pairs.length === 0) throw new Error("No items in session metadata");

  const ids = pairs.map(([id]) => id);
  const { data: products } = await admin
    .from("products")
    .select("id, name, price_cents, currency, stock_qty")
    .in("id", ids);
  const byId = new Map((products ?? []).map((p) => [p.id, p]));

  const items = pairs
    .map(([id, qty]) => {
      const p = byId.get(id);
      return p ? { product: p, qty } : null;
    })
    .filter(Boolean) as { product: { id: string; name: string; price_cents: number; currency: string; stock_qty: number }; qty: number }[];

  const subtotal = items.reduce((n, i) => n + i.product.price_cents * i.qty, 0);
  const currency = (session.currency ?? items[0]?.product.currency ?? "USD").toUpperCase();
  const shipping = extractShipping(session);
  const shippingCents = session.shipping_cost?.amount_total ?? session.total_details?.amount_shipping ?? 0;
  const taxCents = session.total_details?.amount_tax ?? 0;
  const totalCents = session.amount_total ?? subtotal + shippingCents + taxCents;
  const email = session.customer_details?.email ?? session.customer_email ?? "";
  const userId = session.metadata?.user_id || null;

  // Attempt insert; the unique constraint on stripe_checkout_session makes this
  // the single source of truth under concurrency.
  const { data: order, error } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      email,
      status: "paid",
      subtotal_cents: subtotal,
      shipping_cents: shippingCents,
      tax_cents: taxCents,
      total_cents: totalCents,
      currency,
      shipping_address: shipping,
      stripe_checkout_session: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
    })
    .select("*")
    .single();

  if (error) {
    // 23505 = unique violation → another call already created it. Return existing.
    if (error.code === "23505") {
      const { data: existing } = await admin
        .from("orders")
        .select("*")
        .eq("stripe_checkout_session", session.id)
        .single();
      return existing;
    }
    throw error;
  }

  // ── First-time side effects (winner only) ──
  await admin.from("order_items").insert(
    items.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      name_snapshot: i.product.name,
      unit_price_cents: i.product.price_cents,
      quantity: i.qty,
    }))
  );

  // Decrement stock + log inventory movement.
  for (const i of items) {
    const newQty = Math.max(0, i.product.stock_qty - i.qty);
    await admin.from("products").update({ stock_qty: newQty }).eq("id", i.product.id);
    await admin.from("inventory_logs").insert({
      product_id: i.product.id,
      delta: -i.qty,
      reason: `order:${order.id}`,
    });
  }

  // Auto-invoice (non-fatal) + order confirmation email.
  let invoiceUrl: string | null = null;
  try {
    const inv = await generateInvoice(
      {
        id: order.id,
        email,
        subtotal_cents: subtotal,
        shipping_cents: shippingCents,
        tax_cents: taxCents,
        total_cents: totalCents,
        currency,
        shipping_address: shipping,
        created_at: order.created_at,
      },
      items.map((i) => ({ name: i.product.name, quantity: i.qty, unitPriceCents: i.product.price_cents }))
    );
    invoiceUrl = inv?.url ?? null;
  } catch (e) {
    console.error("Invoice generation failed:", e);
  }

  // Order confirmation email (no-op if Resend not configured).
  if (hasEmail() && email) {
    const ref = order.id.slice(0, 8).toUpperCase();
    const rows = items
      .map(
        (i) =>
          `<tr><td style="padding:6px 0">${i.product.name} × ${i.qty}</td>` +
          `<td style="padding:6px 0;text-align:right">${money(i.product.price_cents * i.qty, currency)}</td></tr>`
      )
      .join("");
    const body = `
      <h2 style="margin:0 0 8px;color:#1A4D3A">Thank you for your order!</h2>
      <p style="color:#4b5b51">Your payment was successful and your order <b>#${ref}</b> is confirmed.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0">
        ${rows}
        <tr><td style="padding:8px 0;border-top:1px solid #E2DACB"><b>Total</b></td>
        <td style="padding:8px 0;border-top:1px solid #E2DACB;text-align:right"><b>${money(totalCents, currency)}</b></td></tr>
      </table>
      ${invoiceUrl ? `<p><a href="${invoiceUrl}" style="color:#2E7D5E">Download your invoice (PDF)</a></p>` : ""}
      <p style="color:#4b5b51">We'll email you tracking details once your order ships.</p>`;
    await sendEmail({ to: email, subject: `Your Healteen Care order #${ref}`, html: emailLayout(body) });
  }

  return order;
}
