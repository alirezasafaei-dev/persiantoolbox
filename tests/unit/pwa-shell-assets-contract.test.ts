import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type ShellManifest = {
  assets: string[];
};

const REQUIRED_ROUTES = ['/offline', '/manifest.webmanifest'];
const BUDGET_MAX_ASSETS = 10;

function extractSwAssets(source: string): string[] {
  const blockMatch = source.match(
    /\/\* GENERATED_SHELL_ASSETS_START \*\/[\s\S]*?\/\* GENERATED_SHELL_ASSETS_END \*\//m,
  );
  if (!blockMatch) {
    return [];
  }
  return [...blockMatch[0].matchAll(/'([^']+)'/g)]
    .map((m) => m[1])
    .filter((value): value is string => typeof value === 'string');
}

describe('pwa shell assets contract', () => {
  it('keeps the install shell small and offline-focused', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), 'data/pwa/shell-assets.generated.json'), 'utf8'),
    ) as ShellManifest;

    expect(Array.isArray(manifest.assets)).toBe(true);
    expect(manifest.assets.length).toBeLessThanOrEqual(BUDGET_MAX_ASSETS);

    for (const route of REQUIRED_ROUTES) {
      expect(manifest.assets).toContain(route);
    }

    expect(manifest.assets).not.toContain('/');
    expect(manifest.assets.some((asset) => asset.startsWith('/tools/'))).toBe(false);
    expect(manifest.assets.some((asset) => asset.startsWith('/pdf-tools/'))).toBe(false);
  });

  it('keeps generated shell assets synced into public/sw.js', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), 'data/pwa/shell-assets.generated.json'), 'utf8'),
    ) as ShellManifest;
    const swSource = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');
    const swAssets = extractSwAssets(swSource);

    expect(swAssets).toEqual(manifest.assets);
  });
});
