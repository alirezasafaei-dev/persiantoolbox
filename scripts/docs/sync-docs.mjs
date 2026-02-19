#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const configPath = resolve(root, 'scripts/docs/docs-sync.config.json');

function loadConfig() {
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

function parseTaskStatus(content) {
  const statusMatch = content.match(/^##\s*Status\s*[\r\n]+([A-Z_]+)/im);
  return (statusMatch?.[1] ?? 'UNKNOWN').toUpperCase();
}

function parseTaskTitle(content) {
  const titleMatch = content.match(/^##\s*Title\s*[\r\n]+([\s\S]*?)\n##/im);
  return (titleMatch?.[1] ?? '').trim().replace(/\s+/g, ' ');
}

function readTaskMatrix(tasksDirPath) {
  const files = readdirSync(tasksDirPath)
    .filter((name) => /^NP\d+-\d+\.md$/i.test(name))
    .sort();

  const items = files.map((fileName) => {
    const full = resolve(tasksDirPath, fileName);
    const content = readFileSync(full, 'utf8');
    const id = fileName.replace('.md', '');
    const phaseKey = id.split('-')[0] ?? 'NPX';
    return {
      id,
      fileName,
      phaseKey,
      title: parseTaskTitle(content),
      status: parseTaskStatus(content),
    };
  });

  const totals = {
    total: items.length,
    done: items.filter((task) => task.status === 'DONE').length,
    remaining: items.filter((task) => task.status !== 'DONE').length,
  };

  const byPhase = {};
  for (const task of items) {
    if (!byPhase[task.phaseKey]) {
      byPhase[task.phaseKey] = { total: 0, done: 0, remaining: 0 };
    }
    byPhase[task.phaseKey].total += 1;
    if (task.status === 'DONE') {
      byPhase[task.phaseKey].done += 1;
    } else {
      byPhase[task.phaseKey].remaining += 1;
    }
  }

  const nextTask = items.find((task) => task.status !== 'DONE') ?? null;
  return { items, totals, byPhase, nextTask };
}

function latestFile(dirPath, prefix) {
  if (!existsSync(dirPath)) {
    return null;
  }
  const files = readdirSync(dirPath)
    .filter((name) => name.startsWith(prefix))
    .sort();
  return files.at(-1) ?? null;
}

function latestPattern(dirPath, regex) {
  if (!existsSync(dirPath)) {
    return null;
  }
  const files = readdirSync(dirPath)
    .filter((name) => regex.test(name))
    .sort();
  return files.at(-1) ?? null;
}

function renderStatusMarkdown(model) {
  const lines = [];
  lines.push('# AUTO STATUS');
  lines.push('');
  lines.push('This file is generated. Do not edit manually.');
  lines.push('');
  lines.push(`- generatedAt: ${model.generatedAt}`);
  lines.push(`- completion: ${model.task.totals.done}/${model.task.totals.total}`);
  lines.push(`- remaining: ${model.task.totals.remaining}`);
  lines.push('');
  lines.push('## Phase Progress');
  lines.push('');
  lines.push('Phase | Done | Total | Remaining');
  lines.push('---|---:|---:|---:');

  for (const phaseKey of Object.keys(model.task.byPhase).sort()) {
    const p = model.task.byPhase[phaseKey];
    lines.push(`${phaseKey} | ${p.done} | ${p.total} | ${p.remaining}`);
  }

  lines.push('');
  lines.push('## Next Task');
  lines.push('');
  if (model.task.nextTask) {
    lines.push(`- id: ${model.task.nextTask.id}`);
    lines.push(`- title: ${model.task.nextTask.title}`);
    lines.push(`- spec: tasks-next/${model.task.nextTask.fileName}`);
  } else {
    lines.push('- all tasks are DONE');
  }

  lines.push('');
  lines.push('## Latest Evidence Files');
  lines.push('');
  lines.push(`- deployment readiness: ${model.evidence.readiness ?? 'n/a'}`);
  lines.push(`- release rc-gates: ${model.evidence.rcGates ?? 'n/a'}`);
  lines.push(`- release launch-smoke: ${model.evidence.launchSmoke ?? 'n/a'}`);
  lines.push(`- release tasklist: ${model.evidence.publishTasklist ?? 'n/a'}`);
  lines.push('');
  lines.push('## Automation Commands');
  lines.push('');
  lines.push('- `pnpm roadmap:next`');
  lines.push('- `pnpm roadmap:phase0`');
  lines.push('- `pnpm roadmap:np0`');
  lines.push('- `pnpm roadmap:vps`');
  lines.push('- `pnpm roadmap:run`');
  lines.push('- `pnpm docs:auto`');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function sameContent(path, next) {
  if (!existsSync(path)) {
    return false;
  }
  const current = readFileSync(path, 'utf8');
  return normalizeForCompare(current) === normalizeForCompare(next);
}

function normalizeForCompare(value) {
  return value
    .replace(
      /("generatedAt"\s*:\s*")([^"]+)(")/g,
      (_whole, p1, _p2, p3) => `${p1}<normalized>${p3}`,
    )
    .replace(
      /(^- generatedAt:\s+).+$/gm,
      (_whole, p1) => `${p1}<normalized>`,
    );
}

function main() {
  const args = new Set(process.argv.slice(2));
  const checkMode = args.has('--check');
  const config = loadConfig();

  const tasksDirPath = resolve(root, config.tasksDir);
  const task = readTaskMatrix(tasksDirPath);

  const model = {
    version: 1,
    generatedAt: new Date().toISOString(),
    task,
    evidence: {
      readiness: latestPattern(resolve(root, config.deploymentReportsDir), /^readiness-.*\.json$/),
      rcGates: latestPattern(resolve(root, config.releaseReportsDir), /^rc-gates-.*\.json$/),
      launchSmoke: latestPattern(resolve(root, config.releaseReportsDir), /^launch-smoke-.*\.json$/),
      publishTasklist: latestFile(resolve(root, config.releaseReportsDir), 'v3-publish-tasklist-'),
    },
  };

  const jsonOutPath = resolve(root, config.statusJsonPath);
  const mdOutPath = resolve(root, config.statusMarkdownPath);

  const jsonOut = `${JSON.stringify(model, null, 2)}\n`;
  const mdOut = renderStatusMarkdown(model);

  const jsonUnchanged = sameContent(jsonOutPath, jsonOut);
  const mdUnchanged = sameContent(mdOutPath, mdOut);

  if (checkMode) {
    if (!jsonUnchanged || !mdUnchanged) {
      console.error('[docs:auto] generated docs are outdated; run `pnpm docs:auto`');
      process.exit(1);
    }
    console.log('[docs:auto] up to date');
    return;
  }

  writeFileSync(jsonOutPath, jsonOut, 'utf8');
  writeFileSync(mdOutPath, mdOut, 'utf8');

  console.log(`[docs:auto] wrote ${jsonOutPath}`);
  console.log(`[docs:auto] wrote ${mdOutPath}`);
}

main();
