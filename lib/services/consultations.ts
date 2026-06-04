import "server-only";
import type Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailLayout, hasEmail } from "@/lib/email/resend";

export interface ConsultationSettings {
  price_cents: number;
  duration_min: number;
  video_link: string | null;
  phone_note: string | null;
  is_enabled: boolean;
}

export interface Slot {
  id: string;
  starts_at: string;
  ends_at: string;
}

const money = (c: number, cur = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(c / 100);

// ── Public reads (RLS-safe) ─────────────────────────────────────────
export async function getConsultationSettings(): Promise<ConsultationSettings> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("consultation_settings")
    .select("price_cents, duration_min, video_link, phone_note, is_enabled")
    .eq("id", 1)
    .single();
  return (
    (data as ConsultationSettings) ?? {
      price_cents: 5000,
      duration_min: 30,
      video_link: null,
      phone_note: null,
      is_enabled: true,
    }
  );
}

export async function getAvailableSlots(): Promise<Slot[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("availability_slots")
    .select("id, starts_at, ends_at")
    .eq("is_booked", false)
    .gt("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(60);
  return (data ?? []) as Slot[];
}

export async function getMyConsultations() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("consultations")
    .select("id, type, status, scheduled_at, duration_min, price_cents, currency, meeting_link, phone_number")
    .order("scheduled_at", { ascending: true });
  return data ?? [];
}

// ── Admin helpers (service role) ────────────────────────────────────
export async function adminListSlots() {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("availability_slots")
    .select("id, starts_at, ends_at, is_booked")
    .gte("starts_at", new Date(Date.now() - 86400000).toISOString())
    .order("starts_at");
  return data ?? [];
}

export async function adminListConsultations() {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("consultations")
    .select("id, type, status, scheduled_at, duration_min, price_cents, currency, meeting_link, phone_number, notes, user_id")
    .order("scheduled_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

// ── Booking creation from a paid Stripe session (idempotent) ────────
export async function createConsultationFromSession(session: Stripe.Checkout.Session) {
  const db = createSupabaseAdminClient();
  const slotId = session.metadata?.slot_id;
  const type = (session.metadata?.type as "video" | "phone") ?? "video";
  const userId = session.metadata?.user_id || null;
  if (!slotId) throw new Error("Missing slot in session metadata");

  // Settings + slot.
  const [{ data: settings }, { data: slot }] = await Promise.all([
    db.from("consultation_settings").select("*").eq("id", 1).single(),
    db.from("availability_slots").select("id, starts_at, ends_at, is_booked").eq("id", slotId).single(),
  ]);
  if (!slot) throw new Error("Slot not found");

  const email = session.customer_details?.email ?? session.customer_email ?? "";
  const phone =
    (session.customer_details as { phone?: string } | null)?.phone ?? null;
  const meetingLink = type === "video" ? settings?.video_link ?? null : null;

  // Insert (idempotent on stripe_checkout_session).
  const { data: consultation, error } = await db
    .from("consultations")
    .insert({
      user_id: userId,
      slot_id: slotId,
      type,
      status: "confirmed",
      scheduled_at: slot.starts_at,
      duration_min: settings?.duration_min ?? 30,
      price_cents: settings?.price_cents ?? session.amount_total ?? 0,
      currency: (session.currency ?? "usd").toUpperCase(),
      stripe_payment_intent:
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
      stripe_checkout_session: session.id,
      meeting_link: meetingLink,
      phone_number: phone,
      notes: type === "phone" ? settings?.phone_note ?? null : null,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await db
        .from("consultations")
        .select("*")
        .eq("stripe_checkout_session", session.id)
        .single();
      return existing;
    }
    throw error;
  }

  // Mark the slot booked.
  await db.from("availability_slots").update({ is_booked: true }).eq("id", slotId);

  // Confirmation email (no-op without Resend key).
  if (hasEmail() && email) {
    const when = new Date(slot.starts_at).toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });
    const detail =
      type === "video"
        ? meetingLink
          ? `Join your video session here: <a href="${meetingLink}">${meetingLink}</a>`
          : "We'll email you the video link before your session."
        : settings?.phone_note ?? "We'll call you at the scheduled time.";
    const body = `
      <h2 style="margin:0 0 8px;color:#1A4D3A">Your consultation is booked!</h2>
      <p style="color:#4b5b51">Thank you — your payment was successful and your ${type} consultation is confirmed.</p>
      <p style="color:#4b5b51"><b>When:</b> ${when}<br/><b>Duration:</b> ${settings?.duration_min ?? 30} minutes<br/>
      <b>Amount:</b> ${money(settings?.price_cents ?? 0, (session.currency ?? "usd").toUpperCase())}</p>
      <p style="color:#4b5b51">${detail}</p>`;
    await sendEmail({ to: email, subject: "Your Healteen Care consultation is confirmed", html: emailLayout(body) });
  }

  return consultation;
}
