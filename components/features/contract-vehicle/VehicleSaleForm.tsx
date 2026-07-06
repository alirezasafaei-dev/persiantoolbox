'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Button } from '@/components/ui';
import UpgradeModal from '@/components/features/pricing/UpgradeModal';
import { useExportToken } from '@/shared/hooks/useExportToken';
import { useExportFunnel } from '@/shared/analytics/useExportFunnel';
import type { VehicleData } from '@/lib/contract-vehicle/types';
import { DISCLAIMER, PRIVACY_TEXT, validateVehicle } from '@/lib/contract-vehicle/types';
import { FEATURE_GATES } from '@/lib/contract-vehicle/schemas';
import { renderVehicleContract } from '@/lib/contract-vehicle/render';
import {
  saveDraft,
  loadDrafts,
  canSaveDraft,
  createDraftId,
} from '@/lib/contract-vehicle/draft-storage';
import type { VehicleDraft } from '@/lib/contract-vehicle/draft-storage';
import {
  exportAsHtml,
  exportAsPrintableHtml,
  downloadPdf,
  downloadDocx,
  isDocxAvailable,
} from '@/lib/contract-vehicle/export';
import { PREMIUM_CLAUSES } from '@/lib/contract-vehicle/clauses';

const INITIAL_DATA: VehicleData = {
  sellerName: '',
  sellerNationalId: '',
  sellerPhone: '',
  sellerAddress: '',
  buyerName: '',
  buyerNationalId: '',
  buyerPhone: '',
  buyerAddress: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: '',
  vehicleColor: '',
  plateNumber: '',
  chassisNumber: '',
  engineNumber: '',
  vehicleType: '',
  mileage: '',
  salePrice: '',
  paymentMethod: '',
  paymentDate: '',
  deliveryDate: '',
  vehicleCondition: '',
  insuranceStatus: '',
  inspectionStatus: '',
  templateId: 'standard',
  additionalClauses: [],
  description: '',
  witness1: '',
  witness2: '',
  sellerSignature: '',
  buyerSignature: '',
};

type Props = { isPremium?: boolean };

