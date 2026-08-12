import { execFileSync } from 'child_process';

export const MISSION_BRANCH_PREFIX = 'codex/mission-';
export const CONTROL_PLANE_BRANCH = 'codex/agent-control-plane';

const SAFE_MISSION_ID = /^mission-[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
const CONVENTIONAL_COMMIT = /^(?:build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(?:\([^)]+\))?!?: .+/;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateMissionId(id: string): ValidationResult {
  const errors: string[] = [];
  if (!id || id === 'main' || id.includes('/') || id.includes('\\')) {
    errors.push('mission id must not be empty, main, or contain path separators');
  }
  if (!SAFE_MISSION_ID.test(id)) {
    errors.push('mission id must match mission-[a-z0-9]+ with safe separators');
  }
  return { valid: errors.length === 0, errors };
}

export function missionBranchName(missionId: string): string {
  const result = validateMissionId(missionId);
  if (!result.valid) throw new Error(result.errors.join('; '));
  return `${MISSION_BRANCH_PREFIX}${missionId.slice('mission-'.length)}`;
}

export function validateMissionBranch(branch: string): ValidationResult {
  const errors: string[] = [];
  if (branch === 'main' || branch === 'master') errors.push('main/master branches are forbidden');
  if (!branch.startsWith(MISSION_BRANCH_PREFIX)) {
    errors.push(`branch must start with ${MISSION_BRANCH_PREFIX}`);
  } else {
    const missionId = `mission-${branch.slice(MISSION_BRANCH_PREFIX.length)}`;
    if (!validateMissionId(missionId).valid) errors.push('branch contains an unsafe mission id');
  }
  return { valid: errors.length === 0, errors };
}

export function assertMissionBranch(branch: string): void {
  const result = validateMissionBranch(branch);
  if (!result.valid) throw new Error(result.errors.join('; '));
}

export function isConventionalCommitSubject(subject: string): boolean {
  return CONVENTIONAL_COMMIT.test(subject.trim()) && !subject.includes('\n');
}

export function currentBranch(projectRoot: string): string {
  return execFileSync('git', ['branch', '--show-current'], {
    cwd: projectRoot,
    encoding: 'utf8',
  }).trim();
}
