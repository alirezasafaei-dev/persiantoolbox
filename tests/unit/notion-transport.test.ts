/**
 * Notion Transport — Tests
 *
 * Tests for: section extraction, malformed page rejection, mission
 * materialization (no-overwrite), and transport health persistence.
 * Network calls are NOT made — only pure parsing + filesystem functions.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { execFileSync } from 'child_process';
import {
  extractSections,
  materializeMission,
  loadTransportHealth,
  saveTransportHealth,
} from '../../scripts/growth/agent-loop/notion-transport.js';
import type { Mission } from '../../scripts/growth/agent-loop/types.js';

// ---------------------------------------------------------------------------
// Section extraction (pure, no network)
// ---------------------------------------------------------------------------

describe('extractSections', () => {
  it('parses Mission Objective and Required Implementation headings', () => {
    const text = [
      '## Mission Objective',
      'Make the transport operational.',
      '## Required Implementation',
      'Fix the filter type.',
      '## Acceptance Criteria',
      '- Criterion one',
      '- Criterion two',
    ].join('\n');

    const parsed = extractSections(text);
    expect(parsed.valid).toBe(true);
    expect(parsed.objective).toContain('Make the transport operational');
    expect(parsed.implementation).toContain('Fix the filter type');
    expect(parsed.acceptanceCriteria).toEqual(['Criterion one', 'Criterion two']);
  });

  it('parses numbered list criteria', () => {
    const text = [
      '## Mission Objective',
      'Do the thing.',
      '## Definition of Done',
      '1. First done',
      '2. Second done',
    ].join('\n');

    const parsed = extractSections(text);
    expect(parsed.valid).toBe(true);
    expect(parsed.definitionOfDone).toEqual(['First done', 'Second done']);
  });

  it('rejects a page with no objective or implementation', () => {
    const parsed = extractSections('## Random Heading\nSome text without structure');
    expect(parsed.valid).toBe(false);
    expect(parsed.error).toContain('malformed');
  });

  it('accepts a page with objective but no criteria (criteria checked later)', () => {
    const text = ['## Mission Objective', 'Do the thing.'].join('\n');
    const parsed = extractSections(text);
    expect(parsed.valid).toBe(true);
    expect(parsed.acceptanceCriteria).toHaveLength(0);
    expect(parsed.definitionOfDone).toHaveLength(0);
  });

  it('handles ### sub-headings', () => {
    const text = [
      '## Mission Objective',
      'Goal here.',
      '### Acceptance Criteria',
      '1. First',
      '2. Second',
    ].join('\n');

    const parsed = extractSections(text);
    expect(parsed.valid).toBe(true);
    expect(parsed.acceptanceCriteria).toEqual(['First', 'Second']);
  });
});

// ---------------------------------------------------------------------------
// Mission materialization (filesystem, no network)
// ---------------------------------------------------------------------------

describe('materializeMission', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'pt-mission-'));
    // materializeMission commits + pushes — needs a real git repo with a remote
    const bareDir = join(tmpDir, 'remote.git');
    execFileSync('git', ['init', '--bare', '-b', 'main', bareDir], { stdio: 'pipe' });
    execFileSync('git', ['init', '-b', 'main'], { cwd: tmpDir, stdio: 'pipe' });
    execFileSync('git', ['config', 'user.email', 'test@test.local'], { cwd: tmpDir });
    execFileSync('git', ['config', 'user.name', 'Test'], { cwd: tmpDir });
    execFileSync('git', ['config', 'commit.gpgsign', 'false'], { cwd: tmpDir });
    execFileSync('git', ['remote', 'add', 'origin', bareDir], { cwd: tmpDir });
    execFileSync('git', ['commit', '--allow-empty', '-m', 'init'], { cwd: tmpDir });
    execFileSync('git', ['push', '-u', 'origin', 'main'], { cwd: tmpDir, stdio: 'pipe' });
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes a mission file to the missions directory', () => {
    const mission: Partial<Mission> = {
      id: 'mission-test-001',
      title: 'Test Mission',
      priority: 'high',
      status: 'pending',
      description: '## Mission Objective\nDo the thing.',
      acceptanceCriteria: ['Criterion one'],
    };

    const result = materializeMission(tmpDir, mission);
    expect(result.success).toBe(true);

    const missionPath = join(tmpDir, 'docs/growth/agent-loop/missions/mission-test-001.json');
    expect(existsSync(missionPath)).toBe(true);

    const written = JSON.parse(readFileSync(missionPath, 'utf-8'));
    expect(written.id).toBe('mission-test-001');
    expect(written.status).toBe('pending');
  });

  it('never overwrites an existing mission', () => {
    const mission: Partial<Mission> = {
      id: 'mission-test-002',
      title: 'First',
      status: 'pending',
      description: '## Mission Objective\nFirst description.',
      acceptanceCriteria: ['Criterion one'],
    };

    const first = materializeMission(tmpDir, mission);
    expect(first.success).toBe(true);

    const second = materializeMission(tmpDir, { ...mission, title: 'Second' });
    expect(second.success).toBe(false);
    expect(second.error).toContain('already exists');

    const missionPath = join(tmpDir, 'docs/growth/agent-loop/missions/mission-test-002.json');
    const written = JSON.parse(readFileSync(missionPath, 'utf-8'));
    expect(written.title).toBe('First');
  });

  it('rejects a mission without an id', () => {
    const result = materializeMission(tmpDir, { title: 'No ID' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Mission ID is required');
  });
});

// ---------------------------------------------------------------------------
// Transport health persistence (filesystem, no network)
// ---------------------------------------------------------------------------

describe('TransportHealth persistence', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'pt-health-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('round-trips health data', () => {
    const health = {
      lastNotionSync: '2026-08-08T11:44:13Z',
      lastSuccessfulTransport: null,
      lastMaterializedMission: null,
      lastOrchestratorCycle: null,
      lastError: null,
    };

    saveTransportHealth(tmpDir, health);
    const loaded = loadTransportHealth(tmpDir);

    expect(loaded.lastNotionSync).toBe('2026-08-08T11:44:13Z');
    expect(loaded.lastSuccessfulTransport).toBeNull();
  });

  it('returns defaults when no health file exists', () => {
    const loaded = loadTransportHealth(tmpDir);
    expect(loaded.lastNotionSync).toBeNull();
    expect(loaded.lastError).toBeNull();
  });
});
