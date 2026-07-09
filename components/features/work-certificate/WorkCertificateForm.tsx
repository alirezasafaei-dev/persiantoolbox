'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Button } from '@/components/ui';
import UpgradeModal from '@/components/features/pricing/UpgradeModal';
import { useExportToken } from '@/shared/hooks/useExportToken';
import { useExportFunnel } from '@/shared/analytics/useExportFunnel';
import type { WorkCertificateData, CertificateTemplateId } from '@/lib/work-certificate/types';
import { DISCLAIMER, PRIVACY_TEXT, validateCertificate } from '@/lib/work-certificate/types';
import { CERTIFICATE_TEMPLATES, FEATURE_GATES } from '@/lib/work-certificate/schemas';
import { renderCertificate } from '@/lib/work-certificate/render';
import {
  saveDraft,
  loadDrafts,
  canSaveDraft,
  createDraftId,
} from '@/lib/work-certificate/draft-storage';
import type { WorkCertificateDraft } from '@/lib/work-certificate/draft-storage';
import {
  exportAsHtml,
  exportAsPrintableHtml,
  downloadPdf,
  downloadDocx,
  isDocxAvailable,
} from '@/lib/work-certificate/export';

const INITIAL_DATA: WorkCertificateData = {
  employeeName: '',
  nationalId: '',
  position: '',
  department: '',
  employerName: '',
  employerRegistrationNo: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  salary: '',
  reasonForLeaving: '',
  description: '',
  issuerName: '',
  issuerPosition: '',
  certificateDate: new Date().toISOString().split('T')[0] ?? '',
  templateId: 'formal',
  logoDataUrl: '',
  signatureDataUrl: '',
};

type Props = {
  isPremium?: boolean;
};

