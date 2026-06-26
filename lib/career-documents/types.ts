export type CareerDocumentType = 'resume-fa' | 'resume-en' | 'cover-letter';

export interface ResumeProfile {
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  photoDataUrl?: string;
  summary?: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface ResumeSkill {
  id: string;
  name: string;
  level?: 'مبتدی' | 'متوسط' | 'پیشرفته' | 'حرفه‌ای';
}

export interface ResumeLanguage {
  id: string;
  name: string;
  level?: 'مبتدی' | 'متوسط' | 'خوب' | 'عالی' | 'مادری';
}

export interface ResumeProject {
  id: string;
  name: string;
  description?: string;
  url?: string;
  technologies?: string;
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
  url?: string;
}

export interface ResumeDraft {
  id: string;
  documentType: CareerDocumentType;
  createdAt: string;
  updatedAt: string;
  profile: ResumeProfile;
  experiences: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
  languages: ResumeLanguage[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  coverLetterRecipient?: string;
  coverLetterCompany?: string;
  coverLetterPosition?: string;
  coverLetterBody?: string;
  templateId: string;
}

export interface CareerDocumentTemplate {
  id: string;
  documentType: CareerDocumentType;
  title: string;
  description: string;
  isRtl: boolean;
}

export interface CareerFeatureGate {
  canExportPdf: boolean;
  canExportDocx: boolean;
  canUsePhoto: boolean;
  canSaveDraft: boolean;
  maxDrafts: number;
  hasWatermark: boolean;
  hasAdvancedStyling: boolean;
}

export const DISCLAIMER =
  'این ابزار صرفاً برای ساخت پیش‌نویس رزومه، کاورلتر و اسناد شغلی بر اساس اطلاعات واردشده توسط کاربر است و جایگزین مشاوره شغلی، مهاجرتی، حقوقی یا تضمین استخدام نیست. مسئولیت صحت اطلاعات، بررسی نهایی، ارسال و استفاده از خروجی بر عهده کاربر است.';

export const PRIVACY_TEXT =
  'اطلاعات رزومه تا حد امکان در مرورگر شما پردازش می‌شود و برای ساخت خروجی نیازی به ارسال اطلاعات به سرور نیست.';

export const WATERMARK_TEXT = 'ساخته‌شده با PersianToolbox';

export function validateProfile(profile: ResumeProfile): string[] {
  const errors: string[] = [];
  if (!profile.fullName?.trim()) {
    errors.push('نام و نام خانوادگی الزامی است');
  }
  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    errors.push('ایمیل نامعتبر است');
  }
  return errors;
}

export function validateExperiences(experiences: ResumeExperience[]): string[] {
  const errors: string[] = [];
  for (let i = 0; i < experiences.length; i++) {
    const exp = experiences[i];
    if (!exp?.company?.trim()) {
      errors.push(`نام شرکت ردیف ${i + 1} الزامی است`);
    }
    if (!exp?.position?.trim()) {
      errors.push(`سمت شغلی ردیف ${i + 1} الزامی است`);
    }
  }
  return errors;
}

export function validateCoverLetter(profile: ResumeProfile, body?: string): string[] {
  const errors: string[] = [];
  if (!profile.fullName?.trim()) {
    errors.push('نام فرستنده الزامی است');
  }
  if (!body?.trim()) {
    errors.push('متن نامه الزامی است');
  }
  return errors;
}
