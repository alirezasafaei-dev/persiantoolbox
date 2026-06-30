import { query } from '@/lib/server/db';

type AuditAction =
  | 'login'
  | 'logout'
  | 'settings_change'
  | 'tool_toggle'
  | 'user_update'
  | 'content_update'
  | 'system_action'
  | 'other';

type AuditEntry = {
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

type AuditQueryParams = {
  page: number;
  limit: number;
  action?: string | undefined;
  user?: string | undefined;
};

type AuditQueryResult = {
  entries: AuditEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function queryAuditLog(params: AuditQueryParams): Promise<AuditQueryResult> {
  const { page, limit, action, user } = params;
  const offset = (page - 1) * limit;

  const hasTable = await ensureTable();
  if (hasTable) {
    try {
      const conditions: string[] = [];
      const allParams: unknown[] = [];
      let paramIdx = 1;

      if (action) {
        conditions.push(`action = $${paramIdx}`);
        allParams.push(action);
        paramIdx++;
      }
      if (user) {
        conditions.push(`(user_name ILIKE $${paramIdx} OR user_id ILIKE $${paramIdx})`);
        allParams.push(`%${user}%`);
        paramIdx++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countResult = await query<{ count: string }>(
        `SELECT COUNT(*) as count FROM admin_audit_log ${whereClause}`,
        allParams,
      );
      const total = Number(countResult.rows[0]?.count ?? '0');

      const dataResult = await query<AuditEntry>(
        `SELECT id, timestamp::text, action, user_id, user_name, details
         FROM admin_audit_log ${whereClause}
         ORDER BY timestamp DESC
         LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
        [...allParams, limit, offset],
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
  if (user) {
    const q = user.toLowerCase();
    filtered = filtered.filter(
      (e) => e.user_name.toLowerCase().includes(q) || e.user_id.toLowerCase().includes(q),
    );
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
