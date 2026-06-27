/**
 * Migration: Add export credit metering tables
 */

import { query } from '../db';

export async function up() {
  await query(`
    CREATE TABLE IF NOT EXISTS export_credits (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL UNIQUE,
      plan_id TEXT NOT NULL DEFAULT 'free',
      monthly_used INTEGER NOT NULL DEFAULT 0,
      monthly_limit INTEGER NOT NULL DEFAULT 0,
      daily_used INTEGER NOT NULL DEFAULT 0,
      daily_limit INTEGER NOT NULL DEFAULT 0,
      monthly_reset_at BIGINT NOT NULL DEFAULT 0,
      daily_reset_at BIGINT NOT NULL DEFAULT 0,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
      updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_export_credits_user ON export_credits(user_id)
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS export_transactions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL,
      product TEXT NOT NULL,
      credit_cost INTEGER NOT NULL DEFAULT 1,
      export_type TEXT NOT NULL DEFAULT 'clean',
      status TEXT NOT NULL DEFAULT 'reserved',
      completed_at BIGINT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_export_tx_user ON export_transactions(user_id)
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_export_tx_created ON export_transactions(created_at)
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_export_tx_status ON export_transactions(status)
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_export_tx_user_product ON export_transactions(user_id, product, status)
  `);

  console.log('Export credit metering tables created successfully');
}

export async function down() {
  await query('DROP TABLE IF EXISTS export_transactions');
  await query('DROP TABLE IF EXISTS export_credits');
  console.log('Export credit metering tables dropped');
}
