import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

describe('proxy hsts policy', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sets hsts for listed production hosts', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('HSTS_HOSTS', 'persiantoolbox.ir,www.persiantoolbox.ir');

    const response = proxy(new NextRequest('https://persiantoolbox.ir/tools'));

    expect(response.headers.get('strict-transport-security')).toContain('max-age=31536000');
  });

  it('skips hsts for non-listed hosts', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('HSTS_HOSTS', 'persiantoolbox.ir,www.persiantoolbox.ir');

    const response = proxy(new NextRequest('https://staging.persiantoolbox.ir/tools'));

    expect(response.headers.get('strict-transport-security')).toBeNull();
  });

  it('honors explicit disable flag in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('HSTS_HOSTS', 'persiantoolbox.ir,www.persiantoolbox.ir');
    vi.stubEnv('DISABLE_HSTS', '1');

    const response = proxy(new NextRequest('https://persiantoolbox.ir/tools'));

    expect(response.headers.get('strict-transport-security')).toBeNull();
  });

  it('uses x-forwarded-host when edge rewrites host header', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('HSTS_HOSTS', 'persiantoolbox.ir,www.persiantoolbox.ir');

    const response = proxy(
      new NextRequest('http://127.0.0.1/tools', {
        headers: {
          host: '127.0.0.1',
          'x-forwarded-host': 'persiantoolbox.ir',
        },
      }),
    );

    expect(response.headers.get('strict-transport-security')).toContain('max-age=31536000');
  });
});
