'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Button } from '@/components/ui';
import UpgradeModal from '@/components/features/pricing/UpgradeModal';
import { useExportToken } from '@/shared/hooks/useExportToken';
import type {
  ResumeDraft,
  CareerDocumentType,
  ResumeProfile,
  ResumeExperience,
  ResumeEducation,
  ResumeSkill,
  ResumeLanguage,
  ResumeProject,
  ResumeCertification,
} from '@/lib/career-documents/types';
import {
  DISCLAIMER,
  PRIVACY_TEXT,
  validateProfile,
  validateExperiences,
} from '@/lib/career-documents/types';
import { DOCUMENT_TYPES, FEATURE_GATES } from '@/lib/career-documents/schemas';
import { renderDocument } from '@/lib/career-documents/render';
import {
  saveDraft,
  loadDrafts,
  loadDraft,
  canSaveDraft,
  createDraftId,
} from '@/lib/career-documents/draft-storage';
import {
  exportAsHtml,
  exportAsPrintableHtml,
  downloadPdf,
  downloadDocx,
  isDocxAvailable,
} from '@/lib/career-documents/export';

import CareerTypeSelector from './CareerTypeSelector';
import ProfileForm from './ProfileForm';
import SummaryEditor from './SummaryEditor';
import CoverLetterEditor from './CoverLetterEditor';
import SectionEditor from './SectionEditor';
import CareerPreview from './CareerPreview';

type Step =
  | 'type-select'
  | 'profile'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'projects'
  | 'certifications'
  | 'settings'
  | 'preview'
  | 'export';

const RESUME_STEP_ORDER: Step[] = [
  'type-select',
  'profile',
  'summary',
  'experience',
  'education',
  'skills',
  'languages',
  'projects',
  'certifications',
  'settings',
  'preview',
  'export',
];

const COVER_LETTER_STEP_ORDER: Step[] = [
  'type-select',
  'profile',
  'summary',
  'settings',
  'preview',
  'export',
];

const STEP_LABELS: Record<Step, string> = {
  'type-select': 'انتخاب نوع سند',
  profile: 'اطلاعات فردی',
  summary: 'خلاصه حرفه‌ای',
  experience: 'سوابق شغلی',
  education: 'تحصیلات',
  skills: 'مهارت‌ها',
  languages: 'زبان‌ها',
  projects: 'پروژه‌ها / نمونه‌کارها',
  certifications: 'گواهینامه‌ها و افتخارات',
  settings: 'تنظیمات قالب',
  preview: 'پیش‌نمایش',
  export: 'دانلود',
};

type Props = {
  initialDocumentType?: CareerDocumentType;
  isPremium?: boolean;
};

function createEmptyProfile(): ResumeProfile {
  return {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    github: '',
    portfolio: '',
    photoDataUrl: '',
    summary: '',
  };
}

