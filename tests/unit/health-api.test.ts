import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
  });

  it('returns version info', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.version).toBeTruthy();
    expect(typeof data.version).toBe('string');
  });

  it('returns timestamp', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.timestamp).toBeTruthy();
    expect(new Date(data.timestamp).getTime()).not.toBeNaN();
  });

  it('returns uptime as number', async () => {
    const response = await GET();
    const data = await response.json();

    expect(typeof data.uptime).toBe('number');
    expect(data.uptime).toBeGreaterThanOrEqual(0);
  });

  it('returns memory usage', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.memory).toBeDefined();
    expect(typeof data.memory.rss).toBe('number');
    expect(typeof data.memory.heapUsed).toBe('number');
    expect(data.memory.rss).toBeGreaterThan(0);
  });

  it('returns node version', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.node).toBeTruthy();
    expect(data.node).toMatch(/^v\d+/);
  });
});
