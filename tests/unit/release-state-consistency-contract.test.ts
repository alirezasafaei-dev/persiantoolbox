import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type ReleaseStatus = 'pending' | 'in_progress' | 'blocked' | 'done';

function latestTasklistPath(baseDir: string): string {
  const files = readdirSync(baseDir)
    .filter((name) => /^v3-publish-tasklist-.*\.md$/.test(name))
    .sort();

  expect(files.length).toBeGreaterThan(0);
  return resolve(baseDir, files[files.length - 1] ?? '');
}

describe('release state consistency contract', () => {
  it('keeps registry, dashboard, and publish tasklist aligned', () => {
    const root = process.cwd();
    const registry = readFileSync(resolve(root, 'docs/release/release-state-registry.md'), 'utf8');
    const dashboard = readFileSync(resolve(root, 'docs/release/v3-readiness-dashboard.md'), 'utf8');
    const tasklist = readFileSync(
      latestTasklistPath(resolve(root, 'docs/release/reports')),
      'utf8',
    );

    const statusMatch = registry.match(/status:\s*`(pending|in_progress|blocked|done)`/i);
    expect(statusMatch).toBeTruthy();
    const status = statusMatch?.[1] as ReleaseStatus;

    expect(dashboard).toContain(
      'Canonical release state source: `docs/release/release-state-registry.md`.',
    );

    const dashboardFinalTag = dashboard.match(
      /final_release_tag_remote:\s*(pending|in_progress|blocked|done)\b/i,
    );
    expect(dashboardFinalTag?.[1]).toBe(status);

    const tasklistFinalTag = tasklist.match(
      /After approval,\s*create final release tag in remote\.\s*\(([^)]+)\)/i,
    );
    expect(tasklistFinalTag).toBeTruthy();

    const finalTagStatusText = tasklistFinalTag?.[1]?.toLowerCase() ?? '';
    if (status === 'done') {
      expect(finalTagStatusText).toContain('done');
      return;
    }

    expect(finalTagStatusText).toContain(status);
  });
});
