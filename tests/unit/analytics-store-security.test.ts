import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('analyticsStore security contracts', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'pt-analytics-'));
    process.env['ANALYTICS_DATA_DIR'] = tempDir;
    vi.resetModules();
  });

  afterEach(async () => {
    delete process.env['ANALYTICS_DATA_DIR'];
    await rm(tempDir, { recursive: true, force: true });
  });

  it('redacts non-whitelisted metadata and query params from persisted summary', async () => {
    const { ingestAnalyticsEvents } = await import('@/lib/analyticsStore');

    await ingestAnalyticsEvents([
      {
        event: 'page_view',
        timestamp: Date.now(),
        path: '/ads?email=user@example.com&token=secret',
        metadata: {
          consentGranted: true,
          consentVersion: 1,
          source: 'ui',
          email: 'user@example.com',
          token: 'secret-value',
        },
      },
    ]);

    const summaryRaw = await readFile(path.join(tempDir, 'summary.json'), 'utf8');
    const summary = JSON.parse(summaryRaw) as {
      pathCounts: Record<string, number>;
      totalEvents: number;
    };

    expect(summary.totalEvents).toBe(1);
    expect(summary.pathCounts['/ads']).toBe(1);
    expect(summaryRaw).not.toContain('user@example.com');
    expect(summaryRaw).not.toContain('secret-value');
  });
});
