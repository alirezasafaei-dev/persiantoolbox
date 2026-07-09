'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Button } from '@/components/ui';
import UpgradeModal from '@/components/features/pricing/UpgradeModal';
import { useExportToken } from '@/shared/hooks/useExportToken';
import { useExportFunnel } from '@/shared/analytics/useExportFunnel';
import type {
  EmploymentData,
  EmploymentTemplateId,
  ContractType,
} from '@/lib/business-employment/types';
import { DISCLAIMER, PRIVACY_TEXT, validateEmployment } from '@/lib/business-employment/types';
import { EMPLOYMENT_TEMPLATES, FEATURE_GATES } from '@/lib/business-employment/schemas';
import { renderEmployment } from '@/lib/business-employment/render';
import {
  saveDraft,
  loadDrafts,
  canSaveDraft,
  createDraftId,
} from '@/lib/business-employment/draft-storage';
import type { EmploymentDraft } from '@/lib/business-employment/draft-storage';
import {
  exportAsHtml,
  exportAsPrintableHtml,
  downloadPdf,
  downloadDocx,
  isDocxAvailable,
} from '@/lib/business-employment/export';

const INITIAL_DATA: EmploymentData = {
  employerName: '',
  employerNationalId: '',
  employerPhone: '',
  employerAddress: '',
  employerEconomicCode: '',
  employeeName: '',
  employeeNationalId: '',
  employeePhone: '',
  employeeAddress: '',
  employeeFatherName: '',
  employeeBirthDate: '',
  jobTitle: '',
  department: '',
  workplace: '',
  startDate: '',
  endDate: '',
  contractType: 'permanent',
  probationaryPeriod: '',
  baseSalary: '',
  housingAllowance: '',
  foodAllowance: '',
  transportation: '',
  overtimeRate: '',
  bonus: '',
  insuranceType: '',
  dailyWorkingHours: '',
  weeklyDaysOff: '',
  annualLeave: '',
  sickLeave: '',
  templateId: 'standard',
  additionalClauses: [],
  description: '',
  employerSignature: '',
  employeeSignature: '',
};

type Props = {
  isPremium?: boolean;
};

