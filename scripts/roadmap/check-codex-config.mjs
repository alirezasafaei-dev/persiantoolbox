#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const checkerPath = resolve(root, 'scripts/codex/bootstrap.mjs');

const run = spawnSync('node', [checkerPath, '--check'], {
  cwd: root,
  encoding: 'utf8',
  stdio: 'inherit',
});

process.exit(run.status ?? 1);
