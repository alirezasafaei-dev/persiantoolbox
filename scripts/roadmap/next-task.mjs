#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const tasksDir = resolve(root, 'tasks-next');

function parseArgs(argv) {
  const args = {
    phase: 'any',
    format: 'json',
  };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--phase' && argv[i + 1]) {
      args.phase = argv[i + 1].toUpperCase();
      i += 1;
      continue;
    }
    if (token === '--format' && argv[i + 1]) {
      args.format = argv[i + 1];
      i += 1;
      continue;
    }
  }
  return args;
}

function parseTask(fileName) {
  const fullPath = resolve(tasksDir, fileName);
  const content = readFileSync(fullPath, 'utf8');
  const id = (content.match(/^# ID:\s*(.+)$/m)?.[1] ?? fileName.replace('.md', '')).trim();
  const title = (content.match(/^## Title\s*[\r\n]+([\s\S]*?)\n##/m)?.[1] ?? '')
    .trim()
    .replace(/\s+/g, ' ');
  const status =
    (content.match(/^## Status\s*[\r\n]+([A-Z_]+)/m)?.[1] ?? 'UNKNOWN').trim().toUpperCase();

  const match = /^NP(\d+)-/i.exec(id);
  const phaseNum = match?.[1] ?? '9';
  const phaseKey = `NP${phaseNum}`;
  return { id, title, status, phaseKey, fileName };
}

function formatTable(items) {
  const lines = [];
  lines.push('ID | Phase | Status | Title');
  lines.push('---|---|---|---');
  for (const item of items) {
    lines.push(`${item.id} | ${item.phaseKey} | ${item.status} | ${item.title}`);
  }
  return `${lines.join('\n')}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const files = readdirSync(tasksDir)
    .filter((name) => /^NP\d+-\d+\.md$/i.test(name))
    .sort();

  const tasks = files.map(parseTask);
  const filtered =
    args.phase === 'ANY' || args.phase === 'any'
      ? tasks
      : tasks.filter((task) => task.phaseKey === args.phase);

  const next = filtered.find((task) => task.status !== 'DONE') ?? null;
  const result = {
    generatedAt: new Date().toISOString(),
    phaseFilter: args.phase,
    totals: {
      all: filtered.length,
      done: filtered.filter((task) => task.status === 'DONE').length,
      remaining: filtered.filter((task) => task.status !== 'DONE').length,
    },
    next,
    queue: filtered,
  };

  if (args.format === 'table') {
    const queue = next ? [next] : [];
    process.stdout.write(formatTable(queue));
    return;
  }

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main();
