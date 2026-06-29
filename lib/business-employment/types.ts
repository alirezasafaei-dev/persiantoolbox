export type EmploymentTemplateId = 'standard' | 'comprehensive';

export type ContractType = 'permanent' | 'fixed-term' | 'part-time' | 'probationary';

export interface EmploymentData {
  employerName: string;
  employerNationalId: string;
  employerPhone: string;
  employerAddress: string;
  employerEconomicCode?: string;
  employeeName: string;
  employeeNationalId: string;
  employeePhone: string;
  employeeAddress: string;
  employeeFatherName?: string;
  employeeBirthDate?: string;
  jobTitle: string;
  department?: string;
  workplace: string;
  startDate: string;
  endDate?: string;
  contractType: ContractType;
  probationaryPeriod?: string;
  baseSalary: string;
  housingAllowance?: string;
  foodAllowance?: string;
  transportation?: string;
  overtimeRate?: string;
  bonus?: string;
  insuranceType: string;
  dailyWorkingHours: string;
  weeklyDaysOff: string;
  annualLeave: string;
  sickLeave?: string;
  templateId: EmploymentTemplateId;
  additionalClauses: string[];
  description?: string;
  employerSignature?: string;
  employeeSignature?: string;
}

export interface EmploymentTemplate {
  id: EmploymentTemplateId;
  title: string;
  description: string;
}

export interface EmploymentFeatureGate {
  canExportPdf: boolean;
  canExportDocx: boolean;
  canSaveDraft: boolean;
  maxDrafts: number;
  hasWatermark: boolean;
  availableTemplates: EmploymentTemplateId[];
  canAddCustomClauses: boolean;
  canUseSignature: boolean;
}

export const DISCLAIMER =
  'این ابزار صرفاً برای ساخت پیش‌نویس قرارداد کار بر اساس اطلاعات واردشده توسط کاربر است و جایگزین قرارداد رسمی وزارت کار، تأمین اجتماعی، یا مراجع قانونی نیست. مسئولیت صحت اطلاعات، ثبت رسمی در سامانه وزارت کار و امور اجتماعی، امضا، و آثار حقوقی استفاده از این قرارداد بر عهده کاربران است.';

export const PRIVACY_TEXT =
  'اطلاعات قرارداد در مرورگر شما پردازش می‌شود و برای ساخت خروجی نیازی به ارسال اطلاعات به سرور نیست.';

export const WATERMARK_TEXT = 'پیش‌نویس — ساخته‌شده با PersianToolbox';

export function validateEmployment(data: EmploymentData): string[] {
  const errors: string[] = [];
  if (!data.employerName.trim()) {
    errors.push('نام کارفرما الزامی است');
  }
  if (!data.employerNationalId.trim()) {
    errors.push('کد ملی / شماره ثبت کارفرما الزامی است');
  }
  if (!data.employerPhone.trim()) {
    errors.push('تلفن کارفرما الزامی است');
  }
  if (!data.employeeName.trim()) {
    errors.push('نام کارمند الزامی است');
  }
  if (!data.employeeNationalId.trim()) {
    errors.push('کد ملی کارمند الزامی است');
  }
  if (!data.employeePhone.trim()) {
    errors.push('تلفن کارمند الزامی است');
  }
  if (!data.jobTitle.trim()) {
    errors.push('عنوان شغلی الزامی است');
  }
  if (!data.workplace.trim()) {
    errors.push('محل کار الزامی است');
  }
  if (!data.startDate.trim()) {
    errors.push('تاریخ شروع کار الزامی است');
  }
  if (!data.baseSalary.trim()) {
    errors.push('حقوق پایه الزامی است');
  }
  if (!data.insuranceType.trim()) {
    errors.push('نوع بیمه الزامی است');
  }
  if (!data.dailyWorkingHours.trim()) {
    errors.push('ساعت کار روزانه الزامی است');
  }
  if (!data.weeklyDaysOff.trim()) {
    errors.push('روزهای تعطیل هفتگی الزامی است');
  }
  if (!data.annualLeave.trim()) {
    errors.push('مرخصی سالانه الزامی است');
  }
  return errors;
}

export function getDefaultBenefits(): string[] {
  return ['بیمه تأمین اجتماعی', 'پرداخت اضافه کار', 'مرخصی استعلاجی', 'عیدی و پاداش'];
}
