/**
 * Report Generator — Mission execution reports (JSON + Markdown)
 *
 * Reports are the evidence trail. They must be sufficient for an external
 * reviewer to verify completion without SSH or terminal access.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { Mission, MissionReport, ExecutionResult, TestResult } from './types.js';

const REPORTS_DIR = 'docs/growth/agent-loop/reports';

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------

export function generateReport(
  mission: Mission,
  result: ExecutionResult,
  tests: TestResult[],
  notes: string = '',
): MissionReport {
  return {
    missionId: mission.id,
    status: result.success ? 'success' : 'failed',
    startedAt: mission.claimedAt || new Date().toISOString(),
    completedAt: new Date().toISOString(),
    baseSha: result.baseSha,
    headSha: result.headSha,
    commits: [],
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
    humanActions: [],
    nextRecommendedAction: result.success
      ? 'Mission completed. Await external review.'
      : 'Mission failed. Review error logs and retry.',
    notes,
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
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('## Git Information');
  lines.push('');
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| Base SHA | \`${report.baseSha}\` |`);
  lines.push(`| Head SHA | \`${report.headSha}\` |`);
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
    lines.push('## Test Results');
    lines.push('');
    lines.push(`| Command | Status |`);
    lines.push(`|---------|--------|`);
    for (const t of report.tests) {
      const emoji = t.status === 'passed' ? '✅' : '❌';
      lines.push(`| \`${t.command}\` | ${emoji} ${t.status} |`);
    }
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
  lines.push(`*Report generated at ${report.completedAt} by agent-loop orchestrator*`);

  return lines.join('\n');
}
