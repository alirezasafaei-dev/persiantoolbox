/**
 * Agent Control Plane — Tests
 *
 * Tests for: mission validation, claim, duplicate claim, lease expiry,
 * durable attempts, success waiting-review gate, report evidence,
 * canary duplicate prevention.
 */

import { describe, it, expect } from 'vitest';
import { validateMission } from '../../scripts/growth/agent-loop/mission-loader.js';
import {
  claimMission,
  isLeaseExpired,
  releaseStaleLease,
  canClaim,
  isMissionAlreadyCompleted,
} from '../../scripts/growth/agent-loop/lease.js';
import { generateReport } from '../../scripts/growth/agent-loop/report.js';
import type { Mission, State } from '../../scripts/growth/agent-loop/types.js';

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
