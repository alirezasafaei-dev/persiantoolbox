/**
 * Notion Transport — Ingest missions from Notion "Agent Mission Inbox" database
 *
 * Reads NOTION_TOKEN from environment. If not set, records a one-time blocker.
 * Only ingests rows with Status=Pending, validates content, materializes
 * canonical mission JSON into GitHub. GitHub remains source of truth.
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';
import type { Mission, MissionPriority } from './types.js';
import { validateMission } from './mission-loader.js';

const MISSIONS_DIR = 'docs/growth/agent-loop/missions';
const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const DATABASE_ID = '16b615e1-f089-45da-a331-b75efc4496c4';

// ---------------------------------------------------------------------------
// Notion API helper
// ---------------------------------------------------------------------------

function notionFetch(endpoint: string, token: string, body?: object): unknown {
  const args = [
    '--silent',
    '--request',
    'POST',
    '--header',
    `Authorization: Bearer ${token}`,
    '--header',
    `Notion-Version: ${NOTION_VERSION}`,
    '--header',
    'Content-Type: application/json',
  ];

  if (body) {
    args.push('--data', JSON.stringify(body));
  }

  const url = `${NOTION_API}${endpoint}`;
  args.push(url);

  const output = execFileSync('curl', args, {
    encoding: 'utf-8',
    timeout: 30_000,
  });

  return JSON.parse(output);
}

// ---------------------------------------------------------------------------
// Fetch pending missions from Notion
// ---------------------------------------------------------------------------

interface NotionPage {
  id: string;
  properties: Record<string, unknown>;
}

export function fetchPendingMissions(token: string): NotionPage[] {
  const data = notionFetch(`/databases/${DATABASE_ID}/query`, token, {
    filter: {
      property: 'Status',
      select: { equals: 'Pending' },
    },
    page_size: 10,
  }) as { results?: NotionPage[] };

  return data.results || [];
}

// ---------------------------------------------------------------------------
// Parse Notion page into Mission
// ---------------------------------------------------------------------------

function getRichText(props: Record<string, unknown>, fieldName: string): string {
  const field = props[fieldName] as { rich_text?: Array<{ plain_text: string }> } | undefined;
  if (!field?.rich_text) return '';
  return field.rich_text.map((t) => t.plain_text).join('');
}

function getSelect(props: Record<string, unknown>, fieldName: string): string {
  const field = props[fieldName] as { select?: { name: string } } | undefined;
  return field?.select?.name || '';
}

function getTitle(props: Record<string, unknown>, fieldName: string): string {
  const field = props[fieldName] as { title?: Array<{ plain_text: string }> } | undefined;
  if (!field?.title) return '';
  return field.title.map((t) => t.plain_text).join('');
}

export function parseNotionPage(page: NotionPage): Partial<Mission> {
  const props = page.properties as Record<string, unknown>;

  const missionId = getRichText(props, 'Mission ID');
  const title = getTitle(props, 'Mission');
  const priority = (getSelect(props, 'Priority').toLowerCase() || 'medium') as MissionPriority;
  const description = getRichText(props, 'Description');
  const criteriaRaw = getRichText(props, 'Acceptance Criteria');

  const acceptanceCriteria = criteriaRaw
    .split('\n')
    .map((l) => l.replace(/^[-•]\s*/, '').trim())
    .filter((l) => l.length > 0);

  return {
    id: missionId || `mission-notion-${page.id.slice(0, 8)}`,
    type: 'growth',
    priority,
    title: title || 'Untitled Mission',
    description: description || '',
    acceptanceCriteria,
    deployApproved: false,
    destructiveOperationsAllowed: false,
    status: 'pending',
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Materialize mission into GitHub
// ---------------------------------------------------------------------------

export function materializeMission(
  projectRoot: string,
  mission: Partial<Mission>,
): { success: boolean; error?: string } {
  if (!mission.id) {
    return { success: false, error: 'Mission ID is required' };
  }

  const missionsDir = join(projectRoot, MISSIONS_DIR);
  if (!existsSync(missionsDir)) {
    mkdirSync(missionsDir, { recursive: true });
  }

  const missionPath = join(missionsDir, `${mission.id}.json`);

  // Never overwrite existing missions
  if (existsSync(missionPath)) {
    return { success: false, error: `Mission ${mission.id} already exists` };
  }

  const fullMission: Mission = {
    id: mission.id!,
    type: mission.type || 'growth',
    priority: mission.priority || 'medium',
    title: mission.title || '',
    description: mission.description || '',
    acceptanceCriteria: mission.acceptanceCriteria || [],
    files: mission.files || [],
    deployApproved: mission.deployApproved || false,
    destructiveOperationsAllowed: mission.destructiveOperationsAllowed || false,
    status: 'pending',
    claimedBy: null,
    claimedAt: null,
    leaseUntil: null,
    lastHeartbeat: null,
    baseSha: '',
    implementationSha: null,
    reportPath: null,
    lastError: null,
    attempts: 0,
    maxAttempts: mission.maxAttempts || 3,
    createdAt: mission.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Validate before writing
  const errors = validateMission(fullMission as unknown as Record<string, unknown>);
  if (errors.length > 0) {
    return { success: false, error: `Validation failed: ${errors.join('; ')}` };
  }

  // Write mission file
  writeFileSync(missionPath, JSON.stringify(fullMission, null, 2));

  // Commit to GitHub
  try {
    execFileSync('git', ['add', missionPath], { cwd: projectRoot });
    execFileSync(
      'git',
      ['commit', '-m', `notion-transport: ingest mission ${mission.id}`, '--no-verify'],
      {
        cwd: projectRoot,
      },
    );
    execFileSync('git', ['push', 'origin', 'main'], { cwd: projectRoot, timeout: 30_000 });
  } catch (err) {
    return { success: false, error: `Git push failed: ${err}` };
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// Mark Notion page as Synced
// ---------------------------------------------------------------------------

export function markNotionSynced(token: string, pageId: string): boolean {
  try {
    notionFetch(`/pages/${pageId}`, token, {
      properties: {
        Status: {
          select: { name: 'Synced' },
        },
      },
    });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main sync function
// ---------------------------------------------------------------------------

export function syncNotionToGitHub(projectRoot: string): { synced: number; errors: string[] } {
  const token = process.env['NOTION_TOKEN'];
  if (!token) {
    return { synced: 0, errors: ['NOTION_TOKEN not set — one-time human setup required'] };
  }

  const pages = fetchPendingMissions(token);
  let synced = 0;
  const errors: string[] = [];

  for (const page of pages) {
    const mission = parseNotionPage(page);

    const result = materializeMission(projectRoot, mission);
    if (result.success) {
      markNotionSynced(token, page.id);
      synced++;
      console.log(`[NOTION] Synced mission: ${mission.id}`);
    } else {
      errors.push(`${mission.id}: ${result.error}`);
      console.error(`[NOTION] Failed to sync ${mission.id}: ${result.error}`);
    }
  }

  return { synced, errors };
}
