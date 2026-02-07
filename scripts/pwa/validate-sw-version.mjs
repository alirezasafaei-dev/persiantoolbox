import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const swPath = resolve(process.cwd(), 'public/sw.js');
const source = readFileSync(swPath, 'utf8');

const match = source.match(/const CACHE_VERSION = '([^']+)'/);
if (!match) {
  console.error('[pwa] CACHE_VERSION not found in public/sw.js');
  process.exit(1);
}

const cacheVersion = match[1];
const formatOk = /^v\d{1,3}-\d{4}-\d{2}-\d{2}$/.test(cacheVersion);
if (!formatOk) {
  console.error(
    `[pwa] Invalid CACHE_VERSION format: ${cacheVersion} (expected v<major>-YYYY-MM-DD)`,
  );
  process.exit(1);
}

if (!source.includes('const SHELL_CACHE = `persian-tools-shell-${CACHE_VERSION}`;')) {
  console.error('[pwa] SHELL_CACHE is not derived from CACHE_VERSION');
  process.exit(1);
}

if (!source.includes('const RUNTIME_CACHE = `persian-tools-runtime-${CACHE_VERSION}`;')) {
  console.error('[pwa] RUNTIME_CACHE is not derived from CACHE_VERSION');
  process.exit(1);
}

console.log(`[pwa] CACHE_VERSION is valid: ${cacheVersion}`);
