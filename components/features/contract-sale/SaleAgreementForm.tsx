'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Button } from '@/components/ui';
import UpgradeModal from '@/components/features/pricing/UpgradeModal';
import { useExportToken } from '@/shared/hooks/useExportToken';
import type { SaleAgreementData, SaleTemplateId } from '@/lib/contract-sale/types';
import { DISCLAIMER, PRIVACY_TEXT, validateSaleAgreement } from '@/lib/contract-sale/types';
import { SALE_TEMPLATES, FEATURE_GATES } from '@/lib/contract-sale/schemas';
import { PREMIUM_CLAUSES, STANDARD_CLAUSES } from '@/lib/contract-sale/clauses';
import { renderSaleAgreement } from '@/lib/contract-sale/render';
import {
  saveDraft,
  loadDrafts,
  canSaveDraft,
  createDraftId,
} from '@/lib/contract-sale/draft-storage';
import type { SaleAgreementDraft } from '@/lib/contract-sale/draft-storage';
import {
  exportAsHtml,
  exportAsPrintableHtml,
  downloadPdf,
  downloadDocx,
  isDocxAvailable,
} from '@/lib/contract-sale/export';

const INITIAL_DATA: SaleAgreementData = {
  sellerName: '',
  sellerNationalId: '',
  sellerPhone: '',
  sellerAddress: '',
  buyerName: '',
  buyerNationalId: '',
  buyerPhone: '',
  buyerAddress: '',
  propertyAddress: '',
  propertyParcelId: '',
  propertyArea: '',
  propertyDeedNo: '',
  propertyRegistryNo: '',
  salePrice: '',
  depositAmount: '',
  paymentMethod: '',
  deliveryDate: '',
  contractDate: new Date().toISOString().split('T')[0] ?? '',
  possessionDate: '',
  templateId: 'standard',
  additionalClauses: [],
  description: '',
  signatureSeller: '',
  signatureBuyer: '',
};

type Props = {
  isPremium?: boolean;
};

