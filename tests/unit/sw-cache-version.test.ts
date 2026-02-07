import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Service worker cache version contract', () => {
  it('keeps CACHE_VERSION in expected format and derivations', () => {
    const source = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');
    const versionMatch = source.match(/const CACHE_VERSION = '([^']+)'/);

    expect(versionMatch).toBeTruthy();
    const cacheVersion = versionMatch?.[1] ?? '';
    expect(cacheVersion).toMatch(/^v\d{1,3}-\d{4}-\d{2}-\d{2}$/);

    expect(source).toContain('const SHELL_CACHE = `persian-tools-shell-${CACHE_VERSION}`;');
    expect(source).toContain('const RUNTIME_CACHE = `persian-tools-runtime-${CACHE_VERSION}`;');
  });
});
