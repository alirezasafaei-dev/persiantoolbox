import type { EmploymentTemplate, EmploymentFeatureGate, EmploymentTemplateId } from './types';

export const EMPLOYMENT_TEMPLATES: EmploymentTemplate[] = [
  {
    id: 'standard',
    title: 'قرارداد کار استاندارد',
    description: 'قرارداد کار استاندارد مطابق قانون کار جمهوری اسلامی ایران',
  },
  {
    id: 'comprehensive',
    title: 'قرارداد کار جامع',
    description: 'قرارداد کار با جزئیات کامل و بندهای حقوقی بیشتر',
  },
];

export const FREE_TEMPLATES: EmploymentTemplateId[] = ['standard'];

export const FEATURE_GATES: { free: EmploymentFeatureGate; premium: EmploymentFeatureGate } = {
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
    availableTemplates: EMPLOYMENT_TEMPLATES.map((t) => t.id),
    canAddCustomClauses: true,
    canUseSignature: true,
  },
};

export const FREE_MAX_DRAFTS = 2;
