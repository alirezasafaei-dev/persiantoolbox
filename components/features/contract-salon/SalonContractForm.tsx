'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Button } from '@/components/ui';
import UpgradeModal from '@/components/features/pricing/UpgradeModal';
import { useExportToken } from '@/shared/hooks/useExportToken';
import { useExportFunnel } from '@/shared/analytics/useExportFunnel';
import type { SalonData } from '@/lib/contract-salon/types';
import { DISCLAIMER, PRIVACY_TEXT, validateSalon } from '@/lib/contract-salon/types';
import { FEATURE_GATES } from '@/lib/contract-salon/schemas';
import { renderSalonContract } from '@/lib/contract-salon/render';
import {
  saveDraft,
  loadDrafts,
  canSaveDraft,
  createDraftId,
} from '@/lib/contract-salon/draft-storage';
import type { SalonDraft } from '@/lib/contract-salon/draft-storage';
import {
  exportAsHtml,
  exportAsPrintableHtml,
  downloadPdf,
  downloadDocx,
  isDocxAvailable,
} from '@/lib/contract-salon/export';
import { PREMIUM_CLAUSES } from '@/lib/contract-salon/clauses';

const INITIAL_DATA: SalonData = {
  salonName: '',
  salonOwnerName: '',
  salonOwnerNationalId: '',
  salonOwnerPhone: '',
  salonAddress: '',
  workerName: '',
  workerNationalId: '',
  workerPhone: '',
  workerAddress: '',
  serviceType: '',
  servicesOffered: '',
  startDate: '',
  endDate: '',
  workingHours: '',
  workingDays: '',
  salaryType: '',
  baseSalary: '',
  commissionPercent: '',
  paymentDay: '',
  paymentMethod: '',
  toolsProvided: '',
  toolsProvidedBy: '',
  uniformRequired: '',
  hygieneRules: '',
  clientPrivacy: '',
  nonCompete: '',
  trainingPeriod: '',
  terminationNotice: '',
  templateId: 'standard',
  additionalClauses: [],
  description: '',
  witness1: '',
  witness2: '',
  salonOwnerSignature: '',
  workerSignature: '',
};

type Props = {
  isPremium?: boolean;
};

