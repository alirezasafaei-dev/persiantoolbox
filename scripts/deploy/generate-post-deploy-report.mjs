import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);

const getArg = (name, fallback = '') => {
  const key = `--${name}=`;
  const exact = args.find((arg) => arg.startsWith(key));
  if (exact) return exact.slice(key.length);

  const idx = args.indexOf(`--${name}`);
  if (idx >= 0) return args[idx + 1] ?? fallback;

  return fallback;
};

const baseUrl = getArg('base-url', '').replace(/\/$/, '');
const environment = getArg('environment', 'production');
const gitRef = getArg('git-ref', '');
const workflowRunUrl = getArg('workflow-run-url', '');
const deployer = getArg('deployer', '');
const outputArg = getArg('output', '');
const strict = ['1', 'true', 'yes', 'on'].includes(getArg('strict', 'false').toLowerCase());
const retryCount = Math.max(1, Number.parseInt(getArg('retry-count', '3'), 10) || 3);
const retryDelayMs = Math.max(200, Number.parseInt(getArg('retry-delay-ms', '1200'), 10) || 1200);
const timeoutMs = Math.max(3000, Number.parseInt(getArg('timeout-ms', '12000'), 10) || 12000);
const fallbackBaseUrlsArg = getArg('fallback-base-urls', '');

if (!baseUrl) {
  throw new Error('Missing --base-url (example: --base-url=https://persian-tools.ir)');
}

const smokeChecks = [
  { path: '/', acceptedStatuses: [200] },
  { path: '/tools', acceptedStatuses: [200] },
  { path: '/loan', acceptedStatuses: [200] },
  { path: '/salary', acceptedStatuses: [200] },
  { path: '/date-tools', acceptedStatuses: [200] },
  { path: '/offline', acceptedStatuses: [200] },
  // Admin route can be intentionally hidden/protected when unauthenticated.
  { path: '/admin/site-settings', acceptedStatuses: [200, 401, 403, 404] },
];

const deriveFallbackUrls = (url) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;

    if (host.startsWith('www.')) {
      const apex = host.slice(4);
      return [`${parsed.protocol}//${apex}`];
    }

    const labels = host.split('.');
    if (labels.length >= 2) {
      return [`${parsed.protocol}//www.${host}`];
    }
  } catch {
    return [];
  }

  return [];
};

const baseUrlCandidates = [
  baseUrl,
  ...fallbackBaseUrlsArg
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean),
  ...deriveFallbackUrls(baseUrl),
].filter((item, idx, arr) => arr.indexOf(item) === idx);

const now = new Date();
const iso = now.toISOString();
const fileTimestamp = iso.replace(/[:.]/g, '-');
const reportDir = resolve(process.cwd(), 'docs/deployment/reports');
const outputPath = outputArg
  ? resolve(process.cwd(), outputArg)
  : resolve(reportDir, `post-deploy-${fileTimestamp}.md`);

const sleep = (ms) => new Promise((resolveDelay) => {
  setTimeout(resolveDelay, ms);
});

