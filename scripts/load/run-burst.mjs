#!/usr/bin/env node
import { performance } from 'node:perf_hooks';

const baseUrl = process.env['LOAD_BASE_URL'] ?? 'http://localhost:3000';
const concurrency = Number(process.env['LOAD_CONCURRENCY'] ?? '8');
const requestsPerEndpoint = Number(process.env['LOAD_REQUESTS_PER_ENDPOINT'] ?? '30');

const endpoints = ['/api/health', '/api/data/salary-laws', '/api/analytics'];

async function runRequest(path) {
  const start = performance.now();
  let status = 0;
  try {
    if (path === '/api/analytics') {
      const id = process.env['NEXT_PUBLIC_ANALYTICS_ID'] ?? 'local-load';
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id,
          events: [{
            event: 'load_test',
            metadata: { consentGranted: true },
            ts: Date.now(),
          }],
        }),
      });
      status = response.status;
    } else {
      const response = await fetch(`${baseUrl}${path}`);
      status = response.status;
    }
  } catch {
    status = 0;
  }
  return { status, durationMs: performance.now() - start };
}

async function runBurst(path) {
  const jobs = Array.from({ length: requestsPerEndpoint }, () => runRequest(path));
  const results = [];

  while (jobs.length > 0) {
    const batch = jobs.splice(0, concurrency);
    const done = await Promise.all(batch);
    results.push(...done);
  }

  const ok = results.filter((r) => r.status >= 200 && r.status < 500).length;
  const fail = results.length - ok;
  const avg = results.reduce((sum, r) => sum + r.durationMs, 0) / results.length;
  return {
    path,
    total: results.length,
    ok,
    fail,
    avgMs: Number(avg.toFixed(2)),
    p95Ms: Number(
      [...results]
        .sort((a, b) => a.durationMs - b.durationMs)
        [Math.min(results.length - 1, Math.floor(results.length * 0.95))].durationMs.toFixed(2),
    ),
  };
}

async function main() {
  const startedAt = new Date().toISOString();
  const report = [];

  for (const endpoint of endpoints) {
    report.push(await runBurst(endpoint));
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        startedAt,
        finishedAt: new Date().toISOString(),
        baseUrl,
        concurrency,
        requestsPerEndpoint,
        report,
      },
      null,
      2,
    ),
  );
}

main();
