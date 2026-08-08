/**
 * Review Authority — External review gate for completed missions
 *
 * v3.2 — Ed25519 asymmetric review signatures (no shared secret)
 *
 * Rules:
 * - The executor/orchestrator NEVER self-approves a completed mission.
 * - A COMPLETED mission may transition only after a durable review artifact
 *   exists under docs/growth/agent-loop/reviews/ with at least: missionId,
 *   reviewer identity, reviewed report SHA/path, reviewed implementation SHA,
 *   verdict (approved|rejected), findings, reviewedAt, nonce,
 *   signatureAlgorithm = 'ed25519', keyId, signature.
 * - The artifact must carry a valid Ed25519 signature computed over the
 *   canonical artifact payload with the REVIEW PRIVATE KEY. The private key
 *   is held ONLY by the external review-ingestion authority — never by the
 *   orchestrator, the executor subprocess, or the Agent user.
 * - The orchestrator verifies with the REVIEW PUBLIC KEY only:
 *   - artifact.keyId matches the trusted public key fingerprint
 *   - Ed25519 signature verifies against the trusted public key
 *   - artifact.missionId === state.lastCompletedMission
 *   - artifact.implementationSha === mission.implementationSha
 *   - artifact.reportPath === mission.reportPath
 *   - artifact.reportSha === real git blob digest of the report file
 *   - verdict is valid
 *   - nonce is not already consumed (replay prevention)
 * - state.status stays COMPLETED until the review artifact is present and
 *   validated. REVIEWED is never skipped in durable history.
 */

import {
  createHash,
  generateKeyPairSync,
  sign,
  verify,
  createPrivateKey,
  createPublicKey,
} from 'crypto';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';
import type { ReviewArtifact, State, Mission } from './types.js';

const REVIEWS_DIR = 'docs/growth/agent-loop/reviews';

// ---------------------------------------------------------------------------
// Ed25519 key management — v3.2
// ---------------------------------------------------------------------------

export interface ReviewKeyPair {
  /** PKCS#8 DER hex — held ONLY by the review-ingestion authority */
  privateKey: string;
  /** SPKI DER hex — public, safe for the orchestrator */
  publicKey: string;
}

/**
 * Generate a fresh Ed25519 review key pair. The private key must be stored
 * OUTSIDE the execution plane (never in the Agent .env, git repo, or any
 * process the Agent user can read). The public key is not secret.
 */
export function generateReviewKeyPair(): ReviewKeyPair {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  return {
    privateKey: privateKey.export({ format: 'der', type: 'pkcs8' }).toString('hex'),
    publicKey: publicKey.export({ format: 'der', type: 'spki' }).toString('hex'),
  };
}

/**
 * Fingerprint of a public key (SPKI DER hex) — the artifact keyId. The
 * orchestrator trusts a keyId only when it matches the configured
 * REVIEW_PUBLIC_KEY fingerprint.
 */
export function keyIdFromPublicKey(publicKeyHex: string): string {
  return createHash('sha256').update(publicKeyHex).digest('hex').slice(0, 16);
}

/** True when the artifact keyId matches the trusted public key fingerprint. */
export function isTrustedKeyId(artifactKeyId: string, trustedPublicKey: string): boolean {
  if (!trustedPublicKey) return false;
  return artifactKeyId === keyIdFromPublicKey(trustedPublicKey);
}

/**
 * Derive the SPKI DER hex public key from a PKCS#8 DER hex private key.
 * Used by the signer to compute the artifact keyId without exposing the
 * private key material.
 */
export function publicKeyFromPrivateKey(privateKeyHex: string): string {
  const privateKey = createPrivateKey({
    key: Buffer.from(privateKeyHex, 'hex'),
    format: 'der',
    type: 'pkcs8',
  });
  return createPublicKey(privateKey).export({ format: 'der', type: 'spki' }).toString('hex');
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
    'signatureAlgorithm',
    'keyId',
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

  if (a['signatureAlgorithm'] !== undefined && a['signatureAlgorithm'] !== 'ed25519') {
    errors.push(`Invalid signatureAlgorithm: "${a['signatureAlgorithm']}". Must be "ed25519"`);
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
// Ed25519 signature — v3.2
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

/**
 * Sign the canonical payload with the Ed25519 PRIVATE KEY (hex, PKCS#8 DER).
 * Returns a hex signature. The private key must never be printed or persisted
 * by this module.
 */
export function signReviewArtifact(artifact: ReviewArtifact, privateKeyHex: string): string {
  const privateKey = createPrivateKeyFromHex(privateKeyHex);
  return sign(null, Buffer.from(canonicalReviewPayload(artifact), 'utf-8'), privateKey).toString(
    'hex',
  );
}

/**
 * Verify an Ed25519 signature against the PUBLIC KEY (hex, SPKI DER).
 * The verifier needs only the public key — never the private key.
 */
export function verifyReviewSignature(artifact: ReviewArtifact, publicKeyHex: string): boolean {
  if (!artifact.signature || !publicKeyHex) return false;
  try {
    const publicKey = createPublicKeyFromHex(publicKeyHex);
    return verify(
      null,
      Buffer.from(canonicalReviewPayload(artifact), 'utf-8'),
      publicKey,
      Buffer.from(artifact.signature, 'hex'),
    );
  } catch {
    return false;
  }
}

function createPrivateKeyFromHex(privateKeyHex: string) {
  return createPrivateKey({ key: Buffer.from(privateKeyHex, 'hex'), format: 'der', type: 'pkcs8' });
}

function createPublicKeyFromHex(publicKeyHex: string) {
  return createPublicKey({ key: Buffer.from(publicKeyHex, 'hex'), format: 'der', type: 'spki' });
}

// ---------------------------------------------------------------------------
// Binding verification — v3.2
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
 * keyId trust, Ed25519 signature, missionId, implementationSha, reportPath,
 * reportSha (git blob digest), verdict, and nonce replay.
 */
export function verifyReviewBinding(
  artifact: ReviewArtifact,
  state: State,
  mission: Mission | null,
  projectRoot: string,
  publicKeyHex: string,
): ReviewBindingResult {
  const errors: string[] = [];

  // Trust anchor: keyId must match the trusted public key fingerprint
  if (!isTrustedKeyId(artifact.keyId, publicKeyHex)) {
    errors.push(
      `Review artifact keyId "${artifact.keyId}" is not trusted — signature from an untrusted key`,
    );
  }

  // Ed25519 signature must verify against the trusted public key
  if (!verifyReviewSignature(artifact, publicKeyHex)) {
    errors.push('Review artifact signature is invalid or missing — forged or tampered artifact');
  }

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
  context: { mission: Mission | null; projectRoot: string; publicKey: string },
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

  const binding = verifyReviewBinding(
    artifact,
    state,
    context.mission,
    context.projectRoot,
    context.publicKey,
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
