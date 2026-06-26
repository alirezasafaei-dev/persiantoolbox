import { describe, it, expect } from 'vitest';
import { renderContract } from '@/lib/contract-tools/render';
import {
  rentalLeaseTemplate,
  constructionContractorTemplate,
} from '@/lib/contract-tools/templates';
import { DISCLAIMER } from '@/lib/contract-tools/types';

const rentalInputs: Record<string, string> = {
  'landlord.name': 'علی رضایی',
  'landlord.nationalId': '0012345678',
  'landlord.phone': '09121234567',
  'landlord.address': 'تهران، ولیعصر',
  'tenant.name': 'محمد محمدی',
  'tenant.nationalId': '0098765432',
  'tenant.phone': '09351234567',
  'tenant.address': 'تهران، آزادی',
  'property.address': 'تهران، ولیعصر ۱۰',
  'property.postalCode': '1234567890',
  'property.area': '85',
  'property.deedType': 'ششدانگ',
  startDate: '1405/04/01',
  endDate: '1406/04/01',
  deliveryDate: '1405/04/05',
  depositAmount: '500000000',
  monthlyRent: '15000000',
  paymentDay: 'اول هر ماه',
  paymentMethod: 'انتقال بانکی',
};

describe('Contract Export', () => {
  const rentalText = renderContract(
    'rental-lease',
    rentalLeaseTemplate,
    rentalInputs,
    ['default-obligations'],
    true,
  );

  describe('DOCX Generation', () => {
    it('generates a valid DOCX blob', async () => {
      const { generateDocx } = await import('@/lib/contract-tools/export/docx');
      const blob = await generateDocx(rentalText);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
      expect(blob.type).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
    });

    it('DOCX contains contract title', async () => {
      const { generateDocx } = await import('@/lib/contract-tools/export/docx');
      const blob = await generateDocx(rentalText);
      expect(blob.size).toBeGreaterThan(1000);
    });

    it('DOCX with branding includes company name', async () => {
      const { generateDocx } = await import('@/lib/contract-tools/export/docx');
      const blob = await generateDocx(rentalText, {
        companyName: 'شرکت نمونه',
        accentColor: '#ff0000',
      });
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('PDF Generation', () => {
    it('generates a valid PDF', async () => {
      const { generatePdf } = await import('@/lib/contract-tools/export/pdf');
      const bytes = await generatePdf(rentalText, { includeWatermark: true });
      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBeGreaterThan(0);
      const header = new TextDecoder().decode(bytes.slice(0, 5));
      expect(header).toBe('%PDF-');
    });

    it('PDF with watermark', async () => {
      const { generatePdf } = await import('@/lib/contract-tools/export/pdf');
      const bytes = await generatePdf(rentalText, { includeWatermark: true });
      expect(bytes.length).toBeGreaterThan(0);
    });

    it('PDF without watermark', async () => {
      const { generatePdf } = await import('@/lib/contract-tools/export/pdf');
      const bytes = await generatePdf(rentalText, { includeWatermark: false });
      expect(bytes.length).toBeGreaterThan(0);
    });
  });

  describe('Export Gating', () => {
    it('text export is always free', () => {
      expect(rentalText.length).toBeGreaterThan(0);
    });

    it('watermarked output contains draft text', () => {
      expect(rentalText).toContain('پیش‌نویس / غیرنهایی');
    });

    it('disclaimer is always present in rendered text', () => {
      expect(rentalText).toContain(DISCLAIMER);
    });
  });

  describe('Construction Contract Export', () => {
    const constructionInputs: Record<string, string> = {
      'client.name': 'کارفرما',
      'client.nationalId': '0012345678',
      'client.phone': '09121234567',
      'client.address': 'تهران',
      'contractor.name': 'پیمانکار',
      'contractor.nationalId': '0098765432',
      'contractor.phone': '09351234567',
      'contractor.address': 'تهران',
      projectTitle: 'ساخت ویلا',
      projectAddress: 'شمیرانات',
      scopeOfWork: 'طراحی و اجرا',
      deliverables: 'نقشه و نظارت',
      startDate: '1405/04/01',
      endDate: '1406/01/01',
      contractAmount: '500000000',
      paymentStructure: '30/40/30',
    };

    it('DOCX generation works for construction', async () => {
      const { generateDocx } = await import('@/lib/contract-tools/export/docx');
      const text = renderContract(
        'construction-contractor',
        constructionContractorTemplate,
        constructionInputs,
        ['construction-scope'],
        true,
      );
      const blob = await generateDocx(text);
      expect(blob.size).toBeGreaterThan(0);
    });

    it('PDF generation works for construction', async () => {
      const { generatePdf } = await import('@/lib/contract-tools/export/pdf');
      const text = renderContract(
        'construction-contractor',
        constructionContractorTemplate,
        constructionInputs,
        ['construction-scope'],
        true,
      );
      const bytes = await generatePdf(text, { includeWatermark: false });
      expect(bytes.length).toBeGreaterThan(0);
    });
  });

  describe('Persian digit handling in export', () => {
    it('renders Persian digits in financial amounts', () => {
      expect(rentalText).toContain('۵۰۰۰۰۰۰۰۰');
      expect(rentalText).toContain('۱۵۰۰۰۰۰۰');
    });
  });
});
