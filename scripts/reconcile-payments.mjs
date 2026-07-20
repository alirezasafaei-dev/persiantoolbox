#!/usr/bin/env node
/**
 * Payment Reconciliation Script - PersianToolbox
 *
 * Finds payments that need attention:
 *   - completed payments without linked subscription
 *   - old pending payments
 *   - duplicate authorities or ref_ids
 *   - failed payments
 *   - reconciliation_required payments
 *
 * Usage:
 *   node scripts/reconcile-payments.mjs --dry-run          (default, read-only)
 *   node scripts/reconcile-payments.mjs --apply --payment-id=<id>  (fix one payment)
 *   node scripts/reconcile-payments.mjs --apply            (fix all — USE WITH CAUTION)
 *
 * Environment:
 *   DATABASE_URL  — PostgreSQL connection string (required)
 */

import { Client } from 'pg';

const DRY_RUN = !process.argv.includes('--apply');
const TARGET_PAYMENT_ID = process.argv.find((a) => a.startsWith('--payment-id='))?.split('=')[1];

function log(level, message, data) {
  const entry = { ts: new Date().toISOString(), level, message, ...data };
  console.log(JSON.stringify(entry));
}

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  log('INFO', 'Reconciliation started', { mode: DRY_RUN ? 'dry-run' : 'apply' });

  // 1. Completed payments without linked subscription (when planId was in metadata)
  const orphanedResult = await client.query(`
    SELECT p.id, p.user_id, p.amount, p.status, p.metadata, p.completed_at,
           p.gateway_authority, p.gateway_ref_id
    FROM payments p
    WHERE p.status = 'completed'
      AND p.metadata->>'planId' IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM subscriptions s WHERE s.payment_id = p.id
      )
    ORDER BY p.completed_at DESC
    LIMIT 50
  `);
  log('INFO', 'Completed payments without subscription', { count: orphanedResult.rows.length });
  for (const row of orphanedResult.rows) {
    log('WARN', '  orphan_payment', {
      paymentId: row.id,
      userId: row.user_id,
      amount: row.amount,
      planId: row.metadata?.planId,
      completedAt: row.completed_at,
      authority: row.gateway_authority ? `${String(row.gateway_authority).slice(0, 6)}...` : null,
    });

    if (!DRY_RUN && TARGET_PAYMENT_ID && row.id === TARGET_PAYMENT_ID) {
      // Create the missing subscription
      const { randomUUID } = await import('node:crypto');
      const planId = row.metadata?.planId;
      if (planId) {
        const now = Date.now();
        const subId = `sub_${randomUUID()}`;
        const endDate = now + 30 * 24 * 60 * 60 * 1000;
        await client.query(
          `INSERT INTO subscriptions (id, user_id, plan_id, status, started_at, expires_at, payment_id)
           VALUES ($1, $2, $3, 'active', $4, $5, $6)`,
          [subId, row.user_id, planId, now, endDate, row.id],
        );
        log('INFO', '  → Created missing subscription', { subId, paymentId: row.id });
      }
    }
  }

  // 2. Old pending payments (>24h)
  const stalePending = await client.query(`
    SELECT id, user_id, amount, status, created_at, gateway_authority
    FROM payments
    WHERE status = 'pending'
      AND created_at < EXTRACT(EPOCH FROM NOW())::bigint - 86400
    ORDER BY created_at ASC
    LIMIT 50
  `);
  log('INFO', 'Stale pending payments (>24h)', { count: stalePending.rows.length });
  for (const row of stalePending.rows) {
    const ageHours = Math.round((Date.now() / 1000 - row.created_at) / 3600);
    log('WARN', '  stale_pending', {
      paymentId: row.id,
      userId: row.user_id,
      amount: row.amount,
      ageHours,
      authority: row.gateway_authority ? `${String(row.gateway_authority).slice(0, 6)}...` : null,
    });
  }

  // 3. Duplicate authorities
  const dupAuthResult = await client.query(`
    SELECT gateway_authority, COUNT(*) AS cnt, array_agg(id) AS ids
    FROM payments
    WHERE gateway_authority IS NOT NULL
    GROUP BY gateway_authority
    HAVING COUNT(*) > 1
    LIMIT 20
  `);
  log('INFO', 'Duplicate gateway_authority', { count: dupAuthResult.rows.length });
  for (const row of dupAuthResult.rows) {
    log('WARN', '  duplicate_authority', {
      authority: `${String(row.gateway_authority).slice(0, 8)}...`,
      count: row.cnt,
      paymentIds: row.ids,
    });
  }

  // 4. Duplicate ref_ids
  const dupRefResult = await client.query(`
    SELECT gateway_ref_id, COUNT(*) AS cnt, array_agg(id) AS ids
    FROM payments
    WHERE gateway_ref_id IS NOT NULL
    GROUP BY gateway_ref_id
    HAVING COUNT(*) > 1
    LIMIT 20
  `);
  log('INFO', 'Duplicate gateway_ref_id', { count: dupRefResult.rows.length });
  for (const row of dupRefResult.rows) {
    log('WARN', '  duplicate_ref_id', {
      refId: `${String(row.gateway_ref_id).slice(0, 8)}...`,
      count: row.cnt,
      paymentIds: row.ids,
    });
  }

  // 5. Failed payments
  const failedResult = await client.query(`
    SELECT id, user_id, amount, failure_code, failure_message, created_at
    FROM payments
    WHERE status = 'failed'
    ORDER BY created_at DESC
    LIMIT 20
  `);
  log('INFO', 'Recent failed payments', { count: failedResult.rows.length });
  for (const row of failedResult.rows) {
    log('WARN', '  failed', {
      paymentId: row.id,
      amount: row.amount,
      code: row.failure_code,
      message: row.failure_message ? String(row.failure_message).slice(0, 100) : null,
    });
  }

  // 6. Reconciliation required
  const reconResult = await client.query(`
    SELECT id, user_id, amount, failure_code, failure_message, created_at
    FROM payments
    WHERE status = 'reconciliation_required'
    ORDER BY created_at DESC
    LIMIT 20
  `);
  log('INFO', 'Reconciliation required payments', { count: reconResult.rows.length });
  for (const row of reconResult.rows) {
    log('WARN', '  reconciliation_required', {
      paymentId: row.id,
      amount: row.amount,
      code: row.failure_code,
      message: row.failure_message ? String(row.failure_message).slice(0, 100) : null,
    });
  }

  // Summary
  const summary = {
    orphaned: orphanedResult.rows.length,
    stalePending: stalePending.rows.length,
    duplicateAuthority: dupAuthResult.rows.length,
    duplicateRefId: dupRefResult.rows.length,
    failed: failedResult.rows.length,
    reconciliationRequired: reconResult.rows.length,
  };
  log('INFO', 'Reconciliation summary', summary);

  if (DRY_RUN) {
    log('INFO', 'Dry run complete — no changes made');
  } else {
    log('INFO', 'Apply complete');
  }

  await client.end();
}

run().catch((error) => {
  log('ERROR', 'Reconciliation failed', { error: error.message });
  process.exit(1);
});