export default function VehicleSaleForm({ isPremium = false }: Props) {
  const [data, setData] = useState<VehicleData>(INITIAL_DATA);
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
  } = useExportFunnel('vehicle-sale', 'vehicle-sale', isPremium);

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

  const draft: VehicleDraft = useMemo(
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

  const updateField = useCallback(
    <K extends keyof VehicleData>(field: K, value: VehicleData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );
  const handleSubmit = useCallback(() => {
    const errs = validateVehicle(data);
    setErrors(errs);
    if (errs.length === 0) {
      setActiveTab('preview');
    }
  }, [data]);

  const html = useMemo(
    () =>
      renderVehicleContract(data, {
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
    exportAsHtml(html, 'مبایعه‌نامه-خودرو.html');
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
      await downloadPdf(html, 'مبایعه‌نامه-خودرو.pdf');
      return;
    }
    const result = await requestToken('vehicle-sale');
    if (!result) {
      trackTokenIssued('pdf', 'error');
      setErrors(['خطا در دریافت توکن خروجی.']);
      return;
    }
    trackTokenIssued('pdf', 'success');
    try {
      await downloadPdf(html, 'مبایعه‌نامه-خودرو.pdf');
      if (result.reservationId) {
        await confirmExport(result.reservationId);
        trackExportConfirm('pdf');
      }
    } catch {
      if (result.reservationId) {
        await cancelReservation(result.reservationId);
        trackExportCancel('pdf');
      }
      setErrors(['خطا در دانلود فایل.']);
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
      await downloadDocx(data, 'مبایعه‌نامه-خودرو.docx');
      return;
    }
    const result = await requestToken('vehicle-sale');
    if (!result) {
      trackTokenIssued('docx', 'error');
      setErrors(['خطا در دریافت توکن خروجی.']);
      return;
    }
    trackTokenIssued('docx', 'success');
    try {
      await downloadDocx(data, 'مبایعه‌نامه-خودرو.docx');
      if (result.reservationId) {
        await confirmExport(result.reservationId);
        trackExportConfirm('docx');
      }
    } catch {
      if (result.reservationId) {
        await cancelReservation(result.reservationId);
        trackExportCancel('docx');
      }
      setErrors(['خطا در دانلود فایل.']);
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
    field: keyof VehicleData,
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
          مبایعه‌نامه خودرو
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          ساخت مبایعه‌نامه خرید و فروش خودرو حرفه‌ای — بدون نیاز به سرور
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--border-light)] pb-2">
        {(['form', 'preview', 'export'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              if (tab === 'preview' || tab === 'export') {
                const errs = validateVehicle(data);
                setErrors(errs);
                if (errs.length > 0) {
                  return;
                }
              }
              setActiveTab(tab);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
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
            نسخه رایگان — واترمارک روی خروجی قرار می‌گیرد.
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
              فروشنده
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {renderField('نام کامل', 'sellerName')}
              {renderField('کد ملی', 'sellerNationalId', '۱۲۳۴۵۶۷۸۹۰')}
              {renderField('تلفن', 'sellerPhone', '۰۹۱۲۱۲۳۴۵۶۷')}
            </div>
            {renderField('آدرس', 'sellerAddress')}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
              خریدار
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {renderField('نام کامل', 'buyerName')}
              {renderField('کد ملی', 'buyerNationalId', '۱۲۳۴۵۶۷۸۹۰')}
              {renderField('تلفن', 'buyerPhone', '۰۹۱۲۱۲۳۴۵۶۷')}
            </div>
            {renderField('آدرس', 'buyerAddress')}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
              مشخصات خودرو
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {renderField('سازنده', 'vehicleMake', 'پراید، تیبا، سمند...')}
              {renderField('مدل', 'vehicleModel', '۱۳۱، SE، EF7...')}
              {renderField('سال ساخت', 'vehicleYear', '۱۴۰۰')}
              {renderField('رنگ', 'vehicleColor')}
              {renderField('شماره پلاک', 'plateNumber', '۱۲ ب ۳۴۵')}
              {renderField('شماره شاسی', 'chassisNumber')}
              {renderField('شماره موتور', 'engineNumber')}
              {renderField('کارکرد (کیلومتر)', 'mileage', '۵۰۰۰۰')}
            </div>
            <div className="space-y-1">
              <label className={labelClass}>نوع خودرو</label>
              <select
                value={data.vehicleType}
                onChange={(e) => updateField('vehicleType', e.target.value)}
                className={inputClass}
              >
                <option value="">انتخاب کنید...</option>
                <option value="سواری">سواری</option>
                <option value="شاسی‌بلند">شاسی‌بلند</option>
                <option value="وانت">وانت</option>
                <option value="ون">ون</option>
                <option value="کامیون">کامیون</option>
                <option value="موتورسیکلت">موتورسیکلت</option>
              </select>
            </div>
            {renderField('وضعیت ظاهری', 'vehicleCondition', 'سالم، رنگ‌شدگی، خط و خش...')}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
              شرایط مالی
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {renderField('مبلغ فروش (تومان)', 'salePrice', '۵۰۰,۰۰۰,۰۰۰')}
              <div className="space-y-1">
                <label className={labelClass}>روش پرداخت</label>
                <select
                  value={data.paymentMethod}
                  onChange={(e) => updateField('paymentMethod', e.target.value)}
                  className={inputClass}
                >
                  <option value="">انتخاب کنید...</option>
                  <option value="نقدی">نقدی</option>
                  <option value="چک">چک</option>
                  <option value="کارت به کارت">کارت به کارت</option>
                  <option value="انتقال وجه">انتقال وجه</option>
                  <option value="ترکیبی">ترکیبی</option>
                </select>
              </div>
              {renderField('تاریخ پرداخت', 'paymentDate', '', 'date')}
              {renderField('تاریخ تحویل', 'deliveryDate', '', 'date')}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2">
              وضعیت
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {renderField('وضعیت بیمه', 'insuranceStatus', 'بیمه شخص ثالث تا...')}
              {renderField('وضعیت معاینه فنی', 'inspectionStatus', 'معاینه فنی تا...')}
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
                      setSelectedPremiumClauses((p) => [...p, clause.id]);
                    } else {
                      setSelectedPremiumClauses((p) => p.filter((id) => id !== clause.id));
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
            پیش‌نمایش مبایعه‌نامه
          </Button>
        </Card>
      )}

      {activeTab === 'preview' && (
        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">پیش‌نمایش مبایعه‌نامه</h2>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] overflow-hidden">
            <iframe
              srcDoc={html}
              className="w-full min-h-[600px] border-0"
              title="پیش‌نمایش مبایعه‌نامه"
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
          <h2 className="text-lg font-bold text-[var(--text-primary)]">دانلود مبایعه‌نامه</h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={disclaimerAccepted}
              onChange={(e) => setDisclaimerAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--border-light)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
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
          product="vehicle-sale"
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
