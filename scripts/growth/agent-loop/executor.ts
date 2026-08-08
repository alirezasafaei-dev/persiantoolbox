/**
 * Executor — Invokes the REAL project agent via opencode CLI
 *
 * v3.0 — opencode binary resolution (PATH fallback), commit uncommitted
 * changes so headSha reflects the actual executor-produced change.
 */

import { execFileSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { Mission, ExecutionResult } from './types.js';

// ---------------------------------------------------------------------------
// opencode binary resolution — the systemd service PATH may not include
// ~/.opencode/bin, so resolve explicitly with fallbacks.
// ---------------------------------------------------------------------------

function resolveOpenCodeBinary(): string {
  const fromEnv = process.env['OPENCODE_BIN'];
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  const candidates = [
    'opencode', // on PATH
    join(homedir(), '.opencode', 'bin', 'opencode'),
    '/usr/local/bin/opencode',
    '/usr/bin/opencode',
  ];

  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'pipe', timeout: 10_000 });
      return candidate;
    } catch {
      // try next
    }
  }

  return 'opencode'; // let execFileSync throw a meaningful error
}

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
  const opencodeBin = resolveOpenCodeBinary();

  try {
    // Use execFileSync — no shell interpolation, no injection risk
    const output = execFileSync(
      opencodeBin,
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

    // Commit any uncommitted executor-produced changes so headSha reflects
    // the actual implementation commit (accurate report provenance).
    const headSha = commitUncommittedChanges(projectRoot, mission.id);

    const duration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
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
// Commit uncommitted changes — ensures headSha is the actual implementation
// commit, not the pre-execution HEAD.
// ---------------------------------------------------------------------------

function commitUncommittedChanges(projectRoot: string, missionId: string): string {
  try {
    const status = execFileSync('git', ['status', '--porcelain'], {
      cwd: projectRoot,
      encoding: 'utf-8',
    }).trim();

    if (status.length === 0) {
      // Nothing uncommitted — head is the executor's commit (or unchanged)
      return execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd: projectRoot,
        encoding: 'utf-8',
      }).trim();
    }

    execFileSync('git', ['add', '-A'], { cwd: projectRoot });
    execFileSync(
      'git',
      ['commit', '-m', `agent-loop: executor changes for ${missionId}`, '--no-verify', '--signoff'],
      { cwd: projectRoot },
    );

    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: projectRoot,
      encoding: 'utf-8',
    }).trim();
  } catch {
    // If commit fails, fall back to current HEAD
    try {
      return execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd: projectRoot,
        encoding: 'utf-8',
      }).trim();
    } catch {
      return '';
    }
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
// Verification runner — v3.0: truthful exit codes + timing
// Each command runs exactly once with a real timeout; the actual exit code
// and elapsed time are recorded. Never label a failing command as passed.
// ---------------------------------------------------------------------------

export interface VerificationCommandResult {
  command: string;
  status: 'passed' | 'failed';
  exitCode: number;
  duration: string;
  output: string;
}

export function runVerification(projectRoot: string): VerificationCommandResult[] {
  const commands: Array<{ command: string; args: string[]; timeout: number }> = [
    { command: 'pnpm typecheck', args: ['typecheck'], timeout: 120_000 },
    { command: 'pnpm lint', args: ['lint'], timeout: 60_000 },
    { command: 'pnpm vitest --run', args: ['vitest', '--run'], timeout: 300_000 },
    { command: 'pnpm build', args: ['build'], timeout: 300_000 },
  ];

  return commands.map(({ command, args, timeout }) => {
    const start = Date.now();
    let output = '';
    let exitCode = 1;
    try {
      output = execFileSync('pnpm', args, {
        cwd: projectRoot,
        encoding: 'utf-8',
        timeout,
        stdio: 'pipe',
      });
      exitCode = 0;
    } catch (err) {
      const e = err as { status?: number; stderr?: string };
      exitCode = typeof e.status === 'number' ? e.status : 1;
      output = (e.stderr || String(err)).slice(0, 500);
    }
    const duration = `${((Date.now() - start) / 1000).toFixed(1)}s`;
    return {
      command,
      status: exitCode === 0 ? 'passed' : 'failed',
      exitCode,
      duration,
      output,
    };
  });
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function executeMission(projectRoot: string, mission: Mission): ExecutionResult {
  console.log(`[EXECUTOR] Executing mission: ${mission.id}`);
  console.log(`[EXECUTOR] Prompt length: ${buildPrompt(mission).length} chars`);

  return executeViaOpenCode(projectRoot, mission);
}
