import type { FormalLetterTemplate, FormalLetterFeatureGate, LetterTemplateId } from './types';

export const LETTER_TEMPLATES: FormalLetterTemplate[] = [
  {
    id: 'formal',
    title: 'نامه رسمی',
    description: 'قالب رسمی و اداری با طراحی کلاسیک',
  },
  {
    id: 'modern',
    title: 'نامه مدرن',
    description: 'قالب مدرن با رنگ‌بندی حرفه‌ای',
  },
];

export const FREE_TEMPLATES: LetterTemplateId[] = ['formal'];

export const FEATURE_GATES: { free: FormalLetterFeatureGate; premium: FormalLetterFeatureGate } = {
  free: {
    canExportPdf: false,
    canExportDocx: false,
    canSaveDraft: true,
    maxDrafts: 2,
    hasWatermark: true,
    availableTemplates: FREE_TEMPLATES,
    canAddCustomParagraphs: false,
    canUseSignature: false,
    maxBodyLength: 2000,
  },
  premium: {
    canExportPdf: true,
    canExportDocx: true,
    canSaveDraft: true,
    maxDrafts: 100,
    hasWatermark: false,
    availableTemplates: LETTER_TEMPLATES.map((t) => t.id),
    canAddCustomParagraphs: true,
    canUseSignature: true,
    maxBodyLength: 10000,
  },
};

export const FREE_MAX_DRAFTS = 2;
