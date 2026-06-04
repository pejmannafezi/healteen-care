import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { bookingSchema } from "@/lib/validation/consultation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rl = rateLimit(`consult:${getClientIp(request)}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }

  // Must be signed in to book.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to book a consultation.", requireLogin: true }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please choose a valid time slot." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const [{ data: settings }, { data: slot }] = await Promise.all([
    admin.from("consultation_settings").select("*").eq("id", 1).single(),
    admin.from("availability_slots").select("id, starts_at, is_booked").eq("id", parsed.data.slotId).single(),
  ]);

  if (!settings?.is_enabled) {
    return NextResponse.json({ error: "Consultations are not available right now." }, { status: 400 });
  }
  if (!slot || slot.is_booked || new Date(slot.starts_at) <= new Date()) {
    return NextResponse.json({ error: "That time slot is no longer available." }, { status: 400 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const currency = "usd";
  const when = new Date(slot.starts_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: settings.price_cents,
          product_data: {
            name: `Personal Consultation (${parsed.data.type})`,
            description: `${settings.duration_min}-minute session · ${when}`,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: user.email ?? undefined,
    phone_number_collection: { enabled: parsed.data.type === "phone" },
    metadata: { slot_id: parsed.data.slotId, type: parsed.data.type, user_id: user.id },
    success_url: `${origin}/consultation/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/consultation`,
  });

  return NextResponse.json({ url: session.url });
}
