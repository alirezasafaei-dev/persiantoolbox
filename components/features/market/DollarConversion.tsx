'use client';

import { useState } from 'react';
import Card from '@/shared/ui/Card';
import Input from '@/shared/ui/Input';
import { toEnglishDigits } from '@/shared/utils/numbers';

const GRAMS_PER_TROY_OUNCE = 31.1034768;
const formatter = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
const assets = [
  { id: 'gold', label: 'قیمت اونس تروا طلا (دلار)' },
  { id: 'bitcoin', label: 'قیمت بیت‌کوین (دلار)' },
  { id: 'ethereum', label: 'قیمت اتریوم (دلار)' },
  { id: 'euro', label: 'قیمت هر یورو (دلار)' },
] as const;

function positiveValue(input: string) {
  const normalized = toEnglishDigits(input.trim());
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(normalized)) {
    return 0;
  }
  const number = Number(normalized.replaceAll(',', ''));
  return Number.isFinite(number) && number > 0 ? number : 0;
}

export default function DollarConversion() {
  const [rate, setRate] = useState('');
  const [amounts, setAmounts] = useState({ gold: '', bitcoin: '', ethereum: '', euro: '' });
  const usdToIrr = positiveValue(rate);
  const pureGold = (positiveValue(amounts.gold) / GRAMS_PER_TROY_OUNCE) * usdToIrr;
  const results = [
    { label: 'ارزش محاسباتی هر گرم طلای خالص', value: pureGold },
    { label: 'ارزش محاسباتی هر گرم طلای ۱۸ عیار', value: pureGold * 0.75 },
    { label: 'ارزش محاسباتی یک بیت‌کوین', value: positiveValue(amounts.bitcoin) * usdToIrr },
    { label: 'ارزش محاسباتی یک اتریوم', value: positiveValue(amounts.ethereum) * usdToIrr },
    { label: 'ارزش محاسباتی یک یورو', value: positiveValue(amounts.euro) * usdToIrr },
  ].filter(({ value }) => value >= 0.5 && value <= Number.MAX_SAFE_INTEGER);

  return (
    <Card role="region" aria-label="تبدیل قیمت دلاری به ریال" className="space-y-4 p-6">
      <h2 className="text-xl font-bold text-(--text-primary)">تبدیل قیمت دلاری به ریال</h2>
      <p className="text-sm leading-7 text-(--text-muted)">
        نرخ دلار را به ریال و قیمت یک یا چند دارایی را به دلار وارد کنید. نتیجه بر اساس ورودی شماست
        و اعتبار زمانی آن به زمان هر دو ورودی بستگی دارد. ارزش محاسباتی طلا ممکن است با مظنهٔ بازار
        ایران فرق داشته باشد.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="نرخ هر دلار (ریال)"
          dir="ltr"
          inputMode="decimal"
          maxLength={32}
          value={rate}
          onChange={(event) => setRate(event.target.value)}
          {...(rate && !usdToIrr ? { error: 'نرخ مثبت و معتبر وارد کنید.' } : {})}
        />
        {assets.map(({ id, label }) => (
          <Input
            key={id}
            label={label}
            dir="ltr"
            inputMode="decimal"
            maxLength={32}
            value={amounts[id]}
            onChange={(event) => setAmounts({ ...amounts, [id]: event.target.value })}
            {...(amounts[id] && !positiveValue(amounts[id])
              ? { error: 'قیمت مثبت و معتبر وارد کنید.' }
              : {})}
          />
        ))}
      </div>
      <div role="status" aria-label="نتیجهٔ تبدیل به ریال">
        {results.length > 0 ? (
          <dl className="space-y-2 text-sm">
            {results.map(({ label, value }) => (
              <div key={label} className="flex flex-wrap justify-between gap-x-4">
                <dt>{label}</dt>
                <dd className="font-semibold">{formatter.format(value)} ریال</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-(--text-muted)">
            برای دیدن نتیجه، نرخ دلار و قیمت دارایی را وارد کنید.
          </p>
        )}
      </div>
    </Card>
  );
}
