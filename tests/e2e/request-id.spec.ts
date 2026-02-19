import { test, expect } from '@playwright/test';

test.describe('request id propagation', () => {
  test('adds x-request-id to api responses', async ({ request }) => {
    const health = await request.get('/api/health');
    expect(health.ok()).toBeTruthy();
    const id1 = health.headers()['x-request-id'];
    expect(id1).toBeTruthy();

    const data = await request.get('/api/data/salary-laws');
    expect(data.ok() || data.status() === 304).toBeTruthy();
    const id2 = data.headers()['x-request-id'];
    expect(id2).toBeTruthy();
  });
});
