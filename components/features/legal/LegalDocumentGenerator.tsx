'use client';

import { useState, useCallback } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';

type DocumentType = 'freelance' | 'rental' | 'receipt' | 'promissory' | 'employment';

const DOCUMENT_TYPES: Record<DocumentType, string> = {
  freelance: 'قرارداد خدمات فریلنسری',
  rental: 'قرارداد اجاره',
  receipt: 'رسید پرداخت',
  promissory: 'تعهدنامه',
  employment: 'قرارداد کاری',
};

const FIELDS: Record<DocumentType, Array<{ key: string; label: string; type?: string }>> = {
  freelance: [
    { key: 'party1', label: 'طرف اول (کارفرما)' },
    { key: 'party1Id', label: 'کد ملی طرف اول' },
    { key: 'party2', label: 'طرف دوم (پیمانکار)' },
    { key: 'party2Id', label: 'کد ملی طرف دوم' },
    { key: 'service', label: 'موضوع خدمات' },
    { key: 'amount', label: 'مبلغ (تومان)', type: 'number' },
    { key: 'startDate', label: 'تاریخ شروع' },
    { key: 'endDate', label: 'تاریخ پایان' },
  ],
  rental: [
    { key: 'landlord', label: 'مالک' },
    { key: 'landlordId', label: 'کد ملی مالک' },
    { key: 'tenant', label: 'مستأجر' },
    { key: 'tenantId', label: 'کد ملی مستأجر' },
    { key: 'address', label: 'آدرس ملک' },
    { key: 'rent', label: 'اجاره ماهانه (تومان)', type: 'number' },
    { key: 'deposit', label: 'ودیعه (تومان)', type: 'number' },
    { key: 'startDate', label: 'تاریخ شروع' },
    { key: 'duration', label: 'مدت اجاره (ماه)' },
  ],
  receipt: [
    { key: 'payer', label: 'پرداخت\u200Cکننده' },
    { key: 'payerId', label: 'کد ملی پرداخت\u200Cکننده' },
    { key: 'receiver', label: 'دریافت\u200Cکننده' },
    { key: 'amount', label: 'مبلغ (تومان)', type: 'number' },
    { key: 'description', label: 'بابت' },
    { key: 'date', label: 'تاریخ' },
    { key: 'paymentMethod', label: 'روش پرداخت' },
  ],
  promissory: [
    { key: 'issuer', label: 'صادرکننده' },
    { key: 'issuerId', label: 'کد ملی صادرکننده' },
    { key: 'recipient', label: 'ذی\u200Cنفع' },
    { key: 'recipientId', label: 'کد ملی ذی\u200Cنفع' },
    { key: 'amount', label: 'مبلغ (تومان)', type: 'number' },
    { key: 'dueDate', label: 'تاریخ سررسید' },
    { key: 'description', label: 'موضوع' },
  ],
  employment: [
    { key: 'employer', label: 'کارفرما' },
    { key: 'employerId', label: 'کد ملی کارفرما' },
    { key: 'employee', label: 'کارمند' },
    { key: 'employeeId', label: 'کد ملی کارمند' },
    { key: 'position', label: 'سمت شغلی' },
    { key: 'salary', label: 'حقوق ماهانه (تومان)', type: 'number' },
    { key: 'startDate', label: 'تاریخ شروع' },
    { key: 'duration', label: 'مدت قرارداد (ماه)' },
  ],
};

