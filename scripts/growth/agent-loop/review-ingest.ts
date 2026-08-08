#!/usr/bin/env npx tsx
/**
 * Review Ingestion — Dedicated review-ingestion authority (v3.2)
 *
 * This is the ONLY process that creates signed review artifacts. Its
 * environment contains the REVIEW PRIVATE KEY (e.g. via a shell export or a
 * private key file readable only by the review authority account). The
 * orchestrator/executor NEVER possesses the private key — it verifies with
 * the public key only.
 *
 * Usage:
 *   REVIEW_PRIVATE_KEY=<pkcs8-der-hex> npx tsx scripts/growth/agent-loop/review-ingest.ts \
 *     --mission mission-xxx \
 *     --verdict approved|rejected \
 *     --reviewer external-chatgpt-review \
 *     --report docs/growth/agent-loop/reports/mission-xxx.json \
 *     --implementation <sha> \
 *     --findings "finding one; finding two"
 *
 *   # or read the private key from a 0600 file owned by the review account:
 *   REVIEW_PRIVATE_KEY_FILE=/path/to/review-key.pem npx tsx ... (same args)
 *
 * The artifact is written to docs/growth/agent-loop/reviews/<mission>.json
 * with a fresh nonce, signatureAlgorithm='ed25519', keyId (public-key
 * fingerprint), and an Ed25519 signature over the canonical payload.
 * The private key is never printed or logged.
 */

import { randomUUID } from 'crypto';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { signReviewArtifact, keyIdFromPublicKey, publicKeyFromPrivateKey } from './review.js';
import type { ReviewArtifact } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..', '..');
const REVIEWS_DIR = 'docs/growth/agent-loop/reviews';

function getReportBlobSha(reportPath: string): string {
  try {
    return execFileSync('git', ['rev-parse', `HEAD:${reportPath}`], {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 10_000,
    }).trim();
  } catch {
    return '';
  }
}

function parseArgs(): Record<string, string> {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const value = args[i + 1];
    if (key && value) out[key] = value;
  }
  return out;
}

/** Load the private key from REVIEW_PRIVATE_KEY or REVIEW_PRIVATE_KEY_FILE. */
function loadPrivateKey(): string {
  const fromEnv = process.env['REVIEW_PRIVATE_KEY'];
  if (fromEnv) {
    return fromEnv;
  }

  const keyFile = process.env['REVIEW_PRIVATE_KEY_FILE'];
  if (keyFile) {
    if (!existsSync(keyFile)) {
      console.error(`[REVIEW-INGEST] REVIEW_PRIVATE_KEY_FILE "${keyFile}" does not exist.`);
      process.exit(1);
    }
    return readFileSync(keyFile, 'utf-8').trim();
  }

  console.error('[REVIEW-INGEST] REVIEW_PRIVATE_KEY or REVIEW_PRIVATE_KEY_FILE is not set.');
  console.error('[REVIEW-INGEST] Refusing to create an unsigned review artifact.');
  process.exit(1);
}

function main(): void {
  const privateKey = loadPrivateKey();

  const args = parseArgs();
  const missionId = args['mission'];
  const verdict = args['verdict'];
  const reviewer = args['reviewer'];
  const reportPath = args['report'];
  const implementationSha = args['implementation'];
  const findings = (args['findings'] || '')
    .split(';')
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  if (!missionId || !verdict || !reviewer || !reportPath || !implementationSha) {
    console.error(
      '[REVIEW-INGEST] Missing required args: --mission --verdict --reviewer --report --implementation',
    );
    process.exit(1);
  }

  if (verdict !== 'approved' && verdict !== 'rejected') {
    console.error('[REVIEW-INGEST] --verdict must be "approved" or "rejected"');
    process.exit(1);
  }

  const reportSha = getReportBlobSha(reportPath);
  if (!reportSha) {
    console.error(`[REVIEW-INGEST] Report "${reportPath}" not found in git HEAD`);
    process.exit(1);
  }

  const artifact: ReviewArtifact = {
    missionId,
    reviewer,
    reportPath,
    reportSha,
    implementationSha,
    verdict: verdict as ReviewArtifact['verdict'],
    findings,
    reviewedAt: new Date().toISOString(),
    nonce: randomUUID(),
    signatureAlgorithm: 'ed25519',
    // keyId is the fingerprint of the public key corresponding to the private
    // key — computed BEFORE signing so the signature covers the final payload.
    keyId: keyIdFromPublicKey(publicKeyFromPrivateKey(privateKey)),
    signature: '',
  };
  artifact.signature = signReviewArtifact(artifact, privateKey);

  const reviewsDir = join(PROJECT_ROOT, REVIEWS_DIR);
  if (!existsSync(reviewsDir)) {
    mkdirSync(reviewsDir, { recursive: true });
  }
  const outPath = join(reviewsDir, `${missionId}.json`);
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));

  console.log(`[REVIEW-INGEST] Signed review artifact written to ${outPath}`);
  console.log(`[REVIEW-INGEST] Verdict: ${verdict} | Reviewer: ${reviewer}`);
  console.log(
    `[REVIEW-INGEST] reportSha: ${reportSha.slice(0, 12)}... | nonce: ${artifact.nonce.slice(0, 8)}... | keyId: ${artifact.keyId}`,
  );
  console.log('[REVIEW-INGEST] The private key was never printed or persisted.');
}

main();
