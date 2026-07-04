import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildCsp, buildStrictCsp } from '@/proxy';

describe('proxy CSP script-src policy', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not include unsafe-eval in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const csp = buildCsp();

    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain('unsafe-eval');
  });

  it('keeps the enforced style policy compatible with static Next.js output', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const csp = buildCsp();

    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain('style-src-attr');
  });

  it('includes unsafe-eval outside production for dev runtime compatibility', () => {
    vi.stubEnv('NODE_ENV', 'development');

    const csp = buildCsp();

    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
  });

  it('builds a nonce-backed report-only target policy without broad inline script or style allowances', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const csp = buildStrictCsp('test-nonce');

    expect(csp).toContain("script-src 'self' 'nonce-test-nonce'");
    expect(csp).toContain("style-src 'self' 'nonce-test-nonce'");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("style-src-attr 'unsafe-inline'");
  });

  it('enforced CSP includes unsafe-inline for Next.js hydration compatibility', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const csp = buildCsp();
    expect(csp).toContain("'unsafe-inline'");
  });

  it('report-only CSP uses nonce and avoids broad unsafe-inline for scripts/styles', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const csp = buildStrictCsp('abc123');
    expect(csp).toContain("'nonce-abc123'");
    expect(csp).not.toContain("'unsafe-inline'"); // except for style-attr
  });
});
