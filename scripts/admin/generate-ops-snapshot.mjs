#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const baseArg = args.find((item) => item.startsWith('--base-url='));
const baseUrl = baseArg ? baseArg.slice('--base-url='.length).replace(/\/$/, '') : 'http://127.0.0.1:3000';
const token = args.find((item) => item.startsWith('--token='))?.slice('--token='.length) ?? '';
const repeatArg = args.find((item) => item.startsWith('--repeat='));
const intervalMsArg = args.find((item) => item.startsWith('--interval-ms='));
const includeOutput = args.includes('--include-output');
const outputDirArg = args.find((item) => item.startsWith('--output-dir='));
const outputDir = outputDirArg ? outputDirArg.slice('--output-dir='.length) : 'docs/deployment/reports';
const requireHealthy = args.includes('--require-healthy');
const stopOnFailure = args.includes('--stop-on-failure');
const webhookArg = args.find((item) => item.startsWith('--degraded-webhook='));
const webhookUrl = webhookArg ? webhookArg.slice('--degraded-webhook='.length) : '';

const outputBase = resolve(process.cwd(), outputDir);
mkdirSync(outputBase, { recursive: true });

const headers = { Accept: 'application/json' };
if (token) {
  headers['x-ops-dashboard-token'] = token;
}

const startedAt = new Date().toISOString();
const stamp = startedAt.replace(/[:.]/g, '-');
const mdPath = resolve(outputBase, `ops-dashboard-${stamp}.md`);
const runIntervalMs = intervalMsArg ? Number(intervalMsArg.slice('--interval-ms='.length)) : 30_000;
const repeat = Math.max(1, Number(repeatArg?.slice('--repeat='.length) ?? 1) || 1);

function normalizeToBoolean(value) {
  if (typeof value !== 'boolean') {
    return false;
  }
  return value;
}

function isSnapshotHealthy(snapshot) {
  if (!snapshot || snapshot.ok === false) {
    return false;
  }
  const versionOk = normalizeToBoolean(snapshot.serviceHealth?.version?.ok);
  const healthOk = normalizeToBoolean(snapshot.serviceHealth?.health?.ok);
  const readyOk = normalizeToBoolean(snapshot.serviceHealth?.ready?.ok);
  const dbOk = normalizeToBoolean(snapshot.dependencies?.database?.ok);
  return versionOk && healthOk && readyOk && dbOk;
}

function sleep(ms) {
  if (!Number.isFinite(ms) || ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toWebhookPayload(snapshot, runSummary) {
  return {
    runStatus: 'degraded',
    source: 'ops-dashboard',
    generatedAt: snapshot.generatedAt,
    version: snapshot.runtime.version,
    commit: snapshot.runtime.commit,
    runSummary,
    databaseOk: snapshot.dependencies?.database?.ok ?? false,
  };
}

async function notifyDegraded(webhook, runSummary, finalSnapshot) {
  if (!webhook) {
    return;
  }
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(
        toWebhookPayload(finalSnapshot, {
          executedRuns: runSummary.length,
          runStatus: runSummary.some((item) => !item.healthy) ? 'degraded' : 'healthy',
          runs: runSummary,
        }),
      ),
    });
  } catch {
    // non-fatal
  }
}

async function captureOnce() {
  const response = await fetch(`${baseUrl}/api/admin/ops`, {
    headers,
    cache: 'no-store',
  });

  const payloadText = await response.text();
  let payload;
  try {
    payload = JSON.parse(payloadText);
  } catch {
    throw new Error(`Invalid JSON from ${baseUrl}/api/admin/ops: ${payloadText.slice(0, 400)}`);
  }

  if (!response.ok || payload?.ok !== true || !payload.snapshot) {
    throw new Error(`Ops snapshot API failed: status=${response.status}, payload=${payloadText.slice(0, 400)}`);
  }

  return {
    snapshot: payload.snapshot,
    response,
  };
}

const runs = [];
let latestSnapshot = null;
for (let run = 1; run <= repeat; run += 1) {
  const started = new Date().toISOString();
  const capture = await captureOnce();
  const file = resolve(outputBase, `ops-dashboard-${stamp}-run-${String(run).padStart(2, '0')}.json`);
  writeFileSync(file, `${JSON.stringify(capture.snapshot, null, 2)}\n`, 'utf8');

  const healthy = isSnapshotHealthy(capture.snapshot);
  runs.push({
    run,
    started,
    status: capture.response.status,
    healthy,
    file,
  });
  latestSnapshot = capture.snapshot;

  if ((requireHealthy || stopOnFailure) && !healthy) {
    break;
  }

  if (run < repeat) {
    await sleep(runIntervalMs);
  }
}

if (!latestSnapshot) {
  throw new Error('No successful ops snapshot was produced.');
}

