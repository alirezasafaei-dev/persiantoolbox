import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const steps = [
  { id: 'ops_contract', command: 'pnpm monetization:ops:validate' },
  { id: 'review_backlog_contract', command: 'pnpm monetization:review:validate' },
  { id: 'alerting_decision_contract', command: 'pnpm monetization:alerting:validate' },
];

const results = [];
for (const step of steps) {
  const startedAt = Date.now();
  try {
    const output = execSync(step.command, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    results.push({
      step: step.id,
      command: step.command,
      status: 'passed',
      durationMs: Date.now() - startedAt,
      output: output.trim(),
    });
  } catch (error) {
    const stderr = error?.stderr ? String(error.stderr) : String(error);
    results.push({
      step: step.id,
      command: step.command,
      status: 'failed',
      durationMs: Date.now() - startedAt,
      output: stderr.trim(),
    });

    const report = {
      version: 1,
      closeType: 'monthly',
      generatedAt: new Date().toISOString(),
      overallStatus: 'failed',
      steps: results,
      nextDecision: 'hold',
    };

    const reportsDir = resolve(process.cwd(), 'docs/monetization/reports/monthly');
    mkdirSync(reportsDir, { recursive: true });
    const fileName = `monthly-close-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    writeFileSync(resolve(reportsDir, fileName), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    throw error;
  }
}

const report = {
  version: 1,
  closeType: 'monthly',
  generatedAt: new Date().toISOString(),
  overallStatus: 'passed',
  steps: results,
  nextDecision: 'scale',
};

const reportsDir = resolve(process.cwd(), 'docs/monetization/reports/monthly');
mkdirSync(reportsDir, { recursive: true });
const fileName = `monthly-close-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
writeFileSync(resolve(reportsDir, fileName), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`[monetization] monthly close pipeline completed: ${fileName}`);
