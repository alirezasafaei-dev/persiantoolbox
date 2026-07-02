import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildCsp } from '@/proxy';

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

  it('allows inline styles required by the rendered Next.js runtime', () => {
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
});
