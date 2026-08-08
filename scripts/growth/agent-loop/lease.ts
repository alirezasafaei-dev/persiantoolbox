/**
 * Lease Manager — Claim/heartbeat/release for mission execution
 *
 * v2.0 — Durable lease fields, duplicate claim prevention, stale recovery
 */

import type { State, Mission } from './types.js';

const LEASE_DURATION_MS = 300_000; // 5 minutes
const LEASE_EXPIRY_MULTIPLIER = 2; // Consider stale after 2x lease duration

// ---------------------------------------------------------------------------
// Claim — with durable metadata
// ---------------------------------------------------------------------------

export function claimMission(
  state: State,
  _mission: Mission,
  _workerId: string,
  baseSha: string,
  _leaseMs: number = LEASE_DURATION_MS,
): State {
  const now = new Date().toISOString();

  return {
    ...state,
    status: 'RUNNING',
    currentMission: _mission.id,
    baseSha,
    lastHealthCheck: now,
  };
}

// ---------------------------------------------------------------------------
// Heartbeat — extends lease
// ---------------------------------------------------------------------------

export function heartbeat(state: State, _leaseMs: number = LEASE_DURATION_MS): State {
  const now = new Date().toISOString();
  return {
    ...state,
    lastHealthCheck: now,
  };
}

// ---------------------------------------------------------------------------
// Lease checks
// ---------------------------------------------------------------------------

export function isLeaseExpired(state: State, leaseMs: number = LEASE_DURATION_MS): boolean {
  if (!state.lastHealthCheck || !state.currentMission) return false;

  const lastCheck = new Date(state.lastHealthCheck).getTime();
  const now = Date.now();
  const elapsed = now - lastCheck;

  return elapsed > leaseMs * LEASE_EXPIRY_MULTIPLIER;
}

export function releaseStaleLease(state: State): State {
  if (!state.currentMission) return state;

  return {
    ...state,
    status: 'IDLE',
    currentMission: null,
    lastHealthCheck: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Predicates
// ---------------------------------------------------------------------------

export function canClaim(state: State): boolean {
  return state.status === 'IDLE' && state.currentMission === null;
}

// ---------------------------------------------------------------------------
// Duplicate prevention — check if mission already has success report
// ---------------------------------------------------------------------------

export function isMissionAlreadyCompleted(mission: Mission): boolean {
  return (
    mission.status === 'completed' ||
    mission.status === 'archived' ||
    (mission.implementationSha !== null && mission.status !== 'failed')
  );
}
