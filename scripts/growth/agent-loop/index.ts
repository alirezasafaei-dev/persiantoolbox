#!/usr/bin/env npx tsx
/**
 * Agent Control Plane — CLI Entry Point
 *
 * v2.0 — Added Notion sync command
 *
 * Usage:
 *   npx tsx scripts/growth/agent-loop/index.ts poll           Polling mode
 *   npx tsx scripts/growth/agent-loop/index.ts once           Single mission cycle
 *   npx tsx scripts/growth/agent-loop/index.ts status         Show current state
 *   npx tsx scripts/growth/agent-loop/index.ts discover       List pending missions
 *   npx tsx scripts/growth/agent-loop/index.ts sync-notion    Sync from Notion inbox
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadState } from './state-store.js';
import { discoverMissions } from './mission-loader.js';
import { runOnce, runPolling } from './orchestrator.js';
import { syncNotionToGitHub } from './notion-transport.js';
import type { OrchestratorOptions } from './types.js';
import { DEFAULT_OPTIONS } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..', '..');

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

function syncNotion(): void {
  console.log('[NOTION] Syncing from Notion inbox...');
  const result = syncNotionToGitHub(PROJECT_ROOT);
  console.log(`[NOTION] Synced: ${result.synced}`);
  if (result.errors.length > 0) {
    console.log(`[NOTION] Errors: ${result.errors.join('; ')}`);
  }
}

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(): void {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
Agent Control Plane — CLI v2.0

Usage:
  index.ts poll           Polling mode (systemd)
  index.ts once           Single mission cycle
  index.ts status         Show current state
  index.ts discover       List pending missions
  index.ts sync-notion    Sync from Notion inbox
  index.ts --help         Show this help

Options:
  --interval <ms>   Polling interval (default: 180000)
`);
    return;
  }

  const command = args[0];

  if (command === 'status') {
    showStatus();
    return;
  }

  if (command === 'discover') {
    discover();
    return;
  }

  if (command === 'sync-notion') {
    syncNotion();
    return;
  }

  if (command === 'poll') {
    const options: OrchestratorOptions = { ...DEFAULT_OPTIONS };
    const intervalIdx = args.indexOf('--interval');
    if (intervalIdx !== -1 && args[intervalIdx + 1]) {
      const val = args[intervalIdx + 1];
      if (val) options.pollIntervalMs = parseInt(val, 10);
    }
    runPolling(PROJECT_ROOT, options);
    return;
  }

  if (command === 'once') {
    const options: OrchestratorOptions = { ...DEFAULT_OPTIONS };
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

  console.error(`[ERROR] Unknown command: ${command}. Use --help for usage.`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

parseArgs();
