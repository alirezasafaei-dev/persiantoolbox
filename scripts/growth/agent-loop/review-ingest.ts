#!/usr/bin/env npx tsx
/**
 * Review Ingestion — Dedicated review-ingestion service (v3.1)
 *
 * This is the ONLY process that creates signed review artifacts. Its
 * environment contains REVIEW_SECRET (e.g. via systemd EnvironmentFile or
 * a shell export). The executor/orchestrator subprocess environment NEVER
 * receives REVIEW_SECRET (executor.ts strips it), so the agent cannot forge
 * an approval.
 *
 * Usage:
 *   REVIEW_SECRET=<secret> npx tsx scripts/growth/agent-loop/review-ingest.ts \
 *     --mission mission-xxx \
 *     --verdict approved|rejected \
 *     --reviewer external-chatgpt-review \
 *     --report docs/growth/agent-loop/reports/mission-xxx.json \
 *     --implementation <sha> \
 *     --findings "finding one; finding two"
 *
 * The artifact is written to docs/growth/agent-loop/reviews/<mission>.json
 * with a fresh nonce and an HMAC-SHA256 signature over the canonical payload.
 * REVIEW_SECRET is never printed or logged.
 */

import { randomUUID } from 'crypto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { signReviewArtifact } from './review.js';
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

function main(): void {
  const secret = process.env['REVIEW_SECRET'];
  if (!secret) {
    console.error('[REVIEW-INGEST] REVIEW_SECRET is not set in this process environment.');
    console.error('[REVIEW-INGEST] Refusing to create an unsigned review artifact.');
    process.exit(1);
  }

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
    signature: '',
  };
  artifact.signature = signReviewArtifact(artifact, secret);

  const reviewsDir = join(PROJECT_ROOT, REVIEWS_DIR);
  if (!existsSync(reviewsDir)) {
    mkdirSync(reviewsDir, { recursive: true });
  }
  const outPath = join(reviewsDir, `${missionId}.json`);
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));

  console.log(`[REVIEW-INGEST] Signed review artifact written to ${outPath}`);
  console.log(`[REVIEW-INGEST] Verdict: ${verdict} | Reviewer: ${reviewer}`);
  console.log(
    `[REVIEW-INGEST] reportSha: ${reportSha.slice(0, 12)}... | nonce: ${artifact.nonce.slice(0, 8)}...`,
  );
  console.log('[REVIEW-INGEST] REVIEW_SECRET was never printed or persisted.');
}

main();
