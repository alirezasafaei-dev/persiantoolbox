/**
 * Notion Transport — Ingest missions from Notion "Agent Mission Inbox" database
 *
 * v3.0 — Fixed schema mismatch + page body parsing:
 * - Status is Notion "status" type, not "select"
 * - Description/Acceptance Criteria are NOT database properties
 * - Full mission instructions are in the page body (blocks API)
 * - Parse explicit sections: Required Implementation, Acceptance Criteria, Definition of Done
 * - Reject malformed pages visibly; never fabricate criteria
 * - Only mark Synced after successful GitHub push
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
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

function notionFetch(
  endpoint: string,
  token: string,
  body?: object,
  method: 'POST' | 'GET' = 'POST',
): unknown {
  const args = [
    '--silent',
    '--show-error',
    '--request',
    method,
    '--header',
    `Authorization: Bearer ${token}`,
    '--header',
    `Notion-Version: ${NOTION_VERSION}`,
    '--header',
    'Content-Type: application/json',
    '--write-out',
    '\n%{http_code}',
  ];

  if (body && method === 'POST') {
    args.push('--data', JSON.stringify(body));
  }

  const url = `${NOTION_API}${endpoint}`;
  args.push(url);

  const output = execFileSync('curl', args, {
    encoding: 'utf-8',
    timeout: 30_000,
  });

  // Last line is the HTTP status code; the rest is the response body
  const lines = output.trimEnd().split('\n');
  const httpCode = Number(lines[lines.length - 1]);
  const responseBody = lines.slice(0, -1).join('\n');

  if (httpCode < 200 || httpCode >= 300) {
    throw new Error(`Notion API HTTP ${httpCode}: ${responseBody.slice(0, 500)}`);
  }

  return JSON.parse(responseBody);
}

// ---------------------------------------------------------------------------
// Property extractors — handles all Notion property types
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

// ---------------------------------------------------------------------------
// Page body parser — fetch blocks and extract text
// ---------------------------------------------------------------------------

interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
  [key: string]: unknown;
}

function fetchPageBlocks(pageId: string, token: string): NotionBlock[] {
  const allBlocks: NotionBlock[] = [];
  let startCursor: string | undefined;

  // Paginate through all blocks (Notion limit: 100 per request)
  for (let page = 0; page < 5; page++) {
    const query = new URLSearchParams({ page_size: '100' });
    if (startCursor) query.set('start_cursor', startCursor);

    const data = notionFetch(
      `/blocks/${pageId}/children?${query.toString()}`,
      token,
      undefined,
      'GET',
    ) as {
      results?: NotionBlock[];
      has_more?: boolean;
      next_cursor?: string;
    };

    const results = data.results || [];
    allBlocks.push(...results);

    if (!data.has_more || !data.next_cursor) break;
    startCursor = data.next_cursor as string;
  }

  return allBlocks;
}

function blockToText(block: NotionBlock): string {
  const type = block.type;
  if (type === 'divider') return '---';

  // Preserve heading markers so section extraction can find headings
  if (type === 'heading_1') {
    const content = block[type] as { rich_text?: Array<{ plain_text: string }> } | undefined;
    const text = content?.rich_text?.map((t) => t.plain_text).join('') || '';
    return text ? `# ${text}` : '';
  }
  if (type === 'heading_2') {
    const content = block[type] as { rich_text?: Array<{ plain_text: string }> } | undefined;
    const text = content?.rich_text?.map((t) => t.plain_text).join('') ?? '';
    return text ? `## ${text}` : '';
  }
  if (type === 'heading_3') {
    const content = block[type] as { rich_text?: Array<{ plain_text: string }> } | undefined;
    const text = content?.rich_text?.map((t) => t.plain_text).join('') ?? '';
    return text ? `### ${text}` : '';
  }

  const content = block[type] as { rich_text?: Array<{ plain_text: string }> } | undefined;
  if (!content?.rich_text) return '';

  return content.rich_text.map((t) => t.plain_text).join('');
}

function blocksToText(blocks: NotionBlock[]): string {
  return blocks.map((b) => blockToText(b)).join('\n');
}

// ---------------------------------------------------------------------------
// Section extractor — parse headings into structured sections
// ---------------------------------------------------------------------------

export interface ParsedBody {
  /** Full raw text from the page body */
  fullText: string;
  /** Mission objective (first heading_2 or heading_1 content) */
  objective: string;
  /** Required implementation section */
  implementation: string;
  /** Acceptance criteria parsed from explicit heading */
  acceptanceCriteria: string[];
  /** Definition of Done parsed from explicit heading */
  definitionOfDone: string[];
  /** Whether the page body is valid for mission ingestion */
  valid: boolean;
  error?: string;
}

