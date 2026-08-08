/**
 * Executor — Invokes the REAL project agent via opencode CLI
 *
 * This is the critical bridge between the control plane and actual execution.
 * It uses `opencode run` to invoke the project agent with the mission prompt.
 *
 * The executor MUST NOT:
 * - Execute arbitrary shell commands from mission JSON
 * - Deploy to production
 * - Modify .env files
 * - Access credentials
 */

import { execSync } from 'child_process';
import type { Mission, ExecutionResult } from './types.js';

// ---------------------------------------------------------------------------
// Executor prompt builder
// ---------------------------------------------------------------------------

function buildPrompt(mission: Mission): string {
  const criteria = mission.acceptanceCriteria.map((c) => `- ${c}`).join('\n');

  return `You are executing an autonomous growth mission for PersianToolbox.

MISSION: ${mission.title}
TYPE: ${mission.type}
PRIORITY: ${mission.priority}

DESCRIPTION:
${mission.description}

ACCEPTANCE CRITERIA:
${criteria}

RULES:
- Make the minimal changes required to satisfy acceptance criteria
- Do not modify files outside the mission scope
- Do not deploy to production (deployApproved=${mission.deployApproved})
- Do not run destructive operations unless explicitly approved (destructiveOps=${mission.destructiveOperationsAllowed})
- Create a signed-off commit for all changes
- After making changes, run: pnpm typecheck && pnpm lint
- Return a brief summary of what was done

EXECUTE NOW.`;
}

// ---------------------------------------------------------------------------
// Real executor — opencode run
// ---------------------------------------------------------------------------

function executeViaOpenCode(projectRoot: string, mission: Mission): ExecutionResult {
  const baseSha = execSync('git rev-parse HEAD', {
    cwd: projectRoot,
    encoding: 'utf-8',
  }).trim();

  const prompt = buildPrompt(mission);
  const startTime = Date.now();

  try {
    // Escape the prompt for shell
    const escapedPrompt = prompt
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\$/g, '\\$')
      .replace(/`/g, '\\`');

    const output = execSync(
      `opencode run "${escapedPrompt}" --auto --dir "${projectRoot}" --format json 2>&1`,
      {
        cwd: projectRoot,
        encoding: 'utf-8',
        timeout: 600_000, // 10 minute timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        env: {
          ...process.env,
          NO_COLOR: '1',
        },
      },
    );

    const duration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
    const headSha = execSync('git rev-parse HEAD', {
      cwd: projectRoot,
      encoding: 'utf-8',
    }).trim();

    const filesChanged = getChangedFiles(projectRoot, baseSha, headSha);

    return {
      success: true,
      output,
      duration,
      baseSha,
      headSha,
      filesChanged,
    };
  } catch (error: unknown) {
    const duration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
    const errMsg = error instanceof Error ? error.message : String(error);
    const headSha = (() => {
      try {
        return execSync('git rev-parse HEAD', {
          cwd: projectRoot,
          encoding: 'utf-8',
        }).trim();
      } catch {
        return baseSha;
      }
    })();

    return {
      success: false,
      output: errMsg,
      duration,
      baseSha,
      headSha,
      filesChanged: getChangedFiles(projectRoot, baseSha, headSha),
    };
  }
}

// ---------------------------------------------------------------------------
// Changed files helper
// ---------------------------------------------------------------------------

function getChangedFiles(projectRoot: string, fromSha: string, toSha: string): string[] {
  if (fromSha === toSha) return [];
  try {
    const output = execSync(`git diff --name-only ${fromSha}..${toSha}`, {
      cwd: projectRoot,
      encoding: 'utf-8',
    }).trim();
    return output.split('\n').filter((f) => f.length > 0);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Verification runner
// ---------------------------------------------------------------------------

export function runVerification(projectRoot: string): { typecheck: boolean; lint: boolean } {
  let typecheck = false;
  let lint = false;

  try {
    execSync('pnpm typecheck', {
      cwd: projectRoot,
      encoding: 'utf-8',
      timeout: 120_000,
      stdio: 'pipe',
    });
    typecheck = true;
  } catch {
    typecheck = false;
  }

  try {
    execSync('pnpm lint', {
      cwd: projectRoot,
      encoding: 'utf-8',
      timeout: 60_000,
      stdio: 'pipe',
    });
    lint = true;
  } catch {
    lint = false;
  }

  return { typecheck, lint };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function executeMission(projectRoot: string, mission: Mission): ExecutionResult {
  console.log(`[EXECUTOR] Executing mission: ${mission.id}`);
  console.log(`[EXECUTOR] Prompt length: ${buildPrompt(mission).length} chars`);

  return executeViaOpenCode(projectRoot, mission);
}
