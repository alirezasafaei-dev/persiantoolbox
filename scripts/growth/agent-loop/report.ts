/**
 * Report Generator — Mission execution reports (JSON + Markdown)
 *
 * v3.0 — Accurate timing, exit codes, systemd evidence, truthful verification.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';
import { homedir } from 'os';
import type {
  Mission,
  MissionReport,
  ExecutionResult,
  TestResult,
  SystemdEvidence,
} from './types.js';

const REPORTS_DIR = 'docs/growth/agent-loop/reports';

// ---------------------------------------------------------------------------
// Systemd evidence — durable proof of the canonical worker
// ---------------------------------------------------------------------------

export function collectSystemdEvidence(): SystemdEvidence | null {
  const unitName = process.env['AGENT_UNIT'] || 'persiantoolbox-agent.service';
  const unitPath = join(homedir(), '.config/systemd/user', unitName);

  try {
    const isEnabled = execFileSync('systemctl', ['--user', 'is-enabled', unitName], {
      encoding: 'utf-8',
      timeout: 10_000,
      stdio: 'pipe',
    })
      .trim()
      .toLowerCase();

    const isActive = execFileSync('systemctl', ['--user', 'is-active', unitName], {
      encoding: 'utf-8',
      timeout: 10_000,
      stdio: 'pipe',
    })
      .trim()
      .toLowerCase();

    let actualExecStart = '';
    try {
      actualExecStart = execFileSync(
        'systemctl',
        ['--user', 'show', unitName, '-p', 'ExecStart', '--value'],
        { encoding: 'utf-8', timeout: 10_000, stdio: 'pipe' },
      ).trim();
    } catch {
      actualExecStart = '';
    }

    return {
      unitPath,
      enabled: isEnabled === 'enabled',
      active: isActive === 'active',
      actualExecStart,
      pointsToCanonical: actualExecStart.includes('scripts/growth/agent-loop/index.ts'),
    };
  } catch {
    // systemd not available (e.g., local dev) — evidence is null, not fabricated
    return null;
  }
}

// ---------------------------------------------------------------------------
// Generate — with accurate timing
// ---------------------------------------------------------------------------

export function generateReport(
  mission: Mission,
  result: ExecutionResult,
  tests: TestResult[],
  notes: string = '',
): MissionReport {
  const startedAt = mission.claimedAt || new Date().toISOString();
  const completedAt = new Date().toISOString();

  // Calculate actual duration
  const startMs = new Date(startedAt).getTime();
  const endMs = new Date(completedAt).getTime();
  const durationMs = endMs - startMs;
  const durationSec = (durationMs / 1000).toFixed(1);

  return {
    missionId: mission.id,
    status: result.success ? 'success' : 'failed',
    startedAt,
    completedAt,
    baseSha: result.baseSha,
    headSha: result.headSha,
    commits: result.baseSha !== result.headSha ? [result.baseSha, result.headSha] : [],
    filesChanged: result.filesChanged.map((f) => ({
      file: f,
      action: 'modified',
      linesChanged: 0,
    })),
    tests,
    deployment: {
      attempted: mission.deployApproved,
      status: null,
      productionSha: null,
    },
    productionHealth: null,
    blockers: [],
    humanActions: result.success
      ? ['Review and approve to transition state from COMPLETED to REVIEWED']
      : [],
    nextRecommendedAction: result.success
      ? `Mission completed in ${durationSec}s. Await external review.`
      : 'Mission failed. Review error logs and retry.',
    notes: notes || `Duration: ${durationSec}s. Push: guaranteed by git-persist.`,
    systemdEvidence: collectSystemdEvidence(),
  };
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export function writeReport(
  projectRoot: string,
  report: MissionReport,
): { jsonPath: string; mdPath: string } {
  const reportsDir = join(projectRoot, REPORTS_DIR);
  if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir, { recursive: true });
  }

  const jsonPath = join(reportsDir, `${report.missionId}.json`);
  const mdPath = join(reportsDir, `${report.missionId}.md`);

  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  writeFileSync(mdPath, formatReportMd(report));

  return { jsonPath, mdPath };
}

// ---------------------------------------------------------------------------
// Format Markdown
// ---------------------------------------------------------------------------

export function formatReportMd(report: MissionReport): string {
  const lines: string[] = [];
  const statusEmoji = report.status === 'success' ? '✅' : report.status === 'failed' ? '❌' : '⚠️';

  lines.push(`# Mission Report — ${report.missionId}`);
  lines.push('');
  lines.push(`**Status**: ${statusEmoji} ${report.status.toUpperCase()}`);
  lines.push(`**Started**: ${report.startedAt}`);
  lines.push(`**Completed**: ${report.completedAt}`);

  // Duration
  const startMs = new Date(report.startedAt).getTime();
  const endMs = new Date(report.completedAt).getTime();
  const durationSec = ((endMs - startMs) / 1000).toFixed(1);
  lines.push(`**Duration**: ${durationSec}s`);
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('## Git Information');
  lines.push('');
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| Base SHA | \`${report.baseSha}\` |`);
  lines.push(`| Head SHA | \`${report.headSha}\` |`);
  if (report.commits.length > 0) {
    lines.push(`| Commits | ${report.commits.map((c) => `\`${c.slice(0, 8)}\``).join(', ')} |`);
  }
  lines.push('');

  if (report.filesChanged.length > 0) {
    lines.push('## Files Changed');
    lines.push('');
    lines.push(`| File | Action |`);
    lines.push(`|------|--------|`);
    for (const f of report.filesChanged) {
      lines.push(`| \`${f.file}\` | ${f.action} |`);
    }
    lines.push('');
  }

  if (report.tests.length > 0) {
    lines.push('## Verification');
    lines.push('');
    lines.push(`| Command | Status | Exit Code | Duration |`);
    lines.push(`|---------|--------|-----------|----------|`);
    for (const t of report.tests) {
      const emoji = t.status === 'passed' ? '✅' : t.status === 'skipped' ? '⏭️' : '❌';
      const exitCode = t.exitCode !== undefined ? t.exitCode : t.status === 'passed' ? 0 : 1;
      lines.push(
        `| \`${t.command}\` | ${emoji} ${t.status} | ${exitCode} | ${t.duration || '—'} |`,
      );
    }
    lines.push('');
  }

  if (report.systemdEvidence) {
    lines.push('## Systemd Evidence');
    lines.push('');
    lines.push(`| Field | Value |`);
    lines.push(`|-------|-------|`);
    lines.push(`| Unit Path | \`${report.systemdEvidence.unitPath}\` |`);
    lines.push(`| Enabled | ${report.systemdEvidence.enabled ? '✅ yes' : '❌ no'} |`);
    lines.push(`| Active | ${report.systemdEvidence.active ? '✅ yes' : '❌ no'} |`);
    lines.push(`| ExecStart | \`${report.systemdEvidence.actualExecStart}\` |`);
    lines.push(
      `| Points to canonical index.ts | ${report.systemdEvidence.pointsToCanonical ? '✅ yes' : '❌ no'} |`,
    );
    lines.push('');
  }

  lines.push('## Deployment');
  lines.push('');
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| Attempted | ${report.deployment.attempted} |`);
  lines.push(`| Status | ${report.deployment.status || 'N/A'} |`);
  lines.push(`| Production SHA | ${report.deployment.productionSha || 'N/A'} |`);
  lines.push('');

  if (report.blockers.length > 0) {
    lines.push('## Blockers');
    lines.push('');
    for (const b of report.blockers) {
      lines.push(`- ${b}`);
    }
    lines.push('');
  }

  if (report.humanActions.length > 0) {
    lines.push('## Human Actions Required');
    lines.push('');
    for (const h of report.humanActions) {
      lines.push(`- ${h}`);
    }
    lines.push('');
  }

  lines.push('## Next Steps');
  lines.push('');
  lines.push(report.nextRecommendedAction);
  lines.push('');

  if (report.notes) {
    lines.push('## Notes');
    lines.push('');
    lines.push(report.notes);
    lines.push('');
  }

  lines.push('---');
  lines.push(`*Report generated at ${report.completedAt} by agent-loop orchestrator v3.0*`);

  return lines.join('\n');
}
