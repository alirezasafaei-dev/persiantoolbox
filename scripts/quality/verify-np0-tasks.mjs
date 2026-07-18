#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const TASKS_DIR = resolve(process.cwd(), 'tasks-next');
const STATUS_SNAPSHOT = resolve(process.cwd(), 'docs/status.auto.json');
const prefix = 'NP0-';
const expectedIds = Array.from({ length: 10 }, (_, index) =>
  `${prefix}${String(index + 1).padStart(2, '0')}`,
);

function fail(message) {
  console.error(`[deploy-gate] ${message}`);
  process.exit(1);
}

function parseStatus(markdown) {
  const lines = markdown.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    const headerMatch = /^##\s*Status\b/i.exec(line);
    if (headerMatch) {
      // status may be on the same line (after colon) or on a following non-empty line
      const sameLineMatch = /status\b[^A-Za-z0-9]*([A-Za-z]+)/i.exec(line);
      if (sameLineMatch && sameLineMatch[1]) {
        return sameLineMatch[1].toUpperCase();
      }
      for (let j = i + 1; j < lines.length; j += 1) {
        const candidate = lines[j].trim();
        if (candidate.length === 0) continue;
        return candidate.toUpperCase();
      }
    }
    const inlineMatch = /^Status\b[^A-Za-z0-9]*([A-Za-z]+)/i.exec(line);
    if (inlineMatch && inlineMatch[1]) {
      return inlineMatch[1].toUpperCase();
    }
  }
  return null;
}

function verifyStatusSnapshot() {
  if (!existsSync(STATUS_SNAPSHOT)) {
    fail(`neither tasks directory nor status snapshot exists: ${STATUS_SNAPSHOT}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(STATUS_SNAPSHOT, 'utf8'));
  } catch (error) {
    fail(`invalid status snapshot: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (parsed?.version !== 1 || !Array.isArray(parsed?.task?.items)) {
    fail('status snapshot must use version 1 and contain task.items');
  }

  const np0Items = parsed.task.items.filter((item) => item?.phaseKey === 'NP0');
  const ids = np0Items.map((item) => item.id);
  const uniqueIds = new Set(ids);
  if (
    ids.length !== expectedIds.length ||
    uniqueIds.size !== expectedIds.length ||
    expectedIds.some((id) => !uniqueIds.has(id))
  ) {
    fail(`status snapshot must contain exactly ${expectedIds.join(', ')}`);
  }

  const notDone = np0Items.filter((item) => item.status !== 'DONE');
  if (notDone.length > 0) {
    fail(
      `NP0 tasks incomplete in status snapshot: ${notDone
        .map((item) => `${item.id} (Status=${item.status ?? 'missing'})`)
        .join(', ')}`,
    );
  }

  const summary = parsed.task.byPhase?.NP0;
  if (
    summary?.total !== expectedIds.length ||
    summary?.done !== expectedIds.length ||
    summary?.remaining !== 0
  ) {
    fail('status snapshot NP0 summary must report total=10, done=10, remaining=0');
  }

  console.log('[deploy-gate] all NP0 tasks are DONE (verified from docs/status.auto.json)');
}

function main() {
  if (!existsSync(TASKS_DIR)) {
    verifyStatusSnapshot();
    return;
  }

  let files;
  try {
    files = readdirSync(TASKS_DIR).filter((f) => f.startsWith(prefix) && f.endsWith('.md'));
  } catch {
    fail(`tasks directory not found: ${TASKS_DIR}`);
    return;
  }

  if (files.length === 0) {
    fail(`no ${prefix} task files found under ${TASKS_DIR}`);
  }

  const notDone = [];
  for (const file of files) {
    const full = resolve(TASKS_DIR, file);
    const content = readFileSync(full, 'utf8');
    const status = parseStatus(content);
    if (!status) {
      notDone.push({ file, reason: 'Status missing' });
      continue;
    }
    if (status !== 'DONE') {
      notDone.push({ file, reason: `Status=${status}` });
    }
  }

  if (notDone.length > 0) {
    const details = notDone.map((item) => `${item.file} (${item.reason})`).join(', ');
    fail(`NP0 tasks incomplete: ${details}`);
  }

  console.log('[deploy-gate] all NP0 tasks are DONE');
}

main();
