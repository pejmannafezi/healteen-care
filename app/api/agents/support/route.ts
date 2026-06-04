import { NextResponse, type NextRequest } from "next/server";
import { runSupportAgent } from "@/lib/agents/support";
import { chatSchema } from "@/lib/validation/chat";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Throttle: 15 messages / minute / IP.
  const ip = getClientIp(request);
  const rl = rateLimit(`support:${ip}`, 15, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many messages. Please slow down a moment." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid messages." }, { status: 400 });
  }

  try {
    const reply = await runSupportAgent(parsed.data.messages);
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("Support agent error:", e);
    return NextResponse.json(
      { error: "The assistant is unavailable right now. Please try again." },
      { status: 500 }
    );
  }
}