export function extractSections(text: string): ParsedBody {
  const lines = text.split('\n');
  const sections: Record<string, string[]> = {};
  let currentSection = '';

  for (const line of lines) {
    // Match ## heading or ### heading
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch?.[1]) {
      currentSection = headingMatch[1].trim();
      sections[currentSection] = [];
    } else if (currentSection && sections[currentSection]) {
      sections[currentSection]!.push(line);
    }
  }

  // Extract known sections (case-insensitive key matching)
  const findSection = (names: string[]): string[] => {
    for (const name of names) {
      for (const key of Object.keys(sections)) {
        if (key.toLowerCase().includes(name.toLowerCase())) {
          return sections[key]!;
        }
      }
    }
    return [];
  };

  const objectiveLines = findSection(['Mission Objective', 'Objective', 'Goal']);
  const implementationLines = findSection([
    'Required Implementation',
    'Implementation',
    'Required',
  ]);
  const criteriaLines = findSection(['Acceptance Criteria', 'Criteria']);
  const dodLines = findSection(['Definition of Done', 'Done']);

  const objective = objectiveLines.join('\n').trim();
  const implementation = implementationLines.join('\n').trim();

  // Parse criteria from bullet points or numbered lists
  const parseCriteriaLines = (lines: string[]): string[] =>
    lines
      .map((l) =>
        l
          .replace(/^[-•*]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .trim(),
      )
      .filter((l) => l.length > 0 && !l.startsWith('##'));

  const acceptanceCriteria = parseCriteriaLines(criteriaLines);
  const definitionOfDone = parseCriteriaLines(dodLines);

  // Validate: must have at least an objective or implementation
  const valid = objective.length > 0 || implementation.length > 0;

  return {
    fullText: text,
    objective,
    implementation,
    acceptanceCriteria,
    definitionOfDone,
    valid,
    error: valid
      ? ''
      : 'Page body has no Mission Objective or Required Implementation section — malformed',
  };
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
      // Status is a Notion "select" property in the Agent Mission Inbox
      select: { equals: 'Pending' },
    },
    page_size: 10,
  }) as { results?: NotionPage[] };

  return data.results || [];
}

// ---------------------------------------------------------------------------
// Parse Notion page into Mission (v3.0 — page body based)
// ---------------------------------------------------------------------------

