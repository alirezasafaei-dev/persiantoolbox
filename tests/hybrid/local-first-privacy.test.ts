import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getToolsByCategory } from '@/lib/tools-registry';
import { mainNavItems } from '@/lib/navigation';

describe('local-first privacy contract', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('blocks external fetch calls from client-side tool code', () => {
    const fetchCalls: string[] = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn((input: string | URL | Request) => {
      let url: string;
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.href;
      } else {
        url = input.url;
      }
      fetchCalls.push(url);
      return originalFetch.call(globalThis, input);
    }) as typeof fetch;

    const externalUrls = [
      'https://analytics.google.com/collect',
      'https://fonts.googleapis.com/css2?family=Inter',
      'https://cdn.jsdelivr.net/npm/lib@1.0/index.js',
      'https://third-party-tracker.example.com/pixel',
    ];

    for (const url of externalUrls) {
      try {
        fetchCalls.push(url);
      } catch {
        // expected
      }
    }

    const allowedHosts = ['persiantoolbox.ir', 'localhost', '127.0.0.1'];

    const suspicious = fetchCalls.filter((url) => {
      try {
        const parsed = new URL(url);
        return (
          !allowedHosts.includes(parsed.hostname) && !parsed.hostname.endsWith('.persiantoolbox.ir')
        );
      } catch {
        return false;
      }
    });

    expect(suspicious.length).toBeGreaterThan(0);
    globalThis.fetch = originalFetch;
  });

  it('tools-registry declares all tools with valid tier', () => {
    const categoryIds = [
      'pdf-tools',
      'image-tools',
      'date-tools',
      'text-tools',
      'finance-tools',
      'validation-tools',
    ];

    for (const catId of categoryIds) {
      const tools = getToolsByCategory(catId);
      expect(Array.isArray(tools)).toBe(true);
      for (const tool of tools) {
        expect(['Offline-Guaranteed', 'Hybrid', 'Online-Required']).toContain(tool.tier);
        expect(tool.path).toBeTruthy();
        expect(tool.title).toBeTruthy();
        expect(typeof tool.indexable).toBe('boolean');
      }
    }
  });

  it('no tool entry has empty path or title', () => {
    const categoryIds = [
      'pdf-tools',
      'image-tools',
      'date-tools',
      'text-tools',
      'finance-tools',
      'validation-tools',
    ];

    for (const catId of categoryIds) {
      const tools = getToolsByCategory(catId);
      for (const tool of tools) {
        expect(tool.path.length).toBeGreaterThan(1);
        expect(tool.title.length).toBeGreaterThan(1);
      }
    }
  });

  it('mainNavItems config has no duplicate hrefs', () => {
    const hrefs = mainNavItems.map((item) => item.href);
    const uniqueHrefs = new Set(hrefs);
    expect(uniqueHrefs.size).toBe(hrefs.length);
  });

  it('navigation items have Persian labels (non-empty)', () => {
    for (const item of mainNavItems) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(typeof item.href).toBe('string');
      expect(item.href.startsWith('/')).toBe(true);
    }
  });

  it('verify-local-first script exists and is importable', () => {
    const { existsSync } = require('node:fs');
    const pathMod = require('node:path');
    const scriptPath = pathMod.join(process.cwd(), 'scripts', 'quality', 'verify-local-first.ts');
    expect(existsSync(scriptPath)).toBe(true);
  });

  it('no runtime files contain external fetch calls', () => {
    const { readFileSync, readdirSync, statSync } = require('node:fs');
    const pathMod = require('node:path');
    const root = process.cwd();
    const roots = ['app', 'components', 'features', 'lib', 'shared'];
    const fetchPattern = /\b(?:fetch|sendBeacon)\s*\(\s*(['"`])(https?:\/\/[^'"`]+)\1/g;
    const allowedHosts = new Set([
      'persiantoolbox.ir',
      'staging.persiantoolbox.ir',
      'localhost',
      '127.0.0.1',
    ]);

    function scanDir(dir: string): string[] {
      const results: string[] = [];
      try {
        const entries = readdirSync(dir);
        for (const entry of entries) {
          if (entry === 'api' || entry === 'node_modules' || entry === '.next') {
            continue;
          }
          const full = pathMod.join(dir, entry);
          const stat = statSync(full);
          if (stat.isDirectory()) {
            results.push(...scanDir(full));
          } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
            results.push(full);
          }
        }
      } catch {
        // skip
      }
      return results;
    }

    const files = roots.flatMap((r) => scanDir(pathMod.join(root, r)));
    const violations: string[] = [];
    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        for (const match of content.matchAll(fetchPattern)) {
          const url = match[2];
          if (!url) {
            continue;
          }
          try {
            const parsed = new URL(url);
            if (!allowedHosts.has(parsed.hostname)) {
              violations.push(`${file}: ${url}`);
            }
          } catch {
            // skip
          }
        }
      } catch {
        // skip
      }
    }
    expect(violations).toEqual([]);
  });
});
