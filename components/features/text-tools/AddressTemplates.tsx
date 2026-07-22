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
    format: (output) =>
      [
        'Full Name:',
        `Address: ${output.addressLine1}`,
        output.addressLine2 ? `District: ${output.addressLine2}` : '',
        `City: ${output.city}`,
        `Province/State: ${output.stateProvince}`,
        `Country: ${output.country}`,
        output.postalCode ? `Postal Code: ${output.postalCode}` : '',
      ].filter(Boolean),
  },
  {
    id: 'lottery',
    label: 'لاتاری',
    description: 'قالب استاندارد برای ثبت‌نام لاتاری',
    format: (output) =>
      [
        `Address Line 1: ${output.addressLine1}`,
        `Address Line 2: ${output.addressLine2}`,
        `City: ${output.city}`,
        `State/Province: ${output.stateProvince}`,
        `Country: ${output.country}`,
        output.postalCode ? `Zip Code: ${output.postalCode}` : '',
      ].filter(Boolean),
  },
  {
    id: 'foreign-buy',
    label: 'خرید خارجی',
    description: 'قالب برای ثبت آدرس در سایت‌های خرید بین‌المللی',
    format: (output) =>
      [
        output.addressLine1,
        output.addressLine2,
        `${output.city}, ${output.stateProvince}`,
        output.postalCode ? `${output.country} ${output.postalCode}` : output.country,
      ].filter(Boolean),
  },
  {
    id: 'upu',
    label: 'فرم UPU',
    description: 'قالب اتحادیه پستی جهانی (UPU) برای نامه‌نگاری',
    format: (output) =>
      [
        output.addressLine1,
        output.addressLine2,
        `${output.city} ${output.stateProvince}`,
        `${output.country}${output.postalCode ? ` ${output.postalCode}` : ''}`,
      ].filter(Boolean),
  },
  {
    id: 'readable',
    label: 'خروجی خوانا',
    description: 'قالب خوانا برای استفاده روزمره',
    format: (output) => [output.singleLine].filter(Boolean),
  },
];

const defaultTemplate = templates[0];
if (!defaultTemplate) {
  throw new Error('Address templates require at least one template');
}

export default function AddressTemplates({ output, persianInput }: AddressTemplatesProps) {
  const { showToast } = useToast();
  const [selected, setSelected] = useState<TemplateId>('embassy');

  const activeTemplate = templates.find((template) => template.id === selected) ?? defaultTemplate;
  const formattedLines = useMemo(
    () => activeTemplate.format(output, persianInput),
    [activeTemplate, output, persianInput],
  );

  const copyLine = async (value: string, index: number) => {
    if (!value.trim()) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value.trim());
      showToast(`خط ${index + 1} کپی شد`, 'success');
    } catch {
      showToast('کپی انجام نشد', 'error');
    }
  };

  const copyAll = async () => {
    const text = formattedLines.filter(Boolean).join('\n');
    if (!text.trim()) {
      return;
    }
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
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            className={`btn btn-sm text-[11px] ${selected === template.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelected(template.id)}
          >
            {template.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-[var(--text-muted)]">{activeTemplate.description}</p>
      <div className="space-y-1.5">
        {formattedLines.map((line, index) =>
          line ? (
            <div
              key={`${index}-${line}`}
              className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-[var(--surface-2)] px-3 py-1.5"
            >
              <span className="text-sm text-[var(--text-primary)]" dir="ltr">
                {line}
              </span>
              <button
                type="button"
                className="shrink-0 btn btn-secondary text-[10px] px-2 py-0.5"
                onClick={() => copyLine(line, index)}
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