const DOCUMENT_CLAUSES: Record<DocumentType, string[]> = {
  freelance: [
    'موضوع قرارداد: ارائه خدمات تخصصی توسط طرف دوم به طرف اول.',
    'مبلغ قرارداد به صورت توافقی و بر اساس جدول زمانی مشخص پرداخت می\u200Cشود.',
    'هر یک از طرفین حق فسخ قرارداد با اعلام کتبی ۳۰ روز قبل را دارد.',
    'طرف دوم متعهد به رعایت محرمانگی اطلاعات طرف اول است.',
  ],
  rental: [
    'ملک مورد اجاره صرفاً برای سکونت اجاره داده می\u200Cشود.',
    'ودیعه در پایان مدت اجاره و پس از تخلیه و تسویه حساب مسترد می\u200Cشود.',
    'اجاره\u200Cبهاء ماهانه تا پایان هر ماه قابل پرداخت است.',
    'هرگونه تغییر در ساختار ملک بدون موافقت کتبی مالک مجاز نیست.',
  ],
  receipt: [
    'این رسید تأیید پرداخت مبلغ مذکور توسط پرداخت\u200Cکننده به دریافت\u200Cکننده است.',
    'پرداخت بابت موضوع مشخص\u200Cشده انجام شده است.',
    'هر دو طرف متعهد به رعایت شروط توافق شده هستند.',
  ],
  promissory: [
    'صادرکننده متعهد به پرداخت مبلغ مذکور در تاریخ سررسید به ذی\u200Cنفع است.',
    'در صورت عدم پرداخت در سررسید، ذی\u200Cنفع حق پیگیری قانونی دارد.',
    'این تعهدنامه غیرقابل انتقال به غیر است.',
  ],
  employment: [
    'کارمند متعهد به انجام وظایف محوله در سمت شغلی مشخص\u200Cشده است.',
    'حقوق و مزایا بر اساس قانون کار و تأمین اجتماعی پرداخت می\u200Cشود.',
    'قرارداد بر اساس مدت مشخص\u200Cشده منعقد شده و قابل تمدید است.',
    'هر یک از طرفین با اعلام کتبی ۳۰ روز قبل حق فسخ دارد.',
  ],
};

