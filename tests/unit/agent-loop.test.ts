/**
 * Agent Control Plane — Tests
 *
 * Tests for: mission validation, claim, duplicate claim, lease expiry,
 * durable attempts, success waiting-review gate, report evidence,
 * canary duplicate prevention.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { validateMission } from '../../scripts/growth/agent-loop/mission-loader.js';
import {
  claimMission,
  isLeaseExpired,
  releaseStaleLease,
  canClaim,
  isMissionAlreadyCompleted,
} from '../../scripts/growth/agent-loop/lease.js';
import { generateReport } from '../../scripts/growth/agent-loop/report.js';
import {
  validateReviewArtifact,
  isTrustedReviewer,
  applyReviewTransition,
  signReviewArtifact,
  verifyReviewSignature,
  canonicalReviewPayload,
  getReportBlobSha,
} from '../../scripts/growth/agent-loop/review.js';
import {
  buildExecutorEnv,
  executorEnvIsSecretSafe,
} from '../../scripts/growth/agent-loop/executor.js';
import type { Mission, State, ReviewArtifact } from '../../scripts/growth/agent-loop/types.js';

const TEST_SECRET = 'test-review-secret-0123456789';

function makeMission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: 'mission-test-001',
    type: 'growth',
    priority: 'medium',
    title: 'Test Mission',
    description: 'A test mission',
    acceptanceCriteria: ['Do something'],
    files: [],
    deployApproved: false,
    destructiveOperationsAllowed: false,
    status: 'pending',
    claimedBy: null,
    claimedAt: null,
    leaseUntil: null,
    lastHeartbeat: null,
    baseSha: '',
    implementationSha: null,
    reportPath: null,
    lastError: null,
    attempts: 0,
    maxAttempts: 3,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeState(overrides: Partial<State> = {}): State {
  return {
    version: 1,
    status: 'IDLE',
    currentMission: null,
    lastCompletedMission: null,
    lastCompletedAt: null,
    totalMissionsCompleted: 0,
    totalMissionsFailed: 0,
    lastHealthCheck: null,
    heartbeatIntervalMs: 60_000,
    workerId: 'test-worker',
    baseSha: '',
    consumedReviewNonces: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Mission Validation
// ---------------------------------------------------------------------------

describe('Mission Validation', () => {
  it('accepts a valid mission', () => {
    const mission = makeMission();
    const errors = validateMission(mission as unknown as Record<string, unknown>);
    expect(errors).toHaveLength(0);
  });

  it('rejects mission without id', () => {
    const mission = makeMission({ id: '' });
    const errors = validateMission(mission as unknown as Record<string, unknown>);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects mission with wrong id prefix', () => {
    const mission = makeMission({ id: 'bad-prefix-001' });
    const errors = validateMission(mission as unknown as Record<string, unknown>);
    expect(errors.some((e: string) => e.includes('must start with'))).toBe(true);
  });

  it('rejects mission with invalid priority', () => {
    const mission = makeMission({ priority: 'urgent' as Mission['priority'] });
    const errors = validateMission(mission as unknown as Record<string, unknown>);
    expect(errors.some((e: string) => e.includes('priority'))).toBe(true);
  });

  it('rejects mission with empty acceptanceCriteria', () => {
    const mission = makeMission({ acceptanceCriteria: [] });
    const errors = validateMission(mission as unknown as Record<string, unknown>);
    expect(errors.some((e: string) => e.includes('acceptanceCriteria'))).toBe(true);
  });

  it('rejects mission with exhausted retries', () => {
    const mission = makeMission({ attempts: 3, maxAttempts: 3 });
    const errors = validateMission(mission as unknown as Record<string, unknown>);
    expect(errors.some((e: string) => e.includes('exhausted'))).toBe(true);
  });

  it('rejects forceShellExec flag', () => {
    const mission = makeMission();
    const errors = validateMission({
      ...mission,
      forceShellExec: true,
    } as unknown as Record<string, unknown>);
    expect(errors.some((e: string) => e.includes('forceShellExec'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Claim
// ---------------------------------------------------------------------------

describe('Claim', () => {
  it('claims a pending mission', () => {
    const state = makeState();
    const mission = makeMission();
    const claimed = claimMission(state, mission, 'worker-1', 'abc123', 300_000);

    expect(claimed.status).toBe('RUNNING');
    expect(claimed.currentMission).toBe('mission-test-001');
    expect(claimed.baseSha).toBe('abc123');
    expect(claimed.lastHealthCheck).toBeTruthy();
  });

  it('canClaim returns true for IDLE state', () => {
    const state = makeState({ status: 'IDLE', currentMission: null });
    expect(canClaim(state)).toBe(true);
  });

  it('canClaim returns false for RUNNING state', () => {
    const state = makeState({ status: 'RUNNING', currentMission: 'mission-1' });
    expect(canClaim(state)).toBe(false);
  });

  it('canClaim returns false for COMPLETED state', () => {
    const state = makeState({ status: 'COMPLETED', currentMission: null });
    expect(canClaim(state)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Duplicate Claim Prevention
// ---------------------------------------------------------------------------

describe('Duplicate Claim Prevention', () => {
  it('detects completed mission', () => {
    const mission = makeMission({ status: 'completed', implementationSha: 'abc123' });
    expect(isMissionAlreadyCompleted(mission)).toBe(true);
  });

  it('detects archived mission', () => {
    const mission = makeMission({ status: 'archived' });
    expect(isMissionAlreadyCompleted(mission)).toBe(true);
  });

  it('detects mission with implementation SHA', () => {
    const mission = makeMission({ status: 'running', implementationSha: 'abc123' });
    expect(isMissionAlreadyCompleted(mission)).toBe(true);
  });

  it('allows pending mission', () => {
    const mission = makeMission({ status: 'pending' });
    expect(isMissionAlreadyCompleted(mission)).toBe(false);
  });

  it('allows failed mission with no SHA', () => {
    const mission = makeMission({ status: 'failed', implementationSha: null });
    expect(isMissionAlreadyCompleted(mission)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Lease Expiry
// ---------------------------------------------------------------------------

describe('Lease Expiry', () => {
  it('detects expired lease', () => {
    const state = makeState({
      status: 'RUNNING',
      currentMission: 'mission-1',
      lastHealthCheck: new Date(Date.now() - 700_000).toISOString(), // 700s ago > 2x5min=600s
    });
    expect(isLeaseExpired(state, 300_000)).toBe(true);
  });

  it('allows valid lease', () => {
    const state = makeState({
      status: 'RUNNING',
      currentMission: 'mission-1',
      lastHealthCheck: new Date().toISOString(),
    });
    expect(isLeaseExpired(state, 300_000)).toBe(false);
  });

  it('releases stale lease', () => {
    const state = makeState({
      status: 'RUNNING',
      currentMission: 'mission-1',
      lastHealthCheck: new Date(Date.now() - 600_000).toISOString(),
    });
    const released = releaseStaleLease(state);
    expect(released.status).toBe('IDLE');
    expect(released.currentMission).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// State Machine — COMPLETED waiting for REVIEW
// ---------------------------------------------------------------------------

describe('State Machine', () => {
  it('COMPLETED state blocks new claims', () => {
    const state = makeState({ status: 'COMPLETED' });
    expect(canClaim(state)).toBe(false);
  });

  it('IDLE state allows claims', () => {
    const state = makeState({ status: 'IDLE' });
    expect(canClaim(state)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Report Evidence
// ---------------------------------------------------------------------------

describe('Report Evidence', () => {
  it('generates report with accurate timing', () => {
    const mission = makeMission({
      claimedAt: '2026-01-01T00:00:00Z',
    });

    const result = {
      success: true,
      output: 'done',
      duration: '5.0s',
      baseSha: 'abc123',
      headSha: 'def456',
      filesChanged: ['docs/test.md'],
      commits: [],
    };

    const report = generateReport(
      mission,
      result,
      [{ command: 'pnpm typecheck', status: 'passed' }],
      'Test note',
    );

    expect(report.missionId).toBe('mission-test-001');
    expect(report.status).toBe('success');
    expect(report.commits).toContain('abc123');
    expect(report.commits).toContain('def456');
    expect(report.filesChanged).toHaveLength(1);
    expect(report.tests).toHaveLength(1);
    expect(report.humanActions).toContain(
      'Review and approve to transition state from COMPLETED to REVIEWED',
    );
    expect(report.notes).toContain('Test note');
  });

  it('generates failed report with no human actions', () => {
    const mission = makeMission();
    const result = {
      success: false,
      output: 'error occurred',
      duration: '2.0s',
      baseSha: 'abc123',
      headSha: 'abc123',
      filesChanged: [],
      commits: [],
    };

    const report = generateReport(mission, result, [], 'Failed');

    expect(report.status).toBe('failed');
    expect(report.humanActions).toHaveLength(0);
  });

  it('includes commits when base != head', () => {
    const mission = makeMission();
    const result = {
      success: true,
      output: '',
      duration: '1.0s',
      baseSha: 'aaa111',
      headSha: 'bbb222',
      filesChanged: [],
      commits: [],
    };

    const report = generateReport(mission, result, []);
    expect(report.commits).toEqual(['aaa111', 'bbb222']);
  });

  it('empty commits when base == head', () => {
    const mission = makeMission();
    const result = {
      success: true,
      output: '',
      duration: '1.0s',
      baseSha: 'aaa111',
      headSha: 'aaa111',
      filesChanged: [],
      commits: [],
    };

    const report = generateReport(mission, result, []);
    expect(report.commits).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Canary Duplicate Prevention
// ---------------------------------------------------------------------------

describe('Canary Duplicate Prevention', () => {
  it('completed canary cannot be re-discovered', () => {
    const mission = makeMission({
      id: 'mission-control-plane-canary',
      status: 'completed',
      implementationSha: 'abc123',
    });
    expect(isMissionAlreadyCompleted(mission)).toBe(true);
  });

  it('pending canary can be discovered', () => {
    const mission = makeMission({
      id: 'mission-control-plane-canary',
      status: 'pending',
    });
    expect(isMissionAlreadyCompleted(mission)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Review Authority Gate — v3.1 (HMAC-signed, bound, replay-safe)
// ---------------------------------------------------------------------------

// A real temp git repo with a committed report file, so reportSha verification
// runs against actual git blob digests (not hardcoded values).
let fixtureRoot = '';
const REPORT_PATH = 'docs/growth/agent-loop/reports/mission-test-001.json';
let REAL_REPORT_SHA = '';
let REAL_MISSION: Mission;

function git(cwd: string, args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf-8' }).trim();
}

beforeAll(() => {
  fixtureRoot = mkdtempSync(join(tmpdir(), 'pt-agent-review-'));
  git(fixtureRoot, ['init', '-b', 'main']);
  git(fixtureRoot, ['config', 'user.email', 'test@example.com']);
  git(fixtureRoot, ['config', 'user.name', 'Test']);

  // Report file — committed so git rev-parse HEAD:<path> resolves
  const reportDir = join(fixtureRoot, 'docs/growth/agent-loop/reports');
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(join(fixtureRoot, REPORT_PATH), JSON.stringify({ ok: true }, null, 2));
  git(fixtureRoot, ['add', '-A']);
  git(fixtureRoot, ['commit', '-m', 'add report', '--no-verify']);
  REAL_REPORT_SHA = git(fixtureRoot, ['rev-parse', `HEAD:${REPORT_PATH}`]);

  // Mission matching the committed report + implementation
  REAL_MISSION = makeMission({
    status: 'completed',
    implementationSha: 'implsha456',
    reportPath: REPORT_PATH,
  });
});

afterAll(() => {
  if (fixtureRoot) {
    try {
      rmSync(fixtureRoot, { recursive: true, force: true });
    } catch {
      // best effort
    }
  }
});

function makeReviewArtifact(overrides: Partial<ReviewArtifact> = {}): ReviewArtifact {
  const artifact: ReviewArtifact = {
    missionId: 'mission-test-001',
    reviewer: 'external-chatgpt-review',
    reportPath: REPORT_PATH,
    reportSha: REAL_REPORT_SHA,
    implementationSha: 'implsha456',
    verdict: 'approved',
    findings: ['All checks passed'],
    reviewedAt: '2026-02-01T00:00:00Z',
    nonce: '11111111-1111-4111-8111-111111111111',
    signature: '',
    ...overrides,
  };
  // Only sign when the caller did not explicitly provide a signature —
  // forged-signature tests pass signature: '...' and must NOT be re-signed.
  if (overrides.signature === undefined) {
    artifact.signature = signReviewArtifact(artifact, TEST_SECRET);
  }
  return artifact;
}

function makeCompletedState(): State {
  return makeState({
    status: 'COMPLETED',
    currentMission: null,
    lastCompletedMission: 'mission-test-001',
    lastCompletedAt: '2026-01-31T00:00:00Z',
    totalMissionsCompleted: 1,
  });
}

function reviewContext(mission: Mission | null = REAL_MISSION, secret = TEST_SECRET) {
  return { mission, projectRoot: fixtureRoot, secret };
}

describe('Review Artifact Validation', () => {
  it('accepts a valid signed review artifact', () => {
    const { valid, errors } = validateReviewArtifact(makeReviewArtifact());
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('rejects artifact missing missionId', () => {
    const { valid, errors } = validateReviewArtifact(makeReviewArtifact({ missionId: '' }));
    expect(valid).toBe(false);
    expect(errors.some((e: string) => e.includes('missionId'))).toBe(true);
  });

  it('rejects artifact with invalid verdict', () => {
    const { valid, errors } = validateReviewArtifact(
      makeReviewArtifact({ verdict: 'maybe' as ReviewArtifact['verdict'] }),
    );
    expect(valid).toBe(false);
    expect(errors.some((e: string) => e.includes('verdict'))).toBe(true);
  });

  it('rejects artifact without reviewer', () => {
    const { valid, errors } = validateReviewArtifact(makeReviewArtifact({ reviewer: '' }));
    expect(valid).toBe(false);
    expect(errors.some((e: string) => e.includes('reviewer'))).toBe(true);
  });

  it('rejects artifact with invalid reviewedAt', () => {
    const { valid, errors } = validateReviewArtifact(
      makeReviewArtifact({ reviewedAt: 'not-a-date' }),
    );
    expect(valid).toBe(false);
    expect(errors.some((e: string) => e.includes('reviewedAt'))).toBe(true);
  });

  it('rejects artifact missing nonce', () => {
    const { valid, errors } = validateReviewArtifact(makeReviewArtifact({ nonce: '' }));
    expect(valid).toBe(false);
    expect(errors.some((e: string) => e.includes('nonce'))).toBe(true);
  });

  it('rejects artifact missing signature', () => {
    const { valid, errors } = validateReviewArtifact(makeReviewArtifact({ signature: '' }));
    expect(valid).toBe(false);
    expect(errors.some((e: string) => e.includes('signature'))).toBe(true);
  });
});

describe('HMAC Signature — v3.1', () => {
  it('signs and verifies with the correct secret', () => {
    const artifact = makeReviewArtifact();
    expect(verifyReviewSignature(artifact, TEST_SECRET)).toBe(true);
  });

  it('fails verification with a different secret', () => {
    const artifact = makeReviewArtifact();
    expect(verifyReviewSignature(artifact, 'wrong-secret')).toBe(false);
  });

  it('fails verification when signature is forged/absent', () => {
    const artifact = makeReviewArtifact({ signature: 'deadbeefdeadbeef' });
    expect(verifyReviewSignature(artifact, TEST_SECRET)).toBe(false);
    expect(verifyReviewSignature(artifact, '')).toBe(false);
  });

  it('canonical payload excludes the signature field and is deterministic', () => {
    const a = makeReviewArtifact();
    const b = makeReviewArtifact();
    expect(canonicalReviewPayload(a)).toBe(canonicalReviewPayload(b));
    expect(canonicalReviewPayload(a)).not.toContain(a.signature);
  });

  it('detects tampering: changing any field invalidates the signature', () => {
    const valid = makeReviewArtifact(); // signed
    const tampered = { ...valid, verdict: 'rejected' as const };
    expect(verifyReviewSignature(tampered, TEST_SECRET)).toBe(false);
  });
});

describe('Trusted Reviewer', () => {
  it('accepts the configured trusted reviewer', () => {
    expect(isTrustedReviewer('external-chatgpt-review')).toBe(true);
  });

  it('rejects the agent/executor identity as reviewer', () => {
    expect(isTrustedReviewer('YOLO-LOOP')).toBe(false);
    expect(isTrustedReviewer('opencode')).toBe(false);
    expect(isTrustedReviewer('persiantoolbox-agent')).toBe(false);
  });
});

describe('Review Transition — executor cannot self-approve', () => {
  it('COMPLETED without review artifact stays COMPLETED (blocked)', () => {
    const state = makeCompletedState();
    const result = applyReviewTransition(state, null, reviewContext());
    expect(result.applied).toBe(false);
    expect(result.state.status).toBe('COMPLETED');
  });

  it('approval signed by the executor itself is rejected', () => {
    const state = makeCompletedState();
    const selfApproval = makeReviewArtifact({ reviewer: 'YOLO-LOOP' });
    const result = applyReviewTransition(state, selfApproval, reviewContext());
    expect(result.applied).toBe(false);
    expect(result.state.status).toBe('COMPLETED');
  });

  it('forged artifact (bad signature) is rejected', () => {
    const state = makeCompletedState();
    const forged = makeReviewArtifact({ signature: 'f'.repeat(64) });
    const result = applyReviewTransition(state, forged, reviewContext());
    expect(result.applied).toBe(false);
    expect(result.state.status).toBe('COMPLETED');
    expect(result.reason).toContain('signature');
  });

  it('replay: already-consumed nonce is rejected', () => {
    const state = makeState({
      status: 'COMPLETED',
      currentMission: null,
      lastCompletedMission: 'mission-test-001',
      consumedReviewNonces: ['11111111-1111-4111-8111-111111111111'],
    });
    const result = applyReviewTransition(state, makeReviewArtifact(), reviewContext());
    expect(result.applied).toBe(false);
    expect(result.reason).toContain('nonce');
    expect(result.state.status).toBe('COMPLETED');
  });

  it('review for a different mission is rejected', () => {
    const state = makeCompletedState();
    const wrongMission = makeReviewArtifact({ missionId: 'mission-other' });
    const result = applyReviewTransition(state, wrongMission, reviewContext());
    expect(result.applied).toBe(false);
    expect(result.state.status).toBe('COMPLETED');
  });

  it('wrong implementationSha is rejected', () => {
    const state = makeCompletedState();
    const wrongImpl = makeReviewArtifact({ implementationSha: 'not-the-mission-sha' });
    const result = applyReviewTransition(state, wrongImpl, reviewContext());
    expect(result.applied).toBe(false);
    expect(result.reason).toContain('implementationSha');
    expect(result.state.status).toBe('COMPLETED');
  });

  it('wrong reportPath is rejected', () => {
    const state = makeCompletedState();
    const wrongPath = makeReviewArtifact({
      reportPath: 'docs/growth/agent-loop/reports/other.json',
      reportSha: '0000000000000000000000000000000000000000',
    });
    const result = applyReviewTransition(state, wrongPath, reviewContext());
    expect(result.applied).toBe(false);
    expect(result.reason).toContain('reportPath');
    expect(result.state.status).toBe('COMPLETED');
  });

  it('wrong reportSha (does not match git blob digest) is rejected', () => {
    const state = makeCompletedState();
    const wrongReportSha = makeReviewArtifact({
      reportSha: 'ffffffffffffffffffffffffffffffffffffffff',
    });
    const result = applyReviewTransition(state, wrongReportSha, reviewContext());
    expect(result.applied).toBe(false);
    expect(result.reason).toContain('reportSha');
    expect(result.state.status).toBe('COMPLETED');
  });

  it('mission file missing (no canonical mission) is rejected', () => {
    const state = makeCompletedState();
    const result = applyReviewTransition(state, makeReviewArtifact(), reviewContext(null));
    expect(result.applied).toBe(false);
    expect(result.state.status).toBe('COMPLETED');
  });

  it('valid approved review transitions COMPLETED → REVIEWED → ARCHIVED/IDLE', () => {
    const state = makeCompletedState();
    const result = applyReviewTransition(state, makeReviewArtifact(), reviewContext());
    expect(result.applied).toBe(true);
    expect(result.transition).toBe('COMPLETED → REVIEWED → ARCHIVED/IDLE');
    expect(result.reviewedState.status).toBe('REVIEWED');
    expect(result.state.status).toBe('IDLE');
    expect(result.reviewedState.consumedReviewNonces).toContain(
      '11111111-1111-4111-8111-111111111111',
    );
  });

  it('valid rejected review transitions to IDLE and counts a failure', () => {
    const state = makeCompletedState();
    const result = applyReviewTransition(
      state,
      makeReviewArtifact({ verdict: 'rejected', findings: ['Critical bug found'] }),
      reviewContext(),
    );
    expect(result.applied).toBe(true);
    expect(result.transition).toContain('rejected');
    expect(result.reviewedState.status).toBe('REVIEWED');
    expect(result.state.status).toBe('IDLE');
    expect(result.state.totalMissionsFailed).toBe(1);
  });

  it('non-COMPLETED state is not affected by review processing', () => {
    const state = makeState({ status: 'RUNNING', currentMission: 'mission-test-001' });
    const result = applyReviewTransition(state, makeReviewArtifact(), reviewContext());
    expect(result.applied).toBe(false);
    expect(result.state.status).toBe('RUNNING');
  });
});

// ---------------------------------------------------------------------------
// Executor env isolation — v3.1
// ---------------------------------------------------------------------------

describe('Executor Environment Isolation', () => {
  it('buildExecutorEnv strips REVIEW_SECRET from the agent subprocess env', () => {
    process.env['REVIEW_SECRET'] = 'super-secret-never-leak';
    try {
      const env = buildExecutorEnv();
      expect(executorEnvIsSecretSafe(env)).toBe(true);
      expect(env['REVIEW_SECRET']).toBeUndefined();
    } finally {
      delete process.env['REVIEW_SECRET'];
    }
  });

  it('buildExecutorEnv keeps other env vars intact', () => {
    process.env['PATH'] = '/usr/bin:/bin';
    const env = buildExecutorEnv();
    expect(env['PATH']).toBe('/usr/bin:/bin');
    expect(env['NO_COLOR']).toBe('1');
  });

  it('getReportBlobSha returns the real git blob digest of a committed file', () => {
    const sha = getReportBlobSha(fixtureRoot, REPORT_PATH);
    expect(sha).toBeTruthy();
    expect(sha).toMatch(/^[0-9a-f]{40}$/);
  });
});

// ---------------------------------------------------------------------------
// Durable review ordering + real commits — v3.1
// ---------------------------------------------------------------------------

describe('Durable Review Ordering', () => {
  it('REVIEWED commit exists before the archive/IDLE commit in git history', () => {
    const repo = mkdtempSync(join(tmpdir(), 'pt-agent-order-'));
    try {
      git(repo, ['init', '-b', 'main']);
      git(repo, ['config', 'user.email', 'test@example.com']);
      git(repo, ['config', 'user.name', 'Test']);

      // Seed state.json + mission file so persist functions have content
      const stateDir = join(repo, 'docs/growth/agent-loop');
      const missionsDir = join(stateDir, 'missions');
      const reviewsDir = join(stateDir, 'reviews');
      mkdirSync(missionsDir, { recursive: true });
      mkdirSync(reviewsDir, { recursive: true });
      writeFileSync(
        join(stateDir, 'state.json'),
        JSON.stringify({ status: 'COMPLETED', lastCompletedMission: 'mission-test-001' }, null, 2),
      );
      writeFileSync(
        join(missionsDir, 'mission-test-001.json'),
        JSON.stringify({ id: 'mission-test-001', status: 'completed' }, null, 2),
      );
      writeFileSync(
        join(reviewsDir, 'mission-test-001.json'),
        JSON.stringify(makeReviewArtifact(), null, 2),
      );
      git(repo, ['add', '-A']);
      git(repo, ['commit', '-m', 'seed', '--no-verify']);

      // Step 1: REVIEWED commit
      writeFileSync(
        join(stateDir, 'state.json'),
        JSON.stringify({ status: 'REVIEWED', lastCompletedMission: 'mission-test-001' }, null, 2),
      );
      git(repo, ['add', '-A']);
      git(repo, [
        'commit',
        '-m',
        'agent-loop: REVIEWED mission-test-001 — approved by external-chatgpt-review',
        '--no-verify',
      ]);
      const reviewedSha = git(repo, ['rev-parse', 'HEAD']);

      // Step 2: archive/IDLE commit
      writeFileSync(
        join(stateDir, 'state.json'),
        JSON.stringify({ status: 'IDLE', lastCompletedMission: 'mission-test-001' }, null, 2),
      );
      git(repo, ['add', '-A']);
      git(repo, [
        'commit',
        '-m',
        'agent-loop: archive mission-test-001 — approved by external-chatgpt-review',
        '--no-verify',
      ]);
      const archivedSha = git(repo, ['rev-parse', 'HEAD']);

      // REVIEWED commit must be an ancestor of the archive commit
      const isAncestor = git(repo, ['merge-base', '--is-ancestor', reviewedSha, archivedSha]);
      expect(isAncestor).toBe('');

      // Both commits exist in history with distinct messages
      const log = git(repo, ['log', '--format=%s', '--reverse']);
      const messages = log.split('\n');
      const reviewedIdx = messages.findIndex((m) => m.includes('REVIEWED mission-test-001'));
      const archivedIdx = messages.findIndex((m) => m.includes('archive mission-test-001'));
      expect(reviewedIdx).toBeGreaterThan(-1);
      expect(archivedIdx).toBeGreaterThan(reviewedIdx);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });

  it('getCommitsBetween returns real commit SHAs from git history', async () => {
    const { getCommitsBetween } = await import('../../scripts/growth/agent-loop/git-persist.js');
    const repo = mkdtempSync(join(tmpdir(), 'pt-agent-commits-'));
    try {
      git(repo, ['init', '-b', 'main']);
      git(repo, ['config', 'user.email', 'test@example.com']);
      git(repo, ['config', 'user.name', 'Test']);
      writeFileSync(join(repo, 'a.txt'), 'a');
      git(repo, ['add', '-A']);
      git(repo, ['commit', '-m', 'c1', '--no-verify']);
      const base = git(repo, ['rev-parse', 'HEAD']);

      writeFileSync(join(repo, 'b.txt'), 'b');
      git(repo, ['add', '-A']);
      git(repo, ['commit', '-m', 'c2', '--no-verify']);
      const mid = git(repo, ['rev-parse', 'HEAD']);

      writeFileSync(join(repo, 'c.txt'), 'c');
      git(repo, ['add', '-A']);
      git(repo, ['commit', '-m', 'c3', '--no-verify']);
      const head = git(repo, ['rev-parse', 'HEAD']);

      const commits = getCommitsBetween(repo, base, head);
      expect(commits).toHaveLength(2);
      // git rev-list returns newest-first
      expect(commits[0]).toBe(head);
      expect(commits[1]).toBe(mid);
      expect(commits).not.toContain(base);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// Report Provenance — v3.0
// ---------------------------------------------------------------------------

describe('Report Provenance', () => {
  it('headSha equals the executor-produced implementation commit', () => {
    const mission = makeMission();
    const result = {
      success: true,
      output: '',
      duration: '5.0s',
      baseSha: 'base000',
      headSha: 'impl123', // the actual canary implementation commit
      filesChanged: ['docs/growth/agent-loop/canary/canary.txt'],
      commits: [],
    };

    const report = generateReport(mission, result, []);

    expect(report.headSha).toBe('impl123');
    expect(report.commits).toContain('impl123');
    expect(report.baseSha).toBe('base000');
  });

  it('records test exit codes truthfully', () => {
    const mission = makeMission();
    const result = {
      success: true,
      output: '',
      duration: '5.0s',
      baseSha: 'base000',
      headSha: 'base000',
      filesChanged: [],
      commits: [],
    };

    const report = generateReport(mission, result, [
      { command: 'pnpm typecheck', status: 'passed', exitCode: 0, duration: '10.2s' },
      { command: 'pnpm lint', status: 'passed', exitCode: 0, duration: '8.1s' },
      { command: 'pnpm vitest --run', status: 'failed', exitCode: 1, duration: '3.0s' },
    ]);

    const vitest = report.tests.find((t) => t.command.includes('vitest'));
    expect(vitest?.status).toBe('failed');
    expect(vitest?.exitCode).toBe(1);
  });

  it('never marks a failing command as passed', () => {
    const mission = makeMission();
    const result = {
      success: false,
      output: '',
      duration: '5.0s',
      baseSha: 'base000',
      headSha: 'base000',
      filesChanged: [],
      commits: [],
    };

    const report = generateReport(
      mission,
      result,
      [{ command: 'pnpm build', status: 'failed', exitCode: 2, duration: '5.0s' }],
      'Build failed',
    );

    expect(report.status).toBe('failed');
    const build = report.tests.find((t) => t.command.includes('build'));
    expect(build?.status).toBe('failed');
    expect(build?.exitCode).toBe(2);
  });

  it('report includes test timing evidence', () => {
    const mission = makeMission();
    const result = {
      success: true,
      output: '',
      duration: '5.0s',
      baseSha: 'base000',
      headSha: 'base000',
      filesChanged: [],
      commits: [],
    };

    const report = generateReport(mission, result, [
      { command: 'pnpm typecheck', status: 'passed', exitCode: 0, duration: '12.3s' },
    ]);

    expect(report.tests[0]?.duration).toBe('12.3s');
  });
});
