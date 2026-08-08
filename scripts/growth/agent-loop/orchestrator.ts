/**
 * Orchestrator — Main execution loop for the Agent Control Plane
 *
 * v3.0 — Notion sync integrated into every idle cycle:
 * - Sync Notion Pending missions before GitHub discovery
 * - Health evidence persisted to disk
 * - Never self-approve (COMPLETED → REVIEWED only via external artifact)
 * - No fake missions, accurate report provenance
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { loadState, saveState } from './state-store.js';
import { discoverMissions } from './mission-loader.js';
import {
  claimMission,
  isLeaseExpired,
  releaseStaleLease,
  canClaim,
  isMissionAlreadyCompleted,
} from './lease.js';
import { executeMission, runVerification, enforceFileScope } from './executor.js';
import { generateReport, writeReport } from './report.js';
import {
  persistMissionClaim,
  persistMissionCompletion,
  persistMissionFailure,
  persistReviewReviewed,
  persistReviewArchived,
  getCurrentSha,
} from './git-persist.js';
import { syncNotionToGitHub } from './notion-transport.js';
import { loadReviewArtifact, applyReviewTransition } from './review.js';
import type { Mission, MissionStatus, OrchestratorOptions } from './types.js';
import { DEFAULT_OPTIONS } from './types.js';

const MISSIONS_DIR = 'docs/growth/agent-loop/missions';

// ---------------------------------------------------------------------------
// Review public key — v3.2 (asymmetric verification, no shared secret)
// ---------------------------------------------------------------------------

/**
 * Load the trusted REVIEW PUBLIC KEY (SPKI DER hex) from the environment.
 * The orchestrator verifies review signatures with this key ONLY — it never
 * possesses the private key. Sources, in order:
 *   1. REVIEW_PUBLIC_KEY env var (hex)
 *   2. REVIEW_PUBLIC_KEY_FILE env var (path to a file containing the hex key)
 * Returns '' when unset — review verification then fails closed (no artifact
 * can be accepted without a trusted public key).
 */
export function loadReviewPublicKey(): string {
  const fromEnv = process.env['REVIEW_PUBLIC_KEY'];
  if (fromEnv) return fromEnv.trim();

  const keyFile = process.env['REVIEW_PUBLIC_KEY_FILE'];
  if (keyFile) {
    try {
      return readFileSync(keyFile, 'utf-8').trim();
    } catch (err) {
      console.error(`[ORCH] Failed to read REVIEW_PUBLIC_KEY_FILE "${keyFile}": ${err}`);
      return '';
    }
  }

  return '';
}

// ---------------------------------------------------------------------------
// Mission file updater — transitions mission status on disk
// ---------------------------------------------------------------------------

function updateMissionFile(
  projectRoot: string,
  missionId: string,
  status: MissionStatus,
  extra: Record<string, unknown> = {},
): void {
  const missionPath = join(projectRoot, MISSIONS_DIR, `${missionId}.json`);
  if (!existsSync(missionPath)) return;

  try {
    const raw = readFileSync(missionPath, 'utf-8');
    const mission = JSON.parse(raw) as Record<string, unknown>;
    mission['status'] = status;
    mission['updatedAt'] = new Date().toISOString();
    for (const [key, value] of Object.entries(extra)) {
      mission[key] = value;
    }
    writeFileSync(missionPath, JSON.stringify(mission, null, 2));
  } catch (err) {
    console.error(`[ORCH] Failed to update mission file: ${err}`);
  }
}

// ---------------------------------------------------------------------------
// Load mission from disk
// ---------------------------------------------------------------------------

