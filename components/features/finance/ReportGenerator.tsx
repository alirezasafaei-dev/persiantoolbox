'use client';

import { useState, useCallback } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';
import { formatMoneyFa } from '@/shared/utils';

type ReportType = 'check_penalty' | 'mahr' | 'debt_adjustment';

const REPORT_TYPES: Record<ReportType, string> = {
  check_penalty: 'گزارش خسارت تأخیر تأدیه چک',
  mahr: 'گزارش مهریه به نرخ روز',
  debt_adjustment: 'گزارش تعدیل بدهی',
};

const REPORT_LABELS: Record<ReportType, string[]> = {
  check_penalty: [
    'مبلغ اصلی چک (تومان)',
    'سال سررسید',
    'شاخص CPI سررسید',
    'سال پرداخت',
    'شاخص CPI پرداخت',
  ],
  mahr: ['مبلغ مهریه (تومان)', 'سال ازدواج', 'شاخص CPI ازدواج', 'سال فعلی', 'شاخص CPI فعلی'],
  debt_adjustment: ['مبلغ اصلی بدهی (تومان)', 'تاریخ سررسید', 'نرخ تعدیل (%)', 'تاریخ پرداخت'],
};

const CPI_INDEXES: Record<number, number> = {
  1390: 69.7,
  1391: 81.8,
  1392: 100.0,
  1393: 121.8,
  1394: 139.4,
  1395: 157.0,
  1396: 181.5,
  1397: 235.2,
  1398: 293.9,
  1399: 331.2,
  1400: 408.8,
  1401: 510.6,
  1402: 675.8,
  1403: 892.4,
  1404: 1085.7,
  1405: 1280.0,
};

const YEAR_OPTIONS = Object.keys(CPI_INDEXES).map(Number);

function calculateCheckPenalty(principal: number, dueIndex: number, payIndex: number) {
  if (principal <= 0 || dueIndex <= 0 || payIndex <= 0) {
    return null;
  }
  const ratio = payIndex / dueIndex;
  const total = principal * ratio;
  return { principal, penalty: total - principal, total, ratio };
}

function calculateMahr(mahrAmount: number, marriageIndex: number, currentIndex: number) {
  if (mahrAmount <= 0 || marriageIndex <= 0 || currentIndex <= 0) {
    return null;
  }
  const ratio = currentIndex / marriageIndex;
  const mahrToday = mahrAmount * ratio;
  return { mahrAmount, mahrToday, ratio, increase: mahrToday - mahrAmount };
}

function calculateDebtAdjustment(principal: number, adjustmentRate: number) {
  if (principal <= 0 || adjustmentRate <= 0) {
    return null;
  }
  const adjustment = principal * (adjustmentRate / 100);
  return { principal, adjustment, total: principal + adjustment, rate: adjustmentRate };
}

