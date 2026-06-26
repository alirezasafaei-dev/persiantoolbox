import { describe, it, expect } from 'vitest';
import { renderContract, hashText } from '@/lib/contract-tools/render';
import {
  rentalLeaseTemplate,
  constructionContractorTemplate,
  getTemplate,
  getAllTemplates,
} from '@/lib/contract-tools/templates';
import {
  DISCLAIMER,
  DRAFT_WATERMARK,
  validateRentalLease,
  validateConstructionContractor,
} from '@/lib/contract-tools/types';

describe('Contract Tools', () => {
  describe('Templates', () => {
    it('has exactly 2 templates', () => {
      expect(getAllTemplates()).toHaveLength(2);
    });

    it('getTemplate returns rental-lease', () => {
      const t = getTemplate('rental-lease');
      expect(t).toBeDefined();
      expect(t?.templateId).toBe('rental-lease');
      expect(t?.title).toContain('اجاره');
    });

    it('getTemplate returns construction-contractor', () => {
      const t = getTemplate('construction-contractor');
      expect(t).toBeDefined();
      expect(t?.templateId).toBe('construction-contractor');
    });

    it('getTemplate returns undefined for unknown', () => {
      expect(getTemplate('unknown')).toBeUndefined();
    });

    it('all templates have required fields', () => {
      for (const t of getAllTemplates()) {
        expect(t.templateId).toBeTruthy();
        expect(t.version).toBeTruthy();
        expect(t.title).toBeTruthy();
        expect(t.description).toBeTruthy();
        expect(t.fields.length).toBeGreaterThan(0);
        expect(t.requiredFields.length).toBeGreaterThan(0);
        expect(t.clauses.length).toBeGreaterThan(0);
        expect(t.pricingTier).toBe('free');
        expect(t.reviewStatus).toBe('needs-legal-review');
      }
    });

    it('rental template has landlord, tenant, property fields', () => {
      const fields = rentalLeaseTemplate.fields.map((f) => f.group);
      expect(fields).toContain('landlord');
      expect(fields).toContain('tenant');
      expect(fields).toContain('property');
    });
  });

  describe('Rental Lease Validation', () => {
    it('returns errors for empty inputs', () => {
      const errors = validateRentalLease({});
      expect(Object.keys(errors).length).toBeGreaterThan(0);
      expect(errors['landlord.name']).toContain('الزامی');
    });

    it('returns empty for valid inputs', () => {
      const errors = validateRentalLease({
        'landlord.name': 'علی رضایی',
        'landlord.nationalId': '0012345678',
        'landlord.phone': '09121234567',
        'landlord.address': 'تهران',
        'tenant.name': 'محمد محمدی',
        'tenant.nationalId': '0098765432',
        'tenant.phone': '09351234567',
        'tenant.address': 'تهران',
        'property.address': 'خیابان ولیعصر',
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
      });
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('validates national ID format', () => {
      const errors = validateRentalLease({
        'landlord.nationalId': '123',
        'tenant.nationalId': '123',
      });
      expect(errors['landlord.nationalId']).toContain('۱۰ رقمی');
    });
  });

  describe('Construction Contractor Validation', () => {
    it('returns errors for empty inputs', () => {
      const errors = validateConstructionContractor({});
      expect(Object.keys(errors).length).toBeGreaterThan(0);
    });

    it('returns empty for valid inputs', () => {
      const errors = validateConstructionContractor({
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
      });
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  describe('Rental Lease Rendering', () => {
    const inputs: Record<string, string> = {
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

    it('renders contract text with entered names', () => {
      const text = renderContract(
        'rental-lease',
        rentalLeaseTemplate,
        inputs,
        ['default-obligations', 'default-maintenance'],
        true,
      );
      expect(text).toContain('علی رضایی');
      expect(text).toContain('محمد محمدی');
      expect(text).toContain('قرارداد اجاره مسکونی');
    });

    it('renders with watermark when requested', () => {
      const text = renderContract('rental-lease', rentalLeaseTemplate, inputs, [], true);
      expect(text).toContain(DRAFT_WATERMARK);
    });

    it('renders without watermark when not requested', () => {
      const text = renderContract('rental-lease', rentalLeaseTemplate, inputs, [], false);
      expect(text).not.toContain(DRAFT_WATERMARK);
    });

    it('includes disclaimer', () => {
      const text = renderContract('rental-lease', rentalLeaseTemplate, inputs, [], true);
      expect(text).toContain(DISCLAIMER);
    });

    it('includes financial amounts', () => {
      const text = renderContract('rental-lease', rentalLeaseTemplate, inputs, [], true);
      expect(text).toContain('۵۰۰۰۰۰۰۰۰');
      expect(text).toContain('۱۵۰۰۰۰۰۰');
    });

    it('includes selected clauses', () => {
      const text = renderContract(
        'rental-lease',
        rentalLeaseTemplate,
        inputs,
        ['default-obligations'],
        true,
      );
      expect(text).toContain('تعهدات مستأجر');
    });

    it('excludes unselected clauses', () => {
      const text = renderContract('rental-lease', rentalLeaseTemplate, inputs, [], true);
      expect(text).not.toContain('تعهدات مستأجر');
    });

    it('renders signature blocks', () => {
      const text = renderContract('rental-lease', rentalLeaseTemplate, inputs, [], true);
      expect(text).toContain('امضای موجر');
      expect(text).toContain('امضای مستأجر');
    });
  });

  describe('Construction Contractor Rendering', () => {
    const inputs: Record<string, string> = {
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

    it('renders contract with project details', () => {
      const text = renderContract(
        'construction-contractor',
        constructionContractorTemplate,
        inputs,
        ['construction-scope', 'construction-obligations'],
        true,
      );
      expect(text).toContain('ساخت ویلا');
      expect(text).toContain('پیمانکاری');
      expect(text).toContain('کارفرما');
      expect(text).toContain('پیمانکار');
    });

    it('includes disclaimer', () => {
      const text = renderContract(
        'construction-contractor',
        constructionContractorTemplate,
        inputs,
        [],
        true,
      );
      expect(text).toContain(DISCLAIMER);
    });

    it('renders signature blocks', () => {
      const text = renderContract(
        'construction-contractor',
        constructionContractorTemplate,
        inputs,
        [],
        true,
      );
      expect(text).toContain('امضای کارفرما');
      expect(text).toContain('امضای پیمانکار');
    });
  });

  describe('Unsupported template', () => {
    it('returns error message for unknown template', () => {
      const text = renderContract('unknown' as any, {} as any, {}, [], true);
      expect(text).toContain('پشتیبانی نمی‌شود');
    });
  });

  describe('Hash function', () => {
    it('produces consistent hash', async () => {
      const hash1 = await hashText('test contract');
      const hash2 = await hashText('test contract');
      expect(hash1).toBe(hash2);
    });

    it('produces different hash for different text', async () => {
      const hash1 = await hashText('contract A');
      const hash2 = await hashText('contract B');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('No legal guarantee wording', () => {
    it('disclaimer does not contain legal guarantee terms', () => {
      expect(DISCLAIMER).not.toContain('تضمین');
      expect(DISCLAIMER).not.toContain('عتبر حقوقی');
      expect(DISCLAIMER).not.toContain('جایگزین وکیل');
    });

    it('disclaimer explicitly states not a replacement', () => {
      expect(DISCLAIMER).toContain('جایگزین مشاوره حقوقی');
      expect(DISCLAIMER).toContain('نیست');
    });
  });
});
