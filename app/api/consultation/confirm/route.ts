import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { createConsultationFromSession } from "@/lib/services/consultations";

// Called by the success page so the consultation is created immediately
// (works locally without the Stripe CLI). Idempotent.
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ ok: false, status: session.payment_status });
    }
    const consultation = await createConsultationFromSession(session);
    return NextResponse.json({ ok: true, id: consultation?.id ?? null });
  } catch (e) {
    console.error("Consultation confirm error:", e);
    return NextResponse.json({ ok: false, error: "Could not confirm booking." }, { status: 500 });
  }
}