export default function CareerWizard({ initialDocumentType, isPremium = false }: Props) {
  const [step, setStep] = useState<Step>(() => (initialDocumentType ? 'profile' : 'type-select'));
  const [documentType, setDocumentType] = useState<CareerDocumentType | null>(
    initialDocumentType ?? null,
  );
  const [profile, setProfile] = useState<ResumeProfile>(createEmptyProfile);
  const [summary, setSummary] = useState('');
  const [experiences, setExperiences] = useState<ResumeExperience[]>([]);
  const [education, setEducation] = useState<ResumeEducation[]>([]);
  const [skills, setSkills] = useState<ResumeSkill[]>([]);
  const [languages, setLanguages] = useState<ResumeLanguage[]>([]);
  const [projects, setProjects] = useState<ResumeProject[]>([]);
  const [certifications, setCertifications] = useState<ResumeCertification[]>([]);
  const [coverLetterRecipient, setCoverLetterRecipient] = useState('');
  const [coverLetterCompany, setCoverLetterCompany] = useState('');
  const [coverLetterPosition, setCoverLetterPosition] = useState('');
  const [coverLetterBody, setCoverLetterBody] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [draftId] = useState(() => createDraftId());
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [draftLimitReached, setDraftLimitReached] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { requestToken } = useExportToken();

  const featureGate = documentType
    ? isPremium
      ? FEATURE_GATES[documentType].premium
      : FEATURE_GATES[documentType].free
    : null;

  const isCoverLetter = documentType === 'cover-letter';
  const stepOrder = isCoverLetter ? COVER_LETTER_STEP_ORDER : RESUME_STEP_ORDER;
  const stepIndex = stepOrder.indexOf(step);
  const progress = stepOrder.length > 1 ? ((stepIndex + 1) / stepOrder.length) * 100 : 0;

  const rtl = documentType !== 'resume-en';

  useEffect(() => {
    if (!documentType) {
      return;
    }
    const drafts = loadDrafts().filter((d) => d.documentType === documentType);
    const latest = drafts[drafts.length - 1];
    if (latest) {
      setProfile(latest.profile);
      setSummary(latest.profile.summary ?? '');
      setExperiences(latest.experiences);
      setEducation(latest.education);
      setSkills(latest.skills);
      setLanguages(latest.languages);
      setProjects(latest.projects);
      setCertifications(latest.certifications);
      setCoverLetterRecipient(latest.coverLetterRecipient ?? '');
      setCoverLetterCompany(latest.coverLetterCompany ?? '');
      setCoverLetterPosition(latest.coverLetterPosition ?? '');
      setCoverLetterBody(latest.coverLetterBody ?? '');
    }
  }, [documentType]);

  const draft: ResumeDraft | null = useMemo(() => {
    if (!documentType) {
      return null;
    }
    return {
      id: draftId,
      documentType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: { ...profile, summary },
      experiences,
      education,
      skills,
      languages,
      projects,
      certifications,
      templateId: documentType,
      ...(coverLetterRecipient ? { coverLetterRecipient } : {}),
      ...(coverLetterCompany ? { coverLetterCompany } : {}),
      ...(coverLetterPosition ? { coverLetterPosition } : {}),
      ...(coverLetterBody ? { coverLetterBody } : {}),
    };
  }, [
    documentType,
    profile,
    summary,
    experiences,
    education,
    skills,
    languages,
    projects,
    certifications,
    coverLetterRecipient,
    coverLetterCompany,
    coverLetterPosition,
    coverLetterBody,
    draftId,
  ]);

  useEffect(() => {
    if (!draft) {
      return;
    }
    const isExistingDraft = loadDraft(draft.id) !== undefined;
    if (isExistingDraft || isPremium || canSaveDraft(draft.documentType)) {
      setDraftLimitReached(false);
      const timer = setTimeout(() => {
        saveDraft(draft);
      }, 1000);
      return () => clearTimeout(timer);
    }
    setDraftLimitReached(true);
    return undefined;
  }, [draft, isPremium]);

  const handleTypeSelect = useCallback((type: CareerDocumentType) => {
    setDocumentType(type);
    setStepErrors([]);
  }, []);

  const validateCurrentStep = useCallback((): string[] => {
    switch (step) {
      case 'profile':
        return validateProfile(profile);
      case 'experience':
        return validateExperiences(experiences);
      case 'summary':
        if (!summary.trim() && !isCoverLetter) {
          return ['خلاصه حرفه‌ای الزامی است'];
        }
        return [];
      default:
        return [];
    }
  }, [step, profile, experiences, summary, isCoverLetter]);

  const goNext = useCallback(() => {
    const errors = validateCurrentStep();
    if (errors.length > 0) {
      setStepErrors(errors);
      return;
    }
    setStepErrors([]);
    const idx = stepOrder.indexOf(step);
    if (idx < stepOrder.length - 1) {
      setStep(stepOrder[idx + 1]!);
    }
  }, [step, stepOrder, validateCurrentStep]);

  const goBack = useCallback(() => {
    setStepErrors([]);
    const idx = stepOrder.indexOf(step);
    if (idx > 0) {
      setStep(stepOrder[idx - 1]!);
    }
  }, [step, stepOrder]);

  const handleProfileChange = useCallback(
    (newProfile: ResumeProfile) => {
      setProfile(newProfile);
      setSummary(newProfile.summary ?? summary);
    },
    [summary],
  );

  const handleCoverLetterChange = useCallback(
    (fields: { recipient: string; company: string; position: string; body: string }) => {
      setCoverLetterRecipient(fields.recipient);
      setCoverLetterCompany(fields.company);
      setCoverLetterPosition(fields.position);
      setCoverLetterBody(fields.body);
    },
    [],
  );

  const html = useMemo(() => {
    if (!draft) {
      return '';
    }
    return renderDocument(draft, {
      watermark: featureGate?.hasWatermark ?? true,
      rtl,
    });
  }, [draft, featureGate, rtl]);

  const handleExportHtml = useCallback(() => {
    if (!html) {
      return;
    }
    const title = DOCUMENT_TYPES.find((t) => t.documentType === documentType)?.title ?? 'document';
    exportAsHtml(html, `${title}.html`);
  }, [html, documentType]);

  const handlePrint = useCallback(() => {
    if (!html) {
      return;
    }
    exportAsPrintableHtml(html);
  }, [html]);

  const handleExportPdf = useCallback(async () => {
    if (!html) {
      return;
    }
    if (featureGate?.hasWatermark) {
      const title =
        DOCUMENT_TYPES.find((t) => t.documentType === documentType)?.title ?? 'document';
      await downloadPdf(html, `${title}.pdf`);
      return;
    }
    const token = await requestToken('career');
    if (!token) {
      setStepErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    const title = DOCUMENT_TYPES.find((t) => t.documentType === documentType)?.title ?? 'document';
    await downloadPdf(html, `${title}.pdf`);
  }, [html, documentType, featureGate, requestToken]);

  const handleExportDocx = useCallback(async () => {
    if (!draft) {
      return;
    }
    if (featureGate?.hasWatermark) {
      const title =
        DOCUMENT_TYPES.find((t) => t.documentType === documentType)?.title ?? 'document';
      await downloadDocx(draft, `${title}.docx`);
      return;
    }
    const token = await requestToken('career');
    if (!token) {
      setStepErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    const title = DOCUMENT_TYPES.find((t) => t.documentType === documentType)?.title ?? 'document';
    await downloadDocx(draft, `${title}.docx`);
  }, [draft, documentType, featureGate, requestToken]);

  const canGoNext = step !== 'export';

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            {documentType
              ? (DOCUMENT_TYPES.find((t) => t.documentType === documentType)?.title ??
                'رزومه‌ساز حرفه‌ای')
              : 'رزومه‌ساز حرفه‌ای'}
          </h1>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          ساخت رزومه فارسی، رزومه انگلیسی و کاورلتر — بدون نیاز به سرور
        </p>
      </div>

      <nav aria-label="مراحل سند" className="space-y-2">
        <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
          {stepOrder.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  i < stepIndex
                    ? 'bg-[var(--color-success)] text-white'
                    : i === stepIndex
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                }`}
              >
                {i < stepIndex ? '✓' : i + 1}
              </span>
              <span
                className={`${i === stepIndex ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)]'}`}
              >
                {STEP_LABELS[s]}
              </span>
              {i < stepOrder.length - 1 && <span className="text-[var(--text-muted)]">←</span>}
            </div>
          ))}
        </div>
        <div className="h-1.5 rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </nav>

      {featureGate?.hasWatermark && step !== 'type-select' && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-3 flex items-center gap-2">
          <span className="text-sm">⚠️</span>
          <p className="text-xs text-[var(--color-warning)]">
            نسخه رایگان — واترمارک روی خروجی قرار می‌گیرد. برای حذف واترمارک ارتقا دهید.
          </p>
        </div>
      )}

      <Card className="p-6">
        {stepErrors.length > 0 && (
          <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-3">
            {stepErrors.map((e, i) => (
              <p key={i} className="text-xs text-[var(--color-danger)]" role="alert">
                {e}
              </p>
            ))}
          </div>
        )}

        {draftLimitReached && (
          <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-3">
            <p className="text-xs text-[var(--color-warning)]">
              حداکثر ۲ پیش‌نویس رایگان ذخیره شده است. برای ذخیره بیشتر، اشتراک حرفه‌ای تهیه کنید.
            </p>
          </div>
        )}

        {step === 'type-select' && (
          <CareerTypeSelector selected={documentType} onSelect={handleTypeSelect} />
        )}

        {step === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">اطلاعات فردی</h2>
            <ProfileForm
              profile={profile}
              errors={[]}
              onChange={handleProfileChange}
              isPremium={isPremium}
            />
          </div>
        )}

        {step === 'summary' && isCoverLetter && (
          <CoverLetterEditor
            recipient={coverLetterRecipient}
            company={coverLetterCompany}
            position={coverLetterPosition}
            body={coverLetterBody}
            errors={stepErrors}
            onChange={handleCoverLetterChange}
          />
        )}

        {step === 'summary' && !isCoverLetter && (
          <SummaryEditor value={summary} onChange={setSummary} />
        )}

        {step === 'experience' && (
          <SectionEditor
            sectionType="experience"
            items={experiences}
            onUpdate={(items) => setExperiences(items as ResumeExperience[])}
            errors={stepErrors}
          />
        )}

        {step === 'education' && (
          <SectionEditor
            sectionType="education"
            items={education}
            onUpdate={(items) => setEducation(items as ResumeEducation[])}
            errors={stepErrors}
          />
        )}

        {step === 'skills' && (
          <SectionEditor
            sectionType="skills"
            items={skills}
            onUpdate={(items) => setSkills(items as ResumeSkill[])}
            errors={stepErrors}
          />
        )}

        {step === 'languages' && (
          <SectionEditor
            sectionType="languages"
            items={languages}
            onUpdate={(items) => setLanguages(items as ResumeLanguage[])}
            errors={stepErrors}
          />
        )}

        {step === 'projects' && (
          <SectionEditor
            sectionType="projects"
            items={projects}
            onUpdate={(items) => setProjects(items as ResumeProject[])}
            errors={stepErrors}
          />
        )}

        {step === 'certifications' && (
          <SectionEditor
            sectionType="certifications"
            items={certifications}
            onUpdate={(items) => setCertifications(items as ResumeCertification[])}
            errors={stepErrors}
          />
        )}

        {step === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">تنظیمات قالب</h2>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-primary)]">نوع سند</span>
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {DOCUMENT_TYPES.find((t) => t.documentType === documentType)?.title}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-primary)]">جهت صفحه</span>
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {rtl ? 'راست‌به‌چپ (RTL)' : 'چپ‌به‌راست (LTR)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-primary)]">نسخه</span>
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {isPremium ? 'پریمیوم' : 'رایگان'}
                </span>
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[rgb(var(--color-info-rgb)/0.3)] bg-[rgb(var(--color-info-rgb)/0.08)] p-4">
              <p className="text-xs text-[var(--color-info)] leading-6">{PRIVACY_TEXT}</p>
            </div>
          </div>
        )}

        {step === 'preview' && draft && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">پیش‌نمایش سند</h2>
            <p className="text-sm text-[var(--text-muted)]">
              سند را بررسی کنید. قبل از دانلود، سلب مسئولیت را تأیید کنید.
            </p>
            <CareerPreview draft={draft} showWatermark={featureGate?.hasWatermark ?? true} />
            <div className="rounded-[var(--radius-md)] border border-[rgb(var(--color-info-rgb)/0.3)] bg-[rgb(var(--color-info-rgb)/0.08)] p-4">
              <p className="text-xs text-[var(--color-info)] leading-6">{PRIVACY_TEXT}</p>
            </div>
          </div>
        )}

        {step === 'export' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">دانلود سند</h2>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={disclaimerAccepted}
                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--border-light)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                aria-label="تأیید سلب مسئولیت"
              />
              <span className="text-xs text-[var(--text-secondary)] leading-5">{DISCLAIMER}</span>
            </label>

            {disclaimerAccepted && (
              <div className="grid gap-3 md:grid-cols-2">
                <Button onClick={handleExportHtml} variant="primary">
                  دانلود HTML
                </Button>
                <Button onClick={handlePrint} variant="secondary">
                  چاپ
                </Button>
                {featureGate?.canExportPdf && (
                  <div className="space-y-2">
                    <Button onClick={handleExportPdf} variant="primary">
                      چاپ / ذخیره PDF
                    </Button>
                    <p className="text-xs text-[var(--text-muted)]">
                      پنجره چاپ مرورگر باز می‌شود. در آن گزینه «ذخیره به‌عنوان PDF» را انتخاب کنید.
                    </p>
                  </div>
                )}
                {featureGate?.canExportDocx && isDocxAvailable() && (
                  <Button onClick={handleExportDocx} variant="primary">
                    دانلود Word
                  </Button>
                )}
              </div>
            )}

            {!featureGate?.canExportPdf && (
              <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-4 text-center space-y-2">
                <p className="text-xs text-[var(--color-warning)]">
                  دانلود PDF و Word در نسخه پریمیوم فعال است.
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  می‌توانید از خروجی HTML استفاده کنید یا از مرورگر چاپ کنید.
                </p>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-[var(--text-inverted)] transition-all hover:opacity-90"
                >
                  🎯 خروجی بدون واترمارک
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="tertiary" onClick={goBack} disabled={stepIndex === 0}>
          بازگشت
        </Button>
        {canGoNext && (
          <Button onClick={goNext}>{step === 'preview' ? 'تأیید و دانلود' : 'مرحله بعد'}</Button>
        )}
      </div>

      {showUpgradeModal && (
        <UpgradeModal
          product="career"
          onClose={() => setShowUpgradeModal(false)}
          onUpgradeSuccess={() => {
            setShowUpgradeModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
