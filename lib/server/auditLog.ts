import { query } from '@/lib/server/db';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'settings_change'
  | 'tool_toggle'
  | 'user_update'
  | 'content_update'
  | 'system_action'
  | 'other';

export type AuditEntry = {
  id: string;
  timestamp: string;
  action: AuditAction;
  user_id: string;
  user_name: string;
  details: string;
};

const MEMORY_FALLBACK: AuditEntry[] = [];

let tableExists: boolean | null = null;

async function ensureTable(): Promise<boolean> {
  if (tableExists !== null) {
    return tableExists;
  }
  try {
    await query(
      `CREATE TABLE IF NOT EXISTS admin_audit_log (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        action TEXT NOT NULL,
        user_id TEXT NOT NULL DEFAULT '',
        user_name TEXT NOT NULL DEFAULT '',
        details TEXT NOT NULL DEFAULT ''
      )`,
    );
    await query(
      'CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON admin_audit_log (timestamp DESC)',
    );
    await query('CREATE INDEX IF NOT EXISTS idx_audit_log_action ON admin_audit_log (action)');
    tableExists = true;
    return true;
  } catch {
    tableExists = false;
    return false;
  }
}

export async function insertAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
  const hasTable = await ensureTable();
  if (hasTable) {
    try {
      await query(
        'INSERT INTO admin_audit_log (action, user_id, user_name, details) VALUES ($1, $2, $3, $4)',
        [entry.action, entry.user_id, entry.user_name, entry.details],
      );
      return;
    } catch {
      // fall through to memory
    }
  }
  MEMORY_FALLBACK.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  });
  if (MEMORY_FALLBACK.length > 500) {
    MEMORY_FALLBACK.length = 500;
  }
}

export type AuditQueryParams = {
  page: number;
  limit: number;
  action?: string | undefined;
};

export type AuditQueryResult = {
  entries: AuditEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function queryAuditLog(params: AuditQueryParams): Promise<AuditQueryResult> {
  const { page, limit, action } = params;
  const offset = (page - 1) * limit;

  const hasTable = await ensureTable();
  if (hasTable) {
    try {
      const whereClause = action ? 'WHERE action = $1' : '';
      const countParams = action ? [action] : [];
      const dataParams = action ? [action, limit, offset] : [limit, offset];

      const countResult = await query<{ count: string }>(
        `SELECT COUNT(*) as count FROM admin_audit_log ${whereClause}`,
        countParams,
      );
      const total = Number(countResult.rows[0]?.count ?? '0');

      const dataResult = await query<AuditEntry>(
        `SELECT id, timestamp::text, action, user_id, user_name, details
         FROM admin_audit_log ${whereClause}
         ORDER BY timestamp DESC
         LIMIT $${action ? 2 : 1} OFFSET $${action ? 3 : 2}`,
        dataParams,
      );

      return {
        entries: dataResult.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch {
      // fall through to memory
    }
  }

  let filtered = MEMORY_FALLBACK;
  if (action) {
    filtered = filtered.filter((e) => e.action === action);
  }
  const total = filtered.length;
  const entries = filtered.slice(offset, offset + limit);

  return {
    entries,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
