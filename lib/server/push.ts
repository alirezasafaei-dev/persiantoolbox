import webPush from 'web-push';
import { query } from './db';

function getVapidConfig() {
  const publicKey = process.env['VAPID_PUBLIC_KEY'];
  const privateKey = process.env['VAPID_PRIVATE_KEY'];
  const email = process.env['VAPID_EMAIL'];

  if (!publicKey || !privateKey || !email) {
    return null;
  }

  return { publicKey, privateKey, email };
}

export function isPushEnabled(): boolean {
  return getVapidConfig() !== null;
}

export function getVapidPublicKey(): string | null {
  return getVapidConfig()?.publicKey ?? null;
}

function getWebPushClient() {
  const config = getVapidConfig();
  if (!config) {
    throw new Error('VAPID keys are not configured');
  }
  webPush.setVapidDetails(config.email, config.publicKey, config.privateKey);
  return webPush;
}

export interface PushSubscription {
  id: string;
  userId: string | null;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: number;
}

export async function savePushSubscription(
  endpoint: string,
  p256dh: string,
  auth: string,
  userId?: string,
): Promise<PushSubscription> {
  const existingResult = await query<{ id: string }>(
    'SELECT id FROM push_subscriptions WHERE endpoint = $1',
    [endpoint],
  );

  if (existingResult.rows.length > 0) {
    await query(
      'UPDATE push_subscriptions SET p256dh = $1, auth = $2, user_id = $3 WHERE endpoint = $4',
      [p256dh, auth, userId ?? null, endpoint],
    );

    const updated = await query<PushSubscription>(
      'SELECT id, user_id as "userId", endpoint, p256dh, auth, created_at as "createdAt" FROM push_subscriptions WHERE endpoint = $1',
      [endpoint],
    );
    if (updated.rows.length === 0) {
      throw new Error('Failed to fetch updated subscription');
    }
    return updated.rows[0] as PushSubscription;
  }

  const result = await query<PushSubscription>(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id as "userId", endpoint, p256dh, auth, created_at as "createdAt"`,
    [endpoint, p256dh, auth, userId ?? null],
  );

  if (result.rows.length === 0) {
    throw new Error('Failed to insert subscription');
  }
  return result.rows[0] as PushSubscription;
}

export async function removePushSubscription(endpoint: string): Promise<boolean> {
  const result = await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
  return (result.rowCount ?? 0) > 0;
}

export async function removeExpiredSubscriptions(): Promise<number> {
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const result = await query('DELETE FROM push_subscriptions WHERE created_at < $1', [
    thirtyDaysAgo,
  ]);
  return result.rowCount ?? 0;
}

export async function getAllPushSubscriptions(): Promise<PushSubscription[]> {
  const result = await query<PushSubscription>(
    'SELECT id, user_id as "userId", endpoint, p256dh, auth, created_at as "createdAt" FROM push_subscriptions',
  );
  return result.rows;
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: string | Buffer,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getWebPushClient();
    await client.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      payload,
    );
    return { success: true };
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };

    if (err.statusCode === 404 || err.statusCode === 410) {
      await removePushSubscription(subscription.endpoint);
    }

    return { success: false, error: err.message ?? 'Unknown error' };
  }
}

export async function broadcastPushNotification(
  payload: string | Buffer,
): Promise<{ sent: number; failed: number; removed: number }> {
  const subscriptions = await getAllPushSubscriptions();
  let sent = 0;
  let failed = 0;
  let removed = 0;

  for (const subscription of subscriptions) {
    const result = await sendPushNotification(subscription, payload);
    if (result.success) {
      sent++;
    } else {
      failed++;
      if (result.error && (result.error.includes('404') || result.error.includes('410'))) {
        removed++;
      }
    }
  }

  return { sent, failed, removed };
}

export async function sendPushNotificationToUser(
  userId: string,
  payload: string | Buffer,
): Promise<{ sent: number; failed: number }> {
  const result = await query<PushSubscription>(
    'SELECT id, user_id as "userId", endpoint, p256dh, auth, created_at as "createdAt" FROM push_subscriptions WHERE user_id = $1',
    [userId],
  );

  let sent = 0;
  let failed = 0;

  for (const subscription of result.rows) {
    const sendResult = await sendPushNotification(subscription, payload);
    if (sendResult.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}
