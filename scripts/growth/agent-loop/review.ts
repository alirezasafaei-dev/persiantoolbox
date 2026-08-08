/**
 * Review Authority — External review gate for completed missions
 *
 * v3.1 — HMAC-signed review artifacts (non-spoofable)
 *
 * Rules:
 * - The executor/orchestrator NEVER self-approves a completed mission.
 * - A COMPLETED mission may transition only after a durable review artifact
 *   exists under docs/growth/agent-loop/reviews/ with at least: missionId,
 *   reviewer identity, reviewed report SHA/path, reviewed implementation SHA,
 *   verdict (approved|rejected), findings, reviewedAt, nonce, signature.
 * - The artifact must carry a valid HMAC-SHA256 signature computed over the
 *   canonical artifact payload with REVIEW_SECRET. REVIEW_SECRET is available
 *   only to the review-ingestion process/service, never to the executor
 *   subprocess environment (executor.ts strips it before spawning opencode).
 * - Before accepting an approval the orchestrator verifies:
 *   - artifact.missionId === state.lastCompletedMission
 *   - artifact.implementationSha === mission.implementationSha
 *   - artifact.reportPath === mission.reportPath
 *   - artifact.reportSha === real git blob digest of the report file
 *   - verdict is valid
 *   - signature verifies (timing-safe)
 *   - nonce is not already consumed (replay prevention)
 * - state.status stays COMPLETED until the review artifact is present and
 *   validated. REVIEWED is never skipped in durable history.
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';
import type { ReviewArtifact, State, Mission } from './types.js';

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
    'nonce',
    'signature',
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
// HMAC signature — v3.1
// ---------------------------------------------------------------------------

/**
 * Canonical payload for signing: all artifact fields EXCEPT signature,
 * serialized deterministically (sorted keys, no whitespace). Both the
 * signer (review-ingestion) and the verifier (orchestrator) must produce
 * the identical string.
 */
export function canonicalReviewPayload(artifact: ReviewArtifact): string {
  const { signature: _signature, ...rest } = artifact;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(rest).sort()) {
    sorted[key] = (rest as Record<string, unknown>)[key];
  }
  return JSON.stringify(sorted);
}

/** Compute HMAC-SHA256 signature over the canonical payload. */
export function signReviewArtifact(artifact: ReviewArtifact, secret: string): string {
  return createHmac('sha256', secret).update(canonicalReviewPayload(artifact)).digest('hex');
}

