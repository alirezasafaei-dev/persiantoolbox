import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildCsp } from '@/proxy';

describe('proxy CSP script-src policy', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not include unsafe-eval in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const csp = buildCsp('nonce-prod');

    expect(csp).toContain("script-src 'self' 'nonce-nonce-prod'");
    expect(csp).not.toContain('unsafe-eval');
  });

  it('includes unsafe-eval outside production for dev runtime compatibility', () => {
    vi.stubEnv('NODE_ENV', 'development');

    const csp = buildCsp('nonce-dev');

    expect(csp).toContain("script-src 'self' 'nonce-nonce-dev' 'unsafe-eval'");
  });
});
