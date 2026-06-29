export type SalonTemplateId = 'standard' | 'comprehensive';

export interface SalonData {
  salonName: string;
  salonOwnerName: string;
  salonOwnerNationalId: string;
  salonOwnerPhone: string;
  salonAddress: string;
  workerName: string;
  workerNationalId: string;
  workerPhone: string;
  workerAddress: string;
  serviceType: string;
  servicesOffered: string;
  startDate: string;
  endDate: string;
  workingHours: string;
  workingDays: string;
  salaryType: string;
  baseSalary: string;
  commissionPercent: string;
  paymentDay: string;
  paymentMethod: string;
  toolsProvided: string;
  toolsProvidedBy: string;
  uniformRequired: string;
  hygieneRules: string;
  clientPrivacy: string;
  nonCompete?: string;
  trainingPeriod?: string;
  terminationNotice?: string;
  templateId: SalonTemplateId;
  additionalClauses: string[];
  description?: string;
  witness1?: string;
  witness2?: string;
  salonOwnerSignature?: string;
  workerSignature?: string;
}

export interface SalonTemplate {
  id: SalonTemplateId;
  title: string;
  description: string;
}

export interface SalonFeatureGate {
  canExportPdf: boolean;
  canExportDocx: boolean;
  canSaveDraft: boolean;
  maxDrafts: number;
  hasWatermark: boolean;
  availableTemplates: SalonTemplateId[];
  canAddCustomClauses: boolean;
  canUseSignature: boolean;
}

export const DISCLAIMER =
  'این ابزار صرفاً برای ساخت پیش‌نویس قرارداد خدمات زیبایی بر اساس اطلاعات واردشده توسط کاربر است و جایگزین مشاوره حقوقی، وکالت، یا قرارداد رسمی نیست. مسئولیت صحت اطلاعات، بررسی نهایی، امضا و آثار حقوقی استفاده از این قرارداد بر عهده کاربران است.';

export const PRIVACY_TEXT =
  'اطلاعات قرارداد در مرورگر شما پردازش می‌شود و برای ساخت خروجی نیازی به ارسال اطلاعات به سرور نیست.';

export const WATERMARK_TEXT = 'پیش‌نویس — ساخته‌شده با PersianToolbox';

export function validateSalon(data: SalonData): string[] {
  const errors: string[] = [];
  if (!data.salonName.trim()) {
    errors.push('نام سالن الزامی است');
  }
  if (!data.salonOwnerName.trim()) {
    errors.push('نام مالک سالن الزامی است');
  }
  if (!data.salonOwnerNationalId.trim()) {
    errors.push('کد ملی مالک الزامی است');
  }
  if (!data.salonOwnerPhone.trim()) {
    errors.push('تلفن مالک الزامی است');
  }
  if (!data.salonAddress.trim()) {
    errors.push('آدرس سالن الزامی است');
  }
  if (!data.workerName.trim()) {
    errors.push('نام کارمند/متخصص الزامی است');
  }
  if (!data.workerNationalId.trim()) {
    errors.push('کد ملی کارمند الزامی است');
  }
  if (!data.workerPhone.trim()) {
    errors.push('تلفن کارمند الزامی است');
  }
  if (!data.serviceType.trim()) {
    errors.push('نوع خدمات الزامی است');
  }
  if (!data.startDate.trim()) {
    errors.push('تاریخ شروع الزامی است');
  }
  if (!data.endDate.trim()) {
    errors.push('تاریخ پایان الزامی است');
  }
  if (!data.workingHours.trim()) {
    errors.push('ساعت کاری الزامی است');
  }
  if (!data.salaryType.trim()) {
    errors.push('نوع حقوق الزامی است');
  }
  if (!data.baseSalary.trim()) {
    errors.push('حقوق پایه الزامی است');
  }
  return errors;
}