export default function EmploymentContractForm({ isPremium = false }: Props) {
  const [data, setData] = useState<EmploymentData>(INITIAL_DATA);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [draftLimitReached, setDraftLimitReached] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'export'>('form');
  const [selectedPremiumClauses, setSelectedPremiumClauses] = useState<string[]>([]);
  const { requestToken, confirmExport, cancelReservation } = useExportToken();
  const {
    trackExportClick,
    trackUpgradeView,
    trackTokenIssued,
    trackExportConfirm,
    trackExportCancel,
  } = useExportFunnel('employment-contract', 'employment-contract', isPremium);

  const featureGate = isPremium ? FEATURE_GATES.premium : FEATURE_GATES.free;

  const draftId = useMemo(() => createDraftId(), []);

  useEffect(() => {
    const drafts = loadDrafts();
    const latest = drafts[drafts.length - 1];
    if (latest) {
      setData(latest.data);
      setSelectedPremiumClauses(latest.selectedPremiumClauses);
    }
  }, []);

  const draft: EmploymentDraft = useMemo(
    () => ({
      id: draftId,
      data,
      selectedPremiumClauses,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [data, selectedPremiumClauses, draftId],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPremium || canSaveDraft()) {
        setDraftLimitReached(false);
        saveDraft(draft);
      } else {
        setDraftLimitReached(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [draft, isPremium]);

  const updateField = useCallback(
    <K extends keyof EmploymentData>(field: K, value: EmploymentData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    const errs = validateEmployment(data);
    setErrors(errs);
    if (errs.length === 0) {
      setActiveTab('preview');
    }
  }, [data]);

  const html = useMemo(
    () =>
      renderEmployment(data, {
        watermark: featureGate.hasWatermark,
        premiumClauses: featureGate.canAddCustomClauses ? selectedPremiumClauses : [],
      }),
    [data, featureGate.hasWatermark, featureGate.canAddCustomClauses, selectedPremiumClauses],
  );

  const handleExportHtml = useCallback(() => {
    if (!html) {
      return;
    }
    trackExportClick('html');
    exportAsHtml(html, 'قرارداد-کار.html');
  }, [html, trackExportClick]);

  const handlePrint = useCallback(() => {
    if (!html) {
      return;
    }
    trackExportClick('print');
    exportAsPrintableHtml(html);
  }, [html, trackExportClick]);

  const handleExportPdf = useCallback(async () => {
    if (!html) {
      return;
    }
    trackExportClick('pdf');
    if (featureGate.hasWatermark) {
      await downloadPdf(html, 'قرارداد-کار.pdf');
      return;
    }
    const result = await requestToken('employment-contract');
    if (!result) {
      trackTokenIssued('pdf', 'error');
      setErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    trackTokenIssued('pdf', 'success');
    try {
      await downloadPdf(html, 'قرارداد-کار.pdf');
      if (result.reservationId) {
        await confirmExport(result.reservationId);
        trackExportConfirm('pdf');
      }
    } catch {
      if (result.reservationId) {
        await cancelReservation(result.reservationId);
        trackExportCancel('pdf');
      }
      setErrors(['خطا در دانلود فایل. اعتبار شما برگردانده شد.']);
    }
  }, [
    html,
    featureGate.hasWatermark,
    requestToken,
    confirmExport,
    cancelReservation,
    trackExportClick,
    trackTokenIssued,
    trackExportConfirm,
    trackExportCancel,
  ]);

  const handleExportDocx = useCallback(async () => {
    trackExportClick('docx');
    if (featureGate.hasWatermark) {
      await downloadDocx(data, 'قرارداد-کار.docx');
      return;
    }
    const result = await requestToken('employment-contract');
    if (!result) {
      trackTokenIssued('docx', 'error');
      setErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    trackTokenIssued('docx', 'success');
    try {
      await downloadDocx(data, 'قرارداد-کار.docx');
      if (result.reservationId) {
        await confirmExport(result.reservationId);
        trackExportConfirm('docx');
      }
    } catch {
      if (result.reservationId) {
        await cancelReservation(result.reservationId);
        trackExportCancel('docx');
      }
      setErrors(['خطا در دانلود فایل. اعتبار شما برگردانده شد.']);
    }
  }, [
    data,
    featureGate.hasWatermark,
    requestToken,
    confirmExport,
    cancelReservation,
    trackExportClick,
    trackTokenIssued,
    trackExportConfirm,
    trackExportCancel,
  ]);

  const isTemplateLocked = (id: EmploymentTemplateId) =>
    !featureGate.availableTemplates.includes(id);

  const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
    { value: 'permanent', label: 'دائم' },
    { value: 'fixed-term', label: 'مدت معین' },
    { value: 'part-time', label: 'پاره وقت' },
    { value: 'probationary', label: 'آزمایشی' },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">قرارداد کار</h1>
        <p className="text-sm text-[var(--text-muted)]">
          ساخت قرارداد کار حرفه‌ای با بندهای حقوقی — بدون نیاز به سرور
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--border-light)] pb-2">
        {(['form', 'preview', 'export'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              if (tab === 'preview' || tab === 'export') {
                const errs = validateEmployment(data);
                setErrors(errs);
                if (errs.length > 0) {
                  return;
                }
              }
              setActiveTab(tab);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {(() => {
              if (tab === 'form') {
                return 'فرم اطلاعات';
              }
              if (tab === 'preview') {
                return 'پیش‌نمایش';
              }
              return 'دانلود';
            })()}
          </button>
        ))}
      </div>

      {featureGate.hasWatermark ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-3 flex items-center gap-2">
          <span className="text-sm">⚠️</span>
          <p className="text-xs text-[var(--color-warning)]">
            نسخه رایگان — واترمارک روی خروجی قرار می‌گیرد. برای حذف واترمارک و قالب‌های بیشتر ارتقا
            دهید.
          </p>
        </div>
      ) : null}

      {errors.length > 0 && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-3">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-[var(--color-danger)]" role="alert">
              {e}
            </p>
          ))}
        </div>
      )}

      {draftLimitReached ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-3">
          <p className="text-xs text-[var(--color-warning)]">
            حداکثر ۲ پیش‌نویس رایگان ذخیره شده است. برای ذخیره بیشتر، اشتراک حرفه‌ای تهیه کنید.
          </p>
        </div>
      ) : null}

      <Card className="p-6">
        {activeTab === 'form' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">کارفرما</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="نام کارفرما *"
                  value={data.employerName}
                  onChange={(v) => updateField('employerName', v)}
                />
                <FormField
                  label="کد ملی / شماره ثبت *"
                  value={data.employerNationalId}
                  onChange={(v) => updateField('employerNationalId', v)}
                />
                <FormField
                  label="تلفن *"
                  value={data.employerPhone}
                  onChange={(v) => updateField('employerPhone', v)}
                />
                <FormField
                  label="کد اقتصادی"
                  value={data.employerEconomicCode ?? ''}
                  onChange={(v) => updateField('employerEconomicCode', v)}
                />
                <div className="md:col-span-2">
                  <FormField
                    label="آدرس *"
                    value={data.employerAddress}
                    onChange={(v) => updateField('employerAddress', v)}
                  />
                </div>
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">کارمند</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="نام و نام خانوادگی *"
                  value={data.employeeName}
                  onChange={(v) => updateField('employeeName', v)}
                />
                <FormField
                  label="کد ملی *"
                  value={data.employeeNationalId}
                  onChange={(v) => updateField('employeeNationalId', v)}
                />
                <FormField
                  label="تلفن *"
                  value={data.employeePhone}
                  onChange={(v) => updateField('employeePhone', v)}
                />
                <FormField
                  label="نام پدر"
                  value={data.employeeFatherName ?? ''}
                  onChange={(v) => updateField('employeeFatherName', v)}
                />
                <FormField
                  label="تاریخ تولد"
                  type="date"
                  value={data.employeeBirthDate ?? ''}
                  onChange={(v) => updateField('employeeBirthDate', v)}
                />
                <div className="md:col-span-2">
                  <FormField
                    label="آدرس *"
                    value={data.employeeAddress}
                    onChange={(v) => updateField('employeeAddress', v)}
                  />
                </div>
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">مشخصات شغلی</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="عنوان شغلی *"
                  value={data.jobTitle}
                  onChange={(v) => updateField('jobTitle', v)}
                />
                <FormField
                  label="واحد / دپارتمان"
                  value={data.department ?? ''}
                  onChange={(v) => updateField('department', v)}
                />
                <div className="md:col-span-2">
                  <FormField
                    label="محل کار *"
                    value={data.workplace}
                    onChange={(v) => updateField('workplace', v)}
                  />
                </div>
                <FormField
                  label="تاریخ شروع *"
                  type="date"
                  value={data.startDate}
                  onChange={(v) => updateField('startDate', v)}
                />
                <FormField
                  label="تاریخ پایان"
                  type="date"
                  value={data.endDate ?? ''}
                  onChange={(v) => updateField('endDate', v)}
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">نوع قرارداد</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    نوع قرارداد *
                  </label>
                  <select
                    value={data.contractType}
                    onChange={(e) => updateField('contractType', e.target.value as ContractType)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    {CONTRACT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <FormField
                  label="مدت آزمایش (روز)"
                  value={data.probationaryPeriod ?? ''}
                  onChange={(v) => updateField('probationaryPeriod', v)}
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">حقوق و مزایا</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="حقوق پایه (ریال) *"
                  value={data.baseSalary}
                  onChange={(v) => updateField('baseSalary', v)}
                />
                <FormField
                  label="حق مسکن"
                  value={data.housingAllowance ?? ''}
                  onChange={(v) => updateField('housingAllowance', v)}
                />
                <FormField
                  label="حق تغذیه"
                  value={data.foodAllowance ?? ''}
                  onChange={(v) => updateField('foodAllowance', v)}
                />
                <FormField
                  label="ایاب و ذهاب"
                  value={data.transportation ?? ''}
                  onChange={(v) => updateField('transportation', v)}
                />
                <FormField
                  label="نرخ اضافه کار"
                  value={data.overtimeRate ?? ''}
                  onChange={(v) => updateField('overtimeRate', v)}
                />
                <FormField
                  label="پاداش"
                  value={data.bonus ?? ''}
                  onChange={(v) => updateField('bonus', v)}
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">بیمه و ساعات کار</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="نوع بیمه *"
                  value={data.insuranceType}
                  onChange={(v) => updateField('insuranceType', v)}
                  placeholder="مثال: تأمین اجتماعی"
                />
                <FormField
                  label="ساعت کار روزانه *"
                  value={data.dailyWorkingHours}
                  onChange={(v) => updateField('dailyWorkingHours', v)}
                />
                <FormField
                  label="روزهای تعطیل هفتگی *"
                  value={data.weeklyDaysOff}
                  onChange={(v) => updateField('weeklyDaysOff', v)}
                />
                <FormField
                  label="مرخصی سالانه *"
                  value={data.annualLeave}
                  onChange={(v) => updateField('annualLeave', v)}
                />
                <FormField
                  label="مرخصی استعلاجی"
                  value={data.sickLeave ?? ''}
                  onChange={(v) => updateField('sickLeave', v)}
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">قالب قرارداد</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {EMPLOYMENT_TEMPLATES.map((tpl) => {
                  const locked = isTemplateLocked(tpl.id);
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        if (locked) {
                          setShowUpgradeModal(true);
                          return;
                        }
                        updateField('templateId', tpl.id);
                      }}
                      className={`relative rounded-[var(--radius-md)] border-2 p-4 text-right transition-all ${
                        data.templateId === tpl.id
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                          : 'border-[var(--border-light)] hover:border-[var(--color-primary)]/50'
                      } ${locked ? 'opacity-60' : ''}`}
                    >
                      {locked ? (
                        <span className="absolute top-2 left-2 text-xs text-[var(--color-warning)]">
                          🔒 پریمیوم
                        </span>
                      ) : null}
                      <h3 className="font-bold text-sm text-[var(--text-primary)]">{tpl.title}</h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{tpl.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">امضا</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <SignatureUpload
                  label="امضای کارفرما"
                  value={data.employerSignature ?? ''}
                  disabled={!featureGate.canUseSignature}
                  onUpgrade={() => setShowUpgradeModal(true)}
                  onChange={(v) => updateField('employerSignature', v)}
                />
                <SignatureUpload
                  label="امضای کارمند"
                  value={data.employeeSignature ?? ''}
                  disabled={!featureGate.canUseSignature}
                  onUpgrade={() => setShowUpgradeModal(true)}
                  onChange={(v) => updateField('employeeSignature', v)}
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">توضیحات</h2>
              <textarea
                value={data.description ?? ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="توضیحات اضافی (اختیاری)"
                rows={3}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div className="rounded-[var(--radius-md)] border border-[rgb(var(--color-info-rgb)/0.3)] bg-[rgb(var(--color-info-rgb)/0.08)] p-4">
              <p className="text-xs text-[var(--color-info)] leading-6">{PRIVACY_TEXT}</p>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleSubmit}>مشاهده پیش‌نمایش</Button>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">پیش‌نمایش قرارداد</h2>
            <p className="text-sm text-[var(--text-muted)]">
              قرارداد را بررسی کنید. قبل از دانلود، سلب مسئولیت را تأیید کنید.
            </p>
            <PreviewFrame html={html} />
            <div className="flex gap-3">
              <Button variant="tertiary" onClick={() => setActiveTab('form')}>
                بازگشت به فرم
              </Button>
              <Button onClick={() => setActiveTab('export')}>تأیید و دانلود</Button>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">دانلود قرارداد</h2>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={disclaimerAccepted}
                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--border-light)] text-[var(--color-primary)]"
                aria-label="تأیید سلب مسئولیت"
              />
              <span className="text-xs text-[var(--text-secondary)] leading-5">{DISCLAIMER}</span>
            </label>
            {disclaimerAccepted ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Button onClick={handleExportHtml} variant="primary">
                  دانلود HTML
                </Button>
                <Button onClick={handlePrint} variant="secondary">
                  چاپ
                </Button>
                {featureGate.canExportPdf ? (
                  <Button onClick={handleExportPdf} variant="primary">
                    چاپ / ذخیره PDF
                  </Button>
                ) : null}
                {featureGate.canExportDocx && isDocxAvailable() ? (
                  <Button onClick={handleExportDocx} variant="primary">
                    دانلود Word
                  </Button>
                ) : null}
              </div>
            ) : null}
            {!featureGate.canExportPdf && (
              <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-4 text-center space-y-2">
                <p className="text-xs text-[var(--color-warning)]">
                  دانلود PDF و Word در نسخه پریمیوم فعال است.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    trackUpgradeView();
                    setShowUpgradeModal(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-[var(--text-inverted)] transition-all hover:opacity-90"
                >
                  🎯 خروجی بدون واترمارک
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {showUpgradeModal ? (
        <UpgradeModal
          product="employment-contract"
          onClose={() => setShowUpgradeModal(false)}
          onUpgradeSuccess={() => {
            setShowUpgradeModal(false);
            window.location.reload();
          }}
        />
      ) : null}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-[var(--text-secondary)] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function SignatureUpload({
  label,
  value,
  disabled,
  onUpgrade,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onUpgrade: () => void;
  onChange: (v: string) => void;
}) {
  if (disabled) {
    return (
      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">{label}</label>
        <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">افزودن امضا در نسخه پریمیوم</p>
          <button
            type="button"
            onClick={onUpgrade}
            className="mt-1 text-xs text-[var(--color-primary)] underline"
          >
            ارتقا دهید
          </button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <label className="block text-sm text-[var(--text-secondary)] mb-1">{label}</label>
      <input
        type="file"
        accept="image/*"
        aria-label="انتخاب تصویر"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => onChange(ev.target?.result as string);
            reader.readAsDataURL(file);
          }
        }}
        className="w-full text-sm text-[var(--text-muted)] file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[var(--color-primary)] file:text-[var(--text-inverted)] file:text-xs file:cursor-pointer"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {value ? <img src={value} alt={label} className="mt-2 max-h-12 object-contain" /> : null}
    </div>
  );
}

function PreviewFrame({ html }: { html: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">در حال بارگذاری پیش‌نمایش...</p>
      </div>
    );
  }
  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--border-light)] overflow-hidden"
      style={{ maxHeight: '600px', overflowY: 'auto' }}
    >
      <iframe
        title="پیش‌نمایش قرارداد کار"
        srcDoc={html}
        className="w-full border-0"
        style={{ minHeight: '500px' }}
        sandbox="allow-same-origin"
      />
    </div>
  );
}
