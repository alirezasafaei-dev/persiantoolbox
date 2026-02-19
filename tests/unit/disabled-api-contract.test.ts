import { describe, expect, it } from 'vitest';
import { POST as authLogin } from '@/app/api/auth/login/route';
import { GET as historyGet, POST as historyPost } from '@/app/api/history/route';
import { POST as subscriptionCheckout } from '@/app/api/subscription/checkout/route';
import { POST as subscriptionWebhook } from '@/app/api/subscription/webhook/route';
import { GET as adminSettingsGet } from '@/app/api/admin/site-settings/route';
import { POST as historySharePost } from '@/app/api/history/share/route';

type Handler = (request?: Request) => Promise<Response>;

const request = new Request('http://localhost/api/feature-availability', { method: 'POST' });

const cases: [string, Handler][] = [
  ['auth login', authLogin as unknown as Handler],
  ['history get', historyGet as unknown as Handler],
  ['history post', historyPost as unknown as Handler],
  ['history share', historySharePost as unknown as Handler],
  ['subscription checkout', subscriptionCheckout as unknown as Handler],
  ['subscription webhook', subscriptionWebhook as unknown as Handler],
  ['admin site settings', adminSettingsGet as unknown as Handler],
];

describe('disabled API contract', () => {
  it.each(cases)('%s returns consistent disabled payload', async (_label, handler) => {
    const response = await handler(request);
    expect(response.status).toBe(410);

    const body = await response.json();
    expect(body).toMatchObject({
      ok: false,
      status: 'disabled',
    });
    expect(body.feature).toBeDefined();
    expect(body.envKey).toMatch(/^FEATURE_/);
    expect(typeof body.message).toBe('string');
  });
});
