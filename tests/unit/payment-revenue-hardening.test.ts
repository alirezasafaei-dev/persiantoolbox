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
      'UPDATE payments SET status = $1 WHERE id = $2 AND status = $3',
    );
    expect(paymentSource).toContain("'failed'");
  });

  it('makes production readiness depend on payment configuration', () => {
    const healthSource = source('app/api/health/route.ts');
    expect(healthSource).toContain('const ready = database.ok && redis.ok && paymentGateway.ok');
    expect(healthSource).toContain("isFeatureEnabled('checkout')");
    expect(healthSource).toContain('redisHealthCheck');
  });
});
