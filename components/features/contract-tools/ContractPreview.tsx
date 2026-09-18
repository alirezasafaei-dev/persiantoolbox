'use client';

import { Card } from '@/components/ui';

type Props = {
  renderedText: string;
  isPremium: boolean;
};

export default function ContractPreview({ renderedText, isPremium }: Props) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-(--text-primary)">پیش‌نمایش قرارداد</h3>
        {!isPremium && (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-bold text-warning">
            پیش‌نویس
          </span>
        )}
      </div>
      <div className="rounded-md border border-(--border-light) bg-(--surface-1) p-4 max-h-[600px] overflow-y-auto">
        <pre
          dir="rtl"
          className="whitespace-pre-wrap text-sm text-(--text-primary) font-(--font-body) leading-7"
          aria-label="پیش‌نمایش قرارداد"
        >
          {renderedText}
        </pre>
      </div>
      {!isPremium && (
        <p className="mt-3 text-xs text-warning text-center">
          در نسخه رایگان، واترمارک «پیش‌نویس / غیرنهایی» روی خروجی قرار می‌گیرد.
        </p>
      )}
    </Card>
  );
}
