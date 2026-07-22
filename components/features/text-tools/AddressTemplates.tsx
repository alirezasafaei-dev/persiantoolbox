'use client';

import { useMemo, useState } from 'react';
import { useToast } from '@/shared/ui/toast-context';
import type { EnglishAddressOutput } from '@/features/text-tools/address-fa-to-en';

type AddressTemplatesProps = {
  output: EnglishAddressOutput;
  persianInput?: {
    province?: string;
    city?: string;
    street?: string;
    plaqueNo?: string;
    postalCode?: string;
    country?: string;
  };
};

type TemplateId = 'embassy' | 'lottery' | 'foreign-buy' | 'upu' | 'readable';

type Template = {
  id: TemplateId;
  label: string;
  description: string;
  format: (
    output: EnglishAddressOutput,
    persian?: AddressTemplatesProps['persianInput'],
  ) => string[];
};

const templates: Template[] = [
  {
    id: 'embassy',
    label: 'فرم سفارت و ویزا',
    description: 'قالب رسمی برای درخواست ویزا و امور سفارت',
    format: (o) =>
      [
        `Full Name:`,
        `Address: ${o.addressLine1}`,
        o.addressLine2 ? `District: ${o.addressLine2}` : '',
        `City: ${o.city}`,
        `Province/State: ${o.stateProvince}`,
        `Country: ${o.country}`,
        o.postalCode ? `Postal Code: ${o.postalCode}` : '',
      ].filter(Boolean),
  },
  {
    id: 'lottery',
    label: 'لاتاری',
    description: 'قالب استاندارد برای ثبت‌نام لاتاری',
    format: (o) =>
      [
        `Address Line 1: ${o.addressLine1}`,
        `Address Line 2: ${o.addressLine2}`,
        `City: ${o.city}`,
        `State/Province: ${o.stateProvince}`,
        `Country: ${o.country}`,
        o.postalCode ? `Zip Code: ${o.postalCode}` : '',
      ].filter(Boolean),
  },
  {
    id: 'foreign-buy',
    label: 'خرید خارجی',
    description: 'قالب برای ثبت آدرس در سایت‌های خرید بین‌المللی',
    format: (o) =>
      [
        o.addressLine1,
        o.addressLine2,
        `${o.city}, ${o.stateProvince}`,
        o.postalCode ? `${o.country} ${o.postalCode}` : o.country,
      ].filter(Boolean),
  },
  {
    id: 'upu',
    label: 'فرم UPU',
    description: 'قالب اتحادیه پستی جهانی (UPU) برای نامه‌نگاری',
    format: (o) =>
      [
        o.addressLine1,
        o.addressLine2,
        `${o.city} ${o.stateProvince}`,
        `${o.country}${o.postalCode ? ` ${o.postalCode}` : ''}`,
      ].filter(Boolean),
  },
  {
    id: 'readable',
    label: 'خروجی خوانا',
    description: 'قالب خوانا برای استفاده روزمره',
    format: (o) => [o.singleLine].filter(Boolean),
  },
];

export default function AddressTemplates({ output, persianInput }: AddressTemplatesProps) {
  const { showToast } = useToast();
  const [selected, setSelected] = useState<TemplateId>('embassy');

  const activeTemplate = templates.find((t) => t.id === selected) ?? templates[0]!;

  const formattedLines = useMemo(
    () => activeTemplate.format(output, persianInput),
    [activeTemplate, output, persianInput],
  );

  const copyLine = async (value: string, index: number) => {
    if (!value.trim()) return;
    try {
      await navigator.clipboard.writeText(value.trim());
      showToast(`خط ${index + 1} کپی شد`, 'success');
    } catch {
      showToast('کپی انجام نشد', 'error');
    }
  };

  const copyAll = async () => {
    const text = formattedLines.filter(Boolean).join('\n');
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast('کل خروجی کپی شد', 'success');
    } catch {
      showToast('کپی انجام نشد', 'error');
    }
  };

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 space-y-3">
      <h3 className="text-sm font-bold text-[var(--text-primary)]">قالب خروجی</h3>

      <div className="flex flex-wrap gap-1.5">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`btn btn-sm text-[11px] ${selected === t.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelected(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-[var(--text-muted)]">{activeTemplate.description}</p>

      <div className="space-y-1.5">
        {formattedLines.map((line, i) =>
          line ? (
            <div
              key={i}
              className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-[var(--surface-2)] px-3 py-1.5"
            >
              <span className="text-sm text-[var(--text-primary)]" dir="ltr">
                {line}
              </span>
              <button
                type="button"
                className="shrink-0 btn btn-secondary text-[10px] px-2 py-0.5"
                onClick={() => copyLine(line, i)}
              >
                کپی
              </button>
            </div>
          ) : null,
        )}
      </div>

      <button type="button" className="btn btn-primary btn-sm" onClick={copyAll}>
        کپی کل خروجی
      </button>
    </div>
  );
}
