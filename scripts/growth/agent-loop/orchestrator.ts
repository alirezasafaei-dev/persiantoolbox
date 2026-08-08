/**
 * Orchestrator — Main execution loop for the Agent Control Plane
 *
 * Lifecycle: IDLE → NEW_MISSION → CLAIMED → RUNNING → VERIFYING → COMPLETED
 *
 * This is the real orchestrator that:
 * 1. Discovers pending missions from the filesystem
 * 2. Claims them with lease protection
 * 3. Invokes the real executor (opencode run)
 * 4. Verifies the result (typecheck + lint)
 * 5. Generates reports
 * 6. Persists everything to GitHub
 */

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
import type { Mission, OrchestratorOptions } from './types.js';
import { DEFAULT_OPTIONS } from './types.js';

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
    persistMissionClaim(projectRoot, mission.id, baseSha);

    return runOnce(projectRoot, options); // Continue with execution
  }

  // 3. If RUNNING, execute
  if (state.status === 'RUNNING' && state.currentMission) {
    // Load mission details
    const missions = discoverMissions(projectRoot);
    const mission = missions.find((m) => m.id === state.currentMission);

    // If mission not found in pending (already claimed), create minimal version
    const missionToExecute: Mission = mission || {
      id: state.currentMission,
      type: 'growth',
      priority: 'medium',
      title: state.currentMission,
      description: `Execute mission ${state.currentMission}`,
      acceptanceCriteria: ['Complete the mission successfully'],
      deployApproved: false,
      destructiveOperationsAllowed: false,
      status: 'running',
      claimedBy: state.workerId,
      claimedAt: state.lastHealthCheck,
      leaseUntil: null,
      lastHeartbeat: state.lastHealthCheck,
      baseSha: state.baseSha,
      implementationSha: null,
      reportPath: null,
      lastError: null,
      attempts: 1,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(`[ORCH] Executing: ${missionToExecute.id}`);

    // Execute with real executor
    const result = executeMission(projectRoot, missionToExecute);

    if (result.success) {
      // 4. VERIFY
      console.log(`[ORCH] Execution complete. Running verification...`);
      const verification = runVerification(projectRoot);

      if (verification.typecheck && verification.lint) {
        // 5. COMPLETED
        console.log(`[ORCH] Verification passed. Generating report...`);

        const report = generateReport(
          missionToExecute,
          result,
          [
            { command: 'pnpm typecheck', status: 'passed' },
            { command: 'pnpm lint', status: 'passed' },
          ],
          'Mission executed successfully. Verification passed.',
        );

        const { jsonPath, mdPath } = writeReport(projectRoot, report);
        missionToExecute.implementationSha = result.headSha;
        missionToExecute.reportPath = jsonPath;

        const completed = {
          ...state,
          status: 'IDLE' as const,
          currentMission: null,
          lastCompletedMission: missionToExecute.id,
          lastCompletedAt: new Date().toISOString(),
          totalMissionsCompleted: state.totalMissionsCompleted + 1,
        };
        saveState(projectRoot, completed);
        persistMissionCompletion(projectRoot, missionToExecute.id, [jsonPath, mdPath]);

        console.log(`[ORCH] Mission ${missionToExecute.id} COMPLETED`);
        return 'completed';
      } else {
        // Verification failed
        console.error(
          `[ORCH] Verification failed: typecheck=${verification.typecheck} lint=${verification.lint}`,
        );

        if (missionToExecute.attempts < missionToExecute.maxAttempts) {
          missionToExecute.attempts += 1;
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
            { command: 'pnpm typecheck', status: verification.typecheck ? 'passed' : 'failed' },
            { command: 'pnpm lint', status: verification.lint ? 'passed' : 'failed' },
          ],
          'Verification failed after max retries.',
        );

        writeReport(projectRoot, report);
        const failed = {
          ...state,
          status: 'IDLE' as const,
          currentMission: null,
          totalMissionsFailed: state.totalMissionsFailed + 1,
        };
        saveState(projectRoot, failed);
        persistMissionFailure(projectRoot, missionToExecute.id, 'verification failed');
        return 'failed';
      }
    } else {
      // Execution failed
      console.error(`[ORCH] Execution failed: ${result.output.slice(0, 200)}`);

      if (missionToExecute.attempts < missionToExecute.maxAttempts) {
        missionToExecute.attempts += 1;
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