export default function SaleAgreementForm({ isPremium = false }: Props) {
  const [data, setData] = useState<SaleAgreementData>(INITIAL_DATA);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [draftLimitReached, setDraftLimitReached] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'export'>('form');
  const [selectedPremiumClauses, setSelectedPremiumClauses] = useState<string[]>([]);
  const [customClauses, setCustomClauses] = useState<string[]>(['']);
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

  const draft: SaleAgreementDraft = useMemo(
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
    <K extends keyof SaleAgreementData>(field: K, value: SaleAgreementData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    const errs = validateSaleAgreement(data);
    const mergedData = { ...data, additionalClauses: customClauses.filter((c) => c.trim()) };
    setData(mergedData);
    setErrors(errs);
    if (errs.length === 0) {
      setActiveTab('preview');
    }
  }, [data, customClauses]);

  const html = useMemo(
    () =>
      renderSaleAgreement(
        { ...data, additionalClauses: customClauses.filter((c) => c.trim()) },
        {
          watermark: featureGate.hasWatermark,
          premiumClauses: featureGate.canAddCustomClauses ? selectedPremiumClauses : [],
        },
      ),
    [
      data,
      customClauses,
      featureGate.hasWatermark,
      featureGate.canAddCustomClauses,
      selectedPremiumClauses,
    ],
  );

  const handleExportHtml = useCallback(() => {
    if (!html) {
      return;
    }
    exportAsHtml(html, 'مبایعه‌نامه-ملک.html');
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
      await downloadPdf(html, 'مبایعه‌نامه-ملک.pdf');
      return;
    }
    const result = await requestToken('career');
    if (!result) {
      setErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    try {
      await downloadPdf(html, 'مبایعه‌نامه-ملک.pdf');
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
      await downloadDocx(data, 'مبایعه‌نامه-ملک.docx');
      return;
    }
    const result = await requestToken('career');
    if (!result) {
      setErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    try {
      await downloadDocx(data, 'مبایعه‌نامه-ملک.docx');
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

  const isTemplateLocked = (id: SaleTemplateId) => !featureGate.availableTemplates.includes(id);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
          مبایعه‌نامه ملک
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          ساخت مبایعه‌نامه ملک حرفه‌ای با بندهای حقوقی — بدون نیاز به سرور
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--border-light)] pb-2">
        {(['form', 'preview', 'export'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              if (tab === 'preview' || tab === 'export') {
                const errs = validateSaleAgreement(data);
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
              <h2 className="text-lg font-bold text-[var(--text-primary)]">فروشنده</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="نام و نام خانوادگی *"
                  value={data.sellerName}
                  onChange={(v) => updateField('sellerName', v)}
                />
                <FormField
                  label="کد ملی *"
                  value={data.sellerNationalId}
                  onChange={(v) => updateField('sellerNationalId', v)}
                />
                <FormField
                  label="تلفن *"
                  value={data.sellerPhone}
                  onChange={(v) => updateField('sellerPhone', v)}
                />
                <FormField
                  label="آدرس *"
                  value={data.sellerAddress}
                  onChange={(v) => updateField('sellerAddress', v)}
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">خریدار</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="نام و نام خانوادگی *"
                  value={data.buyerName}
                  onChange={(v) => updateField('buyerName', v)}
                />
                <FormField
                  label="کد ملی *"
                  value={data.buyerNationalId}
                  onChange={(v) => updateField('buyerNationalId', v)}
                />
                <FormField
                  label="تلفن *"
                  value={data.buyerPhone}
                  onChange={(v) => updateField('buyerPhone', v)}
                />
                <FormField
                  label="آدرس *"
                  value={data.buyerAddress}
                  onChange={(v) => updateField('buyerAddress', v)}
                />
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
                  label="پلاک ثبتی"
                  value={data.propertyParcelId ?? ''}
                  onChange={(v) => updateField('propertyParcelId', v)}
                />
                <FormField
                  label="متراژ (متر مربع) *"
                  value={data.propertyArea}
                  onChange={(v) => updateField('propertyArea', v)}
                />
                <FormField
                  label="شماره سند"
                  value={data.propertyDeedNo ?? ''}
                  onChange={(v) => updateField('propertyDeedNo', v)}
                />
                <FormField
                  label="شماره ثبت"
                  value={data.propertyRegistryNo ?? ''}
                  onChange={(v) => updateField('propertyRegistryNo', v)}
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">مبلغ و نحوه پرداخت</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="قیمت کل (ریال) *"
                  value={data.salePrice}
                  onChange={(v) => updateField('salePrice', v)}
                />
                <FormField
                  label="مبلغ بیعانه (ریال) *"
                  value={data.depositAmount}
                  onChange={(v) => updateField('depositAmount', v)}
                />
                <div className="md:col-span-2">
                  <FormField
                    label="روش پرداخت *"
                    value={data.paymentMethod}
                    onChange={(v) => updateField('paymentMethod', v)}
                    placeholder="مثال: نقدی / چک / انتقال بانکی"
                  />
                </div>
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">زمان‌بندی</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  label="تاریخ قرارداد *"
                  type="date"
                  value={data.contractDate}
                  onChange={(v) => updateField('contractDate', v)}
                />
                <FormField
                  label="تاریخ تحویل *"
                  type="date"
                  value={data.deliveryDate}
                  onChange={(v) => updateField('deliveryDate', v)}
                />
                <FormField
                  label="تاریخ تصرف *"
                  type="date"
                  value={data.possessionDate}
                  onChange={(v) => updateField('possessionDate', v)}
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">قالب قرارداد</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {SALE_TEMPLATES.map((tpl) => {
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
              <h2 className="text-lg font-bold text-[var(--text-primary)]">بندهای قرارداد</h2>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text-secondary)]">بندهای استاندارد</h3>
                {STANDARD_CLAUSES.map((clause) => (
                  <div
                    key={clause.id}
                    className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3"
                  >
                    <p className="text-xs font-bold text-[var(--text-primary)]">{clause.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{clause.text}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text-secondary)]">
                  بندهای حرفه‌ای{' '}
                  {!featureGate.canAddCustomClauses && (
                    <span className="text-[var(--color-warning)]">(پریمیوم)</span>
                  )}
                </h3>
                {PREMIUM_CLAUSES.map((clause) => {
                  const canSelect = featureGate.canAddCustomClauses;
                  return (
                    <label
                      key={clause.id}
                      className={`flex items-start gap-3 cursor-pointer rounded-[var(--radius-md)] border border-[var(--border-light)] p-3 transition-all ${
                        selectedPremiumClauses.includes(clause.id)
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                          : ''
                      } ${!canSelect ? 'opacity-60' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPremiumClauses.includes(clause.id)}
                        disabled={!canSelect}
                        onChange={(e) => {
                          if (!canSelect) {
                            setShowUpgradeModal(true);
                            return;
                          }
                          setSelectedPremiumClauses((prev) =>
                            e.target.checked
                              ? [...prev, clause.id]
                              : prev.filter((id) => id !== clause.id),
                          );
                        }}
                        className="mt-1 h-4 w-4 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          {clause.title}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{clause.text}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {featureGate.canAddCustomClauses ? (
              <>
                <hr className="border-[var(--border-light)]" />
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    شرایط اضافی (پریمیوم)
                  </h2>
                  {customClauses.map((clause, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <textarea
                        value={clause}
                        onChange={(e) => {
                          const next = [...customClauses];
                          next[idx] = e.target.value;
                          setCustomClauses(next);
                        }}
                        placeholder={`شرط اضافی ${idx + 1}`}
                        rows={2}
                        className="flex-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                      {customClauses.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setCustomClauses(customClauses.filter((_, i) => i !== idx))
                          }
                          className="text-xs text-[var(--color-danger)] mt-2 shrink-0"
                        >
                          حذف
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomClauses([...customClauses, ''])}
                    className="text-xs text-[var(--color-primary)]"
                  >
                    + افزودن شرط جدید
                  </button>
                </div>
              </>
            ) : null}

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">امضا</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <SignatureUpload
                  label="امضای فروشنده"
                  value={data.signatureSeller ?? ''}
                  disabled={!featureGate.canUseSignature}
                  onUpgrade={() => setShowUpgradeModal(true)}
                  onChange={(v) => updateField('signatureSeller', v)}
                />
                <SignatureUpload
                  label="امضای خریدار"
                  value={data.signatureBuyer ?? ''}
                  disabled={!featureGate.canUseSignature}
                  onUpgrade={() => setShowUpgradeModal(true)}
                  onChange={(v) => updateField('signatureBuyer', v)}
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
            <h2 className="text-lg font-bold text-[var(--text-primary)]">پیش‌نمایش مبایعه‌نامه</h2>
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
            <h2 className="text-lg font-bold text-[var(--text-primary)]">دانلود مبایعه‌نامه</h2>
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
          product="career"
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
        title="پیش‌نمایش مبایعه‌نامه"
        srcDoc={html}
        className="w-full border-0"
        style={{ minHeight: '500px' }}
        sandbox="allow-same-origin"
      />
    </div>
  );
}
