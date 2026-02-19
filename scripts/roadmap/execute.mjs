#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();

const DEFAULT_VPS_SSH =
  process.env['ROADMAP_VPS_SSH'] ??
  'ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes deploy@185.3.124.93';

const phasePlans = {
  'local-gates': {
    title: 'Local Quality Gates',
    steps: [
      { id: 'lint', cmd: 'pnpm lint' },
      { id: 'typecheck', cmd: 'pnpm typecheck' },
      { id: 'ci_quick', cmd: 'pnpm ci:quick' },
      { id: 'ci_contracts', cmd: 'pnpm ci:contracts' },
      { id: 'build', cmd: 'pnpm build' },
    ],
  },
  'phase0-verify': {
    title: 'Phase 0 Verify (Runtime Parity Prep)',
    steps: [
      { id: 'codex_config_check', cmd: 'node scripts/roadmap/check-codex-config.mjs' },
      { id: 'local_gates', cmd: 'node scripts/roadmap/execute.mjs --phase local-gates' },
      { id: 'deploy_gate', cmd: 'pnpm gate:deploy' },
    ],
  },
  'vps-check': {
    title: 'VPS Runtime Health Check',
    steps: [
      {
        id: 'vps_health',
        cmd: `${DEFAULT_VPS_SSH} '\nset -e\nfor u in \\\n  http://127.0.0.1:3000/api/health \\\n  http://127.0.0.1:3001/api/health \\\n  http://127.0.0.1:3002/api/ready \\\n  http://127.0.0.1:3003/api/ready\ndo\n  printf "%s -> " "$u"\n  curl -sS -o /tmp/roadmap-health.out -w "%{http_code}\\n" --max-time 6 "$u"\n  head -c 140 /tmp/roadmap-health.out; echo\ndone\n'`,
      },
      {
        id: 'domain_health',
        cmd: `${DEFAULT_VPS_SSH} '\nset -e\nfor u in \\\n  https://persiantoolbox.ir/api/health \\\n  https://staging.persiantoolbox.ir/api/health\ndo\n  printf "%s -> " "$u"\n  curl -k -sS -o /tmp/roadmap-domain.out -w "%{http_code} %{time_total}\\n" --max-time 8 "$u"\ndone\n'`,
      },
    ],
  },
  np0: {
    title: 'NP0 Closure Gates',
    steps: [
      { id: 'local_gates', cmd: 'node scripts/roadmap/execute.mjs --phase local-gates' },
      { id: 'deploy_gate', cmd: 'pnpm gate:deploy' },
    ],
  },
  full: {
    title: 'Full Automation Run',
    steps: [
      { id: 'next_task', cmd: 'node scripts/roadmap/next-task.mjs --format table' },
      { id: 'phase0_verify', cmd: 'node scripts/roadmap/execute.mjs --phase phase0-verify' },
      { id: 'vps_check', cmd: 'node scripts/roadmap/execute.mjs --phase vps-check' },
    ],
  },
};

function parseArgs(argv) {
  const args = {
    phase: 'full',
    continueOnError: false,
    dryRun: false,
    reportDir: '.codex/roadmap-runs',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--phase' && argv[i + 1]) {
      args.phase = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--continue-on-error') {
      args.continueOnError = true;
      continue;
    }
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (token === '--report-dir' && argv[i + 1]) {
      args.reportDir = argv[i + 1];
      i += 1;
      continue;
    }
  }

  return args;
}

function runShell(command) {
  const startedAt = Date.now();
  const result = spawnSync('bash', ['-lc', command], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
  });

  return {
    command,
    exitCode: result.status ?? 1,
    durationMs: Date.now() - startedAt,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function renderMarkdownReport(report) {
  const lines = [];
  lines.push(`# Roadmap Automation Report`);
  lines.push('');
  lines.push(`- phase: ${report.phase}`);
  lines.push(`- title: ${report.title}`);
  lines.push(`- startedAt: ${report.startedAt}`);
  lines.push(`- finishedAt: ${report.finishedAt}`);
  lines.push(`- overallStatus: ${report.overallStatus}`);
  lines.push('');
  lines.push('## Steps');
  lines.push('');

  for (const step of report.steps) {
    lines.push(`### ${step.id}`);
    lines.push(`- command: \`${step.command}\``);
    lines.push(`- status: ${step.status}`);
    lines.push(`- exitCode: ${step.exitCode}`);
    lines.push(`- durationMs: ${step.durationMs}`);
    lines.push('');
    if (step.stdout.trim().length > 0) {
      lines.push('```text');
      lines.push(step.stdout.trim().slice(0, 6000));
      lines.push('```');
      lines.push('');
    }
    if (step.stderr.trim().length > 0) {
      lines.push('```text');
      lines.push(step.stderr.trim().slice(0, 4000));
      lines.push('```');
      lines.push('');
    }
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const plan = phasePlans[args.phase];
  if (!plan) {
    console.error(`[roadmap] unknown phase: ${args.phase}`);
    console.error(`[roadmap] valid phases: ${Object.keys(phasePlans).join(', ')}`);
    process.exit(1);
  }

  const startedAtIso = new Date().toISOString();
  const runId = startedAtIso.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const reportRoot = resolve(root, args.reportDir, runId);
  mkdirSync(reportRoot, { recursive: true });

  const report = {
    version: 1,
    phase: args.phase,
    title: plan.title,
    startedAt: startedAtIso,
    finishedAt: '',
    overallStatus: 'passed',
    steps: [],
  };

  for (const step of plan.steps) {
    if (args.dryRun) {
      report.steps.push({
        id: step.id,
        command: step.cmd,
        status: 'skipped',
        exitCode: 0,
        durationMs: 0,
        stdout: '',
        stderr: '',
      });
      continue;
    }

    console.log(`[roadmap] step=${step.id} cmd=${step.cmd}`);
    const run = runShell(step.cmd);
    const ok = run.exitCode === 0;
    report.steps.push({
      id: step.id,
      command: run.command,
      status: ok ? 'passed' : 'failed',
      exitCode: run.exitCode,
      durationMs: run.durationMs,
      stdout: run.stdout,
      stderr: run.stderr,
    });

    if (!ok) {
      report.overallStatus = 'failed';
      if (!args.continueOnError) {
        break;
      }
    }
  }

  report.finishedAt = new Date().toISOString();
  const jsonPath = resolve(reportRoot, 'report.json');
  const mdPath = resolve(reportRoot, 'report.md');
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  writeFileSync(mdPath, renderMarkdownReport(report), 'utf8');

  console.log(`[roadmap] report: ${jsonPath}`);
  console.log(`[roadmap] report: ${mdPath}`);
  if (report.overallStatus !== 'passed') {
    process.exit(1);
  }
}

main();