function loadMissionFile(projectRoot: string, missionId: string): Mission | null {
  const missionPath = join(projectRoot, MISSIONS_DIR, `${missionId}.json`);
  if (!existsSync(missionPath)) return null;

  try {
    const raw = readFileSync(missionPath, 'utf-8');
    return JSON.parse(raw) as Mission;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Single cycle
// ---------------------------------------------------------------------------

export async function runOnce(
  projectRoot: string,
  options: OrchestratorOptions = DEFAULT_OPTIONS,
): Promise<'completed' | 'failed' | 'idle'> {
  const state = loadState(projectRoot);
  const workerId = state.workerId;

  // 1. Check lease expiry
  if (state.currentMission && isLeaseExpired(state, options.leaseMs)) {
    console.log(`[ORCH] Lease expired for ${state.currentMission} — releasing`);
    const released = releaseStaleLease(state);
    saveState(projectRoot, released);

    // Update mission file
    updateMissionFile(projectRoot, state.currentMission, 'pending', {
      claimedBy: null,
      claimedAt: null,
      leaseUntil: null,
      lastHeartbeat: null,
      lastError: 'lease expired',
    });

    persistMissionFailure(projectRoot, state.currentMission, 'lease expired');
    return 'failed';
  }

  // 1b. If COMPLETED: check for a durable external review artifact.
  // The executor NEVER self-approves. state.status stays COMPLETED until a
  // valid review artifact from a trusted reviewer is present, with a valid
  // Ed25519 signature (REVIEW_PUBLIC_KEY) binding to the canonical mission.
  // The orchestrator needs ONLY the public key — never the private key.
  if (state.status === 'COMPLETED' && state.lastCompletedMission) {
    const artifact = loadReviewArtifact(projectRoot, state.lastCompletedMission);
    const mission = loadMissionFile(projectRoot, state.lastCompletedMission);
    const publicKey = loadReviewPublicKey();
    const reviewResult = applyReviewTransition(state, artifact, {
      mission,
      projectRoot,
      publicKey,
    });

    if (reviewResult.applied) {
      console.log(`[ORCH] Review applied: ${reviewResult.transition} — ${reviewResult.reason}`);
      const artifactForPersist = {
        reviewer: artifact?.reviewer || '',
        verdict: artifact?.verdict || 'rejected',
      };

      // Step 1 (durable): persist REVIEWED state as its own commit+push.
      saveState(projectRoot, reviewResult.reviewedState);
      persistReviewReviewed(projectRoot, state.lastCompletedMission, artifactForPersist);

      // Step 2 (durable): mission file transition + final IDLE state, then
      // commit+push as a SEPARATE commit. REVIEWED is never skipped.
      if (artifact && artifact.verdict === 'approved') {
        updateMissionFile(projectRoot, state.lastCompletedMission, 'archived', {
          reviewedBy: artifact.reviewer,
          reviewedAt: artifact.reviewedAt,
          reviewPath: artifact.reportPath,
          reviewNonce: artifact.nonce,
        });
      } else if (artifact && artifact.verdict === 'rejected') {
        updateMissionFile(projectRoot, state.lastCompletedMission, 'failed', {
          lastError: `Review rejected by ${artifact.reviewer}: ${artifact.findings.join('; ')}`,
          reviewedBy: artifact.reviewer,
          reviewedAt: artifact.reviewedAt,
          reviewNonce: artifact.nonce,
        });
      }

      saveState(projectRoot, reviewResult.state);
      persistReviewArchived(projectRoot, state.lastCompletedMission, artifactForPersist);
      return 'idle';
    }

    // No valid review yet — stay COMPLETED (blocked), do not claim new missions
    if (artifact) {
      console.log(`[ORCH] Review not applied: ${reviewResult.reason}`);
    }
    return 'idle';
  }

  // 2. If IDLE: sync Notion first, then discover and claim
  if (canClaim(state)) {
    // 2a. Sync Notion Pending missions (cheap — no verification)
    try {
      const notionResult = syncNotionToGitHub(projectRoot);
      if (notionResult.synced > 0) {
        console.log(`[ORCH] Notion synced ${notionResult.synced} mission(s)`);
      }
      if (notionResult.errors.length > 0) {
        console.error(`[ORCH] Notion errors: ${notionResult.errors.join('; ')}`);
      }
    } catch (err) {
      console.error(`[ORCH] Notion sync failed: ${err}`);
    }

    // 2b. Discover missions from GitHub (canonical source)
    const missions = discoverMissions(projectRoot);
    if (missions.length === 0) {
      return 'idle';
    }

    const mission = missions[0];
    if (!mission) return 'idle';

    // Double-check: never re-execute completed missions
    if (isMissionAlreadyCompleted(mission)) {
      console.log(`[ORCH] Mission ${mission.id} already completed — skipping`);
      return 'idle';
    }

    console.log(`[ORCH] Claiming mission: ${mission.id} — ${mission.title}`);

    const baseSha = getCurrentSha(projectRoot);
    const claimed = claimMission(state, mission, workerId, baseSha, options.leaseMs);
    saveState(projectRoot, claimed);

    // Durable mission file update
    const now = new Date().toISOString();
    const leaseUntil = new Date(Date.now() + options.leaseMs).toISOString();
    updateMissionFile(projectRoot, mission.id, 'claimed', {
      claimedBy: workerId,
      claimedAt: now,
      leaseUntil,
      lastHeartbeat: now,
      baseSha,
      attempts: mission.attempts + 1,
    });

    persistMissionClaim(projectRoot, mission.id, baseSha);

    return runOnce(projectRoot, options); // Continue with execution
  }

  // 3. If RUNNING, execute
  if (state.status === 'RUNNING' && state.currentMission) {
    // Load mission from filesystem — FAIL if not found (no fake missions)
    const missionToExecute = loadMissionFile(projectRoot, state.currentMission);

    if (!missionToExecute) {
      console.error(`[ORCH] Mission file not found: ${state.currentMission}`);
      console.error(`[ORCH] Cannot execute without mission file. Failing.`);

      updateMissionFile(projectRoot, state.currentMission, 'failed', {
        lastError: 'Mission file not found after claim',
      });

      const failed = {
        ...state,
        status: 'IDLE' as const,
        currentMission: null,
        totalMissionsFailed: state.totalMissionsFailed + 1,
      };
      saveState(projectRoot, failed);
      persistMissionFailure(projectRoot, state.currentMission, 'mission file not found');
      return 'failed';
    }

    console.log(`[ORCH] Executing: ${missionToExecute.id}`);

    // Update mission to running
    updateMissionFile(projectRoot, missionToExecute.id, 'running');

    // Execute with real executor
    const result = executeMission(projectRoot, missionToExecute);

    if (result.success) {
      // 4. VERIFY — full suite: typecheck + lint + vitest + build
      console.log(`[ORCH] Execution complete. Running full verification...`);
      const verification = runVerification(projectRoot);

      const allPassed = verification.every((v) => v.status === 'passed');

      if (allPassed) {
        // 5. Enforce file scope
        const scopeCheck = enforceFileScope(missionToExecute, result.filesChanged);

        if (!scopeCheck.valid) {
          console.error(`[ORCH] File scope violation: ${scopeCheck.violations.join(', ')}`);

          if (missionToExecute.attempts < missionToExecute.maxAttempts) {
            missionToExecute.attempts += 1;
            updateMissionFile(projectRoot, missionToExecute.id, 'running', {
              attempts: missionToExecute.attempts,
              lastError: `File scope violation: ${scopeCheck.violations.join(', ')}`,
            });

            const retrying = { ...state, status: 'RUNNING' as const };
            saveState(projectRoot, retrying);
            return 'failed';
          }

          // Max retries
          const report = generateReport(
            missionToExecute,
            { ...result, success: false },
            [],
            `File scope violation: ${scopeCheck.violations.join(', ')}`,
          );

          writeReport(projectRoot, report);
          updateMissionFile(projectRoot, missionToExecute.id, 'failed', {
            lastError: `File scope violation: ${scopeCheck.violations.join(', ')}`,
          });

          const failed = {
            ...state,
            status: 'IDLE' as const,
            currentMission: null,
            totalMissionsFailed: state.totalMissionsFailed + 1,
          };
          saveState(projectRoot, failed);
          persistMissionFailure(
            projectRoot,
            missionToExecute.id,
            `file scope violation: ${scopeCheck.violations.join(', ')}`,
          );
          return 'failed';
        }

        // 6. COMPLETED — state goes to COMPLETED (waiting for EXTERNAL review)
        // NEVER self-approve. NEVER transition to IDLE. NEVER skip REVIEWED.
        console.log(`[ORCH] All verification passed. Generating report...`);

        const report = generateReport(
          missionToExecute,
          result,
          verification,
          'Mission executed successfully. Full verification passed. File scope enforced.',
        );

        const { jsonPath, mdPath } = writeReport(projectRoot, report);

        // State goes to COMPLETED, NOT IDLE
        // Only external review artifact can transition to REVIEWED
        const completed = {
          ...state,
          status: 'COMPLETED' as const,
          currentMission: null,
          lastCompletedMission: missionToExecute.id,
          lastCompletedAt: new Date().toISOString(),
          totalMissionsCompleted: state.totalMissionsCompleted + 1,
        };
        saveState(projectRoot, completed);

        // Durable mission file update
        updateMissionFile(projectRoot, missionToExecute.id, 'completed', {
          implementationSha: result.headSha,
          reportPath: jsonPath,
        });

        persistMissionCompletion(projectRoot, missionToExecute.id, [jsonPath, mdPath]);

        console.log(`[ORCH] Mission ${missionToExecute.id} COMPLETED — awaiting external review`);
        return 'completed';
      } else {
        // Verification failed
        const failedChecks = verification
          .filter((v) => v.status !== 'passed')
          .map((v) => v.command)
          .join(', ');

        console.error(`[ORCH] Verification failed: ${failedChecks}`);

        if (missionToExecute.attempts < missionToExecute.maxAttempts) {
          missionToExecute.attempts += 1;
          updateMissionFile(projectRoot, missionToExecute.id, 'running', {
            attempts: missionToExecute.attempts,
            lastError: `Verification failed: ${failedChecks}`,
          });

          const retrying = { ...state, status: 'RUNNING' as const };
          saveState(projectRoot, retrying);
          console.log(
            `[ORCH] Retrying (attempt ${missionToExecute.attempts}/${missionToExecute.maxAttempts})`,
          );
          return 'failed';
        }

        // Max retries exceeded — truthful exit codes from the real runs
        const report = generateReport(
          missionToExecute,
          { ...result, success: false },
          verification,
          `Verification failed after max retries: ${failedChecks}`,
        );

        writeReport(projectRoot, report);

        updateMissionFile(projectRoot, missionToExecute.id, 'failed', {
          lastError: `Verification failed: ${failedChecks}`,
        });

        const failed = {
          ...state,
          status: 'IDLE' as const,
          currentMission: null,
          totalMissionsFailed: state.totalMissionsFailed + 1,
        };
        saveState(projectRoot, failed);
        persistMissionFailure(
          projectRoot,
          missionToExecute.id,
          `verification failed: ${failedChecks}`,
        );
        return 'failed';
      }
    } else {
      // Execution failed
      console.error(`[ORCH] Execution failed: ${result.output.slice(0, 200)}`);

      if (missionToExecute.attempts < missionToExecute.maxAttempts) {
        missionToExecute.attempts += 1;
        updateMissionFile(projectRoot, missionToExecute.id, 'running', {
          attempts: missionToExecute.attempts,
          lastError: result.output.slice(0, 500),
        });

        const retrying = { ...state, status: 'RUNNING' as const };
        saveState(projectRoot, retrying);
        console.log(
          `[ORCH] Retrying (attempt ${missionToExecute.attempts}/${missionToExecute.maxAttempts})`,
        );
        return 'failed';
      }

      // Max retries
      const report = generateReport(
        missionToExecute,
        result,
        [],
        `Execution failed: ${result.output.slice(0, 500)}`,
      );

      writeReport(projectRoot, report);

      updateMissionFile(projectRoot, missionToExecute.id, 'failed', {
        lastError: result.output.slice(0, 500),
      });

      const failed = {
        ...state,
        status: 'IDLE' as const,
        currentMission: null,
        totalMissionsFailed: state.totalMissionsFailed + 1,
      };
      saveState(projectRoot, failed);
      persistMissionFailure(projectRoot, missionToExecute.id, 'execution failed');
      return 'failed';
    }
  }

  return 'idle';
}

// ---------------------------------------------------------------------------
// Startup recovery — release stale leases
// ---------------------------------------------------------------------------

export function recoverStaleLeases(projectRoot: string, leaseMs: number): void {
  const state = loadState(projectRoot);
  if (state.currentMission && isLeaseExpired(state, leaseMs)) {
    console.log(`[ORCH] Startup recovery: releasing stale lease for ${state.currentMission}`);
    const released = releaseStaleLease(state);
    saveState(projectRoot, released);

    updateMissionFile(projectRoot, state.currentMission, 'pending', {
      claimedBy: null,
      claimedAt: null,
      leaseUntil: null,
      lastHeartbeat: null,
      lastError: 'lease expired during startup recovery',
    });
  }
}

// ---------------------------------------------------------------------------
// Polling loop
// ---------------------------------------------------------------------------

export function runPolling(
  projectRoot: string,
  options: OrchestratorOptions = DEFAULT_OPTIONS,
): void {
  console.log(`[ORCH] Starting polling every ${options.pollIntervalMs}ms`);
  console.log(`[ORCH] Worker ID: ${loadState(projectRoot).workerId}`);

  // Recover stale leases on startup
  recoverStaleLeases(projectRoot, options.leaseMs);

  const loop = async () => {
    try {
      await runOnce(projectRoot, options);
    } catch (error) {
      console.error(`[ORCH] Cycle error:`, error);
    }
  };

  // Initial cycle
  loop();

  // Recurring
  setInterval(loop, options.pollIntervalMs);
}
