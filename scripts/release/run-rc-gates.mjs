import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = new Set(process.argv.slice(2));
const tier = args.has('--tier=extended') || args.has('--tier=full') ? 'extended' : 'core';

const checklistPath = resolve(process.cwd(), 'docs/release-candidate-checklist.json');
const checklist = JSON.parse(readFileSync(checklistPath, 'utf8'));
const selectedGates = checklist.qualityGates.filter(
  (gate) => gate.tier === 'core' || tier === 'extended',
);

const results = [];

for (const gate of selectedGates) {
  const startedAt = Date.now();
  try {
    const output = execSync(gate.command, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    results.push({
      id: gate.id,
      command: gate.command,
      status: 'passed',
      tier: gate.tier,
      blocking: gate.blocking,
      durationMs: Date.now() - startedAt,
      output: output.trim(),
    });
  } catch (error) {
    const stderr = error?.stderr ? String(error.stderr) : String(error);
    results.push({
      id: gate.id,
      command: gate.command,
      status: 'failed',
      tier: gate.tier,
      blocking: gate.blocking,
      durationMs: Date.now() - startedAt,
      output: stderr.trim(),
    });

    const report = {
      version: 1,
      generatedAt: new Date().toISOString(),
      tier,
      overallStatus: gate.blocking ? 'failed' : 'warning',
      steps: results,
      releaseRecommendation: gate.blocking ? 'hold' : 'review',
    };

    const reportsDir = resolve(process.cwd(), 'docs/release/reports');
    mkdirSync(reportsDir, { recursive: true });
    const fileName = `rc-gates-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    writeFileSync(resolve(reportsDir, fileName), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    if (gate.blocking) {
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
  steps: results,
  releaseRecommendation: hasBlockingFailure ? 'hold' : 'proceed',
};

const reportsDir = resolve(process.cwd(), 'docs/release/reports');
mkdirSync(reportsDir, { recursive: true });
const fileName = `rc-gates-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
writeFileSync(resolve(reportsDir, fileName), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`[release] rc gates run completed: ${fileName}`);