const latest = runs[runs.length - 1];
const snapshot = latestSnapshot;
const allRunsHealthy = runs.every((item) => item.healthy);
const summaryPath = resolve(outputBase, `ops-dashboard-${stamp}.json`);
writeFileSync(
  summaryPath,
  `${JSON.stringify(
    {
      generatedAt: startedAt,
      requestedRuns: repeat,
      executedRuns: runs.length,
      allRunsHealthy,
      intervalMs: runIntervalMs,
      latest: {
        status: latest.status,
        healthy: latest.healthy,
        file: latest.file,
      },
      runs,
    },
    null,
    2,
  )}\n`,
  'utf8',
);

const lines = [
  '# Production Ops Snapshot',
  '',
  `- generatedAt: ${startedAt}`,
  `- requestedRuns: ${repeat}`,
  `- executedRuns: ${runs.length}`,
  `- intervalMs: ${runIntervalMs}`,
  `- source: ${baseUrl}/api/admin/ops`,
  `- httpStatus: ${latest.status}`,
  `- featureVersion: ${snapshot.runtime.version}`,
  `- commit: ${snapshot.runtime.commit ?? 'n/a'}`,
  `- dbHealthy: ${snapshot.dependencies.database.ok ? 'ok' : 'fail'}`,
  `- runStatus: ${allRunsHealthy ? 'healthy' : 'degraded'}`,
  '',
  '## Snapshot Health',
  '',
  `- versionService: ${snapshot.serviceHealth.version.ok ? 'ok' : `fail (${snapshot.serviceHealth.version.reason ?? 'n/a'})`}`,
  `- health: ${snapshot.serviceHealth.health.ok ? 'ok' : `fail (${snapshot.serviceHealth.health.reason ?? 'n/a'})`}`,
  `- ready: ${snapshot.serviceHealth.ready.ok ? 'ok' : `fail (${snapshot.serviceHealth.ready.reason ?? 'n/a'})`}`,
  `- database: ${snapshot.dependencies.database.ok ? 'ok' : `fail (${snapshot.dependencies.database.reason ?? 'n/a'})`}`,
  '',
  '## Analytics',
  '',
  `- totalEvents: ${snapshot.analytics.ok ? snapshot.analytics.summary?.totalEvents ?? 0 : 'n/a'}`,
  `- lastUpdated: ${snapshot.analytics.summary?.lastUpdated ? new Date(snapshot.analytics.summary.lastUpdated).toISOString() : 'n/a'}`,
];

if (snapshot.analytics.ok && snapshot.analytics.summary) {
  lines.push('- Top Events:');
  for (const [event, count] of snapshot.analytics.summary.topEvents.slice(0, 8)) {
    lines.push(`  - ${event}: ${count}`);
  }
  lines.push('- Top Paths:');
  for (const [path, count] of snapshot.analytics.summary.topPaths.slice(0, 8)) {
    lines.push(`  - ${path}: ${count}`);
  }
} else {
  lines.push(`- metricsError: ${snapshot.analytics.reason ?? 'n/a'}`);
}

lines.push(
  '',
  '## Feature Flags',
  '',
  ...snapshot.featureFlags.map(
    (item) => `- ${item.id} (${item.enabled ? 'on' : 'off'}) [${item.envKey}]`,
  ),
  '',
  '## Site Settings',
  '',
  snapshot.siteSettings.ok
    ? `- developerName: ${snapshot.siteSettings.summary?.developerName}`
    : '- developer settings: unavailable',
);

if (snapshot.siteSettings.ok) {
  lines.push(`- developerBrandText: ${snapshot.siteSettings.summary?.developerBrandText}`);
  lines.push(`- orderUrl: ${snapshot.siteSettings.summary?.orderUrl ?? 'n/a'}`);
  lines.push(`- portfolioUrl: ${snapshot.siteSettings.summary?.portfolioUrl ?? 'n/a'}`);
}

if (runs.length > 1) {
  lines.push('', '## Run History');
  for (const item of runs) {
    lines.push(`- run #${item.run}: status=${item.status} healthy=${item.healthy ? 'yes' : 'no'} file=${item.file}`);
  }
}

if (includeOutput) {
  lines.push(
    '',
    '## Evidence Notes',
    '',
    `- captureIntervalMs: ${runIntervalMs > 0 ? `${runIntervalMs}ms` : 'manual'}`,
    '- note: This run is used as an operational evidence artifact for dashboard readiness reviews.',
  );
}

if (requireHealthy && !allRunsHealthy) {
  lines.push('- gate: blocked-by-health');
}

writeFileSync(mdPath, `${lines.join('\n')}\n`, 'utf8');

console.log(`[ops] snapshot summary: ${summaryPath}`);
console.log(`[ops] snapshot summary: ${mdPath}`);
for (const item of runs) {
  console.log(`[ops] run saved: ${item.file}`);
}
console.log(`[ops] featureVersion=${snapshot.runtime.version} commit=${snapshot.runtime.commit ?? 'n/a'}`);

if (requireHealthy && !allRunsHealthy) {
  void notifyDegraded(webhookUrl, runs, snapshot);
  process.exit(1);
}
