import { randomUUID } from 'node:crypto';
import { query } from './db';

export type HistoryEntry = {
  id: string;
  userId: string;
  tool: string;
  inputSummary: string;
  outputSummary: string;
  outputUrl?: string;
  createdAt: number;
};

type HistoryRow = {
  id: string;
  user_id: string;
  tool: string;
  input_summary: string;
  output_summary: string;
  output_url: string | null;
  created_at: number | string;
};

function mapHistory(row: HistoryRow): HistoryEntry {
  return {
    id: row.id,
    userId: row.user_id,
    tool: row.tool,
    inputSummary: row.input_summary,
    outputSummary: row.output_summary,
    ...(row.output_url ? { outputUrl: row.output_url } : {}),
    createdAt: Number(row.created_at),
  };
}

export async function addHistoryEntry(
  userId: string,
  data: Omit<HistoryEntry, 'id' | 'userId' | 'createdAt'>,
): Promise<HistoryEntry> {
  const entry: HistoryEntry = {
    id: randomUUID(),
    userId,
    createdAt: Date.now(),
    ...data,
  };
  await query(
    `INSERT INTO history_entries
     (id, user_id, tool, input_summary, output_summary, output_url, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      entry.id,
      entry.userId,
      entry.tool,
      entry.inputSummary,
      entry.outputSummary,
      entry.outputUrl ?? null,
      entry.createdAt,
    ],
  );
  return entry;
}

export async function listHistoryEntries(userId: string, limit = 50): Promise<HistoryEntry[]> {
  const result = await query<HistoryRow>(
    `SELECT id, user_id, tool, input_summary, output_summary, output_url, created_at
     FROM history_entries
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit],
  );
  return result.rows.map(mapHistory);
}

export async function clearHistory(userId: string): Promise<void> {
  await query('DELETE FROM history_entries WHERE user_id = $1', [userId]);
}
