import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { Mission, MissionPriority } from './types.js';

const MISSIONS_DIR = 'docs/growth/agent-loop/missions';
const ARCHIVE_DIR = 'docs/growth/agent-loop/archive';
const BACKLOG_FILE = 'docs/growth/agent-loop/approved-backlog.json';

interface ApprovedBacklogItem {
  id: string;
  priority: MissionPriority;
  dependencyOrder: number;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  files: string[];
  deployApproved: false;
  destructiveOperationsAllowed: false;
  dependsOn: string[];
}

interface ApprovedBacklog { version: number; items: ApprovedBacklogItem[] }

function readJson<T>(path: string): T | null {
  try { return JSON.parse(readFileSync(path, 'utf8')) as T; } catch { return null; }
}

function missionExists(root: string, id: string): boolean {
  return [MISSIONS_DIR, ARCHIVE_DIR].some((dir) => existsSync(join(root, dir, `${id}.json`)));
}

/** Materialize only never-before-seen approved items; existing files are human-owned. */
export function seedApprovedBacklog(projectRoot: string, now = new Date().toISOString()): string[] {
  const backlog = readJson<ApprovedBacklog>(join(projectRoot, BACKLOG_FILE));
  if (!backlog?.items) return [];
  const missionsPath = join(projectRoot, MISSIONS_DIR);
  mkdirSync(missionsPath, { recursive: true });
  const seeded: string[] = [];
  for (const item of backlog.items) {
    if (missionExists(projectRoot, item.id)) continue;
    const mission: Mission = {
      ...item,
      type: 'growth', status: 'pending', claimedBy: null, claimedAt: null,
      leaseUntil: null, lastHeartbeat: null, baseSha: '', implementationSha: null,
      reportPath: null, lastError: null, attempts: 0, maxAttempts: 3,
      createdAt: now, updatedAt: now, backlogSourceId: item.id,
    };
    writeFileSync(join(missionsPath, `${item.id}.json`), JSON.stringify(mission, null, 2));
    seeded.push(item.id);
  }
  return seeded;
}

export function selectNextEligibleMission(missions: Mission[], allMissions: Mission[]): { mission: Mission | null; reason: string | null } {
  const priority = { high: 0, medium: 1, low: 2 } as const;
  const terminal = new Set(allMissions.filter((m) => m.status === 'archived').map((m) => m.id));
  const ordered = [...missions].sort((a, b) => (priority[a.priority] - priority[b.priority]) || ((a.dependencyOrder ?? Number.MAX_SAFE_INTEGER) - (b.dependencyOrder ?? Number.MAX_SAFE_INTEGER)) || a.id.localeCompare(b.id));
  for (const mission of ordered) {
    const blockedBy = (mission.dependsOn ?? []).find((id) => !terminal.has(id));
    if (!blockedBy) return { mission, reason: null };
  }
  const first = ordered[0];
  const blockedBy = first?.dependsOn?.find((id) => !terminal.has(id));
  return { mission: null, reason: blockedBy ? `waiting for reviewed dependency ${blockedBy}` : 'no pending approved backlog item' };
}
