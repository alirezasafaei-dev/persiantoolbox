import type { SalonTemplate, SalonFeatureGate, SalonTemplateId } from './types';

export const SALON_TEMPLATES: SalonTemplate[] = [
  {
    id: 'standard',
    title: 'قرارداد استاندارد',
    description: 'قرارداد خدمات زیبایی استاندارد مناسب سالن‌های زیبایی',
  },
  {
    id: 'comprehensive',
    title: 'قرارداد جامع',
    description: 'قرارداد با جزئیات کامل شامل بندهای حرفه‌ای و حقوقی بیشتر',
  },
];

export const FREE_TEMPLATES: SalonTemplateId[] = ['standard'];

export const FEATURE_GATES: { free: SalonFeatureGate; premium: SalonFeatureGate } = {
  free: {
    canExportPdf: false,
    canExportDocx: false,
    canSaveDraft: true,
    maxDrafts: 2,
    hasWatermark: true,
    availableTemplates: FREE_TEMPLATES,
    canAddCustomClauses: false,
    canUseSignature: false,
  },
  premium: {
    canExportPdf: true,
    canExportDocx: true,
    canSaveDraft: true,
    maxDrafts: 100,
    hasWatermark: false,
    availableTemplates: SALON_TEMPLATES.map((t) => t.id),
    canAddCustomClauses: true,
    canUseSignature: true,
  },
};

export const FREE_MAX_DRAFTS = 2;
