import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/analytics/route';
import { getAnalyticsSummary, ingestAnalyticsEvents } from '@/lib/analyticsStore';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';

vi.mock('@/lib/analyticsStore', () => ({
  ingestAnalyticsEvents: vi.fn(),
  getAnalyticsSummary: vi.fn(),
}));

vi.mock('@/lib/server/adminAuth', () => ({
  requireAdminFromRequest: vi.fn(),
}));

const ORIGINAL_ENV = {
  NODE_ENV: process.env['NODE_ENV'],
  NEXT_PUBLIC_ANALYTICS_ID: process.env['NEXT_PUBLIC_ANALYTICS_ID'],
  ANALYTICS_INGEST_SECRET: process.env['ANALYTICS_INGEST_SECRET'],
};

const mockIngestAnalyticsEvents = vi.mocked(ingestAnalyticsEvents);
const mockGetAnalyticsSummary = vi.mocked(getAnalyticsSummary);
const mockRequireAdminFromRequest = vi.mocked(requireAdminFromRequest);

beforeEach(() => {
  vi.resetAllMocks();
  Reflect.set(process.env, 'NODE_ENV', 'development');
  process.env['NEXT_PUBLIC_ANALYTICS_ID'] = 'analytics-id';
  delete process.env['ANALYTICS_INGEST_SECRET'];
});

afterEach(() => {
  Reflect.set(process.env, 'NODE_ENV', ORIGINAL_ENV.NODE_ENV);
  if (typeof ORIGINAL_ENV.NEXT_PUBLIC_ANALYTICS_ID === 'string') {
    process.env['NEXT_PUBLIC_ANALYTICS_ID'] = ORIGINAL_ENV.NEXT_PUBLIC_ANALYTICS_ID;
  } else {
    delete process.env['NEXT_PUBLIC_ANALYTICS_ID'];
  }
  if (typeof ORIGINAL_ENV.ANALYTICS_INGEST_SECRET === 'string') {
    process.env['ANALYTICS_INGEST_SECRET'] = ORIGINAL_ENV.ANALYTICS_INGEST_SECRET;
  } else {
    delete process.env['ANALYTICS_INGEST_SECRET'];
  }
});

describe('/api/analytics POST', () => {
  it('returns disabled when analytics id is not configured', async () => {
    delete process.env['NEXT_PUBLIC_ANALYTICS_ID'];
    const request = new Request('http://localhost/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ id: 'x', events: [{ metadata: { consentGranted: true } }] }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('requires ingest secret in production', async () => {
    Reflect.set(process.env, 'NODE_ENV', 'production');
    delete process.env['ANALYTICS_INGEST_SECRET'];

    const request = new Request('http://localhost/api/analytics', {
      method: 'POST',
      body: JSON.stringify({
        id: 'analytics-id',
        events: [
          {
            event: 'page_view',
            timestamp: Date.now(),
            path: '/',
            metadata: { consentGranted: true },
          },
        ],
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(503);
  });

  it('rejects invalid ingest secret in production', async () => {
    Reflect.set(process.env, 'NODE_ENV', 'production');
    process.env['ANALYTICS_INGEST_SECRET'] = 'secret';

    const request = new Request('http://localhost/api/analytics', {
      method: 'POST',
      body: JSON.stringify({
        id: 'analytics-id',
        events: [
          {
            event: 'page_view',
            timestamp: Date.now(),
            path: '/',
            metadata: { consentGranted: true },
          },
        ],
      }),
      headers: { 'content-type': 'application/json', 'x-pt-analytics-secret': 'wrong' },
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it('accepts valid payload with secret in production', async () => {
    Reflect.set(process.env, 'NODE_ENV', 'production');
    process.env['ANALYTICS_INGEST_SECRET'] = 'secret';
    mockIngestAnalyticsEvents.mockResolvedValue({
      lastUpdated: 123,
      totalEvents: 1,
      eventCounts: { page_view: 1 },
      pathCounts: { '/': 1 },
      version: 1,
    });

    const request = new Request('http://localhost/api/analytics', {
      method: 'POST',
      body: JSON.stringify({
        id: 'analytics-id',
        events: [
          {
            event: 'page_view',
            timestamp: Date.now(),
            path: '/',
            metadata: { consentGranted: true },
          },
        ],
      }),
      headers: { 'content-type': 'application/json', 'x-pt-analytics-secret': 'secret' },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockIngestAnalyticsEvents).toHaveBeenCalledOnce();
  });

  it('rejects events without consent metadata', async () => {
    const request = new Request('http://localhost/api/analytics', {
      method: 'POST',
      body: JSON.stringify({
        id: 'analytics-id',
        events: [{ event: 'page_view', timestamp: Date.now(), path: '/' }],
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it('rejects oversized event payload', async () => {
    const events = Array.from({ length: 201 }, (_, index) => ({
      event: 'page_view',
      timestamp: Date.now() + index,
      path: '/',
      metadata: { consentGranted: true },
    }));
    const request = new Request('http://localhost/api/analytics', {
      method: 'POST',
      body: JSON.stringify({
        id: 'analytics-id',
        events,
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(413);
  });
});

describe('/api/analytics GET', () => {
  it('requires admin authentication', async () => {
    mockRequireAdminFromRequest.mockResolvedValue({ ok: false, status: 401 });
    const request = new Request('http://localhost/api/analytics', { method: 'GET' });
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('returns summary for admin with valid production secret', async () => {
    Reflect.set(process.env, 'NODE_ENV', 'production');
    process.env['ANALYTICS_INGEST_SECRET'] = 'secret';
    mockRequireAdminFromRequest.mockResolvedValue({
      ok: true,
      user: { id: '1', email: 'admin@example.com', passwordHash: 'x', createdAt: Date.now() },
    });
    mockGetAnalyticsSummary.mockResolvedValue({
      lastUpdated: 123,
      totalEvents: 2,
      eventCounts: { page_view: 2 },
      pathCounts: { '/': 2 },
      version: 1,
    });

    const request = new Request('http://localhost/api/analytics', {
      method: 'GET',
      headers: { 'x-pt-analytics-secret': 'secret' },
    });
    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(mockGetAnalyticsSummary).toHaveBeenCalledOnce();
  });

  it('rejects admin summary request with invalid production secret', async () => {
    Reflect.set(process.env, 'NODE_ENV', 'production');
    process.env['ANALYTICS_INGEST_SECRET'] = 'secret';
    mockRequireAdminFromRequest.mockResolvedValue({
      ok: true,
      user: { id: '1', email: 'admin@example.com', passwordHash: 'x', createdAt: Date.now() },
    });

    const request = new Request('http://localhost/api/analytics', {
      method: 'GET',
      headers: { 'x-pt-analytics-secret': 'wrong' },
    });
    const response = await GET(request);
    expect(response.status).toBe(403);
  });
});
