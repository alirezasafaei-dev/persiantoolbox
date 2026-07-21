#!/usr/bin/env node
/**
 * Payment reconciliation — dry-run by default.
 *
 * Read-only:
 *   pnpm payments:reconcile
 *   pnpm payments:reconcile --dry-run
 *
 * Targeted repair after an operator has independently confirmed that the
 * entitlement is truly missing:
 *   pnpm payments:reconcile --apply --payment-id=<uuid> --confirm-entitlement-missing
 */

import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

const APPLY = process.argv.includes('--apply');
const CONFIRMED_MISSING = process.argv.includes('--confirm-entitlement-missing');
const TARGET_PAYMENT_ID = process.argv.find((arg) => arg.startsWith('--payment-id='))?.split('=')[1];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function log(level, message, data = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, message, ...data }));
}

function mask(value) {
  if (!value) return null;
  const text = String(value);
  return `${text.slice(0, 6)}••••${text.slice(-4)}`;
}

function parseMetadata(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

async function repairOne(client, paymentId) {
  await client.query('BEGIN');
  try {
    const paymentResult = await client.query(
      `SELECT id, user_id, status, metadata, completed_at, gateway_ref_id
       FROM payments WHERE id = $1 FOR UPDATE`,
      [paymentId],
    );
    const payment = paymentResult.rows[0];
    if (!payment) throw new Error('Payment not found');
    if (!['completed', 'reconciliation_required'].includes(payment.status)) {
      throw new Error(`Payment state ${payment.status} is not eligible for fulfillment repair`);
    }

    const fulfillmentResult = await client.query(
      'SELECT payment_id, subscription_id FROM payment_fulfillments WHERE payment_id = $1',
      [paymentId],
    );
    if (fulfillmentResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return { outcome: 'already_fulfilled', subscriptionId: fulfillmentResult.rows[0].subscription_id };
    }

    const metadata = parseMetadata(payment.metadata);
    const planId = typeof metadata.planId === 'string' ? metadata.planId : null;
    if (!planId) throw new Error('Payment metadata does not contain a subscription planId');

    const parsedPeriodDays = Number(metadata.periodDays ?? 30);
    const periodDays =
      Number.isSafeInteger(parsedPeriodDays) && parsedPeriodDays > 0 && parsedPeriodDays <= 366
        ? parsedPeriodDays
        : 30;
    const now = Date.now();
    const durationMs = periodDays * 24 * 60 * 60 * 1000;

    const activeResult = await client.query(
      `SELECT id, plan_id, expires_at
       FROM subscriptions
       WHERE user_id = $1 AND status = 'active' AND expires_at > $2
       ORDER BY expires_at DESC LIMIT 1 FOR UPDATE`,
      [payment.user_id, now],
    );
    const active = activeResult.rows[0];
    let subscriptionId;

    if (active?.plan_id === planId) {
      subscriptionId = active.id;
      await client.query(
        'UPDATE subscriptions SET expires_at = $1, payment_id = $2 WHERE id = $3',
        [Math.max(Number(active.expires_at), now) + durationMs, paymentId, active.id],
      );
    } else {
      if (active) {
        await client.query(
          "UPDATE subscriptions SET status = 'canceled' WHERE user_id = $1 AND status = 'active'",
          [payment.user_id],
        );
      }
      subscriptionId = randomUUID();
      await client.query(
        `INSERT INTO subscriptions (id, user_id, plan_id, status, started_at, expires_at, payment_id)
         VALUES ($1, $2, $3, 'active', $4, $5, $6)`,
        [subscriptionId, payment.user_id, planId, now, now + durationMs, paymentId],
      );
    }

    await client.query(
      `INSERT INTO payment_fulfillments
         (payment_id, subscription_id, fulfillment_type, fulfilled_at, metadata)
       VALUES ($1, $2, 'subscription', $3, $4)`,
      [
        paymentId,
        subscriptionId,
        now,
        JSON.stringify({ planId, periodDays, source: 'manual-reconciliation' }),
      ],
    );
    await client.query(
      `UPDATE payments
       SET status = 'completed', failure_code = NULL, failure_message = NULL
       WHERE id = $1`,
      [paymentId],
    );
    await client.query('COMMIT');
    return { outcome: 'repaired', subscriptionId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function run() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  if (APPLY) {
    if (!TARGET_PAYMENT_ID || !UUID_PATTERN.test(TARGET_PAYMENT_ID)) {
      throw new Error('--apply requires a valid --payment-id=<uuid>');
    }
    if (!CONFIRMED_MISSING) {
      throw new Error('--apply requires --confirm-entitlement-missing after manual verification');
    }
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    log('INFO', 'Reconciliation started', {
      mode: APPLY ? 'targeted-apply' : 'dry-run',
      paymentId: TARGET_PAYMENT_ID ? mask(TARGET_PAYMENT_ID) : undefined,
    });

    const orphanedResult = await client.query(
      `SELECT p.id, p.user_id, p.amount, p.status, p.metadata, p.completed_at,
              p.gateway_authority, p.gateway_ref_id
       FROM payments p
       WHERE p.status IN ('completed', 'reconciliation_required')
         AND p.metadata->>'planId' IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM payment_fulfillments f WHERE f.payment_id = p.id
         )
       ORDER BY COALESCE(p.completed_at, p.created_at) DESC
       LIMIT 100`,
    );
    log('INFO', 'Payments missing fulfillment ledger', { count: orphanedResult.rows.length });
    for (const row of orphanedResult.rows) {
      const metadata = parseMetadata(row.metadata);
      log('WARN', 'missing_fulfillment', {
        paymentId: mask(row.id),
        userId: mask(row.user_id),
        amount: row.amount,
        status: row.status,
        planId: metadata.planId,
        authority: mask(row.gateway_authority),
        referenceId: mask(row.gateway_ref_id),
      });
    }

    const stalePending = await client.query(
      `SELECT id, user_id, amount, created_at, gateway_authority
       FROM payments
       WHERE status = 'pending' AND created_at < $1
       ORDER BY created_at ASC LIMIT 100`,
      [Date.now() - 24 * 60 * 60 * 1000],
    );
    log('INFO', 'Stale pending payments (>24h)', { count: stalePending.rows.length });

    const duplicateAuthorities = await client.query(
      `SELECT gateway_authority, COUNT(*) AS count, array_agg(id) AS ids
       FROM payments WHERE gateway_authority IS NOT NULL
       GROUP BY gateway_authority HAVING COUNT(*) > 1 LIMIT 50`,
    );
    log('INFO', 'Duplicate gateway authorities', { count: duplicateAuthorities.rows.length });

    const duplicateReferences = await client.query(
      `SELECT gateway_ref_id, COUNT(*) AS count, array_agg(id) AS ids
       FROM payments WHERE gateway_ref_id IS NOT NULL
       GROUP BY gateway_ref_id HAVING COUNT(*) > 1 LIMIT 50`,
    );
    log('INFO', 'Duplicate gateway references', { count: duplicateReferences.rows.length });

    const failedResult = await client.query(
      `SELECT id, amount, failure_code, failure_message, created_at
       FROM payments WHERE status = 'failed'
       ORDER BY created_at DESC LIMIT 50`,
    );
    log('INFO', 'Recent failed payments', { count: failedResult.rows.length });

    const reconciliationResult = await client.query(
      `SELECT id, amount, failure_code, failure_message, created_at
       FROM payments WHERE status = 'reconciliation_required'
       ORDER BY created_at DESC LIMIT 50`,
    );
    log('INFO', 'Reconciliation-required payments', {
      count: reconciliationResult.rows.length,
    });

    if (APPLY && TARGET_PAYMENT_ID) {
      const result = await repairOne(client, TARGET_PAYMENT_ID);
      log('INFO', 'Targeted reconciliation finished', {
        paymentId: mask(TARGET_PAYMENT_ID),
        outcome: result.outcome,
        subscriptionId: mask(result.subscriptionId),
      });
    } else {
      log('INFO', 'Dry run complete — no changes made');
    }

    log('INFO', 'Reconciliation summary', {
      missingFulfillment: orphanedResult.rows.length,
      stalePending: stalePending.rows.length,
      duplicateAuthority: duplicateAuthorities.rows.length,
      duplicateReference: duplicateReferences.rows.length,
      failed: failedResult.rows.length,
      reconciliationRequired: reconciliationResult.rows.length,
    });
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  log('ERROR', 'Reconciliation failed', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
