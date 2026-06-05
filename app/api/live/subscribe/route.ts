import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z
  .object({
    email: z.string().email().max(200).optional(),
    subscription: z
      .object({
        endpoint: z.string().url(),
        keys: z.object({ p256dh: z.string(), auth: z.string() }),
      })
      .optional(),
  })
  .refine((d) => d.email || d.subscription, "Provide an email or enable notifications.");

export async function POST(request: NextRequest) {
  const rl = rateLimit(`livesub:${getClientIp(request)}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid." }, { status: 400 });
  }
  const { email, subscription } = parsed.data;

  // Attach to the logged-in user if any.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const db = createSupabaseAdminClient();
  try {
    if (email) {
      await db.from("live_subscribers").upsert(
        {
          email,
          user_id: user?.id ?? null,
          push_endpoint: subscription?.endpoint ?? null,
          push_subscription: subscription ?? null,
        },
        { onConflict: "email" }
      );
    } else if (subscription) {
      await db.from("live_subscribers").upsert(
        { push_endpoint: subscription.endpoint, push_subscription: subscription, user_id: user?.id ?? null },
        { onConflict: "push_endpoint" }
      );
    }
  } catch (e) {
    console.error("live subscribe error", e);
  }

  return NextResponse.json({ ok: true });
}
