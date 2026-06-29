'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Button } from '@/components/ui';
import UpgradeModal from '@/components/features/pricing/UpgradeModal';
import { useExportToken } from '@/shared/hooks/useExportToken';
import type { LeaseData, LeaseTemplateId } from '@/lib/contract-lease/types';
import { DISCLAIMER, PRIVACY_TEXT, validateLease } from '@/lib/contract-lease/types';
import { LEASE_TEMPLATES, FEATURE_GATES } from '@/lib/contract-lease/schemas';
import { renderLease } from '@/lib/contract-lease/render';
import {
  saveDraft,
  loadDrafts,
  canSaveDraft,
  createDraftId,
} from '@/lib/contract-lease/draft-storage';
import type { LeaseDraft } from '@/lib/contract-lease/draft-storage';
import {
  exportAsHtml,
  exportAsPrintableHtml,
  downloadPdf,
  downloadDocx,
  isDocxAvailable,
} from '@/lib/contract-lease/export';

const INITIAL_DATA: LeaseData = {
  landlordName: '',
  landlordNationalId: '',
  landlordPhone: '',
  landlordAddress: '',
  tenantName: '',
  tenantNationalId: '',
  tenantPhone: '',
  tenantAddress: '',
  propertyAddress: '',
  propertyPostalCode: '',
  propertyArea: '',
  propertyDeedType: '',
  propertyFloor: '',
  propertyUnit: '',
  propertyUtilities: '',
  propertyFixtures: '',
  startDate: '',
  endDate: '',
  deliveryDate: '',
  depositAmount: '',
  monthlyRent: '',
  paymentDay: '',
  paymentMethod: '',
  utilityCosts: '',
  municipalCharges: '',
  taxFees: '',
  subleasePermission: '',
  latePaymentPenalty: '',
  lateVacatePenalty: '',
  templateId: 'standard',
  additionalClauses: [],
  description: '',
  witness1: '',
  witness2: '',
  landlordSignature: '',
  tenantSignature: '',
};

type Props = {
  isPremium?: boolean;
};

