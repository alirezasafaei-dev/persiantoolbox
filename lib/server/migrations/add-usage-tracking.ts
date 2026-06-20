/**
 * Migration: Add usage tracking table
 */

import { query } from '../db';

export async function up() {
  await query(`
    CREATE TABLE IF NOT EXISTS usage_tracking (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tool_id TEXT NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD format
      count INTEGER NOT NULL DEFAULT 0,
      last_used_at BIGINT NOT NULL,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
      updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
      CONSTRAINT unique_user_tool_date UNIQUE (user_id, tool_id, date)
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id)
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_usage_tracking_tool_id ON usage_tracking(tool_id)
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_usage_tracking_date ON usage_tracking(date)
  `);

  console.log('Usage tracking table created successfully');
}

export async function down() {
  await query('DROP TABLE IF EXISTS usage_tracking');
  console.log('Usage tracking table dropped successfully');
}
