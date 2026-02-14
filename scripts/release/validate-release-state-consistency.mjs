import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const STATUS_VALUES = new Set(['pending', 'in_progress', 'blocked', 'done']);

function extractSingle(pattern, source, errorMessage) {
  const match = source.match(pattern);
  if (!match || !match[1]) {
    throw new Error(errorMessage);
  }
  return match[1].trim();
}

function getLatestTasklistPath(baseDir) {
  const files = readdirSync(baseDir)
    .filter((name) => /^v3-publish-tasklist-.*\.md$/.test(name))
    .sort();

  if (files.length === 0) {
    throw new Error('No v3 publish tasklist found under docs/release/reports');
  }

  return resolve(baseDir, files[files.length - 1]);
}

function ensureTasklistMatchesRegistryStatus(tasklist, registryStatus) {
  const finalTagLineMatch = tasklist.match(
    /After approval,\s*create final release tag in remote\.\s*\(([^)]+)\)/i,
  );

  if (!finalTagLineMatch || !finalTagLineMatch[1]) {
    throw new Error('Tasklist missing final release tag status line');
  }

  const finalTagStatusText = finalTagLineMatch[1].toLowerCase();

  if (registryStatus === 'done') {
    if (!/\bdone\b/.test(finalTagStatusText)) {
      throw new Error(
        `Registry status is 'done' but tasklist final tag line is not done: ${finalTagStatusText}`,
      );
    }
    return;
  }

  if (!new RegExp(`\\b${registryStatus}\\b`).test(finalTagStatusText)) {
    throw new Error(
      `Registry status '${registryStatus}' does not match tasklist final tag line: ${finalTagStatusText}`,
    );
  }
}

function main() {
  const root = process.cwd();
  const registryPath = resolve(root, 'docs/release/release-state-registry.md');
  const dashboardPath = resolve(root, 'docs/release/v3-readiness-dashboard.md');
  const reportsDir = resolve(root, 'docs/release/reports');

  const registry = readFileSync(registryPath, 'utf8');
  const dashboard = readFileSync(dashboardPath, 'utf8');
  const tasklistPath = getLatestTasklistPath(reportsDir);
  const tasklist = readFileSync(tasklistPath, 'utf8');

  const releaseTrain = extractSingle(
    /Release train:\s*`([^`]+)`/i,
    registry,
    'Registry missing release_train field',
  );
  const currentStage = extractSingle(
    /current_stage:\s*`([^`]+)`/i,
    registry,
    'Registry missing current_stage field',
  );
  const registryStatus = extractSingle(
    /status:\s*`([^`]+)`/i,
    registry,
    'Registry missing status field',
  );

  if (!STATUS_VALUES.has(registryStatus)) {
    throw new Error(`Registry status is invalid: ${registryStatus}`);
  }

  if (!dashboard.includes('Canonical release state source: `docs/release/release-state-registry.md`.')) {
    throw new Error('Dashboard missing canonical release-state source reference');
  }

  const dashboardFinalTagStatus = extractSingle(
    /final_release_tag_remote:\s*(pending|in_progress|blocked|done)\b/i,
    dashboard,
    'Dashboard missing final_release_tag_remote status',
  );

  if (dashboardFinalTagStatus !== registryStatus) {
    throw new Error(
      `Dashboard final_release_tag_remote '${dashboardFinalTagStatus}' mismatches registry status '${registryStatus}'`,
    );
  }

  ensureTasklistMatchesRegistryStatus(tasklist, registryStatus);

  console.log(
    `[release] state consistency valid (train=${releaseTrain}, stage=${currentStage}, status=${registryStatus})`,
  );
}

main();
