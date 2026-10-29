import webpush from "web-push";
import type { DB } from "@/lib/db";

/*
 * Web push — VAPID keys via env:
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:you@example.com)
 * Generate once:  npx web-push generate-vapid-keys
 * If keys are missing, push silently no-ops (emails still work).
 */

let inited = false;
function ensureInit(): boolean {
  if (inited) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:no-reply@focusflow.app", pub, priv);
  inited = true;
  return true;
}

export function pushConfigured(): boolean {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export function vapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY || null;
}

export async function saveSubscription(
  db: DB,
  userId: number,
  sub: { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
): Promise<boolean> {
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) return false;
  if (typeof sub.endpoint !== "string" || !sub.endpoint.startsWith("https://") || sub.endpoint.length > 1024) return false;
  if (typeof sub.keys.p256dh !== "string" || sub.keys.p256dh.length > 256) return false;
  if (typeof sub.keys.auth !== "string" || sub.keys.auth.length > 128) return false;
  await db.run(
    `INSERT INTO push_subscriptions (endpoint, user_id, p256dh, auth, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth`,
    sub.endpoint, userId, sub.keys.p256dh, sub.keys.auth, new Date().toISOString()
  );
  return true;
}

export async function deleteSubscription(db: DB, endpoint: string): Promise<void> {
  await db.run("DELETE FROM push_subscriptions WHERE endpoint = ?", endpoint);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/** Send to every subscription of a user. Removes stale ones (410/404). No-op if push unconfigured. */
export async function sendPushToUser(db: DB, userId: number, payload: PushPayload): Promise<number> {
  if (!ensureInit()) return 0;
  const rows = (await db.all(
    "SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?",
    userId
  )) as Array<{ endpoint: string; p256dh: string; auth: string }>;
  let sent = 0;
  for (const r of rows) {
    try {
      await webpush.sendNotification(
        { endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } },
        JSON.stringify(payload)
      );
      sent++;
    } catch (e: any) {
      const gone = e?.statusCode === 404 || e?.statusCode === 410;
      if (gone) await deleteSubscription(db, r.endpoint);
    }
  }
  return sent;
}
