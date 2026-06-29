export type SaleTemplateId = 'standard' | 'detailed' | 'apartment';

export interface SaleAgreementData {
  sellerName: string;
  sellerNationalId: string;
  sellerPhone: string;
  sellerAddress: string;
  buyerName: string;
  buyerNationalId: string;
  buyerPhone: string;
  buyerAddress: string;
  propertyAddress: string;
  propertyParcelId?: string;
  propertyArea: string;
  propertyDeedNo?: string;
  propertyRegistryNo?: string;
  salePrice: string;
  depositAmount: string;
  paymentMethod: string;
  deliveryDate: string;
  contractDate: string;
  possessionDate: string;
  templateId: SaleTemplateId;
  additionalClauses: string[];
  description?: string;
  signatureSeller?: string;
  signatureBuyer?: string;
}

export interface SaleTemplate {
  id: SaleTemplateId;
  title: string;
  description: string;
}

export interface SaleFeatureGate {
  canExportPdf: boolean;
  canExportDocx: boolean;
  canSaveDraft: boolean;
  maxDrafts: number;
  hasWatermark: boolean;
  availableTemplates: SaleTemplateId[];
  canAddCustomClauses: boolean;
  canUseSignature: boolean;
}

export const DISCLAIMER =
  'این ابزار صرفاً برای ساخت پیش‌نویس مبایعه‌نامه بر اساس اطلاعات واردشده توسط کاربر است و جایگزین مشاوره حقوقی، وکالت، خدمات مشاور املاک، داوری، ثبت رسمی یا سند رسمی نیست. مسئولیت صحت اطلاعات، بررسی نهایی، امضا، ثبت و آثار حقوقی استفاده از این قرارداد بر عهده کاربران است.';

export const PRIVACY_TEXT =
  'اطلاعات قرارداد در مرورگر شما پردازش می‌شود و برای ساخت خروجی نیازی به ارسال اطلاعات به سرور نیست.';

export const WATERMARK_TEXT = 'پیش‌نویس — ساخته‌شده با PersianToolbox';

export function validateSaleAgreement(data: SaleAgreementData): string[] {
  const errors: string[] = [];
  if (!data.sellerName.trim()) {
    errors.push('نام فروشنده الزامی است');
  }
  if (!data.sellerNationalId.trim()) {
    errors.push('کد ملی فروشنده الزامی است');
  }
  if (!data.sellerPhone.trim()) {
    errors.push('تلفن فروشنده الزامی است');
  }
  if (!data.buyerName.trim()) {
    errors.push('نام خریدار الزامی است');
  }
  if (!data.buyerNationalId.trim()) {
    errors.push('کد ملی خریدار الزامی است');
  }
  if (!data.buyerPhone.trim()) {
    errors.push('تلفن خریدار الزامی است');
  }
  if (!data.propertyAddress.trim()) {
    errors.push('آدرس ملک الزامی است');
  }
  if (!data.propertyArea.trim()) {
    errors.push('متراژ ملک الزامی است');
  }
  if (!data.salePrice.trim()) {
    errors.push('قیمت فروش الزامی است');
  }
  if (!data.depositAmount.trim()) {
    errors.push('مبلغ بیعانه الزامی است');
  }
  if (!data.paymentMethod.trim()) {
    errors.push('روش پرداخت الزامی است');
  }
  if (!data.deliveryDate.trim()) {
    errors.push('تاریخ تحویل الزامی است');
  }
  if (!data.contractDate.trim()) {
    errors.push('تاریخ قرارداد الزامی است');
  }
  if (!data.possessionDate.trim()) {
    errors.push('تاریخ تصرف الزامی است');
  }
  return errors;
}
