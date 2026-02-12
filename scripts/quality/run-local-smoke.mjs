import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const HOST = process.env.SMOKE_HOST ?? '127.0.0.1';
const PORT = Number(process.env.SMOKE_PORT ?? '3100');
const BASE_URL = `http://${HOST}:${PORT}`;
const START_TIMEOUT_MS = 120_000;
const REQUEST_TIMEOUT_MS = 15_000;
const POLL_INTERVAL_MS = 1_000;

const ROUTE_CHECKS = [
  { path: '/', expectedStatus: 200 },
  { path: '/tools', expectedStatus: 200 },
  { path: '/loan', expectedStatus: 200 },
  { path: '/salary', expectedStatus: 200 },
  { path: '/interest', expectedStatus: 200 },
  { path: '/about', expectedStatus: 200 },
  { path: '/how-it-works', expectedStatus: 200 },
  { path: '/privacy', expectedStatus: 200 },
  { path: '/sitemap.xml', expectedStatus: 200 },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const waitForServer = async () => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < START_TIMEOUT_MS) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/`, REQUEST_TIMEOUT_MS);
      if (response.ok) {
        return;
      }
    } catch {
      // keep polling until timeout
    }
    await delay(POLL_INTERVAL_MS);
  }
  throw new Error(`Smoke server did not become ready within ${START_TIMEOUT_MS}ms (${BASE_URL})`);
};

const runRouteChecks = async () => {
  const failures = [];
  for (const check of ROUTE_CHECKS) {
    const url = `${BASE_URL}${check.path}`;
    try {
      const response = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);
      if (response.status !== check.expectedStatus) {
        failures.push(`${check.path}: expected ${check.expectedStatus}, got ${response.status}`);
        continue;
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (check.path !== '/sitemap.xml' && !contentType.includes('text/html')) {
        failures.push(`${check.path}: expected text/html, got ${contentType || 'unknown'}`);
      }
      if (check.path === '/sitemap.xml' && !contentType.includes('xml')) {
        failures.push(`${check.path}: expected xml content-type, got ${contentType || 'unknown'}`);
      }
    } catch (error) {
      failures.push(`${check.path}: request failed (${String(error)})`);
    }
  }
  return failures;
};

const run = async () => {
  const nextBin = resolve(process.cwd(), 'node_modules/next/dist/bin/next');
  const child = spawn(process.execPath, [nextBin, 'start'], {
    env: {
      ...process.env,
      HOSTNAME: HOST,
      PORT: String(PORT),
      NODE_ENV: 'production',
    },
    stdio: 'inherit',
  });

  let interrupted = false;
  const terminateChild = async () => {
    if (child.killed || child.exitCode !== null) return;
    child.kill('SIGTERM');
    await delay(1_500);
    if (child.exitCode === null) {
      child.kill('SIGKILL');
    }
  };

  const handleSignal = async () => {
    interrupted = true;
    await terminateChild();
    process.exit(1);
  };

  process.on('SIGINT', handleSignal);
  process.on('SIGTERM', handleSignal);

  try {
    await waitForServer();
    const failures = await runRouteChecks();
    if (failures.length > 0) {
      throw new Error(`Local smoke failed:\n- ${failures.join('\n- ')}`);
    }
    console.log(`[smoke] local routes passed (${ROUTE_CHECKS.length} checks)`);
  } finally {
    if (!interrupted) {
      await terminateChild();
    }
  }
};

run().catch((error) => {
  console.error(String(error));
  process.exit(1);
});
