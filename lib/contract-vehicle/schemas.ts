import type { VehicleTemplate, VehicleFeatureGate, VehicleTemplateId } from './types';

export const VEHICLE_TEMPLATES: VehicleTemplate[] = [
  {
    id: 'standard',
    title: 'مبایعه‌نامه استاندارد',
    description: 'مبایعه‌نامه خودرو استاندارد مناسب انواع معاملات',
  },
  {
    id: 'comprehensive',
    title: 'مبایعه‌نامه جامع',
    description: 'مبایعه‌نامه با جزئیات کامل و بندهای حقوقی بیشتر',
  },
];

export const FREE_TEMPLATES: VehicleTemplateId[] = ['standard'];

export const FEATURE_GATES: { free: VehicleFeatureGate; premium: VehicleFeatureGate } = {
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
    availableTemplates: VEHICLE_TEMPLATES.map((t) => t.id),
    canAddCustomClauses: true,
    canUseSignature: true,
  },
};

export const FREE_MAX_DRAFTS = 2;
