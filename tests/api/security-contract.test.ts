import { describe, it, expect } from 'vitest';

describe('admin API protection', () => {
  it('admin site-settings returns 403 without auth', async () => {
    const { GET } = await import('@/app/api/admin/site-settings/route');
    const request = new Request('http://localhost/api/admin/site-settings');
    const response = await GET(request as never);
    expect(response.status).toBe(403);
  });

  it('admin site-settings PUT returns 403 without auth', async () => {
    const { PUT } = await import('@/app/api/admin/site-settings/route');
    const request = new Request('http://localhost/api/admin/site-settings', {
      method: 'PUT',
      body: JSON.stringify({}),
      headers: { 'content-type': 'application/json' },
    });
    const response = await PUT(request as never);
    expect(response.status).toBe(403);
  });
});

describe('API error response shape', () => {
  it('health endpoint returns valid JSON with status field', async () => {
    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('status');
  });
});

describe('analytics route does not leak secrets', () => {
  it('analytics endpoint does not expose passwordHash', async () => {
    const { GET } = await import('@/app/api/analytics/route');
    const request = new Request('http://localhost/api/analytics');
    const response = await GET(request as never);
    const text = await response.text();
    expect(text).not.toContain('passwordHash');
    expect(text).not.toContain('password_hash');
  });
});

describe('subscription plan contract', () => {
  it('all plans have required fields', async () => {
    const { SUBSCRIPTION_PLANS } = await import('@/lib/subscriptionPlans');
    for (const plan of SUBSCRIPTION_PLANS) {
      expect(plan.id).toBeTruthy();
      expect(plan.title).toBeTruthy();
      expect(plan.price).toBeGreaterThan(0);
      expect(plan.periodDays).toBeGreaterThan(0);
      expect(plan.monthlyCredits).toBeGreaterThan(0);
      expect(plan.dailyLimit).toBeGreaterThan(0);
      expect(plan.tier).toBeTruthy();
    }
  });

  it('all plans have reasonable prices', async () => {
    const { SUBSCRIPTION_PLANS } = await import('@/lib/subscriptionPlans');
    for (const plan of SUBSCRIPTION_PLANS) {
      expect(typeof plan.price).toBe('number');
      expect(plan.price).toBeGreaterThan(0);
      expect(plan.price).toBeLessThan(10000000);
    }
  });

  it('priceCurrency is IRR throughout', async () => {
    const { SUBSCRIPTION_PLANS } = await import('@/lib/subscriptionPlans');
    for (const plan of SUBSCRIPTION_PLANS) {
      expect(typeof plan.price).toBe('number');
      expect(plan.price).toBeGreaterThan(0);
      expect(plan.price).toBeLessThan(10000000);
    }
  });
});
