import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

describe('analytics ingest proxy contract', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('adds the server-only ingest secret to the internal analytics request', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ANALYTICS_INGEST_SECRET', 'server-only-secret');

    const response = proxy(
      new NextRequest('https://persiantoolbox.ir/api/analytics', { method: 'POST' }),
    );

    expect(response.headers.get('x-middleware-request-x-pt-analytics-secret')).toBe(
      'server-only-secret',
    );
    expect(response.headers.get('x-pt-analytics-secret')).toBeNull();
  });

  it('does not add the ingest secret to unrelated requests', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ANALYTICS_INGEST_SECRET', 'server-only-secret');

    const response = proxy(new NextRequest('https://persiantoolbox.ir/text-tools'));

    expect(response.headers.get('x-middleware-request-x-pt-analytics-secret')).toBeNull();
    expect(response.headers.get('x-pt-analytics-secret')).toBeNull();
  });
});
