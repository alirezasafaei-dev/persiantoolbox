import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildCsp, buildReportOnlyCsp, buildStrictCsp } from '@/proxy';

describe('proxy CSP script-src policy', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not include unsafe-eval in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const csp = buildCsp();

    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain('upgrade-insecure-requests');
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

  it('keeps report-only compatible and omits enforced-only upgrade directive', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const csp = buildReportOnlyCsp();

    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain('upgrade-insecure-requests');
    expect(csp).not.toContain('nonce-');
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
});
