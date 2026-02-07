import { createHmac } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/subscription/webhook/route';
import { createSubscription } from '@/lib/server/subscriptions';
import { getCheckoutById, markCheckoutPaid } from '@/lib/server/checkouts';

vi.mock('@/lib/server/checkouts', () => ({
  getCheckoutById: vi.fn(),
  markCheckoutPaid: vi.fn(),
}));

vi.mock('@/lib/server/subscriptions', () => ({
  createSubscription: vi.fn(),
}));

const mockGetCheckoutById = vi.mocked(getCheckoutById);
const mockMarkCheckoutPaid = vi.mocked(markCheckoutPaid);
const mockCreateSubscription = vi.mocked(createSubscription);

function sign(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

describe('subscription webhook route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env['SUBSCRIPTION_WEBHOOK_SECRET'];
  });

  it('returns WEBHOOK_DISABLED when secret is missing', async () => {
    const request = new Request('http://localhost/api/subscription/webhook', {
      method: 'POST',
      body: JSON.stringify({ checkoutId: '1', status: 'paid' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(501);
  });

  it('requires signature header', async () => {
    process.env['SUBSCRIPTION_WEBHOOK_SECRET'] = 'secret';
    const request = new Request('http://localhost/api/subscription/webhook', {
      method: 'POST',
      body: JSON.stringify({ checkoutId: '1', status: 'paid' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('rejects invalid signature', async () => {
    process.env['SUBSCRIPTION_WEBHOOK_SECRET'] = 'secret';
    const body = JSON.stringify({ checkoutId: '1', status: 'paid' });
    const request = new Request('http://localhost/api/subscription/webhook', {
      method: 'POST',
      body,
      headers: { 'x-pt-signature': 'invalid' },
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('rejects malformed body after signature verification', async () => {
    process.env['SUBSCRIPTION_WEBHOOK_SECRET'] = 'secret';
    const body = '{bad-json}';
    const request = new Request('http://localhost/api/subscription/webhook', {
      method: 'POST',
      body,
      headers: { 'x-pt-signature': sign(body, 'secret') },
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns not found when checkout does not exist', async () => {
    process.env['SUBSCRIPTION_WEBHOOK_SECRET'] = 'secret';
    mockGetCheckoutById.mockResolvedValue(null);
    const body = JSON.stringify({ checkoutId: 'missing', status: 'paid' });
    const request = new Request('http://localhost/api/subscription/webhook', {
      method: 'POST',
      body,
      headers: { 'x-pt-signature': sign(body, 'secret') },
    });
    const response = await POST(request);
    expect(response.status).toBe(404);
  });

  it('marks checkout paid and creates subscription for valid event', async () => {
    process.env['SUBSCRIPTION_WEBHOOK_SECRET'] = 'secret';
    mockGetCheckoutById.mockResolvedValue({
      id: 'checkout-1',
      userId: 'user-1',
      planId: 'pro_monthly',
      status: 'pending',
      createdAt: Date.now(),
      paidAt: null,
    });
    mockCreateSubscription.mockResolvedValue({
      id: 'sub-1',
      userId: 'user-1',
      planId: 'pro_monthly',
      status: 'active',
      startedAt: Date.now(),
      expiresAt: Date.now() + 1,
    });

    const body = JSON.stringify({ checkoutId: 'checkout-1', status: 'paid' });
    const request = new Request('http://localhost/api/subscription/webhook', {
      method: 'POST',
      body,
      headers: { 'x-pt-signature': sign(body, 'secret') },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockMarkCheckoutPaid).toHaveBeenCalledWith('checkout-1');
    expect(mockCreateSubscription).toHaveBeenCalledWith('user-1', 'pro_monthly');
  });
});