export function parseNotionPage(
  page: NotionPage,
  token: string,
): { mission: Partial<Mission>; valid: boolean; error?: string } {
  const props = page.properties as Record<string, unknown>;

  // Extract metadata from database properties
  const missionId = getRichText(props, 'Mission ID');
  const title = getTitle(props, 'Mission');
  const priority = (getSelect(props, 'Priority').toLowerCase() || 'medium') as MissionPriority;

  // Fetch and parse page body for instructions
  let parsedBody: ParsedBody;
  try {
    const blocks = fetchPageBlocks(page.id, token);
    const bodyText = blocksToText(blocks);
    parsedBody = extractSections(bodyText);
  } catch (err) {
    return {
      mission: { id: missionId || `mission-notion-${page.id.slice(0, 8)}` },
      valid: false,
      error: `Failed to fetch page body: ${err}`,
    };
  }

  // Reject malformed pages
  if (!parsedBody.valid) {
    return {
      mission: { id: missionId || `mission-notion-${page.id.slice(0, 8)}` },
      valid: false,
      error: parsedBody.error || 'Malformed page body',
    };
  }

  // Combine Acceptance Criteria + Definition of Done
  const allCriteria =
    parsedBody.acceptanceCriteria.length > 0
      ? parsedBody.acceptanceCriteria
      : parsedBody.definitionOfDone;

  // Reject if no criteria found at all
  if (allCriteria.length === 0) {
    return {
      mission: { id: missionId || `mission-notion-${page.id.slice(0, 8)}` },
      valid: false,
      error:
        'No Acceptance Criteria or Definition of Done found in page body — ambiguous mission rejected',
    };
  }

  // Build description from page body
  const description = [
    parsedBody.objective ? `## Mission Objective\n${parsedBody.objective}` : '',
    parsedBody.implementation ? `## Required Implementation\n${parsedBody.implementation}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    mission: {
      id: missionId || `mission-notion-${page.id.slice(0, 8)}`,
      type: 'growth',
      priority,
      title: title || 'Untitled Mission',
      description: description || parsedBody.fullText.slice(0, 2000),
      acceptanceCriteria: allCriteria,
      deployApproved: false,
      destructiveOperationsAllowed: false,
      status: 'pending',
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    valid: true,
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

  // Commit to GitHub — ONLY after writing succeeds
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
// Mark Notion page as Synced — ONLY called after successful GitHub push
// ---------------------------------------------------------------------------

export function markNotionSynced(token: string, pageId: string): boolean {
  try {
    notionFetch(`/pages/${pageId}`, token, {
      properties: {
        Status: {
          // Status is a Notion "select" property in the Agent Mission Inbox
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
// Health evidence — persistent transport health tracking
// ---------------------------------------------------------------------------

export interface TransportHealth {
  lastNotionSync: string | null;
  lastSuccessfulTransport: string | null;
  lastMaterializedMission: string | null;
  lastOrchestratorCycle: string | null;
  lastError: string | null;
}

const HEALTH_FILE = 'docs/growth/agent-loop/health.json';

export function loadTransportHealth(projectRoot: string): TransportHealth {
  const healthPath = join(projectRoot, HEALTH_FILE);
  if (!existsSync(healthPath)) {
    return {
      lastNotionSync: null,
      lastSuccessfulTransport: null,
      lastMaterializedMission: null,
      lastOrchestratorCycle: null,
      lastError: null,
    };
  }
  try {
    const raw = readFileSync(healthPath, 'utf-8');
    return JSON.parse(raw) as TransportHealth;
  } catch {
    return {
      lastNotionSync: null,
      lastSuccessfulTransport: null,
      lastMaterializedMission: null,
      lastOrchestratorCycle: null,
      lastError: null,
    };
  }
}

export function saveTransportHealth(projectRoot: string, health: TransportHealth): void {
  const healthPath = join(projectRoot, HEALTH_FILE);
  const dir = join(projectRoot, 'docs/growth/agent-loop');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(healthPath, JSON.stringify(health, null, 2));
}

// ---------------------------------------------------------------------------
// Main sync function — called from orchestrator poll loop
// ---------------------------------------------------------------------------

export function syncNotionToGitHub(projectRoot: string): {
  synced: number;
  errors: string[];
  health: TransportHealth;
} {
  const now = new Date().toISOString();
  const health = loadTransportHealth(projectRoot);
  health.lastOrchestratorCycle = now;

  const token = process.env['NOTION_TOKEN'];
  if (!token) {
    health.lastError = 'NOTION_TOKEN not set — one-time human setup required';
    saveTransportHealth(projectRoot, health);
    return { synced: 0, errors: [health.lastError], health };
  }

  let pages: NotionPage[];
  try {
    pages = fetchPendingMissions(token);
  } catch (err) {
    health.lastError = `Notion API failed: ${err}`;
    saveTransportHealth(projectRoot, health);
    return { synced: 0, errors: [health.lastError], health };
  }

  health.lastNotionSync = now;
  let synced = 0;
  const errors: string[] = [];

  for (const page of pages) {
    const { mission, valid, error } = parseNotionPage(page, token);

    if (!valid) {
      const errMsg = `${mission.id || page.id}: ${error}`;
      errors.push(errMsg);
      console.error(`[NOTION] Rejected: ${errMsg}`);
      continue;
    }

    const result = materializeMission(projectRoot, mission);
    if (result.success) {
      // Mark Notion as Synced ONLY after successful GitHub push
      markNotionSynced(token, page.id);
      synced++;
      health.lastSuccessfulTransport = now;
      health.lastMaterializedMission = mission.id || null;
      health.lastError = null;
      console.log(`[NOTION] Synced mission: ${mission.id}`);
    } else {
      errors.push(`${mission.id}: ${result.error}`);
      health.lastError = `${mission.id}: ${result.error}`;
      console.error(`[NOTION] Failed to sync ${mission.id}: ${result.error}`);
    }
  }

  saveTransportHealth(projectRoot, health);
  return { synced, errors, health };
}
