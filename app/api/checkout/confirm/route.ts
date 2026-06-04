import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { createOrderFromSession } from "@/lib/services/orders";

// Called by the success page so the order is created immediately (and works in
// local dev without the Stripe CLI). The webhook is the production-grade path;
// both are idempotent.
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "Missing session_id" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ ok: false, status: session.payment_status });
    }

    const order = await createOrderFromSession(session);
    return NextResponse.json({ ok: true, orderId: order?.id ?? null });
  } catch (e) {
    console.error("Checkout confirm error:", e);
    return NextResponse.json({ ok: false, error: "Could not confirm order." }, { status: 500 });
  }
}
