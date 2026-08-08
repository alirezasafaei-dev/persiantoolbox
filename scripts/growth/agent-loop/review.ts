/**
 * Review Authority — External review gate for completed missions
 *
 * v3.0 — COMPLETED → REVIEWED → ARCHIVED/IDLE transitions
 *
 * Rules:
 * - The executor/orchestrator NEVER self-approves a completed mission.
 * - A COMPLETED mission may transition only after a durable review artifact
 *   exists under docs/growth/agent-loop/reviews/ with at least: missionId,
 *   reviewer identity, reviewed report SHA/path, reviewed implementation SHA,
 *   verdict (approved|rejected), findings, reviewedAt.
 * - Only a configured trusted reviewer identity may create an approval that
 *   the orchestrator consumes. Mission executor output, mission content,
 *   commit messages, and Notion row status never count as approval.
 * - state.status stays COMPLETED until the review artifact is present and
 *   validated. REVIEWED is never skipped in durable history.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { ReviewArtifact, State } from './types.js';

const REVIEWS_DIR = 'docs/growth/agent-loop/reviews';

// Default trusted reviewer identity — overridable via TRUSTED_REVIEWER env.
// This is the identity of the human/external review authority, NOT the agent.
const DEFAULT_TRUSTED_REVIEWER = 'external-chatgpt-review';

// ---------------------------------------------------------------------------
// Trusted reviewer
// ---------------------------------------------------------------------------

export function isTrustedReviewer(reviewer: string): boolean {
  const trusted = process.env['TRUSTED_REVIEWER'] || DEFAULT_TRUSTED_REVIEWER;
  return reviewer === trusted;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateReviewArtifact(artifact: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!artifact || typeof artifact !== 'object') {
    return { valid: false, errors: ['Review artifact is not an object'] };
  }

  const a = artifact as Record<string, unknown>;

  const required = [
    'missionId',
    'reviewer',
    'reportPath',
    'reportSha',
    'implementationSha',
    'verdict',
    'findings',
    'reviewedAt',
  ] as const;

  for (const field of required) {
    if (a[field] === undefined || a[field] === null || a[field] === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (a['verdict'] !== undefined && a['verdict'] !== 'approved' && a['verdict'] !== 'rejected') {
    errors.push(`Invalid verdict: "${a['verdict']}". Must be "approved" or "rejected"`);
  }

  if (a['findings'] !== undefined && !Array.isArray(a['findings'])) {
    errors.push('findings must be an array');
  }

  if (
    a['reviewedAt'] !== undefined &&
    Number.isNaN(new Date(a['reviewedAt'] as string).getTime())
  ) {
    errors.push('reviewedAt must be a valid date');
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Load review artifacts
// ---------------------------------------------------------------------------

export function loadReviewArtifact(projectRoot: string, missionId: string): ReviewArtifact | null {
  const reviewPath = join(projectRoot, REVIEWS_DIR, `${missionId}.json`);
  if (!existsSync(reviewPath)) return null;

  try {
    const raw = readFileSync(reviewPath, 'utf-8');
    return JSON.parse(raw) as ReviewArtifact;
  } catch {
    return null;
  }
}

export function listReviewArtifacts(projectRoot: string): string[] {
  const reviewsDir = join(projectRoot, REVIEWS_DIR);
  if (!existsSync(reviewsDir)) return [];
  return readdirSync(reviewsDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
}

// ---------------------------------------------------------------------------
// Transition — COMPLETED → REVIEWED → ARCHIVED/IDLE
// ---------------------------------------------------------------------------

export interface ReviewTransitionResult {
  applied: boolean;
  transition: string;
  reason: string;
  state: State;
}

/**
 * Attempt to apply a review artifact to a COMPLETED state.
 * Returns the new state (REVIEWED then IDLE on approved, IDLE on rejected)
 * or the unchanged COMPLETED state when the artifact is missing/invalid/
 * untrusted — the mission stays blocked awaiting a valid external review.
 */
export function applyReviewTransition(
  state: State,
  artifact: ReviewArtifact | null,
): ReviewTransitionResult {
  if (state.status !== 'COMPLETED') {
    return { state, applied: false, transition: 'none', reason: 'State is not COMPLETED' };
  }

  if (!artifact) {
    return {
      state,
      applied: false,
      transition: 'none',
      reason: 'No review artifact found — COMPLETED remains blocked awaiting external review',
    };
  }

  const validation = validateReviewArtifact(artifact);
  if (!validation.valid) {
    return {
      state,
      applied: false,
      transition: 'none',
      reason: `Review artifact invalid: ${validation.errors.join('; ')}`,
    };
  }

  if (!isTrustedReviewer(artifact.reviewer)) {
    return {
      state,
      applied: false,
      transition: 'none',
      reason: `Reviewer "${artifact.reviewer}" is not a trusted reviewer — approval rejected`,
    };
  }

  if (artifact.missionId !== state.lastCompletedMission) {
    return {
      state,
      applied: false,
      transition: 'none',
      reason: `Review artifact missionId "${artifact.missionId}" does not match last completed mission "${state.lastCompletedMission}"`,
    };
  }

  // Valid + trusted review for the correct mission
  if (artifact.verdict === 'approved') {
    // COMPLETED → REVIEWED (durable) → ARCHIVED/IDLE
    const reviewed: State = {
      ...state,
      status: 'REVIEWED',
      lastHealthCheck: new Date().toISOString(),
    };
    const archived: State = {
      ...reviewed,
      status: 'IDLE',
      currentMission: null,
      lastHealthCheck: new Date().toISOString(),
    };
    return {
      state: archived,
      applied: true,
      transition: 'COMPLETED → REVIEWED → ARCHIVED/IDLE',
      reason: `Approved by trusted reviewer "${artifact.reviewer}"`,
    };
  }

  // Rejected — mission is not approved; return to IDLE with the rejection
  // recorded durably (mission file is marked failed by the caller).
  const rejected: State = {
    ...state,
    status: 'IDLE',
    currentMission: null,
    totalMissionsFailed: state.totalMissionsFailed + 1,
    lastHealthCheck: new Date().toISOString(),
  };
  return {
    state: rejected,
    applied: true,
    transition: 'COMPLETED → REVIEWED (rejected) → IDLE',
    reason: `Rejected by trusted reviewer "${artifact.reviewer}"`,
  };
}
