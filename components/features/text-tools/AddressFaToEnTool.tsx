'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { useToast } from '@/shared/ui/toast-context';
import {
  convertPersianAddressToEnglish,
  type AddressOutputMode,
  type PersianAddressInput,
} from '@/features/text-tools/address-fa-to-en';

type AddressFaToEnToolProps = {
  compact?: boolean;
};

const SUPPORT_EMAIL = 'alirezasafaeisystems@gmail.com';

const initialForm: PersianAddressInput = {
  country: 'ایران',
  province: '',
  city: '',
  district: '',
  street: '',
  alley: '',
  plaqueNo: '',
  unit: '',
  floor: '',
  postalCode: '',
  landmark: '',
};

function nonEmpty(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function getModeLabel(mode: AddressOutputMode): string {
  return mode === 'strict-postal' ? 'حالت پستی دقیق' : 'حالت خوانا';
}

export default function AddressFaToEnTool({ compact = false }: AddressFaToEnToolProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<PersianAddressInput>(initialForm);
  const [mode, setMode] = useState<AddressOutputMode>('strict-postal');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [reportNote, setReportNote] = useState('');

  const canGenerate =
    nonEmpty(form.province) &&
    nonEmpty(form.city) &&
    nonEmpty(form.street) &&
    nonEmpty(form.plaqueNo);

  const output = useMemo(() => {
    if (!canGenerate) {
      return null;
    }
    return convertPersianAddressToEnglish(form, { mode });
  }, [canGenerate, form, mode]);

  const multiLineOutput = useMemo(() => {
    if (!output) {
      return '';
    }
    return [
      output.addressLine1,
      output.addressLine2,
      `${output.city}, ${output.stateProvince}`,
      `${output.country}${output.postalCode ? `, ${output.postalCode}` : ''}`,
    ]
      .filter(Boolean)
      .join('\n');
  }, [output]);

  const mapQuery = encodeURIComponent(output?.singleLine ?? '');
  const neshanUrl = `https://neshan.org/maps/search/${mapQuery}`;
  const baladUrl = `https://balad.ir/?q=${mapQuery}`;

  const buildReportText = () => {
    if (!output) {
      return '';
    }
    const report = {
      tool: 'address-fa-to-en',
      createdAt: new Date().toISOString(),
      mode,
      input: form,
      generated: output,
      expectedOutput: expectedOutput.trim(),
      note: reportNote.trim(),
    };
    return JSON.stringify(report, null, 2);
  };

  const copyText = async (value: string, label: string) => {
    const text = value.trim();
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} کپی شد`, 'success');
    } catch {
      showToast('کپی انجام نشد', 'error');
    }
  };

  const submitReportByEmail = () => {
    if (!output) {
      return;
    }
    const body = buildReportText();
    if (!body.trim()) {
      showToast('گزارش خالی است', 'error');
      return;
    }

    const subject = encodeURIComponent('Address Tool Feedback - PersianToolbox');
    const encodedBody = encodeURIComponent(body);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${encodedBody}`;
  };

  return (
    <Card className="p-5 md:p-6 space-y-5">
      <div>
        <div className="text-sm font-bold text-[var(--text-primary)]">
          تبدیل آدرس فارسی به انگلیسی
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          خروجی دقیق‌تر برای ارسال پستی، ثبت سفارش و بررسی روی نقشه‌های داخلی.
        </div>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3">
        <div className="mb-2 text-xs font-semibold text-[var(--text-muted)]">حالت خروجی</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn btn-sm ${mode === 'strict-postal' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('strict-postal')}
          >
            پستی دقیق
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'readable' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('readable')}
          >
            خوانا
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="استان *"
          value={form.province}
          onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))}
          placeholder="تهران"
        />
        <Input
          label="شهر *"
          value={form.city}
          onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
          placeholder="تهران"
        />
        <Input
          label="محله"
          value={form.district}
          onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
          placeholder="ونک"
        />
        <Input
          label="خیابان *"
          value={form.street}
          onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
          placeholder="خیابان ولیعصر"
        />
        <Input
          label="کوچه"
          value={form.alley}
          onChange={(e) => setForm((prev) => ({ ...prev, alley: e.target.value }))}
          placeholder="کوچه ۲۳"
        />
        <Input
          label="پلاک *"
          value={form.plaqueNo}
          onChange={(e) => setForm((prev) => ({ ...prev, plaqueNo: e.target.value }))}
          placeholder="12"
          inputMode="numeric"
        />
        <Input
          label="واحد"
          value={form.unit}
          onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
          placeholder="5"
          inputMode="numeric"
        />
        <Input
          label="طبقه"
          value={form.floor}
          onChange={(e) => setForm((prev) => ({ ...prev, floor: e.target.value }))}
          placeholder="3"
          inputMode="numeric"
        />
        <Input
          label="کدپستی"
          value={form.postalCode}
          onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
          placeholder="1234567890"
          inputMode="numeric"
        />
        <Input
          label="نشانه تکمیلی"
          value={form.landmark}
          onChange={(e) => setForm((prev) => ({ ...prev, landmark: e.target.value }))}
          placeholder="جنب بانک..."
        />
      </div>

      {!canGenerate && (
        <p className="text-xs text-[var(--text-muted)]">
          برای تولید خروجی، فیلدهای «استان»، «شهر»، «خیابان» و «پلاک» را کامل کنید.
        </p>
      )}

      {output && (
        <div className="space-y-4">
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
            <div className="text-xs font-semibold text-[var(--text-muted)]">
              خروجی چندخطی ({getModeLabel(output.mode)})
            </div>
            <pre className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">
              {multiLineOutput}
            </pre>
          </div>
          <Input label="خروجی تک‌خطی" value={output.singleLine} readOnly />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => copyText(multiLineOutput, 'خروجی چندخطی')}
            >
              کپی چندخطی
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => copyText(output.singleLine, 'خروجی تک‌خطی')}
            >
              کپی تک‌خطی
            </button>
          </div>

          <section className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              انتخاب و بررسی روی نقشه
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              آدرس خروجی را مستقیما در نقشه‌های داخلی باز کنید، نقطه دقیق را انتخاب کنید و نتیجه
              نهایی را تایید کنید.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                href={neshanUrl}
              >
                باز کردن در نشان
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                href={baladUrl}
              >
                باز کردن در بلد
              </a>
            </div>
          </section>

          <section className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">گزارش خطای تبدیل</h3>
            <p className="text-xs text-[var(--text-muted)]">
              اگر املای خروجی دقیق نیست، خروجی پیشنهادی خود را ثبت کنید تا واژه‌نامه ابزار بهتر شود.
            </p>
            <Input
              label="خروجی پیشنهادی شما"
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(e.target.value)}
              placeholder="مثال: Valiasr St, Vanak Sq, Tehran, Iran"
            />
            <label className="block text-xs text-[var(--text-muted)]" htmlFor="address-report-note">
              توضیح تکمیلی
            </label>
            <textarea
              id="address-report-note"
              className="w-full min-h-24 rounded-[var(--radius-sm)] border border-[var(--border-light)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              placeholder="مثلا: نام محله باید Vanak باشد، نه Vanek"
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => copyText(buildReportText(), 'گزارش خطا')}
              >
                کپی گزارش خطا
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={submitReportByEmail}
              >
                ارسال گزارش به پشتیبانی
              </button>
            </div>
          </section>
        </div>
      )}

      {!compact && (
        <p className="text-xs text-[var(--text-muted)]">
          تبدیل بر پایه واژه‌نامه آدرس‌های ایرانی + قواعد transliteration انجام می‌شود؛ قبل از
          استفاده رسمی، خروجی را در نقشه یا مرجع پستی بررسی کنید.
        </p>
      )}
    </Card>
  );
}
