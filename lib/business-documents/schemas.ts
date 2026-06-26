import type { BusinessDocumentType, BusinessDocumentTemplate, BusinessFeatureGate } from './types';

export const DOCUMENT_TYPES: BusinessDocumentTemplate[] = [
  {
    id: 'invoice',
    title: 'فاکتور فروش',
    description: 'سند رسمی فروش کالا یا خدمات با اطلاعات فروشنده و خریدار',
  },
  {
    id: 'proforma',
    title: 'پیش‌فاکتور',
    description: 'پیش‌نویس فاکتور برای اعلام قیمت و شرایط قبل از صدور فاکتور نهایی',
  },
  {
    id: 'receipt',
    title: 'رسید دریافت وجه',
    description: 'تأییدیه دریافت وجه از خریدار یا طرف قرارداد',
  },
];

export const FEATURE_GATES: Record<
  BusinessDocumentType,
  { free: BusinessFeatureGate; premium: BusinessFeatureGate }
> = {
  invoice: {
    free: {
      canExportPdf: false,
      canExportDocx: false,
      canUseLogo: false,
      canSaveDraft: true,
      maxDrafts: 3,
      hasWatermark: true,
    },
    premium: {
      canExportPdf: true,
      canExportDocx: true,
      canUseLogo: true,
      canSaveDraft: true,
      maxDrafts: 100,
      hasWatermark: false,
    },
  },
  proforma: {
    free: {
      canExportPdf: false,
      canExportDocx: false,
      canUseLogo: false,
      canSaveDraft: true,
      maxDrafts: 3,
      hasWatermark: true,
    },
    premium: {
      canExportPdf: true,
      canExportDocx: true,
      canUseLogo: true,
      canSaveDraft: true,
      maxDrafts: 100,
      hasWatermark: false,
    },
  },
  receipt: {
    free: {
      canExportPdf: false,
      canExportDocx: false,
      canUseLogo: false,
      canSaveDraft: true,
      maxDrafts: 3,
      hasWatermark: true,
    },
    premium: {
      canExportPdf: true,
      canExportDocx: true,
      canUseLogo: true,
      canSaveDraft: true,
      maxDrafts: 100,
      hasWatermark: false,
    },
  },
};

export const FREE_MAX_DRAFTS = 3;

export const AUTO_DOCUMENT_NUMBER_PREFIX: Record<BusinessDocumentType, string> = {
  invoice: 'INV',
  proforma: 'PRO',
  receipt: 'REC',
};
