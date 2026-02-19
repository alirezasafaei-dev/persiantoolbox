#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';

const ROOT = process.cwd();
const SEARCH_DIRS = ['app', 'components', 'features', 'shared'];
const APP_DIR = resolve(ROOT, 'app');
const PUBLIC_DIR = resolve(ROOT, 'public');

const FILE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mdx']);
const ASSET_EXTENSIONS = new Set([
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.ico',
  '.xml',
  '.txt',
  '.json',
  '.webmanifest',
  '.html',
  '.woff2',
  '.woff',
  '.ttf',
]);

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      out.push(...walk(full));
      continue;
    }
    out.push(full);
  }
  return out;
}

function normalizeRouteFromPagePath(filePath) {
  const rel = relative(APP_DIR, filePath);
  const segments = rel.split(sep);
  const file = segments.pop();
  if (!file) return null;

  const baseFile = file.toLowerCase();
  if (!(baseFile === 'page.tsx' || baseFile === 'page.ts' || baseFile === 'route.ts' || baseFile === 'route.js')) {
    return null;
  }

  const isApiRoute = segments[0] === 'api';
  const cleaned = segments
    .filter((segment) => !segment.startsWith('('))
    .filter((segment) => !segment.startsWith('@'))
    .filter((segment) => segment !== '');

  if (cleaned.length === 0) {
    return '/';
  }

  const joined = `/${cleaned.join('/')}`;
  if (!isApiRoute) {
    return joined;
  }
  return joined;
}

function collectKnownRoutes() {
  const allFiles = walk(APP_DIR);
  const routes = new Set();
  for (const file of allFiles) {
    const route = normalizeRouteFromPagePath(file);
    if (route) {
      routes.add(route);
    }
  }
  return routes;
}

function toRoutePattern(route) {
  const escaped = route
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\[\.\.\.[^\]]+\\\]/g, '(.+)')
    .replace(/\\\[[^\]]+\\\]/g, '([^/]+)');
  return new RegExp(`^${escaped}$`);
}

function collectRouteMatchers(routes) {
  const dynamicRoutes = [...routes].filter((route) => route.includes('['));
  return dynamicRoutes.map((route) => ({ route, pattern: toRoutePattern(route) }));
}

function findHrefReferences(source) {
  const refs = [];
  const patterns = [
    /\bhref\s*=\s*["'`]([^"'`]+)["'`]/g,
    /\bhref\s*=\s*\{\s*["'`]([^"'`]+)["'`]\s*\}/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source)) !== null) {
      const href = match[1];
      if (typeof href === 'string') {
        refs.push(href);
      }
    }
  }
  return refs;
}

function normalizeHref(raw) {
  if (!raw || !raw.startsWith('/')) return null;
  if (raw.startsWith('//')) return null;
  if (raw.startsWith('/_next/')) return null;
  if (raw.startsWith('/#')) return null;
  const [withoutHash] = raw.split('#');
  const [withoutQuery] = withoutHash.split('?');
  if (!withoutQuery) return null;
  if (withoutQuery === '/') return '/';
  return withoutQuery.endsWith('/') && withoutQuery.length > 1
    ? withoutQuery.slice(0, -1)
    : withoutQuery;
}

function isStaticAssetPath(route) {
  return ASSET_EXTENSIONS.has(extname(route).toLowerCase());
}

function staticAssetExists(route) {
  const full = resolve(PUBLIC_DIR, `.${route}`);
  return existsSync(full);
}

function routeExists(route, knownRoutes, dynamicMatchers) {
  if (knownRoutes.has(route)) {
    return true;
  }
  if (isStaticAssetPath(route) && staticAssetExists(route)) {
    return true;
  }
  return dynamicMatchers.some(({ pattern }) => pattern.test(route));
}

function scanFilesForBrokenLinks() {
  const knownRoutes = collectKnownRoutes();
  const dynamicMatchers = collectRouteMatchers(knownRoutes);
  const files = SEARCH_DIRS.flatMap((dir) => walk(resolve(ROOT, dir))).filter((file) =>
    FILE_EXTENSIONS.has(extname(file).toLowerCase()),
  );

  const failures = [];

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const hrefs = findHrefReferences(source);
    const seen = new Set();

    for (const href of hrefs) {
      const route = normalizeHref(href);
      if (!route || seen.has(route)) {
        continue;
      }
      seen.add(route);

      if (!routeExists(route, knownRoutes, dynamicMatchers)) {
        failures.push({ file: relative(ROOT, file), href: route });
      }
    }
  }

  return failures;
}

function main() {
  const failures = scanFilesForBrokenLinks();
  if (failures.length > 0) {
    console.error('[quality] broken same-origin links detected:');
    for (const failure of failures) {
      console.error(`- ${failure.file}: ${failure.href}`);
    }
    process.exit(1);
  }
  console.log('[quality] internal-link integrity passed');
}

main();
