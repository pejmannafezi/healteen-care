import "server-only";
import webpush from "web-push";

let configured: boolean | null = null;

function configure(): boolean {
  if (configured !== null) return configured;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) {
    configured = false;
    return false;
  }
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:info@healteencare.com", pub, priv);
  configured = true;
  return true;
}

export function hasPush() {
  return configure();
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
}

/** Sends a push; throws with .statusCode 404/410 if the subscription is dead. */
export async function sendPush(subscription: webpush.PushSubscription, payload: PushPayload) {
  if (!configure()) return;
  await webpush.sendNotification(subscription, JSON.stringify(payload));
}
