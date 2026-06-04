import "server-only";
import { Resend } from "resend";

function apiKey() {
  return process.env.HEALTEEN_RESEND_KEY || process.env.RESEND_API_KEY;
}

export function hasEmail() {
  return Boolean(apiKey());
}

/**
 * Sends a transactional email via Resend. No-op (logs) if no key is configured,
 * so the app works fine before email is set up.
 * NOTE: until a domain is verified in Resend, `from` must be onboarding@resend.dev
 * and you can only send to the account owner's email.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const key = apiKey();
  if (!key || !to) return;
  try {
    const resend = new Resend(key);
    const from = process.env.EMAIL_FROM || "Healteen Care <onboarding@resend.dev>";
    await resend.emails.send({ from, to, subject, html });
  } catch (e) {
    console.error("Email send failed:", e);
  }
}

/** Branded HTML wrapper for transactional emails. */
export function emailLayout(bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;background:#F8F5EE;font-family:Arial,Helvetica,sans-serif;color:#1A2E24">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#1A4D3A;color:#F8F5EE;padding:20px 24px;border-radius:12px 12px 0 0">
      <div style="font-size:20px;font-weight:bold;letter-spacing:.5px">HEALTEEN CARE</div>
      <div style="font-size:12px;color:#C7E3D5;font-style:italic">Care Today. Live Strong Tomorrow.</div>
    </div>
    <div style="background:#fff;border:1px solid #E2DACB;border-top:0;border-radius:0 0 12px 12px;padding:24px">
      ${bodyHtml}
    </div>
    <p style="font-size:11px;color:#8A988F;text-align:center;margin-top:16px">
      These statements have not been evaluated by the FDA. Products support general wellness and are
      not intended to diagnose, treat, cure, or prevent any disease.
    </p>
  </div></body></html>`;
}
