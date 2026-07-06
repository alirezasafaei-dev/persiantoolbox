'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Button } from '@/components/ui';
import UpgradeModal from '@/components/features/pricing/UpgradeModal';
import { useExportToken } from '@/shared/hooks/useExportToken';
import { useExportFunnel } from '@/shared/analytics/useExportFunnel';
import type { FormalLetterData, LetterTemplateId, LetterType } from '@/lib/formal-letter/types';
import {
  DISCLAIMER,
  PRIVACY_TEXT,
  validateLetter,
  LETTER_TYPE_LABELS,
  getSalutationForRecipient,
  getDefaultClosing,
  getDefaultSalutation,
} from '@/lib/formal-letter/types';
import { LETTER_TEMPLATES, FEATURE_GATES } from '@/lib/formal-letter/schemas';
import { renderLetter } from '@/lib/formal-letter/render';
import {
  saveDraft,
  loadDrafts,
  canSaveDraft,
  createDraftId,
} from '@/lib/formal-letter/draft-storage';
import type { FormalLetterDraft } from '@/lib/formal-letter/draft-storage';
import {
  exportAsHtml,
  exportAsPrintableHtml,
  downloadPdf,
  downloadDocx,
  isDocxAvailable,
} from '@/lib/formal-letter/export';

const INITIAL_DATA: FormalLetterData = {
  senderName: '',
  senderPosition: '',
  senderOrganization: '',
  senderPhone: '',
  senderAddress: '',
  recipientName: '',
  recipientPosition: '',
  recipientOrganization: '',
  recipientAddress: '',
  letterType: 'request',
  subject: '',
  salutation: '',
  body: '',
  closing: '',
  referenceNumber: '',
  letterDate: new Date().toISOString().split('T')[0] ?? '',
  enclosures: '',
  ccList: '',
  templateId: 'formal',
  additionalParagraphs: [],
  signatureDataUrl: '',
};

type Props = {
  isPremium?: boolean;
};

