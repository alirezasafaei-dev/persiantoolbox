export type CertificateTemplateId = 'formal' | 'modern' | 'bilingual';

export interface WorkCertificateData {
  employeeName: string;
  nationalId?: string;
  position: string;
  department?: string;
  employerName: string;
  employerRegistrationNo?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  salary?: string;
  reasonForLeaving?: string;
  description?: string;
  issuerName: string;
  issuerPosition: string;
  certificateDate: string;
  templateId: CertificateTemplateId;
  logoDataUrl?: string;
  signatureDataUrl?: string;
}

export interface WorkCertificateTemplate {
  id: CertificateTemplateId;
  title: string;
  description: string;
  isRtl: boolean;
}

export interface WorkCertificateFeatureGate {
  canExportPdf: boolean;
  canExportDocx: boolean;
  canUseLogo: boolean;
  canUseSignature: boolean;
  canSaveDraft: boolean;
  maxDrafts: number;
  hasWatermark: boolean;
  availableTemplates: CertificateTemplateId[];
}

export const DISCLAIMER =
  'این ابزار صرفاً برای ساخت پیش‌نویس گواهی سابقه کار بر اساس اطلاعات واردشده توسط کاربر است و جایگزین گواهی رسمی سازمان اداری و استخدامی کشور، اداره کار، یا مراجع قانونی نیست. مسئولیت صحت اطلاعات، تأیید نهایی و استفاده از خروجی بر عهده کاربر است.';

export const PRIVACY_TEXT =
  'اطلاعات گواهی در مرورگر شما پردازش می‌شود و برای ساخت خروجی نیازی به ارسال اطلاعات به سرور نیست.';

export const WATERMARK_TEXT = 'پیش‌نویس — ساخته‌شده با PersianToolbox';

function isCalendarDate(value: string): boolean {
  if (!/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateCertificate(data: WorkCertificateData): string[] {
  const errors: string[] = [];
  if (!data.employeeName.trim()) {
    errors.push('نام کارمند الزامی است');
  }
  if (!data.position.trim()) {
    errors.push('سمت شغلی الزامی است');
  }
  if (!data.employerName.trim()) {
    errors.push('نام کارفرما / شرکت الزامی است');
  }
  if (!data.startDate.trim()) {
    errors.push('تاریخ شروع الزامی است');
  }
  if (!data.issuerName.trim()) {
    errors.push('نام صادرکننده الزامی است');
  }
  if (!data.issuerPosition.trim()) {
    errors.push('سمت صادرکننده الزامی است');
  }
  if (!data.certificateDate.trim()) {
    errors.push('تاریخ صدور گواهی الزامی است');
  }
  for (const [value, label] of [
    [data.startDate, 'تاریخ شروع'],
    [data.certificateDate, 'تاریخ صدور گواهی'],
    [data.isCurrent ? undefined : data.endDate, 'تاریخ پایان'],
  ] as const) {
    if (value?.trim() && !isCalendarDate(value)) {
      errors.push(`${label} باید یک تاریخ معتبر باشد`);
    }
  }
  if (
    !data.isCurrent &&
    data.endDate &&
    isCalendarDate(data.startDate) &&
    isCalendarDate(data.endDate) &&
    data.endDate < data.startDate
  ) {
    errors.push('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
  }
  return errors;
}
