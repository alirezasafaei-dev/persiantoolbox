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

if (!baseUrl) {
  throw new Error('Missing --base-url (example: --base-url=https://persian-tools.ir)');
}

const smokePaths = [
  '/',
  '/tools',
  '/loan',
  '/salary',
  '/date-tools',
  '/offline',
  '/admin/site-settings',
];

const now = new Date();
const iso = now.toISOString();
const fileTimestamp = iso.replace(/[:.]/g, '-');
const reportDir = resolve(process.cwd(), 'docs/deployment/reports');
const outputPath = outputArg
  ? resolve(process.cwd(), outputArg)
  : resolve(reportDir, `post-deploy-${fileTimestamp}.md`);

const fetchWithTimeout = async (url, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
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

for (const path of smokePaths) {
  const url = `${baseUrl}${path}`;
  try {
    const response = await fetchWithTimeout(url);
    checks.push({
      id: `smoke:${path}`,
      path,
      url,
      ok: response.ok,
      status: response.status,
      note: response.ok ? 'ok' : `status ${response.status}`,
    });
  } catch (error) {
    checks.push({
      id: `smoke:${path}`,
      path,
      url,
      ok: false,
      status: 'error',
      note: error instanceof Error ? error.message : String(error),
    });
  }
}

let headerCheck = {
  csp: false,
  hsts: false,
  xfo: false,
  referrerPolicy: false,
  note: '',
};

try {
  const response = await fetchWithTimeout(`${baseUrl}/`);
  headerCheck = {
    csp: response.headers.has('content-security-policy'),
    hsts: response.headers.has('strict-transport-security'),
    xfo: response.headers.has('x-frame-options'),
    referrerPolicy: response.headers.has('referrer-policy'),
    note: `status ${response.status}`,
  };
} catch (error) {
  headerCheck.note = error instanceof Error ? error.message : String(error);
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