async function generateReportPdf(
  reportType: ReportType,
  inputs: Record<string, string>,
  result: Record<string, number>,
) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const resp = await fetch('/fonts/Vazirmatn-Regular.ttf');
  const fontBytes = await resp.arrayBuffer();

  const font = await pdfDoc.embedFont(fontBytes);
  const page = pdfDoc.addPage([595, 842]);
  const { width } = page.getSize();

  let y = 800;

  const drawText = (
    text: string,
    x: number,
    yPos: number,
    options?: { size?: number; color?: ReturnType<typeof rgb> },
  ) => {
    const size = options?.size ?? 12;
    const color = options?.color ?? rgb(0, 0, 0);
    page.drawText(text, { x, y: yPos, size, font, color });
  };

  const drawRight = (
    text: string,
    yPos: number,
    options?: { size?: number; color?: ReturnType<typeof rgb> },
  ) => {
    const size = options?.size ?? 12;
    const textWidth = font.widthOfTextAtSize(text, size);
    drawText(text, width - 50 - textWidth, yPos, options);
  };

  const drawLine = (yPos: number) => {
    page.drawLine({
      start: { x: 50, y: yPos },
      end: { x: width - 50, y: yPos },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
  };

  drawRight(REPORT_TYPES[reportType], y, { size: 18, color: rgb(0.15, 0.35, 0.65) });
  y -= 10;
  drawLine(y);
  y -= 25;

  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
  drawRight(`تاریخ گزارش: ${dateStr}`, y, { size: 10, color: rgb(0.4, 0.4, 0.4) });
  y -= 30;

  drawRight('فرضیات ورودی', y, { size: 14, color: rgb(0.15, 0.35, 0.65) });
  y -= 5;
  drawLine(y);
  y -= 20;

  const labels = REPORT_LABELS[reportType];
  const inputValues = Object.values(inputs);
  labels.forEach((label, i) => {
    const val = inputValues[i] ?? '';
    drawRight(`${label}: ${val}`, y, { size: 11 });
    y -= 18;
  });
  y -= 10;

  drawRight('فرمول محاسبه', y, { size: 14, color: rgb(0.15, 0.35, 0.65) });
  y -= 5;
  drawLine(y);
  y -= 20;

  const formulas: Record<ReportType, string> = {
    check_penalty: '(شاخص سال پرداخت / شاخص سال سررسید) * مبلغ اصلی = مبلغ قابل پرداخت',
    mahr: '(شاخص سال فعلی / شاخص سال ازدواج) * مبلغ مهریه = مهریه به نرخ روز',
    debt_adjustment: 'مبلغ اصلی + (مبلغ اصلی * نرخ تعدیل / 100) = مبلغ نهایی',
  };
  drawRight(formulas[reportType], y, { size: 10 });
  y -= 30;

  drawRight('نتیجه محاسبه', y, { size: 14, color: rgb(0.15, 0.35, 0.65) });
  y -= 5;
  drawLine(y);
  y -= 20;

  const resultEntries = Object.entries(result);
  const resultLabels: Record<string, string> = {
    principal: 'مبلغ اصلی',
    penalty: 'خسارت / افزایش',
    total: 'مبلغ نهایی',
    ratio: 'نسبت',
    mahrToday: 'مهریه به نرخ روز',
    increase: 'افزایش بر اساس تورم',
    adjustment: 'مبلغ تعدیل',
    rate: 'نرخ تعدیل (%)',
  };

  resultEntries.forEach(([key, value]) => {
    const label = resultLabels[key] ?? key;
    const displayValue = key === 'ratio' ? value.toFixed(4) : `${formatMoneyFa(value)} تومان`;
    drawRight(`${label}: ${displayValue}`, y, { size: 12 });
    y -= 20;
  });
  y -= 15;

  drawLine(y);
  y -= 20;

  const disclaimers = [
    'این گزارش صرفاً جهت اطلاع‌رسانی است و جایگزین حکم دادگاه نیست.',
    'برای اعداد قطعی با مراجع ذیصلاح مشورت کنید.',
    'محاسبات بر اساس شاخص CPI بانک مرکزی انجام شده است.',
  ];
  disclaimers.forEach((d) => {
    drawRight(d, y, { size: 9, color: rgb(0.6, 0.6, 0.6) });
    y -= 15;
  });
  y -= 15;

  drawLine(y);
  y -= 20;

  drawRight('PersianToolbox.ir | جعبه ابزار فارسی', y, { size: 10, color: rgb(0.4, 0.4, 0.6) });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report-${reportType}-${dateStr.replace(/\//g, '-')}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportGenerator() {
  const [reportType, setReportType] = useState<ReportType>('check_penalty');
  const [loading, setLoading] = useState(false);

  const [principal, setPrincipal] = useState('');
  const [dueYear, setDueYear] = useState('1400');
  const [dueIndex, setDueIndex] = useState('');
  const [payYear, setPayYear] = useState('1405');
  const [payIndex, setPayIndex] = useState('');
  const [useManualIndex, setUseManualIndex] = useState(false);

  const [mahrAmount, setMahrAmount] = useState('');
  const [marriageYear, setMarriageYear] = useState('1400');
  const [marriageIndex, setMarriageIndex] = useState('');
  const [currentYear, setCurrentYear] = useState('1405');
  const [currentIndex, setCurrentIndex] = useState('');
  const [useMahrManual, setUseMahrManual] = useState(false);

  const [debtAmount, setDebtAmount] = useState('');
  const [debtDate, setDebtDate] = useState('');
  const [adjustmentRate, setAdjustmentRate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  const getDueIdx = useManualIndex
    ? parseFloat(dueIndex) || 0
    : (CPI_INDEXES[parseInt(dueYear)] ?? 0);
  const getPayIdx = useManualIndex
    ? parseFloat(payIndex) || 0
    : (CPI_INDEXES[parseInt(payYear)] ?? 0);
  const principalNum = parseFloat(principal.replace(/,/g, '')) || 0;

  const marriageIdx = useMahrManual
    ? parseFloat(marriageIndex) || 0
    : (CPI_INDEXES[parseInt(marriageYear)] ?? 0);
  const currentIdx = useMahrManual
    ? parseFloat(currentIndex) || 0
    : (CPI_INDEXES[parseInt(currentYear)] ?? 0);
  const mahrNum = parseFloat(mahrAmount.replace(/,/g, '')) || 0;

  const debtNum = parseFloat(debtAmount.replace(/,/g, '')) || 0;
  const rateNum = parseFloat(adjustmentRate) || 0;

  const checkResult = calculateCheckPenalty(principalNum, getDueIdx, getPayIdx);
  const mahrResult = calculateMahr(mahrNum, marriageIdx, currentIdx);
  const debtResult = calculateDebtAdjustment(debtNum, rateNum);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      if (reportType === 'check_penalty' && checkResult) {
        await generateReportPdf(
          'check_penalty',
          {
            principal,
            dueYear,
            dueIndex: String(getDueIdx),
            payYear,
            payIndex: String(getPayIdx),
          },
          checkResult,
        );
      } else if (reportType === 'mahr' && mahrResult) {
        await generateReportPdf(
          'mahr',
          {
            mahrAmount,
            marriageYear,
            marriageIndex: String(marriageIdx),
            currentYear,
            currentIndex: String(currentIdx),
          },
          mahrResult,
        );
      } else if (reportType === 'debt_adjustment' && debtResult) {
        await generateReportPdf(
          'debt_adjustment',
          {
            debtAmount,
            debtDate,
            adjustmentRate,
            paymentDate,
          },
          debtResult,
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    reportType,
    checkResult,
    mahrResult,
    debtResult,
    principal,
    dueYear,
    getDueIdx,
    payYear,
    getPayIdx,
    mahrAmount,
    marriageYear,
    marriageIdx,
    currentYear,
    currentIdx,
    debtAmount,
    debtDate,
    adjustmentRate,
    paymentDate,
  ]);

  const selectClasses =
    'w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none';

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            ساخت گزارش مالی و حقوقی
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            گزارش حرفه‌ای PDF از محاسبات مالی و حقوقی با فرمت قابل چاپ
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">نوع گزارش</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="report-type" className="text-sm text-[var(--text-muted)]">
                نوع گزارش را انتخاب کنید
              </label>
              <select
                id="report-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className={selectClasses}
                aria-label="نوع گزارش"
              >
                <option value="check_penalty">گزارش خسارت تأخیر تأدیه چک</option>
                <option value="mahr">گزارش مهریه به نرخ روز</option>
                <option value="debt_adjustment">گزارش تعدیل بدهی</option>
              </select>
            </div>

            {reportType === 'check_penalty' && (
              <>
                <Input
                  label="مبلغ اصلی چک (تومان)"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="مثال: ۵۰۰,۰۰۰,۰۰۰"
                  aria-label="مبلغ اصلی چک"
                />
                <div className="flex items-center gap-2">
                  <input
                    id="rp-manual"
                    type="checkbox"
                    checked={useManualIndex}
                    onChange={(e) => setUseManualIndex(e.target.checked)}
                    className="rounded"
                    aria-label="ورود دستی شاخص CPI"
                  />
                  <label htmlFor="rp-manual" className="text-sm text-[var(--text-muted)]">
                    ورود دستی شاخص CPI
                  </label>
                </div>
                {useManualIndex ? (
                  <>
                    <Input
                      label="شاخص CPI سررسید"
                      value={dueIndex}
                      onChange={(e) => setDueIndex(e.target.value)}
                      placeholder="مثال: ۴۰۸.۸"
                      aria-label="شاخص CPI سررسید"
                    />
                    <Input
                      label="شاخص CPI پرداخت"
                      value={payIndex}
                      onChange={(e) => setPayIndex(e.target.value)}
                      placeholder="مثال: ۱۲۸۰"
                      aria-label="شاخص CPI پرداخت"
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="rp-due-year" className="text-sm text-[var(--text-muted)]">
                        سال سررسید
                      </label>
                      <select
                        id="rp-due-year"
                        value={dueYear}
                        onChange={(e) => setDueYear(e.target.value)}
                        className={selectClasses}
                        aria-label="سال سررسید"
                      >
                        {YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y}>
                            {y} (شاخص: {CPI_INDEXES[y]})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="rp-pay-year" className="text-sm text-[var(--text-muted)]">
                        سال پرداخت
                      </label>
                      <select
                        id="rp-pay-year"
                        value={payYear}
                        onChange={(e) => setPayYear(e.target.value)}
                        className={selectClasses}
                        aria-label="سال پرداخت"
                      >
                        {YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y}>
                            {y} (شاخص: {CPI_INDEXES[y]})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </>
            )}

            {reportType === 'mahr' && (
              <>
                <Input
                  label="مبلغ مهریه (تومان)"
                  value={mahrAmount}
                  onChange={(e) => setMahrAmount(e.target.value)}
                  placeholder="مثال: ۵۰۰ سکه یا مبلغ تومان"
                  aria-label="مبلغ مهریه"
                />
                <div className="flex items-center gap-2">
                  <input
                    id="rp-mahr-manual"
                    type="checkbox"
                    checked={useMahrManual}
                    onChange={(e) => setUseMahrManual(e.target.checked)}
                    className="rounded"
                    aria-label="ورود دستی شاخص CPI"
                  />
                  <label htmlFor="rp-mahr-manual" className="text-sm text-[var(--text-muted)]">
                    ورود دستی شاخص CPI
                  </label>
                </div>
                {useMahrManual ? (
                  <>
                    <Input
                      label="شاخص CPI ازدواج"
                      value={marriageIndex}
                      onChange={(e) => setMarriageIndex(e.target.value)}
                      placeholder="مثال: ۴۰۸.۸"
                      aria-label="شاخص CPI ازدواج"
                    />
                    <Input
                      label="شاخص CPI فعلی"
                      value={currentIndex}
                      onChange={(e) => setCurrentIndex(e.target.value)}
                      placeholder="مثال: ۱۲۸۰"
                      aria-label="شاخص CPI فعلی"
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <label
                        htmlFor="rp-marriage-year"
                        className="text-sm text-[var(--text-muted)]"
                      >
                        سال ازدواج
                      </label>
                      <select
                        id="rp-marriage-year"
                        value={marriageYear}
                        onChange={(e) => setMarriageYear(e.target.value)}
                        className={selectClasses}
                        aria-label="سال ازدواج"
                      >
                        {YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y}>
                            {y} (شاخص: {CPI_INDEXES[y]})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="rp-current-year" className="text-sm text-[var(--text-muted)]">
                        سال فعلی
                      </label>
                      <select
                        id="rp-current-year"
                        value={currentYear}
                        onChange={(e) => setCurrentYear(e.target.value)}
                        className={selectClasses}
                        aria-label="سال فعلی"
                      >
                        {YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y}>
                            {y} (شاخص: {CPI_INDEXES[y]})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </>
            )}

            {reportType === 'debt_adjustment' && (
              <>
                <Input
                  label="مبلغ اصلی بدهی (تومان)"
                  value={debtAmount}
                  onChange={(e) => setDebtAmount(e.target.value)}
                  placeholder="مثال: ۱۰۰,۰۰۰,۰۰۰"
                  aria-label="مبلغ اصلی بدهی"
                />
                <Input
                  label="تاریخ سررسید"
                  value={debtDate}
                  onChange={(e) => setDebtDate(e.target.value)}
                  placeholder="مثال: ۱۴۰۴/۰۱/۱۵"
                  aria-label="تاریخ سررسید"
                />
                <Input
                  label="نرخ تعدیل (٪)"
                  value={adjustmentRate}
                  onChange={(e) => setAdjustmentRate(e.target.value)}
                  placeholder="مثال: ۲۰"
                  aria-label="نرخ تعدیل"
                />
                <Input
                  label="تاریخ پرداخت"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  placeholder="مثال: ۱۴۰۵/۰۳/۰۱"
                  aria-label="تاریخ پرداخت"
                />
              </>
            )}

            <div className="pt-2">
              <Button
                onClick={handleGenerate}
                isLoading={loading}
                disabled={
                  (reportType === 'check_penalty' && !checkResult) ||
                  (reportType === 'mahr' && !mahrResult) ||
                  (reportType === 'debt_adjustment' && !debtResult)
                }
                fullWidth
              >
                دانلود گزارش PDF
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">پیش‌نمایش گزارش</h2>
          {reportType === 'check_penalty' && checkResult ? (
            <div className="space-y-3" role="region" aria-label="پیش‌نمایش گزارش">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-sm text-[var(--text-muted)]">مبلغ اصلی چک</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {formatMoneyFa(checkResult.principal)} تومان
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-sm text-[var(--text-muted)]">خسارت تأخیر تأدیه</span>
                <span className="text-sm font-bold text-[var(--color-success)]">
                  {formatMoneyFa(checkResult.penalty)} تومان
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-sm text-[var(--text-muted)]">نسبت افزایش</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {checkResult.ratio.toFixed(4)}
                </span>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    مبلغ قابل پرداخت به نرخ روز
                  </span>
                  <span className="text-lg font-bold text-[var(--color-success)]">
                    {formatMoneyFa(checkResult.total)} تومان
                  </span>
                </div>
              </div>
            </div>
          ) : null}
          {reportType === 'mahr' && mahrResult ? (
            <div className="space-y-3" role="region" aria-label="پیش‌نمایش گزارش مهریه">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-sm text-[var(--text-muted)]">مبلغ اصلی مهریه</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {formatMoneyFa(mahrResult.mahrAmount)} تومان
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-sm text-[var(--text-muted)]">افزایش بر اساس تورم</span>
                <span className="text-sm font-bold text-[var(--color-success)]">
                  {formatMoneyFa(mahrResult.increase)} تومان
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-sm text-[var(--text-muted)]">نسبت افزایش</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {mahrResult.ratio.toFixed(4)}
                </span>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    مهریه به نرخ روز
                  </span>
                  <span className="text-lg font-bold text-[var(--color-success)]">
                    {formatMoneyFa(mahrResult.mahrToday)} تومان
                  </span>
                </div>
              </div>
            </div>
          ) : null}
          {reportType === 'debt_adjustment' && debtResult ? (
            <div className="space-y-3" role="region" aria-label="پیش‌نمایش گزارش تعدیل بدهی">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-sm text-[var(--text-muted)]">مبلغ اصلی بدهی</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {formatMoneyFa(debtResult.principal)} تومان
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                <span className="text-sm text-[var(--text-muted)]">مبلغ تعدیل</span>
                <span className="text-sm font-bold text-[var(--color-success)]">
                  {formatMoneyFa(debtResult.adjustment)} تومان
                </span>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)]">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    مبلغ نهایی
                  </span>
                  <span className="text-lg font-bold text-[var(--color-success)]">
                    {formatMoneyFa(debtResult.total)} تومان
                  </span>
                </div>
              </div>
            </div>
          ) : null}
          {!checkResult && reportType === 'check_penalty' && (
            <div className="text-center py-8 text-[var(--text-muted)]">
              اطلاعات را وارد کنید تا پیش‌نمایش نمایش داده شود.
            </div>
          )}
          {!mahrResult && reportType === 'mahr' && (
            <div className="text-center py-8 text-[var(--text-muted)]">
              اطلاعات را وارد کنید تا پیش‌نمایش نمایش داده شود.
            </div>
          )}
          {!debtResult && reportType === 'debt_adjustment' && (
            <div className="text-center py-8 text-[var(--text-muted)]">
              اطلاعات را وارد کنید تا پیش‌نمایش نمایش داده شود.
            </div>
          )}
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-muted)]">
            ⚠️ این گزارش صرفاً جهت اطلاع‌رسانی است و جایگزین حکم دادگاه نیست.
          </div>
        </Card>
      </div>
    </div>
  );
}
