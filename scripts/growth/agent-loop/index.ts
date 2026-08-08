#!/usr/bin/env npx tsx
/**
 * Agent Control Plane — CLI Entry Point
 *
 * Usage:
 *   npx tsx scripts/growth/agent-loop/index.ts --once          Single mission cycle
 *   npx tsx scripts/growth/agent-loop/index.ts --poll          Polling mode
 *   npx tsx scripts/growth/agent-loop/index.ts --status        Show current state
 *   npx tsx scripts/growth/agent-loop/index.ts --discover      List pending missions
 *   npx tsx scripts/growth/agent-loop/index.ts --claim <id>    Manually claim a mission
 */

import { join } from 'path';
import { loadState } from './state-store.js';
import { discoverMissions } from './mission-loader.js';
import { runOnce, runPolling } from './orchestrator.js';
import type { OrchestratorOptions } from './types.js';
import { DEFAULT_OPTIONS } from './types.js';

const PROJECT_ROOT = join(import.meta.dirname, '..', '..', '..');

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function showStatus(): void {
  const state = loadState(PROJECT_ROOT);
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Agent Control Plane — Status                    ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Status:            ${state.status.padEnd(29)}║`);
  console.log(`║  Current Mission:   ${(state.currentMission || 'none').padEnd(29)}║`);
  console.log(`║  Worker ID:         ${state.workerId.padEnd(29)}║`);
  console.log(`║  Completed:         ${String(state.totalMissionsCompleted).padEnd(29)}║`);
  console.log(`║  Failed:            ${String(state.totalMissionsFailed).padEnd(29)}║`);
  console.log(`║  Last Check:        ${(state.lastHealthCheck || 'never').padEnd(29)}║`);
  console.log(`║  Base SHA:          ${state.baseSha.slice(0, 8).padEnd(29)}║`);
  console.log('╚══════════════════════════════════════════════════╝');
}

function discover(): void {
  const missions = discoverMissions(PROJECT_ROOT);
  if (missions.length === 0) {
    console.log('[DISCOVER] No pending missions found.');
    return;
  }
  console.log(`[DISCOVER] Found ${missions.length} pending mission(s):`);
  for (const m of missions) {
    console.log(`  - ${m.id}: ${m.title} [${m.priority}]`);
  }
}

async function claimManual(missionId: string): Promise<void> {
  console.log(`[CLAIM] Manually claiming mission: ${missionId}`);
  const result = await runOnce(PROJECT_ROOT, DEFAULT_OPTIONS);
  console.log(`[CLAIM] Result: ${result}`);
}

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(): void {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
Agent Control Plane — CLI

Usage:
  index.ts --once          Single mission cycle
  index.ts --poll          Polling mode
  index.ts --status        Show current state
  index.ts --discover      List pending missions
  index.ts --claim <id>    Manually claim a mission
  index.ts --help          Show this help

Options:
  --interval <ms>   Polling interval (default: 180000)
  --executor <name> Executor to use: opencode, openclaw, codex (default: opencode)
`);
    return;
  }

  if (args.includes('--status')) {
    showStatus();
    return;
  }

  if (args.includes('--discover')) {
    discover();
    return;
  }

  if (args.includes('--claim')) {
    const idx = args.indexOf('--claim');
    const missionId = args[idx + 1];
    if (!missionId) {
      console.error('[ERROR] --claim requires a mission ID');
      process.exit(1);
    }
    claimManual(missionId).catch(console.error);
    return;
  }

  const options: OrchestratorOptions = { ...DEFAULT_OPTIONS };

  const intervalIdx = args.indexOf('--interval');
  if (intervalIdx !== -1) {
    const val = args[intervalIdx + 1];
    if (val) {
      options.pollIntervalMs = parseInt(val, 10);
    }
  }

  const executorIdx = args.indexOf('--executor');
  if (executorIdx !== -1 && args[executorIdx + 1]) {
    const execName = args[executorIdx + 1];
    if (execName === 'opencode' || execName === 'openclaw' || execName === 'codex') {
      options.executor = execName;
    }
  }

  if (args.includes('--poll')) {
    runPolling(PROJECT_ROOT, options);
    return;
  }

  if (args.includes('--once')) {
    runOnce(PROJECT_ROOT, options)
      .then((result) => {
        console.log(`[ONCE] Result: ${result}`);
        process.exit(result === 'idle' ? 0 : result === 'completed' ? 0 : 1);
      })
      .catch((error) => {
        console.error(`[ONCE] Error:`, error);
        process.exit(1);
      });
    return;
  }

  console.error('[ERROR] Unknown command. Use --help for usage.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

parseArgs();
