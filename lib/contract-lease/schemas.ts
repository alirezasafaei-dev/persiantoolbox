import type { LeaseTemplate, LeaseFeatureGate, LeaseTemplateId } from './types';

export const LEASE_TEMPLATES: LeaseTemplate[] = [
  {
    id: 'standard',
    title: 'اجاره‌نامه استاندارد',
    description: 'اجاره‌نامه استاندارد مناسب انواع قراردادهای اجاره مسکونی',
  },
  {
    id: 'comprehensive',
    title: 'اجاره‌نامه جامع',
    description: 'اجاره‌نامه با جزئیات کامل و بندهای حقوقی بیشتر',
  },
];

export const FREE_TEMPLATES: LeaseTemplateId[] = ['standard'];

export const FEATURE_GATES: { free: LeaseFeatureGate; premium: LeaseFeatureGate } = {
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
    availableTemplates: LEASE_TEMPLATES.map((t) => t.id),
    canAddCustomClauses: true,
    canUseSignature: true,
  },
};

export const FREE_MAX_DRAFTS = 2;
