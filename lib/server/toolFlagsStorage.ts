import { query } from '@/lib/server/db';

let tableExists = false;

async function ensureTable(): Promise<boolean> {
  if (tableExists) {
    return true;
  }
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS tool_flags (
        tool_id TEXT PRIMARY KEY,
        enabled BOOLEAN NOT NULL DEFAULT true,
        updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
      )
    `);
    tableExists = true;
    return true;
  } catch {
    tableExists = false;
    return false;
  }
}

export async function getToolFlags(): Promise<Map<string, boolean>> {
  const hasTable = await ensureTable();
  const flags = new Map<string, boolean>();
  if (!hasTable) {
    return flags;
  }
  try {
    const result = await query<{ tool_id: string; enabled: boolean }>(
      'SELECT tool_id, enabled FROM tool_flags',
    );
    for (const row of result.rows) {
      flags.set(row.tool_id, row.enabled);
    }
  } catch {
    // fall through
  }
  return flags;
}

export async function setToolFlag(toolId: string, enabled: boolean): Promise<boolean> {
  const hasTable = await ensureTable();
  if (!hasTable) {
    return false;
  }
  try {
    await query(
      `INSERT INTO tool_flags (tool_id, enabled, updated_at)
       VALUES ($1, $2, EXTRACT(EPOCH FROM NOW()) * 1000)
       ON CONFLICT (tool_id) DO UPDATE SET enabled = $2, updated_at = EXTRACT(EPOCH FROM NOW()) * 1000`,
      [toolId, enabled],
    );
    return true;
  } catch {
    return false;
  }
}

export async function bulkSetToolFlags(toolIds: string[], enabled: boolean): Promise<boolean> {
  const hasTable = await ensureTable();
  if (!hasTable) {
    return false;
  }
  try {
    for (const toolId of toolIds) {
      await query(
        `INSERT INTO tool_flags (tool_id, enabled, updated_at)
         VALUES ($1, $2, EXTRACT(EPOCH FROM NOW()) * 1000)
         ON CONFLICT (tool_id) DO UPDATE SET enabled = $2, updated_at = EXTRACT(EPOCH FROM NOW()) * 1000`,
        [toolId, enabled],
      );
    }
    return true;
  } catch {
    return false;
  }
}
