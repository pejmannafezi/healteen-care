import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validation/checkout";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const FLAT_SHIPPING_CENTS = 599;

export async function POST(request: NextRequest) {
  // Throttle checkout session creation: 10 / minute / IP.
  const rl = rateLimit(`checkout:${getClientIp(request)}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  // 1. Validate input
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid cart." }, { status: 400 });
  }

  // 2. Re-price from the database — NEVER trust client-supplied prices.
  const admin = createSupabaseAdminClient();
  const ids = parsed.data.items.map((i) => i.productId);
  const { data: products } = await admin
    .from("products")
    .select("id, name, price_cents, currency, stock_qty, is_active, images")
    .in("id", ids);

  const byId = new Map((products ?? []).map((p) => [p.id, p]));
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const metaItems: [string, number][] = [];
  let currency = "usd";

  for (const item of parsed.data.items) {
    const p = byId.get(item.productId);
    if (!p || !p.is_active) {
      return NextResponse.json({ error: "A product in your cart is no longer available." }, { status: 400 });
    }
    if (p.stock_qty < item.quantity) {
      return NextResponse.json({ error: `Not enough stock for ${p.name}.` }, { status: 400 });
    }
    currency = (p.currency ?? "USD").toLowerCase();
    lineItems.push({
      price_data: {
        currency,
        unit_amount: p.price_cents,
        product_data: { name: p.name, ...(p.images?.[0] ? { images: [p.images[0]] } : {}) },
      },
      quantity: item.quantity,
    });
    metaItems.push([p.id, item.quantity]);
  }

  // 3. Identify the user if signed in (for order ownership).
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // 4. Create the hosted Checkout Session.
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    shipping_address_collection: { allowed_countries: ["US", "CA"] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: FLAT_SHIPPING_CENTS, currency },
          display_name: "Standard shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
    ],
    phone_number_collection: { enabled: true },
    customer_email: user?.email ?? undefined,
    metadata: {
      items: JSON.stringify(metaItems),
      user_id: user?.id ?? "",
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
  });

  return NextResponse.json({ url: session.url });
}
