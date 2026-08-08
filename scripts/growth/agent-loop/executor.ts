/**
 * Executor — Invokes the REAL project agent via opencode CLI
 *
 * v2.0 — execFile/spawn (no shell interpolation), file scope enforcement
 */

import { execFileSync } from 'child_process';
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
// Real executor — execFile (no shell interpolation)
// ---------------------------------------------------------------------------

function executeViaOpenCode(projectRoot: string, mission: Mission): ExecutionResult {
  const baseSha = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: projectRoot,
    encoding: 'utf-8',
  }).trim();

  const prompt = buildPrompt(mission);
  const startTime = Date.now();

  try {
    // Use execFileSync — no shell interpolation, no injection risk
    const output = execFileSync(
      'opencode',
      ['run', prompt, '--auto', '--dir', projectRoot, '--format', 'json'],
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
    const headSha = execFileSync('git', ['rev-parse', 'HEAD'], {
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
        return execFileSync('git', ['rev-parse', 'HEAD'], {
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
    const output = execFileSync('git', ['diff', '--name-only', `${fromSha}..${toSha}`], {
      cwd: projectRoot,
      encoding: 'utf-8',
    }).trim();
    return output.split('\n').filter((f) => f.length > 0);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// File scope enforcement
// ---------------------------------------------------------------------------

export function enforceFileScope(
  mission: Mission,
  filesChanged: string[],
): { valid: boolean; violations: string[] } {
  if (!mission.files || mission.files.length === 0) {
    return { valid: true, violations: [] };
  }

  const allowedPrefixes = mission.files;
  const violations: string[] = [];

  for (const file of filesChanged) {
    const isAllowed = allowedPrefixes.some(
      (prefix) =>
        file === prefix || file.startsWith(prefix + '/') || file.startsWith(prefix + '\\'),
    );
    if (!isAllowed) {
      violations.push(file);
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

// ---------------------------------------------------------------------------
// Verification runner — v2.0: typecheck + lint + vitest + build
// ---------------------------------------------------------------------------

export function runVerification(projectRoot: string): {
  typecheck: boolean;
  lint: boolean;
  vitest: boolean;
  build: boolean;
} {
  const results = { typecheck: false, lint: false, vitest: false, build: false };

  try {
    execFileSync('pnpm', ['typecheck'], {
      cwd: projectRoot,
      encoding: 'utf-8',
      timeout: 120_000,
      stdio: 'pipe',
    });
    results.typecheck = true;
  } catch {
    results.typecheck = false;
  }

  try {
    execFileSync('pnpm', ['lint'], {
      cwd: projectRoot,
      encoding: 'utf-8',
      timeout: 60_000,
      stdio: 'pipe',
    });
    results.lint = true;
  } catch {
    results.lint = false;
  }

  try {
    execFileSync('pnpm', ['vitest', '--run'], {
      cwd: projectRoot,
      encoding: 'utf-8',
      timeout: 300_000,
      stdio: 'pipe',
    });
    results.vitest = true;
  } catch {
    results.vitest = false;
  }

  try {
    execFileSync('pnpm', ['build'], {
      cwd: projectRoot,
      encoding: 'utf-8',
      timeout: 300_000,
      stdio: 'pipe',
    });
    results.build = true;
  } catch {
    results.build = false;
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function executeMission(projectRoot: string, mission: Mission): ExecutionResult {
  console.log(`[EXECUTOR] Executing mission: ${mission.id}`);
  console.log(`[EXECUTOR] Prompt length: ${buildPrompt(mission).length} chars`);

  return executeViaOpenCode(projectRoot, mission);
}
