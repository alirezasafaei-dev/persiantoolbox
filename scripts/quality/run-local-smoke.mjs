import { execFileSync, spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HOST = process.env.SMOKE_HOST ?? '127.0.0.1';
const PORT = Number(process.env.SMOKE_PORT ?? '3100');
const BASE_URL = `http://${HOST}:${PORT}`;
const START_TIMEOUT_MS = 120_000;
const REQUEST_TIMEOUT_MS = 15_000;
const POLL_INTERVAL_MS = 1_000;

const ROUTE_CHECKS = [
  { path: '/', expectedStatus: 200 },
  { path: '/asdev', expectedStatus: 200 },
  { path: '/api/ready', expectedStatus: 200, expectedContentType: 'application/json' },
  { path: '/tools', expectedStatus: 200 },
  { path: '/loan', expectedStatus: 200 },
  { path: '/salary', expectedStatus: 200 },
  { path: '/interest', expectedStatus: 200 },
  { path: '/about', expectedStatus: 200 },
  { path: '/how-it-works', expectedStatus: 200 },
  { path: '/privacy', expectedStatus: 200 },
  { path: '/sitemap.xml', expectedStatus: 200 },
];

const delay = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

export function resolveReleaseSha(rootDir = process.cwd()) {
  const configured = process.env.SMOKE_RELEASE_SHA;
  if (configured) {
    if (!/^[0-9a-f]{40}$/.test(configured)) {
      throw new Error('SMOKE_RELEASE_SHA must be an exact 40-character SHA');
    }
    return configured;
  }

  const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  if (!/^[0-9a-f]{40}$/.test(sha)) {
    throw new Error('Unable to resolve an exact release SHA for local smoke');
  }
  return sha;
}

export function prepareStandaloneRuntime(rootDir = process.cwd()) {
  const standaloneDir = resolve(rootDir, '.next/standalone');
  const serverPath = resolve(standaloneDir, 'server.js');
  const sourceStatic = resolve(rootDir, '.next/static');
  const targetStatic = resolve(standaloneDir, '.next/static');
  const sourcePublic = resolve(rootDir, 'public');
  const targetPublic = resolve(standaloneDir, 'public');

  if (!existsSync(serverPath)) {
    throw new Error(`Standalone server is missing: ${serverPath}`);
  }
  if (!existsSync(sourceStatic)) {
    throw new Error(`Next static directory is missing: ${sourceStatic}`);
  }
  if (!existsSync(sourcePublic)) {
    throw new Error(`Public directory is missing: ${sourcePublic}`);
  }

  rmSync(targetStatic, { recursive: true, force: true });
  rmSync(targetPublic, { recursive: true, force: true });
  mkdirSync(dirname(targetStatic), { recursive: true });
  cpSync(sourceStatic, targetStatic, { recursive: true, force: true });
  cpSync(sourcePublic, targetPublic, { recursive: true, force: true });

  return { standaloneDir, serverPath, targetStatic, targetPublic };
}

const fetchWithTimeout = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, cache: 'no-store' });
  } finally {
    clearTimeout(timer);
  }
};

const waitForServer = async () => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < START_TIMEOUT_MS) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/`, REQUEST_TIMEOUT_MS);
      if (response.ok) return;
    } catch {
      await delay(POLL_INTERVAL_MS);
      continue;
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
      if (check.expectedContentType && !contentType.includes(check.expectedContentType)) {
        failures.push(
          `${check.path}: expected ${check.expectedContentType}, got ${contentType || 'unknown'}`,
        );
      }
      if (
        !check.expectedContentType &&
        check.path !== '/sitemap.xml' &&
        !contentType.includes('text/html')
      ) {
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

export async function runLocalSmoke(rootDir = process.cwd()) {
  const releaseSha = resolveReleaseSha(rootDir);
  const { standaloneDir, serverPath } = prepareStandaloneRuntime(rootDir);
  const child = spawn(process.execPath, [serverPath], {
    cwd: standaloneDir,
    env: {
      ...process.env,
      HOSTNAME: HOST,
      PORT: String(PORT),
      NODE_ENV: 'production',
      NEXT_PUBLIC_GIT_SHA: releaseSha,
      RELEASE_GIT_SHA: releaseSha,
    },
    stdio: 'inherit',
  });

  let interrupted = false;
  const terminateChild = async () => {
    if (child.killed || child.exitCode !== null) return;
    child.kill('SIGTERM');
    await delay(1_500);
    if (child.exitCode === null) child.kill('SIGKILL');
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
    console.log(`[smoke] standalone routes passed (${ROUTE_CHECKS.length} checks)`);
  } finally {
    process.off('SIGINT', handleSignal);
    process.off('SIGTERM', handleSignal);
    if (!interrupted) await terminateChild();
  }
}

const isDirectExecution =
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isDirectExecution) {
  runLocalSmoke().catch((error) => {
    console.error(String(error));
    process.exit(1);
  });
}
