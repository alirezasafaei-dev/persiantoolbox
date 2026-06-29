import type {
  WorkCertificateTemplate,
  WorkCertificateFeatureGate,
  CertificateTemplateId,
} from './types';

export const CERTIFICATE_TEMPLATES: WorkCertificateTemplate[] = [
  {
    id: 'formal',
    title: 'گواهی رسمی',
    description: 'قالب رسمی و اداری با طراحی کلاسیک مناسب سازمان‌ها',
    isRtl: true,
  },
  {
    id: 'modern',
    title: 'گواهی مدرن',
    description: 'قالب مدرن با رنگ‌بندی حرفه‌ای مناسب شرکت‌های خصوصی',
    isRtl: true,
  },
  {
    id: 'bilingual',
    title: 'دو زبانه (فارسی + انگلیسی)',
    description: 'گواهی دو زبانه مناسب شرکت‌های بین‌المللی و مهاجرت',
    isRtl: true,
  },
];

export const FREE_TEMPLATES: CertificateTemplateId[] = ['formal'];

export const FEATURE_GATES: {
  free: WorkCertificateFeatureGate;
  premium: WorkCertificateFeatureGate;
} = {
  free: {
    canExportPdf: false,
    canExportDocx: false,
    canUseLogo: false,
    canUseSignature: false,
    canSaveDraft: true,
    maxDrafts: 2,
    hasWatermark: true,
    availableTemplates: FREE_TEMPLATES,
  },
  premium: {
    canExportPdf: true,
    canExportDocx: true,
    canUseLogo: true,
    canUseSignature: true,
    canSaveDraft: true,
    maxDrafts: 100,
    hasWatermark: false,
    availableTemplates: CERTIFICATE_TEMPLATES.map((t) => t.id),
  },
};

export const FREE_MAX_DRAFTS = 2;
