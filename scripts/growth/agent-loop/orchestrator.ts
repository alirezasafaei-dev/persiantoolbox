/**
 * Orchestrator — Main execution loop for the Agent Control Plane
 *
 * v2.0 — Fixed state machine, full verification, no fake missions
 *
 * Lifecycle:
 *   IDLE → RUNNING → VERIFYING → COMPLETED → REVIEWED
 *                                   ↓
 *                               FAILED/IDLE (retry)
 *
 * State on success: COMPLETED (NOT IDLE) — waiting for external review
 * State on failure: IDLE (allows retry with next mission)
 * State on review: REVIEWED — external reviewer approved
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { loadState, saveState } from './state-store.js';
import { discoverMissions } from './mission-loader.js';
import { claimMission, isLeaseExpired, releaseStaleLease, canClaim } from './lease.js';
import { executeMission, runVerification } from './executor.js';
import { generateReport, writeReport } from './report.js';
import {
  persistMissionClaim,
  persistMissionCompletion,
  persistMissionFailure,
  getCurrentSha,
} from './git-persist.js';
import type { Mission, MissionStatus, OrchestratorOptions } from './types.js';
import { DEFAULT_OPTIONS } from './types.js';

const MISSIONS_DIR = 'docs/growth/agent-loop/missions';

// ---------------------------------------------------------------------------
// Mission file updater — transitions mission status on disk
// ---------------------------------------------------------------------------

function updateMissionStatus(
  projectRoot: string,
  missionId: string,
  status: MissionStatus,
  extra: Partial<Mission> = {},
): void {
  const missionPath = join(projectRoot, MISSIONS_DIR, `${missionId}.json`);
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
    console.error(`[ORCH] Failed to update mission status: ${err}`);
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
    persistMissionFailure(projectRoot, state.currentMission, 'lease expired');
    return 'failed';
  }

  // 2. If IDLE, discover and claim
  if (canClaim(state)) {
    const missions = discoverMissions(projectRoot);
    if (missions.length === 0) {
      return 'idle';
    }

    const mission = missions[0];
    if (!mission) return 'idle';

    console.log(`[ORCH] Claiming mission: ${mission.id} — ${mission.title}`);

    const baseSha = getCurrentSha(projectRoot);
    const claimed = claimMission(state, mission, workerId, baseSha, options.leaseMs);
    saveState(projectRoot, claimed);

    // Update mission file to claimed
    updateMissionStatus(projectRoot, mission.id, 'claimed', {
      claimedBy: workerId,
      claimedAt: new Date().toISOString(),
      baseSha,
    });

    persistMissionClaim(projectRoot, mission.id, baseSha);

    return runOnce(projectRoot, options); // Continue with execution
  }

  // 3. If RUNNING, execute
  if (state.status === 'RUNNING' && state.currentMission) {
    // Load mission from filesystem — FAIL if not found (no fake missions)
    const missionPath = join(projectRoot, MISSIONS_DIR, `${state.currentMission}.json`);
    let missionToExecute: Mission;

    try {
      const raw = readFileSync(missionPath, 'utf-8');
      missionToExecute = JSON.parse(raw) as Mission;
    } catch {
      console.error(`[ORCH] Mission file not found: ${missionPath}`);
      console.error(`[ORCH] Cannot execute without mission file. Failing.`);

      updateMissionStatus(projectRoot, state.currentMission, 'failed', {
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
    updateMissionStatus(projectRoot, missionToExecute.id, 'running');

    // Execute with real executor
    const result = executeMission(projectRoot, missionToExecute);

    if (result.success) {
      // 4. VERIFY — full suite: typecheck + lint + vitest + build
      console.log(`[ORCH] Execution complete. Running full verification...`);
      const verification = runVerification(projectRoot);

      const allPassed =
        verification.typecheck && verification.lint && verification.vitest && verification.build;

      if (allPassed) {
        // 5. COMPLETED — state goes to COMPLETED (waiting for REVIEW)
        console.log(`[ORCH] All verification passed. Generating report...`);

        const report = generateReport(
          missionToExecute,
          result,
          [
            { command: 'pnpm typecheck', status: 'passed' },
            { command: 'pnpm lint', status: 'passed' },
            { command: 'pnpm vitest --run', status: 'passed' },
            { command: 'pnpm build', status: 'passed' },
          ],
          'Mission executed successfully. Full verification passed.',
        );

        const { jsonPath, mdPath } = writeReport(projectRoot, report);
        missionToExecute.implementationSha = result.headSha;
        missionToExecute.reportPath = jsonPath;

        // State goes to COMPLETED, NOT IDLE
        const completed = {
          ...state,
          status: 'COMPLETED' as const,
          currentMission: null,
          lastCompletedMission: missionToExecute.id,
          lastCompletedAt: new Date().toISOString(),
          totalMissionsCompleted: state.totalMissionsCompleted + 1,
        };
        saveState(projectRoot, completed);

        // Update mission file to completed
        updateMissionStatus(projectRoot, missionToExecute.id, 'completed', {
          implementationSha: result.headSha,
          reportPath: jsonPath,
        });

        persistMissionCompletion(projectRoot, missionToExecute.id, [jsonPath, mdPath]);

        console.log(`[ORCH] Mission ${missionToExecute.id} COMPLETED — awaiting external review`);
        return 'completed';
      } else {
        // Verification failed
        const failedChecks = [
          !verification.typecheck && 'typecheck',
          !verification.lint && 'lint',
          !verification.vitest && 'vitest',
          !verification.build && 'build',
        ]
          .filter(Boolean)
          .join(', ');

        console.error(`[ORCH] Verification failed: ${failedChecks}`);

        if (missionToExecute.attempts < missionToExecute.maxAttempts) {
          missionToExecute.attempts += 1;
          updateMissionStatus(projectRoot, missionToExecute.id, 'running', {
            attempts: missionToExecute.attempts,
            lastError: `Verification failed: ${failedChecks}`,
          });

          const retrying = {
            ...state,
            status: 'RUNNING' as const,
          };
          saveState(projectRoot, retrying);
          console.log(
            `[ORCH] Retrying (attempt ${missionToExecute.attempts}/${missionToExecute.maxAttempts})`,
          );
          return 'failed';
        }

        // Max retries exceeded
        const report = generateReport(
          missionToExecute,
          { ...result, success: false },
          [
            {
              command: 'pnpm typecheck',
              status: verification.typecheck ? 'passed' : 'failed',
            },
            { command: 'pnpm lint', status: verification.lint ? 'passed' : 'failed' },
            { command: 'pnpm vitest --run', status: verification.vitest ? 'passed' : 'failed' },
            { command: 'pnpm build', status: verification.build ? 'passed' : 'failed' },
          ],
          `Verification failed after max retries: ${failedChecks}`,
        );

        writeReport(projectRoot, report);

        updateMissionStatus(projectRoot, missionToExecute.id, 'failed', {
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
        updateMissionStatus(projectRoot, missionToExecute.id, 'running', {
          attempts: missionToExecute.attempts,
          lastError: result.output.slice(0, 500),
        });

        const retrying = {
          ...state,
          status: 'RUNNING' as const,
        };
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

      updateMissionStatus(projectRoot, missionToExecute.id, 'failed', {
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
// Polling loop
// ---------------------------------------------------------------------------

export function runPolling(
  projectRoot: string,
  options: OrchestratorOptions = DEFAULT_OPTIONS,
): void {
  console.log(`[ORCH] Starting polling every ${options.pollIntervalMs}ms`);
  console.log(`[ORCH] Worker ID: ${loadState(projectRoot).workerId}`);

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