/** Timing-safe signature verification. Never prints the secret. */
export function verifyReviewSignature(artifact: ReviewArtifact, secret: string): boolean {
  if (!artifact.signature || !secret) return false;
  const expected = Buffer.from(signReviewArtifact(artifact, secret), 'utf-8');
  const actual = Buffer.from(artifact.signature, 'utf-8');
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

// ---------------------------------------------------------------------------
// Binding verification — v3.1
// ---------------------------------------------------------------------------

/** Real git blob digest of a committed file (git rev-parse HEAD:<path>). */
export function getReportBlobSha(projectRoot: string, reportPath: string): string | null {
  try {
    return execFileSync('git', ['rev-parse', `HEAD:${reportPath}`], {
      cwd: projectRoot,
      encoding: 'utf-8',
      timeout: 10_000,
    }).trim();
  } catch {
    return null;
  }
}

export interface ReviewBindingResult {
  valid: boolean;
  errors: string[];
}

/**
 * Verify the artifact binds to the canonical mission and the real git state:
 * missionId, implementationSha, reportPath, reportSha (git blob digest),
 * verdict, signature, and nonce replay.
 */
export function verifyReviewBinding(
  artifact: ReviewArtifact,
  state: State,
  mission: Mission | null,
  projectRoot: string,
  secret: string,
): ReviewBindingResult {
  const errors: string[] = [];

  if (artifact.missionId !== state.lastCompletedMission) {
    errors.push(
      `Review artifact missionId "${artifact.missionId}" does not match last completed mission "${state.lastCompletedMission}"`,
    );
  }

  if (!mission) {
    errors.push(`Mission file not found for "${artifact.missionId}" — cannot verify binding`);
  } else {
    if (artifact.implementationSha !== mission.implementationSha) {
      errors.push(
        `implementationSha "${artifact.implementationSha}" does not match mission implementationSha "${mission.implementationSha}"`,
      );
    }
    if (artifact.reportPath !== mission.reportPath) {
      errors.push(
        `reportPath "${artifact.reportPath}" does not match mission reportPath "${mission.reportPath}"`,
      );
    }
  }

  // reportSha must equal the real git blob digest of the report file
  const blobSha = getReportBlobSha(projectRoot, artifact.reportPath);
  if (!blobSha) {
    errors.push(`Report file "${artifact.reportPath}" not found in git HEAD`);
  } else if (blobSha !== artifact.reportSha) {
    errors.push(
      `reportSha "${artifact.reportSha}" does not match git blob digest "${blobSha}" of "${artifact.reportPath}"`,
    );
  }

  if (!verifyReviewSignature(artifact, secret)) {
    errors.push('Review artifact signature is invalid or missing — forged or tampered artifact');
  }

  if (state.consumedReviewNonces.includes(artifact.nonce)) {
    errors.push(`Review artifact nonce "${artifact.nonce}" already consumed — replay rejected`);
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
  /** Durable REVIEWED state — persisted as its own commit before IDLE. */
  reviewedState: State;
  /** Final state after the full transition (IDLE). */
  state: State;
}

/**
 * Attempt to apply a review artifact to a COMPLETED state.
 * Returns the durable REVIEWED state plus the final state (IDLE on
 * approved/rejected) or the unchanged COMPLETED state when the artifact is
 * missing/invalid/untrusted/forged — the mission stays blocked awaiting a
 * valid external review.
 */
export function applyReviewTransition(
  state: State,
  artifact: ReviewArtifact | null,
  context: { mission: Mission | null; projectRoot: string; secret: string },
): ReviewTransitionResult {
  const unchanged: ReviewTransitionResult = {
    state,
    reviewedState: state,
    applied: false,
    transition: 'none',
    reason: '',
  };

  if (state.status !== 'COMPLETED') {
    return { ...unchanged, reason: 'State is not COMPLETED' };
  }

  if (!artifact) {
    return {
      ...unchanged,
      reason: 'No review artifact found — COMPLETED remains blocked awaiting external review',
    };
  }

  const validation = validateReviewArtifact(artifact);
  if (!validation.valid) {
    return {
      ...unchanged,
      reason: `Review artifact invalid: ${validation.errors.join('; ')}`,
    };
  }

  if (!isTrustedReviewer(artifact.reviewer)) {
    return {
      ...unchanged,
      reason: `Reviewer "${artifact.reviewer}" is not a trusted reviewer — approval rejected`,
    };
  }

  const binding = verifyReviewBinding(
    artifact,
    state,
    context.mission,
    context.projectRoot,
    context.secret,
  );
  if (!binding.valid) {
    return {
      ...unchanged,
      reason: `Review artifact binding failed: ${binding.errors.join('; ')}`,
    };
  }

  // Valid + trusted + signed + bound review for the correct mission
  const reviewed: State = {
    ...state,
    status: 'REVIEWED',
    consumedReviewNonces: [...state.consumedReviewNonces, artifact.nonce],
    lastHealthCheck: new Date().toISOString(),
  };

  if (artifact.verdict === 'approved') {
    const archived: State = {
      ...reviewed,
      status: 'IDLE',
      currentMission: null,
      lastHealthCheck: new Date().toISOString(),
    };
    return {
      state: archived,
      reviewedState: reviewed,
      applied: true,
      transition: 'COMPLETED → REVIEWED → ARCHIVED/IDLE',
      reason: `Approved by trusted reviewer "${artifact.reviewer}"`,
    };
  }

  // Rejected — mission is not approved; return to IDLE with the rejection
  // recorded durably (mission file is marked failed by the caller).
  const rejected: State = {
    ...reviewed,
    status: 'IDLE',
    currentMission: null,
    totalMissionsFailed: state.totalMissionsFailed + 1,
    lastHealthCheck: new Date().toISOString(),
  };
  return {
    state: rejected,
    reviewedState: reviewed,
    applied: true,
    transition: 'COMPLETED → REVIEWED (rejected) → IDLE',
    reason: `Rejected by trusted reviewer "${artifact.reviewer}"`,
  };
}
