import { query } from '@/lib/server/db';

type FunnelStageData = {
  stage: string;
  users: number;
};

type DropOffData = {
  stage: string;
  dropOff: number;
  users: number;
};

type CohortData = {
  month: string;
  users: number;
  retention30: number;
  retention90: number;
  retention180: number;
  premium: number;
};

type RevenueData = {
  tool: string;
  conversions: number;
  revenue: number;
  share: number;
};

export type FunnelSnapshot = {
  id: string;
  recordedAt: number;
  totalVisits: number;
  totalConversions: number;
  conversionRate: number;
  stages: FunnelStageData[];
  dropOffs: DropOffData[];
  cohorts: CohortData[];
  revenue: RevenueData[];
  monthlyVisits: Array<{ label: string; value: number }>;
};

let tableExists = false;

async function ensureTable(): Promise<boolean> {
  if (tableExists) {
    return true;
  }
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS funnel_snapshots (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        recorded_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
        total_visits INTEGER NOT NULL DEFAULT 0,
        total_conversions INTEGER NOT NULL DEFAULT 0,
        conversion_rate REAL NOT NULL DEFAULT 0,
        stages JSONB NOT NULL DEFAULT '[]',
        drop_offs JSONB NOT NULL DEFAULT '[]',
        cohorts JSONB NOT NULL DEFAULT '[]',
        revenue JSONB NOT NULL DEFAULT '[]',
        monthly_visits JSONB NOT NULL DEFAULT '[]'
      )
    `);
    await query(
      'CREATE INDEX IF NOT EXISTS idx_funnel_recorded ON funnel_snapshots(recorded_at DESC)',
    );
    tableExists = true;
    return true;
  } catch {
    tableExists = false;
    return false;
  }
}

function rowToSnapshot(row: {
  id: string;
  recorded_at: number;
  total_visits: number;
  total_conversions: number;
  conversion_rate: number;
  stages: FunnelStageData[] | string;
  drop_offs: DropOffData[] | string;
  cohorts: CohortData[] | string;
  revenue: RevenueData[] | string;
  monthly_visits: Array<{ label: string; value: number }> | string;
}): FunnelSnapshot {
  return {
    id: row.id,
    recordedAt: row.recorded_at,
    totalVisits: row.total_visits,
    totalConversions: row.total_conversions,
    conversionRate: row.conversion_rate,
    stages: typeof row.stages === 'string' ? JSON.parse(row.stages) : row.stages,
    dropOffs: typeof row.drop_offs === 'string' ? JSON.parse(row.drop_offs) : row.drop_offs,
    cohorts: typeof row.cohorts === 'string' ? JSON.parse(row.cohorts) : row.cohorts,
    revenue: typeof row.revenue === 'string' ? JSON.parse(row.revenue) : row.revenue,
    monthlyVisits:
      typeof row.monthly_visits === 'string' ? JSON.parse(row.monthly_visits) : row.monthly_visits,
  };
}

export async function getLatestFunnelSnapshot(): Promise<FunnelSnapshot | null> {
  const hasTable = await ensureTable();
  if (!hasTable) {
    return null;
  }
  try {
    const result = await query<{
      id: string;
      recorded_at: number;
      total_visits: number;
      total_conversions: number;
      conversion_rate: number;
      stages: FunnelStageData[] | string;
      drop_offs: DropOffData[] | string;
      cohorts: CohortData[] | string;
      revenue: RevenueData[] | string;
      monthly_visits: Array<{ label: string; value: number }> | string;
    }>('SELECT * FROM funnel_snapshots ORDER BY recorded_at DESC LIMIT 1');
    if (result.rows.length === 0) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return rowToSnapshot(result.rows[0]!);
  } catch {
    return null;
  }
}

export async function saveFunnelSnapshot(
  snapshot: Omit<FunnelSnapshot, 'id' | 'recordedAt'>,
): Promise<FunnelSnapshot | null> {
  const hasTable = await ensureTable();
  if (!hasTable) {
    return null;
  }
  try {
    const result = await query<{
      id: string;
      recorded_at: number;
      total_visits: number;
      total_conversions: number;
      conversion_rate: number;
      stages: FunnelStageData[] | string;
      drop_offs: DropOffData[] | string;
      cohorts: CohortData[] | string;
      revenue: RevenueData[] | string;
      monthly_visits: Array<{ label: string; value: number }> | string;
    }>(
      `INSERT INTO funnel_snapshots (total_visits, total_conversions, conversion_rate, stages, drop_offs, cohorts, revenue, monthly_visits)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        snapshot.totalVisits,
        snapshot.totalConversions,
        snapshot.conversionRate,
        JSON.stringify(snapshot.stages),
        JSON.stringify(snapshot.dropOffs),
        JSON.stringify(snapshot.cohorts),
        JSON.stringify(snapshot.revenue),
        JSON.stringify(snapshot.monthlyVisits),
      ],
    );
    return result.rows[0] ? rowToSnapshot(result.rows[0]) : null;
  } catch {
    return null;
  }
}

export async function getFunnelHistory(limit = 12): Promise<FunnelSnapshot[]> {
  const hasTable = await ensureTable();
  if (!hasTable) {
    return [];
  }
  try {
    const result = await query<{
      id: string;
      recorded_at: number;
      total_visits: number;
      total_conversions: number;
      conversion_rate: number;
      stages: FunnelStageData[] | string;
      drop_offs: DropOffData[] | string;
      cohorts: CohortData[] | string;
      revenue: RevenueData[] | string;
      monthly_visits: Array<{ label: string; value: number }> | string;
    }>('SELECT * FROM funnel_snapshots ORDER BY recorded_at DESC LIMIT $1', [limit]);
    return result.rows.map(rowToSnapshot);
  } catch {
    return [];
  }
}
