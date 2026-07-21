import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizeZarinpalAuthority, tomanToRial } from '@/lib/payments/payment-integration';

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('payment revenue hardening', () => {
  it('converts Toman to IRR exactly once', () => {
    expect(tomanToRial(49_000)).toBe(490_000);
    expect(() => tomanToRial(0)).toThrow(/positive integer/i);
    expect(() => tomanToRial(1.5)).toThrow(/positive integer/i);
  });

  it('normalizes both raw and prefixed Zarinpal authorities', () => {
    expect(normalizeZarinpalAuthority('A000000000000000000000000000001')).toBe(
      'A000000000000000000000000000001',
    );
    expect(normalizeZarinpalAuthority('zarinpal_A000000000000000000000000000001')).toBe(
      'A000000000000000000000000000001',
    );
  });

  it('fails closed when production credentials are absent', () => {
    const integrationSource = source('lib/payments/payment-integration.ts');
    const verificationSource = source('lib/payments/payment-verification.ts');
    for (const paymentSource of [integrationSource, verificationSource]) {
      expect(paymentSource).toContain("process.env['NODE_ENV'] === 'production'");
      expect(paymentSource).toContain("throw new Error('PAYMENT_GATEWAY_NOT_CONFIGURED')");
      expect(paymentSource).toContain("merchantId ? 'zarinpal' : 'mock'");
    }
  });

  it('does not trust callback Amount for gateway verification', () => {
    const verificationSource = source('lib/payments/payment-verification.ts');
    expect(verificationSource).toContain('amountIrr = resolveGatewayAmountIrr(initialRow)');
    expect(verificationSource).toContain('Amount: String(amountIrr)');
    expect(verificationSource).toContain('Authority: authority');
    expect(verificationSource).not.toContain("payload['Amount']");
  });

  it('performs gateway network verification before opening the fulfillment transaction', () => {
    const verificationSource = source('lib/payments/payment-verification.ts');
    const callbackFunction = verificationSource.slice(
      verificationSource.indexOf('export async function verifyPaymentCallback'),
    );
    expect(callbackFunction.indexOf('await adapter.verifyCallback')).toBeGreaterThan(-1);
    expect(callbackFunction.indexOf('await adapter.verifyCallback')).toBeLessThan(
      callbackFunction.indexOf('await finalizeSuccessfulVerification'),
    );
    expect(callbackFunction).not.toContain('FOR UPDATE');
  });

  it('re-locks and revalidates payment invariants before completion', () => {
    const verificationSource = source('lib/payments/payment-verification.ts');
    expect(verificationSource).toContain('SELECT ${PAYMENT_SELECT} FROM payments WHERE id = $1 FOR UPDATE');
    expect(verificationSource).toContain("'AUTHORITY_CHANGED'");
    expect(verificationSource).toContain("'AMOUNT_CHANGED'");
    expect(verificationSource).toContain("'REFERENCE_CONFLICT'");
    expect(verificationSource).toContain('Payment gateway mismatch');
  });

  it('uses UUID subscription ids and an immutable fulfillment ledger', () => {
    const verificationSource = source('lib/payments/payment-verification.ts');
    const webhookSource = source('app/api/subscription/webhook/route.ts');
    expect(verificationSource).toContain('subscriptionId = randomUUID()');
    expect(webhookSource).toContain('subscriptionId = randomUUID()');
    expect(verificationSource).not.toContain('`sub_${randomUUID()}`');
    expect(webhookSource).not.toContain('`sub_${randomUUID()}`');
    expect(verificationSource).toContain('FROM payment_fulfillments WHERE payment_id = $1');
    expect(verificationSource).toContain('INSERT INTO payment_fulfillments');
    expect(webhookSource).toContain('INSERT INTO payment_fulfillments');
  });

  it('marks missing historical fulfillment links for explicit reconciliation', () => {
    const verificationSource = source('lib/payments/payment-verification.ts');
    expect(verificationSource).toContain("'MISSING_FULFILLMENT_LEDGER'");
    expect(verificationSource).toContain('Payment requires explicit fulfillment reconciliation');
    expect(verificationSource).not.toContain('return handleAlreadyProcessed(row)');
  });

  it('marks checkout rows failed when gateway creation throws', () => {
    const paymentSource = source('lib/payments/payment-integration.ts');
    expect(paymentSource).toContain(
      'UPDATE payments SET status = $1, failure_code = $2, failure_message = $3',
    );
    expect(paymentSource).toContain("'failed'");
  });

  it('blocks generic client-priced checkout', () => {
    const checkoutSource = source('app/api/payments/checkout/route.ts');
    expect(checkoutSource).toContain('SERVER_PRICED_CHECKOUT_REQUIRED');
    expect(checkoutSource).toContain('{ status: 410 }');
    expect(checkoutSource).not.toContain('createPaymentCheckout(');
    expect(checkoutSource).not.toContain('request.json()');
  });

  it('persists server-resolved subscription price terms', () => {
    const checkoutSource = source('app/api/subscription/checkout/route.ts');
    expect(checkoutSource).toContain('plan.price');
    expect(checkoutSource).toContain('periodDays: plan.periodDays');
    expect(checkoutSource).toContain("priceSource: 'server-pricing'");
  });

  it('makes production readiness depend on payment configuration', () => {
    const healthSource = source('app/api/health/route.ts');
    expect(healthSource).toContain('const ready = database.ok && redis.ok && paymentGateway.ok');
    expect(healthSource).toContain("isFeatureEnabled('checkout')");
    expect(healthSource).toContain('redisHealthCheck');
  });

  it('checks payment ownership before user-facing subscription confirmation', () => {
    const confirmSource = source('app/api/subscription/confirm/route.ts');
    expect(confirmSource).toContain('await getPaymentByAuthority(authority)');
    expect(confirmSource).toContain('payment.userId !== user.id');
    expect(confirmSource.indexOf('payment.userId !== user.id')).toBeLessThan(
      confirmSource.indexOf('verifyPaymentCallback(gatewayAuthority'),
    );
    expect(confirmSource).toContain("from '@/lib/payments/payment-verification'");
  });

  it('routes provider callbacks through the lock-safe verifier', () => {
    const callbackSource = source('app/api/payments/callback/route.ts');
    expect(callbackSource).toContain("from '@/lib/payments/payment-verification'");
    expect(callbackSource).not.toContain("from '@/lib/payments/payment-integration'");
    expect(callbackSource).not.toContain('result.error ??');
  });

  it('rejects malformed webhook signatures and prevents Zarinpal bypass', () => {
    const webhookSource = source('app/api/subscription/webhook/route.ts');
    expect(webhookSource).toContain('/^[a-f0-9]{64}$/i.test(signature)');
    expect(webhookSource).toContain('provided.length === expected.length');
    expect(webhookSource).toContain('timingSafeEqual(provided, expected)');
    expect(webhookSource).toContain("process.env['PAYMENT_WEBHOOK_ENABLED'] === 'true'");
    expect(webhookSource).toContain("payment.gatewayName === 'zarinpal'");
  });

  it('bounds every Zarinpal request with a timeout', () => {
    const adapterSource = source('shared/packages/payments/src/adapters/zarinpal.ts');
    expect(adapterSource).toContain('const REQUEST_TIMEOUT_MS = 10_000');
    expect(adapterSource).toContain('signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)');
    expect(adapterSource).toContain('Invalid server-resolved amount');
  });

  it('keeps the production migration atomic and fulfillment-ledger safe', () => {
    const migrationSource = source('scripts/db/migrate-payment-hardening.sql');
    expect(migrationSource).toContain('BEGIN;');
    expect(migrationSource).toContain('COMMIT;');
    expect(migrationSource).toContain("regexp_replace(gateway_authority, '^zarinpal_', '')");
    expect(migrationSource).toContain('Duplicate gateway_authority values detected');
    expect(migrationSource).toContain('Duplicate subscriptions.payment_id values detected');
    expect(migrationSource).toContain('subscriptions_payment_id_fkey');
    expect(migrationSource).toContain('CREATE TABLE IF NOT EXISTS payment_fulfillments');
    expect(migrationSource).toContain('ON CONFLICT (payment_id) DO NOTHING');
  });
});
