import { describe, expect, it } from 'vitest';
import {
  EXPORT_PRODUCTS,
  getCleanExportCreditCost,
  getExportProductConfig,
  isExportProduct,
  type ExportProduct,
} from '@/lib/export-products';

describe('Export products', () => {
  it('includes exact paid product IDs for professional tools', () => {
    expect(EXPORT_PRODUCTS).toEqual([
      'business',
      'career',
      'writing',
      'formal-letter',
      'work-certificate',
      'employment-contract',
      'lease-agreement',
      'sale-agreement',
      'salon-contract',
      'vehicle-sale',
    ]);
  });

  it('accepts new product IDs and rejects unknown IDs', () => {
    expect(isExportProduct('formal-letter')).toBe(true);
    expect(isExportProduct('work-certificate')).toBe(true);
    expect(isExportProduct('employment-contract')).toBe(true);
    expect(isExportProduct('lease-agreement')).toBe(true);
    expect(isExportProduct('sale-agreement')).toBe(true);
    expect(isExportProduct('salon-contract')).toBe(true);
    expect(isExportProduct('vehicle-sale')).toBe(true);
    expect(isExportProduct('invoice-content')).toBe(false);
  });

  it('marks legal products with required disclaimer copy', () => {
    const legalProducts: ExportProduct[] = [
      'employment-contract',
      'lease-agreement',
      'sale-agreement',
      'salon-contract',
      'vehicle-sale',
    ];

    for (const product of legalProducts) {
      const config = getExportProductConfig(product);
      expect(config.group).toBe('legal');
      expect(config.legalDisclaimerRequired).toBe(true);
    }
  });

  it('keeps low-risk administrative products at one clean-export credit', () => {
    expect(getExportProductConfig('formal-letter').cleanExportCredits).toBe(1);
    expect(getExportProductConfig('work-certificate').cleanExportCredits).toBe(1);
  });

  it('charges two credits for legal clean exports', () => {
    expect(getCleanExportCreditCost('lease-agreement')).toBe(2);
    expect(getCleanExportCreditCost('formal-letter')).toBe(1);
    expect(getCleanExportCreditCost('unknown-product')).toBe(1);
  });
});