export default function LeaseAgreementForm({ isPremium = false }: Props) {
  const [data, setData] = useState<LeaseData>(INITIAL_DATA);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [draftLimitReached, setDraftLimitReached] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'export'>('form');
  const [selectedPremiumClauses, setSelectedPremiumClauses] = useState<string[]>([]);
  const { requestToken, confirmExport, cancelReservation } = useExportToken();

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

  const draft: LeaseDraft = useMemo(
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

  const updateField = useCallback(<K extends keyof LeaseData>(field: K, value: LeaseData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    const errs = validateLease(data);
    setErrors(errs);
    if (errs.length === 0) {
      setActiveTab('preview');
    }
  }, [data]);

  const html = useMemo(
    () =>
      renderLease(data, {
        watermark: featureGate.hasWatermark,
        premiumClauses: featureGate.canAddCustomClauses ? selectedPremiumClauses : [],
      }),
    [data, featureGate.hasWatermark, featureGate.canAddCustomClauses, selectedPremiumClauses],
  );

  const handleExportHtml = useCallback(() => {
    if (!html) {
      return;
    }
    exportAsHtml(html, 'اجاره-نامه.html');
  }, [html]);

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
    if (featureGate.hasWatermark) {
      await downloadPdf(html, 'اجاره-نامه.pdf');
      return;
    }
    const result = await requestToken('lease-agreement');
    if (!result) {
      setErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    try {
      await downloadPdf(html, 'اجاره-نامه.pdf');
      if (result.reservationId) {
        await confirmExport(result.reservationId);
      }
    } catch {
      if (result.reservationId) {
        await cancelReservation(result.reservationId);
      }
      setErrors(['خطا در دانلود فایل. اعتبار شما برگردانده شد.']);
    }
  }, [html, featureGate.hasWatermark, requestToken, confirmExport, cancelReservation]);

  const handleExportDocx = useCallback(async () => {
    if (featureGate.hasWatermark) {
      await downloadDocx(data, 'اجاره-نامه.docx');
      return;
    }
    const result = await requestToken('lease-agreement');
    if (!result) {
      setErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    try {
      await downloadDocx(data, 'اجاره-نامه.docx');
      if (result.reservationId) {
        await confirmExport(result.reservationId);
      }
    } catch {
      if (result.reservationId) {
        await cancelReservation(result.reservationId);
      }
      setErrors(['خطا در دانلود فایل. اعتبار شما برگردانده شد.']);
    }
  }, [data, featureGate.hasWatermark, requestToken, confirmExport, cancelReservation]);

  const isTemplateLocked = (id: LeaseTemplateId) => !featureGate.availableTemplates.includes(id);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">اجاره‌نامه</h1>
        <p className="text-sm text-[var(--text-muted)]">
          ساخت اجاره‌نامه مسکونی حرفه‌ای با بندهای حقوقی — بدون نیاز به سرور
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--border-light)] pb-2">
        {(['form', 'preview', 'export'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              if (tab === 'preview' || tab === 'export') {
                const errs = validateLease(data);
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
              <h2 className="text-lg font-bold text-[var(--text-primary)]">موجر (مالک)</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="نام و نام خانوادگی *"
                  value={data.landlordName}
                  onChange={(v) => updateField('landlordName', v)}
                />
                <FormField
                  label="کد ملی *"
                  value={data.landlordNationalId}
                  onChange={(v) => updateField('landlordNationalId', v)}
                />
                <FormField
                  label="تلفن *"
                  value={data.landlordPhone}
                  onChange={(v) => updateField('landlordPhone', v)}
                />
                <div className="md:col-span-2">
                  <FormField
                    label="آدرس *"
                    value={data.landlordAddress}
                    onChange={(v) => updateField('landlordAddress', v)}
                  />
                </div>
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">مستأجر</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="نام و نام خانوادگی *"
                  value={data.tenantName}
                  onChange={(v) => updateField('tenantName', v)}
                />
                <FormField
                  label="کد ملی *"
                  value={data.tenantNationalId}
                  onChange={(v) => updateField('tenantNationalId', v)}
                />
                <FormField
                  label="تلفن *"
                  value={data.tenantPhone}
                  onChange={(v) => updateField('tenantPhone', v)}
                />
                <div className="md:col-span-2">
                  <FormField
                    label="آدرس *"
                    value={data.tenantAddress}
                    onChange={(v) => updateField('tenantAddress', v)}
                  />
                </div>
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">مشخصات ملک</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormField
                    label="آدرس کامل ملک *"
                    value={data.propertyAddress}
                    onChange={(v) => updateField('propertyAddress', v)}
                  />
                </div>
                <FormField
                  label="کد پستی"
                  value={data.propertyPostalCode ?? ''}
                  onChange={(v) => updateField('propertyPostalCode', v)}
                />
                <FormField
                  label="متراژ (متر مربع) *"
                  value={data.propertyArea}
                  onChange={(v) => updateField('propertyArea', v)}
                />
                <FormField
                  label="نوع سند"
                  value={data.propertyDeedType ?? ''}
                  onChange={(v) => updateField('propertyDeedType', v)}
                />
                <FormField
                  label="طبقه"
                  value={data.propertyFloor ?? ''}
                  onChange={(v) => updateField('propertyFloor', v)}
                />
                <FormField
                  label="واحد"
                  value={data.propertyUnit ?? ''}
                  onChange={(v) => updateField('propertyUnit', v)}
                />
                <FormField
                  label="تأسیسات و امکانات"
                  value={data.propertyUtilities ?? ''}
                  onChange={(v) => updateField('propertyUtilities', v)}
                />
                <FormField
                  label="وسایل موجود"
                  value={data.propertyFixtures ?? ''}
                  onChange={(v) => updateField('propertyFixtures', v)}
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">مدت و زمان‌بندی</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  label="تاریخ شروع *"
                  type="date"
                  value={data.startDate}
                  onChange={(v) => updateField('startDate', v)}
                />
                <FormField
                  label="تاریخ پایان *"
                  type="date"
                  value={data.endDate}
                  onChange={(v) => updateField('endDate', v)}
                />
                <FormField
                  label="تاریخ تحویل *"
                  type="date"
                  value={data.deliveryDate}
                  onChange={(v) => updateField('deliveryDate', v)}
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">مبلغ و نحوه پرداخت</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="مبلغ ودیعه (ریال) *"
                  value={data.depositAmount}
                  onChange={(v) => updateField('depositAmount', v)}
                />
                <FormField
                  label="اجاره ماهانه (ریال) *"
                  value={data.monthlyRent}
                  onChange={(v) => updateField('monthlyRent', v)}
                />
                <FormField
                  label="روز پرداخت *"
                  value={data.paymentDay}
                  onChange={(v) => updateField('paymentDay', v)}
                  placeholder="مثال: ۵ هر ماه"
                />
                <FormField
                  label="روش پرداخت *"
                  value={data.paymentMethod}
                  onChange={(v) => updateField('paymentMethod', v)}
                  placeholder="مثال: نقدی / کارت به کارت"
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">هزینه‌ها و جرایم</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="هزینه‌های مصرفی"
                  value={data.utilityCosts ?? ''}
                  onChange={(v) => updateField('utilityCosts', v)}
                  placeholder="مثال: بر عهده مستأجر"
                />
                <FormField
                  label="عوارض شهرداری"
                  value={data.municipalCharges ?? ''}
                  onChange={(v) => updateField('municipalCharges', v)}
                />
                <FormField
                  label="مالیات‌ها"
                  value={data.taxFees ?? ''}
                  onChange={(v) => updateField('taxFees', v)}
                />
                <FormField
                  label="اجازه اجاره مجدد"
                  value={data.subleasePermission ?? ''}
                  onChange={(v) => updateField('subleasePermission', v)}
                  placeholder="مثال: ندارد"
                />
                <FormField
                  label="جریمه دیرکرد"
                  value={data.latePaymentPenalty ?? ''}
                  onChange={(v) => updateField('latePaymentPenalty', v)}
                />
                <FormField
                  label="جریمه تخلیه دیرکرد"
                  value={data.lateVacatePenalty ?? ''}
                  onChange={(v) => updateField('lateVacatePenalty', v)}
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">شاهدان</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="شاهد اول"
                  value={data.witness1 ?? ''}
                  onChange={(v) => updateField('witness1', v)}
                />
                <FormField
                  label="شاهد دوم"
                  value={data.witness2 ?? ''}
                  onChange={(v) => updateField('witness2', v)}
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">قالب قرارداد</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {LEASE_TEMPLATES.map((tpl) => {
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
                  label="امضای موجر"
                  value={data.landlordSignature ?? ''}
                  disabled={!featureGate.canUseSignature}
                  onUpgrade={() => setShowUpgradeModal(true)}
                  onChange={(v) => updateField('landlordSignature', v)}
                />
                <SignatureUpload
                  label="امضای مستأجر"
                  value={data.tenantSignature ?? ''}
                  disabled={!featureGate.canUseSignature}
                  onUpgrade={() => setShowUpgradeModal(true)}
                  onChange={(v) => updateField('tenantSignature', v)}
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
            <h2 className="text-lg font-bold text-[var(--text-primary)]">پیش‌نمایش اجاره‌نامه</h2>
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
            <h2 className="text-lg font-bold text-[var(--text-primary)]">دانلود اجاره‌نامه</h2>
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

      {showUpgradeModal ? (
        <UpgradeModal
          product="lease-agreement"
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
        title="پیش‌نمایش اجاره‌نامه"
        srcDoc={html}
        className="w-full border-0"
        style={{ minHeight: '500px' }}
        sandbox="allow-same-origin"
      />
    </div>
  );
}
