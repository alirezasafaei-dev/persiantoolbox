import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('admin financial truth contract', () => {
  it('reads financial records from production payment and subscription tables', () => {
    const storage = source('lib/server/monetizationDataStorage.ts');
    expect(storage).toContain('FROM payments p');
    expect(storage).toContain('FROM subscriptions s');
    expect(storage).toContain('LEFT JOIN payments p ON p.id = s.payment_id');
    expect(storage).not.toContain('FROM admin_payments');
    expect(storage).not.toContain('FROM admin_subscriptions');
  });

  it('uses the immutable ledger as fulfillment truth', () => {
    const storage = source('lib/server/monetizationDataStorage.ts');
    expect(storage).toContain('FROM payment_fulfillments f WHERE f.payment_id = p.id');
    expect(storage).toContain("'MISSING_FULFILLMENT_LEDGER'");
    expect(storage).toContain("? 'reconciliation_required'");
  });

  it('masks financial references before returning them to the browser', () => {
    const storage = source('lib/server/monetizationDataStorage.ts');
    expect(storage).toContain('maskFinancialReference(row.id)');
    expect(storage).toContain('maskFinancialReference(row.user_id)');
    expect(storage).toContain('maskFinancialReference(row.gateway_authority)');
    expect(storage).toContain('maskFinancialReference(row.gateway_ref_id)');
  });

  it('does not create or persist demo financial records', () => {
    const adminData = source('components/features/monetization/monetizationAdminData.ts');
    expect(adminData).toContain('Demo financial data is intentionally prohibited');
    expect(adminData).not.toContain('newPayments.push');
    expect(adminData).not.toContain('newSubs.push');
    expect(adminData).not.toContain('admin-payments.v1');
    expect(adminData).not.toContain('admin-subscriptions.v1');
  });

  it('hydrates dashboard state from the authenticated admin API response', () => {
    const client = source('lib/admin/monetizationApiClient.ts');
    expect(client).toContain('replaceCachedFinancialData');
    expect(client).toContain('subscriptions: payload.data.subscriptions');
    expect(client).toContain('payments: payload.data.payments');
    expect(client).toContain("cache: 'no-store'");
  });

  it('keeps financial cache references stable for the existing dashboard state', () => {
    const cache = source('lib/admin/financialDataCache.ts');
    expect(cache).toContain('subscriptions.splice');
    expect(cache).toContain('payments.splice');
    expect(cache).not.toContain('localStorage');
  });
});
