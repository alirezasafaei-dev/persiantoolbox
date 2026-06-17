'use client';

import { useMemo, useState } from 'react';
import { AsyncState, Button } from '@/components/ui';
import Input from '@/shared/ui/Input';
import PageHero from '@/shared/ui/PageHero';
import FormPanel from '@/shared/ui/FormPanel';
import { numberToWordsFa, parseLooseNumber } from '@/shared/utils/numbers';
import { cleanPersianText, slugifyPersian } from '@/shared/utils/localization';
import { useToast } from '@/shared/ui/toast-context';
import AddressFaToEnTool from '@/components/features/text-tools/AddressFaToEnTool';

export default function TextToolsPage() {
  const { showToast } = useToast();

  const [numberInput, setNumberInput] = useState('123456');
  const [numberError, setNumberError] = useState<string | null>(null);

  const [textInput, setTextInput] = useState('');
  const [slugInput, setSlugInput] = useState('سلام دنیا ۱۲۳');

  const wordStats = useMemo(() => {
    const trimmed = textInput.trim();
    const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).filter(Boolean).length;
    const characters = textInput.length;
    const charactersNoSpaces = textInput.replace(/\s/g, '').length;
    return { words, characters, charactersNoSpaces };
  }, [textInput]);

  const normalizedText = useMemo(() => cleanPersianText(textInput), [textInput]);
  const slugText = useMemo(() => slugifyPersian(slugInput), [slugInput]);

  const numberWords = useMemo(() => {
    const parsed = parseLooseNumber(numberInput);
    if (parsed === null) {
      return '';
    }
    return numberToWordsFa(parsed);
  }, [numberInput]);

  const handleNumberConvert = () => {
    const parsed = parseLooseNumber(numberInput);
    if (parsed === null) {
      setNumberError('لطفاً عدد معتبر وارد کنید.');
      return;
    }
    setNumberError(null);
  };

  const copyValue = async (value: string, label: string) => {
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
    <div className="space-y-8">
      <PageHero
        title="ابزارهای متنی"
        description="تبدیل عدد به حروف، شمارش کلمات و ابزارهای کاربردی پردازش متن فارسی و انگلیسی."
        gradient="info"
        badges={[{ text: 'ابزارهای متنی - کاملاً آفلاین', color: 'success' }]}
      />

      <AddressFaToEnTool compact />

      <FormPanel title="تبدیل عدد به حروف" description="خروجی فارسی برای اعداد صحیح و اعشاری">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end">
          <Input
            label="عدد"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            placeholder="123456"
          />
          <Button type="button" variant="secondary" onClick={handleNumberConvert}>
            تبدیل
          </Button>
        </div>
        {numberError && <AsyncState variant="error" description={numberError} />}
        <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          {numberWords || 'خروجی اینجا نمایش داده می‌شود.'}
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          <button
            type="button"
            className="font-semibold text-[var(--color-primary)]"
            onClick={() => copyValue(numberWords, 'عدد به حروف')}
          >
            کپی
          </button>
        </div>
      </FormPanel>

      <FormPanel title="شمارش کلمات" description="تعداد کلمات و کاراکترها">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          rows={6}
          className="input-field"
          placeholder="متن خود را وارد کنید..."
        />
        <div className="grid gap-3 sm:grid-cols-3 text-sm text-[var(--text-secondary)]">
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3">
            کلمات: {wordStats.words}
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3">
            کاراکترها: {wordStats.characters}
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3">
            بدون فاصله: {wordStats.charactersNoSpaces}
          </div>
        </div>
      </FormPanel>

      <FormPanel
        title="نرمال‌سازی متن فارسی"
        description="اصلاح ک/ی عربی، حذف کشیده و فاصله‌گذاری صحیح"
      >
        <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
          {normalizedText || 'متن نرمال‌شده اینجا نمایش داده می‌شود.'}
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          <button
            type="button"
            className="font-semibold text-[var(--color-primary)]"
            onClick={() => copyValue(normalizedText, 'متن نرمال‌شده')}
          >
            کپی
          </button>
          {normalizedText ? (
            <button
              type="button"
              className="ms-3 font-semibold text-[var(--color-primary)]"
              onClick={() =>
                copyValue(
                  `متن نرمال‌شده:\n${normalizedText}\n\nاسلاگ:\n${slugText}`,
                  'کپی همه متن‌ها',
                )
              }
            >
              کپی همه
            </button>
          ) : null}
        </div>
      </FormPanel>

      <FormPanel title="تبدیل به اسلاگ" description="مناسب برای URL و شناسه‌های قابل خواندن">
        <Input
          label="متن ورودی"
          value={slugInput}
          onChange={(e) => setSlugInput(e.target.value)}
          placeholder="سلام دنیا ۱۲۳"
        />
        <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          {slugText || 'اسلاگ اینجا نمایش داده می‌شود.'}
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          <button
            type="button"
            className="font-semibold text-[var(--color-primary)]"
            onClick={() => copyValue(slugText, 'اسلاگ')}
          >
            کپی
          </button>
        </div>
      </FormPanel>
    </div>
  );
}