const fetchWithTimeout = async (url, requestTimeoutMs = timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

const checks = [];

for (const check of smokeChecks) {
  const { path, acceptedStatuses } = check;
  const attemptNotes = [];
  let lastResult = null;

  for (let attempt = 1; attempt <= retryCount; attempt += 1) {
    for (const candidateBaseUrl of baseUrlCandidates) {
      const url = `${candidateBaseUrl}${path}`;
      try {
        const response = await fetchWithTimeout(url);
        const result = {
          id: `smoke:${path}`,
          path,
          url,
          usedBaseUrl: candidateBaseUrl,
          ok: acceptedStatuses.includes(response.status),
          status: response.status,
          note: acceptedStatuses.includes(response.status)
            ? `accepted status ${response.status}`
            : `status ${response.status}`,
        };
        lastResult = result;
        if (response.ok) break;
      } catch (error) {
        const note = error instanceof Error ? error.message : String(error);
        attemptNotes.push(`attempt ${attempt} ${url}: ${note}`);
        lastResult = {
          id: `smoke:${path}`,
          path,
          url,
          usedBaseUrl: candidateBaseUrl,
          ok: false,
          status: 'error',
          note,
        };
      }
    }

    if (lastResult?.ok) break;

    if (attempt < retryCount) {
      await sleep(retryDelayMs * attempt);
    }
  }

  checks.push({
    ...(lastResult ?? {
      id: `smoke:${path}`,
      path,
      url: `${baseUrl}${path}`,
      usedBaseUrl: baseUrl,
      ok: false,
      status: 'error',
      note: 'unknown failure',
    }),
    note: attemptNotes.length > 0
      ? `${lastResult?.note ?? 'error'} | ${attemptNotes.slice(-3).join(' | ')}`
      : (lastResult?.note ?? 'unknown failure'),
  });
}

let headerCheck = {
  csp: false,
  hsts: false,
  xfo: false,
  referrerPolicy: false,
  usedBaseUrl: baseUrl,
  note: '',
};

{
  const headerAttemptNotes = [];
  for (let attempt = 1; attempt <= retryCount; attempt += 1) {
    let succeeded = false;

    for (const candidateBaseUrl of baseUrlCandidates) {
      try {
        const response = await fetchWithTimeout(`${candidateBaseUrl}/`);
        headerCheck = {
          csp: response.headers.has('content-security-policy'),
          hsts: response.headers.has('strict-transport-security'),
          xfo: response.headers.has('x-frame-options'),
          referrerPolicy: response.headers.has('referrer-policy'),
          usedBaseUrl: candidateBaseUrl,
          note: `status ${response.status}`,
        };
        succeeded = true;
        break;
      } catch (error) {
        const note = error instanceof Error ? error.message : String(error);
        headerAttemptNotes.push(`attempt ${attempt} ${candidateBaseUrl}/: ${note}`);
      }
    }

    if (succeeded) break;

    if (attempt < retryCount) {
      await sleep(retryDelayMs * attempt);
    }
  }

  if (headerCheck.note === '' && headerAttemptNotes.length > 0) {
    headerCheck.note = headerAttemptNotes.slice(-3).join(' | ');
  }
}

const allSmokePassed = checks.every((item) => item.ok);
const allHeaderPassed =
  headerCheck.csp && headerCheck.hsts && headerCheck.xfo && headerCheck.referrerPolicy;

const checkItem = (ok, label) => `- [${ok ? 'x' : ' '}] ${label}`;

const smokeChecklist = checks
  .map((item) => checkItem(item.ok, `${item.path} (${item.status})`))
  .join('\n');

const report = `# Post-Deploy Report\n\n- Date (UTC): ${iso}\n- Environment: ${environment}\n- Base URL: ${baseUrl}\n- Git ref/tag: ${gitRef || 'N/A'}\n- Workflow run URL: ${workflowRunUrl || 'N/A'}\n- Deployer: ${deployer || 'N/A'}\n\n## Checks\n\n${smokeChecklist}\n\n## Security\n\n${checkItem(headerCheck.csp, 'CSP header verified')}\n${checkItem(headerCheck.hsts, 'HSTS header verified')}\n${checkItem(headerCheck.xfo, 'X-Frame-Options header verified')}\n${checkItem(headerCheck.referrerPolicy, 'Referrer-Policy header verified')}\n- Note: ${headerCheck.note || 'N/A'}\n\n## Database\n\n- [ ] Migration executed\n- [ ] App read/write healthy\n- [ ] Backup job verified\n\n## Incident/Notes\n\n- None / Description:\n\n## Decision\n\n${checkItem(allSmokePassed && allHeaderPassed, 'Keep rollout')}\n${checkItem(!(allSmokePassed && allHeaderPassed), 'Rollback executed')}\n- [ ] Follow-up issue created\n\n## Raw Results\n\n\`\`\`json\n${JSON.stringify(
  {
    generatedAt: iso,
    environment,
    baseUrl,
    smoke: checks,
    headers: headerCheck,
  },
  null,
  2,
)}\n\`\`\`\n`;

mkdirSync(reportDir, { recursive: true });
writeFileSync(outputPath, report, 'utf8');

console.log(`[deploy] post-deploy report generated: ${outputPath}`);
console.log(`[deploy] smoke status: ${allSmokePassed ? 'passed' : 'failed'}`);
console.log(`[deploy] header status: ${allHeaderPassed ? 'passed' : 'failed'}`);

if (strict && (!allSmokePassed || !allHeaderPassed)) {
  process.exitCode = 1;
}
