#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const configPath = resolve(root, 'mcp-config.toml');

function extractTomlString(content, keyPattern) {
  const match = content.match(keyPattern);
  return match?.[1] ?? null;
}

function main() {
  const raw = readFileSync(configPath, 'utf8');
  const workspace =
    extractTomlString(raw, /CODEX_WORKSPACE\s*=\s*"([^"]+)"/) ??
    extractTomlString(raw, /PROJECT_PATH\s*=\s*"([^"]+)"/);

  if (!workspace) {
    console.log('[roadmap] codex-config: workspace key not found; skipped');
    return;
  }

  if (workspace !== root) {
    console.log(
      `[roadmap] codex-config warning: configured workspace '${workspace}' differs from current '${root}'`,
    );
    return;
  }

  console.log('[roadmap] codex-config: workspace aligned');
}

main();
