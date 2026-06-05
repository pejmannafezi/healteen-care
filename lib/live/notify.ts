import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendPush, hasPush } from "./push";
import { sendEmail, emailLayout, hasEmail } from "@/lib/email/resend";

interface LiveSession {
  title: string;
  description?: string | null;
}

/** Notify all subscribers (web push + email) that a live session has started. */
export async function notifyLiveStarted(session: LiveSession) {
  const db = createSupabaseAdminClient();
  const { data: subs } = await db
    .from("live_subscribers")
    .select("id, email, push_subscription");
  if (!subs || subs.length === 0) return;

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://healteen-care.vercel.app"}/live`;
  const title = `🔴 ${session.title} — live now!`;
  const body = session.description?.slice(0, 120) || "Join the live session and shop with us.";

  // Web push (prune dead subscriptions on 404/410).
  if (hasPush()) {
    await Promise.allSettled(
      subs
        .filter((s) => s.push_subscription)
        .map(async (s) => {
          try {
            await sendPush(s.push_subscription, { title, body, url });
          } catch (e) {
            const code = (e as { statusCode?: number }).statusCode;
            if (code === 404 || code === 410) await db.from("live_subscribers").delete().eq("id", s.id);
          }
        })
    );
  }

  // Email.
  if (hasEmail()) {
    const html = emailLayout(
      `<h2 style="margin:0 0 8px;color:#1A4D3A">${session.title} is live now! 🔴</h2>
       <p style="color:#4b5b51">${body}</p>
       <p><a href="${url}" style="display:inline-block;background:#1A4D3A;color:#F8F5EE;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Watch &amp; shop the live →</a></p>`
    );
    await Promise.allSettled(
      subs.filter((s) => s.email).map((s) => sendEmail({ to: s.email!, subject: title, html }))
    );
  }
}
