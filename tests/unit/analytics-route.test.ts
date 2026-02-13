import { beforeEach, describe, expect, it, vi } from 'vitest';

const ingestAnalyticsEvents = vi.fn();

vi.mock('@/lib/analyticsStore', () => ({
  ingestAnalyticsEvents,
}));

type AnalyticsRoute = typeof import('@/app/api/analytics/route');

function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://persiantoolbox.ir/api/analytics', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('analytics api route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns disabled when analytics id is not configured', async () => {
    const { POST } = (await import('@/app/api/analytics/route')) as AnalyticsRoute;
    const response = await POST(makeRequest({ id: 'x', events: [] }));
    expect(response.status).toBe(400);
  });

  it('requires ingest secret in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ID', 'analytics-id');

    const { POST } = (await import('@/app/api/analytics/route')) as AnalyticsRoute;
    const response = await POST(
      makeRequest({
        id: 'analytics-id',
        events: [
          { event: 'view', timestamp: Date.now(), path: '/', metadata: { consentGranted: true } },
        ],
      }),
    );

    expect(response.status).toBe(503);
  });

  it('requires ingest secret when strict analytics policy flag is enabled', async () => {
    vi.stubEnv('FEATURE_V3_ANALYTICS_POLICY', '1');
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ID', 'analytics-id');

    const { POST } = (await import('@/app/api/analytics/route')) as AnalyticsRoute;
    const response = await POST(
      makeRequest({
        id: 'analytics-id',
        events: [
          { event: 'view', timestamp: Date.now(), path: '/', metadata: { consentGranted: true } },
        ],
      }),
    );

    expect(response.status).toBe(503);
  });

  it('rejects invalid request id or consent contract', async () => {
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ID', 'analytics-id');

    const { POST } = (await import('@/app/api/analytics/route')) as AnalyticsRoute;
    const response = await POST(
      makeRequest({
        id: 'wrong-id',
        events: [
          { event: 'view', timestamp: Date.now(), path: '/', metadata: { consentGranted: true } },
        ],
      }),
    );

    expect(response.status).toBe(403);
  });

  it('accepts valid payload and forwards events to store', async () => {
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ID', 'analytics-id');
    ingestAnalyticsEvents.mockResolvedValue({
      version: 1,
      totalEvents: 1,
      lastUpdated: Date.now(),
      eventCounts: { view: 1 },
      pathCounts: { '/': 1 },
    });

    const { POST } = (await import('@/app/api/analytics/route')) as AnalyticsRoute;
    const response = await POST(
      makeRequest({
        id: 'analytics-id',
        events: [
          { event: 'view', timestamp: Date.now(), path: '/', metadata: { consentGranted: true } },
        ],
      }),
    );

    expect(response.status).toBe(200);
    expect(ingestAnalyticsEvents).toHaveBeenCalledTimes(1);
  });
});
