import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createOrderFromSession } from "@/lib/services/orders";
import { createConsultationFromSession } from "@/lib/services/consultations";

// Stripe webhook — production-grade order creation. Verifies the signature
// before trusting the payload. Configure STRIPE_WEBHOOK_SECRET from the Stripe
// dashboard (or `stripe listen`).
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!secret || !signature) {
    // Not configured yet — accept silently so Stripe doesn't retry-storm.
    return NextResponse.json({ received: true, skipped: "webhook secret not configured" });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (e) {
    console.error("Webhook signature verification failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        // Route by metadata: consultations carry slot_id, product orders carry items.
        if (session.metadata?.slot_id) {
          await createConsultationFromSession(session);
        } else {
          await createOrderFromSession(session);
        }
      }
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
