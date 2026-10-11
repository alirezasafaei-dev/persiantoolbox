import { createHmac } from 'node:crypto';
import { withTransaction } from '@/lib/server/db';

/**
 * Conservative, application-controlled request counts, not actual Cloudflare
 * Neurons consumption. Requires a separately verified Workers Free account.
 */
export const IMAGE_REQUEST_LIMITS = {
  visitorPerUtcDay: 1,
  visitorPerMinute: 1,
  accountPerUtcDay: 5,
  accountPerMinute: 1,
} as const;

export class ImageQuotaExceeded extends Error {
  constructor() {
    super('Image generation quota reached');
    this.name = 'ImageQuotaExceeded';
  }
}

export function imageGenerationReady(): boolean {
  if (
    process.env['FEATURE_AI_IMAGE_ENABLED'] !== 'true' ||
    process.env['AI_IMAGE_FREE_PLAN_CONFIRMED'] !== 'true' ||
    process.env['AI_IMAGE_ACCOUNT_ISOLATED_CONFIRMED'] !== 'true'
  ) {
    return false;
  }

  const account = process.env['AI_IMAGE_CLOUDFLARE_ACCOUNT_ID']?.trim();
  const token = process.env['AI_IMAGE_CLOUDFLARE_TOKEN']?.trim();
  const chatAccount = process.env['AI_CLOUDFLARE_ACCOUNT_ID']?.trim();
  const chatToken = process.env['AI_CLOUDFLARE_TOKEN']?.trim();

  // A separate Cloudflare account—not merely a different API token—is
  // mandatory while chat usage is metered independently.
  return Boolean(
    account &&
    /^[a-f0-9]{32}$/i.test(account) &&
    token &&
    chatAccount &&
    /^[a-f0-9]{32}$/i.test(chatAccount) &&
    chatToken &&
    account.toLowerCase() !== chatAccount.toLowerCase() &&
    token !== chatToken &&
    (process.env['AI_VISITOR_SECRET']?.length ?? 0) >= 32,
  );
}

function keyedId(value: string): string {
  const secret = process.env['AI_VISITOR_SECRET'];
  if (!secret || secret.length < 32) {
    throw new Error('Image quota signing secret is unavailable');
  }
  return createHmac('sha256', secret).update(value).digest('hex');
}

export async function consumeImageQuota(
  visitor: string,
  accountId: string,
  at = new Date(),
): Promise<void> {
  if (
    !imageGenerationReady() ||
    !/^[a-f0-9]{32}$/i.test(accountId) ||
    accountId.toLowerCase() !==
      process.env['AI_IMAGE_CLOUDFLARE_ACCOUNT_ID']?.trim().toLowerCase() ||
    !visitor
  ) {
    throw new Error('Image quota configuration not ready');
  }

  const day = new Date(at);
  day.setUTCHours(0, 0, 0, 0);
  const minute = new Date(Math.floor(at.getTime() / 60_000) * 60_000);
  const signedVisitor = keyedId(visitor);
  const signedAccount = keyedId(accountId.toLowerCase());

  const limits = [
    {
      key: `image:visitor:day:${signedVisitor}`,
      bucket: day,
      cap: IMAGE_REQUEST_LIMITS.visitorPerUtcDay,
    },
    {
      key: `image:visitor:minute:${signedVisitor}`,
      bucket: minute,
      cap: IMAGE_REQUEST_LIMITS.visitorPerMinute,
    },
    {
      key: `image:account:day:${signedAccount}`,
      bucket: day,
      cap: IMAGE_REQUEST_LIMITS.accountPerUtcDay,
    },
    {
      key: `image:account:minute:${signedAccount}`,
      bucket: minute,
      cap: IMAGE_REQUEST_LIMITS.accountPerMinute,
    },
  ];

  await withTransaction(async (query) => {
    for (const limit of limits) {
      const result = await query<{ hits: number }>(
        `INSERT INTO ai_chat_quota (quota_key, bucket_start, hits)
         VALUES ($1, $2, 1)
         ON CONFLICT (quota_key, bucket_start) DO UPDATE
           SET hits = ai_chat_quota.hits + 1
           WHERE ai_chat_quota.hits < $3
         RETURNING hits`,
        [limit.key, limit.bucket, limit.cap],
      );
      if (result.rowCount !== 1) {
        throw new ImageQuotaExceeded();
      }
    }
  });
}
