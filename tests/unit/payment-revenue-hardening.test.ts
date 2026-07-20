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
    const paymentSource = source('lib/payments/payment-integration.ts');
    expect(paymentSource).toContain("process.env['NODE_ENV'] === 'production'");
    expect(paymentSource).toContain("throw new Error('PAYMENT_GATEWAY_NOT_CONFIGURED')");
    expect(paymentSource).toContain("merchantId ? 'zarinpal' : 'mock'");
  });

  it('does not trust callback Amount for gateway verification', () => {
    const paymentSource = source('lib/payments/payment-integration.ts');
    expect(paymentSource).toContain('const amountRial = tomanToRial(payment.amount)');
    expect(paymentSource).toContain('Amount: String(amountRial)');
    expect(paymentSource).toContain('Authority: rawAuthority');
  });

  it('marks checkout rows failed when gateway creation throws', () => {
    const paymentSource = source('lib/payments/payment-integration.ts');
    expect(paymentSource).toContain(
      'UPDATE payments SET status = $1, failure_code = $2, failure_message = $3',
    );
    expect(paymentSource).toContain("'failed'");
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
  });

  it('rejects malformed webhook signatures without timingSafeEqual length errors', () => {
    const webhookSource = source('app/api/subscription/webhook/route.ts');
    expect(webhookSource).toContain('/^[a-f0-9]{64}$/i.test(signature)');
    expect(webhookSource).toContain('provided.length === expected.length');
    expect(webhookSource).toContain('timingSafeEqual(provided, expected)');
  });

  it('keeps the production migration atomic and duplicate-safe', () => {
    const migrationSource = source('scripts/db/migrate-payment-hardening.sql');
    expect(migrationSource).toContain('BEGIN;');
    expect(migrationSource).toContain('COMMIT;');
    expect(migrationSource).toContain("regexp_replace(gateway_authority, '^zarinpal_', '')");
    expect(migrationSource).toContain('Duplicate gateway_authority values detected');
    expect(migrationSource).toContain('subscriptions_payment_id_fkey');
  });
});
