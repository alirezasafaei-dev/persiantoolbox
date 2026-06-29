export const EXPORT_PRODUCTS = [
  'business',
  'career',
  'writing',
  'formal-letter',
  'work-certificate',
  'employment-contract',
  'lease-agreement',
  'sale-agreement',
] as const;

export type ExportProduct = (typeof EXPORT_PRODUCTS)[number];

export type ExportProductGroup = 'business' | 'career' | 'writing' | 'legal' | 'administrative';

export type ExportProductConfig = {
  id: ExportProduct;
  label: string;
  group: ExportProductGroup;
  cleanExportCredits: 1 | 2;
  legalDisclaimerRequired: boolean;
};

export const EXPORT_PRODUCT_CONFIG: Record<ExportProduct, ExportProductConfig> = {
  business: {
    id: 'business',
    label: 'فاکتورساز',
    group: 'business',
    cleanExportCredits: 1,
    legalDisclaimerRequired: false,
  },
  career: {
    id: 'career',
    label: 'رزومه‌ساز',
    group: 'career',
    cleanExportCredits: 1,
    legalDisclaimerRequired: false,
  },
  writing: {
    id: 'writing',
    label: 'ویرایشگر فارسی',
    group: 'writing',
    cleanExportCredits: 1,
    legalDisclaimerRequired: false,
  },
  'formal-letter': {
    id: 'formal-letter',
    label: 'نامه اداری',
    group: 'administrative',
    cleanExportCredits: 1,
    legalDisclaimerRequired: false,
  },
  'work-certificate': {
    id: 'work-certificate',
    label: 'گواهی سابقه کار',
    group: 'administrative',
    cleanExportCredits: 1,
    legalDisclaimerRequired: false,
  },
  'employment-contract': {
    id: 'employment-contract',
    label: 'قرارداد کار',
    group: 'legal',
    cleanExportCredits: 1,
    legalDisclaimerRequired: true,
  },
  'lease-agreement': {
    id: 'lease-agreement',
    label: 'اجاره‌نامه',
    group: 'legal',
    cleanExportCredits: 1,
    legalDisclaimerRequired: true,
  },
  'sale-agreement': {
    id: 'sale-agreement',
    label: 'مبایعه‌نامه',
    group: 'legal',
    cleanExportCredits: 1,
    legalDisclaimerRequired: true,
  },
};

export function isExportProduct(product: string): product is ExportProduct {
  return (EXPORT_PRODUCTS as readonly string[]).includes(product);
}

export function getExportProductConfig(product: ExportProduct): ExportProductConfig {
  return EXPORT_PRODUCT_CONFIG[product];
}
