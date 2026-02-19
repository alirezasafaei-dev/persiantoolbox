import { describe, expect, it } from 'vitest';
import { __resetWebhookReplayCacheForTests, POST } from '@/app/api/subscription/webhook/route';

describe('subscription webhook route (v2)', () => {
  it('returns disabled status', async () => {
    const response = await POST(
      new Request('http://localhost/api/subscription/webhook', {
        method: 'POST',
        body: JSON.stringify({ checkoutId: '1', status: 'paid' }),
      }),
    );
    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      status: 'disabled',
      feature: 'subscription',
      envKey: 'FEATURE_SUBSCRIPTION_ENABLED',
    });
  });

  it('keeps reset helper available for test compatibility', () => {
    expect(() => __resetWebhookReplayCacheForTests()).not.toThrow();
  });
});
