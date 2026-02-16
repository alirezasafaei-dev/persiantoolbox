import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('service worker pro route policy', () => {
  it('enforces network-only behavior for /pro routes', () => {
    const source = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');

    expect(source).toContain("const PRO_PREFIX = '/pro';");
    expect(source).toContain(
      'url.pathname === PRO_PREFIX || url.pathname.startsWith(`${PRO_PREFIX}/`)',
    );
    expect(source).toContain("event.respondWith(fetch(request, { cache: 'no-store' }));");
  });
});