export default function SalonContractForm({ isPremium = false }: Props) {
  const [data, setData] = useState<SalonData>(INITIAL_DATA);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
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
  } = useExportFunnel('salon-contract', 'salon-contract', isPremium);

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

  const draft: SalonDraft = useMemo(
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
        saveDraft(draft);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [draft, isPremium]);

  const updateField = useCallback(<K extends keyof SalonData>(field: K, value: SalonData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    const errs = validateSalon(data);
    setErrors(errs);
    if (errs.length === 0) {
      setActiveTab('preview');
    }
  }, [data]);

  const html = useMemo(
    () =>
      renderSalonContract(data, {
        watermark: featureGate.hasWatermark,
        selectedClauses: featureGate.canAddCustomClauses ? selectedPremiumClauses : [],
      }),
    [data, featureGate.hasWatermark, featureGate.canAddCustomClauses, selectedPremiumClauses],
  );

  const handleExportHtml = useCallback(() => {
    if (!html) {
      return;
    }
    trackExportClick('html');
    exportAsHtml(html, 'قرارداد-سالن-زیبایی.html');
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
      await downloadPdf(html, 'قرارداد-سالن-زیبایی.pdf');
      return;
    }
    const result = await requestToken('salon-contract');
    if (!result) {
      trackTokenIssued('pdf', 'error');
      setErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    trackTokenIssued('pdf', 'success');
    try {
      await downloadPdf(html, 'قرارداد-سالن-زیبایی.pdf');
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
      await downloadDocx(data, 'قرارداد-سالن-زیبایی.docx');
      return;
    }
    const result = await requestToken('salon-contract');
    if (!result) {
      trackTokenIssued('docx', 'error');
      setErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    trackTokenIssued('docx', 'success');
    try {
      await downloadDocx(data, 'قرارداد-سالن-زیبایی.docx');
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

  const inputClass =
    'w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]';
  const labelClass = 'block text-sm font-medium text-[var(--text-primary)] mb-1';

  const renderField = (
    label: string,
    field: keyof SalonData,
    placeholder?: string,
    type = 'text',
  ) => (
    <div className="space-y-1">
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        value={String(data[field] ?? '')}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder ?? label}
        className={inputClass}
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
          قرارداد خدمات زیبایی
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          ساخت قرارداد سالن زیبایی حرفه‌ای با بندهای حقوقی — بدون نیاز به سرور
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--border-light)] pb-2">
        {(['form', 'preview', 'export'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              if (tab === 'preview' || tab === 'export') {
                const errs = validateSalon(data);
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
            {tab === 'form' ? 'فرم اطلاعات' : tab === 'preview' ? 'پیش‌نمایش' : 'دانلود'}
          </button>
        ))}
      </div>

      {featureGate.hasWatermark ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-3 flex items-center gap-2">
          <span className="text-sm">⚠️</span>
          <p className="text-xs text-[var(--color-warning)]">
            نسخه رایگان — واترمارک روی خروجی قرار می‌گیرد. برای حذف واترمارک ارتقا دهید.
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

      {activeTab === 'form' && (
        <Card className="p-6 space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
              اطلاعات سالن زیبایی
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {renderField('نام سالن', 'salonName', 'سالن زیبایی...')}
              {renderField('نام مالک', 'salonOwnerName')}
              {renderField('کد ملی مالک', 'salonOwnerNationalId', '۱۲۳۴۵۶۷۸۹۰')}
              {renderField('تلفن مالک', 'salonOwnerPhone', '۰۹۱۲۱۲۳۴۵۶۷')}
            </div>
            {renderField('آدرس سالن', 'salonAddress')}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
              اطلاعات کارمند/متخصص
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {renderField('نام کامل', 'workerName')}
              {renderField('کد ملی', 'workerNationalId', '۱۲۳۴۵۶۷۸۹۰')}
              {renderField('تلفن', 'workerPhone', '۰۹۱۲۱۲۳۴۵۶۷')}
            </div>
            {renderField('آدرس', 'workerAddress')}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
              شرایط کاری
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className={labelClass}>نوع خدمات</label>
                <select
                  value={data.serviceType}
                  onChange={(e) => updateField('serviceType', e.target.value)}
                  className={inputClass}
                >
                  <option value="">انتخاب کنید...</option>
                  <option value="ناخن (مانیکور/پدیکور)">ناخن (مانیکور/پدیکور)</option>
                  <option value="شنیون و آرایش مو">شنیون و آرایش مو</option>
                  <option value="آرایش صورت">آرایش صورت</option>
                  <option value="اپیلاسیون و لیزر">اپیلاسیون و لیزر</option>
                  <option value="ماساژ و اسپا">ماساژ و اسپا</option>
                  <option value="رنگ و مش مو">رنگ و مش مو</option>
                  <option value="ابرو و ریمل">ابرو و ریمل</option>
                  <option value="خدمات ترکیبی">خدمات ترکیبی</option>
                </select>
              </div>
              {renderField('تاریخ شروع', 'startDate', '', 'date')}
              {renderField('تاریخ پایان', 'endDate', '', 'date')}
              {renderField('ساعت کاری', 'workingHours', '۸ صبح تا ۸ شب')}
              {renderField('روزهای کاری', 'workingDays', 'شنبه تا پنجشنبه')}
            </div>
            <div className="space-y-1">
              <label className={labelClass}>خدمات ارائه‌شده (اختیاری)</label>
              <textarea
                value={data.servicesOffered}
                onChange={(e) => updateField('servicesOffered', e.target.value)}
                placeholder="لیست خدمات..."
                rows={3}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
              شرایط مالی
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className={labelClass}>نوع حقوق</label>
                <select
                  value={data.salaryType}
                  onChange={(e) => updateField('salaryType', e.target.value)}
                  className={inputClass}
                >
                  <option value="">انتخاب کنید...</option>
                  <option value="حقوق ثابت">حقوق ثابت</option>
                  <option value="کمیسیون">کمیسیون (درصدی)</option>
                  <option value="ترکیبی (حقوق + کمیسیون)">ترکیبی (حقوق + کمیسیون)</option>
                </select>
              </div>
              {renderField('حقوق پایه (تومان)', 'baseSalary', '۵,۰۰۰,۰۰۰')}
              {renderField('درصد کمیسیون', 'commissionPercent', '۲۰')}
              {renderField('روز پرداخت', 'paymentDay', 'پایان هر ماه')}
              {renderField('روش پرداخت', 'paymentMethod', 'نقدی / کارت به کارت')}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
              تجهیزات و قوانین
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {renderField('تجهیزات ارائه‌شده', 'toolsProvided', 'ابزار، مواد مصرفی، لباس کار...')}
              <div className="space-y-1">
                <label className={labelClass}>تهیه‌کننده تجهیزات</label>
                <select
                  value={data.toolsProvidedBy}
                  onChange={(e) => updateField('toolsProvidedBy', e.target.value)}
                  className={inputClass}
                >
                  <option value="">انتخاب کنید...</option>
                  <option value="سالن">سالن</option>
                  <option value="کارمند">کارمند</option>
                  <option value="مشترک">مشترک</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>قوانین بهداشتی</label>
              <textarea
                value={data.hygieneRules}
                onChange={(e) => updateField('hygieneRules', e.target.value)}
                placeholder="رعایت اصول بهداشتی..."
                rows={3}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>حریم خصوصی مشتریان</label>
              <textarea
                value={data.clientPrivacy}
                onChange={(e) => updateField('clientPrivacy', e.target.value)}
                placeholder="حفظ اطلاعات مشتریان..."
                rows={2}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
              بندهای اضافی
            </h2>
            {PREMIUM_CLAUSES.map((clause) => (
              <label key={clause.id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPremiumClauses.includes(clause.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPremiumClauses((prev) => [...prev, clause.id]);
                    } else {
                      setSelectedPremiumClauses((prev) => prev.filter((id) => id !== clause.id));
                    }
                  }}
                  disabled={!featureGate.canAddCustomClauses}
                  className="mt-1 h-4 w-4 rounded border-[var(--border-light)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {clause.title}
                  </span>
                  {!featureGate.canAddCustomClauses && (
                    <span className="text-xs text-[var(--text-muted)] mr-2">🔒 پریمیوم</span>
                  )}
                  <p className="text-xs text-[var(--text-muted)]">{clause.text}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
              توضیحات و گواهان
            </h2>
            <div className="space-y-1">
              <label className={labelClass}>توضیحات اضافی</label>
              <textarea
                value={data.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="توضیحات..."
                rows={3}
                className={inputClass}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {renderField('گواه اول', 'witness1')}
              {renderField('گواه دوم', 'witness2')}
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            پیش‌نمایش قرارداد
          </Button>
        </Card>
      )}

      {activeTab === 'preview' && (
        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">پیش‌نمایش قرارداد</h2>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] overflow-hidden">
            <iframe
              srcDoc={html}
              className="w-full min-h-[600px] border-0"
              title="پیش‌نمایش قرارداد"
            />
          </div>
          <div className="rounded-[var(--radius-md)] border border-[rgb(var(--color-info-rgb)/0.3)] bg-[rgb(var(--color-info-rgb)/0.08)] p-4">
            <p className="text-xs text-[var(--color-info)] leading-6">{PRIVACY_TEXT}</p>
          </div>
          <Button onClick={() => setActiveTab('export')} className="w-full">
            رفتن به مرحله دانلود
          </Button>
        </Card>
      )}

      {activeTab === 'export' && (
        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">دانلود قرارداد</h2>

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
        </Card>
      )}

      {showUpgradeModal ? (
        <UpgradeModal
          product="salon-contract"
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
