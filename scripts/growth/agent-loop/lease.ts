/**
 * Lease Manager — Claim/heartbeat/release for mission execution
 *
 * Prevents concurrent execution. Uses time-based leases with heartbeat extension.
 * One mission active at a time per worker.
 */

import type { State, Mission } from './types.js';

const LEASE_DURATION_MS = 300_000; // 5 minutes
const LEASE_EXPIRY_MULTIPLIER = 2; // Consider stale after 2x lease duration

// ---------------------------------------------------------------------------
// Claim
// ---------------------------------------------------------------------------

export function claimMission(
  state: State,
  _mission: Mission,
  _workerId: string,
  baseSha: string,
  _leaseMs: number = LEASE_DURATION_MS,
): State {
  return {
    ...state,
    status: 'RUNNING',
    currentMission: _mission.id,
    baseSha,
    lastHealthCheck: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Heartbeat
// ---------------------------------------------------------------------------

export function heartbeat(state: State, _leaseMs: number = LEASE_DURATION_MS): State {
  return {
    ...state,
    lastHealthCheck: new Date().toISOString(),
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
