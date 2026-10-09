import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { buildCsp, buildReportOnlyCsp, buildStrictCsp, proxy } from '@/proxy';

describe('proxy CSP script-src policy', () => {
  it('allows same-origin WASM only in the direct OCR worker response', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const worker = proxy(new NextRequest('https://persiantoolbox.ir/ocr/v7/worker.min.js'));
    const expected = "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'";
    expect(worker.headers.get('Content-Security-Policy')).toBe(expected);
    expect(worker.headers.get('Content-Security-Policy-Report-Only')).toBe(expected);
    for (const pathname of ['/pdf-tools/persian-ocr', '/ocr/v7/worker.min.js/other']) {
      const page = proxy(new NextRequest(`https://persiantoolbox.ir${pathname}`));
      expect(page.headers.get('Content-Security-Policy')).not.toContain('wasm-unsafe-eval');
      expect(page.headers.get('Content-Security-Policy')).toContain("'nonce-");
    }
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not include unsafe-eval in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const csp = buildCsp('test-nonce');

    expect(csp).toContain("script-src 'self' 'nonce-test-nonce'");
    expect(csp).toContain('upgrade-insecure-requests');
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
  });

  it('keeps the enforced style policy compatible with static Next.js output', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const csp = buildCsp('test-nonce');

    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain('style-src-attr');
  });

  it('includes unsafe-eval outside production for dev runtime compatibility', () => {
    vi.stubEnv('NODE_ENV', 'development');

    const csp = buildCsp('test-nonce');

    expect(csp).toContain("script-src 'self' 'nonce-test-nonce' 'unsafe-eval'");
  });

  it('keeps report-only compatible and omits enforced-only upgrade directive', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const csp = buildReportOnlyCsp('test-nonce');

    expect(csp).toContain("script-src 'self' 'nonce-test-nonce'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain('upgrade-insecure-requests');
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