export default function FormalLetterForm({ isPremium = false }: Props) {
  const [data, setData] = useState<FormalLetterData>(INITIAL_DATA);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [draftLimitReached, setDraftLimitReached] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'export'>('form');
  const [selectedPremiumParagraphs, setSelectedPremiumParagraphs] = useState<string[]>([]);
  const { requestToken, confirmExport, cancelReservation } = useExportToken();
  const {
    trackExportClick,
    trackUpgradeView,
    trackTokenIssued,
    trackExportConfirm,
    trackExportCancel,
  } = useExportFunnel('formal-letter', 'formal-letter', isPremium);

  const featureGate = isPremium ? FEATURE_GATES.premium : FEATURE_GATES.free;

  const draftId = useMemo(() => createDraftId(), []);

  useEffect(() => {
    const drafts = loadDrafts();
    const latest = drafts[drafts.length - 1];
    if (latest) {
      setData(latest.data);
      setSelectedPremiumParagraphs(latest.selectedPremiumParagraphs);
    }
  }, []);

  const draft: FormalLetterDraft = useMemo(
    () => ({
      id: draftId,
      data,
      selectedPremiumParagraphs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [data, selectedPremiumParagraphs, draftId],
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
    <K extends keyof FormalLetterData>(field: K, value: FormalLetterData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleRecipientChange = useCallback(
    (name: string) => {
      const position = data.recipientPosition;
      updateField('recipientName', name);
      if (name.trim() && !data.salutation) {
        updateField('salutation', getSalutationForRecipient(name, position));
      }
    },
    [data.recipientPosition, data.salutation, updateField],
  );

  const handleLetterTypeChange = useCallback(
    (type: LetterType) => {
      updateField('letterType', type);
      if (!data.closing || data.closing === getDefaultClosing(data.letterType)) {
        updateField('closing', getDefaultClosing(type));
      }
    },
    [data.closing, data.letterType, updateField],
  );

  const handleSubmit = useCallback(() => {
    const errs = validateLetter(data);
    setErrors(errs);
    if (errs.length === 0) {
      setActiveTab('preview');
    }
  }, [data]);

  const bodyExceedsLimit = data.body.length > featureGate.maxBodyLength;

  const html = useMemo(
    () =>
      renderLetter(data, {
        watermark: featureGate.hasWatermark,
        premiumParagraphs: featureGate.canAddCustomParagraphs ? selectedPremiumParagraphs : [],
      }),
    [data, featureGate.hasWatermark, featureGate.canAddCustomParagraphs, selectedPremiumParagraphs],
  );

  const handleExportHtml = useCallback(() => {
    if (!html) {
      return;
    }
    trackExportClick('html');
    exportAsHtml(html, 'نامه-اداری.html');
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
      await downloadPdf(html, 'نامه-اداری.pdf');
      return;
    }
    const result = await requestToken('formal-letter');
    if (!result) {
      trackTokenIssued('pdf', 'error');
      setErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    trackTokenIssued('pdf', 'success');
    try {
      await downloadPdf(html, 'نامه-اداری.pdf');
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
      await downloadDocx(data, 'نامه-اداری.docx');
      return;
    }
    const result = await requestToken('formal-letter');
    if (!result) {
      trackTokenIssued('docx', 'error');
      setErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    trackTokenIssued('docx', 'success');
    try {
      await downloadDocx(data, 'نامه-اداری.docx');
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

  const isTemplateLocked = (id: LetterTemplateId) => !featureGate.availableTemplates.includes(id);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">نامه اداری</h1>
        <p className="text-sm text-[var(--text-muted)]">
          ساخت نامه اداری رسمی با قالب‌های حرفه‌ای — بدون نیاز به سرور
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--border-light)] pb-2">
        {(['form', 'preview', 'export'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              if (tab === 'preview' || tab === 'export') {
                const errs = validateLetter(data);
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
              <h2 className="text-lg font-bold text-[var(--text-primary)]">نوع نامه</h2>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(LETTER_TYPE_LABELS) as [LetterType, string][]).map(
                  ([type, label]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleLetterTypeChange(type)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all border ${
                        data.letterType === type
                          ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] border-[var(--color-primary)]'
                          : 'border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--color-primary)]'
                      }`}
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">فرستنده</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="نام *"
                  value={data.senderName}
                  onChange={(v) => updateField('senderName', v)}
                />
                <FormField
                  label="سمت"
                  value={data.senderPosition ?? ''}
                  onChange={(v) => updateField('senderPosition', v)}
                />
                <FormField
                  label="سازمان / شرکت"
                  value={data.senderOrganization ?? ''}
                  onChange={(v) => updateField('senderOrganization', v)}
                />
                <FormField
                  label="تلفن"
                  value={data.senderPhone ?? ''}
                  onChange={(v) => updateField('senderPhone', v)}
                />
                <div className="md:col-span-2">
                  <FormField
                    label="آدرس"
                    value={data.senderAddress ?? ''}
                    onChange={(v) => updateField('senderAddress', v)}
                  />
                </div>
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">گیرنده</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="نام *"
                  value={data.recipientName}
                  onChange={handleRecipientChange}
                />
                <FormField
                  label="سمت"
                  value={data.recipientPosition ?? ''}
                  onChange={(v) => updateField('recipientPosition', v)}
                />
                <FormField
                  label="سازمان / شرکت"
                  value={data.recipientOrganization ?? ''}
                  onChange={(v) => updateField('recipientOrganization', v)}
                />
                <div className="md:col-span-2">
                  <FormField
                    label="آدرس"
                    value={data.recipientAddress ?? ''}
                    onChange={(v) => updateField('recipientAddress', v)}
                  />
                </div>
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">مشخصات نامه</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormField
                    label="موضوع *"
                    value={data.subject}
                    onChange={(v) => updateField('subject', v)}
                  />
                </div>
                <FormField
                  label="شماره نامه"
                  value={data.referenceNumber ?? ''}
                  onChange={(v) => updateField('referenceNumber', v)}
                />
                <FormField
                  label="تاریخ *"
                  type="date"
                  value={data.letterDate}
                  onChange={(v) => updateField('letterDate', v)}
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">متن نامه</h2>
              <FormField
                label="سلام و احترام *"
                value={data.salutation}
                onChange={(v) => updateField('salutation', v)}
                placeholder={getDefaultSalutation()}
              />
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  متن نامه *{' '}
                  {bodyExceedsLimit ? (
                    <span className="text-[var(--color-danger)]">
                      (حداکثر {featureGate.maxBodyLength} کاراکتر)
                    </span>
                  ) : null}
                </label>
                <textarea
                  value={data.body}
                  onChange={(e) => updateField('body', e.target.value)}
                  placeholder="متن نامه خود را وارد کنید..."
                  rows={8}
                  maxLength={featureGate.maxBodyLength}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {data.body.length} / {featureGate.maxBodyLength}
                </p>
                {!featureGate.canAddCustomParagraphs && featureGate.maxBodyLength <= 2000 && (
                  <p className="text-xs text-[var(--color-warning)] mt-1">
                    در نسخه رایگان محدودیت ۲۰۰۰ کاراکتر. برای متن طولانی‌تر ارتقا دهید.
                  </p>
                )}
              </div>
              <FormField
                label="متن پایانی *"
                value={data.closing}
                onChange={(v) => updateField('closing', v)}
                placeholder={getDefaultClosing(data.letterType)}
              />
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">قالب نامه</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {LETTER_TEMPLATES.map((tpl) => {
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
              <h2 className="text-lg font-bold text-[var(--text-primary)]">پیوست و رونوشت</h2>
              <FormField
                label="پیوست‌ها"
                value={data.enclosures ?? ''}
                onChange={(v) => updateField('enclosures', v)}
                placeholder="مثال: تصویر مدارک، گزارش"
              />
              <FormField
                label="رونوشت (CC)"
                value={data.ccList ?? ''}
                onChange={(v) => updateField('ccList', v)}
                placeholder="مثال: مدیر مالی، مدیر فنی"
              />
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">امضا</h2>
              {featureGate.canUseSignature ? (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    تصویر امضا
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) =>
                          updateField('signatureDataUrl', ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-sm text-[var(--text-muted)] file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[var(--color-primary)] file:text-[var(--text-inverted)] file:text-xs file:cursor-pointer"
                  />
                  {data.signatureDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.signatureDataUrl}
                      alt="پیش‌نمایش نامه"
                      className="mt-2 max-h-12 object-contain"
                    />
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-center">
                  <p className="text-xs text-[var(--text-muted)]">افزودن امضا در نسخه پریمیوم</p>
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    className="mt-1 text-xs text-[var(--color-primary)] underline"
                  >
                    ارتقا دهید
                  </button>
                </div>
              )}
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
            <h2 className="text-lg font-bold text-[var(--text-primary)]">پیش‌نمایش نامه</h2>
            <p className="text-sm text-[var(--text-muted)]">
              نامه را بررسی کنید. قبل از دانلود، سلب مسئولیت را تأیید کنید.
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
            <h2 className="text-lg font-bold text-[var(--text-primary)]">دانلود نامه</h2>
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
          product="formal-letter"
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
        title="پیش‌نمایش نامه اداری"
        srcDoc={html}
        className="w-full border-0"
        style={{ minHeight: '500px' }}
        sandbox="allow-same-origin"
      />
    </div>
  );
}
