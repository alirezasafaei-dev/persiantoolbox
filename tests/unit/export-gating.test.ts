import { describe, expect, it } from 'vitest';
import { FEATURE_GATES as BusinessGates } from '@/lib/business-documents/schemas';
import { FEATURE_GATES as CareerGates } from '@/lib/career-documents/schemas';

describe('Export gating', () => {
  describe('Business document gating', () => {
    it('free invoice has watermark and no PDF/DOCX', () => {
      const gate = BusinessGates.invoice.free;
      expect(gate.hasWatermark).toBe(true);
      expect(gate.canExportPdf).toBe(false);
      expect(gate.canExportDocx).toBe(false);
    });

    it('premium invoice has no watermark and PDF/DOCX', () => {
      const gate = BusinessGates.invoice.premium;
      expect(gate.hasWatermark).toBe(false);
      expect(gate.canExportPdf).toBe(true);
      expect(gate.canExportDocx).toBe(true);
    });

    it('free proforma has watermark and no PDF/DOCX', () => {
      const gate = BusinessGates.proforma.free;
      expect(gate.hasWatermark).toBe(true);
      expect(gate.canExportPdf).toBe(false);
      expect(gate.canExportDocx).toBe(false);
    });

    it('free receipt has watermark and no PDF/DOCX', () => {
      const gate = BusinessGates.receipt.free;
      expect(gate.hasWatermark).toBe(true);
      expect(gate.canExportPdf).toBe(false);
      expect(gate.canExportDocx).toBe(false);
    });
  });

  describe('Career document gating', () => {
    it('free resume-fa has watermark and no PDF/DOCX', () => {
      const gate = CareerGates['resume-fa'].free;
      expect(gate.hasWatermark).toBe(true);
      expect(gate.canExportPdf).toBe(false);
      expect(gate.canExportDocx).toBe(false);
    });

    it('premium resume-fa has no watermark and PDF/DOCX', () => {
      const gate = CareerGates['resume-fa'].premium;
      expect(gate.hasWatermark).toBe(false);
      expect(gate.canExportPdf).toBe(true);
      expect(gate.canExportDocx).toBe(true);
    });

    it('free resume-en has watermark and no PDF/DOCX', () => {
      const gate = CareerGates['resume-en'].free;
      expect(gate.hasWatermark).toBe(true);
      expect(gate.canExportPdf).toBe(false);
      expect(gate.canExportDocx).toBe(false);
    });

    it('free cover-letter has watermark and no PDF/DOCX', () => {
      const gate = CareerGates['cover-letter'].free;
      expect(gate.hasWatermark).toBe(true);
      expect(gate.canExportPdf).toBe(false);
      expect(gate.canExportDocx).toBe(false);
    });
  });

  describe('Theme systems', () => {
    it('business has 5 themes', async () => {
      const { INVOICE_THEMES } = await import('@/lib/business-documents/themes');
      expect(INVOICE_THEMES).toHaveLength(5);
    });

    it('career has 5 themes', async () => {
      const { RESUME_THEMES } = await import('@/lib/career-documents/themes');
      expect(RESUME_THEMES).toHaveLength(5);
    });

    it('default theme is classic for business', async () => {
      const { getThemeById } = await import('@/lib/business-documents/themes');
      const theme = getThemeById('nonexistent');
      expect(theme.id).toBe('classic');
    });

    it('default theme is professional for career', async () => {
      const { getResumeThemeById } = await import('@/lib/career-documents/themes');
      const theme = getResumeThemeById('nonexistent');
      expect(theme.id).toBe('professional');
    });
  });
});