async function generatePdf(type: DocumentType, fields: Record<string, string>) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const resp = await fetch('/fonts/Vazirmatn-Regular.ttf');
  const fontBytes = await resp.arrayBuffer();
  const font = await pdfDoc.embedFont(fontBytes);

  let boldFont = font;
  try {
    const boldResp = await fetch('/fonts/Vazirmatn-Bold.ttf');
    boldFont = await pdfDoc.embedFont(await boldResp.arrayBuffer());
  } catch {
    boldFont = font;
  }

  const page = pdfDoc.addPage([595, 842]);
  const { width } = page.getSize();

  let y = 800;

  const drawText = (
    text: string,
    x: number,
    yPos: number,
    options?: { size?: number; color?: ReturnType<typeof rgb>; useBold?: boolean },
  ) => {
    const size = options?.size ?? 12;
    const color = options?.color ?? rgb(0, 0, 0);
    const usedFont = options?.useBold ? boldFont : font;
    page.drawText(text, { x, y: yPos, size, font: usedFont, color });
  };

  const drawRight = (
    text: string,
    yPos: number,
    options?: { size?: number; color?: ReturnType<typeof rgb>; useBold?: boolean },
  ) => {
    const size = options?.size ?? 12;
    const usedFont = options?.useBold ? boldFont : font;
    const textWidth = usedFont.widthOfTextAtSize(text, size);
    drawText(text, width - 50 - textWidth, yPos, options);
  };

  const drawCenter = (
    text: string,
    yPos: number,
    options?: { size?: number; color?: ReturnType<typeof rgb>; useBold?: boolean },
  ) => {
    const size = options?.size ?? 12;
    const usedFont = options?.useBold ? boldFont : font;
    const textWidth = usedFont.widthOfTextAtSize(text, size);
    drawText(text, (width - textWidth) / 2, yPos, options);
  };

  const drawLine = (yPos: number) => {
    page.drawLine({
      start: { x: 50, y: yPos },
      end: { x: width - 50, y: yPos },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
  };

  const title = DOCUMENT_TYPES[type];
  drawCenter(title, y, { size: 20, color: rgb(0.15, 0.35, 0.65), useBold: true });
  y -= 10;
  drawLine(y);
  y -= 25;

  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
  drawRight(`تاریخ تنظیم: ${dateStr}`, y, { size: 10, color: rgb(0.4, 0.4, 0.4) });
  y -= 30;

  drawRight('اطلاعات طرفین', y, { size: 14, color: rgb(0.15, 0.35, 0.65), useBold: true });
  y -= 5;
  drawLine(y);
  y -= 20;

  const fieldDefs = FIELDS[type];
  for (const field of fieldDefs) {
    const value = fields[field.key] ?? '-';
    drawRight(`${field.label}: ${value}`, y, { size: 11 });
    y -= 18;
  }
  y -= 10;

  drawRight('شروط و مقررات', y, { size: 14, color: rgb(0.15, 0.35, 0.65), useBold: true });
  y -= 5;
  drawLine(y);
  y -= 20;

  const clauses = DOCUMENT_CLAUSES[type];
  for (let i = 0; i < clauses.length; i++) {
    drawRight(`${i + 1}. ${clauses[i]}`, y, { size: 10 });
    y -= 16;
  }
  y -= 15;

  drawLine(y);
  y -= 25;

  drawRight('امضاء طرفین', y, { size: 12, color: rgb(0.15, 0.35, 0.65), useBold: true });
  y -= 25;

  const halfWidth = (width - 100) / 2;
  drawText('طرف اول: _______________', 50 + halfWidth - 80, y, { size: 10 });
  drawText('طرف دوم: _______________', 50, y, { size: 10 });
  y -= 20;
  drawText('تاریخ: _______________', 50 + halfWidth - 80, y, { size: 10 });
  drawText('تاریخ: _______________', 50, y, { size: 10 });
  y -= 30;

  drawLine(y);
  y -= 15;

  const disclaimers = [
    'این سند صرفاً جهت اطلاع\u200Cرسانی است و جایگزین مشاوره حقوقی حرفه\u200Cای نیست.',
    'برای استفاده رسمی حتماً با وکیل یا مشاور حقوقی مشورت کنید.',
  ];
  disclaimers.forEach((d) => {
    const dWidth = font.widthOfTextAtSize(d, 9);
    drawText(d, (width - dWidth) / 2, y, { size: 9, color: rgb(0.6, 0.6, 0.6) });
    y -= 13;
  });
  y -= 10;

  drawLine(y);
  y -= 15;

  const footer = 'PersianToolbox.ir | جعبه ابزار فارسی';
  const footerWidth = font.widthOfTextAtSize(footer, 10);
  drawText(footer, (width - footerWidth) / 2, y, { size: 10, color: rgb(0.4, 0.4, 0.6) });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${type}-document.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LegalDocumentGenerator() {
  const [docType, setDocType] = useState<DocumentType>('freelance');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);

  const currentFields = FIELDS[docType];

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      await generatePdf(docType, fields);
    } catch (e) {
      console.error('PDF generation failed:', e);
    } finally {
      setGenerating(false);
    }
  }, [docType, fields]);

  const selectClasses =
    'w-full mt-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none';

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            سندساز حقوقی آنلاین
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            ساخت اسناد حقوقی رایج (قرارداد، رسید، تعهدنامه) با فرمت PDF قابل چاپ
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">نوع سند</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="doc-type" className="text-sm text-[var(--text-muted)]">
                نوع سند را انتخاب کنید
              </label>
              <select
                id="doc-type"
                value={docType}
                onChange={(e) => {
                  setDocType(e.target.value as DocumentType);
                  setFields({});
                }}
                className={selectClasses}
                aria-label="نوع سند"
              >
                {(Object.entries(DOCUMENT_TYPES) as [DocumentType, string][]).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">پیش‌نمایش شروط</h2>
          <div className="space-y-2" role="region" aria-label="شروط و مقررات سند">
            {DOCUMENT_CLAUSES[docType].map((clause, i) => (
              <div
                key={i}
                className="flex items-start gap-2 py-2 border-b border-[var(--border-light)] last:border-b-0"
              >
                <span className="text-sm font-bold text-[var(--color-primary)]">{i + 1}.</span>
                <span className="text-sm text-[var(--text-muted)]">{clause}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">اطلاعات سند</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {currentFields.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              value={fields[field.key] ?? ''}
              onChange={(e) => setFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.type === 'number' ? 'مثال: ۵۰۰,۰۰۰,۰۰۰' : ''}
              inputMode={field.type === 'number' ? 'numeric' : undefined}
              aria-label={field.label}
            />
          ))}
        </div>
        <div className="pt-2">
          <Button onClick={handleGenerate} isLoading={generating} fullWidth>
            {generating ? 'در حال ساخت...' : 'ساخت و دانلود PDF'}
          </Button>
        </div>
      </Card>

      <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3 text-xs text-[var(--text-muted)]">
        ⚠️ این اسناد صرفاً جهت اطلاع\u200Cرسانی هستند و جایگزین مشاوره حقوقی حرفه\u200Cای نیستند.
      </div>
    </div>
  );
}
