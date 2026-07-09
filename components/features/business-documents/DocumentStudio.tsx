'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, Button } from '@/components/ui';
import UpgradeModal from '@/components/features/pricing/UpgradeModal';
import { useExportToken } from '@/shared/hooks/useExportToken';
import { useExportFunnel } from '@/shared/analytics/useExportFunnel';
import type {
  BusinessDocumentDraft,
  BusinessDocumentType,
  BusinessParty,
  BusinessLineItem,
} from '@/lib/business-documents/types';
import {
  DISCLAIMER,
  PRIVACY_TEXT,
  validateParty,
  validateItems,
} from '@/lib/business-documents/types';
import {
  calculateTotals,
  generateDocumentNumber,
  formatCurrency,
} from '@/lib/business-documents/calculations';
import { DOCUMENT_TYPES, FEATURE_GATES } from '@/lib/business-documents/schemas';
import {
  saveDraft,
  loadDrafts,
  deleteDraft,
  createDraftId,
  canSaveDraft,
} from '@/lib/business-documents/draft-storage';
import {
  loadProfiles,
  saveProfile,
  partyToProfile,
  profileToParty,
} from '@/lib/business-documents/profile-storage';
import {
  exportAsHtml,
  exportAsPrintableHtml,
  downloadPdf,
  downloadDocx,
  isDocxAvailable,
} from '@/lib/business-documents/export';
import { renderDocument } from '@/lib/business-documents/render';
import DocumentTypeSelector from './DocumentTypeSelector';
import PartyForm from './PartyForm';
import LineItemsEditor from './LineItemsEditor';
import DocumentPreview from './DocumentPreview';
import Link from 'next/link';

type Step =
  | 'type-select'
  | 'seller-info'
  | 'buyer-info'
  | 'items'
  | 'settings'
  | 'preview'
  | 'export';

const STEP_ORDER: Step[] = [
  'type-select',
  'seller-info',
  'buyer-info',
  'items',
  'settings',
  'preview',
  'export',
];

const STEP_LABELS: Record<Step, string> = {
  'type-select': 'انتخاب نوع سند',
  'seller-info': 'اطلاعات فروشنده',
  'buyer-info': 'اطلاعات خریدار',
  items: 'اقلام سند',
  settings: 'تنظیمات',
  preview: 'پیش‌نمایش',
  export: 'دانلود',
};

type Props = {
  initialDocumentType?: BusinessDocumentType;
  isPremium?: boolean;
};

function createEmptyParty(): BusinessParty {
  return {
    name: '',
    address: '',
    phone: '',
    email: '',
    nationalId: '',
    registrationNo: '',
    economicCode: '',
  };
}

function createEmptyItem(): BusinessLineItem {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    description: '',
    quantity: 1,
    unitPrice: 0,
    unit: 'عدد',
  };
}

