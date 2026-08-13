import { execFileSync } from 'child_process';
import { assertMissionBranch, CONTROL_PLANE_BRANCH, currentBranch, isConventionalCommitSubject, missionBranchName } from './mission-branch.js';

export interface GitSyncStatus {
  branch: string;
  headSha: string;
  worktreeClean: boolean;
  upstream: string | null;
  ahead: number;
  behind: number;
  diverged: boolean;
}

function runGit(projectRoot: string, args: string[], allowFailure = false): string {
  try {
    return execFileSync('git', args, {
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 30_000,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    if (allowFailure) return '';
    throw new Error(`git ${args.join(' ')} failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function requireCleanWorktree(projectRoot: string): void {
  if (runGit(projectRoot, ['status', '--porcelain'])) {
    throw new Error('worktree must be clean before synchronization or branch creation');
  }
}

export function getGitSyncStatus(projectRoot: string): GitSyncStatus {
  const branch = currentBranch(projectRoot);
  const upstream = runGit(projectRoot, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}'], true) || null;
  const counts = upstream
    ? runGit(projectRoot, ['rev-list', '--left-right', '--count', `${upstream}...HEAD`], true).split(/\s+/).map(Number)
    : [0, 0];
  const behind = counts[0] ?? 0;
  const ahead = counts[1] ?? 0;
  return {
    branch,
    headSha: runGit(projectRoot, ['rev-parse', 'HEAD']),
    worktreeClean: runGit(projectRoot, ['status', '--porcelain']).length === 0,
    upstream,
    ahead,
    behind,
    diverged: ahead > 0 && behind > 0,
  };
}

export function fetchPrune(projectRoot: string): void {
  runGit(projectRoot, ['fetch', '--prune', 'origin']);
}

export function assertSynchronizedMissionBranch(projectRoot: string): GitSyncStatus {
  const status = getGitSyncStatus(projectRoot);
  if (!status.worktreeClean) throw new Error('worktree is dirty');
  assertMissionBranch(status.branch);
  if (status.diverged) throw new Error('mission branch is diverged from its upstream');
  if (status.behind > 0) throw new Error(`mission branch is behind upstream by ${status.behind} commit(s)`);
  return status;
}

export function createMissionBranch(projectRoot: string, missionId: string, baseSha: string): string {
  requireCleanWorktree(projectRoot);
  const branch = missionBranchName(missionId);
  const current = currentBranch(projectRoot);
  if (current === 'main' || current === 'master') throw new Error('refusing to create a mission from main/master');
  if (!/^[0-9a-f]{7,64}$/i.test(baseSha)) throw new Error('recorded base SHA is invalid');
  const exists = runGit(projectRoot, ['show-ref', '--verify', `refs/heads/${branch}`], true);
  if (exists) {
    const existingSha = runGit(projectRoot, ['rev-parse', branch]);
    if (existingSha !== baseSha) throw new Error(`existing mission branch ${branch} is not at recorded base SHA`);
    runGit(projectRoot, ['switch', branch]);
  } else {
    runGit(projectRoot, ['switch', '--create', branch, baseSha]);
  }
  if (runGit(projectRoot, ['rev-parse', 'HEAD']) !== baseSha) throw new Error('mission branch was not created from recorded base SHA');
  return branch;
}

/**
 * Reserve a fresh mission branch directly on origin before switching locally.
 * Git rejects a non-fast-forward creation when another worker wins the same
 * ref, so this is a compare-and-create operation without force-push or remote
 * branch deletion. A stale historical branch is preserved and the next stable
 * retry suffix is attempted deterministically.
 */
export function reserveMissionBranch(
  projectRoot: string,
  missionId: string,
  baseSha: string,
): string {
  requireCleanWorktree(projectRoot);
  if (!/^[0-9a-f]{7,64}$/i.test(baseSha)) throw new Error('recorded base SHA is invalid');
  const current = currentBranch(projectRoot);
  if (current === 'main' || current === 'master') {
    throw new Error('refusing to create a mission from main/master');
  }

  for (let retry = 0; retry < 100; retry += 1) {
    const candidateMissionId = retry === 0 ? missionId : `${missionId}-retry-${retry}`;
    const branch = missionBranchName(candidateMissionId);
    const localExists = runGit(projectRoot, ['show-ref', '--verify', `refs/heads/${branch}`], true);
    if (localExists) continue;

    try {
      runGit(projectRoot, ['push', 'origin', `${baseSha}:refs/heads/${branch}`]);
      runGit(projectRoot, ['switch', '--create', branch, baseSha]);
      if (runGit(projectRoot, ['rev-parse', 'HEAD']) !== baseSha) {
        throw new Error('reserved mission branch was not created from recorded base SHA');
      }
      return branch;
    } catch (error) {
      const remoteSha = runGit(projectRoot, ['ls-remote', '--heads', 'origin', branch], true)
        .split(/\s+/)[0];
      if (remoteSha) continue;
      throw error;
    }
  }
  throw new Error(`no retry branch could be reserved for ${missionId}`);
}

export function buildGitPushArgs(branch: string): string[] {
  assertMissionBranch(branch);
  return ['push', '--set-upstream', 'origin', branch];
}

export function gitAddAndCommit(projectRoot: string, files: string[], message: string): string {
  if (files.length === 0) return runGit(projectRoot, ['rev-parse', 'HEAD']);
  const branch = currentBranch(projectRoot);
  assertMissionBranch(branch);
  if (!isConventionalCommitSubject(message)) throw new Error(`invalid Conventional Commit subject: ${message}`);
  runGit(projectRoot, ['add', '--', ...files]);
  runGit(projectRoot, ['commit', '-m', message, '--signoff']);
  return runGit(projectRoot, ['rev-parse', 'HEAD']);
}

export function gitPush(projectRoot: string): boolean {
  const status = assertSynchronizedMissionBranch(projectRoot);
  try {
    runGit(projectRoot, buildGitPushArgs(status.branch));
    return true;
  } catch (error) {
    console.error(`[GIT] Push failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/** Persist generated control-plane state before branching from origin/main. */
export function persistControlPlaneState(projectRoot: string, message: string): string | null {
  if (currentBranch(projectRoot) !== CONTROL_PLANE_BRANCH) {
    throw new Error(`control-plane persistence requires ${CONTROL_PLANE_BRANCH}`);
  }
  if (!isConventionalCommitSubject(message)) throw new Error(`invalid Conventional Commit subject: ${message}`);
  if (!runGit(projectRoot, ['status', '--porcelain'])) return null;
  runGit(projectRoot, ['add', '--', 'docs/growth/agent-loop/']);
  runGit(projectRoot, ['commit', '-m', message, '--signoff']);
  runGit(projectRoot, ['push', 'origin', CONTROL_PLANE_BRANCH]);
  return runGit(projectRoot, ['rev-parse', 'HEAD']);
}

function gitCommitAndPush(projectRoot: string, files: string[], message: string): string {
  const sha = gitAddAndCommit(projectRoot, files, message);
  if (!gitPush(projectRoot)) throw new Error(`failed to push mission branch ${currentBranch(projectRoot)}`);
  return sha;
}

export function persistMissionClaim(projectRoot: string, missionId: string, sha: string): string {
  return gitCommitAndPush(projectRoot, ['docs/growth/agent-loop/state.json', 'docs/growth/agent-loop/missions/'], `chore(agent-loop): claim ${missionId} at ${sha.slice(0, 8)}`);
}

export function persistMissionCompletion(projectRoot: string, missionId: string, reportPaths: string[]): string {
  return gitCommitAndPush(projectRoot, ['docs/growth/agent-loop/state.json', 'docs/growth/agent-loop/missions/', ...reportPaths], `feat(agent-loop): complete ${missionId}`);
}

export function persistMissionFailure(projectRoot: string, missionId: string, error: string): string {
  return gitCommitAndPush(projectRoot, ['docs/growth/agent-loop/state.json', 'docs/growth/agent-loop/missions/'], `fix(agent-loop): record failure ${missionId} - ${error.slice(0, 60)}`);
}

export function persistMissionReview(projectRoot: string, missionId: string, artifact: { reviewer: string; verdict: string }): string {
  return gitCommitAndPush(projectRoot, ['docs/growth/agent-loop/state.json', 'docs/growth/agent-loop/missions/', 'docs/growth/agent-loop/reviews/'], `chore(agent-loop): review ${missionId} by ${artifact.reviewer}`);
}

export function persistReviewReviewed(projectRoot: string, missionId: string, artifact: { reviewer: string; verdict: string }): string {
  return gitCommitAndPush(projectRoot, ['docs/growth/agent-loop/state.json', 'docs/growth/agent-loop/missions/', 'docs/growth/agent-loop/reviews/'], `chore(agent-loop): reviewed ${missionId} by ${artifact.reviewer}`);
}

export function persistReviewArchived(projectRoot: string, missionId: string, artifact: { reviewer: string; verdict: string }): string {
  return gitCommitAndPush(projectRoot, ['docs/growth/agent-loop/state.json', 'docs/growth/agent-loop/missions/', 'docs/growth/agent-loop/reviews/'], `chore(agent-loop): archive ${missionId} by ${artifact.reviewer}`);
}

export function getCommitsBetween(projectRoot: string, fromSha: string, toSha: string): string[] {
  if (!fromSha || !toSha || fromSha === toSha) return [];
  const output = runGit(projectRoot, ['rev-list', '--ancestry-path', `${fromSha}..${toSha}`], true);
  return output ? output.split('\n').filter(Boolean) : [];
}

export function getChangedFiles(projectRoot: string, fromSha: string, toSha: string): string[] {
  if (fromSha === toSha) return [];
  const output = runGit(projectRoot, ['diff', '--name-only', `${fromSha}..${toSha}`], true);
  return output ? output.split('\n').filter(Boolean) : [];
}

export function getCurrentSha(projectRoot: string): string {
  return runGit(projectRoot, ['rev-parse', 'HEAD']);
}
