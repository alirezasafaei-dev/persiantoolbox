#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, dirname, join, relative, resolve } from 'node:path';

const ROOT = process.cwd();
const DOC_DIRS = ['docs'];
const DOC_FILES = ['README.md'];
const MARKDOWN_EXTENSIONS = new Set(['.md', '.mdx']);
const LINK_PATTERN = /\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const SKIP_PREFIXES = ['http://', 'https://', 'mailto:', 'tel:'];

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      out.push(...walk(full));
      continue;
    }
    if (MARKDOWN_EXTENSIONS.has(extname(entry).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

function slugifyHeading(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[`*_~]+/g, '')
    .replace(/[^\u0600-\u06ff\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function collectAnchors(filePath) {
  const source = readFileSync(filePath, 'utf8');
  const anchors = new Set();
  for (const line of source.split(/\r?\n/)) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line.trim());
    if (!heading) continue;
    anchors.add(slugifyHeading(heading[2]));
  }
  return anchors;
}

function normalizeTarget(raw) {
  if (!raw || SKIP_PREFIXES.some((prefix) => raw.startsWith(prefix))) {
    return null;
  }
  const [pathPart, anchor = ''] = raw.split('#');
  return { pathPart, anchor };
}

function resolveDocPath(fromFile, targetPath) {
  if (!targetPath) {
    return fromFile;
  }
  if (targetPath.startsWith('/')) {
    return resolve(ROOT, `.${targetPath}`);
  }
  return resolve(dirname(fromFile), targetPath);
}

function collectMarkdownFiles() {
  return [
    ...DOC_FILES.map((file) => resolve(ROOT, file)).filter((file) => existsSync(file)),
    ...DOC_DIRS.flatMap((dir) => walk(resolve(ROOT, dir))),
  ];
}

function main() {
  const files = collectMarkdownFiles();
  const anchorCache = new Map();
  const failures = [];

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(LINK_PATTERN)) {
      const rawTarget = match[1];
      const target = normalizeTarget(rawTarget);
      if (!target) continue;

      const resolvedPath = resolveDocPath(file, target.pathPart);
      if (!existsSync(resolvedPath)) {
        failures.push(`${relative(ROOT, file)} -> ${rawTarget} (missing target)`);
        continue;
      }

      if (target.anchor) {
        if (!anchorCache.has(resolvedPath)) {
          anchorCache.set(resolvedPath, collectAnchors(resolvedPath));
        }
        const anchors = anchorCache.get(resolvedPath);
        if (!anchors.has(slugifyHeading(target.anchor))) {
          failures.push(`${relative(ROOT, file)} -> ${rawTarget} (missing anchor)`);
        }
      }
    }
  }

  if (failures.length > 0) {
    console.error('[quality] documentation link check failed');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(`[quality] documentation links passed (${files.length} files)`);
}

main();
