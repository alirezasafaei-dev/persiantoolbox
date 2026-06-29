export type LeaseTemplateId = 'standard' | 'comprehensive';

export interface LeaseData {
  landlordName: string;
  landlordNationalId: string;
  landlordPhone: string;
  landlordAddress: string;
  tenantName: string;
  tenantNationalId: string;
  tenantPhone: string;
  tenantAddress: string;
  propertyAddress: string;
  propertyPostalCode?: string;
  propertyArea: string;
  propertyDeedType?: string;
  propertyFloor?: string;
  propertyUnit?: string;
  propertyUtilities?: string;
  propertyFixtures?: string;
  startDate: string;
  endDate: string;
  deliveryDate: string;
  depositAmount: string;
  monthlyRent: string;
  paymentDay: string;
  paymentMethod: string;
  utilityCosts?: string;
  municipalCharges?: string;
  taxFees?: string;
  subleasePermission?: string;
  latePaymentPenalty?: string;
  lateVacatePenalty?: string;
  templateId: LeaseTemplateId;
  additionalClauses: string[];
  description?: string;
  witness1?: string;
  witness2?: string;
  landlordSignature?: string;
  tenantSignature?: string;
}

export interface LeaseTemplate {
  id: LeaseTemplateId;
  title: string;
  description: string;
}

export interface LeaseFeatureGate {
  canExportPdf: boolean;
  canExportDocx: boolean;
  canSaveDraft: boolean;
  maxDrafts: number;
  hasWatermark: boolean;
  availableTemplates: LeaseTemplateId[];
  canAddCustomClauses: boolean;
  canUseSignature: boolean;
}

export const DISCLAIMER =
  'این ابزار صرفاً برای ساخت پیش‌نویس اجاره‌نامه بر اساس اطلاعات واردشده توسط کاربر است و جایگزین مشاوره حقوقی، وکالت، خدمات مشاور املاک، ثبت رسمی یا اجاره‌نامه رسمی نیست. مسئولیت صحت اطلاعات، بررسی نهایی، امضا و آثار حقوقی استفاده از این قرارداد بر عهده کاربران است.';

export const PRIVACY_TEXT =
  'اطلاعات قرارداد در مرورگر شما پردازش می‌شود و برای ساخت خروجی نیازی به ارسال اطلاعات به سرور نیست.';

export const WATERMARK_TEXT = 'پیش‌نویس — ساخته‌شده با PersianToolbox';

export function validateLease(data: LeaseData): string[] {
  const errors: string[] = [];
  if (!data.landlordName.trim()) {
    errors.push('نام موجر الزامی است');
  }
  if (!data.landlordNationalId.trim()) {
    errors.push('کد ملی موجر الزامی است');
  }
  if (!data.landlordPhone.trim()) {
    errors.push('تلفن موجر الزامی است');
  }
  if (!data.tenantName.trim()) {
    errors.push('نام مستأجر الزامی است');
  }
  if (!data.tenantNationalId.trim()) {
    errors.push('کد ملی مستأجر الزامی است');
  }
  if (!data.tenantPhone.trim()) {
    errors.push('تلفن مستأجر الزامی است');
  }
  if (!data.propertyAddress.trim()) {
    errors.push('آدرس ملک الزامی است');
  }
  if (!data.propertyArea.trim()) {
    errors.push('متراژ ملک الزامی است');
  }
  if (!data.startDate.trim()) {
    errors.push('تاریخ شروع الزامی است');
  }
  if (!data.endDate.trim()) {
    errors.push('تاریخ پایان الزامی است');
  }
  if (!data.deliveryDate.trim()) {
    errors.push('تاریخ تحویل الزامی است');
  }
  if (!data.depositAmount.trim()) {
    errors.push('مبلغ ودیعه الزامی است');
  }
  if (!data.monthlyRent.trim()) {
    errors.push('اجاره ماهانه الزامی است');
  }
  if (!data.paymentDay.trim()) {
    errors.push('روز پرداخت الزامی است');
  }
  if (!data.paymentMethod.trim()) {
    errors.push('روش پرداخت الزامی است');
  }
  return errors;
}
