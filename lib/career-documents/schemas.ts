import type { CareerDocumentType, CareerDocumentTemplate, CareerFeatureGate } from './types';

export const DOCUMENT_TYPES: CareerDocumentTemplate[] = [
  {
    id: 'persian-resume',
    documentType: 'resume-fa',
    title: 'رزومه فارسی',
    description: 'رزومه حرفه‌ای فارسی با طراحی رسمی و RTL',
    isRtl: true,
  },
  {
    id: 'english-resume',
    documentType: 'resume-en',
    title: 'رزومه انگلیسی',
    description: 'Professional English resume with ATS-friendly layout',
    isRtl: false,
  },
  {
    id: 'cover-letter',
    documentType: 'cover-letter',
    title: 'کاورلتر / نامه معرفی شغلی',
    description: 'نامه معرفی حرفه‌ای برای درخواست شغل',
    isRtl: true,
  },
];

export const FEATURE_GATES: Record<
  CareerDocumentType,
  { free: CareerFeatureGate; premium: CareerFeatureGate }
> = {
  'resume-fa': {
    free: {
      canExportPdf: false,
      canExportDocx: false,
      canUsePhoto: false,
      canSaveDraft: true,
      maxDrafts: 2,
      hasWatermark: true,
      hasAdvancedStyling: false,
    },
    premium: {
      canExportPdf: true,
      canExportDocx: true,
      canUsePhoto: true,
      canSaveDraft: true,
      maxDrafts: 100,
      hasWatermark: false,
      hasAdvancedStyling: true,
    },
  },
  'resume-en': {
    free: {
      canExportPdf: false,
      canExportDocx: false,
      canUsePhoto: false,
      canSaveDraft: true,
      maxDrafts: 2,
      hasWatermark: true,
      hasAdvancedStyling: false,
    },
    premium: {
      canExportPdf: true,
      canExportDocx: true,
      canUsePhoto: true,
      canSaveDraft: true,
      maxDrafts: 100,
      hasWatermark: false,
      hasAdvancedStyling: true,
    },
  },
  'cover-letter': {
    free: {
      canExportPdf: false,
      canExportDocx: false,
      canUsePhoto: false,
      canSaveDraft: true,
      maxDrafts: 2,
      hasWatermark: true,
      hasAdvancedStyling: false,
    },
    premium: {
      canExportPdf: true,
      canExportDocx: true,
      canUsePhoto: false,
      canSaveDraft: true,
      maxDrafts: 100,
      hasWatermark: false,
      hasAdvancedStyling: true,
    },
  },
};

export const FREE_MAX_DRAFTS = 2;
