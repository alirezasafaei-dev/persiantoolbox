import { execFileSync } from 'child_process';
import { assertMissionBranch } from './mission-branch.js';

export interface VerificationGate {
  status: 'passed' | 'failed' | 'skipped';
  command?: string;
}

export function allVerificationPassed(gates: VerificationGate[]): boolean {
  return gates.length > 0 && gates.every((gate) => gate.status === 'passed');
}

export function buildDraftPrCreateArgs(branch: string, title: string, body: string): string[] {
  assertMissionBranch(branch);
  return ['pr', 'create', '--draft', '--base', 'main', '--head', branch, '--title', title, '--body', body];
}

export function buildDraftPrEditArgs(number: string, title: string, body: string): string[] {
  return ['pr', 'edit', number, '--title', title, '--body', body];
}

export interface DraftPrResult {
  action: 'created' | 'updated';
  url: string;
}

function gh(projectRoot: string, args: string[]): string {
  return execFileSync('gh', args, { cwd: projectRoot, encoding: 'utf8', timeout: 60_000 }).trim();
}

export function createOrUpdateDraftPr(
  projectRoot: string,
  branch: string,
  title: string,
  body: string,
  gates: VerificationGate[],
): DraftPrResult {
  if (!allVerificationPassed(gates)) throw new Error('Draft PR is blocked until every verification gate passes');
  assertMissionBranch(branch);
  const listed = gh(projectRoot, ['pr', 'list', '--head', branch, '--base', 'main', '--state', 'open', '--json', 'number,url,isDraft']);
  const prs = JSON.parse(listed || '[]') as Array<{ number: number; url: string; isDraft: boolean }>;
  const existing = prs.find((pr) => pr.isDraft);
  if (existing) {
    gh(projectRoot, buildDraftPrEditArgs(String(existing.number), title, body));
    return { action: 'updated', url: existing.url };
  }
  const url = gh(projectRoot, buildDraftPrCreateArgs(branch, title, body));
  return { action: 'created', url };
}
