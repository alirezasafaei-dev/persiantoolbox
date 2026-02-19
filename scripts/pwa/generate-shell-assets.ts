import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { toolsRegistry } from '@/lib/tools-registry';

type Mode = 'write' | 'check';

const mode: Mode = process.argv.includes('--check') ? 'check' : 'write';
const outputJsonPath = resolve(process.cwd(), 'data/pwa/shell-assets.generated.json');
const swPath = resolve(process.cwd(), 'public/sw.js');

const coreAssets = ['/', '/offline', '/manifest.webmanifest'];
const topToolRoutes = [
  '/tools',
  '/pdf-tools',
  '/image-tools',
  '/date-tools',
  '/text-tools',
  '/loan',
  '/salary',
];

function uniqueOrdered(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
}

function generateAssets(): string[] {
  const offlineRegistryRoutes = toolsRegistry
    .filter(
      (entry) =>
        entry.tier === 'Offline-Guaranteed' && (entry.kind === 'hub' || entry.kind === 'category'),
    )
    .map((entry) => entry.path)
    .sort((a, b) => a.localeCompare(b, 'en'));

  return uniqueOrdered([...coreAssets, ...offlineRegistryRoutes, ...topToolRoutes]);
}

function renderJson(assets: string[]): string {
  return `${JSON.stringify(
    {
      source: 'lib/tools-registry.ts',
      assets,
    },
    null,
    2,
  )}\n`;
}

function renderSwArrayBlock(assets: string[], indent: string): string {
  const lines = assets.map((asset) => `${indent}'${asset}',`);
  return [
    `${indent}/* GENERATED_SHELL_ASSETS_START */`,
    ...lines,
    `${indent}/* GENERATED_SHELL_ASSETS_END */`,
  ].join('\n');
}

function updateSwSource(source: string, assets: string[]): string {
  const blockPattern =
    /(^[ \t]*)\/\* GENERATED_SHELL_ASSETS_START \*\/[\s\S]*?^[ \t]*\/\* GENERATED_SHELL_ASSETS_END \*\//m;
  const match = source.match(blockPattern);
  if (!match) {
    throw new Error('SW generated block markers not found in public/sw.js');
  }
  const indent = match[1] ?? '';
  const block = renderSwArrayBlock(assets, indent);
  return source.replace(blockPattern, block);
}

function checkFileContent(path: string, next: string): boolean {
  try {
    const current = readFileSync(path, 'utf8');
    return current === next;
  } catch {
    return false;
  }
}

function main() {
  const assets = generateAssets();
  const nextJson = renderJson(assets);

  const swSource = readFileSync(swPath, 'utf8');
  const nextSw = updateSwSource(swSource, assets);

  if (mode === 'check') {
    const jsonOk = checkFileContent(outputJsonPath, nextJson);
    const swOk = swSource === nextSw;
    if (!jsonOk || !swOk) {
      // eslint-disable-next-line no-console
      console.error('[pwa] shell assets are out of date; run `pnpm pwa:shell:generate`');
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.log(`[pwa] shell assets are up to date (${assets.length} routes/assets)`);
    return;
  }

  mkdirSync(dirname(outputJsonPath), { recursive: true });
  writeFileSync(outputJsonPath, nextJson, 'utf8');
  writeFileSync(swPath, nextSw, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`[pwa] generated shell assets (${assets.length} routes/assets)`);
}

main();
