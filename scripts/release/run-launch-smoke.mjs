import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = new Set(process.argv.slice(2));
const tier = args.has('--tier=extended') || args.has('--tier=full') ? 'extended' : 'core';

const checklistPath = resolve(process.cwd(), 'docs/launch-day-checklist.json');
const checklist = JSON.parse(readFileSync(checklistPath, 'utf8'));
const selectedSuites = checklist.smokeSuites.filter(
  (suite) => suite.tier === 'core' || tier === 'extended',
);

const results = [];

for (const suite of selectedSuites) {
  const startedAt = Date.now();
  try {
    const output = execSync(suite.command, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    results.push({
      id: suite.id,
      command: suite.command,
      status: 'passed',
      tier: suite.tier,
      blocking: suite.blocking,
      durationMs: Date.now() - startedAt,
      output: output.trim(),
    });
  } catch (error) {
    const stderr = error?.stderr ? String(error.stderr) : String(error);
    results.push({
      id: suite.id,
      command: suite.command,
      status: 'failed',
      tier: suite.tier,
      blocking: suite.blocking,
      durationMs: Date.now() - startedAt,
      output: stderr.trim(),
    });

    const report = {
      version: 1,
      generatedAt: new Date().toISOString(),
      tier,
      overallStatus: suite.blocking ? 'failed' : 'warning',
      suites: results,
      launchRecommendation: suite.blocking ? 'hold' : 'review',
    };

    const reportsDir = resolve(process.cwd(), 'docs/release/reports');
    mkdirSync(reportsDir, { recursive: true });
    const fileName = `launch-smoke-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    writeFileSync(resolve(reportsDir, fileName), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    if (suite.blocking) {
      throw error;
    }
  }
}

const hasBlockingFailure = results.some((item) => item.blocking && item.status === 'failed');
const report = {
  version: 1,
  generatedAt: new Date().toISOString(),
  tier,
  overallStatus: hasBlockingFailure ? 'failed' : 'passed',
  suites: results,
  launchRecommendation: hasBlockingFailure ? 'hold' : 'proceed',
};

const reportsDir = resolve(process.cwd(), 'docs/release/reports');
mkdirSync(reportsDir, { recursive: true });
const fileName = `launch-smoke-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
writeFileSync(resolve(reportsDir, fileName), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`[release] launch smoke run completed: ${fileName}`);