export default function WorkCertificateForm({ isPremium = false }: Props) {
  const [data, setData] = useState<WorkCertificateData>(INITIAL_DATA);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [draftLimitReached, setDraftLimitReached] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'export'>('form');
  const { requestToken, confirmExport, cancelReservation } = useExportToken();
  const {
    trackExportClick,
    trackUpgradeView,
    trackTokenIssued,
    trackExportConfirm,
    trackExportCancel,
  } = useExportFunnel('work-certificate', 'work-certificate', isPremium);

  const draftId = useMemo(() => createDraftId(), []);

  const featureGate = isPremium ? FEATURE_GATES.premium : FEATURE_GATES.free;

  const availableTemplates = featureGate.availableTemplates;

  useEffect(() => {
    const drafts = loadDrafts();
    const latest = drafts[drafts.length - 1];
    if (latest) {
      setData(latest.data);
    }
  }, []);

  const draft: WorkCertificateDraft = useMemo(
    () => ({
      id: draftId,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [data, draftId],
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
    <K extends keyof WorkCertificateData>(field: K, value: WorkCertificateData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    const errs = validateCertificate(data);
    setErrors(errs);
    if (errs.length === 0) {
      setActiveTab('preview');
    }
  }, [data]);

  const html = useMemo(
    () =>
      renderCertificate(data, {
        watermark: featureGate.hasWatermark,
        templateId: data.templateId,
      }),
    [data, featureGate.hasWatermark],
  );

  const handleExportHtml = useCallback(() => {
    if (!html) {
      return;
    }
    trackExportClick('html');
    exportAsHtml(html, 'گواهی-سابقه-کار.html');
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
      await downloadPdf(html, 'گواهی-سابقه-کار.pdf');
      return;
    }
    const result = await requestToken('work-certificate');
    if (!result) {
      trackTokenIssued('pdf', 'error');
      setErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    trackTokenIssued('pdf', 'success');
    try {
      await downloadPdf(html, 'گواهی-سابقه-کار.pdf');
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
      await downloadDocx(data, 'گواهی-سابقه-کار.docx');
      return;
    }
    const result = await requestToken('work-certificate');
    if (!result) {
      trackTokenIssued('docx', 'error');
      setErrors(['خطا در دریافت توکن خروجی. لطفاً دوباره تلاش کنید.']);
      return;
    }
    trackTokenIssued('docx', 'success');
    try {
      await downloadDocx(data, 'گواهی-سابقه-کار.docx');
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

  const isTemplateLocked = (id: CertificateTemplateId) => !availableTemplates.includes(id);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
          گواهی سابقه کار حرفه‌ای
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          ساخت گواهی سابقه کار رسمی، مدرن و دو زبانه — بدون نیاز به سرور
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--border-light)] pb-2">
        {(['form', 'preview', 'export'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              if (tab === 'preview' || tab === 'export') {
                const errs = validateCertificate(data);
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
              <h2 className="text-lg font-bold text-[var(--text-primary)]">اطلاعات کارمند</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="نام و نام خانوادگی *"
                  value={data.employeeName}
                  onChange={(v) => updateField('employeeName', v)}
                  placeholder="مثال: علی محمدی"
                />
                <FormField
                  label="کد ملی"
                  value={data.nationalId ?? ''}
                  onChange={(v) => updateField('nationalId', v)}
                  placeholder="مثال: ۱۲۳۴۵۶۷۸۹۰"
                />
                <FormField
                  label="سمت شغلی *"
                  value={data.position}
                  onChange={(v) => updateField('position', v)}
                  placeholder="مثال: کارشناس فنی"
                />
                <FormField
                  label="واحد / دپارتمان"
                  value={data.department ?? ''}
                  onChange={(v) => updateField('department', v)}
                  placeholder="مثال: واحد فناوری اطلاعات"
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">اطلاعات کارفرما</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="نام شرکت / کارفرما *"
                  value={data.employerName}
                  onChange={(v) => updateField('employerName', v)}
                  placeholder="مثال: شرکت فناوری داده‌پرداز"
                />
                <FormField
                  label="شماره ثبت"
                  value={data.employerRegistrationNo ?? ''}
                  onChange={(v) => updateField('employerRegistrationNo', v)}
                  placeholder="مثال: ۱۲۳۴۵۶"
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">مدت اشتغال</h2>
              <div className="grid gap-4 md:grid-cols-2">
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
                  disabled={data.isCurrent}
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.isCurrent}
                  onChange={(e) => updateField('isCurrent', e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border-light)] text-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--text-primary)]">هنوز مشغول به کار است</span>
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="آخرین حقوق (ریال)"
                  value={data.salary ?? ''}
                  onChange={(v) => updateField('salary', v)}
                  placeholder="مثال: ۵۰۰۰۰۰۰۰۰"
                />
                <FormField
                  label="علت خاتمه همکاری"
                  value={data.reasonForLeaving ?? ''}
                  onChange={(v) => updateField('reasonForLeaving', v)}
                  placeholder="مثال: اتمام قرارداد"
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

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">صادرکننده</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="نام صادرکننده *"
                  value={data.issuerName}
                  onChange={(v) => updateField('issuerName', v)}
                  placeholder="مثال: سارا احمدی"
                />
                <FormField
                  label="سمت صادرکننده *"
                  value={data.issuerPosition}
                  onChange={(v) => updateField('issuerPosition', v)}
                  placeholder="مثال: مدیر منابع انسانی"
                />
                <FormField
                  label="تاریخ صدور *"
                  type="date"
                  value={data.certificateDate}
                  onChange={(v) => updateField('certificateDate', v)}
                />
              </div>
            </div>

            <hr className="border-[var(--border-light)]" />

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">قالب گواهی</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {CERTIFICATE_TEMPLATES.map((tpl) => {
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
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                لوگو و امضا (پریمیوم)
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    لوگوی شرکت
                  </label>
                  {featureGate.canUseLogo ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        aria-label="انتخاب تصویر لوگو"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) =>
                              updateField('logoDataUrl', ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-sm text-[var(--text-muted)] file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[var(--color-primary)] file:text-[var(--text-inverted)] file:text-xs file:cursor-pointer"
                      />
                      {data.logoDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={data.logoDataUrl}
                          alt="پیش‌نمایش گواهی"
                          className="mt-2 max-h-12 object-contain"
                        />
                      ) : null}
                    </div>
                  ) : (
                    <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-center">
                      <p className="text-xs text-[var(--text-muted)]">
                        افزودن لوگو در نسخه پریمیوم
                      </p>
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
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    امضای صادرکننده
                  </label>
                  {featureGate.canUseSignature ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        aria-label="انتخاب تصویر امضا"
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
                          alt="لوگوی شرکت"
                          className="mt-2 max-h-12 object-contain"
                        />
                      ) : null}
                    </div>
                  ) : (
                    <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-center">
                      <p className="text-xs text-[var(--text-muted)]">
                        افزودن امضا در نسخه پریمیوم
                      </p>
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
              </div>
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
            <h2 className="text-lg font-bold text-[var(--text-primary)]">پیش‌نمایش گواهی</h2>
            <p className="text-sm text-[var(--text-muted)]">
              گواهی را بررسی کنید. قبل از دانلود، سلب مسئولیت را تأیید کنید.
            </p>
            <PreviewFrame html={html} themeName={data.templateId} />
            <div className="rounded-[var(--radius-md)] border border-[rgb(var(--color-info-rgb)/0.3)] bg-[rgb(var(--color-info-rgb)/0.08)] p-4">
              <p className="text-xs text-[var(--color-info)] leading-6">{PRIVACY_TEXT}</p>
            </div>
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
            <h2 className="text-lg font-bold text-[var(--text-primary)]">دانلود گواهی</h2>

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
                  <div className="space-y-2">
                    <Button onClick={handleExportPdf} variant="primary">
                      چاپ / ذخیره PDF
                    </Button>
                    <p className="text-xs text-[var(--text-muted)]">
                      پنجره چاپ مرورگر باز می‌شود. گزینه «ذخیره به‌عنوان PDF» را انتخاب کنید.
                    </p>
                  </div>
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
          </div>
        )}
      </Card>

      {showUpgradeModal ? (
        <UpgradeModal
          product="work-certificate"
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

function PreviewFrame({ html, themeName }: { html: string; themeName: string }) {
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
        title={`پیش‌نمایش گواهی - ${themeName}`}
        srcDoc={html}
        className="w-full border-0"
        style={{ minHeight: '500px' }}
        sandbox="allow-same-origin"
      />
    </div>
  );
}
