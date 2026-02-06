import { randomUUID } from 'node:crypto';
import { query } from './db';
import { listHistoryEntries, type HistoryEntry } from './history';
import { normalizeShareExpiryHours } from '@/shared/history/share';

export type HistoryShareLink = {
  token: string;
  entryId: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  outputUrl: string | null;
};

type HistoryShareRow = {
  token: string;
  entry_id: string;
  user_id: string;
  created_at: number | string;
  expires_at: number | string;
  output_url: string | null;
};

function mapHistoryShareRow(row: HistoryShareRow): HistoryShareLink {
  return {
    token: row.token,
    entryId: row.entry_id,
    userId: row.user_id,
    createdAt: Number(row.created_at),
    expiresAt: Number(row.expires_at),
    outputUrl: row.output_url ?? null,
  };
}

export async function createHistoryShareLink(
  userId: string,
  entryId: string,
  expiresInHours?: number,
): Promise<{ link: HistoryShareLink; entry: HistoryEntry } | null> {
  const entries = await listHistoryEntries(userId, 1000);
  const entry = entries.find((item) => item.id === entryId);
  if (!entry?.outputUrl || entry.outputUrl === '') {
    return null;
  }

  const token = randomUUID();
  const createdAt = Date.now();
  const hours = normalizeShareExpiryHours(expiresInHours);
  const expiresAt = createdAt + hours * 60 * 60 * 1000;

  const result = await query<HistoryShareRow>(
    `INSERT INTO history_share_links
     (token, entry_id, user_id, created_at, expires_at, output_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING token, entry_id, user_id, created_at, expires_at, output_url`,
    [token, entry.id, userId, createdAt, expiresAt, entry.outputUrl],
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    link: mapHistoryShareRow(row),
    entry,
  };
}

export async function getHistoryShareLink(token: string): Promise<HistoryShareLink | null> {
  const result = await query<HistoryShareRow>(
    `SELECT token, entry_id, user_id, created_at, expires_at, output_url
     FROM history_share_links
     WHERE token = $1
     LIMIT 1`,
    [token],
  );
  const row = result.rows[0];
  return row ? mapHistoryShareRow(row) : null;
}
