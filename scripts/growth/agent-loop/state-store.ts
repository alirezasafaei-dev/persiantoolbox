/**
 * State Store — Reads/writes agent-loop state.json
 *
 * State is the single source of truth for orchestrator lifecycle.
 * Every mutation is persisted to disk and (via git-persist) to GitHub.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { State, OrchestratorStatus } from './types.js';

const STATE_FILE = 'docs/growth/agent-loop/state.json';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

function defaultState(_projectRoot: string): State {
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
    workerId: `worker-${process.env['HOSTNAME'] || 'local'}-${process.pid}`,
    baseSha: '',
  };
}

// ---------------------------------------------------------------------------
// Load / Save
// ---------------------------------------------------------------------------

export function loadState(projectRoot: string): State {
  const statePath = join(projectRoot, STATE_FILE);
  if (!existsSync(statePath)) {
    const initial = defaultState(projectRoot);
    writeFileSync(statePath, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const raw = readFileSync(statePath, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    // Merge with defaults to handle missing fields
    return { ...defaultState(projectRoot), ...parsed } as State;
  } catch {
    const initial = defaultState(projectRoot);
    writeFileSync(statePath, JSON.stringify(initial, null, 2));
    return initial;
  }
}

export function saveState(projectRoot: string, state: State): void {
  const statePath = join(projectRoot, STATE_FILE);
  state.version += 1;
  writeFileSync(statePath, JSON.stringify(state, null, 2));
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function setStatus(state: State, status: OrchestratorStatus): State {
  return { ...state, status, lastHealthCheck: new Date().toISOString() };
}

export function setCurrentMission(state: State, missionId: string | null): State {
  return { ...state, currentMission: missionId };
}

export function incrementCompleted(state: State): State {
  return {
    ...state,
    totalMissionsCompleted: state.totalMissionsCompleted + 1,
    lastCompletedMission: state.currentMission,
    lastCompletedAt: new Date().toISOString(),
    currentMission: null,
    status: 'COMPLETED',
  };
}

export function incrementFailed(state: State): State {
  return {
    ...state,
    totalMissionsFailed: state.totalMissionsFailed + 1,
    currentMission: null,
    status: 'IDLE',
  };
}

export function setBaseSha(state: State, sha: string): State {
  return { ...state, baseSha: sha };
}

export function updateHeartbeat(state: State): State {
  return { ...state, lastHealthCheck: new Date().toISOString() };
}
