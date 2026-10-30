import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function assertAuditReport(report) {
  const counts = report?.metadata?.vulnerabilities;
  const levels = ['info', 'low', 'moderate', 'high', 'critical'];
  if (
    !report ||
    typeof report !== 'object' ||
    Array.isArray(report) ||
    report.error ||
    !Number.isSafeInteger(report.metadata?.dependencies) ||
    report.metadata.dependencies <= 0 ||
    !counts ||
    levels.some((level) => !Number.isSafeInteger(counts[level]) || counts[level] < 0)
  ) {
    throw new Error('Missing or invalid production audit evidence');
  }
  return counts;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const counts = assertAuditReport(JSON.parse(readFileSync(process.argv[2] ?? '', 'utf8')));
    console.log(JSON.stringify({ vulnerabilities: counts }, null, 2));
    if (counts.high > 0 || counts.critical > 0) process.exitCode = 1;
  } catch {
    console.error('[security:audit] Missing or invalid production audit evidence');
    process.exitCode = 1;
  }
}
