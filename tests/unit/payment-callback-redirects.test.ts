import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ verify: vi.fn(), user: vi.fn(), payment: vi.fn() }));
vi.mock('@/lib/payments/payment-verification', () => ({ verifyPaymentCallback: mocks.verify }));
vi.mock('@/lib/payments/payment-integration', () => ({
  getPaymentByAuthority: mocks.payment,
  getPaymentById: vi.fn(),
}));
vi.mock('@/lib/server/auth', () => ({ getUserFromRequest: mocks.user }));
vi.mock('@/lib/features/availability', () => ({ isFeatureEnabled: () => true }));
vi.mock('@/lib/server/feature-flags', () => ({ disabledApiResponse: vi.fn() }));
vi.mock('@/lib/server/csrf', () => ({ isSameOrigin: () => true }));
vi.mock('@/lib/server/rateLimit', () => ({ rateLimit: vi.fn(), makeRateLimitKey: vi.fn() }));
vi.mock('@/lib/server/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { GET as callback } from '@/app/api/payments/callback/route';
import { GET as confirm } from '@/app/api/subscription/confirm/route';

function request(path: string, query = 'Authority=test-authority-123&Status=OK') {
  return new NextRequest(`https://localhost:3000${path}?${query}`, {
    headers: { 'x-forwarded-host': 'untrusted.example', 'x-forwarded-proto': 'http' },
  });
}

describe('payment return redirects behind a reverse proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://persiantoolbox.ir');
    mocks.user.mockResolvedValue({ id: 'test-user' });
    mocks.payment.mockResolvedValue({ id: 'test-payment', userId: 'test-user' });
    mocks.verify.mockResolvedValue({ success: true, payment: { id: 'test-payment' } });
  });
  afterEach(() => vi.unstubAllEnvs());

  it.each([
    ['payment callback', callback, '/api/payments/callback'],
    ['subscription confirmation', confirm, '/api/subscription/confirm'],
  ] as const)('%s keeps success on the configured public origin', async (_, handler, path) => {
    const response = await handler(request(path));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://persiantoolbox.ir/payments/success?paymentId=test-payment',
    );
    expect(mocks.verify).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['payment callback', callback, '/api/payments/callback'],
    ['subscription confirmation', confirm, '/api/subscription/confirm'],
  ] as const)('%s keeps verification failures on the public origin', async (_, handler, path) => {
    mocks.verify.mockResolvedValue({ success: false, error: 'Payment pending' });
    const response = await handler(request(path));
    const location = new URL(response.headers.get('location') ?? '');
    expect(location.origin).toBe('https://persiantoolbox.ir');
    expect(location.pathname).toBe('/payments/failure');
  });

  it('keeps callback exceptions on the public failure page', async () => {
    mocks.verify.mockRejectedValue(new Error('test-only verifier failure'));
    const response = await callback(request('/api/payments/callback'));
    expect(new URL(response.headers.get('location') ?? '').origin).toBe(
      'https://persiantoolbox.ir',
    );
  });

  it('keeps a canceled subscription callback on the public failure page', async () => {
    const response = await confirm(request('/api/subscription/confirm', 'Status=NOK'));
    expect(new URL(response.headers.get('location') ?? '').origin).toBe(
      'https://persiantoolbox.ir',
    );
    expect(mocks.verify).not.toHaveBeenCalled();
  });

  it('keeps the login redirect on the public origin without verifying a guest payment', async () => {
    mocks.user.mockResolvedValue(null);
    const response = await confirm(request('/api/subscription/confirm'));
    const location = new URL(response.headers.get('location') ?? '');
    expect(location.origin).toBe('https://persiantoolbox.ir');
    expect(location.pathname).toBe('/account');
    expect(mocks.verify).not.toHaveBeenCalled();
  });

  it('rejects an invalid authority on the public origin without verification', async () => {
    const response = await confirm(request('/api/subscription/confirm', 'Status=OK'));
    const location = new URL(response.headers.get('location') ?? '');
    expect(location.origin).toBe('https://persiantoolbox.ir');
    expect(location.pathname).toBe('/payments/failure');
    expect(mocks.payment).not.toHaveBeenCalled();
    expect(mocks.verify).not.toHaveBeenCalled();
  });

  it.each([null, { id: 'test-payment', userId: 'another-user' }])(
    'rejects an unavailable or foreign payment without verification (%j)',
    async (payment) => {
      mocks.payment.mockResolvedValue(payment);
      const response = await confirm(request('/api/subscription/confirm'));
      const location = new URL(response.headers.get('location') ?? '');
      expect(location.origin).toBe('https://persiantoolbox.ir');
      expect(location.pathname).toBe('/payments/failure');
      expect(mocks.verify).not.toHaveBeenCalled();
    },
  );
});
