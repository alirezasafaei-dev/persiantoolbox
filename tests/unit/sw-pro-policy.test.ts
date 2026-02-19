import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('service worker pro route policy', () => {
  it('enforces network-only behavior for online-required routes', () => {
    const source = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');

    expect(source).toContain("const ONLINE_REQUIRED_PATHS = ['/pro', '/account', '/dashboard'];");
    expect(source).toContain("const ONLINE_REQUIRED_PREFIXES = ['/pro/', '/checkout/'];");
    expect(source).toContain(
      'ONLINE_REQUIRED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))',
    );
    expect(source).toContain("event.respondWith(fetch(request, { cache: 'no-store' }));");
  });
});