export default function DocumentStudio({ initialDocumentType, isPremium = false }: Props) {
  const [step, setStep] = useState<Step>(() =>
    initialDocumentType ? 'seller-info' : 'type-select',
  );
  const [documentType, setDocumentType] = useState<BusinessDocumentType | null>(
    initialDocumentType ?? null,
  );
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentDate, setDocumentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [seller, setSeller] = useState<BusinessParty>(createEmptyParty);
  const [buyer, setBuyer] = useState<BusinessParty>(createEmptyParty);
  const [items, setItems] = useState<BusinessLineItem[]>([createEmptyItem()]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [notes, setNotes] = useState('');
  const [footer, setFooter] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [draftId] = useState(() => createDraftId());
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [draftWarning, setDraftWarning] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [profiles, setProfiles] = useState(() => loadProfiles());
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { requestToken, confirmExport, cancelReservation } = useExportToken();
  const {
    trackExportClick,
    trackUpgradeView,
    trackTokenIssued,
    trackExportConfirm,
    trackExportCancel,
  } = useExportFunnel('business', 'document-studio', isPremium);

  const featureGate = documentType
    ? (() => {
      if (isPremium) {
        return FEATURE_GATES[documentType].premium;
      }
      return FEATURE_GATES[documentType].free;
    })()
    : null;

  const totals = useMemo(
    () => calculateTotals(items, discountPercent, taxPercent),
    [items, discountPercent, taxPercent],
  );

  const stepIndex = STEP_ORDER.indexOf(step);
  const progress = ((stepIndex + 1) / STEP_ORDER.length) * 100;

  useEffect(() => {
    if (!documentType) {
      return;
    }
    const savedProfiles = loadProfiles();
    setProfiles(savedProfiles);
    const drafts = loadDrafts().filter((d) => d.documentType === documentType);
    const latest = drafts[drafts.length - 1];
    if (latest) {
      setSeller(latest.seller);
      setBuyer(latest.buyer);
      setItems(latest.items.length > 0 ? latest.items : [createEmptyItem()]);
      setDiscountPercent(latest.discountPercent ?? 0);
      setTaxPercent(latest.taxPercent ?? 0);
      setNotes(latest.notes ?? '');
      setFooter(latest.footer ?? '');
      setDocumentNumber(latest.documentNumber ?? '');
      setDocumentDate(latest.documentDate ?? new Date().toISOString().split('T')[0]);
      setLogoDataUrl(latest.logoDataUrl);
    } else if (savedProfiles.length > 0) {
      const latestProfile = savedProfiles[
        savedProfiles.length - 1
      ] as (typeof savedProfiles)[number];
      setSeller(profileToParty(latestProfile));
      setLogoDataUrl(latestProfile.logoDataUrl);
    }
  }, [documentType]);

  const draft: BusinessDocumentDraft | null = useMemo(() => {
    if (!documentType) {
      return null;
    }
    return {
      id: draftId,
      documentType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seller,
      buyer,
      items,
      templateId: documentType,
      ...(logoDataUrl ? { logoDataUrl } : {}),
      ...(notes ? { notes } : {}),
      ...(documentNumber ? { documentNumber } : {}),
      ...(documentDate ? { documentDate } : {}),
      ...(discountPercent ? { discountPercent } : {}),
      ...(taxPercent ? { taxPercent } : {}),
      ...(footer ? { footer } : {}),
    };
  }, [
    documentType,
    seller,
    buyer,
    items,
    notes,
    documentNumber,
    documentDate,
    discountPercent,
    taxPercent,
    footer,
    draftId,
    logoDataUrl,
  ]);

  useEffect(() => {
    if (!draft) {
      return;
    }
    const existingDrafts = loadDrafts();
    const isUpdate = existingDrafts.some((d) => d.id === draft.id);
    if (!isUpdate && !canSaveDraft(draft.documentType)) {
      setDraftWarning(
        'حداکثر ۳ پیش‌نویس رایگان ذخیره شده است. برای ذخیره بیشتر، اشتراک حرفه‌ای تهیه کنید.',
      );
      return;
    }
    setDraftWarning(null);
    const timer = setTimeout(() => {
      saveDraft(draft);
    }, 1000);
    return () => clearTimeout(timer);
  }, [draft]);

  const handleTypeSelect = useCallback((type: BusinessDocumentType) => {
    setDocumentType(type);
    setDocumentNumber(generateDocumentNumber(type));
    setStepErrors([]);
  }, []);

  const validateCurrentStep = useCallback((): string[] => {
    switch (step) {
      case 'seller-info':
        return validateParty(seller, 'فروشنده');
      case 'buyer-info':
        return validateParty(buyer, 'خریدار');
      case 'items':
        return validateItems(items);
      default:
        return [];
    }
  }, [step, seller, buyer, items]);

  const goNext = useCallback(() => {
    const errors = validateCurrentStep();
    if (errors.length > 0) {
      setStepErrors(errors);
      return;
    }
    setStepErrors([]);
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[idx + 1] as (typeof STEP_ORDER)[number]);
    }
  }, [step, validateCurrentStep]);

  const goBack = useCallback(() => {
    setStepErrors([]);
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) {
      setStep(STEP_ORDER[idx - 1] as (typeof STEP_ORDER)[number]);
    }
  }, [step]);

  const handleDeleteDraft = useCallback(() => {
    deleteDraft(draftId);
  }, [draftId]);

  const handleExportHtml = useCallback(() => {
    if (!draft) {
      return;
    }
    trackExportClick('html');
    const html = renderDocument(draft, totals, {
      watermark: featureGate?.hasWatermark ?? true,
      rtl: true,
    });
    exportAsHtml(html, `${documentNumber}.html`);
  }, [draft, totals, featureGate, documentNumber, trackExportClick]);

  const handlePrint = useCallback(() => {
    if (!draft) {
      return;
    }
    trackExportClick('print');
    const html = renderDocument(draft, totals, {
      watermark: featureGate?.hasWatermark ?? true,
      rtl: true,
    });
    exportAsPrintableHtml(html);
  }, [draft, totals, featureGate, trackExportClick]);

  const handleExportPdf = useCallback(async () => {
    if (!draft) {
      return;
    }
    trackExportClick('pdf');
    if (featureGate?.hasWatermark) {
      const html = renderDocument(draft, totals, {
        watermark: true,
        rtl: true,
      });
      await downloadPdf(html, `${documentNumber}.pdf`);
      return;
    }
    const result = await requestToken('business');
    if (!result) {
      trackTokenIssued('pdf', 'error');
      setStepErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    trackTokenIssued('pdf', 'success');
    const html = renderDocument(draft, totals, {
      watermark: false,
      rtl: true,
    });
    try {
      await downloadPdf(html, `${documentNumber}.pdf`);
      if (result.reservationId) {
        await confirmExport(result.reservationId);
        trackExportConfirm('pdf');
      }
    } catch {
      if (result.reservationId) {
        await cancelReservation(result.reservationId);
        trackExportCancel('pdf');
      }
      setStepErrors(['خطا در دانلود فایل. اعتبار شما برگردانده شد.']);
    }
  }, [
    draft,
    totals,
    featureGate,
    documentNumber,
    requestToken,
    confirmExport,
    cancelReservation,
    trackExportClick,
    trackTokenIssued,
    trackExportConfirm,
    trackExportCancel,
  ]);

  const handleExportDocx = useCallback(async () => {
    if (!draft) {
      return;
    }
    trackExportClick('docx');
    if (featureGate?.hasWatermark) {
      await downloadDocx(draft, totals, `${documentNumber}.docx`);
      return;
    }
    const result = await requestToken('business');
    if (!result) {
      trackTokenIssued('docx', 'error');
      setStepErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    trackTokenIssued('docx', 'success');
    try {
      await downloadDocx(draft, totals, `${documentNumber}.docx`);
      if (result.reservationId) {
        await confirmExport(result.reservationId);
        trackExportConfirm('docx');
      }
    } catch {
      if (result.reservationId) {
        await cancelReservation(result.reservationId);
        trackExportCancel('docx');
      }
      setStepErrors(['خطا در دانلود فایل. اعتبار شما برگردانده شد.']);
    }
  }, [
    draft,
    totals,
    documentNumber,
    requestToken,
    confirmExport,
    cancelReservation,
    featureGate,
    trackExportClick,
    trackTokenIssued,
    trackExportConfirm,
    trackExportCancel,
  ]);

  const canGoNext = step !== 'export';

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            {documentType
              ? (DOCUMENT_TYPES.find((t) => t.id === documentType)?.title ?? 'فاکتورساز و رسیدساز')
              : 'فاکتورساز و رسیدساز'}
          </h1>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          ساخت فاکتور، پیش‌فاکتور و رسید دریافت وجه — بدون نیاز به سرور
        </p>
      </div>

      <nav aria-label="مراحل سند" className="space-y-2">
        <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
          {STEP_ORDER.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${(() => {
                  if (i < stepIndex) {
                    return 'bg-[var(--color-success)] text-white';
                  }
                  if (i === stepIndex) {
                    return 'bg-[var(--color-primary)] text-white';
                  }
                  return 'bg-[var(--surface-2)] text-[var(--text-muted)]';
                })()}`}
              >
                {i < stepIndex ? '✓' : i + 1}
              </span>
              <span
                className={`${i === stepIndex ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)]'}`}
              >
                {STEP_LABELS[s]}
              </span>
              {i < STEP_ORDER.length - 1 && <span className="text-[var(--text-muted)]">←</span>}
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

      {featureGate?.hasWatermark && step !== 'type-select' ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-3 flex items-center gap-2">
          <span className="text-sm">⚠️</span>
          <p className="text-xs text-[var(--color-warning)]">
            نسخه رایگان — واترمارک روی خروجی قرار می‌گیرد. برای حذف واترمارک ارتقا دهید.
          </p>
        </div>
      ) : null}

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

        {draftWarning ? (
          <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-3">
            <p className="text-xs text-[var(--color-warning)]" role="alert">
              {draftWarning}
            </p>
          </div>
        ) : null}

        {step === 'type-select' && (
          <DocumentTypeSelector selected={documentType} onSelect={handleTypeSelect} />
        )}

        {step === 'seller-info' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">اطلاعات فروشنده</h2>

            {profiles.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-primary)]">
                  پروفایل ذخیره‌شده
                </label>
                <select
                  onChange={(e) => {
                    const profile = profiles.find((p) => p.id === e.target.value);
                    if (profile) {
                      setSeller(profileToParty(profile));
                      setLogoDataUrl(profile.logoDataUrl);
                    }
                  }}
                  defaultValue=""
                  className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  aria-label="پروفایل ذخیره‌شده"
                >
                  <option value="">انتخاب پروفایل...</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <PartyForm label="فروشنده" party={seller} errors={[]} onChange={setSeller} />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                لوگو (اختیاری)
              </label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                aria-label="انتخاب تصویر لوگو"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setLogoDataUrl(ev.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-xs text-[var(--color-primary)] hover:underline"
                >
                  {logoDataUrl ? 'تغییر لوگو' : 'افزودن لوگو'}
                </button>
                {logoDataUrl ? (
                  <button
                    type="button"
                    onClick={() => setLogoDataUrl(undefined)}
                    className="text-xs text-[var(--color-danger)] hover:underline"
                  >
                    حذف لوگو
                  </button>
                ) : null}
              </div>
              {logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoDataUrl}
                  alt="پیش‌نمایش سند"
                  className="h-16 w-16 object-contain rounded border border-[var(--border-light)]"
                />
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => {
                if (!seller.name.trim()) {
                  return;
                }
                const profile = partyToProfile(seller, logoDataUrl);
                saveProfile(profile);
                setProfiles(loadProfiles());
              }}
              className="text-xs font-bold text-[var(--color-primary)] hover:underline"
            >
              ذخیره به‌عنوان پروفایل
            </button>
          </div>
        )}

        {step === 'buyer-info' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">اطلاعات خریدار</h2>
            <PartyForm label="خریدار" party={buyer} errors={[]} onChange={setBuyer} />
          </div>
        )}

        {step === 'items' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">اقلام سند</h2>
            <LineItemsEditor
              items={items}
              discountPercent={discountPercent}
              taxPercent={taxPercent}
              errors={[]}
              onUpdate={setItems}
              onDiscountChange={setDiscountPercent}
              onTaxChange={setTaxPercent}
            />
          </div>
        )}

        {step === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">تنظیمات سند</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="doc-number"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  شماره سند
                </label>
                <input
                  id="doc-number"
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                  aria-label="شماره سند"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="doc-date"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  تاریخ سند
                </label>
                <input
                  id="doc-date"
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                  aria-label="تاریخ سند"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="doc-notes"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                توضیحات
              </label>
              <textarea
                id="doc-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="توضیحات اختیاری"
                rows={3}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] resize-none"
                aria-label="توضیحات"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="doc-footer"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                پاورقی
              </label>
                <input
                  id="doc-footer"
                  type="text"
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  placeholder="متن پاورقی اختیاری"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                  aria-label="پاورقی"
                />
            </div>

            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 space-y-2">
              <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                <span>جمع کل</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-[var(--color-danger)]">
                  <span>تخفیف</span>
                  <span>-{formatCurrency(totals.discountAmount)}</span>
                </div>
              )}
              {totals.taxAmount > 0 && (
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>مالیات</span>
                  <span>{formatCurrency(totals.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[var(--text-primary)] border-t border-[var(--border-light)] pt-2">
                <span>مبلغ قابل پرداخت</span>
                <span>{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && draft ? (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">پیش‌نمایش سند</h2>
            <p className="text-sm text-[var(--text-muted)]">
              سند را بررسی کنید. قبل از دانلود، سلب مسئولیت را تأیید کنید.
            </p>
            <DocumentPreview
              draft={draft}
              totals={totals}
              showWatermark={featureGate?.hasWatermark ?? true}
            />
            <div className="rounded-[var(--radius-md)] border border-[rgb(var(--color-info-rgb)/0.3)] bg-[rgb(var(--color-info-rgb)/0.08)] p-4">
              <p className="text-xs text-[var(--color-info)] leading-6">{PRIVACY_TEXT}</p>
            </div>
          </div>
        ) : null}

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

            {disclaimerAccepted ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Button onClick={handleExportHtml} variant="primary">
                  دانلود HTML
                </Button>
                <Button onClick={handlePrint} variant="secondary">
                  چاپ
                </Button>
                {featureGate?.canExportPdf ? (
                  <>
                    <Button onClick={handleExportPdf} variant="primary">
                      چاپ / ذخیره PDF
                    </Button>
                    <p className="text-xs text-[var(--text-muted)] col-span-full md:col-span-2">
                      پنجره چاپ مرورگر باز می‌شود. در آن گزینه «ذخیره به‌عنوان PDF» را انتخاب کنید.
                    </p>
                  </>
                ) : null}
                {featureGate?.canExportDocx && isDocxAvailable() ? (
                  <Button onClick={handleExportDocx} variant="primary">
                    دانلود Word
                  </Button>
                ) : null}
              </div>
            ) : null}

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

            <div className="border-t border-[var(--border-light)] pt-4">
              <button
                type="button"
                onClick={handleDeleteDraft}
                className="text-xs text-[var(--color-danger)] hover:underline"
              >
                حذف پیش‌نویس
              </button>
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="tertiary" onClick={goBack} disabled={stepIndex === 0}>
          بازگشت
        </Button>
        {canGoNext ? (
          <Button onClick={goNext}>{step === 'preview' ? 'تأیید و دانلود' : 'مرحله بعد'}</Button>
        ) : null}
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 text-center space-y-2">
        <p className="text-xs text-[var(--text-muted)] leading-5">{DISCLAIMER}</p>
        <Link
          href="/business-tools"
          className="text-xs text-[var(--color-primary)] hover:underline"
        >
          بازگشت به صفحه اسناد کسب‌وکار
        </Link>
      </div>

      {showUpgradeModal ? (
        <UpgradeModal
          product="business"
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
