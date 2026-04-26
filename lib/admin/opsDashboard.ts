import { getRuntimeVersion } from '@/lib/runtime-version';
import { query } from '@/lib/server/db';
import { featureIds, getFeatureInfo } from '@/lib/features/availability';
import { getPublicSiteSettings } from '@/lib/server/siteSettings';
import { getAnalyticsSummary, type AnalyticsSummary } from '@/lib/analyticsStore';

export type HealthCheckResult = {
  ok: boolean;
  status?: number;
  reason?: string;
};

export type OpsDashboardSnapshot = {
  generatedAt: string;
  runtime: {
    version: string;
    commit: string | null;
    timestamp: string;
  };
  serviceHealth: {
    health: HealthCheckResult;
    ready: HealthCheckResult;
    version: {
      ok: boolean;
      reason?: string;
      data?: {
        service: string;
        version: string;
        commit: string | null;
        timestamp: string;
      };
    };
  };
  featureFlags: Array<{
    id: string;
    title: string;
    enabled: boolean;
    envKey: string;
  }>;
  analytics: {
    ok: boolean;
    reason?: string;
    summary?: {
      totalEvents: number;
      topEvents: Array<[string, number]>;
      topPaths: Array<[string, number]>;
      lastUpdated: number | null;
    };
  };
  siteSettings: {
    ok: boolean;
    reason?: string;
    summary?: {
      developerName: string;
      developerBrandText: string;
      orderUrl: string | null;
      portfolioUrl: string | null;
    };
  };
  dependencies: {
    database: {
      ok: boolean;
      reason?: string;
    };
  };
};

function pickTopEntries(items: Record<string, number>, limit: number): Array<[string, number]> {
  return Object.entries(items)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

async function checkDbHealth(): Promise<HealthCheckResult> {
  try {
    await query<{ ping: number }>('SELECT 1 as ping');
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      reason: error instanceof Error ? error.message : 'DATABASE_QUERY_ERROR',
    };
  }
}

export async function getOpsDashboardSnapshot(): Promise<OpsDashboardSnapshot> {
  const generatedAt = new Date().toISOString();
  const runtime = getRuntimeVersion();
  const db = await checkDbHealth();
  const readyResult: HealthCheckResult = db.ok
    ? { ok: true }
    : { ok: false, reason: db.reason ?? 'DATABASE_UNAVAILABLE', status: 500 };
  const healthResult = { ok: true };
  const snapshot: OpsDashboardSnapshot = {
    generatedAt,
    runtime: {
      version: runtime.version,
      commit: runtime.commit,
      timestamp: generatedAt,
    },
    serviceHealth: {
      health: healthResult,
      ready: readyResult,
      version: {
        ok: true,
        data: {
          service: 'persiantoolbox',
          version: runtime.version,
          commit: runtime.commit,
          timestamp: generatedAt,
        },
      },
    },
    featureFlags: featureIds.map((id) => {
      const info = getFeatureInfo(id);
      return {
        id,
        title: info.title,
        enabled: info.enabled,
        envKey: info.envKey,
      };
    }),
    analytics: { ok: true },
    siteSettings: { ok: true },
    dependencies: {
      database: db,
    },
  };

  try {
    const summary: AnalyticsSummary = await getAnalyticsSummary();
    snapshot.analytics = {
      ok: true,
      summary: {
        totalEvents: summary.totalEvents,
        topEvents: pickTopEntries(summary.eventCounts, 8),
        topPaths: pickTopEntries(summary.pathCounts, 8),
        lastUpdated: summary.lastUpdated,
      },
    };
  } catch (error) {
    snapshot.analytics = {
      ok: false,
      reason: error instanceof Error ? error.message : 'ANALYTICS_ERROR',
    };
  }

  try {
    const settings = await getPublicSiteSettings();
    snapshot.siteSettings = {
      ok: true,
      summary: {
        developerName: settings.developerName,
        developerBrandText: settings.developerBrandText,
        orderUrl: settings.orderUrl,
        portfolioUrl: settings.portfolioUrl,
      },
    };
  } catch (error) {
    snapshot.siteSettings = {
      ok: false,
      reason: error instanceof Error ? error.message : 'SITE_SETTINGS_ERROR',
    };
  }

  return snapshot;
}
