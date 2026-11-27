'use client';

import { useState } from 'react';
import Card from '@/shared/ui/Card';
import Input from '@/shared/ui/Input';
import { toEnglishDigits } from '@/shared/utils/numbers';

const MAX_RIALS = BigInt(Number.MAX_SAFE_INTEGER);
// 31.1034768 grams per troy ounce, represented as an exact ratio.
const TROY_OUNCE = { numerator: 311034768n, denominator: 10000000n };
const formatter = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
const assets = [
  { id: 'gold', label: 'قیمت اونس تروا طلا (دلار)' },
  { id: 'bitcoin', label: 'قیمت بیت‌کوین (دلار)' },
  { id: 'ethereum', label: 'قیمت اتریوم (دلار)' },
  { id: 'euro', label: 'قیمت هر یورو (دلار)' },
] as const;

function positiveValue(input: string) {
  const normalized = toEnglishDigits(input.trim()).replace(/[ \u00a0\u202f]/g, ',');
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(normalized)) {
    return null;
  }
  const [integer = '', fraction = ''] = normalized.replaceAll(',', '').split('.');
  const numerator = BigInt(integer + fraction);
  const denominator = 10n ** BigInt(fraction.length);
  return numerator > 0n && numerator <= MAX_RIALS * denominator ? { numerator, denominator } : null;
}

type Ratio = NonNullable<ReturnType<typeof positiveValue>>;

function formatRials(rate: Ratio, price: Ratio, multiplier = 1n, divisor = 1n) {
  const numerator = rate.numerator * price.numerator * multiplier;
  const denominator = rate.denominator * price.denominator * divisor;
  const rounded = (2n * numerator + denominator) / (2n * denominator);
  if (rounded === 0n) {
    return 'کمتر از یک ریال';
  }
  if (rounded > MAX_RIALS) {
    return 'بیشتر از محدودهٔ محاسبه';
  }
  return `${formatter.format(rounded)} ریال`;
}

export default function DollarConversion() {
  const [rate, setRate] = useState('');
  const [amounts, setAmounts] = useState({ gold: '', bitcoin: '', ethereum: '', euro: '' });
  const usdToIrr = positiveValue(rate);
  const gold = positiveValue(amounts.gold);
  const results = [
    {
      label: 'ارزش محاسباتی هر گرم طلای خالص',
      price: gold,
      multiplier: TROY_OUNCE.denominator,
      divisor: TROY_OUNCE.numerator,
    },
    {
      label: 'ارزش محاسباتی هر گرم طلای ۱۸ عیار',
      price: gold,
      multiplier: TROY_OUNCE.denominator * 3n,
      divisor: TROY_OUNCE.numerator * 4n,
    },
    { label: 'ارزش محاسباتی یک بیت‌کوین', price: positiveValue(amounts.bitcoin) },
    { label: 'ارزش محاسباتی یک اتریوم', price: positiveValue(amounts.ethereum) },
    { label: 'ارزش محاسباتی یک یورو', price: positiveValue(amounts.euro) },
  ].flatMap(({ label, price, multiplier, divisor }) =>
    usdToIrr && price ? [{ label, value: formatRials(usdToIrr, price, multiplier, divisor) }] : [],
  );

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
                <dd className="font-semibold">{value}</dd>
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
