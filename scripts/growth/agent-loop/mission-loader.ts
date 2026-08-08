/**
 * Mission Loader — Discovery + validation of mission files
 *
 * Canonical source: docs/growth/agent-loop/missions/*.json
 * Mission JSON is trusted only from this directory on the approved ref.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { Mission, MissionPriority, MissionStatus } from './types.js';

const MISSIONS_DIR = 'docs/growth/agent-loop/missions';
const TEMPLATE_FILE = '_template.json';

const REQUIRED_FIELDS = [
  'id',
  'type',
  'priority',
  'title',
  'description',
  'acceptanceCriteria',
  'createdAt',
  'status',
  'attempts',
  'maxAttempts',
] as const;

const VALID_PRIORITIES: MissionPriority[] = ['high', 'medium', 'low'];
const VALID_INITIAL_STATUSES: MissionStatus[] = ['pending'];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateMission(mission: Record<string, unknown>): string[] {
  const errors: string[] = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (mission[field] === undefined || mission[field] === null || mission[field] === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate id format
  const id = mission['id'] as string | undefined;
  if (id && !id.startsWith('mission-')) {
    errors.push(`Mission id must start with "mission-": got "${id}"`);
  }

  // Validate priority
  const priority = mission['priority'] as string | undefined;
  if (priority && !VALID_PRIORITIES.includes(priority as MissionPriority)) {
    errors.push(`Invalid priority: "${priority}". Must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  // Validate status
  const status = mission['status'] as string | undefined;
  if (status && !VALID_INITIAL_STATUSES.includes(status as MissionStatus)) {
    errors.push(`Invalid status for new mission: "${status}". Must be "pending"`);
  }

  // Validate acceptanceCriteria is non-empty array
  const criteria = mission['acceptanceCriteria'] as unknown[] | undefined;
  if (criteria !== undefined) {
    if (!Array.isArray(criteria) || criteria.length === 0) {
      errors.push('acceptanceCriteria must be a non-empty array');
    }
  }

  // Validate attempts < maxAttempts
  const attempts = mission['attempts'] as number | undefined;
  const maxAttempts = mission['maxAttempts'] as number | undefined;
  if (attempts !== undefined && maxAttempts !== undefined) {
    if (attempts >= maxAttempts) {
      errors.push(
        `Mission exhausted retries: attempts (${attempts}) >= maxAttempts (${maxAttempts})`,
      );
    }
  }

  // Validate title is non-empty
  const title = mission['title'] as string | undefined;
  if (title !== undefined && title.trim().length === 0) {
    errors.push('title must be non-empty');
  }

  // Validate description is non-empty
  const desc = mission['description'] as string | undefined;
  if (desc !== undefined && desc.trim().length === 0) {
    errors.push('description must be non-empty');
  }

  // Reject unknown destructive flags if present
  if (mission['forceShellExec'] !== undefined) {
    errors.push('Unknown dangerous flag: forceShellExec — rejected');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

export function loadMission(filePath: string): { mission: Mission; errors: string[] } {
  const raw = readFileSync(filePath, 'utf-8');
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {
      mission: {} as Mission,
      errors: [`Invalid JSON in ${filePath}`],
    };
  }

  const errors = validateMission(parsed);

  // Apply defaults
  const mission: Mission = {
    id: (parsed['id'] as string) || '',
    type: (parsed['type'] as string) || 'growth',
    priority: (parsed['priority'] as MissionPriority) || 'medium',
    title: (parsed['title'] as string) || '',
    description: (parsed['description'] as string) || '',
    acceptanceCriteria: (parsed['acceptanceCriteria'] as string[]) || [],
    files: (parsed['files'] as string[]) || [],
    deployApproved: (parsed['deployApproved'] as boolean) || false,
    destructiveOperationsAllowed: (parsed['destructiveOperationsAllowed'] as boolean) || false,
    status: (parsed['status'] as MissionStatus) || 'pending',
    claimedBy: (parsed['claimedBy'] as string) || null,
    claimedAt: (parsed['claimedAt'] as string) || null,
    leaseUntil: (parsed['leaseUntil'] as string) || null,
    lastHeartbeat: (parsed['lastHeartbeat'] as string) || null,
    baseSha: (parsed['baseSha'] as string) || '',
    implementationSha: (parsed['implementationSha'] as string) || null,
    reportPath: (parsed['reportPath'] as string) || null,
    lastError: (parsed['lastError'] as string) || null,
    attempts: (parsed['attempts'] as number) || 0,
    maxAttempts: (parsed['maxAttempts'] as number) || 3,
    createdAt: (parsed['createdAt'] as string) || new Date().toISOString(),
    updatedAt: (parsed['updatedAt'] as string) || new Date().toISOString(),
  };

  return { mission, errors };
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

export function discoverMissions(projectRoot: string): Mission[] {
  const missionsDir = join(projectRoot, MISSIONS_DIR);
  if (!existsSync(missionsDir)) return [];

  const files = readdirSync(missionsDir).filter((f) => f.endsWith('.json') && f !== TEMPLATE_FILE);

  const missions: Mission[] = [];
  const seenIds = new Set<string>();

  for (const file of files) {
    const filePath = join(missionsDir, file);
    const { mission, errors } = loadMission(filePath);

    if (errors.length > 0) {
      console.error(`[MISSION] Validation failed for ${file}: ${errors.join('; ')}`);
      continue;
    }

    if (mission.status !== 'pending') continue;

    // Duplicate check
    if (seenIds.has(mission.id)) {
      console.error(`[MISSION] Duplicate mission id: ${mission.id}`);
      continue;
    }
    seenIds.add(mission.id);

    missions.push(mission);
  }

  // Sort by priority then creation date
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  return missions.sort((a, b) => {
    const pa = priorityOrder[a.priority] ?? 1;
    const pb = priorityOrder[b.priority] ?? 1;
    if (pa !== pb) return pa - pb;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}
