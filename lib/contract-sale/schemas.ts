import type { SaleTemplate, SaleFeatureGate, SaleTemplateId } from './types';

export const SALE_TEMPLATES: SaleTemplate[] = [
  {
    id: 'standard',
    title: 'مبایعه‌نامه استاندارد',
    description: 'مبایعه‌نامه استاندارد مناسب انواع معاملات ملکی',
  },
  {
    id: 'detailed',
    title: 'مبایعه‌نامه جامع',
    description: 'مبایعه‌نامه با جزئیات کامل و بندهای حقوقی بیشتر',
  },
  {
    id: 'apartment',
    title: 'مبایعه‌نامه آپارتمان',
    description: 'مبایعه‌نامه مناسب خرید و فروش آپارتمان',
  },
];

export const FREE_TEMPLATES: SaleTemplateId[] = ['standard'];

export const FEATURE_GATES: { free: SaleFeatureGate; premium: SaleFeatureGate } = {
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
    availableTemplates: SALE_TEMPLATES.map((t) => t.id),
    canAddCustomClauses: true,
    canUseSignature: true,
  },
};

export const FREE_MAX_DRAFTS = 2;
