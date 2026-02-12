'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { useToast } from '@/shared/ui/toast-context';
import {
  convertPersianAddressToEnglish,
  type PersianAddressInput,
} from '@/features/text-tools/address-fa-to-en';

type AddressFaToEnToolProps = {
  compact?: boolean;
};

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

export default function AddressFaToEnTool({ compact = false }: AddressFaToEnToolProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<PersianAddressInput>(initialForm);

  const canGenerate =
    nonEmpty(form.province) &&
    nonEmpty(form.city) &&
    nonEmpty(form.street) &&
    nonEmpty(form.plaqueNo);

  const output = useMemo(() => {
    if (!canGenerate) {
      return null;
    }
    return convertPersianAddressToEnglish(form);
  }, [canGenerate, form]);

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

  return (
    <Card className="p-5 md:p-6 space-y-5">
      <div>
        <div className="text-sm font-bold text-[var(--text-primary)]">
          تبدیل آدرس فارسی به انگلیسی
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          ورودی فارسی بدهید و خروجی مناسب ارسال پستی دریافت کنید.
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
            <div className="text-xs font-semibold text-[var(--text-muted)]">خروجی چندخطی</div>
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
        </div>
      )}

      {!compact && (
        <p className="text-xs text-[var(--text-muted)]">
          این تبدیل بر پایه استانداردنویسی و معادل‌سازی رایج انجام می‌شود؛ قبل از ارسال رسمی آدرس،
          خروجی را بررسی کنید.
        </p>
      )}
    </Card>
  );
}
