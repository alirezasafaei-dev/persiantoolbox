import type {
  CareerDocumentType,
  ResumeExperience,
  ResumeEducation,
  ResumeSkill,
  ResumeLanguage,
  ResumeProject,
  ResumeCertification,
} from './types';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(num: number | string): string {
  return String(num).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) {
    return '';
  }
  const d = new Date(dateStr);
  return toPersianDigits(d.toLocaleDateString('fa-IR'));
}

export function formatDateEn(dateStr: string): string {
  if (!dateStr) {
    return '';
  }
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

export function generateResumeId(): string {
  return `resume_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getDocumentTitle(type: CareerDocumentType): string {
  const titles: Record<CareerDocumentType, string> = {
    'resume-fa': 'رزومه فارسی',
    'resume-en': 'رزومه انگلیسی',
    'cover-letter': 'کاورلتر',
  };
  return titles[type];
}

export function createEmptyExperience(): ResumeExperience {
  return {
    id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  };
}

export function createEmptyEducation(): ResumeEducation {
  return {
    id: `edu_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: '',
  };
}

export function createEmptySkill(): ResumeSkill {
  return {
    id: `skill_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    level: 'متوسط',
  };
}

export function createEmptyLanguage(): ResumeLanguage {
  return {
    id: `lang_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    level: 'متوسط',
  };
}

export function createEmptyProject(): ResumeProject {
  return {
    id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    description: '',
    url: '',
    technologies: '',
  };
}

export function createEmptyCertification(): ResumeCertification {
  return {
    id: `cert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    issuer: '',
    date: '',
    url: '',
  };
}
